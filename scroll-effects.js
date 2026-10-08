// A scroll-driven progress trail and section underline, using native scrolling.
// No wheel/touch interception, scroll locking, or external libraries.
function initScrollEffects() {
    const journey = document.getElementById("scrollJourney");
    const track = journey.querySelector(".scroll-track");
    const chapter = document.getElementById("scrollChapter");
    const sections = Array.from(document.querySelectorAll("main > section"));
    const navLinks = Array.from(document.querySelectorAll("#navMenu a"));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const labels = {
        home: "Home",
        about: "About",
        skills: "Skills",
        projects: "Projects",
        process: "Process",
        contact: "Contact"
    };
    let framePending = false;
    let currentSection = -1;

    const markers = sections.map(() => {
        const marker = document.createElement("span");
        marker.className = "scroll-marker";
        track.appendChild(marker);
        return marker;
    });

    function clamp(value) {
        return Math.max(0, Math.min(1, value));
    }

    function updateScroll() {
        framePending = false;
        const viewportHeight = window.innerHeight;
        const scrollTop = Math.max(0, window.scrollY);
        const scrollRange = Math.max(0, document.documentElement.scrollHeight - viewportHeight);
        const pageProgress = scrollRange ? clamp(scrollTop / scrollRange) : 1;
        // A chapter becomes active when it reaches the upper third of the view.
        const readingLine = viewportHeight * 0.32;
        let activeIndex = 0;

        // Read geometry together before writing styles to avoid layout thrashing.
        const bounds = sections.map((section) => section.getBoundingClientRect());
        bounds.forEach((rect, index) => {
            if (rect.top <= readingLine) activeIndex = index;
        });
        if (pageProgress >= 0.999) activeIndex = sections.length - 1;

        journey.style.setProperty("--page-progress", pageProgress);
        bounds.forEach((rect, index) => {
            const entryProgress = reducedMotion.matches ? 1 : clamp(
                (viewportHeight * 0.9 - rect.top) / (viewportHeight * 0.65)
            );
            sections[index].style.setProperty("--section-progress", entryProgress);
            // Place each marker where its chapter starts along the actual page.
            const chapterStart = Math.max(0, rect.top + scrollTop - readingLine);
            markers[index].style.top = `${(scrollRange ? clamp(chapterStart / scrollRange) : 0) * 100}%`;
        });

        if (activeIndex !== currentSection) {
            currentSection = activeIndex;
            const active = sections[activeIndex];
            const number = String(activeIndex + 1).padStart(2, "0");
            const label = labels[active.id] || active.querySelector("h2")?.textContent || "Section";
            chapter.textContent = `${number} / ${String(sections.length).padStart(2, "0")} · ${label}`;
            markers.forEach((marker, index) => {
                marker.classList.toggle("is-reached", index <= activeIndex);
                marker.classList.toggle("is-current", index === activeIndex);
            });
            navLinks.forEach((link) => {
                if (link.hash === `#${active.id}`) link.setAttribute("aria-current", "location");
                else link.removeAttribute("aria-current");
            });
        }
    }

    function requestUpdate() {
        if (framePending) return;
        framePending = true;
        window.requestAnimationFrame(updateScroll);
    }

    journey.hidden = false;
    document.documentElement.classList.add("scroll-effects-enabled");
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    window.addEventListener("pageshow", requestUpdate);
    reducedMotion.addEventListener("change", requestUpdate);
    // Recalculate if edited content, font loading, or viewport changes affect height.
    if ("ResizeObserver" in window) {
        const observer = new ResizeObserver(requestUpdate);
        observer.observe(document.body);
    }
    if (document.fonts) document.fonts.ready.then(requestUpdate);
    updateScroll();
}

initScrollEffects();
