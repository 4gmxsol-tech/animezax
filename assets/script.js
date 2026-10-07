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


  // Global discovery search: anime, characters, movies, and guides.
  const globalSearch = document.querySelector("#anime-search");
  if (globalSearch) {
    const discoveryIndex = [
      ["Anime","One Piece","anime/one-piece.html","Adventure, action, pirate adventure"],
      ["Anime","Naruto","anime/naruto.html","Ninja, action, adventure"],
      ["Anime","Attack on Titan","anime/attack-on-titan.html","Dark fantasy, action, mystery"],
      ["Anime","Dragon Ball","anime/dragon-ball.html","Action, martial arts, adventure"],
      ["Anime","Demon Slayer","anime/demon-slayer.html","Action, fantasy, demons"],
      ["Anime","Jujutsu Kaisen","anime/jujutsu-kaisen.html","Action, supernatural, fantasy"],
      ["Anime","Chainsaw Man","anime/chainsaw-man.html","Action, supernatural, dark fantasy"],
      ["Anime","Solo Leveling","anime/solo-leveling.html","Action, fantasy, power progression"],
      ["Anime","Black Clover","anime/black-clover.html","Action, fantasy, magic"],
      ["Anime","Frieren: Beyond Journey’s End","anime/frieren-beyond-journeys-end.html","Fantasy, adventure, drama"],
      ["Anime","The Apothecary Diaries","anime/the-apothecary-diaries.html","Mystery, historical, drama"],
      ["Anime","Spy x Family","anime/spy-x-family.html","Comedy, action, family"],
      ["Character","Monkey D. Luffy","characters/luffy.html","One Piece, pirate captain, adventure"],
      ["Character","Roronoa Zoro","characters/roronoa-zoro.html","One Piece, swordsman, loyalty"],
      ["Character","Sasuke Uchiha","characters/sasuke-uchiha.html","Naruto, shinobi, rivalry"],
      ["Character","Vegeta","characters/vegeta.html","Dragon Ball, Saiyan, rivalry"],
      ["Character","Megumi Fushiguro","characters/megumi-fushiguro.html","Jujutsu Kaisen, sorcerer, shikigami"],
      ["Character","Nezuko Kamado","characters/nezuko-kamado.html","Demon Slayer, family, demons"],
      ["Character","Levi Ackerman","characters/levi-ackerman.html","Attack on Titan, soldier, combat"],
      ["Character","Kakashi Hatake","characters/kakashi-hatake.html","Naruto, mentor, shinobi"],

      ["Character","Naruto Uzumaki","characters/naruto-uzumaki.html","Naruto, ninja, hero"],
      ["Character","Goku","characters/goku.html","Dragon Ball, Saiyan, martial arts"],
      ["Character","Gojo Satoru","characters/gojo-satoru.html","Jujutsu Kaisen, sorcerer"],
      ["Character","Tanjiro Kamado","characters/tanjiro-kamado.html","Demon Slayer, swordsman"],
      ["Character","Sung Jin-Woo","characters/sung-jin-woo.html","Solo Leveling, hunter"],
      ["Character","Eren Yeager","characters/eren-yeager.html","Attack on Titan, titan"],
      ["Character","Denji","characters/denji.html","Chainsaw Man, devil hunter"],
      ["Movie","Your Name","movies/your-name.html","Anime movie, romance, fantasy"],
      ["Movie","Spirited Away","movies/spirited-away.html","Anime movie, fantasy"],
      ["Movie","A Silent Voice","movies/a-silent-voice.html","Anime movie, drama"],
      ["Movie","Weathering With You","movies/weathering-with-you.html","Anime movie, romance, fantasy"],
      ["Movie","Akira","movies/akira.html","Anime movie, sci-fi"],
      ["Guide","What Anime Should I Watch?","what-to-watch.html","Recommendations, discovery"],
      ["Guide","Best Anime","best-anime.html","Top anime, recommendations"],
      ["Guide","Anime Watch Orders","watch-order/","Where to start, watch order"],
      ["Guide","Anime Like","anime-like/","What to watch next, similar anime"],
      ["Guide","Anime Movies","anime-movies.html","Anime films, movies"],
      ["Guide","Anime Characters","anime-characters.html","Characters, profiles"],
      ["Guide","Anime Like Dragon Ball","anime-like/dragon-ball.html","What to watch after Dragon Ball"],
      ["Guide","Anime Like The Apothecary Diaries","anime-like/the-apothecary-diaries.html","What to watch after The Apothecary Diaries"],
      ["Guide","Anime Like Chainsaw Man","anime-like/chainsaw-man.html","What to watch after Chainsaw Man"],
      ["Guide","Anime Like Spy x Family","anime-like/spy-x-family.html","What to watch after Spy x Family"],
      ["Guide","Short Anime","anime-by/short-anime.html","Short anime, manageable series"],
      ["Guide","Dark Anime","anime-by/dark-anime.html","Dark anime, intense stories"],
      ["Guide","Feel-Good Anime","anime-by/feel-good-anime.html","Feel-good anime, comedy, warmth"],
      ["Guide","Anime for Beginners","anime-by/anime-for-beginners.html","Beginner-friendly anime"],
      ["Guide","Emotional Anime","anime-by/emotional-anime.html","Emotional anime, character-driven stories"],
      ["Guide","Long Anime","anime-by/long-anime.html","Long-running anime, epic franchises"],
      ["Guide","Anime Genres","anime-genres.html","Genres, moods, discovery"],
      ["Guide","Action Anime","anime-genres/action.html","Action, battles, rivals, high-stakes anime"],
      ["Guide","Fantasy Anime","anime-genres/fantasy.html","Fantasy, magic, worlds, quests"],
      ["Guide","Adventure Anime","anime-genres/adventure.html","Adventure, journeys, exploration"],
      ["Guide","Supernatural Anime","anime-genres/supernatural.html","Curses, demons, spirits, supernatural"],
      ["Guide","Mystery Anime","anime-genres/mystery.html","Mystery, clues, secrets, investigations"],
      ["Guide","Drama Anime","anime-genres/drama.html","Drama, emotion, character-driven stories"],
      ["Guide","Comedy Anime","anime-genres/comedy.html","Comedy, character chemistry, light anime"],
      ["Guide","Sports Anime","anime-genres/sports.html","Sports, competition, training, teamwork"],

      ["Guide","Anime Rankings","anime-rankings.html","Rankings, lists, comparisons"],
      ["Guide","New Anime","new-anime.html","New releases, seasonal anime"],
      ["Guide","Anime Series","anime-series.html","Series, franchises, discovery"],
      ["Guide","Anime Websites","anime-websites.html","Anime resources, official sources"],
      ["Guide","Anime Online","anime-online.html","Where to watch anime, legal options"],
      ["Guide","Recommendations","recommendations.html","Personalized anime recommendations"],
      ["Guide","Release Calendar","release-calendar.html","Release dates, schedule"],
      ["Guide","Seasonal Anime","seasonal.html","Current season, Fall 2026"],
      ["Guide","Upcoming Anime","upcoming.html","Upcoming releases, future anime"]
    ];
    const searchBox = globalSearch.closest(".search-box");
    let results = document.querySelector("#global-search-results");
    if (!results) {
      results = document.createElement("div");
      results.id = "global-search-results";
      results.className = "global-search-results";
      results.setAttribute("role","listbox");
      results.hidden = true;
      searchBox?.appendChild(results);
    }
    function renderGlobalResults() {
      const q = globalSearch.value.trim().toLowerCase();
      results.replaceChildren();
      if (!q) { results.hidden = true; return; }
      const matches = discoveryIndex.filter(item => (item[0]+" "+item[1]+" "+item[3]).toLowerCase().includes(q)).slice(0,7);
      if (!matches.length) {
        const empty=document.createElement("div"); empty.className="global-search-empty"; empty.textContent="No AnimeZax result yet. Try an anime, character, movie, or guide."; results.appendChild(empty);
      } else matches.forEach(item => {
        const link=document.createElement("a"); link.className="global-search-result"; link.href=item[2]; link.setAttribute("role","option");
        const type=document.createElement("span"); type.className="global-search-type"; type.textContent=item[0];
        const copy=document.createElement("span"); copy.className="global-search-copy";
        const name=document.createElement("strong"); name.textContent=item[1];
        const meta=document.createElement("small"); meta.textContent=item[3]; copy.append(name,meta); link.append(type,copy); results.appendChild(link);
      });
      results.hidden = false;
    }
    globalSearch.addEventListener("input", renderGlobalResults);
    globalSearch.addEventListener("focus", renderGlobalResults);
    document.addEventListener("click", event => { if (!searchBox?.contains(event.target)) results.hidden = true; });
    globalSearch.addEventListener("keydown", event => { if (event.key === "Escape") { results.hidden = true; globalSearch.blur(); } });
    document.addEventListener("keydown", event => {
      if (event.key === "/" && !["INPUT","TEXTAREA","SELECT"].includes(document.activeElement?.tagName)) {
        event.preventDefault(); globalSearch.focus(); globalSearch.select();
      }
    });
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
    } else if (card.classList.contains("library-card")) {
      const image = card.querySelector("img");
      if (image) {
        image.src = imageUrl;
        image.addEventListener("error", () => image.remove(), { once: true });
      }
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


  // Browser-only watchlist: no account, server, or cross-device sync required.
  const WATCHLIST_KEY = "animezax-watchlist-v1";
  const animeCatalog = [
    { title: "Black Clover", genres: "Action · Fantasy", url: "anime/black-clover.html", mood: ["action","fantasy"], length: "long", tone: "serious", description: "An underdog fantasy about magic, rivalry, and relentless determination." },
    { title: "Frieren: Beyond Journey’s End", genres: "Fantasy · Drama", url: "anime/frieren-beyond-journeys-end.html", mood: ["fantasy","adventure"], length: "medium", tone: "reflective", description: "A thoughtful fantasy journey about time, memory, and connection." },
    { title: "One Piece", genres: "Adventure · Action", url: "anime/one-piece.html", mood: ["adventure","action"], length: "long", tone: "light", description: "A vast pirate adventure about friendship, dreams, and exploration." },
    { title: "Solo Leveling", genres: "Action · Fantasy", url: "anime/solo-leveling.html", mood: ["action","fantasy"], length: "short", tone: "serious", description: "Fast-paced dungeon action and a dramatic power-progression story." },
    { title: "Demon Slayer: Kimetsu no Yaiba", genres: "Action · Fantasy", url: "anime/demon-slayer.html", mood: ["action","fantasy"], length: "medium", tone: "serious", description: "Emotional supernatural action with sword fights and family at its core." },
    { title: "The Apothecary Diaries", genres: "Mystery · Drama", url: "anime/the-apothecary-diaries.html", mood: ["mystery"], length: "medium", tone: "reflective", description: "A clever palace mystery led by an observant young apothecary." },
    { title: "Jujutsu Kaisen", genres: "Action · Supernatural", url: "anime/jujutsu-kaisen.html", mood: ["action"], length: "medium", tone: "serious", description: "Dark supernatural battles, cursed energy, and difficult choices." },
    { title: "Spy x Family", genres: "Comedy · Action", url: "anime/spy-x-family.html", mood: ["comfort"], length: "medium", tone: "light", description: "A playful found-family comedy full of secret identities and heart." },
    { title: "Tougen Anki: Nikko Kegon Falls Arc", genres: "Supernatural · Action", url: "seasonal.html", mood: ["action"], length: "short", tone: "serious", description: "A supernatural action entry listed in the Fall 2026 seasonal tracker." },
    { title: "Aoashi — Season 2", genres: "Sports · Drama", url: "seasonal.html", mood: ["adventure"], length: "medium", tone: "serious", description: "A football-focused sports drama about learning and competition." },
    { title: "Magic Knight Rayearth", genres: "Fantasy · Adventure", url: "seasonal.html", mood: ["fantasy","adventure"], length: "medium", tone: "light", description: "A classic-style fantasy adventure with a new retelling listed for Fall 2026." },
    { title: "Firefly Wedding", genres: "Historical · Romance thriller", url: "seasonal.html", mood: ["mystery"], length: "short", tone: "serious", description: "A historical romance thriller listed in the Fall 2026 tracker." }
  ];
  function readWatchlist() {
    try {
      const parsed = JSON.parse(localStorage.getItem(WATCHLIST_KEY) || "[]");
      return Array.isArray(parsed) ? parsed.filter(item => item && typeof item.title === "string") : [];
    } catch (_) { return []; }
  }
  function writeWatchlist(items) {
    try { localStorage.setItem(WATCHLIST_KEY, JSON.stringify(items)); return true; }
    catch (_) { return false; }
  }
  function addToWatchlist(title) {
    const item = animeCatalog.find(entry => entry.title === title) || {title, genres:"Seasonal pick",url:"seasonal.html",description:"Check the seasonal tracker for current details."};
    const items = readWatchlist();
    if (items.some(entry => entry.title === title)) return "exists";
    items.unshift({...item, status:"plan", addedAt:Date.now()});
    return writeWatchlist(items) ? "added" : "error";
  }
  document.querySelectorAll("[data-quick-add]").forEach(button => {
    button.addEventListener("click", () => {
      const title = button.dataset.quickAdd;
      const result = addToWatchlist(title);
      const original = button.dataset.originalLabel || button.textContent.trim();
      button.dataset.originalLabel = original;
      button.textContent = result === "added" ? "✓ Added to watchlist" : result === "exists" ? "✓ Already saved" : "Could not save — check browser storage";
      button.setAttribute("aria-label", (result === "added" ? "Added " : result === "exists" ? "Already saved " : "Could not save ") + title);
      updateWatchlistNavCount();
      renderWatchlist();
      renderHomeDashboard();
      renderSmartRecommendations();
    });
  });

  // Smart Discovery: recommend unsaved titles from the user's saved genres and moods.
  const smartRecommendations = document.querySelector("#smart-recommendations");
  function renderSmartRecommendations() {
    if (!smartRecommendations) return;
    const saved = readWatchlist();
    smartRecommendations.replaceChildren();
    if (!saved.length) {
      const p=document.createElement("p"); p.className="dashboard-empty"; p.textContent="Save an anime above and AnimeZax will match its genres, mood, and viewing style."; smartRecommendations.append(p);
      return;
    }
    const savedTitles=new Set(saved.map(item=>item.title));
    const signals=new Set();
    saved.forEach(item => {
      (item.mood || []).forEach(signal => signals.add(signal));
      (item.genres || "").toLowerCase().split(/[·,]/).map(v=>v.trim()).filter(Boolean).forEach(signal => signals.add(signal));
    });
    const scored=animeCatalog
      .filter(item=>!savedTitles.has(item.title))
      .map(item=>{
        const itemSignals=new Set([...(item.mood||[]),...(item.genres||"").toLowerCase().split(/[·,]/).map(v=>v.trim()).filter(Boolean)]);
        let score=0;
        itemSignals.forEach(signal=>{ if(signals.has(signal)) score+=1; });
        if(saved.some(s=>s.length===item.length)) score+=0.35;
        if(saved.some(s=>s.tone===item.tone)) score+=0.25;
        return {...item,score};
      })
      .sort((a,b)=>b.score-a.score);
    const picks=scored.slice(0,2);
    const intro=document.createElement("p"); intro.className="smart-intro";
    intro.textContent=saved.length===1 ? "Because you saved " + saved[0].title + "…" : "Based on what you saved…";
    smartRecommendations.append(intro);
    picks.forEach(item=>{
      const a=document.createElement("a"); a.className="smart-pick"; a.href=item.url;
      const copy=document.createElement("span"); copy.className="smart-pick-copy";
      const strong=document.createElement("strong"); strong.textContent=item.title;
      const small=document.createElement("small"); small.textContent=item.genres || "Anime";
      copy.append(strong,small);
      const arrow=document.createElement("span"); arrow.className="smart-pick-arrow"; arrow.textContent="→";
      a.append(copy,arrow); smartRecommendations.append(a);
    });
    const guideMap={
      "One Piece":"anime-like/one-piece.html","Naruto":"anime-like/naruto.html",
      "Attack on Titan":"anime-like/attack-on-titan.html","Dragon Ball":"watch-order/dragon-ball-watch-order.html",
      "Demon Slayer: Kimetsu no Yaiba":"anime-like/demon-slayer.html","Jujutsu Kaisen":"anime-like/jujutsu-kaisen.html",
      "Chainsaw Man":"anime-like/chainsaw-man.html","Solo Leveling":"anime-like/solo-leveling.html",
      "Black Clover":"anime-like/black-clover.html","Frieren: Beyond Journey’s End":"anime-like/frieren-beyond-journeys-end.html",
      "The Apothecary Diaries":"anime/the-apothecary-diaries.html","Spy x Family":"anime-like/spy-x-family.html"
    };
    const anchorTitle=saved[0]?.title;
    if (anchorTitle && guideMap[anchorTitle]) {
      const guide=document.createElement("a"); guide.className="smart-guide"; guide.href=guideMap[anchorTitle];
      guide.textContent="Explore anime like " + anchorTitle + " ↗";
      smartRecommendations.append(guide);
    }
    if (!picks.length) {
      const p=document.createElement("p"); p.className="dashboard-empty"; p.textContent="You’ve explored the current matching picks. Browse the full library for more."; smartRecommendations.append(p);
    }
  }

  // Homepage discovery dashboard, powered by the same local watchlist.
  const homeWatchlistCount = document.querySelector("#home-watchlist-count");
  const homeWatchlistPreview = document.querySelector("#home-watchlist-preview");
  const continueExploring = document.querySelector("#continue-exploring");
  function renderHomeDashboard() {
    if (!homeWatchlistCount && !homeWatchlistPreview && !continueExploring) return;
    const items = readWatchlist();
    if (homeWatchlistCount) homeWatchlistCount.textContent = String(items.length);
    if (homeWatchlistPreview) {
      homeWatchlistPreview.replaceChildren();
      if (!items.length) {
        const p=document.createElement("p"); p.className="dashboard-empty"; p.textContent="Nothing saved yet. Add a title from the collection above."; homeWatchlistPreview.append(p);
      } else {
        items.slice(0,3).forEach(item => {
          const a=document.createElement("a"); a.className="dashboard-title"; a.href=item.url || "watchlist.html";
          const strong=document.createElement("strong"); strong.textContent=item.title;
          const small=document.createElement("small"); small.textContent=item.status==="watching" ? "Watching" : item.status==="completed" ? "Completed" : "Plan to watch";
          a.append(strong,small); homeWatchlistPreview.append(a);
        });
      }
    }
    if (continueExploring) {
      continueExploring.replaceChildren();
      if (!items.length) {
        const p=document.createElement("p"); p.className="dashboard-empty"; p.textContent="Start with One Piece, Frieren, Solo Leveling, or explore the full library."; continueExploring.append(p);
        const a=document.createElement("a"); a.className="dashboard-link"; a.href="anime/"; a.textContent="Browse anime library ↗"; continueExploring.append(a);
      } else {
        const item=items[0], a=document.createElement("a"); a.className="continue-card"; a.href=item.url || "watchlist.html";
        const kicker=document.createElement("span"); kicker.textContent="LAST SAVED";
        const title=document.createElement("strong"); title.textContent=item.title;
        const meta=document.createElement("span"); meta.textContent=item.genres || "Anime";
        a.append(kicker,title,meta); continueExploring.append(a);
      }
    }
  }
  renderHomeDashboard();
  renderSmartRecommendations();

  const watchlistGrid = document.querySelector("#watchlist-grid");
  const watchlistEmpty = document.querySelector("#watchlist-empty");
  const watchlistCount = document.querySelector("#watchlist-count");
  const watchlistSearch = document.querySelector("#watchlist-search");
  const watchlistFilterButtons = [...document.querySelectorAll("[data-watch-filter]")];
  let activeWatchFilter = "all";
  function renderWatchlist() {
    if (!watchlistGrid) return;
    const items = readWatchlist();
    const query = (watchlistSearch?.value || "").trim().toLowerCase();
    const shown = items.filter(item => (activeWatchFilter === "all" || item.status === activeWatchFilter) && (item.title + " " + (item.genres || "")).toLowerCase().includes(query));
    if (watchlistCount) watchlistCount.textContent = items.length + (items.length === 1 ? " saved title" : " saved titles");
    watchlistGrid.replaceChildren();
    if (watchlistEmpty) watchlistEmpty.hidden = shown.length > 0;
    if (!items.length && watchlistEmpty) watchlistEmpty.querySelector("p").textContent = "Add anime from the Discover page or use the quick-add collection below.";
    shown.forEach(item => {
      const card = document.createElement("article"); card.className = "watchlist-item";
      const top = document.createElement("div"); top.className = "watchlist-item-top";
      const titleWrap = document.createElement("div");
      const title = document.createElement("h3"); title.textContent = item.title;
      const genres = document.createElement("p"); genres.textContent = item.genres || "Anime";
      titleWrap.append(title, genres);
      const statusLabel = document.createElement("span"); statusLabel.className = "watchlist-status";
      statusLabel.textContent = ({plan:"Plan to watch",watching:"Watching",completed:"Completed"})[item.status] || "Plan to watch";
      top.append(titleWrap, statusLabel);
      const desc = document.createElement("p"); desc.textContent = item.description || "Saved for later.";
      const controls = document.createElement("div"); controls.className = "watchlist-item-controls";
      const select = document.createElement("select"); select.setAttribute("aria-label", "Progress for " + item.title);
      [["plan","Plan to watch"],["watching","Watching"],["completed","Completed"]].forEach(([value,label]) => { const option=document.createElement("option"); option.value=value; option.textContent=label; option.selected=(item.status||"plan")===value; select.append(option); });
      select.addEventListener("change", () => { const all=readWatchlist(); const found=all.find(entry=>entry.title===item.title); if(found){found.status=select.value;writeWatchlist(all);renderWatchlist();} });
      const link=document.createElement("a");link.className="text-link";link.href=item.url || "index.html#discover";link.textContent="View guide →";
      const remove=document.createElement("button");remove.className="watchlist-remove";remove.type="button";remove.textContent="Remove";remove.addEventListener("click",()=>{writeWatchlist(readWatchlist().filter(entry=>entry.title!==item.title));renderWatchlist();});
      controls.append(select,link,remove);card.append(top,desc,controls);watchlistGrid.append(card);
    });
    if (watchlistEmpty) watchlistEmpty.hidden = shown.length > 0 || (items.length > 0 && !!query);
    if (shown.length === 0 && items.length > 0 && watchlistEmpty) {
      watchlistEmpty.hidden = false;
      watchlistEmpty.querySelector("h2").textContent = "No titles match this view";
      watchlistEmpty.querySelector("p").textContent = "Try another status filter or search term.";
    } else if (watchlistEmpty) {
      watchlistEmpty.querySelector("h2").textContent = "Your list starts here";
      watchlistEmpty.querySelector("p").textContent = "Add anime from the Discover page or use the quick-add collection below.";
    }
  }
  watchlistSearch?.addEventListener("input", renderWatchlist);
  watchlistFilterButtons.forEach(button => button.addEventListener("click", () => {
    activeWatchFilter=button.dataset.watchFilter||"all";
    watchlistFilterButtons.forEach(item=>{const selected=item===button;item.classList.toggle("is-selected",selected);item.setAttribute("aria-pressed",String(selected));});
    renderWatchlist();
  }));
  document.querySelector("#export-watchlist")?.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(readWatchlist(), null, 2)], {type:"application/json"});
    const url = URL.createObjectURL(blob); const link=document.createElement("a");link.href=url;link.download="animezax-watchlist.json";link.click();URL.revokeObjectURL(url);
  });
  renderWatchlist();

  // Quiz recommendations use transparent tag matching, not an external account or tracking.
  const quizForm = document.querySelector("#anime-quiz");
  const quizResultList = document.querySelector("#quiz-result-list");
  quizForm?.addEventListener("submit", event => {
    event.preventDefault();
    const answers = new FormData(quizForm);
    const mood=answers.get("mood"), length=answers.get("length"), tone=answers.get("tone");
    const scored = animeCatalog.map(item => {
      let score = item.mood.includes(mood) ? 4 : 0;
      if (length === item.length) score += 2;
      else if (length === "medium" && item.length !== "long") score += 1;
      if (tone === item.tone) score += 2;
      if (tone === "light" && item.tone === "reflective") score += 1;
      return {...item, score};
    }).sort((a,b)=>b.score-a.score || a.title.localeCompare(b.title)).slice(0,3);
    if (!quizResultList) return;
    quizResultList.replaceChildren();
    scored.forEach((item,index) => {
      const card=document.createElement("article");card.className="quiz-result-card";
      const heading=document.createElement("h3");heading.textContent=(index+1)+". "+item.title;
      const description=document.createElement("p");description.textContent=item.description;
      const links=document.createElement("div");links.className="quiz-result-links";
      const guide=document.createElement("a");guide.href=item.url;guide.textContent="Explore title →";
      const save=document.createElement("button");save.type="button";save.className="text-link";save.textContent="Add to watchlist +";
      save.addEventListener("click",()=>{const result=addToWatchlist(item.title);save.textContent=result==="added"?"Added ✓":result==="exists"?"Already saved ✓":"Could not save";});
      links.append(guide,save);card.append(heading,description,links);quizResultList.append(card);
    });
    const heading=document.querySelector("#quiz-results h2");if(heading)heading.textContent="Your three suggested starting points";
    const intro=document.querySelector("#quiz-results > p:not(.eyebrow)");if(intro)intro.textContent="Matched to your selected mood, time commitment, and tone. Try a different combination to explore more.";
  });

  const calendarMonth = document.querySelector("#calendar-month");
  calendarMonth?.addEventListener("change", () => {
    document.querySelectorAll(".calendar-event[data-month]").forEach(event => {
      event.hidden = calendarMonth.value !== "all" && event.dataset.month !== calendarMonth.value;
    });
  });

  // Shared navigation state, reading progress, and accessible back-to-top control.
  function updateWatchlistNavCount() {
    const link = document.querySelector('#primary-nav a[href*="watchlist.html"]');
    if (!link) return;
    let badge = link.querySelector(".watchlist-nav-count");
    if (!badge) { badge=document.createElement("span"); badge.className="watchlist-nav-count"; badge.setAttribute("aria-label","saved titles"); link.appendChild(badge); }
    badge.textContent=String(readWatchlist().length);
  }
  updateWatchlistNavCount();

  const primaryNav = document.querySelector("#primary-nav");
  if (primaryNav && !primaryNav.querySelector('a[href*="/anime/"]')) {
    const libraryLink = document.createElement("a");
    libraryLink.href = "/anime/";
    libraryLink.textContent = "Anime library";
    primaryNav.insertBefore(libraryLink, primaryNav.querySelector('a[href*="articles"]') || null);
  }
  const currentPath = window.location.pathname.replace(/index\\.html$/, "").replace(/\\/$/, "") || "/";
  document.querySelectorAll("#primary-nav a").forEach(link => {
    try {
      const target = new URL(link.href, window.location.origin).pathname.replace(/index\\.html$/, "").replace(/\\/$/, "") || "/";
      const isCurrent = target === currentPath || (target !== "/" && currentPath.startsWith(target + "/"));
      if (isCurrent && !link.hash) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      } else {
        link.classList.remove("active");
        link.removeAttribute("aria-current");
      }
    } catch (_) {}
  });

  const progress = document.createElement("div");
  progress.className = "reading-progress";
  progress.setAttribute("role", "progressbar");
  progress.setAttribute("aria-label", "Page reading progress");
  progress.setAttribute("aria-valuemin", "0");
  progress.setAttribute("aria-valuemax", "100");
  progress.setAttribute("aria-valuenow", "0");
  const progressFill = document.createElement("span");
  progress.append(progressFill);
  document.body.append(progress);

  const backToTop = document.createElement("button");
  backToTop.className = "back-to-top";
  backToTop.type = "button";
  backToTop.setAttribute("aria-label", "Back to top");
  backToTop.title = "Back to top";
  backToTop.textContent = "↑";
  document.body.append(backToTop);
  backToTop.addEventListener("click", () => window.scrollTo({top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"}));

  let scrollTicking = false;
  function updateScrollUI() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const percent = maxScroll > 0 ? Math.min(100, Math.max(0, window.scrollY / maxScroll * 100)) : 0;
    progressFill.style.width = percent + "%";
    progress.setAttribute("aria-valuenow", String(Math.round(percent)));
    backToTop.classList.toggle("is-visible", window.scrollY > 480);
    scrollTicking = false;
  }
  window.addEventListener("scroll", () => {
    if (!scrollTicking) {
      scrollTicking = true;
      window.requestAnimationFrame(updateScrollUI);
    }
  }, {passive: true});
  window.addEventListener("resize", updateScrollUI, {passive: true});
  updateScrollUI();

  const year = document.querySelector("#year");
  if (year) year.textContent = String(new Date().getFullYear());
})();