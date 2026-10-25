const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),src=path.join(root,'browser/foliage-bake'),dest=path.join(root,'_site/foliage-bake');fs.mkdirSync(dest,{recursive:true});
for(const file of ['index.html','style.css','app.js','cards.js','atlas.json',...['64','128','256'].flatMap(r=>['albedo','normal'].map(k=>`leaf-${k}-${r}.png`))])fs.copyFileSync(path.join(src,file),path.join(dest,file));
const read=file=>fs.readFileSync(path.join(root,file),'utf8'),sources={core:read('browser/cooper-west/vendor/three.core.js'),three:read('browser/cooper-west/vendor/three.module.js'),tree:read('browser/cooper-west/tree-forms.js'),cards:read('browser/foliage-bake/cards.js'),app:read('browser/foliage-bake/app.js').replace("fetch('atlas.json').then(r=>r.json())",'Promise.resolve('+read('browser/foliage-bake/atlas.json').trim()+')')},assets={};
for(const resolution of [64,128,256])for(const kind of ['albedo','normal']){const file=`leaf-${kind}-${resolution}.png`;assets[file]='data:image/png;base64,'+fs.readFileSync(path.join(src,file)).toString('base64');}
const bundle=Buffer.from(JSON.stringify(sources)).toString('base64'),loader=`<script type="module">
try{
window.foliageBakeAssets=JSON.parse(document.getElementById('bakedAssets').textContent);
const sources=JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(document.getElementById('bakeSources').textContent),c=>c.charCodeAt(0))));
const url=source=>URL.createObjectURL(new Blob([source],{type:'text/javascript'})),core=url(sources.core),three=url(sources.three.replaceAll("'./three.core.js'",JSON.stringify(core)));
const tree=url(sources.tree.replace("'./vendor/three.module.js'",JSON.stringify(three))),cards=url(sources.cards.replace("'../cooper-west/vendor/three.module.js'",JSON.stringify(three)));
const app=url(sources.app.replace("'../cooper-west/vendor/three.module.js'",JSON.stringify(three)).replace("'../cooper-west/tree-forms.js'",JSON.stringify(tree)).replace("'./cards.js'",JSON.stringify(cards)));
await import(app);
}catch(e){document.getElementById('error').style.display='block';document.getElementById('error').textContent='Unable to start texture test: '+e.message;console.error(e);}
</script>`;
const html=read('browser/foliage-bake/index.html').replace('<link rel="stylesheet" href="style.css">','<style>'+read('browser/foliage-bake/style.css')+'</style>').replace('<script type="module" src="app.js"></script>',`<script type="application/json" id="bakedAssets">${JSON.stringify(assets)}</script><script type="application/octet-stream" id="bakeSources">${bundle}</script>`+loader);
fs.writeFileSync(path.join(dest,'Foliage-Texture-Bake-AB.html'),html);console.log('Built foliage texture-bake A/B test');
