(() => {
  "use strict";
  if (window.__animezaxAdsInitialized) return;
  window.__animezaxAdsInitialized = true;

  const ENGINE_URL = "/assets/js/adsterra-ads-engine.js";
  const ALLOWED_HOSTS = ["bicea.org", "bauval.org", "highrevenueformat.com", "www.highrevenueformat.com"];
  const IS_PRIVACY_PAGE = /\/privacy\.html$/i.test(window.location.pathname);

  function renderManualSlots() {
    document.querySelectorAll("[data-adsterra-manual-slot]").forEach((placeholder) => {
      const key = (placeholder.getAttribute("data-adsterra-ad-key") || "").trim();
      const rawUrl = (placeholder.getAttribute("data-adsterra-ad-url") || "").trim();
      const width = Number(placeholder.getAttribute("data-adsterra-width") || 320);
      const height = Number(placeholder.getAttribute("data-adsterra-height") || 50);
      let url;
      try { url = new URL(rawUrl, window.location.href); } catch { return; }
      if (!/^[a-f0-9]{32}$/i.test(key) || url.protocol !== "https:" || ALLOWED_HOSTS.indexOf(url.hostname) < 0) return;
      if (!((width === 320 && height === 50) || (width === 300 && height === 250) || (width === 728 && height === 90))) return;

      const slot = document.createElement("section");
      slot.className = "ad-placement";
      slot.setAttribute("aria-label", "Advertisement");
      slot.style.cssText = "box-sizing:border-box;width:100%;padding:20px 12px;margin:24px auto;text-align:center;clear:both;";
      const label = document.createElement("span");
      label.textContent = "Advertisement";
      label.style.cssText = "display:block;font-size:11px;font-weight:600;letter-spacing:.12em;margin:0 0 10px;color:#777;";
      const frame = document.createElement("div");
      frame.style.cssText = "width:" + width + "px;max-width:100%;min-height:" + height + "px;margin:0 auto;display:flex;align-items:center;justify-content:center;overflow:hidden;";
      const adFrame = document.createElement("iframe");
      adFrame.title = "Advertisement";
      adFrame.loading = "lazy";
      adFrame.width = String(width);
      adFrame.height = String(height);
      adFrame.style.cssText = "display:block;border:0;max-width:100%;margin:0 auto;";
      adFrame.setAttribute("scrolling", "no");
      const safeKey = key.toLowerCase();
      adFrame.srcdoc = '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0"><script>var atOptions={key:\'' + safeKey + '\',format:\'iframe\',height:' + height + ',width:' + width + ',params:{}};<\/script><script src="' + url.href + '"><\/script></body></html>';
      frame.appendChild(adFrame);
      slot.append(label, frame);
      placeholder.replaceWith(slot);
    });
  }

  function loadAdEngine() {
    if (document.querySelector('script[data-adsterra-engine="true"]')) return;
    const script = document.createElement("script");
    script.src = ENGINE_URL;
    script.async = true;
    script.setAttribute("data-adsterra-engine", "true");
    document.body.appendChild(script);
  }

  function start() {
    // The privacy notice page never runs ads.
    if (IS_PRIVACY_PAGE) return;
    try { window.localStorage.removeItem("animezax-ad-consent-v1"); } catch {}
    renderManualSlots();
    loadAdEngine();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
