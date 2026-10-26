// A deliberately simple terrestrial crab guild. All rates are experimental game assumptions.
export const CRAB_MAX=240;
export const CRAB_RULES={maturity:18,lifespan:180,searchRadius:14,travel:6,mealEnergy:2.4,metabolism:.6};
export function spawnCrab(world,x,z,age=24,nutrient=.04,external=true){
 if(world.crabs.length>=CRAB_MAX){world.crabStats.capHits++;return null;}
 if(external)world.imported+=nutrient;
 const c={id:world.nextId++,x,z,age,nutrient,energy:4,cooldown:12,heading:world.random()*Math.PI*2,action:'Exploring',meals:0};world.crabs.push(c);return c;
}
export function feedCrab(world,crab,id){
 const i=world.nuts.findIndex(n=>n.id===id);if(i<0)return false;
 const n=world.nuts[i];if(n.state==='floating')return false;if(Math.hypot(crab.x-n.x,crab.z-n.z)>1)return false;
 world.nuts.splice(i,1);world.stats.eaten++;world.crabStats.meals++;
 // A meal is debited once: feces enter local organic matter, retained nutrients enter the crab.
 world.deposit(crab.x,crab.z,n.nutrient*.6);crab.nutrient+=n.nutrient*.4;
 crab.energy=Math.min(6,crab.energy+CRAB_RULES.mealEnergy);crab.meals++;crab.action='Eating coconut';return true;
}
export function stepCrabs(world){
 const snapshot=[...world.crabs];
 // Rotate the starting eater so the first array entry cannot monopolize every month's food.
 const offset=snapshot.length?world.month%snapshot.length:0;
 for(let k=0;k<snapshot.length;k++){
  const c=snapshot[(k+offset)%snapshot.length],fromPatch=world.patchAt(c.x);c.age++;c.cooldown=Math.max(0,c.cooldown-1);c.energy-=CRAB_RULES.metabolism*world.crabAppetite;
  let target=null,best=CRAB_RULES.searchRadius;
  if(c.energy<5)for(const n of world.nuts){const d=Math.hypot(n.x-c.x,n.z-c.z);if(n.state!=='floating'&&d<best&&world.habitat(n.x,n.z)&&world.canCrabTravel(c,n)){best=d;target=n;}}
  let tx,tz;if(target){tx=target.x;tz=target.z;c.action='Seeking coconut';}else{c.heading+=(world.random()-.5)*2;tx=c.x+Math.cos(c.heading)*CRAB_RULES.travel;tz=c.z+Math.sin(c.heading)*CRAB_RULES.travel;c.action='Exploring';}
  const dx=tx-c.x,dz=tz-c.z,d=Math.hypot(dx,dz),travel=Math.min(d,CRAB_RULES.travel);
  if(d>0){const nx=c.x+dx/d*travel,nz=c.z+dz/d*travel;if(world.canCrabTravel(c,{x:nx,z:nz})){c.x=nx;c.z=nz;c.heading=Math.atan2(dx,dz);}}
  const toPatch=world.patchAt(c.x);if(fromPatch!==toPatch){world.migrations++;world.events.push({type:'migration',id:c.id,from:fromPatch,to:toPatch});c.action='Migrating between groves';}
  if(target)feedCrab(world,c,target.id);
  const waste=Math.min(c.nutrient,.0006);c.nutrient-=waste;world.deposit(c.x,c.z,waste);
 }
 const survivors=[];
 for(const c of world.crabs){if(c.energy<=0||c.age>CRAB_RULES.lifespan||c.nutrient<=.003){world.deposit(c.x,c.z,c.nutrient);world.crabStats.died++;if(c.energy<=0)world.crabStats.starved++;}else survivors.push(c);}
 world.crabs=survivors;
 const adults=[...survivors];
 for(const c of adults){if(c.age<CRAB_RULES.maturity||c.energy<3||c.cooldown||c.nutrient<.025)continue;
  const mate=adults.find(q=>q!==c&&q.age>=CRAB_RULES.maturity&&q.energy>=3&&!q.cooldown&&q.nutrient>=.025&&Math.hypot(q.x-c.x,q.z-c.z)<10&&world.canCrabTravel(c,q));
  if(!mate||world.random()>.35)continue;
  const baby=spawnCrab(world,(c.x+mate.x)/2,(c.z+mate.z)/2,0,.024,false);
  if(baby){c.nutrient-=.012;mate.nutrient-=.012;c.energy-=.8;mate.energy-=.8;c.cooldown=mate.cooldown=12;baby.energy=2.4;baby.cooldown=18;world.crabStats.born++;}
 }
}
