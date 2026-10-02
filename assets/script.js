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

  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }


  // Load real anime cover art from Jikan's public, unofficial MyAnimeList API.
  // Text labels remain usable if the API is unavailable.
  const animeCards = [...document.querySelectorAll("[data-mal-id]")];
  const imageCache = new Map();
  async function getAnimeImage(id) {
    if (imageCache.has(id)) return imageCache.get(id);
    const promise = fetch(`https://api.jikan.moe/v4/anime/${encodeURIComponent(id)}`)
      .then((response) => {
        if (!response.ok) throw new Error("Anime image request failed");
        return response.json();
      })
      .then((payload) => payload?.data?.images?.webp?.large_image_url || payload?.data?.images?.jpg?.large_image_url || null)
      .catch(() => null);
    imageCache.set(id, promise);
    return promise;
  }
  function applyAnimeImage(card, imageUrl) {
    if (!imageUrl) return;
    const poster = card.matches(".poster") ? card : card.querySelector(".poster");
    if (poster) {
      const image = document.createElement("img");
      image.className = "poster-art";
      image.src = imageUrl;
      image.alt = "";
      image.loading = "lazy";
      image.decoding = "async";
      image.referrerPolicy = "no-referrer";
      image.addEventListener("error", () => image.remove(), { once: true });
      poster.prepend(image);
      poster.classList.add("has-real-anime-art");
    } else if (card.classList.contains("release-card")) {
      const image = document.createElement("img");
      image.className = "release-art";
      image.src = imageUrl;
      image.alt = "";
      image.loading = "lazy";
      image.decoding = "async";
      image.referrerPolicy = "no-referrer";
      image.addEventListener("error", () => image.remove(), { once: true });
      card.prepend(image);
    }
  }
  (async () => {
    for (const card of animeCards) {
      const imageUrl = await getAnimeImage(card.dataset.malId);
      applyAnimeImage(card, imageUrl);
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
  })();

  const year = document.querySelector("#year");
  if (year) year.textContent = String(new Date().getFullYear());
})();