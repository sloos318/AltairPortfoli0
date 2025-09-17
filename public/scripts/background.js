document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('dotCanvas');
  const ctx = canvas.getContext('2d');

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  const spacing = 40; // slightly wider spacing for breathing effect
  const dots = [];

  // create dot positions
  for (let y = 0; y < height; y += spacing) {
    for (let x = 0; x < width; x += spacing) {
      dots.push({ 
        x: x + (Math.random() - 0.5) * 6, // jitter for organic look
        y: y + (Math.random() - 0.5) * 6, 
        size: 3 + Math.random() * 1.5, 
        pulse: Math.random() * Math.PI * 2 // random offset for pulsing
      });
    }
  }

  // mouse
  let mouse = { x: -1000, y: -1000 };

  document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  // helper to blend colors
  function lerpColor(color1, color2, t) {
    return {
      r: Math.round(color1.r + (color2.r - color1.r) * t),
      g: Math.round(color1.g + (color2.g - color1.g) * t),
      b: Math.round(color1.b + (color2.b - color1.b) * t)
    };
  }

  // animation
  function animate() {
    ctx.clearRect(0, 0, width, height);

    dots.forEach(dot => {
      const dx = mouse.x - dot.x;
      const dy = mouse.y - dot.y;
      const dist = Math.sqrt(dx*dx + dy*dy);

      let scale = 0.6;
      const maxDist = 220; // effect radius

      if (dist < maxDist) {
        scale = 2 - dist / maxDist;
      }

      // pulsing effect
      const pulse = Math.sin(Date.now() / 1000 + dot.pulse) * 0.25 + 1;

      const size = dot.size * scale * pulse;

      // color interpolation
      let fill;
      if (dist < maxDist) {
        const t = dist / maxDist; 
        const c = lerpColor({r:161,g:17,b:12}, {r:206,g:203,b:203}, t);
        fill = `rgba(${c.r},${c.g},${c.b},${1 - t * 0.7})`;
      } else {
        fill = 'rgba(206,203,203,0.15)';
      }

      ctx.beginPath();
      ctx.arc(dot.x, dot.y, size, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
    });

    // add subtle radial gradient spotlight
    const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 300);
    gradient.addColorStop(0, "rgba(161,17,12,0.15)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    requestAnimationFrame(animate);
  }

  animate();

  // resize handling
  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });
});
