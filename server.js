import { App } from '@tinyhttp/app'
import { Liquid } from 'liquidjs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import serveStatic from 'serve-static'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Init tinyhttp + liquid
const app = new App()
const engine = new Liquid({
  root: join(__dirname, 'views'),
  extname: '.liquid'
})

// Middleware to serve static files
app.use(serveStatic(join(__dirname, 'public')))

// Simple render helper
app.use((req, res, next) => {
  res.render = async (view, data = {}) => {
    const html = await engine.renderFile(view, data)
    res.send(html)
  }
  next()
})

// Routes
app.get('/', (req, res) => {
  res.render('index', { title: 'tinyhttp + Liquid', message: 'This is rendered with LiquidJS!' })
})

app.get('/about', (req, res) => {
  res.render('about')
})

// Start server
app.listen(3000, () => console.log('Server running at http://localhost:3000 🚀'))
