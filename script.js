// 1. Mobile navigation
function initNavigation() {
    const menuToggle = document.getElementById("menuToggle");
    const navMenu = document.getElementById("navMenu");
    const mobileLayout = window.matchMedia("(max-width: 680px)");

    function setMenuOpen(isOpen) {
        navMenu.classList.toggle("open", isOpen);
        menuToggle.setAttribute("aria-expanded", String(isOpen));
    }

    menuToggle.addEventListener("click", () => {
        setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
    });

    navMenu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => setMenuOpen(false));
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && navMenu.classList.contains("open")) {
            setMenuOpen(false);
            menuToggle.focus();
        }
    });

    document.addEventListener("click", (event) => {
        if (!event.target.closest(".navbar")) setMenuOpen(false);
    });

    mobileLayout.addEventListener("change", () => setMenuOpen(false));
    document.documentElement.classList.add("js-enabled");
}

// 2. Entrance effects — adjust timing and movement here.
// Content is visible by default, even if JavaScript or animation is unavailable.
function initEntranceEffects() {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!("IntersectionObserver" in window) || !("animate" in Element.prototype)) return;

    const targets = document.querySelectorAll(
        ".hero-content, .hero-card, .section-heading, .about-grid, " +
        ".skill-card, .project-card, .process-item, .contact-box"
    );
    const activeAnimations = new Set();

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            observer.unobserve(entry.target);
            if (reducedMotion.matches) return;

            const animation = entry.target.animate(
                [
                    { opacity: 0, transform: "translateY(18px)" },
                    { opacity: 1, transform: "translateY(0)" }
                ],
                { duration: 650, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
            );
            activeAnimations.add(animation);
            animation.onfinish = () => activeAnimations.delete(animation);
            animation.oncancel = () => activeAnimations.delete(animation);
        });
    }, { threshold: 0.08 });

    targets.forEach((target) => observer.observe(target));
    reducedMotion.addEventListener("change", () => {
        if (reducedMotion.matches) {
            activeAnimations.forEach((animation) => animation.cancel());
            activeAnimations.clear();
        }
    });
}

// 3. Initialize the page. The script is deferred until the HTML is ready.
document.getElementById("year").textContent = new Date().getFullYear();
initNavigation();
initEntranceEffects();
