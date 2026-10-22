(() => {
  if (document.documentElement.dataset.adsterraMounted === "true") return;
  document.documentElement.dataset.adsterraMounted = "true";
  const main = document.querySelector("main");
  if (!main || main.querySelector('[data-adsterra-slot]')) return;
  const paragraphs = [...main.querySelectorAll("article p, .article-body p, .content-section p, main p")].filter(p => p.textContent.trim().length > 45);
  if (!paragraphs.length) return;
  const makeSlot = (kind) => {
    const slot = document.createElement("section");
    slot.dataset.adsterraSlot = kind;
    slot.setAttribute("aria-label", "Advertisement");
    slot.style.cssText = "box-sizing:border-box;width:100%;padding:20px 12px;margin:18px auto;text-align:center;clear:both;";
    const label = document.createElement("p");
    label.textContent = "ADVERTISEMENT";
    label.style.cssText = "font-size:11px;letter-spacing:.08em;margin:0 0 8px;color:#777;";
    const frame = document.createElement("div");
    const wide = kind === "wide";
    frame.style.cssText = `width:${wide?320:300}px;max-width:100%;min-height:${wide?50:250}px;margin:0 auto;display:flex;align-items:center;justify-content:center;overflow:hidden;`;
    const config = document.createElement("script");
    config.text = "atOptions = {'key':'8b8e680734f1ca62b2e189f5a9263e56','format':'iframe','height':250,'width':300,'params':{}};";
    const loader = document.createElement("script");
    loader.src = "https://bauval.org/22/8b8e680734f1ca62b2e189f5a9263e56";
    if (wide) {
      config.text = "atOptions = {'key':'2209ef0cfff2a4129317e1761af59d13','format':'iframe','height':50,'width':320,'params':{}};";
      loader.src = "https://bicea.org/22/2209ef0cfff2a4129317e1761af59d13";
    }
    frame.append(config,loader); slot.append(label,frame); return slot;
  };
  const first = paragraphs[0];
  first.insertAdjacentElement("afterend", makeSlot("rectangle"));
  if (paragraphs.length >= 7) paragraphs[Math.floor(paragraphs.length/2)].insertAdjacentElement("afterend", makeSlot("wide"));
})();