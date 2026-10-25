import {CANOPY_SHAPES} from './canopy-shapes.js';
// Approximate diffuse light through actual rendered twig-cluster footprints.
// Optical density is a game assumption, not measured leaf-area data.
export function createCanopyLight(meta){
 const bins=new Map(),cache=new Map();
 meta.vegetation.forEach((p,index)=>{if(p.type!=='pisonia')return;const cs=Math.cos(p.rotation),sn=Math.sin(p.rotation);
  for(const [x,y,z,rx,ry,rz] of CANOPY_SHAPES[index%3]){
   const c={x:p.x+(x*cs+z*sn)*p.scale,z:p.z+(z*cs-x*sn)*p.scale,y:p.y+y*p.scale,rx:Math.max(.15,rx*p.scale),ry:Math.max(.1,ry*p.scale),rz:Math.max(.15,rz*p.scale),cs,sn};const r=Math.hypot(c.rx,c.rz);
   for(let ix=Math.floor((c.x-r)/8);ix<=Math.floor((c.x+r)/8);ix++)for(let iz=Math.floor((c.z-r)/8);iz<=Math.floor((c.z+r)/8);iz++){const key=ix+','+iz;if(!bins.has(key))bins.set(key,[]);bins.get(key).push(c);}
  }
 });
 return (x,z,height)=>{const ix=Math.floor(x/2),iz=Math.floor(z/2),iy=Math.floor(height*2),key=ix+','+iz+','+iy;if(cache.has(key))return cache.get(key);
  const sx=ix*2+1,sz=iz*2+1,sy=iy*.5+.25;let light=1;
  for(const c of bins.get(Math.floor(sx/8)+','+Math.floor(sz/8))||[]){if(sy>=c.y+c.ry)continue;const dx=sx-c.x,dz=sz-c.z,lx=dx*c.cs-dz*c.sn,lz=dx*c.sn+dz*c.cs,r2=(lx/c.rx)**2+(lz/c.rz)**2;if(r2>=1)continue;const coverage=Math.sqrt(1-r2),vertical=Math.min(1,(c.y+c.ry-sy)/(2*c.ry));light*=1-.52*coverage*vertical;}
  light=Math.max(.005,light);cache.set(key,light);return light;
 };
}
