import fs from 'node:fs';import {treeVariant} from '../browser/cooper-west/tree-forms.js';
const [bark,leaves]=treeVariant(802),data=Object.fromEntries(['position','normal','color'].map(key=>[key,Array.from(leaves.getAttribute(key).array)]));fs.writeFileSync(process.argv[2]||'leaf-source.json',JSON.stringify(data));bark.dispose();leaves.dispose();
