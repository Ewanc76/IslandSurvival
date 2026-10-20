// Shared, engine-independent grid sampling and movement rules.
export function sampleHeight(meta, heights, x, z) {
 const fx=(x-meta.west_local_m)/meta.spacing_m, fz=(z-meta.north_local_z_m)/meta.spacing_m;
 if(fx<0||fz<0||fx>meta.width-1||fz>meta.height-1)return null;
 const c=Math.min(meta.width-2,Math.floor(fx)),r=Math.min(meta.height-2,Math.floor(fz));
 const u=fx-c,v=fz-r,i=r*meta.width+c;
 return heights[i]*(1-u)*(1-v)+heights[i+1]*u*(1-v)+heights[i+meta.width]*(1-u)*v+heights[i+meta.width+1]*u*v;
}
export function movePlayer(meta,heights,p,dx,dz,dt,sprint=false,colliders=[]) {
 const ground=sampleHeight(meta,heights,p.x,p.z);const speed=ground<-.7?1.4:(sprint?4:2.2);
 const len=Math.hypot(dx,dz);if(len>1){dx/=len;dz/=len;}
 let x=p.x+dx*speed*dt,z=p.z+dz*speed*dt;
 let target=sampleHeight(meta,heights,x,z);
 if(target===null)return {...p,edge:true};
 if(target-(ground??target)>Math.max(.45,Math.hypot(dx,dz)*speed*dt*Math.tan(Math.PI/5)))return {...p,blocked:true};
 for(const t of colliders)if(Math.abs(t.x-x)<1.5&&Math.abs(t.z-z)<1.5&&Math.hypot(t.x-x,t.z-z)<t.radius+.28)return {...p,blocked:true};
 return {x,y:Math.max(target+1.68,1.12),z,ground:target,edge:false};
}
