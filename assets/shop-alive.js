(function(){var els=document.querySelectorAll('section,.feat,.pcard,.gallery img');
if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion:reduce)').matches)return;
var io=new IntersectionObserver(function(e){e.forEach(function(x){if(x.isIntersecting){x.target.classList.add('zx-in');io.unobserve(x.target)}})},{threshold:.08});
els.forEach(function(el){var r=el.getBoundingClientRect();if(r.top>innerHeight){el.classList.add('zx-reveal');io.observe(el)}})})();
/* Shop listing only: one consent-managed 320x50 banner below the product grid (not between buy buttons). */
(function(){
  if (location.pathname !== "/shop.html") return;
  var grid = document.querySelector(".shop-grid");
  if (!grid || document.querySelector("[data-adsterra-manual-slot]")) return;
  var slot = document.createElement("div");
  slot.className = "ad-placement";
  slot.setAttribute("data-adsterra-manual-slot", "custom");
  slot.setAttribute("data-adsterra-ad-key", "bd627f46c6b09cc811c07d01019b40d1");
  slot.setAttribute("data-adsterra-ad-url", "https://www.highrevenueformat.com/bd627f46c6b09cc811c07d01019b40d1/invoke.js");
  slot.setAttribute("data-adsterra-width", "320");
  slot.setAttribute("data-adsterra-height", "50");
  slot.setAttribute("aria-label", "Advertisement");
  grid.insertAdjacentElement("afterend", slot);
  var s = document.createElement("script");
  s.src = "/assets/js/adsterra-ads.js";
  s.defer = true;
  document.body.appendChild(s);
})();
