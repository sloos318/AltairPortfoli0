import { App } from '@tinyhttp/app';
import { Liquid } from 'liquidjs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import serveStatic from 'serve-static';
import bodyParser from 'body-parser';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();
import pkg from 'pg';
const { Pool } = pkg;
const pool = new Pool();
const __dirname = dirname(fileURLToPath(import.meta.url));

// Init tinyhttp + Liquid
const app = new App();
const engine = new Liquid({ root: join(__dirname, 'views'), extname: '.liquid' });

// Middleware
app.use(serveStatic(join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Render helper
app.use((req, res, next) => {
  res.render = async (view, data = {}) => {
    const html = await engine.renderFile(view, data);
    res.send(html);
  };
  next();
});

// JSON-import functie
async function importProjectsFromJSON() {
  try {
    const projects = JSON.parse(fs.readFileSync(join(__dirname, 'projecten.json'), 'utf8'));
    for (const p of projects) {
      const tags = Array.isArray(p.tags) ? p.tags : [];
      const images = p.images && typeof p.images === 'object' ? p.images : {};

      const { rowCount } = await pool.query('SELECT id FROM projects WHERE name = $1', [p.name]);
      if (rowCount > 0) {
        // Project exists → update
        await pool.query(
          'UPDATE projects SET description = $1, tags = $2, images = $3 WHERE name = $4',
          [p.description, JSON.stringify(tags), JSON.stringify(images), p.name]
        );
        console.log(`🔄 Updated project: ${p.name}`);
      } else {
        // Project doesn't exist → insert
        await pool.query(
          'INSERT INTO projects (name, description, tags, images) VALUES ($1, $2, $3, $4)',
          [p.name, p.description, JSON.stringify(tags), JSON.stringify(images)]
        );
        console.log(`✅ Inserted project: ${p.name}`);
      }
    }
    console.log('🎉 JSON-projecten gesynchroniseerd met database!');
  } catch (err) {
    console.error(err);
  }
}

// Routes
app.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, description, tags, images FROM projects ORDER BY created_at DESC'
    );

    const projects = rows.map(p => {
      // Parse tags safely
      let tags = [];
      try { tags = JSON.parse(p.tags); } catch { tags = p.tags || []; }
      tags = tags.length > 0 ? [tags[0]] : [];

      // Parse images safely
      let images = {};
      try { images = JSON.parse(p.images); } catch { images = p.images || {}; }

      // Choose first card for preview (for cards projects)
      let firstCard = null;
      for (const suit of ['spade', 'clover', 'diamond', 'heart']) {
        if (images[suit]) { firstCard = images[suit]; break; }
      }

      // Build previewImages array
      const previewImages = [];
      if (firstCard) {
        if (firstCard.main) previewImages.push({ src: firstCard.main, class: '' });
        if (firstCard.cutout) previewImages.push({ src: firstCard.cutout, class: 'cutout' });
      }
      if (images.main) previewImages.push({ src: images.main, class: '' });
      if (images.cutout) previewImages.push({ src: images.cutout, class: 'cutout' });
      if (images.border) previewImages.push({ src: images.border, class: '' });
      if (images.logo) previewImages.push({ src: images.logo, class: '' });

      return { ...p, tags, images, previewImages };
    });

    res.render('index', { projects });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching projects');
  }
});

app.get('/about', (req, res) => res.render('about'));
app.get('/add_project', (req, res) => res.render('add_project'));

app.post('/projects', async (req, res) => {
  const { name, description, tags, images } = req.body;
  try {
    await pool.query(
      'INSERT INTO projects (name, description, tags, images) VALUES ($1, $2, $3, $4)',
      [
        name,
        description,
        tags ? tags.split(',').map(f => f.trim()) : [],
        images ? JSON.parse(images) : {}
      ]
    );
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error saving project');
  }
});

// Start server
app.listen(3000, async () => {
  console.log('🚀 Server running at http://localhost:3000');
  await importProjectsFromJSON();
});
