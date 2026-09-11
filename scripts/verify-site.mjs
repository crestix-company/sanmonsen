import assert from 'node:assert/strict';
import {readFileSync,existsSync,statSync,readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const project=fileURLToPath(new URL('../',import.meta.url));
const dir=path.join(project,'dist');
const pages=['index.html','cuisine.html','banquet.html','space.html','access.html'];
const urls=new Set();
const ids=new Map();
for(const page of [...pages,'404.html']){
 const html=readFileSync(path.join(dir,page),'utf8');
 assert.match(html,/<html lang="ja"/);
 assert.match(html,/<title>[^<]*三文銭/);
 assert.equal((html.match(/<h1[ >]/g)||[]).length,1,page+' must have one h1');
 assert(!/localhost|127\.0\.0\.1|Lorem ipsum|TODO|Coming soon/i.test(html),page+' placeholder/local reference');
 const idList=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(new Set(idList).size,idList.length,page+' duplicate IDs');
 ids.set(page,new Set(idList));
 for(const match of html.matchAll(/\b(?:src|href|poster|srcset)="([^"]+)"/g)){
  const raw=match[1];
  if(/^(https?:|tel:|mailto:|data:)/.test(raw))continue;
  const [relative]=raw.split('#');
  const target=path.resolve(dir,relative||page);
  assert(target.startsWith(dir+path.sep),raw+' outside static root');
  assert(existsSync(target),page+' missing '+raw);
  assert(statSync(target).size>0 || target.endsWith('.nojekyll'),raw+' empty');
  urls.add(relative||page);
 }
 for(const tag of html.matchAll(/<img\b[^>]*>/g)){
  assert(/\balt="[^"]+"/.test(tag[0]),page+' image needs descriptive alt');
  assert(/\bwidth="\d+"/.test(tag[0])&&/\bheight="\d+"/.test(tag[0]),page+' missing image dimensions');
 }
 if(page!=='404.html'){
  assert.match(html,/tel:0255454549/);
  assert.match(html,/日曜定休|日曜日/);
  assert.match(html,/17:30〜23:30/);
  for(const destination of pages)assert(html.includes('href="./'+destination+'"'),page+' missing nav '+destination);
 }
}
for(const page of pages){
 const html=readFileSync(path.join(dir,page),'utf8');
 for(const [,raw]of html.matchAll(/\bhref="([^"\s]*#[^"\s]+)"/g)){
  if(/^https?:/.test(raw))continue;
  const [relative,hash]=raw.split('#');
  const file=relative?path.basename(relative):page;
  assert(ids.get(file)?.has(hash),page+' missing anchor '+raw);
 }
}
const banquet=readFileSync(path.join(dir,'banquet.html'),'utf8');
for(const value of ['5,500','6,000','3〜24名様','前日まで','15分前'])assert(banquet.includes(value),'missing course information '+value);
for(const page of ['index.html','cuisine.html']){
 const html=readFileSync(path.join(dir,page),'utf8');
 const video=html.match(/<video\b[^>]*>/)?.[0];
 assert(video,page+' missing silent footage');
 for(const attribute of ['data-ambient-video','muted','loop','playsinline','preload="none"'])assert(video.includes(attribute),page+' missing video attribute '+attribute);
 assert(!/\s(?:src|autoplay)=?/.test(video),page+' must defer media loading and respect reduced motion');
 assert(!html.includes('motion-toggle'),page+' must not show the removed video controls');
 assert(!/\scontrols(?:\s|=|>)/.test(video),page+' must not show native video controls');
 for(const size of ['720','540']){
  const asset=path.join(dir,'assets/charcoal-silent-'+size+'.mp4');
  assert(statSync(asset).size<3*1024*1024,'silent video should remain under 3 MiB');
 }
}
const manifest=JSON.parse(readFileSync(path.join(project,'.openai/hosting.json'),'utf8'));
assert.equal(manifest.static.directory,'dist');
const files=readdirSync(path.join(dir,'assets'));
const bytes=files.reduce((sum,f)=>sum+statSync(path.join(dir,'assets',f)).size,0);
console.log('Static checks passed: 5 pages, internal links/anchors, photos, video, phone and course facts.');
console.log('Asset payload: '+(bytes/1024/1024).toFixed(2)+' MiB total; unobstructed silent video loads only in view, with reduced-motion support.');
if(process.argv[2]){
 const base=process.argv[2].replace(/\/?$/,'/');
 for(const url of new Set(['',...pages,...urls])){
  const response=await fetch(new URL(url,base));
  assert.equal(response.status,200,'HTTP '+url);
  if(!url||url.endsWith('.html'))assert((await response.text()).includes('三文銭'),'wrong page '+url);
  else {assert(Number(response.headers.get('content-length'))>0,'empty served asset '+url);await response.body?.cancel();}
 }
 const response=await fetch(new URL('does-not-exist-validation',base));
 assert.equal(response.status,404,'unknown route should be 404');
 console.log('HTTP checks passed for all pages and referenced local assets.');
}
