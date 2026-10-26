import * as THREE from './vendor/three.module.js';
import {treeVariant} from './tree-forms.js';
import {lodBand,uploadInstances} from './lod.js';
function combine(parts){const result=new THREE.BufferGeometry();for(const key of ['position','normal','color']){const rows=parts.map(g=>g.getAttribute(key)),values=new Float32Array(rows.reduce((n,a)=>n+a.array.length,0));let at=0;for(const row of rows){values.set(row.array,at);at+=row.array.length;}result.setAttribute(key,new THREE.BufferAttribute(values,3));}return result;}
export function createFoliageLOD(parent,meta,shrub,fern){
 const material=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide,flatShading:true}),batches=[];
 const dummy=new THREE.Object3D();
 for(let variant=0;variant<3;variant++){
  const rows=meta.vegetation.filter((p,i)=>p.type==='pisonia'&&i%3===variant);
  batches.push(make(rows,[0,1,2,3].map(level=>combine(treeVariant(802+variant*119,false,level)))));
 }
 const lowShrub=combine([new THREE.PlaneGeometry(2.8,1.8).translate(0,.8,0),new THREE.PlaneGeometry(2.8,1.8).rotateY(Math.PI/2).translate(0,.8,0)].map(g=>{g.setAttribute('color',new THREE.Float32BufferAttribute(Array.from({length:g.attributes.position.count*3},(_,i)=>[.22,.42,.18][i%3]),3));return g.toNonIndexed();}));
 batches.push(make(meta.vegetation.filter(p=>p.type==='shrub'),[shrub(),shrub(),lowShrub,null]));
 batches.push(make(meta.vegetation.filter(p=>p.type==='fern'),[fern(3),fern(2),fern(1),null]));
 function make(rows,geometries){const states=new Int8Array(rows.length).fill(-1),matrices=rows.map(p=>{dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(0,p.rotation,0);dummy.scale.setScalar(p.scale);dummy.updateMatrix();return dummy.matrix.clone();});const meshes=geometries.map(g=>{if(!g)return null;const m=new THREE.InstancedMesh(g,material,rows.length);m.count=0;m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);m.frustumCulled=false;parent.add(m);return m;});return{rows,states,matrices,meshes};}
 let last=null,elapsed=1;
 function update(view,dt=0,force=false){elapsed+=dt;if(!force&&last&&(elapsed<.25||Math.hypot(view.x-last.x,view.z-last.z)<1))return;elapsed=0;last={x:view.x,z:view.z};
  for(const b of batches){const counts=[0,0,0,0];b.rows.forEach((p,i)=>{const level=lodBand(Math.hypot(p.x-view.x,p.z-view.z),b.states[i]);b.states[i]=level;const m=b.meshes[level];if(m)m.setMatrixAt(counts[level]++,b.matrices[i]);});b.meshes.forEach((m,level)=>{if(m){uploadInstances(m,counts[level]);}});}
 }
 return{update,batches};
}
