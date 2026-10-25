const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../browser/cooper-west'),out=path.resolve(__dirname,'../_site/cooper-west/Cooper-West-Living-Island.html');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
let app=read('app.js').replace("fetch('section.json').then(r=>r.json())",'Promise.resolve('+read('section.json').trim()+')').replace("fetch('height.f32').then(r=>r.arrayBuffer())","Promise.resolve(Uint8Array.from(atob('"+fs.readFileSync(path.join(root,'height.f32')).toString('base64')+"'),c=>c.charCodeAt(0)).buffer)");
const sources={core:read('vendor/three.core.js'),three:read('vendor/three.module.js'),terrain:read('terrain.js'),crabs:read('../ecology/crabs.js'),ecology:read('../ecology/ecology.js'),world:read('living-world.js'),visuals:read('living-visuals.js'),lod:read('lod.js'),treeForms:read('tree-forms.js'),foliage:read('foliage-lod.js'),app};
const bundle=Buffer.from(JSON.stringify(sources)).toString('base64');
const loader=`<script type="module">
try{
const s=JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(document.getElementById('islandSources').textContent),c=>c.charCodeAt(0))));
const url=s=>URL.createObjectURL(new Blob([s],{type:'text/javascript'}));
const core=url(s.core),three=url(s.three.replaceAll("'./three.core.js'",JSON.stringify(core))),terrain=url(s.terrain),crabs=url(s.crabs);
const lod=url(s.lod),treeForms=url(s.treeForms.replace("'./vendor/three.module.js'",JSON.stringify(three)));
const foliage=url(s.foliage.replace("'./vendor/three.module.js'",JSON.stringify(three)).replace("'./tree-forms.js'",JSON.stringify(treeForms)).replace("'./lod.js'",JSON.stringify(lod)));
const ecology=url(s.ecology.replace("'./crabs.js'",JSON.stringify(crabs)));
const world=url(s.world.replace("'../ecology/ecology.js'",JSON.stringify(ecology)).replace("'../ecology/crabs.js'",JSON.stringify(crabs)).replace("'./terrain.js'",JSON.stringify(terrain)));
const visuals=url(s.visuals.replace("'./lod.js'",JSON.stringify(lod)).replace("'./vendor/three.module.js'",JSON.stringify(three)).replace("'../ecology/crabs.js'",JSON.stringify(crabs)));
const app=url(s.app.replace("'./foliage-lod.js'",JSON.stringify(foliage)).replace("'./vendor/three.module.js'",JSON.stringify(three)).replace("'./terrain.js'",JSON.stringify(terrain)).replace("'./living-world.js'",JSON.stringify(world)).replace("'./living-visuals.js'",JSON.stringify(visuals)));
await import(app);
}catch(e){document.getElementById('notice').style.display='block';document.getElementById('notice').textContent='Unable to start island: '+e.message;console.error(e);}
</script>`;
const html=read('index.html').replace('<link rel="stylesheet" href="style.css">','<style>'+read('style.css')+'</style>').replace('<script type="module" src="app.js"></script>','<script type="application/octet-stream" id="islandSources">'+bundle+'</script>'+loader);
fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,html);console.log('Built self-contained living-island HTML');
