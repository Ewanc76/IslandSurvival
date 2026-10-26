const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),out=path.join(root,'_site');
fs.mkdirSync(out,{recursive:true});
fs.copyFileSync(path.join(root,'site/index.html'),path.join(out,'index.html'));
const src=path.join(root,'browser/cooper-west'),dest=path.join(out,'cooper-west');fs.mkdirSync(dest,{recursive:true});
for(const name of ['index.html','app.js','style.css','terrain.js','living-world.js','living-visuals.js','lod.js','tree-forms.js','foliage-lod.js','palm-frame.js','palm-frond.js','palm-card.js','naupaka-visuals.js','palm-bake.json','canopy.js','canopy-shapes.js','height.f32','section.json','provenance.u8'])fs.copyFileSync(path.join(src,name),path.join(dest,name));
for(const name of fs.readdirSync(src).filter(n=>/^palm-frond-.*\.png$/.test(n)))fs.copyFileSync(path.join(src,name),path.join(dest,name));
fs.cpSync(path.join(src,'vendor'),path.join(dest,'vendor'),{recursive:true});
fs.writeFileSync(path.join(out,'.nojekyll'),'');console.log('Built static hub and Cooper West preview in _site');


fs.cpSync(path.join(root,'browser/ecology'),path.join(out,'ecology'),{recursive:true});
require('./build-living-standalone.cjs');
