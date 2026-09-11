const toggle=document.querySelector('.menu-toggle');
const menu=document.querySelector('#mobile-menu');
const closeMenu=()=>{if(!toggle||!menu)return;toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','メニューを開く');menu.hidden=true;document.body.classList.remove('nav-open');};
toggle?.addEventListener('click',()=>{const opening=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(opening));toggle.setAttribute('aria-label',opening?'メニューを閉じる':'メニューを開く');menu.hidden=!opening;document.body.classList.toggle('nav-open',opening);});
menu?.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&toggle?.getAttribute('aria-expanded')==='true'){closeMenu();toggle.focus();}});
matchMedia('(min-width: 1101px)').addEventListener('change',event=>{if(event.matches)closeMenu();});
if(!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window){
const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('revealed');observer.unobserve(entry.target);}}},{threshold:.08});
document.querySelectorAll('[data-reveal]').forEach(node=>{node.classList.add('will-reveal');observer.observe(node);});
}
