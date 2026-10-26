// First recover the baseline adapter beside the current one:
// git show 00d53df2b69a035a43c857b14c5a0e1fae3842fb:browser/cooper-west/living-world.js > browser/cooper-west/living-world-baseline.js
// Run this script, then remove living-world-baseline.js (not a runtime dependency).
import fs from 'node:fs';
import {createLivingWorld as baseline} from '../browser/cooper-west/living-world-baseline.js';
import {createLivingWorld as candidate} from '../browser/cooper-west/living-world.js';
const root=new URL('../browser/cooper-west/',import.meta.url),meta=JSON.parse(fs.readFileSync(new URL('section.json',root))),buf=fs.readFileSync(new URL('height.f32',root)),heights=new Float32Array(buf.buffer,buf.byteOffset,buf.length/4),runs=[];
for(const [name,create] of [['LOD 02 baseline',baseline],['Canopy 03 candidate',candidate]]){const w=create(meta,heights),start=performance.now();let peak=0,firstCap=null;for(let i=1;i<=438;i++){w.step();peak=Math.max(peak,w.plants.length);if(w.stats.capHits&&firstCap===null)firstCap=i;}const s=w.summary(),r={name,months:s.month,palms:s.plants,coconuts:s.nuts,crabs:s.crabs,born:s.born,died:s.died,peakPalms:peak,firstCapMonth:firstCap,capHits:s.capHits,nutrientError:s.total-s.imported,elapsedSeconds:(performance.now()-start)/1000};runs.push(r);console.log(r);}
fs.writeFileSync(new URL('../docs/experiments/canopy-comparison.json',import.meta.url),JSON.stringify({seed:731,months:438,scope:'One paired deterministic solver check; not ecological calibration or a phone performance test',runs},null,2)+'\n');
