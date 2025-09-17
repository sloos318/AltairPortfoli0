document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll("li a");

  cards.forEach(card => {
    let reqId = null;

    card.addEventListener("mouseenter", () => {
      card.addEventListener("mousemove", onMove);
    });

    card.addEventListener("mouseleave", () => {
      card.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(reqId);
      card.style.transform = `rotateX(0deg) rotateY(0deg)`; // reset
    });

    function onMove(e) {
      if (reqId) cancelAnimationFrame(reqId);
      reqId = requestAnimationFrame(() => tiltCard(e));
    }

    function tiltCard(e) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * 10;
      const rotateY = ((x - centerX) / centerX) * 10;

      card.style.transform = `rotateX(${-rotateX}deg) rotateY(${rotateY}deg)`;
    }
  });
});
