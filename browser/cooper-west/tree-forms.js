import * as THREE from './vendor/three.module.js';
// Branch-following foliage restored from Mobile Test 08; same seeded leaf layout.
export function treeVariant(seedValue,shrub=false,level=0){
 let state=seedValue>>>0;function rr(){state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296}
 const range=(a,b)=>a+(b-a)*rr(),V=(x,y,z)=>new THREE.Vector3(x,y,z);
 const bark=[],barkColors=[],fol=[],folColors=[];
 function tri(arr,col,a,b,c,color){for(const p of [a,b,c]){arr.push(p.x,p.y,p.z);col.push(color.r,color.g,color.b)}}
 const barkColor=new THREE.Color(shrub?0x9a927e:0x76604a);
 function rod(a,b,r,endR){const axis=b.clone().sub(a).normalize();let side=axis.clone().cross(V(0,0,1));if(side.length()<.1)side=axis.clone().cross(V(1,0,0));side.normalize();const up=axis.clone().cross(side).normalize();const sides=[6,4,3,3][level];for(let i=0;i<sides;i++){let t=i*Math.PI*2/sides,u=(i+1)*Math.PI*2/sides;let d=side.clone().multiplyScalar(Math.cos(t)).addScaledVector(up,Math.sin(t)),e=side.clone().multiplyScalar(Math.cos(u)).addScaledVector(up,Math.sin(u));tri(bark,barkColors,a.clone().addScaledVector(d,r),a.clone().addScaledVector(e,r),b.clone().addScaledVector(d,endR),barkColor);tri(bark,barkColors,b.clone().addScaledVector(d,endR),a.clone().addScaledVector(e,r),b.clone().addScaledVector(e,endR),barkColor)}}
 function leafShape(base,dir,length,width,color){let tip=base.clone().addScaledVector(dir,length),mid=base.clone().addScaledVector(dir,length*.48).add(V(0,length*.08,0)),side=dir.clone().cross(V(0,1,0));if(side.length()<.1)side=V(1,0,0);side.normalize();let left=base.clone().addScaledVector(dir,length*.48).addScaledVector(side,width),right=base.clone().addScaledVector(dir,length*.48).addScaledVector(side,-width);const shade=color.clone().multiplyScalar(.9);if(level===0){tri(fol,folColors,base,left,mid,shade);tri(fol,folColors,base,mid,right,color);tri(fol,folColors,mid,left,tip,shade);tri(fol,folColors,mid,tip,right,color)}else{tri(fol,folColors,base,left,tip,shade);tri(fol,folColors,base,tip,right,color)}}
 const h=shrub?1.7:6.7,span=shrub?1.1:2.5;
 for(let stem=0;stem<3;stem++){
  let angle=stem*Math.PI*2/3+rr()*.5,root=V(Math.cos(angle)*.25,0,Math.sin(angle)*.25),fork=root.clone().add(V(Math.cos(angle)*.45,h*.5,Math.sin(angle)*.45)),top=fork.clone().add(V(Math.cos(angle)*.5,h*.4,Math.sin(angle)*.5));
  rod(root,fork,shrub?.045:.15,shrub?.025:.09);rod(fork,top,shrub?.025:.09,.025);
  for(let branch=0;branch<4;branch++){
   let theta=angle+branch*1.65,start=fork.clone().lerp(top,branch/4),end=start.clone().add(V(Math.cos(theta)*span,range(.3,1.3)*h*.2,Math.sin(theta)*span));if(level<3)rod(start,end,shrub?.022:.065,.012);
   for(let t=0;t<3;t++){
    let origin=start.clone().lerp(end,.45+t*.18),ta=theta+range(-1.1,1.1),te=origin.clone().add(V(Math.cos(ta)*span*.65,range(-.25,.3),Math.sin(ta)*span*.65));if(level<3)rod(origin,te,.014,.004);
    for(let k=0;k<12;k++){
     let p=origin.clone().lerp(te,(k+1)/12).add(V(0,range(-.18,.22),0)),la=ta+(k%2===0?-1:1)*range(.65,1.4),dir=V(Math.cos(la),range(-.65,.55),Math.sin(la)).normalize(),green=new THREE.Color(0x79a44f).lerp(new THREE.Color(0x315e37),rr());leafShape(p,dir,shrub?range(.22,.38):range(.55,.95),shrub?.15:.23,green);
    }
   }
  }
 }
 function geometry(vertices,colors){let g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.computeVertexNormals();return g}
 if(level===3){
  // Keep all 36 original twig clusters. Crossed leaf masses retain their extents
  // while eliminating individual leaf triangles in the distant canopy.
  const reduced=[],colors=[];
  for(let i=0;i<fol.length;i+=12*6*3){const points=fol.slice(i,i+12*6*3),xs=[],ys=[],zs=[];for(let k=0;k<points.length;k+=3){xs.push(points[k]);ys.push(points[k+1]);zs.push(points[k+2]);}const lo=[Math.min(...xs),Math.min(...ys),Math.min(...zs)],hi=[Math.max(...xs),Math.max(...ys),Math.max(...zs)],c=lo.map((v,k)=>(v+hi[k])/2),tint=folColors.slice(i,i+3);
   const quad=(a,b,c,d)=>{for(const p of [a,b,c,a,c,d]){reduced.push(...p);colors.push(...tint);}};
   quad([lo[0],c[1],lo[2]],[hi[0],c[1],lo[2]],[hi[0],c[1],hi[2]],[lo[0],c[1],hi[2]]);
   quad([lo[0],lo[1],c[2]],[hi[0],lo[1],c[2]],[hi[0],hi[1],c[2]],[lo[0],hi[1],c[2]]);
   quad([c[0],lo[1],lo[2]],[c[0],hi[1],lo[2]],[c[0],hi[1],hi[2]],[c[0],lo[1],hi[2]]);
  }return [geometry(bark,barkColors),geometry(reduced,colors)];
 }
 return [geometry(bark,barkColors),geometry(fol,folColors)];
}

