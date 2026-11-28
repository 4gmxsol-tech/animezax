(function(){var d=document,rm=matchMedia('(prefers-reduced-motion:reduce)').matches;
var a=d.createElement('div');a.className='zx-aurora';a.setAttribute('aria-hidden','true');a.innerHTML='<i></i><i></i><i></i>';d.body.insertBefore(a,d.body.firstChild);
var p=d.createElement('div');p.className='zx-progress';p.setAttribute('aria-hidden','true');d.body.appendChild(p);
var h=d.querySelector('.site-header');
function sc(){var m=d.documentElement.scrollHeight-innerHeight;p.style.transform='scaleX('+(m>0?scrollY/m:0)+')';if(h)h.classList.toggle('zx-scrolled',scrollY>8)}
addEventListener('scroll',sc,{passive:true});sc();
var hero=d.querySelector('.hero');if(hero&&!rm){var s=d.createElement('div');s.className='zx-stars';s.setAttribute('aria-hidden','true');var o='';for(var i=0;i<36;i++)o+='<b style="left:'+(Math.random()*100).toFixed(1)+'%;top:'+(Math.random()*100).toFixed(1)+'%;animation-delay:'+(Math.random()*3.5).toFixed(2)+'s;animation-duration:'+(2.5+Math.random()*3).toFixed(1)+'s"></b>';s.innerHTML=o;hero.insertBefore(s,hero.firstChild)}
d.querySelectorAll('.anime-card,.release-card,.article-card,.guide-card,.latest-item').forEach(function(c){c.classList.add('zx-glow');c.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect();c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px')})});
if(!rm&&'IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){x.target.classList.add('zx-in');io.unobserve(x.target)}})},{threshold:.08});
d.querySelectorAll('.anime-card,.release-card,.article-card,.guide-card,.section-heading').forEach(function(el){if(el.getBoundingClientRect().top>innerHeight){el.classList.add('zx-up');io.observe(el)}})}
})();
