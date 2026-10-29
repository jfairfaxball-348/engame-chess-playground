/**
 * A real, immutable link from Playground translation -> authoritative Lean.
 *
 * This checks the exact frozen files, not a live Lean runtime, and does NOT
 * certify that a partial JS move selector implements a global winning policy.
 * Run in CI: npm run verify:krk-sources
 */
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';

export const readLock=()=>JSON.parse(readFileSync('proof-sources/krk.lock.json','utf8'));

export function gitBlobHash(bytes){
  const buf=Buffer.isBuffer(bytes)?bytes:Buffer.from(bytes);
  return createHash('sha1').update('blob '+buf.length+'\0').update(buf).digest('hex');
}

export function validateLock(lock){
  if(lock?.schemaVersion!==1 || !/^[0-9a-f]{40}$/.test(lock.sourceCommit) ||
     !/^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/.test(lock.sourceRepository) ||
     !Array.isArray(lock.sources) || lock.sources.length<10)
    throw Error('Invalid KRK proof-source lock header');
  const paths=new Set();
  for(const {path,gitBlob} of lock.sources){
    if(typeof path!=='string' || !/^(formal\/[\w/.-]+\.lean|theorems\/frozen\/EC-T\d+\/v1\.md)$/.test(path) ||
       path.split('/').includes('..') || paths.has(path) || !/^[0-9a-f]{40}$/.test(gitBlob))
      throw Error('Invalid or duplicate locked source: '+path);
    paths.add(path);
  }
  for(const theorem of ['EC-T0019','EC-T0048','EC-T0049']){
    if(!paths.has('theorems/frozen/'+theorem+'/v1.md') ||
       !/^[0-9a-f]{40}$/.test(lock.frozenProofSourceCommits?.[theorem]))
      throw Error('Missing frozen theorem lock: '+theorem);
  }
  if(!paths.has('formal/EndgameChess/Rules/KRKWinning/Policy.lean') ||
     !paths.has('formal/EndgameChess/Rules/KRKImmediate.lean'))
    throw Error('Missing critical constructive/choice audit sources');
  return true;
}

export async function verifyKRKProofSources(lock=readLock(),fetchSource=fetch){
  validateLock(lock);
  let checked=0;
  for(const {path,gitBlob} of lock.sources){
    const url='https://raw.githubusercontent.com/'+lock.sourceRepository+'/'+lock.sourceCommit+'/'+path;
    const response=await fetchSource(url,{headers:{accept:'application/octet-stream'}});
    if(!response.ok)throw Error('Lean source unavailable: '+path+' ('+response.status+')');
    const data=Buffer.from(await response.arrayBuffer());
    const actual=gitBlobHash(data);
    if(actual!==gitBlob)throw Error('Pinned Lean source mismatch: '+path+' expected '+gitBlob+' got '+actual);
    const theorem=path.startsWith('theorems/frozen/')&&path.endsWith('/v1.md') ? path.split('/')[2] : null;
    if(theorem && !data.toString('utf8').includes(lock.frozenProofSourceCommits[theorem]))
      throw Error('Frozen theorem source commit does not match lock: '+theorem);
    checked++;
  }
  const localSource=readFileSync('src/krk-local-witness.js','utf8');
  const terminalSource=readFileSync('src/krk-immediate-witness.js','utf8');
  const proofPanel=readFileSync('src/maths-proof.js','utf8');
  if(!localSource.includes("KRK_PARENT_SHA = '"+lock.sourceCommit+"'") ||
     !terminalSource.includes('KRK_PARENT_SHA') ||
     !proofPanel.includes("const krkRoot='https://github.com/"+lock.sourceRepository+"/blob/"+lock.sourceCommit+"/'"))
    throw Error('Playground KRK implementation or proof links do not match frozen Lean lock');
  return checked;
}

if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href){
  try{
    const count=await verifyKRKProofSources();
    console.log('KRK proof provenance verified:',count,'frozen upstream files, no runtime Lean execution');
  }catch(e){
    console.error(e);
    process.exitCode=1;
  }
}
