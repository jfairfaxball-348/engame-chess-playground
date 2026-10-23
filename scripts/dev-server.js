import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const port=Number(process.env.PORT||3000),root=resolve('dist');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.wasm':'application/wasm'};
createServer(async(req,res)=>{
  let path;
  try{path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end();return;}
  const full=resolve(root,'.'+path);
  if(full!==root&&!full.startsWith(root+sep)){res.writeHead(403).end();return;}
  try{
    const file=(await stat(full)).isDirectory()?resolve(full,'index.html'):full;
    const body=await readFile(file);
    res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'}).end(body);
  }catch{res.writeHead(404).end('Not found');}
}).listen(port,()=>console.log('Playground at http://localhost:'+port));
