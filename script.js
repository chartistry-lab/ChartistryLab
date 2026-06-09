const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  siteNav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      siteNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}

const navLinks = Array.from(document.querySelectorAll(".site-nav a[href^='#']"));
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const setActiveLink = () => {
  const current = sections
    .filter((section) => section.getBoundingClientRect().top < window.innerHeight * 0.42)
    .pop();

  navLinks.forEach((link) => {
    link.classList.toggle("is-active", current && link.getAttribute("href") === `#${current.id}`);
  });
};

window.addEventListener("scroll", setActiveLink, { passive: true });
setActiveLink();

const voteBoard = document.querySelector("[data-vote-board]");
const voteStatus = document.querySelector("[data-vote-status]");

if (voteBoard && voteStatus) {
  voteBoard.addEventListener("click", (event) => {
    const card = event.target.closest("[data-category]");
    if (!card) return;

    voteBoard.querySelectorAll(".vote-card").forEach((item) => {
      item.classList.toggle("is-selected", item === card);
    });
    voteStatus.textContent = `Previewing category: ${card.dataset.category}`;
  });
}

const copyButton = document.querySelector("[data-copy-checklist]");
const copyStatus = document.querySelector("[data-copy-status]");

if (copyButton && copyStatus) {
  copyButton.addEventListener("click", async () => {
    const checklist = [
      "Final visualization image",
      "Caption explaining what the visualization reveals",
      "Dataset choice and source notes",
      "Optional process notes, code, sketches, or failed attempts"
    ].map((item) => `- ${item}`).join("\n");

    try {
      await navigator.clipboard.writeText(checklist);
      copyStatus.textContent = "Checklist copied.";
    } catch {
      copyStatus.textContent = "Copy unavailable in this browser; use the checklist above.";
    }
  });
}
