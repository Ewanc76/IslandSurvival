import * as THREE from '../cooper-west/vendor/three.module.js';
import {treeVariant} from '../cooper-west/tree-forms.js';
import {cardGeometry,vertexShader,fragmentShader} from './cards.js';
const $=id=>document.getElementById(id),canvas=$('world');
try{await start();}catch(error){$('error').style.display='block';$('error').textContent='Unable to start the texture bake test: '+error.message;console.error(error);}
async function start(){
 const atlas=await fetch('atlas.json').then(r=>r.json()),renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
 const dpr=Math.min(devicePixelRatio,1.5);renderer.setPixelRatio(dpr);renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NoToneMapping;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#aacfd0');const camera=new THREE.PerspectiveCamera(52,innerWidth/innerHeight,.1,1600),[barkGeo,leafGeo]=treeVariant(atlas.variantSeed);
 const makeMaterial=cards=>new THREE.ShaderMaterial({vertexShader,fragmentShader,vertexColors:true,side:THREE.DoubleSide,defines:cards?{CARD_FOLIAGE:1}:{},uniforms:{albedoAtlas:{value:null},normalAtlas:{value:null}}});
 const barkMaterial=makeMaterial(false),leafMaterial=makeMaterial(false),cardMaterial=makeMaterial(true),bark=new THREE.InstancedMesh(barkGeo,barkMaterial,1024),polygons=new THREE.InstancedMesh(leafGeo,leafMaterial,1024);
 let cards=new THREE.InstancedMesh(cardGeometry(atlas,128),cardMaterial,1024);for(const mesh of [bark,polygons,cards]){mesh.frustumCulled=false;scene.add(mesh);}
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(1000,1000),new THREE.MeshBasicMaterial({color:'#93946e'}));ground.rotation.x=-Math.PI/2;ground.position.y=-.03;scene.add(ground);
 let textures=[],tile=128,mode='polygons',count=256,radius=85,azimuth=.6,polar=1.12,zoom=1,loading=false,bench=null,lastResults=null;
 for(const option of $('tile').options)if(Number(option.value)*atlas.columns>renderer.capabilities.maxTextureSize)option.disabled=true;
 function invalidate(){lastResults=null;$('results').innerHTML='';$('download').disabled=true;}
 function setMode(next){mode=next;polygons.visible=mode==='polygons';cards.visible=mode==='cards';$('polygons').setAttribute('aria-pressed',String(mode==='polygons'));$('cards').setAttribute('aria-pressed',String(mode==='cards'));updateCost();}
 function populate(){count=Number($('treeCount').value);const side=Math.sqrt(count),dummy=new THREE.Object3D();let seed=9245;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<count;i++){const x=(i%side-(side-1)/2)*8+(random()-.5)*2,z=(Math.floor(i/side)-(side-1)/2)*8+(random()-.5)*2;dummy.position.set(x,0,z);dummy.rotation.set(0,random()*Math.PI*2,0);dummy.scale.setScalar(.8+random()*.4);dummy.updateMatrix();for(const m of [bark,polygons,cards])m.setMatrixAt(i,dummy.matrix);}
  for(const m of [bark,polygons,cards]){m.count=count;m.instanceMatrix.needsUpdate=true;}radius=side*8*.65+5;updateCost();
 }
 function filterTextures(){for(const t of textures){t.minFilter=$('filter').value==='mips'?THREE.LinearMipmapLinearFilter:THREE.NearestFilter;t.magFilter=$('filter').value==='mips'?THREE.LinearFilter:THREE.NearestFilter;t.generateMipmaps=$('filter').value==='mips';t.needsUpdate=true;}}
 async function loadTextures(){loading=true;lock(true);$('progress').textContent='Loading baked atlases…';const nextTile=Number($('tile').value),loader=new THREE.TextureLoader(),names=['albedo','normal'];let loaded=[];
  try{loaded=await Promise.all(names.map(kind=>{const name=`leaf-${kind}-${nextTile}.png`;return loader.loadAsync(window.foliageBakeAssets?.[name]||name);}));for(const t of loaded)t.colorSpace=THREE.NoColorSpace;
   const old=textures;textures=loaded;tile=nextTile;filterTextures();cardMaterial.uniforms.albedoAtlas.value=textures[0];cardMaterial.uniforms.normalAtlas.value=textures[1];cards.geometry.dispose();cards.geometry=cardGeometry(atlas,tile);old.forEach(t=>t.dispose());$('progress').textContent='Drag to orbit. Compare modes, then run the matched camera test.';invalidate();updateCost();
  }catch(e){loaded.forEach(t=>t.dispose());$('progress').textContent='Atlas loading failed: '+e.message;throw e;}finally{loading=false;lock(false);}
 }
 function lock(value){for(const id of ['polygons','cards','treeCount','tile','filter','near','wide','order','benchmark'])$(id).disabled=value;}
 function updateCost(){const r=atlas.resolutions.find(r=>r.tile===tile),coverage=r.opaquePixels/(r.width*r.height)*100,leafTriangles=mode==='polygons'?atlas.sourceLeafTriangles:atlas.cardLeafTriangles;
  $('cost').textContent=`${leafTriangles.toLocaleString()} leaf triangles/tree · ${(count*(leafTriangles+648)).toLocaleString()} tree triangles total. Cards: ${r.width} × ${r.height} atlases, ~${(r.estimatedGpuBytesWithMipmaps/1048576).toFixed(1)} MiB with mipmaps; ${coverage.toFixed(1)}% alpha coverage.`;
 }
 $('polygons').onclick=()=>setMode('polygons');$('cards').onclick=()=>setMode('cards');
 $('treeCount').onchange=()=>{invalidate();populate();};$('tile').onchange=()=>loadTextures().catch(console.error);$('filter').onchange=()=>{filterTextures();invalidate();};
 $('near').onclick=()=>{zoom=.65;polar=1.32;};$('wide').onclick=()=>{zoom=1.3;polar=1.05;};
 let pointer=null;canvas.addEventListener('pointerdown',e=>{if(bench||loading)return;pointer={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);});canvas.addEventListener('pointermove',e=>{if(!pointer||bench)return;azimuth-=(e.clientX-pointer.x)*.007;polar=Math.max(.25,Math.min(1.5,polar+(e.clientY-pointer.y)*.005));pointer={x:e.clientX,y:e.clientY};});for(const event of ['pointerup','pointercancel'])canvas.addEventListener(event,()=>pointer=null);
 canvas.addEventListener('wheel',e=>{e.preventDefault();if(!bench)zoom=Math.max(.4,Math.min(2,zoom+e.deltaY*.001));},{passive:false});
 addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();if(bench)abortBenchmark('Viewport changed; rerun the matched test.');});
 function abortBenchmark(message){bench=null;lock(false);$('progress').textContent=message;}
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&bench)abortBenchmark('Test stopped because the page was hidden.');});
 const stats=values=>{const sorted=values.slice().sort((a,b)=>a-b),sum=values.reduce((a,b)=>a+b,0);return{frames:values.length,averageFPS:values.length/(sum/1000),medianMs:sorted[Math.floor((sorted.length-1)*.5)],p95Ms:sorted[Math.floor((sorted.length-1)*.95)]};};
 $('benchmark').onclick=()=>{if(loading||bench)return;invalidate();bench={order:$('order').value==='AB'?['polygons','cards']:['cards','polygons'],phase:0,phaseStart:performance.now(),samples:[],runs:[],config:{trees:count,tile,filter:$('filter').value,renderWidth:renderer.domElement.width,renderHeight:renderer.domElement.height,pixelRatio:dpr}};lock(true);setMode(bench.order[0]);};
 function recordBenchmark(now,dt){const age=now-bench.phaseStart;if(age>=1000)bench.samples.push(dt);
  $('progress').textContent=`${bench.phase+1}/2 · ${mode==='polygons'?'A · Polygons':'B · Texture cards'} · ${age<1000?'warming up':`measuring ${Math.min(6,(age-1000)/1000).toFixed(1)} / 6 s`}`;
  if(age<7000)return;bench.runs.push({mode,...stats(bench.samples),triangles:renderer.info.render.triangles,drawCalls:renderer.info.render.calls});bench.phase++;
  if(bench.phase<2){bench.samples=[];bench.phaseStart=now;setMode(bench.order[bench.phase]);return;}
  lastResults={experiment:'Foliage texture bake A/B 01',timestamp:new Date().toISOString(),...bench.config,runs:bench.runs,notes:'One-second warmup then six-second repeated camera path per mode. Same tree transforms and bark. No ecology. Compare repeated AB and BA runs; this is a device sample, not a universal result.'};
  $('results').innerHTML='<table><thead><tr><th>Mode</th><th>Avg FPS</th><th>Median ms</th><th>P95 ms</th></tr></thead><tbody>'+bench.runs.map(r=>`<tr><td>${r.mode==='polygons'?'A · Polygons':'B · Cards'}</td><td>${r.averageFPS.toFixed(1)}</td><td>${r.medianMs.toFixed(1)}</td><td>${r.p95Ms.toFixed(1)}</td></tr>`).join('')+'</tbody></table>';
  bench=null;lock(false);$('download').disabled=false;$('progress').textContent='Finished. Repeat in the opposite order to check for warming and throttling effects.';
 }
 $('download').onclick=()=>{if(!lastResults)return;const a=document.createElement('a'),u=URL.createObjectURL(new Blob([JSON.stringify(lastResults,null,2)],{type:'application/json'}));a.href=u;a.download='foliage-bake-results.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);};
 populate();setMode('polygons');await loadTextures();
 let last=performance.now(),windowStart=last,frames=0;
 function frame(now){requestAnimationFrame(frame);const dt=now-last;last=now;if(bench){const t=Math.max(0,now-bench.phaseStart-1000)/6000,angle=t*Math.PI*2+.6,r=radius*(1+.12*Math.sin(t*Math.PI*2));camera.position.set(Math.sin(angle)*r,r*.48,Math.cos(angle)*r);camera.lookAt(0,3,0);}else{const r=radius*zoom;camera.position.set(Math.sin(azimuth)*Math.sin(polar)*r,Math.cos(polar)*r,Math.cos(azimuth)*Math.sin(polar)*r);camera.lookAt(0,3,0);}
  renderer.render(scene,camera);frames++;if(now-windowStart>700){$('live').textContent=`${mode==='polygons'?'A · Polygon leaves':'B · Baked texture cards'} · ${(frames*1000/(now-windowStart)).toFixed(0)} FPS · ${renderer.info.render.triangles.toLocaleString()} triangles · ${renderer.info.render.calls} draws`;frames=0;windowStart=now;}
  if(bench)recordBenchmark(now,dt);
 }
 window.foliageBakeTest={ready:true,configuration:()=>({mode,count,tile}),get results(){return lastResults;}};requestAnimationFrame(frame);
}
