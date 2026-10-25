import * as THREE from './vendor/three.module.js';
import {CRAB_MAX} from '../ecology/crabs.js';
// Shared procedural forms copied from the approved palm-lab models (artifact v6).
export function createLivingVisuals(parent,grove){
 const limit=grove.capacity,scene=parent;
 const mat=color=>new THREE.MeshStandardMaterial({color,roughness:1,flatShading:true,side:THREE.DoubleSide});
 const bark=mat('#92714f'),leaf=mat('#517e36'),nutMat=mat('#ffffff');
const vegetation=new THREE.Group();parent.add(vegetation);
// Whole coconut: a bulky tapered husk, with longitudinal coir ridges and sun-weathered fibers.
// One shared colored mesh keeps fallen, floating, attached and germinating fruit inexpensive.
const nutGeo=new THREE.BufferGeometry(),huskPositions=[],huskColors=[];
const huskPoint=(t,a)=>{const r=.34*Math.pow(Math.sin(Math.PI*t),.82)*(1+.075*Math.cos(a*3)+.025*Math.cos(a*24));return [r*Math.cos(a),r*Math.sin(a),.46*Math.cos(Math.PI*t)];};
const huskColor=(t,a)=>{const streak=.5+.5*Math.sin(a*19+.35*Math.sin(t*9)),weather=.5+.5*Math.cos(a*5+t*8),tip=Math.pow(Math.abs(2*t-1),5);return new THREE.Color('#b9a180').multiplyScalar(.78+.19*streak+.09*weather-.17*tip);};
for(let ring=0;ring<10;ring++)for(let side=0;side<32;side++){
 const t=ring/10,u=(ring+1)/10,a=side*Math.PI*2/32,b=(side+1)*Math.PI*2/32;
 for(const [v,angle] of [[t,a],[u,a],[u,b],[t,a],[u,b],[t,b]]){huskPositions.push(...huskPoint(v,angle));huskColors.push(...huskColor(v,angle).toArray());}
}
nutGeo.setAttribute('position',new THREE.Float32BufferAttribute(huskPositions,3));nutGeo.setAttribute('color',new THREE.Float32BufferAttribute(huskColors,3));nutGeo.computeVertexNormals();nutMat.vertexColors=true;
const trunkGeo=new THREE.CylinderGeometry(.16,.29,1,7,4);const frondGeo=new THREE.BufferGeometry();
// A curved rachis with paired tapered leaflets, all built as one shared mesh.
const verts=[];const tri=(a,b,c)=>verts.push(...a,...b,...c);
for(let j=0;j<12;j++){const t=j/12,u=(j+1)/12;const center=v=>[v*4,Math.sin(v*Math.PI)*1.25-v*v*.7,0];const a=center(t),b=center(u);tri([a[0],a[1],-.05],[a[0],a[1],.05],b);
 for(const sign of [-1,1]){const width=Math.sin((t*.85+.1)*Math.PI)*1.15*(1-t*.5);tri(a,[a[0]+.65,a[1]-.28,sign*width],b);}}
frondGeo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));frondGeo.computeVertexNormals();
// Seedling leaves are folded straps; adult pinnae appear gradually as the crown develops.
const strapGeo=new THREE.BufferGeometry(),strapVerts=[];
for(let j=0;j<12;j++){const a=j/12,b=(j+1)/12;const point=(t,side)=>[t*1.35,Math.sin(t*Math.PI*.7)*1.05,side*Math.sin(t*Math.PI)*.16];
 for(const side of [-1,1])strapVerts.push(...point(a,0),...point(a,side),...point(b,side),...point(a,0),...point(b,side),...point(b,0));}
strapGeo.setAttribute('position',new THREE.Float32BufferAttribute(strapVerts,3));strapGeo.computeVertexNormals();
const youngLeaf=mat('#78a541');
const fronds=new THREE.InstancedMesh(frondGeo,leaf,limit*9),trunks=new THREE.InstancedMesh(trunkGeo,bark,limit),nuts=new THREE.InstancedMesh(nutGeo,nutMat,limit*4),straps=new THREE.InstancedMesh(strapGeo,youngLeaf,limit*5);
vegetation.add(trunks,fronds,nuts,straps);
for(const m of [fronds,trunks,nuts,straps])m.frustumCulled=false;

const dummy=new THREE.Object3D();
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
// Visual development follows effective growth; husk decay follows chronological age.
// This does not alter solver height, competition, reproduction or nutrient accounting.
function palmParts(p,emit){
 const g=Math.max(0,p.growth),phase=p.phase||0;
 const lift=smooth(30,84,g),h=.10+lift*(grove.height(p)-.10),lean=Math.sin(phase)*.5;
 if(g>30){const width=.42+.58*smooth(30,120,g);emit('trunk',[p.x+lean*h*.03,h/2,p.z],[0,phase,-lean*.06],[width,h,width]);}
 const strapCount=g<3?1:g<8?2:g<16?3:5;
 const strapScale=(.16+.95*smooth(0,24,g))*(1-smooth(24,48,g));
 if(strapScale>.005)for(let j=0;j<strapCount;j++){
  emit('strap',[p.x,h,p.z],[0,phase+j*2.4,-.85*(1-smooth(0,10,g))],[strapScale,strapScale,strapScale]);
 }
 const divided=smooth(12,42,g),size=(.20+.80*smooth(12,110,g))*divided;
 if(size>.002){const count=g<24?4:g<48?6:9;for(let j=0;j<count;j++)emit('frond',[p.x+lean*h*.06,h,p.z],[0,j*Math.PI*2/count+phase,(j%3-1)*.18],[size,size,size]);}
 const husk=1-smooth(6,24,p.age);
 if(husk>.01)emit('nut',[p.x-.22*Math.cos(phase),.23*husk,p.z+.22*Math.sin(phase)],[.35,phase,.3],[husk,husk*.72,husk*1.25]);
 if(g>=84)for(let j=0;j<3;j++)emit('nut',[p.x+Math.cos(j*2.1)*.32,h-.3,p.z+Math.sin(j*2.1)*.32],[0,0,0],[1,1,1]);
}
function setPart(mesh,index,pos,rot,scale){dummy.position.set(pos[0],pos[1]+(grove.heightAt(pos[0],pos[2])||0),pos[2]);dummy.rotation.set(...rot);dummy.scale.set(...scale);dummy.updateMatrix();mesh.setMatrixAt(index,dummy.matrix);}
// Coconut-crab inspired anatomy. The ecological solver remains authoritative.
// Shared geometry and instancing keep jointed animals affordable in a large grove.
const crabArmorGeo=new THREE.IcosahedronGeometry(1,1),armorColors=[];
for(let i=0;i<crabArmorGeo.attributes.position.count;i++){
 const x=crabArmorGeo.attributes.position.getX(i),y=crabArmorGeo.attributes.position.getY(i),z=crabArmorGeo.attributes.position.getZ(i);
 const patch=.5+.5*Math.sin(x*17+z*11+y*9),color=new THREE.Color().lerpColors(new THREE.Color('#554455'),new THREE.Color('#ae6949'),patch);color.multiplyScalar(.85+.15*(y+1)/2);armorColors.push(...color.toArray());
}
crabArmorGeo.setAttribute('color',new THREE.Float32BufferAttribute(armorColors,3));
const crabArmor=mat('#ffffff');crabArmor.vertexColors=true;
const crabShapes={body:[crabArmorGeo,crabArmor,1],plates:[crabArmorGeo,crabArmor,4],limbs:[new THREE.CylinderGeometry(.65,1,1,6),mat('#8e5846'),40],joints:[new THREE.IcosahedronGeometry(1,0),mat('#62454b'),12],claws:[crabArmorGeo,crabArmor,2],tips:[new THREE.CylinderGeometry(.2,1,1,5),mat('#c8ad8a'),16],eyes:[new THREE.SphereGeometry(1,7,5),mat('#151916'),2],antennae:[new THREE.CylinderGeometry(.45,1,1,4),mat('#724f40'),8]};
function makeCrabMeshes(capacity,parent){const meshes={};for(const [key,[geo,material,count]] of Object.entries(crabShapes)){const m=new THREE.InstancedMesh(geo,material,capacity*count);m.frustumCulled=false;m.count=0;parent.add(m);meshes[key]=m;}return meshes;}
const crabMeshes=makeCrabMeshes(CRAB_MAX,vegetation),crabBody=crabMeshes.body;
const crabVisuals=new Map(),crabPickIds=[];
let crabWorld=grove,inspectedCrab=null,followingCrab=false;
const boneAxis=new THREE.Vector3(0,1,0),boneDirection=new THREE.Vector3(),boneRotation=new THREE.Quaternion();
// All model coordinates: +Z points forward. Three exposed leg pairs, a tucked rear pair,
// separate claw arms, eye stalks, and two pairs of antennae.
function crabParts(phase,moving,eating,time,emit){
 const bob=moving*.012*Math.sin(phase*2),base=.37+bob;
 const ball=(kind,x,y,z,sx,sy,sz)=>emit(kind,[x,y,z],[sx,sy,sz],null);
 const bone=(kind,a,b,r)=>{boneDirection.set(b[0]-a[0],b[1]-a[1],b[2]-a[2]);const length=boneDirection.length();boneRotation.setFromUnitVectors(boneAxis,boneDirection.normalize());emit(kind,[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2],[r,length,r],boneRotation);};
 ball('body',0,base,0,.29,.20,.37);
 ball('plates',0,base-.045,-.34,.24,.17,.23);
 ball('plates',0,base-.11,-.46,.18,.12,.14);
 ball('plates',0,base+.015,.28,.22,.13,.15);
 for(const side of [-1,1]){
  for(let j=0;j<3;j++){
   const wave=phase+j*Math.PI*.9+(side===1?Math.PI:0),stride=Math.sin(wave)*moving*.13,lift=Math.max(0,Math.cos(wave))*moving*.10;
   const z=.18-j*.27,spread=j===2?.62:.85;
   const hip=[side*.23,base-.02,z],knee=[side*spread,.36,z+.10+stride*.4],ankle=[side*(spread+.18),.14,z-.19+stride],toe=[side*(spread+.11),.035+lift,z-.31+stride];
   bone('limbs',hip,knee,j===2?.048:.065);bone('limbs',knee,ankle,j===2?.030:.042);bone('tips',ankle,toe,.023);
   ball('joints',...knee,.062,.06,.065);
  }
  // Reduced final legs are sheltered beneath the abdomen.
  const rear=[side*.12,.23,-.40],elbow=[side*.25,.17,-.48],foot=[side*.13,.12,-.52];bone('limbs',rear,elbow,.028);bone('limbs',elbow,foot,.018);
  // Strong asymmetry makes the major claw distinct from the smaller handling claw.
  const major=side===-1?1.28:.87,reach=eating?.06*Math.sin(time*4):0;
  const shoulder=[side*.22,base,.28],elbow2=[side*.47,base-.06,.44],palm=[side*.42,base-.04+reach,.73];
  bone('limbs',shoulder,elbow2,.095*major);bone('limbs',elbow2,palm,.085*major);ball('joints',...elbow2,.10*major,.09*major,.10*major);
  ball('claws',...palm,.13*major,.125*major,.19*major);
  const gape=eating?.045+.055*(.5+.5*Math.sin(time*4)):.08;
  for(const edge of [-1,1]){const root=[palm[0]+edge*.075*major,palm[1],palm[2]+.12*major],bend=[palm[0]+edge*(.09+gape)*major,palm[1],palm[2]+.27*major],tip=[palm[0]+edge*gape*.42*major,palm[1]-.02,palm[2]+.37*major];bone('tips',root,bend,.050*major);bone('tips',bend,tip,.032*major);}
  const eyeBase=[side*.13,base+.08,.31],eyeTop=[side*.17,base+.22,.36];bone('limbs',eyeBase,eyeTop,.023);ball('eyes',...eyeTop,.042,.035,.035);
  const sweep=.07*Math.sin(time*1.8+side);
  for(let pair=0;pair<2;pair++){const root=[side*.10,base+.02,.37],bend=[side*(.19+pair*.09+sweep),base+.13,.61+pair*.05],tip=[side*(.25+pair*.14+sweep),base+.10,.85+pair*.10];bone('antennae',root,bend,pair?.007:.012);bone('antennae',bend,tip,pair?.005:.009);}
 }
}
const crabRoot=new THREE.Matrix4(),crabLocal=new THREE.Matrix4(),crabMatrix=new THREE.Matrix4(),crabYaw=new THREE.Quaternion(),crabUp=new THREE.Vector3(0,1,0),crabPos=new THREE.Vector3(),crabScale=new THREE.Vector3(),crabIdentity=new THREE.Quaternion();
function writeCrab(meshes,counts,x,z,heading,size,phase,moving,eating,time){
 crabYaw.setFromAxisAngle(crabUp,heading);crabRoot.compose(crabPos.set(x,grove.heightAt(x,z)||0,z),crabYaw,crabScale.setScalar(size));
 crabParts(phase,moving,eating,time,(kind,pos,scale,q)=>{crabLocal.compose(crabPos.set(...pos),q||crabIdentity,crabScale.set(...scale));crabMatrix.multiplyMatrices(crabRoot,crabLocal);meshes[kind].setMatrixAt(counts[kind]++,crabMatrix);});
}
function finishCrabMeshes(meshes,counts){for(const [key,m] of Object.entries(meshes)){m.count=counts[key];m.instanceMatrix.needsUpdate=true;}}

 let lastView=null;
 function sync(view){let ti=0,fi=0,ni=0,si=0;
  for(const p of grove.plants){let frondIndex=0;const distance=Math.hypot(p.x-view.x,p.z-view.z);
   palmParts(p,(kind,pos,rot,scale)=>{
    if(kind==='trunk')setPart(trunks,ti++,pos,rot,scale);
    if(kind==='frond'){const j=frondIndex++;if(distance>100&&j%3!==0||distance>40&&distance<=100&&j%2!==0)return;setPart(fronds,fi++,pos,rot,scale);}
    if(kind==='strap'&&distance<100)setPart(straps,si++,pos,rot,scale);
    if(kind==='nut'&&distance<80)setPart(nuts,ni++,pos,rot,scale);
   });
  }
  for(const n of grove.nuts)if(Math.hypot(n.x-view.x,n.z-view.z)<80)setPart(nuts,ni++,[n.x,.25,n.z],[.3,n.id,.3],[1,.72,1.25]);
  for(const [m,count] of [[trunks,ti],[fronds,fi],[nuts,ni],[straps,si]]){m.count=count;m.instanceMatrix.needsUpdate=true;}
  lastView={x:view.x,z:view.z};
 }
 function update(view,dt,paused=false){
  if(!lastView||Math.hypot(view.x-lastView.x,view.z-lastView.z)>12)sync(view);
  const active=new Set(grove.crabs.map(c=>c.id));for(const id of crabVisuals.keys())if(!active.has(id))crabVisuals.delete(id);
  const counts=Object.fromEntries(Object.keys(crabMeshes).map(k=>[k,0])),blend=1-Math.exp(-dt*10);
  for(const c of grove.crabs){if(Math.hypot(c.x-view.x,c.z-view.z)>65)continue;
   let v=crabVisuals.get(c.id);if(!v){v={x:c.x,z:c.z,heading:c.heading,phase:c.id*.7,time:0};crabVisuals.set(c.id,v);}
   const nx=v.x+(c.x-v.x)*blend,nz=v.z+(c.z-v.z)*blend;
   // Display interpolation must also obey the terrain travel test; never glide over water.
   const legal=grove.canCrabTravel(v,{x:nx,z:nz});const dx=legal?nx-v.x:c.x-v.x,dz=legal?nz-v.z:c.z-v.z;v.x+=dx;v.z+=dz;v.phase+=Math.hypot(dx,dz)*5;v.time+=paused?0:dt;
   v.heading+=Math.atan2(Math.sin(c.heading-v.heading),Math.cos(c.heading-v.heading))*blend;
   writeCrab(crabMeshes,counts,v.x,v.z,v.heading,.55+.45*smooth(0,18,c.age),v.phase,dt>0?Math.min(1,Math.hypot(dx,dz)/dt):0,c.action==='Eating coconut',v.time);
  }
  finishCrabMeshes(crabMeshes,counts);
 }
 return {group:vegetation,sync,update,meshes:{trunks,fronds,nuts,straps,...crabMeshes},colliders:()=>grove.plants.filter(p=>p.growth>30).map(p=>({x:p.x,z:p.z,radius:.20}))};
}
