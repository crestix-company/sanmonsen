import {createServer} from 'node:http';
import {readFileSync,existsSync,statSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

// Reproduce GitHub project Pages paths before uploading an artifact.
const root=fileURLToPath(new URL('../dist/',import.meta.url));
const prefix='/sanmonsen/';
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.webp':'image/webp','.mp4':'video/mp4','.svg':'image/svg+xml','.ttf':'font/ttf'};
const server=createServer((req,res)=>{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 if(!pathname.startsWith(prefix)){res.writeHead(404);res.end();return;}
 const relative=pathname.slice(prefix.length)||'index.html';
 const file=path.resolve(root,relative);
 if(!file.startsWith(root)||!existsSync(file)||!statSync(file).isFile()){res.writeHead(404);res.end();return;}
 const body=readFileSync(file);
 res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Content-Length':body.length});
 res.end(body);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const previous=process.argv[2];
try {
 process.argv[2]='http://127.0.0.1:'+server.address().port+prefix;
 console.log('Checking GitHub Pages prefix: '+prefix);
 await import('./verify-site.mjs');
} finally {
 process.argv[2]=previous;
 server.closeAllConnections();
 await new Promise(resolve=>server.close(resolve));
}
