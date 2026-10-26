import {createFoliageLOD} from './foliage-lod.js';
import {createLivingWorld} from './living-world.js';
import {createLivingVisuals} from './living-visuals.js';
import * as THREE from './vendor/three.module.js';
import {sampleHeight,movePlayer} from './terrain.js';
const $=id=>document.getElementById(id), canvas=$('world');
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});}catch(error){$('notice').style.display='block';$('notice').textContent='WebGL is unavailable on this browser.';throw error;}
renderer.setPixelRatio(Math.min(devicePixelRatio,matchMedia('(pointer:coarse)').matches?1.3:1.8));
renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.13;
const scene=new THREE.Scene();scene.background=new THREE.Color('#b2d8df');scene.fog=new THREE.FogExp2('#b2d8df',.0018);
scene.add(new THREE.HemisphereLight('#e9f6ff','#797751',2.25));
const sun=new THREE.DirectionalLight('#fff1d0',2.5);sun.position.set(-70,110,45);scene.add(sun);
const camera=new THREE.PerspectiveCamera(65,innerWidth/innerHeight,.1,2600);camera.rotation.order='YXZ';
const aerial=new THREE.OrthographicCamera(-600,600,400,-400,1,2400);aerial.up.set(0,0,-1);
const [meta,buffer]=await Promise.all([fetch('section.json').then(r=>r.json()),fetch('height.f32').then(r=>r.arrayBuffer())]);
const heights=new Float32Array(buffer), terrain=new THREE.BufferGeometry();
const positions=new Float32Array(meta.width*meta.height*3),colors=positions.slice();
const sand=new THREE.Color('#dbc697'),grass=new THREE.Color('#899561'),deep=new THREE.Color('#567f79'),wet=new THREE.Color('#b3ba98');
for(let r=0;r<meta.height;r++)for(let c=0;c<meta.width;c++){
 const i=r*meta.width+c,h=heights[i],x=meta.west_local_m+c*5,z=meta.north_local_z_m+r*5;
 positions.set([x,h,z],i*3);const color=h<-.7?deep.clone().lerp(wet,Math.exp(h/10)):h<.7?sand.clone():sand.clone().lerp(grass,Math.min(1,(h-.7)/.8));
 const variation=.96+.04*Math.sin(x*.63)*Math.cos(z*.57);color.multiplyScalar(variation);colors.set([color.r,color.g,color.b],i*3);
}
const index=new Uint32Array((meta.width-1)*(meta.height-1)*6);let at=0;
for(let r=0;r<meta.height-1;r++)for(let c=0;c<meta.width-1;c++){const a=r*meta.width+c,b=a+1,d=a+meta.width;index.set([a,d,b,b,d,d+1],at);at+=6;}
terrain.setAttribute('position',new THREE.BufferAttribute(positions,3));terrain.setAttribute('color',new THREE.BufferAttribute(colors,3));terrain.setIndex(new THREE.BufferAttribute(index,1));terrain.computeVertexNormals();
scene.add(new THREE.Mesh(terrain,new THREE.MeshLambertMaterial({vertexColors:true})));

function merge(geos){const ps=[],ns=[],cs=[];for(const [geometry,color] of geos){const g=geometry.index?geometry.toNonIndexed():geometry,p=g.getAttribute('position'),n=g.getAttribute('normal');for(let i=0;i<p.count;i++){ps.push(p.getX(i),p.getY(i),p.getZ(i));ns.push(n.getX(i),n.getY(i),n.getZ(i));cs.push(color.r,color.g,color.b);}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(ps,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(ns,3));g.setAttribute('color',new THREE.Float32BufferAttribute(cs,3));return g;}
const brown=new THREE.Color('#8a7956'),leaf=new THREE.Color('#46784a'),lightleaf=new THREE.Color('#6e914e');
function shrub(){return merge([[-.6,.6,0],[.6,.8,0],[0,.5,.6]].map((p,i)=>{const g=new THREE.IcosahedronGeometry(1,0);g.scale(1.1,.9,1);g.translate(...p);return [g,i%2?lightleaf:leaf];}));}
function fern(steps=3){let v=[];for(let i=0;i<7;i++){let a=i*.897;for(let j=0;j<steps;j++){const t=j/steps,u=(j+1)/steps;function p(s,k){return [Math.cos(a)*1.2*s+Math.sin(a)*.22*k*Math.sin(Math.PI*s),.15+.8*Math.sin(s*2.1),Math.sin(a)*1.2*s-Math.cos(a)*.22*k*Math.sin(Math.PI*s)];}v.push(...p(t,-1),...p(u,-1),...p(u,1),...p(t,-1),...p(u,1),...p(t,1));}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.computeVertexNormals();return merge([[g,lightleaf]]);}
const vegetationGroup=new THREE.Group();scene.add(vegetationGroup);const colliders=[];
for(const plant of meta.vegetation)if(plant.type==='pisonia')colliders.push({x:plant.x,z:plant.z,radius:.34});
const foliageLOD=createFoliageLOD(vegetationGroup,meta,shrub,fern);
const living=createLivingWorld(meta,heights),livingVisuals=createLivingVisuals(vegetationGroup,living),staticColliderCount=colliders.length;
let lifePaused=false,lifeAccumulator=0,advancingYear=false;
function refreshLife(){livingVisuals.sync(p);colliders.length=staticColliderCount;colliders.push(...livingVisuals.colliders());$('lifeStats').textContent=`Year ${(living.month/12).toFixed(1)} · ${living.plants.length} palms · ${living.nuts.length} coconuts · ${living.naupaka.length} naupaka · ${living.crabs.length} crabs${living.stats.capHits?' · population limit reached':''}`;}
// Depth color is driven by terrain height, not by satellite colors.
const depthTex=new THREE.DataTexture(heights,meta.width,meta.height,THREE.RedFormat,THREE.FloatType);depthTex.needsUpdate=true;depthTex.magFilter=THREE.LinearFilter;depthTex.minFilter=THREE.LinearFilter;
const waterMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms:{heightmap:{value:depthTex},extent:{value:new THREE.Vector4(meta.west_local_m,meta.north_local_z_m,(meta.width-1)*5,(meta.height-1)*5)},time:{value:0}},vertexShader:`varying vec3 world; uniform float time; void main(){vec3 p=position; vec4 w=modelMatrix*vec4(p,1.); w.y+=.025*sin(w.x*.06+time*.6)*sin(w.z*.04+time*.4);world=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,fragmentShader:`precision highp float; varying vec3 world;uniform sampler2D heightmap;uniform vec4 extent;uniform float time;void main(){vec2 uv=(world.xz-extent.xy)/extent.zw;float h=-30.;if(uv.x>=0.&&uv.y>=0.&&uv.x<=1.&&uv.y<=1.)h=texture2D(heightmap,uv).r;if(h>.04)discard;float d=max(.0,-h);float f=1.-exp(-d/5.5);vec3 col=mix(vec3(.22,.73,.69),vec3(.025,.22,.36),f);float ripple=sin(world.x*.19+time)*sin(world.z*.23-time*.7);col+=.025*ripple;float foam=(1.-smoothstep(.05,.35,d))*.22;col=mix(col,vec3(.92,.96,.82),foam);gl_FragColor=vec4(col,mix(.28,.91,f));}`});
const waterGeometry=new THREE.PlaneGeometry(4400,4400,80,80);waterGeometry.rotateX(-Math.PI/2);const water=new THREE.Mesh(waterGeometry,waterMaterial);water.position.set(meta.west_local_m+(meta.width-1)*2.5,0,meta.north_local_z_m+(meta.height-1)*2.5);scene.add(water);
let p={x:meta.spawn[0],y:meta.spawn[1]+1.68,z:meta.spawn[2]},yaw=0,pitch=-.035,isAerial=false,started=false;
refreshLife();
$('palmMode').onchange=async()=>{const control=$('palmMode');try{await livingVisuals.setPalmMode(control.value);$('palmStatus').textContent=control.value==='geometry'?'Geometry LODs':('Cards '+control.value+'px');}catch(error){control.value='geometry';await livingVisuals.setPalmMode('geometry');$('palmStatus').textContent='Could not load palm bake';console.error(error);}};
 $('findPalm').onclick=()=>{begin();const palm=living.plants.filter(t=>t.growth>=84).sort((a,b)=>Math.hypot(a.x-p.x,a.z-p.z)-Math.hypot(b.x-p.x,b.z-p.z))[0];if(!palm)return;for(const [dx,dz]of [[0,6],[6,0],[0,-6],[-6,0]]){const x=palm.x+dx,z=palm.z+dz;if(!living.habitat(x,z)||colliders.some(t=>Math.hypot(t.x-x,t.z-z)<t.radius+.28))continue;p={x,y:living.heightAt(x,z)+1.68,z};yaw=Math.atan2(-(palm.x-x),-(palm.z-z));pitch=Math.atan2(living.height(palm)-1.68,6);isAerial=false;$('map').textContent='Aerial view';break;}};
 $('lifePause').onclick=()=>{lifePaused=!lifePaused;$('lifePause').textContent=lifePaused?'Resume life':'Pause life';};
$('lifeYear').onclick=async()=>{if(advancingYear)return;advancingYear=true;$('lifeYear').disabled=true;try{for(let i=0;i<12;i++){living.step();refreshLife();await new Promise(resolve=>setTimeout(resolve,0));}}finally{advancingYear=false;$('lifeYear').disabled=false;}};
let naupakaVisit=0;
$('findNaupaka').onclick=()=>{begin();const nearby=living.naupaka.slice().sort((a,b)=>Math.hypot(a.x-meta.spawn[0],a.z-meta.spawn[2])-Math.hypot(b.x-meta.spawn[0],b.z-meta.spawn[2])).slice(0,12);if(!nearby.length)return;for(let attempt=0;attempt<nearby.length;attempt++){const shrub=nearby[naupakaVisit++%nearby.length];let placed=false;for(const [dx,dz]of [[0,3],[3,0],[0,-3],[-3,0]]){const x=shrub.x+dx,z=shrub.z+dz;if(!living.habitat(x,z)||colliders.some(t=>Math.hypot(t.x-x,t.z-z)<t.radius+.28))continue;p={x,y:living.heightAt(x,z)+1.68,z};yaw=Math.atan2(-(shrub.x-x),-(shrub.z-z));pitch=Math.atan2(1.2*(.08+.92*Math.min(1,shrub.growth/48))*shrub.scale-1.68,3);isAerial=false;$('map').textContent='Aerial view';placed=true;break;}if(placed)break;}};
$('findCrab').onclick=()=>{begin();const c=living.crabs.slice().sort((a,b)=>Math.hypot(a.x-p.x,a.z-p.z)-Math.hypot(b.x-p.x,b.z-p.z))[0];if(!c){$('lifeStats').textContent+=' · no surviving crabs';return;}for(const [dx,dz] of [[0,2],[2,0],[0,-2],[-2,0]]){const x=c.x+dx,z=c.z+dz;if(!living.habitat(x,z)||colliders.some(t=>Math.hypot(t.x-x,t.z-z)<t.radius+.28))continue;p={x,y:living.heightAt(x,z)+1.68,z};yaw=Math.atan2(-(c.x-x),-(c.z-z));pitch=-.5;isAerial=false;$('map').textContent='Aerial view';break;}};
let keys=new Set(),lookId=null,lastX=0,lastY=0,stickId=null,stickOrigin={x:0,y:0},joy={x:0,y:0};
function begin(){started=true;$('intro').style.display='none';}
$('enter').onclick=begin;
$('reset').onclick=()=>{p={x:meta.spawn[0],y:meta.spawn[1]+1.68,z:meta.spawn[2]};yaw=0;pitch=-.035;isAerial=false;$('map').textContent='Aerial view';};
$('map').onclick=()=>{isAerial=!isAerial;$('map').textContent=isAerial?'Back to walking':'Aerial view';};
document.querySelectorAll('[data-point]').forEach(b=>b.onclick=()=>{begin();const t=meta.landmarks[b.dataset.point];p={x:t[0],y:t[1]+1.68,z:t[2]};isAerial=false;pitch=-.04;yaw=b.dataset.point==='south'?Math.PI:0;$('map').textContent='Aerial view';});
$('trees').onclick=()=>{vegetationGroup.visible=!vegetationGroup.visible;$('trees').textContent='Trees: '+(vegetationGroup.visible?'on':'off');};
addEventListener('keydown',e=>{if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();keys.add(e.code);});addEventListener('keyup',e=>keys.delete(e.code));
addEventListener('blur',()=>{keys.clear();joy={x:0,y:0};lookId=null;stickId=null;$('stick').style.transform='';});
canvas.addEventListener('pointerdown',e=>{begin();lookId=e.pointerId;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',e=>{if(e.pointerId!==lookId)return;yaw-=(e.clientX-lastX)*.003;pitch=Math.max(-1.35,Math.min(1.35,pitch-(e.clientY-lastY)*.0025));lastX=e.clientX;lastY=e.clientY;});
for(const event of ['pointerup','pointercancel'])canvas.addEventListener(event,e=>{if(e.pointerId===lookId)lookId=null;});
canvas.addEventListener('contextmenu',e=>e.preventDefault());
const joystick=$('joystick');joystick.addEventListener('pointerdown',e=>{begin();stickId=e.pointerId;const b=joystick.getBoundingClientRect();stickOrigin={x:b.left+55,y:b.top+55};joystick.setPointerCapture(e.pointerId);updateStick(e);});
function updateStick(e){if(e.pointerId!==stickId)return;let x=e.clientX-stickOrigin.x,y=e.clientY-stickOrigin.y;const n=Math.max(1,Math.hypot(x,y)/38);x/=n;y/=n;joy={x:x/38,y:y/38};$('stick').style.transform=`translate(${x}px,${y}px)`;}
joystick.addEventListener('pointermove',updateStick);for(const event of ['pointerup','pointercancel'])joystick.addEventListener(event,()=>{stickId=null;joy={x:0,y:0};$('stick').style.transform='';});
function resize(){renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();const w=(meta.width-1)*5,h=(meta.height-1)*5,aspect=innerWidth/innerHeight;const v=Math.max(h*.58,w/(2*aspect)*1.08);aerial.left=-v*aspect;aerial.right=v*aspect;aerial.top=v;aerial.bottom=-v;aerial.updateProjectionMatrix();aerial.position.set(meta.west_local_m+w/2,900,meta.north_local_z_m+h/2);aerial.lookAt(aerial.position.x,0,aerial.position.z);}
addEventListener('resize',resize);resize();
let last=performance.now(),seconds=0,frames=0,elapsed=0,fps=0;
function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;seconds+=dt;frames++;elapsed+=dt;
 if(started&&!isAerial){const forward=(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0)-joy.y;const right=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0)+joy.x;const dx=-Math.sin(yaw)*forward+Math.cos(yaw)*right,dz=-Math.cos(yaw)*forward-Math.sin(yaw)*right;p=movePlayer(meta,heights,p,dx,dz,dt,keys.has('ShiftLeft')||keys.has('ShiftRight'),vegetationGroup.visible?colliders:[]);if(p.edge){$('notice').textContent='End of the loaded terrain patch · more island continues east';$('notice').style.display='block';}else $('notice').style.display='none';}
 if(started&&!lifePaused&&!advancingYear){lifeAccumulator+=dt*Number($('lifeSpeed').value)/60;while(lifeAccumulator>=1){living.step();lifeAccumulator--;refreshLife();}}
 foliageLOD.update(p,dt);livingVisuals.update(p,dt,!started||lifePaused||advancingYear,Number($('lifeSpeed').value));
 camera.position.set(p.x,p.y,p.z);camera.rotation.set(pitch,yaw,0);waterMaterial.uniforms.time.value=seconds;
 scene.fog.density=isAerial?.00015:.0014;renderer.render(scene,isAerial?aerial:camera);
 if(elapsed>.75){fps=Math.round(frames/elapsed);frames=0;elapsed=0;const depth=sampleHeight(meta,heights,p.x,p.z);$('location').textContent=`${isAerial?'Aerial overview':depth<-.7?'In the water':Math.abs(p.z-meta.landmarks.forest[2])<18?'Forest crossing':p.z<meta.landmarks.forest[2]?'North shore':'South shore'} · ${fps} FPS`;$('stats').textContent=`${renderer.info.render.triangles.toLocaleString()} triangles · ${renderer.info.render.calls} draws · living island`;}
 requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
window.cooperTest={meta,life:()=>living.summary(),sampleHeight:(x,z)=>sampleHeight(meta,heights,x,z),get state(){return {...p,yaw,pitch,isAerial,fps,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles};},ready:true,setView(name){document.querySelector(`[data-point="${name}"]`).click();}};

