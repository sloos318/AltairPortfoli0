document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("dotCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  // ---------- Config ----------
  const STAR_COUNT = 100;
  const STAR_MIN_SIZE = 0.1;
  const STAR_MAX_SIZE = 0.35;
  const DRIFT_SPEED = 0.6;
  const SCROLL_SPEED = 0.5;
  const STAR_BASE_COLOR = [255, 82, 112]; // pink

  // HiDPI canvas
  let DPR = Math.max(1, window.devicePixelRatio || 1);
  let cssWidth = window.innerWidth;
  let cssHeight = window.innerHeight;

  function updateCanvasSize() {
    DPR = Math.max(1, window.devicePixelRatio || 1);
    cssWidth = window.innerWidth;
    cssHeight = window.innerHeight;
    canvas.style.width = cssWidth + "px";
    canvas.style.height = cssHeight + "px";
    canvas.width = Math.round(cssWidth * DPR);
    canvas.height = Math.round(cssHeight * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  updateCanvasSize();

  // Gebruik ResizeObserver ipv window.resize
  new ResizeObserver(updateCanvasSize).observe(document.body);

  // Pre-render verschillende star textures
  function makeStarTexture(size) {
    const tex = document.createElement("canvas");
    const tctx = tex.getContext("2d");
    const s = size * 60;
    tex.width = tex.height = s;

    const [r, g, b] = STAR_BASE_COLOR;
    const gradient = tctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    gradient.addColorStop(0, "white");
    gradient.addColorStop(0.05, `rgba(${r},${g},${b},1)`);
    gradient.addColorStop(0.15, `rgba(${r},${g},${b},0.8)`);
    gradient.addColorStop(0.35, `rgba(${r},${g},${b},0.5)`);
    gradient.addColorStop(0.6, `rgba(${r},${g},${b},0.2)`);
    gradient.addColorStop(1, "rgba(0,0,0,0)");

    tctx.fillStyle = gradient;
    tctx.beginPath();
    tctx.arc(s / 2, s / 2, s / 2, 0, Math.PI * 2);
    tctx.fill();

    return tex;
  }

  // Cache textures (bijv. 5 groottes)
  const textureCache = Array.from({ length: 5 }, (_, i) => {
    const size = STAR_MIN_SIZE + (i / 4) * (STAR_MAX_SIZE - STAR_MIN_SIZE);
    return { size, tex: makeStarTexture(size) };
  });

  // Stars
  let stars = [];
  function createStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      const t = textureCache[Math.floor(Math.random() * textureCache.length)];
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * DRIFT_SPEED + 0.2;

      stars.push({
        x: Math.random() * cssWidth,
        y: Math.random() * cssHeight,
        size: t.size,
        tex: t.tex,
        driftX: Math.cos(angle) * speed,
        driftY: Math.sin(angle) * speed,
      });
    }
  }
  createStars();

  // Scroll effect
  let lastScrollY = window.scrollY;
  let scrollDelta = 0;
  window.addEventListener("scroll", () => {
    const delta = window.scrollY - lastScrollY;
    scrollDelta += delta * SCROLL_SPEED;
    lastScrollY = window.scrollY;
  });

  // Animation loop
  function animateStars() {
    ctx.clearRect(0, 0, cssWidth, cssHeight);

    for (let star of stars) {
      star.x += star.driftX;
      star.y += star.driftY - scrollDelta * 0.15;

      if (star.x < 0) star.x = cssWidth;
      if (star.x > cssWidth) star.x = 0;
      if (star.y < 0) star.y = cssHeight;
      if (star.y > cssHeight) star.y = 0;

      const drawSize = star.size * 25;
      ctx.drawImage(star.tex, star.x - drawSize / 2, star.y - drawSize / 2, drawSize, drawSize);
    }

    scrollDelta = 0;
    requestAnimationFrame(animateStars);
  }
  requestAnimationFrame(animateStars);
});
