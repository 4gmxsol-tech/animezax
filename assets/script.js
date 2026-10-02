(() => {
  const searchInput = document.querySelector("#anime-search");
  const cards = [...document.querySelectorAll(".anime-card")];
  const filterButtons = [...document.querySelectorAll("[data-filter]")];
  const emptyState = document.querySelector("#empty-state");
  const menuToggle = document.querySelector("#menu-toggle");
  const nav = document.querySelector("#primary-nav");
  let activeFilter = "all";

  function updateCards() {
    const query = (searchInput?.value || "").trim().toLowerCase();
    let visible = 0;
    cards.forEach((card) => {
      const haystack = [
        card.dataset.title || "",
        card.dataset.genres || "",
        card.dataset.haystack || "",
        card.textContent || ""
      ].join(" ").toLowerCase();
      const genres = (card.dataset.genres || "").split(/\s+/);
      const matchesQuery = !query || haystack.includes(query);
      const matchesFilter = activeFilter === "all" || genres.includes(activeFilter);
      const show = matchesQuery && matchesFilter;
      card.classList.toggle("is-hidden", !show);
      if (show) visible += 1;
    });
    if (emptyState) emptyState.hidden = visible !== 0;
  }

  searchInput?.addEventListener("input", updateCards);
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter || "all";
      filterButtons.forEach((item) => {
        const selected = item === button;
        item.classList.toggle("is-selected", selected);
        item.setAttribute("aria-pressed", String(selected));
      });
      updateCards();
    });
  });

  menuToggle?.addEventListener("click", () => {
    const isOpen = nav?.classList.toggle("is-open") || false;
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  });

  nav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      menuToggle?.setAttribute("aria-expanded", "false");
      menuToggle?.setAttribute("aria-label", "Open navigation");
    });
  });

  const year = document.querySelector("#year");
  if (year) year.textContent = String(new Date().getFullYear());
})();