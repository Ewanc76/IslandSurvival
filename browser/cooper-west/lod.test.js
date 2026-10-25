import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import * as THREE from './vendor/three.module.js';import {lodBand} from './lod.js';import {treeVariant} from './tree-forms.js';import {createLivingWorld} from './living-world.js';import {createLivingVisuals} from './living-visuals.js';
test('LOD distance boundaries have hysteresis',()=>{assert.equal(lodBand(31,0),0);assert.equal(lodBand(34,0),1);assert.equal(lodBand(29,1),1);assert.equal(lodBand(26,1),0);assert.equal(lodBand(94,2),3);});
test('restored foliage simplifies the same leaves and preserves distant canopy extents',()=>{
 const high=treeVariant(802),mid=treeVariant(802,false,1),far=treeVariant(802,false,3),a=high[1].attributes.position,b=mid[1].attributes.position;assert.equal(a.count,b.count*2);
 for(let leaf=0;leaf<a.count/12;leaf++)for(const [j,k] of [0,1,8,0,8,5].entries())for(let axis=0;axis<3;axis++)assert.equal(b.array[(leaf*6+j)*3+axis],a.array[(leaf*12+k)*3+axis]);
 mid[1].computeBoundingBox();far[1].computeBoundingBox();for(const key of ['min','max'])for(const axis of ['x','y','z'])assert(Math.abs(mid[1].boundingBox[key][axis]-far[1].boundingBox[key][axis])<1e-5);
 assert(far[1].attributes.position.count<mid[1].attributes.position.count);for(const pair of [high,mid,far])for(const g of pair)g.dispose();
});
test('palms retain every frond while coconuts and crabs enter cheaper mesh tiers',()=>{
 const meta=JSON.parse(fs.readFileSync(new URL('./section.json',import.meta.url))),buf=fs.readFileSync(new URL('./height.f32',import.meta.url)),w=createLivingWorld(meta,new Float32Array(buf.buffer,buf.byteOffset,buf.length/4));
 const p=w.plants[0],c=w.crabs[0];c.x=p.x;c.z=p.z;w.plants=[p];w.crabs=[c];w.nuts=[{id:99999,x:p.x,z:p.z,age:0,state:'ground'}];const v=createLivingVisuals(new THREE.Group(),w);
 const rows=[];for(const distance of [0,20,40,80,120]){const view={x:p.x+distance,z:p.z};v.sync(view);v.update(view,.1);const m=v.meshes;assert.equal(m.fronds.count+m.frondsMid.count+m.frondsFar.count+m.frondsDistant.count,9);rows.push({body:m.body.count,mid:m.mid_body.count,far:m.crabFar.count,nuts:m.nuts.count,nutsMid:m.nutsMid.count,nutsFar:m.nutsFar.count});
  for(const mesh of Object.values(m)){assert(mesh.count<=mesh.instanceMatrix.count);if(mesh.count)assert.equal(mesh.instanceMatrix.updateRanges[0].count,mesh.count*16);}
 }
 assert.equal(rows[0].body,1);assert.equal(rows[1].mid,1);assert.equal(rows[2].far,1);assert.equal(rows[3].far,0);assert(rows[0].nuts>0&&rows[1].nutsMid>0&&rows[2].nutsFar>0);assert.equal(rows[3].nutsFar,0);
 assert(v.meshes.frondsDistant.geometry.attributes.position.count<v.meshes.fronds.geometry.attributes.position.count);
});
