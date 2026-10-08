// Background effects are independent of the portfolio content and navigation.
// Edit these settings to change the particle density, speed, and glow.
function initBackgroundEffects() {
    const settings = {
        desktopParticles: 48,
        mobileParticles: 22,
        speed: 12,             // Movement in pixels per second.
        connectionDistance: 145,
        glowRadius: 300,
        color: "109, 124, 255" // RGB matching the original purple accent.
    };

    const canvas = document.getElementById("backgroundEffects");
    const toggle = document.getElementById("effectsToggle");
    const context = canvas.getContext("2d");
    if (!context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = { x: 0, y: 0, visible: false };
    let width = 0;
    let height = 0;
    let particles = [];
    let frameId = null;
    let previousTime = 0;
    let paused = false;

    function resizeCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(width * pixelRatio);
        canvas.height = Math.round(height * pixelRatio);
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

        const count = width <= 680 ? settings.mobileParticles : settings.desktopParticles;
        particles = Array.from({ length: count }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            velocityX: (Math.random() - 0.5) * settings.speed,
            velocityY: -(Math.random() * 0.7 + 0.3) * settings.speed,
            radius: Math.random() * 1.3 + 0.8
        }));
        drawFrame(0);
    }

    function drawGlow(x, y, radius, opacity) {
        const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `rgba(${settings.color}, ${opacity})`);
        gradient.addColorStop(1, `rgba(${settings.color}, 0)`);
        context.fillStyle = gradient;
        context.fillRect(0, 0, width, height);
    }

    function drawFrame(delta) {
        context.clearRect(0, 0, width, height);
        drawGlow(width * 0.76, height * 0.32, Math.min(width, 650), 0.075);
        if (pointer.visible && !paused && !reducedMotion.matches) {
            drawGlow(pointer.x, pointer.y, settings.glowRadius, 0.14);
        }

        particles.forEach((particle) => {
            particle.x = (particle.x + particle.velocityX * delta + width) % width;
            particle.y = (particle.y + particle.velocityY * delta + height) % height;
            context.beginPath();
            context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            context.fillStyle = `rgba(${settings.color}, 0.55)`;
            context.fill();
        });

        for (let first = 0; first < particles.length; first++) {
            for (let second = first + 1; second < particles.length; second++) {
                const a = particles[first];
                const b = particles[second];
                const distance = Math.hypot(a.x - b.x, a.y - b.y);
                if (distance >= settings.connectionDistance) continue;

                const opacity = (1 - distance / settings.connectionDistance) * 0.2;
                context.strokeStyle = `rgba(${settings.color}, ${opacity})`;
                context.lineWidth = 0.7;
                context.beginPath();
                context.moveTo(a.x, a.y);
                context.lineTo(b.x, b.y);
                context.stroke();
            }
        }
    }

    function animate(time) {
        const delta = previousTime ? Math.min((time - previousTime) / 1000, 0.05) : 0;
        previousTime = time;
        drawFrame(delta);
        frameId = window.requestAnimationFrame(animate);
    }

    // Stop rendering when paused, when the tab is hidden, or for reduced motion.
    function updatePlayback() {
        window.cancelAnimationFrame(frameId);
        frameId = null;
        previousTime = 0;
        const playing = !paused && !reducedMotion.matches;
        toggle.hidden = reducedMotion.matches;
        toggle.textContent = playing ? "Pause effects" : "Resume effects";
        toggle.setAttribute("aria-pressed", String(playing));
        drawFrame(0);
        if (playing && !document.hidden) frameId = window.requestAnimationFrame(animate);
    }

    window.addEventListener("pointermove", (event) => {
        pointer.x = event.clientX;
        pointer.y = event.clientY;
        pointer.visible = event.pointerType === "mouse";
    }, { passive: true });
    document.documentElement.addEventListener("pointerleave", () => {
        pointer.visible = false;
    });
    window.addEventListener("blur", () => { pointer.visible = false; });
    window.addEventListener("resize", resizeCanvas);
    document.addEventListener("visibilitychange", updatePlayback);
    reducedMotion.addEventListener("change", updatePlayback);
    toggle.addEventListener("click", () => {
        paused = !paused;
        updatePlayback();
    });

    resizeCanvas();
    updatePlayback();
}

initBackgroundEffects();
