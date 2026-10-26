// Experimental monthly game rules. Rates are tunable assumptions, not field measurements.
export const NAUPAKA_RULES=Object.freeze({maturity:24,lifespan:360,germination:3,seedExpiry:18,fruitInterval:6,seedN:.003,capacity:2400});
export function naupakaSize(p){return .08+.92*Math.min(1,Math.max(0,p.growth)/48);}
export function naupakaStage(p){return p.growth<6?'Seedling':p.growth<24?'Juvenile':p.age>300?'Old shrub':'Mature shrub';}
export function installNaupaka(world,sites=[]){
 const w=world;w.naupaka=[];w.naupakaSeeds=[];w.naupakaStats={born:0,died:0,failed:0,fruit:0,capHits:0};
 // Separate deterministic stream prevents shrub rendering/initialization from consuming palm RNG.
 let seed=190731;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 w.addNaupaka=(x,z,age=0,growth=age,nutrient=null,scale=1,parent=null,fromSeed=false)=>{if(w.naupaka.length+(fromSeed?0:w.naupakaSeeds.length)>=NAUPAKA_RULES.capacity){w.naupakaStats.capHits++;return null;}if(!w.habitat(x,z)||!w.soilAt(x,z))return null;const stock=nutrient??(.025+Math.min(age,120)*.001);if(nutrient===null)w.imported+=stock;const p={id:w.nextId++,x,z,age,growth,nutrient:stock,scale,phase:random()*Math.PI*2,health:1,fruitClock:Math.floor(random()*6),light:1};w.naupaka.push(p);return p;};
 w.removeNaupaka=id=>{const i=w.naupaka.findIndex(p=>p.id===id);if(i<0)return false;const [p]=w.naupaka.splice(i,1);w.deposit(p.x,p.z,p.nutrient);w.naupakaStats.died++;return true;};
 w.addNaupakaSeed=(x,z,parent=null,nutrient=NAUPAKA_RULES.seedN,external=true)=>{if(w.naupaka.length+w.naupakaSeeds.length>=NAUPAKA_RULES.capacity){w.naupakaStats.capHits++;return null;}if(external)w.imported+=nutrient;const s={id:w.nextId++,x,z,parent,nutrient,age:0};w.naupakaSeeds.push(s);return s;};
 let spatial=new Map();const key=(x,z)=>Math.floor(x/4)+','+Math.floor(z/4);
 function buildIndex(){spatial=new Map();for(const p of w.naupaka){const k=key(p.x,p.z);if(!spatial.has(k))spatial.set(k,[]);spatial.get(k).push(p);}}
 function lightAt(p){const x=Math.floor(p.x/4),z=Math.floor(p.z/4);let shade=0;for(let i=x-1;i<=x+1;i++)for(let j=z-1;j<=z+1;j++)for(const q of spatial.get(i+','+j)||[]){if(q.id===p.id||q.growth<p.growth)continue;const distance=Math.hypot(p.x-q.x,p.z-q.z);if(distance<3)shade+=(1-distance/3)*naupakaSize(q)*.6;}
 const ground=w.heightAt?.(p.x,p.z)||0,canopy=w.canopyLightAt?.(p.x,p.z,ground+1.9*naupakaSize(p))??1;
 // Palm neighbourhood shade uses the existing index; shrubs remain below palm crowns.
 const palmShade=w.understoryPalmLight?.(p)??1;return Math.max(.01,1-shade)*canopy*palmShade;
 }
 w.additionalPlantDemand=(requests,demand)=>{buildIndex();for(const p of w.naupaka){p.light=lightAt(p);const cell=w.soilAt(p.x,p.z),want=cell?w.habitat(p.x,p.z)*p.light*cell.moisture*(.003+.005*naupakaSize(p)):0;requests.set(p.id,want);if(cell)demand.set(cell,(demand.get(cell)||0)+want);}};
 w.stepAdditionalPlants=(requests,allocations)=>{
 const survivors=[];
 for(const p of w.naupaka){p.age++;const cell=w.soilAt(p.x,p.z),want=requests.get(p.id)||0,uptake=want*(allocations.get(cell)||0);if(cell)cell.mineral=Math.max(0,cell.mineral-uptake);p.nutrient+=uptake;
 const litter=Math.min(p.nutrient,.0002+.0006*naupakaSize(p));p.nutrient-=litter;w.deposit(p.x,p.z,litter);
 const quality=w.habitat(p.x,p.z)*p.light*(cell?.moisture||0)*(want>0?uptake/want:0);p.growth+=quality;p.health=Math.max(0,Math.min(1,p.health+(quality<.035?-.008:.012)));
 if(!p.health||p.age>NAUPAKA_RULES.lifespan){w.deposit(p.x,p.z,p.nutrient);w.naupakaStats.died++;continue;}
 if(p.growth>=NAUPAKA_RULES.maturity&&++p.fruitClock>=NAUPAKA_RULES.fruitInterval){p.fruitClock=0;for(let k=0;k<3;k++){if(p.nutrient<.015)break;const a=random()*Math.PI*2,r=1+random()*4,s=w.addNaupakaSeed(p.x+Math.cos(a)*r,p.z+Math.sin(a)*r,p.id,NAUPAKA_RULES.seedN,false);if(s){p.nutrient-=s.nutrient;w.naupakaStats.fruit++;}}}survivors.push(p);
 }w.naupaka=survivors;buildIndex();
 const keep=[];for(const s of w.naupakaSeeds){s.age++;const cell=w.soilAt(s.x,s.z),habitat=w.habitat(s.x,s.z);if(s.age>=NAUPAKA_RULES.germination&&cell&&habitat&&random()<habitat*lightAt({...s,growth:0})*cell.moisture*.22){
 // Consume the seed slot before creating its seedling, including at the technical cap.
 const plant=w.addNaupaka(s.x,s.z,0,0,s.nutrient,1,s.parent,true);if(plant){w.naupakaStats.born++;const k=key(plant.x,plant.z);if(!spatial.has(k))spatial.set(k,[]);spatial.get(k).push(plant);continue;}}
 if(s.age>=NAUPAKA_RULES.seedExpiry){w.deposit(s.x,s.z,s.nutrient);w.naupakaStats.failed++;}else keep.push(s);
 }w.naupakaSeeds=keep;
 };
 w.additionalNutrientTotal=()=>w.naupaka.reduce((n,p)=>n+p.nutrient,0)+w.naupakaSeeds.reduce((n,s)=>n+s.nutrient,0);
 const summary=w.summary.bind(w);w.summary=()=>({...summary(),naupaka:w.naupaka.length,naupakaSeeds:w.naupakaSeeds.length,naupakaStats:{...w.naupakaStats}});
 for(const [i,p]of sites.entries())w.addNaupaka(p.x,p.z,30+(i*37)%240,36+(i*13)%36,null,Math.max(.65,Math.min(1.4,p.scale||1)));
 return w;
}