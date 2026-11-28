(function(){var els=document.querySelectorAll('section,.feat,.pcard,.gallery img');
if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion:reduce)').matches)return;
var io=new IntersectionObserver(function(e){e.forEach(function(x){if(x.isIntersecting){x.target.classList.add('zx-in');io.unobserve(x.target)}})},{threshold:.08});
els.forEach(function(el){var r=el.getBoundingClientRect();if(r.top>innerHeight){el.classList.add('zx-reveal');io.observe(el)}})})();
