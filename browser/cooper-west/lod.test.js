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
test('leaning palm crowns meet the exact trunk top at every LOD',()=>{
 const meta=JSON.parse(fs.readFileSync(new URL('./section.json',import.meta.url))),buf=fs.readFileSync(new URL('./height.f32',import.meta.url)),w=createLivingWorld(meta,new Float32Array(buf.buffer,buf.byteOffset,buf.length/4)),p=w.plants[0];p.phase=2.2;p.growth=400;w.plants=[p];w.crabs=[];w.nuts=[];const v=createLivingVisuals(new THREE.Group(),w),m=new THREE.Matrix4(),f=new THREE.Matrix4();
 for(const distance of [0,40,75,120]){v.sync({x:p.x+distance,z:p.z});const stem=[v.meshes.trunks,v.meshes.trunksMid,v.meshes.trunksFar].find(m=>m.count>0),crown=[v.meshes.fronds,v.meshes.frondsMid,v.meshes.frondsFar,v.meshes.frondsDistant].find(m=>m.count>0);stem.getMatrixAt(0,m);crown.getMatrixAt(0,f);const top=new THREE.Vector3(0,.5,0).applyMatrix4(m),root=new THREE.Vector3().setFromMatrixPosition(f);assert(top.distanceTo(root)<.001);}
});

import {palmLeaflet,createPalmFrond} from './palm-frond.js';
test('palm pinnae sweep forward, taper and droop while LODs retain the frond envelope',()=>{
 for(let j=0;j<12;j++){const t=.13+j*.78/11,a=palmLeaflet(t,1),b=palmLeaflet(t,-1),dx=a.tip[0]-a.root[0],dz=a.tip[2]-a.root[2];assert(dx>0);assert(Math.atan2(Math.abs(dz),dx)<Math.PI/3);assert(a.tip[1]<a.root[1]+.15);if(t>.4)assert(a.tip[1]<a.root[1]);assert(Math.abs(a.tip[0]-b.tip[0])<1e-10);assert(Math.abs(a.tip[2]+b.tip[2])<1e-10);const bladeWidth=Math.hypot(...a.left.map((v,i)=>v-a.right[i]));assert(bladeWidth<dx*.5);}
 let previous=Infinity;for(let level=0;level<4;level++){const g=createPalmFrond(level);g.computeBoundingBox();assert(Math.abs(g.boundingBox.max.x-4.3)<1e-5);assert(g.boundingBox.max.z<1);assert(g.attributes.position.count<previous);previous=g.attributes.position.count;for(const value of g.attributes.normal.array)assert(Number.isFinite(value));g.dispose();}
});


import {walkCrabVisual} from './living-visuals.js';
test('crab walking is bounded, frame independent, speed scaled, and freezes on pause',()=>{
 const make=()=>({x:0,z:0,heading:0,phase:0}),target={x:6,z:0};
 const a=make(),b=make();for(let i=0;i<60;i++)walkCrabVisual(a,target,1/60);for(let i=0;i<30;i++)walkCrabVisual(b,target,1/30);
 assert(Math.abs(a.x-.3)<1e-10);assert(Math.abs(a.x-b.x)<1e-10);
 walkCrabVisual(a,target,1,100);assert.equal(a.x,6);
 const frozen={...b};walkCrabVisual(b,target,60,1,true);assert.deepEqual(b,frozen);
 const blocked=make();walkCrabVisual(blocked,target,1,1,false,()=>false);assert.deepEqual(blocked,make());
 const c=make();for(let i=0;i<1200;i++)walkCrabVisual(c,target,1/60);assert(Math.abs(c.x-6)<1e-8);
});

import {createPalmCardGeometry,loadPalmCardMaterial,PALM_BAKE_BOUNDS} from './palm-card.js';
import {createHash} from 'node:crypto';import {inflateSync} from 'node:zlib';
test('palm bake PNGs preserve cutouts and match their source and recorded hashes',()=>{
 const report=JSON.parse(fs.readFileSync(new URL('./palm-bake.json',import.meta.url))),source=fs.readFileSync(new URL('./palm-frond.js',import.meta.url));
 assert.equal(createHash('sha256').update(source).digest('hex'),report.sourceSha256);assert.deepEqual(report.bounds,PALM_BAKE_BOUNDS);
 for(const texture of report.textures){const png=fs.readFileSync(new URL('./'+texture.name,import.meta.url));assert.equal(createHash('sha256').update(png).digest('hex'),texture.sha256);assert.equal(png.readUInt32BE(16),texture.width);assert.equal(png.readUInt32BE(20),texture.height);assert.equal(png[25],6);
 const data=[];for(let pos=8;pos<png.length;){const length=png.readUInt32BE(pos),type=png.toString('ascii',pos+4,pos+8);assert(pos+length+12<=png.length);if(type==='IDAT')data.push(png.subarray(pos+8,pos+8+length));pos+=length+12;}
 const pixels=inflateSync(Buffer.concat(data));assert.equal(pixels.length,(texture.width*4+1)*texture.height);let covered=0;
 for(let y=0;y<texture.height;y++){assert.equal(pixels[y*(texture.width*4+1)],0);if(texture.name.includes('albedo'))for(let x=0;x<texture.width;x++)if(pixels[y*(texture.width*4+1)+1+x*4+3]>=128)covered++;}
 if(texture.name.includes('albedo'))assert(covered/(texture.width*texture.height)>.23&&covered/(texture.width*texture.height)<.25);
 }
});
test('curved palm card keeps its winding, texture orientation and reduced geometry',()=>{
 const g=createPalmCardGeometry();assert.equal(g.attributes.position.count/3,12);assert.equal(g.attributes.uv.getY(0),0);assert.equal(g.attributes.uv.getY(1),1);
 for(let i=0;i<g.attributes.position.count;i++){assert(Number.isFinite(g.attributes.position.getY(i)));assert(g.attributes.normal.getY(i)>0);}
 g.computeBoundingBox();assert(Math.abs(g.boundingBox.min.x-PALM_BAKE_BOUNDS.minX)<1e-6);assert(g.boundingBox.max.y>0);g.dispose();
});
test('palm card switch loads matching maps, transforms baked normals per instance, and restores geometry',async()=>{
 const original=THREE.TextureLoader.prototype.loadAsync,paths=[];THREE.TextureLoader.prototype.loadAsync=async function(url){paths.push(url);return new THREE.Texture();};
 try{const material=await loadPalmCardMaterial(512);assert.equal(material.alphaTest,.5);assert.equal(material.map.colorSpace,THREE.SRGBColorSpace);assert.equal(material.normalMap.colorSpace,THREE.NoColorSpace);assert.equal(material.map.generateMipmaps,false);assert.deepEqual(paths,['palm-frond-512-albedo.png','palm-frond-512-normal.png']);
 const shader={vertexShader:THREE.ShaderLib.standard.vertexShader,fragmentShader:THREE.ShaderLib.standard.fragmentShader};material.onBeforeCompile(shader);assert(shader.vertexShader.includes('normalMatrix*mat3(instanceMatrix)'));assert(shader.fragmentShader.includes('normal*=faceDirection'));assert(!shader.fragmentShader.includes('#include <normal_fragment_maps>'));
 const meta=JSON.parse(fs.readFileSync(new URL('./section.json',import.meta.url))),buf=fs.readFileSync(new URL('./height.f32',import.meta.url)),w=createLivingWorld(meta,new Float32Array(buf.buffer,buf.byteOffset,buf.length/4));w.plants=w.plants.slice(0,1);w.nuts=[];w.crabs=[];const v=createLivingVisuals(new THREE.Group(),w);v.sync(w.plants[0]);assert.equal(v.meshes.cardFronds.visible,false);await v.setPalmMode('512');assert.equal(v.meshes.cardFronds.visible,true);assert.equal(v.meshes.fronds.visible,false);assert.equal(v.meshes.cardFronds.count,9);await v.setPalmMode('geometry');assert.equal(v.meshes.cardFronds.visible,false);assert.equal(v.meshes.fronds.visible,true);
 }finally{THREE.TextureLoader.prototype.loadAsync=original;}
});