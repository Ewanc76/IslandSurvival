import * as THREE from './vendor/three.module.js';
const center=t=>[t*4.3,Math.sin(t*Math.PI)*.65-t*t*.85,0];
const ribWidth=t=>.055*(1-t)+.012;
// Folded, narrow pinnae sweep toward the frond tip instead of forming a comb.
export function palmLeaflet(t,sign=1){
 const root=center(t);root[2]=sign*ribWidth(t);
 const remaining=4.3-root[0],advance=Math.min(1.15*(1-.45*t),remaining*.88);
 const spread=Math.pow(Math.max(0,Math.sin((t-.10)/.9*Math.PI)),.75)*.78*(1-.25*t);
 const end=center((root[0]+advance)/4.3),tip=[root[0]+advance,end[1]-.12-.16*t,sign*spread];
 const dx=tip[0]-root[0],dz=tip[2]-root[2],length=Math.hypot(dx,dz),halfWidth=.075*(1-t*.55);
 const side=[-dz/length*halfWidth,0,dx/length*halfWidth],mid=root.map((v,i)=>v+(tip[i]-v)*.48);
 return {root,left:mid.map((v,i)=>v+side[i]),ridge:[mid[0],mid[1]+.045*(1-t),mid[2]],right:mid.map((v,i)=>v-side[i]),tip};
}
const referenceLeaves=Array.from({length:12},(_,j)=>palmLeaflet(.13+j*.78/11));
function outlineWidth(x){
 let width=ribWidth(x/4.3);
 for(const leaf of referenceLeaves)for(const edge of [[leaf.root,leaf.left],[leaf.left,leaf.tip],[leaf.tip,leaf.right],[leaf.right,leaf.root]]){
  const [a,b]=edge;if(x<Math.min(a[0],b[0])||x>Math.max(a[0],b[0])||Math.abs(b[0]-a[0])<1e-8)continue;
  width=Math.max(width,Math.abs(a[2]+(b[2]-a[2])*(x-a[0])/(b[0]-a[0])));
 }return width;
}
export function createPalmFrond(level=0){
 if(!Number.isInteger(level)||level<0||level>3)throw Error('Palm LOD must be 0–3');
 const steps=[12,6,4,2][level],vertices=[],triangle=(a,b,c)=>vertices.push(...a,...b,...c);
 for(let j=0;j<steps;j++){
  const t=j/steps,u=(j+1)/steps,a=center(t),b=center(u),r=level<2?ribWidth(t):outlineWidth(a[0]),q=level<2?ribWidth(u):outlineWidth(b[0]);
  triangle([a[0],a[1],-r],[a[0],a[1],r],[b[0],b[1],q]);triangle([a[0],a[1],-r],[b[0],b[1],q],[b[0],b[1],-q]);
 }
 if(level<2)for(let j=0;j<steps;j++)for(const sign of [-1,1]){
  const p=palmLeaflet(.13+j*.78/(steps-1),sign);
  if(level===0){triangle(p.root,p.left,p.ridge);triangle(p.root,p.ridge,p.right);triangle(p.ridge,p.left,p.tip);triangle(p.ridge,p.tip,p.right);}
  else{triangle(p.root,p.left,p.tip);triangle(p.root,p.tip,p.right);}
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.computeVertexNormals();return g;
}
