// create cursor elements
const dot = document.createElement("div");
const ring = document.createElement("div");
dot.classList.add("cursor-dot");
ring.classList.add("cursor-ring");
document.body.append(dot, ring);

let mouse = { x: 0, y: 0 };
let ringPos = { x: 0, y: 0 };

// track hover state
let hovering = false;

// update hover state dynamically
document.querySelectorAll("a, button").forEach(el => {
  el.addEventListener("mouseenter", () => hovering = true);
  el.addEventListener("mouseleave", () => hovering = false);
});

// mousemove
document.addEventListener("mousemove", e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;

  dot.style.top = mouse.y + "px";
  dot.style.left = mouse.x + "px";
});

// animate loop for lagging ring + hover effects
function animate() {
  // smooth follow
  ringPos.x += (mouse.x - ringPos.x) * 0.15;
  ringPos.y += (mouse.y - ringPos.y) * 0.15;
  ring.style.top = ringPos.y + "px";
  ring.style.left = ringPos.x + "px";; // fixed below

  // apply hover styles
  if (hovering) {
    ring.style.transform = "translate(-50%, -50%) scale(1.6)";
    ring.style.borderColor = "#a1110c";
    dot.style.transform = "translate(-50%, -50%) scale(1.3)";
    dot.style.background = "#a1110c";
  } else {
    ring.style.transform = "translate(-50%, -50%) scale(1)";
    ring.style.borderColor = "rgba(255,255,255,0.5)";
    dot.style.transform = "translate(-50%, -50%) scale(1)";
    dot.style.background = "#fff";
  }

  requestAnimationFrame(animate);
}
animate();
