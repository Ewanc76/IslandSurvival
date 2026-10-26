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
