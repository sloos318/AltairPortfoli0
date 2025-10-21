(() => {
  const dot = document.createElement("div");
  const ring = document.createElement("div");
  dot.className = "cursor-dot";
  ring.className = "cursor-ring";
  document.body.append(dot, ring);

  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;
  let hovering = false;
  let activeTilt = null;
  let activeRect = null; // cache van bounding box

  document.addEventListener("mousemove", e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.classList.add("cursor-visible");
    ring.classList.add("cursor-visible");
  });

  const hoverTargets = "a, button, input, textarea, label";
  document.addEventListener("mouseover", e => {
    if (e.target.closest(hoverTargets)) hovering = true;
  });
  document.addEventListener("mouseout", e => {
    if (e.target.closest(hoverTargets)) hovering = false;
  });

  const tiltables = [...document.querySelectorAll("li a, .parallaxCard, header form, #contactButton")];
  tiltables.forEach(el => {
    el.addEventListener("mouseenter", () => {
      activeTilt = el;
      activeRect = el.getBoundingClientRect();
    });
    el.addEventListener("mouseleave", () => {
      if (activeTilt === el) {
        el.style.transform = "rotateX(0deg) rotateY(0deg)";
        activeTilt = null;
        activeRect = null;
      }
    });
  });

  const animate = () => {
    // dot beweegt direct → geen trailing
    dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;

    // ring volgt vertraagd
    ringX += (mouseX - ringX) * 0.99;
    ringY += (mouseY - ringY) * 0.99;
    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;

    // hover class toggle
    document.body.classList.toggle("cursor-hover", hovering);

    // tilt berekening alleen als er een actief element is
    if (activeTilt && activeRect) {
      const x = mouseX - activeRect.left;
      const y = mouseY - activeRect.top;
      const centerX = activeRect.width / 2;
      const centerY = activeRect.height / 2;
      const rotateX = ((y - centerY) / centerY) * 10;
      const rotateY = ((x - centerX) / centerX) * 10;
      activeTilt.style.transform = `rotateX(${-rotateX}deg) rotateY(${rotateY}deg)`;
    }

    requestAnimationFrame(animate);
  };
  animate();


// Find ALL bubble containers inside header buttons
const bubbleContainers = document.querySelectorAll("header form .bubbles, #contactButton .bubbles");

bubbleContainers.forEach(container => {
  const bubbles = [...container.querySelectorAll(".bubble")];

  // Give each bubble random properties
  bubbles.forEach(b => {
    const rect = container.getBoundingClientRect();
    b.x = Math.random() * rect.width;
    b.y = rect.height;
    b.size = 6 + Math.random() * 14;
    b.speedY = 0.5 + Math.random() * 1.5;
    b.driftX = (Math.random() - 0.5) * 0.6;
    b.opacity = 0;
    b.style.position = "absolute";
  });

  // Animate function per container
  function animateBubbles() {
    const rect = container.getBoundingClientRect();
    bubbles.forEach(b => {
      b.y -= b.speedY;
      b.x += b.driftX;

      if (b.opacity < 1) b.opacity += 0.02;

      if (b.y + b.size < -50) {
        b.y = rect.height;
        b.x = Math.random() * rect.width;
        b.opacity = 0;
      }

      b.style.width = b.size + "px";
      b.style.height = b.size + "px";
      b.style.transform = `translate(${b.x}px, ${b.y}px)`;
      b.style.opacity = b.opacity;
      b.style.backgroundColor = "var(--color-detail-main)";
      b.style.borderRadius = "50%";
    });

    requestAnimationFrame(animateBubbles);
  }

  animateBubbles();
});
})();