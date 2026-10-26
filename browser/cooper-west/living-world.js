import {installNaupaka} from '../ecology/naupaka.js';
import {createCanopyLight} from './canopy.js';
import {palmCrownHeight,palmFrame} from './palm-frame.js';
import {Grove} from '../ecology/ecology.js';
import {spawnCrab} from '../ecology/crabs.js';
import {sampleHeight} from './terrain.js';
// Terrain adapter for the same monthly palm/crab solver used in the research lab.
export function createLivingWorld(meta,heights){
 const w=new Grove(731,'crabFree');w.capacity=6000;w.crabEnabled=true;w.predation=0;
 w.heightAt=(x,z)=>sampleHeight(meta,heights,x,z);
 w.habitat=(x,z)=>{const h=w.heightAt(x,z);return h===null||h<.20?0:Math.min(1,.55+h*.2);};
 w.landAt=(x,z)=>w.habitat(x,z)>0?0:-1;
 w.minX=meta.west_local_m;w.minZ=meta.north_local_z_m;
 w.columns=Math.ceil((meta.width-1)*meta.spacing_m/6);w.rows=Math.ceil((meta.height-1)*meta.spacing_m/6);w.maxX=w.minX+w.columns*6;
 w.centers=[w.minX+(meta.width-1)*meta.spacing_m/2];w.cells=[];
 for(let r=0;r<w.rows;r++)for(let c=0;c<w.columns;c++){const x=w.minX+c*6+3,z=w.minZ+r*6+3,land=w.habitat(x,z)>0;w.cells.push({x,z,mineral:land?2:0,organic:land?3:0,moisture:.7});}
 w.soilAt=(x,z)=>{const c=Math.floor((x-w.minX)/6),r=Math.floor((z-w.minZ)/6);return c<0||r<0||c>=w.columns||r>=w.rows?null:w.cells[r*w.columns+c];};
 w.imported=w.cells.reduce((n,c)=>n+c.mineral+c.organic,0);
 const palms=meta.vegetation.filter(p=>p.type==='palm');
 for(const p of palms){const tree=w.addPalm(p.x,p.z,(8.1*p.scale-.3)*30);tree.phase=p.rotation;}
 // Existing coordinate-seeded vegetation remains in place. Young recruits and food are
 // initialized explicitly, not continuously replenished behind the simulation.
 for(let i=0;i<palms.length;i+=3){const p=palms[i],a=p.rotation,x=p.x+Math.cos(a)*2,z=p.z+Math.sin(a)*2;if(w.habitat(x,z))w.addNut(x,z);}
 const near=palms.slice().sort((a,b)=>Math.hypot(a.x-meta.spawn[0],a.z-meta.spawn[2])-Math.hypot(b.x-meta.spawn[0],b.z-meta.spawn[2]));
 for(let i=0;i<12;i++){const p=near[i],x=p.x+2,z=p.z+1;if(w.habitat(x,z))w.addPalm(x,z,[0,9,24,60][i%4],w.plants.find(q=>q.x===p.x&&q.z===p.z)?.id);}
 const sites=[...near.slice(0,8),...palms.filter((_,i)=>i%32===0)];
 for(const p of sites){const x=p.x+1,z=p.z+1;if(w.habitat(x,z))spawnCrab(w,x,z,24);}
 // The static crown map comes from the same form variants used by foliage LOD.
 // Keep tested palm neighbourhood competition; static crowns add shade, not relief.
 const canopyLight=createCanopyLight(meta),baseCompetition=w.competition.bind(w);w.canopyLightAt=canopyLight;
 w.competition=p=>{const g=Math.max(0,p.growth||0),h=palmCrownHeight(g,w.height(p)),top=palmFrame(p.x,p.z,h,p.phase||0),ground=w.heightAt(p.x,p.z)||0;
  return Math.max(.005,baseCompetition(p)*canopyLight(top.x,top.z,ground+top.y+.3));
 };
 w.understoryPalmLight=p=>baseCompetition({...p,growth:0});
 installNaupaka(w,meta.vegetation.filter(p=>p.type==='shrub'));
 // A few explicitly initialized recruits make early growth visible near the starting shore.
 const nearest=w.naupaka.slice().sort((a,b)=>Math.hypot(a.x-meta.spawn[0],a.z-meta.spawn[2])-Math.hypot(b.x-meta.spawn[0],b.z-meta.spawn[2]));
 for(let i=0;i<6&&i<nearest.length;i++){const p=nearest[i];w.addNaupaka(p.x+2,p.z+1,[0,4,12][i%3],[0,4,12][i%3]);}
 w.recordPatchChanges();w.firstPalmArrival=[0];w.history=[w.summary()];return w;
}
