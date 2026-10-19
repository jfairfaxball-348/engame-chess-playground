import { cpSync, copyFileSync, mkdirSync, rmSync } from 'node:fs';
rmSync('dist',{recursive:true,force:true});
mkdirSync('dist',{recursive:true});
copyFileSync('index.html','dist/index.html');
cpSync('src','dist/src',{recursive:true});
console.log('Static site built in dist/');
