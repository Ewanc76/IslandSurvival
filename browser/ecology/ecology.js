import {spawnCrab,stepCrabs} from './crabs.js';
// Experimental game rules, not calibrated botany. Months and conserved arbitrary nutrient units.
export const SPECIES=Object.freeze({maturity:84,lifespan:960,germination:5,seedExpiry:18,fruitInterval:4});
export const SCENARIOS=Object.freeze({
 archipelago:{label:'Archipelago: floating coconuts',decay:.012,returnFraction:1,predation:0,rain:1,crabs:12,appetite:1,network:true,migration:false,archipelago:true,flotation:true},
 noFloat:{label:'Same islands, flotation disabled',decay:.012,returnFraction:1,predation:0,rain:1,crabs:12,appetite:1,network:true,migration:false,archipelago:true,flotation:false},
 connected:{label:'Coconut Simulator 2: connected groves',decay:.012,returnFraction:1,predation:0,rain:1,crabs:24,appetite:1,network:true,migration:true},
 isolated:{label:'Same three groves, migration blocked',decay:.012,returnFraction:1,predation:0,rain:1,crabs:24,appetite:1,network:true,migration:false},
 crabs:{label:'Palms + 12 crabs',decay:.012,returnFraction:1,predation:0,rain:1,crabs:12,appetite:1},
 gremlins:{label:'Gremlin trial: 48 hungry crabs',decay:.012,returnFraction:1,predation:0,rain:1,crabs:48,appetite:2},
 crabFree:{label:'Crab-free comparison',decay:.012,returnFraction:1,predation:0,rain:1},
 recycling:{label:'Recycling grove',decay:.012,returnFraction:1,predation:.12,rain:1},
 slow:{label:'Slow decomposition',decay:.001,returnFraction:1,predation:.12,rain:1},
 export:{label:'Nutrients carried away',decay:.012,returnFraction:.15,predation:.12,rain:1},
 hungry:{label:'Heavy seed predation',decay:.012,returnFraction:1,predation:.38,rain:1},
 noSeeds:{label:'All seeds eaten (control)',decay:.012,returnFraction:1,predation:1,rain:1},
 dry:{label:'Dry conditions',decay:.012,returnFraction:1,predation:.12,rain:.35}
});
export class Grove {
 constructor(seed=731,scenario='recycling'){
  if(!SCENARIOS[scenario])throw Error('Unknown scenario');
  this.seed=seed;this.scenario=scenario;this.config={...SCENARIOS[scenario]};this.month=0;this.nextId=1;this.plants=[];this.nuts=[];this.events=[];this.predation=this.config.predation;
  this.stats={born:0,died:0,eaten:0,failed:0,capHits:0};this.capacity=this.config.network?3600:1200;this.imported=0;this.exported=0;this.animals=0;this.extinctionMonth=null;this.crabs=[];this.crabEnabled=!!this.config.crabs;this.crabAppetite=this.config.appetite||1;this.crabStats={born:0,died:0,starved:0,meals:0,capHits:0};
  this.centers=this.config.archipelago?[-360,0,360]:this.config.network?[-60,0,60]:[0];this.minX=this.centers[0]-48;this.maxX=this.centers.at(-1)+48;this.columns=(this.maxX-this.minX)/6;
  this.flotation={launched:0,landed:0,crossIsland:0,germinated:0,lost:0};this.firstPalmArrival=this.centers.map(()=>null);
  this.migrations=0;this.colonizations=0;this.recolonizations=0;this.localCrashes=0;this.patchEver=this.centers.map(()=>false);this.previousCrabs=this.centers.map(()=>0);this.firstArrival=this.centers.map(()=>null);
  this.cells=[];for(let z=-36;z<36;z+=6)for(let x=this.minX;x<this.maxX;x+=6){const land=this.habitat(x+3,z+3)>0;this.cells.push({x:x+3,z:z+3,mineral:land?2:0,organic:land?3:0,moisture:.7});}
  this.imported=this.cells.reduce((n,c)=>n+c.mineral+c.organic,0);this.history=[];this._index=null;
 }
 random(){this.seed=(Math.imul(this.seed,1664525)+1013904223)>>>0;return this.seed/4294967296;}
 habitat(x,z){let quality=0;for(const cx of (this.config.archipelago?[-360,0,360]:this.config.network?[-60,0,60]:[0])){const r=Math.hypot((x-cx)/45,z/34);if(r<.92)quality=Math.max(quality,Math.max(.15,1-r*r*.7));}return quality;}
 patchAt(x){let best=0;for(let i=1;i<this.centers.length;i++)if(Math.abs(x-this.centers[i])<Math.abs(x-this.centers[best]))best=i;return best;}
 landAt(x,z){for(let i=0;i<this.centers.length;i++)if(Math.hypot((x-this.centers[i])/45,z/34)<=1)return i;return -1;}
 floatSeed(n){if(n.state==='floating')return;n.state='floating';n.everFloated=true;n.departurePatch=this.patchAt(n.x);n.seaAge=n.seaAge||0;const cx=this.centers[n.departurePatch],r=Math.hypot((n.x-cx)/45,n.z/34);if(r>0&&this.landAt(n.x,n.z)>=0){n.x=cx+(n.x-cx)/r*1.03;n.z=n.z/r*1.03;}this.flotation.launched++;}
 transportSeeds(){if(!this.config.flotation)return;for(const n of this.nuts){
  if(n.state!=='floating'){const i=this.patchAt(n.x),r=Math.hypot((n.x-this.centers[i])/45,n.z/34);if(this.landAt(n.x,n.z)<0||r>.84&&this.random()<.14)this.floatSeed(n);}
  if(n.state!=='floating')continue;n.seaAge++;
  const dx=24,dz=Math.sin(this.month*Math.PI/6)*2+(this.random()-.5)*2;let arrived=false;
  for(let k=1;k<=24;k++){const x=n.x+dx*k/24,z=n.z+dz*k/24;if(this.habitat(x,z)>0&&this.landAt(n.x,n.z)<0){n.x=x;n.z=z;n.state='ground';n.groundAge=0;this.flotation.landed++;const destination=this.patchAt(x);if(destination!==n.departurePatch){this.flotation.crossIsland++;this.events.push({type:'seed-landfall',id:n.id,from:n.departurePatch,to:destination});}arrived=true;break;}}
  if(!arrived){n.x+=dx;n.z+=dz;}
 }}

 canCrabTravel(from,to){if(this.config.network&&!this.config.migration&&this.patchAt(from.x)!==this.patchAt(to.x))return false;const d=Math.hypot(to.x-from.x,to.z-from.z),n=Math.max(1,Math.ceil(d));for(let i=1;i<=n;i++)if(!this.habitat(from.x+(to.x-from.x)*i/n,from.z+(to.z-from.z)*i/n))return false;return true;}
 patchSummary(){return this.centers.map((cx,index)=>({name:['West','Middle','East'][index],index,cx,plants:this.plants.filter(p=>this.patchAt(p.x)===index).length,crabs:this.crabs.filter(c=>this.patchAt(c.x)===index).length,nuts:this.nuts.filter(n=>this.patchAt(n.x)===index).length,firstArrival:this.firstArrival[index],firstPalmArrival:this.firstPalmArrival[index]}));}
 recordPatchChanges(){const now=this.patchSummary().map(p=>p.crabs);for(let i=0;i<now.length;i++){if(now[i]>0&&this.previousCrabs[i]===0){if(this.events.some(e=>e.type==='migration'&&e.to===i)){if(this.patchEver[i])this.recolonizations++;else this.colonizations++;}this.patchEver[i]=true;if(this.firstArrival[i]===null)this.firstArrival[i]=this.month;}if(now[i]===0&&this.previousCrabs[i]>0)this.localCrashes++;}this.previousCrabs=now;}
 soilAt(x,z){const ix=Math.floor((x-this.minX)/6),iz=Math.floor((z+36)/6);return ix<0||ix>=this.columns||iz<0||iz>=12?null:this.cells[iz*this.columns+ix];}
 deposit(x,z,amount){const cell=this.soilAt(x,z);if(cell&&this.habitat(x,z)>0)cell.organic+=amount;else this.exported+=amount;}
 addPalm(x,z,age=0,parent=null,nutrient=null){const stock=nutrient??(.04+age*.004);if(nutrient===null)this.imported+=stock;
  const p={id:this.nextId++,x,z,age,growth:age,health:1,nutrient:stock,parent,phase:this.random()*6.28,fruitClock:Math.floor(this.random()*4),light:1,soilFactor:1};this.plants.push(p);this._index=null;return p;}
 addNut(x,z,parent=null,nutrient=.02,external=true){if(this.plants.length+this.nuts.length>=this.capacity){this.stats.capHits++;return null;}if(external)this.imported+=nutrient;const n={id:this.nextId++,x,z,parent,age:0,groundAge:0,nutrient,state:'ground',originPatch:parent===null?this.patchAt(x):this.patchAt(this.plants.find(p=>p.id===parent)?.x??x)};if(this.config.flotation&&!this.habitat(x,z))this.floatSeed(n);this.nuts.push(n);return n;}
 stage(p){return p.growth<12?'Seedling':p.growth<48?'Juvenile':p.growth<SPECIES.maturity?'Young palm':'Mature palm';}
 height(p){return .3+Math.min(17,p.growth/30);}
 buildIndex(){this._index=new Map();for(const p of this.plants){const key=Math.floor(p.x/7)+','+Math.floor(p.z/7);if(!this._index.has(key))this._index.set(key,[]);this._index.get(key).push(p);}}
 competition(p){if(!this._index)this.buildIndex();let shade=0;const ix=Math.floor(p.x/7),iz=Math.floor(p.z/7);
  for(let x=ix-1;x<=ix+1;x++)for(let z=iz-1;z<=iz+1;z++)for(const q of this._index.get(x+','+z)||[]){if(q.id===p.id)continue;const d=Math.hypot(p.x-q.x,p.z-q.z);if(d<7&&q.growth>=p.growth)shade+=(1-d/7)*Math.min(1,q.growth/60);}
  return Math.max(.025,1-shade*.65);
 }
 removePalm(id){const i=this.plants.findIndex(p=>p.id===id);if(i<0)return false;const p=this.plants[i];this.deposit(p.x,p.z,p.nutrient);this.plants.splice(i,1);this._index=null;this.stats.died++;return true;}
 eat(n){this.stats.eaten++;const local=n.nutrient*this.config.returnFraction;this.exported+=n.nutrient-local;
  // Aggregate consumers: food becomes feces or enters a retained animal nutrient pool.
  this.deposit(n.x,n.z,local*.6);this.animals+=local*.4;
 }
 introduceCrabs(count=12,patch=0){this.crabEnabled=true;this.predation=0;for(let i=0;i<count;i++){const a=this.random()*Math.PI*2,r=5+this.random()*18;spawnCrab(this,(this.centers[patch]||0)+Math.cos(a)*r,Math.sin(a)*r*.7);}return this.crabs.length;}
 clearCrabs(patch=0){let removed=0;this.crabs=this.crabs.filter(c=>{if(this.patchAt(c.x)!==patch)return true;this.deposit(c.x,c.z,c.nutrient);this.crabStats.died++;removed++;return false;});this.recordPatchChanges();return removed;}
 consumeSeed(id){const i=this.nuts.findIndex(n=>n.id===id);if(i<0)return false;this.eat(this.nuts[i]);this.nuts.splice(i,1);return true;}
 step(){
  this.month++;this.events=[];this._index=null;
  const seasonal=.72+.28*Math.sin(this.month*Math.PI/6);
  for(const c of this.cells){c.moisture=Math.max(.03,Math.min(1,c.moisture*.7+this.config.rain*seasonal*.24));const release=c.organic*this.config.decay*c.moisture;c.organic-=release;c.mineral+=release;}
  // Consumer turnover returns retained nutrients as waste/carcasses at a central habitat patch.
  const turnover=this.animals*.025;this.animals-=turnover;this.deposit(0,0,turnover);
  const lights=new Map(this.plants.map(p=>[p.id,this.competition(p)]));
  // Share finite uptake fairly, rather than starving neighbors by array order.
  const demand=new Map(),requests=new Map();
  for(const p of this.plants){const c=this.soilAt(p.x,p.z);const want=c?this.habitat(p.x,p.z)*lights.get(p.id)*c.moisture*.012:0;requests.set(p.id,want);if(c)demand.set(c,(demand.get(c)||0)+want);}
  this.additionalPlantDemand?.(requests,demand);
  const allocations=new Map();for(const [c,want] of demand)allocations.set(c,Math.min(1,c.mineral/(want||1)));
  const deaths=[];
  for(const p of this.plants){p.age++;p.light=lights.get(p.id);const cell=this.soilAt(p.x,p.z),want=requests.get(p.id),uptake=want*(allocations.get(cell)||0);
   if(cell)cell.mineral=Math.max(0,cell.mineral-uptake);p.nutrient+=uptake;
   const litter=Math.min(p.nutrient,.0008+Math.min(1,p.growth/84)*.0012);p.nutrient-=litter;this.deposit(p.x,p.z,litter);
   p.soilFactor=want>0?uptake/want:0;const quality=this.habitat(p.x,p.z)*p.light*(cell?.moisture||0)*p.soilFactor;
   p.growth+=quality;p.health=Math.min(1,p.health+(quality<.075?-.015:.009));
   if(p.health<=0||p.age>SPECIES.lifespan){deaths.push(p.id);continue;}
   if(p.growth>=SPECIES.maturity&&++p.fruitClock>=SPECIES.fruitInterval){p.fruitClock=0;
    for(let k=0;k<3;k++){if(p.nutrient<.06)break;const a=this.random()*Math.PI*2,r=2+this.random()*7;const n=this.addNut(p.x+Math.cos(a)*r,p.z+Math.sin(a)*r,p.id,.02,false);if(n)p.nutrient-=n.nutrient;}
   }
  }
  for(const id of deaths)this.removePalm(id);
  this.stepAdditionalPlants?.(requests,allocations);
  this.transportSeeds();
  if(this.crabEnabled)stepCrabs(this);
  const keep=[];
  for(const n of this.nuts){n.age++;if(n.state==='floating'){if(n.seaAge>=36||n.age>=72||n.x>this.maxX+48){this.exported+=n.nutrient;this.flotation.lost++;this.stats.failed++;}else keep.push(n);continue;}n.groundAge=(n.groundAge||0)+1;if(!this.crabEnabled&&this.random()<this.predation){this.eat(n);continue;}
   const habitat=this.habitat(n.x,n.z),cell=this.soilAt(n.x,n.z);
   if((n.everFloated?n.groundAge:n.age)>=SPECIES.germination&&habitat>0&&cell){const light=this.competition({...n,growth:0});
    if(this.random()<habitat*light*cell.moisture*.32){const p=this.addPalm(n.x,n.z,0,n.parent,n.nutrient);this.stats.born++;const pi=this.patchAt(n.x);if(this.firstPalmArrival[pi]===null)this.firstPalmArrival[pi]=this.month;if(n.everFloated&&pi!==n.originPatch)this.flotation.germinated++;this.events.push({type:'germination',id:p.id,parent:n.parent});continue;}
   }
   if(n.age>=(n.everFloated?72:SPECIES.seedExpiry)){this.stats.failed++;this.deposit(n.x,n.z,n.nutrient);continue;}keep.push(n);
  }this.nuts=keep;
  if(!this.plants.length&&!this.nuts.length&&this.extinctionMonth===null)this.extinctionMonth=this.month;
  this.recordPatchChanges();
  if(this.month%12===0)this.history.push(this.summary());
 }
 advance(months){if(!Number.isInteger(months)||months<0)throw Error('months must be a nonnegative integer');for(let i=0;i<months;i++)this.step();}
 summary(){const counts={Seedling:0,Juvenile:0,'Young palm':0,'Mature palm':0};for(const p of this.plants)counts[this.stage(p)]++;
  const mineral=this.cells.reduce((n,c)=>n+c.mineral,0),organic=this.cells.reduce((n,c)=>n+c.organic,0),plantN=this.plants.reduce((n,p)=>n+p.nutrient,0),seedN=this.nuts.reduce((n,p)=>n+p.nutrient,0),crabN=this.crabs.reduce((n,c)=>n+c.nutrient,0);
  const additionalPlantN=this.additionalNutrientTotal?.()||0;
  return {additionalPlantN,month:this.month,plants:this.plants.length,nuts:this.nuts.length,...counts,...this.stats,mineral,organic,plantN,seedN,floating:this.nuts.filter(n=>n.state==='floating').length,flotation:{...this.flotation},patches:this.patchSummary(),migrations:this.migrations,colonizations:this.colonizations,recolonizations:this.recolonizations,localCrashes:this.localCrashes,crabs:this.crabs.length,crabN,crabBorn:this.crabStats.born,crabDied:this.crabStats.died,crabStarved:this.crabStats.starved,crabMeals:this.crabStats.meals,crabCapHits:this.crabStats.capHits,animalN:this.animals,exported:this.exported,total:mineral+organic+plantN+seedN+this.animals+crabN+this.exported+additionalPlantN,imported:this.imported,extinctionMonth:this.extinctionMonth};
 }
}
export function createGrove(seed=731,scenario='recycling'){const g=new Grove(seed,scenario);
 if(g.config.archipelago){const cx=g.centers[0];for(let i=0;i<10;i++){const a=i*2.39996,r=8+Math.sqrt(i)*5;g.addPalm(i>=8?cx+37:cx+Math.cos(a)*r,i>=8?(i===8?-7:7):Math.sin(a)*r*.7,180+g.random()*180);}for(let i=0;i<12;i++)g.addNut(cx+(g.random()-.5)*45,(g.random()-.5)*32);g.introduceCrabs(12,0);g.firstPalmArrival[0]=0;g.recordPatchChanges();g.history.push(g.summary());return g;}
 if(g.config.network){for(let patch=0;patch<3;patch++){const cx=g.centers[patch];for(let i=0;i<10;i++){const a=i*2.39996+patch*.7,r=8+Math.sqrt(i)*5;g.addPalm(cx+Math.cos(a)*r,Math.sin(a)*r*.7,130+patch*150+g.random()*130);}for(let i=0;i<12;i++)g.addNut(cx+(g.random()-.5)*45,(g.random()-.5)*32);}g.firstPalmArrival=[0,0,0];g.introduceCrabs(12,0);g.introduceCrabs(12,1);g.recordPatchChanges();g.history.push(g.summary());return g;}
 for(let i=0;i<10;i++){const a=i*2.39996,r=8+Math.sqrt(i)*5;g.addPalm(Math.cos(a)*r,Math.sin(a)*r*.7,160+g.random()*180);}for(let i=0;i<12;i++)g.addNut((g.random()-.5)*45,(g.random()-.5)*32);if(g.config.crabs)g.introduceCrabs(g.config.crabs);g.history.push(g.summary());return g;}
