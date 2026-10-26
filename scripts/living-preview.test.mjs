import {createFoliageLOD} from '../browser/cooper-west/foliage-lod.js';
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import * as THREE from '../browser/cooper-west/vendor/three.module.js';import {sampleHeight,movePlayer} from '../browser/cooper-west/terrain.js';import {createLivingWorld} from '../browser/cooper-west/living-world.js';import {createLivingVisuals} from '../browser/cooper-west/living-visuals.js';
test('walking app starts and its ecology controls advance the shared world',async()=>{
 const meta=JSON.parse(fs.readFileSync(new URL('../browser/cooper-west/section.json',import.meta.url))),bytes=fs.readFileSync(new URL('../browser/cooper-west/height.f32',import.meta.url));
 class Element{constructor(){this.style={};this.dataset={};this.value='1';this.textContent='';}addEventListener(){}setPointerCapture(){}getBoundingClientRect(){return{left:0,top:0}}}
 const els=new Map(),get=id=>{if(!els.has(id))els.set(id,new Element());return els.get(id)};
 class Renderer{constructor(){this.info={render:{triangles:0,calls:0}}}setSize(){}setPixelRatio(){}render(){}}
 const context={THREE:{...THREE,WebGLRenderer:Renderer},createLivingWorld,createLivingVisuals,createFoliageLOD,sampleHeight,movePlayer,window:{},document:{getElementById:get,querySelectorAll:()=>[]},fetch:async name=>({json:async()=>meta,arrayBuffer:async()=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)}),innerWidth:1400,innerHeight:900,devicePixelRatio:1,matchMedia:()=>({matches:false}),addEventListener(){},requestAnimationFrame(){},performance,setTimeout,console};vm.createContext(context);
 const source=fs.readFileSync(new URL('../browser/cooper-west/app.js',import.meta.url),'utf8').replace(/^import .*;\r?\n/gm,'');await vm.runInContext('(async()=>{'+source+';window.testFrame=frame;})()',context);
 assert(context.window.cooperTest.ready);assert(context.window.cooperTest.life().crabs>0);get('enter').onclick();get('findCrab').onclick();assert(context.window.cooperTest.state.pitch<-.1);
 const before=context.window.cooperTest.life().month;await get('lifeYear').onclick();assert.equal(context.window.cooperTest.life().month,before+12);
 const now=performance.now();get('lifeSpeed').value='100';for(let i=0;i<15;i++)context.window.testFrame(now+i*50);assert(context.window.cooperTest.life().month>=before+13);
 get('lifePause').onclick();const paused=context.window.cooperTest.life().month;for(let i=15;i<40;i++)context.window.testFrame(now+i*50);assert.equal(context.window.cooperTest.life().month,paused);
});
