import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('../dist/assets/site.js',import.meta.url),'utf8');
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function target(extra={}){
 const listeners=new Map();
 return Object.assign({
  addEventListener(type,callback){if(!listeners.has(type))listeners.set(type,[]);listeners.get(type).push(callback);},
  dispatchEvent(event){for(const callback of listeners.get(event.type)||[])callback(event);},
  classList:{values:new Set(),add(name){this.values.add(name);},remove(name){this.values.delete(name);},contains(name){return this.values.has(name);}}
 },extra);
}
function fixture({reduced=false,saveData=false,mobile=false,rejected=false}={}){
 const video=target({id:'hero-film',dataset:{src:'desktop.mp4',mobileSrc:'mobile.mp4'},paused:true,src:'',muted:false,defaultMuted:false,
  getAttribute(name){return name==='src'?this.src:null;},
  async play(){if(rejected)throw Object.assign(new Error('blocked'),{name:'NotAllowedError'});this.paused=false;this.dispatchEvent({type:'playing'});},
  pause(){this.paused=true;this.dispatchEvent({type:'pause'});}
 });
 const motion=target({matches:reduced});
 const connection=target({saveData});
 const document=target({hidden:false,body:target(),
  querySelector:()=>null,
  querySelectorAll:s=>s==='[data-ambient-video]'?[video]:[]
 });
 const window=target({IntersectionObserver:true});
 let observed;
 vm.runInNewContext(source,{document,window,navigator:{connection},Event,matchMedia:q=>q.includes('prefers-reduced-motion')?motion:target({matches:q.includes('max-width:760')&&mobile}),
  IntersectionObserver:class{constructor(callback){this.callback=callback;}observe(node){if(node===video)observed=this.callback;}}
 });
 return {video,motion,document,
  async visible(value){observed([{isIntersecting:value}]);await tick();}
 };
}
const regular=fixture();
assert.equal(regular.video.src,'');
await regular.visible(true);
assert.equal(regular.video.src,'desktop.mp4');
assert(!regular.video.paused&&regular.video.muted&&regular.video.defaultMuted);
assert(regular.video.classList.contains('has-played'));
await regular.visible(false);assert(regular.video.paused);
await regular.visible(true);assert(!regular.video.paused);
regular.document.hidden=true;regular.document.dispatchEvent({type:'visibilitychange'});assert(regular.video.paused);
regular.document.hidden=false;regular.document.dispatchEvent({type:'visibilitychange'});await tick();assert(!regular.video.paused);
regular.document.body.classList.add('nav-open');regular.document.dispatchEvent({type:'navigation-visibility-change'});assert(regular.video.paused);
regular.document.body.classList.remove('nav-open');regular.document.dispatchEvent({type:'navigation-visibility-change'});await tick();assert(!regular.video.paused);
regular.motion.matches=true;regular.motion.dispatchEvent({type:'change'});assert(regular.video.paused);
for(const options of [{reduced:true},{saveData:true}]){
 const f=fixture(options);await f.visible(true);assert.equal(f.video.src,'','preference must avoid initial download');assert(f.video.paused);
}
const mobile=fixture({mobile:true});await mobile.visible(true);assert.equal(mobile.video.src,'mobile.mp4');
const blocked=fixture({rejected:true});await blocked.visible(true);assert(blocked.video.paused);assert(!blocked.video.classList.contains('has-played'));
regular.video.dispatchEvent({type:'error'});assert(regular.video.paused);assert(!regular.video.classList.contains('has-played'));
console.log('Motion checks passed without overlay controls: muted auto-play, responsive media, offscreen/menu/tab pause, reduced motion, save-data, autoplay denial, and error fallback.');
