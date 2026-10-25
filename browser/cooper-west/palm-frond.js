import * as THREE from './vendor/three.module.js';
// Every level has a continuous central rachis rooted at the same crown point.
export function createPalmFrond(level=0){
 const steps=[12,6,4,2][level],vertices=[],triangle=(a,b,c)=>vertices.push(...a,...b,...c);
 const center=t=>[t*4.3,Math.sin(t*Math.PI)*.65-t*t*.85,0],width=t=>t<.12?0:Math.pow(Math.sin((t-.12)/.88*Math.PI),.8)*.92,edge=(t,sign)=>{const a=center(t);return[a[0],a[1]-.12*Math.sin(t*Math.PI),sign*Math.max(.015,width(t))];};
 for(let j=0;j<steps;j++){
  const t=j/steps,u=(j+1)/steps,a=center(t),b=center(u),r=.055*(1-t)+.012,q=.055*(1-u)+.012;
  if(level<2){
   triangle([a[0],a[1],-r],[a[0],a[1],r],[b[0],b[1],q]);triangle([a[0],a[1],-r],[b[0],b[1],q],[b[0],b[1],-q]);
   if(u>.12)for(const sign of [-1,1]){const tip=[a[0]+.35*(1-t),a[1]-.16,sign*width(Math.max(.12,u))],heel=[a[0]+.16*(1-t),a[1]-.12,sign*width(Math.max(.12,u))*.7];triangle([a[0],a[1],sign*r],[b[0],b[1],sign*q],tip);triangle([a[0],a[1],sign*r],tip,heel);}
  }else{triangle(edge(t,-1),edge(t,1),edge(u,1));triangle(edge(t,-1),edge(u,1),edge(u,-1));}
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.computeVertexNormals();return g;
}
