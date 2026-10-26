import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {createLivingWorld} from './living-world.js';import {createLivingVisuals} from './living-visuals.js';import * as THREE from './vendor/three.module.js';
const meta=JSON.parse(fs.readFileSync(new URL('./section.json',import.meta.url))),buffer=fs.readFileSync(new URL('./height.f32',import.meta.url)),heights=new Float32Array(buffer.buffer,buffer.byteOffset,buffer.length/4);
test('living world uses existing island palms, terrain and a balanced nutrient ledger',()=>{
 const w=createLivingWorld(meta,heights),existing=meta.vegetation.filter(p=>p.type==='palm');assert.equal(w.plants.length,existing.length+12);
 existing.forEach((p,i)=>{assert.equal(w.plants[i].x,p.x);assert.equal(w.plants[i].z,p.z);});
 assert.equal(new Set([...w.plants,...w.nuts,...w.crabs].map(p=>p.id)).size,w.plants.length+w.nuts.length+w.crabs.length);
 assert(Math.abs(w.summary().total-w.imported)<1e-8);assert(w.crabs.length>0);
 assert(!w.canCrabTravel(w.crabs[0],{x:meta.west_local_m-10,z:meta.north_local_z_m-10}));
 const originalTerrain=Buffer.from(buffer),initial=w.summary();w.advance(12);const final=w.summary();assert(Math.abs(final.total-final.imported)<1e-7);assert.deepEqual(buffer,originalTerrain);assert(final.crabMeals>initial.crabMeals);assert(final.born>0);
 for(const c of w.crabs)assert(w.habitat(c.x,c.z)>0);
});
test('living models sit on sampled terrain, retain picking bodies and obey mesh budgets',()=>{
 const w=createLivingWorld(meta,heights),scene=new THREE.Scene(),v=createLivingVisuals(scene,w),c=w.crabs[0],view={x:c.x,z:c.z};v.sync(view);v.update(view,.1);
 const m=new THREE.Matrix4(),pos=new THREE.Vector3();v.meshes.body.getMatrixAt(0,m);pos.setFromMatrixPosition(m);assert(Math.abs(pos.y-w.heightAt(c.x,c.z)-.37)<1e-5);
 for(const mesh of Object.values(v.meshes)){assert(mesh.count<=mesh.instanceMatrix.count);for(const n of mesh.instanceMatrix.array.slice(0,mesh.count*16))assert(Number.isFinite(n));}
 const detailedFronds=v.meshes.fronds.count;v.sync({x:-10000,z:-10000});assert(v.meshes.fronds.count<detailedFronds);v.update({x:-10000,z:-10000},.1);assert.equal(v.meshes.body.count,0);
 assert.equal(v.colliders().length,w.plants.filter(p=>p.growth>30).length);
});
test('canopy light follows rendered branch clusters and permits overtopping',()=>{
 const w=createLivingWorld(meta,heights);let darkest={light:1,x:0,z:0};for(const tree of meta.vegetation.filter(p=>p.type==='pisonia').slice(0,60))for(let dx=-3;dx<=3;dx+=2)for(let dz=-3;dz<=3;dz+=2){const x=tree.x+dx,z=tree.z+dz,ground=w.heightAt(x,z);if(ground===null)continue;const light=w.canopyLightAt(x,z,ground+.3);if(light<darkest.light)darkest={light,x,z};}
 assert(darkest.light<.3);const h=w.heightAt(darkest.x,darkest.z);assert.equal(w.canopyLightAt(darkest.x,darkest.z,h+25),1);
 const recruit={id:-1,x:darkest.x,z:darkest.z,growth:0,phase:0};assert(w.competition(recruit)<.3);
 const openMeta={...meta,vegetation:meta.vegetation.filter(p=>p.type!=='pisonia')},open=createLivingWorld(openMeta,heights);assert(w.competition(recruit)<open.competition(recruit));
});

import {Grove} from '../ecology/ecology.js';
import {installNaupaka,NAUPAKA_RULES,naupakaStage} from '../ecology/naupaka.js';
import {createFoliageLOD} from './foliage-lod.js';
import {createNaupakaGeometry} from './naupaka-visuals.js';
function emptyNaupakaWorld(){const w=new Grove(731,'crabFree');w.config.decay=0;installNaupaka(w);return w;}
test('naupaka matures, fruits, germinates and recycles expired seeds and old shrubs',()=>{
 const w=emptyNaupakaWorld(),p=w.addNaupaka(0,0,60,24);p.fruitClock=5;w.step();assert.equal(w.naupakaStats.fruit,3);assert.equal(w.naupakaSeeds.length,3);assert.equal(naupakaStage(p),'Mature shrub');
 w.advance(60);assert(w.naupakaStats.born>0);assert(Math.abs(w.summary().total-w.imported)<1e-8);
 const expiring=w.addNaupakaSeed(1000,1000);expiring.age=NAUPAKA_RULES.seedExpiry-1;const exported=w.exported;w.step();assert(w.exported>=exported+expiring.nutrient-1e-10);assert(w.naupakaStats.failed>0);
 const old=w.addNaupaka(15,0,NAUPAKA_RULES.lifespan,48),cell=w.soilAt(old.x,old.z),organic=cell.organic;w.step();assert(!w.naupaka.some(q=>q.id===old.id));assert(cell.organic>organic);assert(Math.abs(w.summary().total-w.imported)<1e-8);
});
test('palms and naupaka share scarce mineral uptake in proportion to simultaneous demand',()=>{
 const w=emptyNaupakaWorld(),p=w.addPalm(0,0,12),n=w.addNaupaka(0,0,12,12),cell=w.soilAt(0,0);const removed=cell.mineral-.001;cell.mineral=.001;w.exported+=removed;
 let wants;const request=w.additionalPlantDemand;w.additionalPlantDemand=(r,d)=>{request(r,d);wants=[r.get(p.id),r.get(n.id)];};const before=[p.nutrient,n.nutrient];w.step();
 const palmUptake=p.nutrient-before[0]+.0008+Math.min(1,12/84)*.0012,naupakaUptake=n.nutrient-before[1]+.0002+.0006*(.08+.92*12/48);
 assert(palmUptake>0&&naupakaUptake>0);assert(Math.abs(palmUptake/naupakaUptake-wants[0]/wants[1])<1e-8);assert(Math.abs(palmUptake+naupakaUptake-.001)<1e-10);assert(cell.mineral>=0);assert(Math.abs(w.summary().total-w.imported)<1e-8);
});
test('naupaka seed replacement respects the population limit and shaded recruits decline',()=>{
 const w=emptyNaupakaWorld();for(let i=0;i<NAUPAKA_RULES.capacity;i++)w.addNaupakaSeed(0,0);assert.equal(w.addNaupakaSeed(0,0),null);w.advance(18);assert(w.naupakaStats.born>0);assert(w.naupaka.length+w.naupakaSeeds.length<=NAUPAKA_RULES.capacity);assert(Math.abs(w.summary().total-w.imported)<1e-7);
 const shaded=emptyNaupakaWorld();shaded.canopyLightAt=()=>.005;const p=shaded.addNaupaka(0,0,0,0);shaded.advance(130);assert(!shaded.naupaka.some(q=>q.id===p.id));assert.equal(shaded.naupakaStats.died,1);assert(Math.abs(shaded.summary().total-shaded.imported)<1e-8);
});
test('shoreline shrub sites belong to finite living naupaka with progressively cheaper LODs',()=>{
 const w=createLivingWorld(meta,heights),sites=meta.vegetation.filter(p=>p.type==='shrub'&&w.habitat(p.x,p.z));assert(w.naupaka.length>=sites.length);for(const site of sites)assert(w.naupaka.some(p=>p.x===site.x&&p.z===site.z));
 const ids=[...w.plants,...w.nuts,...w.crabs,...w.naupaka,...w.naupakaSeeds].map(p=>p.id);assert.equal(new Set(ids).size,ids.length);
 const foliage=createFoliageLOD(new THREE.Group(),meta,()=>{throw Error('static shrub must not be built')},()=>new THREE.PlaneGeometry());assert(!foliage.batches.some(b=>b.rows.some(p=>p.type==='shrub')));
 const recruit=createNaupakaGeometry(0,true);assert(recruit.attributes.position.count<createNaupakaGeometry(0).attributes.position.count);recruit.dispose();
 const geos=[0,1,2].map(level=>createNaupakaGeometry(level));assert(geos[0].attributes.position.count>geos[1].attributes.position.count);assert(geos[1].attributes.position.count>geos[2].attributes.position.count);for(const g of geos){for(const x of g.attributes.normal.array)assert(Number.isFinite(x));g.dispose();}
});