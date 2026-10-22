(() => {
  if (window.__ptAdsterraMounted) return;
  window.__ptAdsterraMounted = true;
  const main = document.querySelector("main");
  if (!main || main.querySelector("[data-adsterra-slot]")) return;
  // Respect an existing ad unit in the content and avoid stacking ads on short utility pages.
  if (main.querySelector('.ad-placement, iframe[src*="adsterra"], script[src*="adsterra"], script[src*="highrevenueformat"], script[src*="bauval.org"], script[src*="bicea.org"]')) return;
  const paragraphs = [...main.querySelectorAll("article p, .article-body p, .content-section p, .article-content p, main p")]
    .filter(p => p.textContent.trim().length > 55 && !p.closest("nav, footer, header, [aria-label='Advertisement']"));
  if (paragraphs.length < 2) return;
  const slot = document.createElement("section");
  slot.dataset.adsterraSlot = "rectangle";
  slot.setAttribute("aria-label", "Advertisement");
  slot.style.cssText = "box-sizing:border-box;width:100%;padding:18px 12px;margin:20px auto;text-align:center;clear:both;";
  const label = document.createElement("p");
  label.textContent = "ADVERTISEMENT";
  label.style.cssText = "font-size:11px;letter-spacing:.08em;margin:0 0 8px;color:#777;";
  const frame = document.createElement("div");
  frame.style.cssText = "width:300px;max-width:100%;min-height:250px;margin:0 auto;display:flex;align-items:center;justify-content:center;overflow:hidden;";
  const config = document.createElement("script");
  config.text = "atOptions = {'key':'8b8e680734f1ca62b2e189f5a9263e56','format':'iframe','height':250,'width':300,'params':{}};";
  const loader = document.createElement("script");
  loader.src = "https://bauval.org/22/8b8e680734f1ca62b2e189f5a9263e56";
  frame.append(config, loader);
  slot.append(label, frame);
  // Put the unit after the first substantive paragraph rather than interrupting the heading.
  paragraphs[0].insertAdjacentElement("afterend", slot);
})();