import * as THREE from './vendor/three.module.js';
// Bounds include 4 cm transparent padding around the procedural frond.
export const PALM_BAKE_BOUNDS={minX:-.04,maxX:4.340000190734863,minZ:-.7121083521842957,maxZ:.7121083521842957};
export function createPalmCardGeometry(segments=6){
 const b=PALM_BAKE_BOUNDS,positions=[],uv=[];
 const point=(t,side)=>{const x=b.minX+(b.maxX-b.minX)*t,u=Math.max(0,Math.min(1,x/4.3));return [x,Math.sin(u*Math.PI)*.65-u*u*.85,side?b.maxZ:b.minZ];};
 for(let j=0;j<segments;j++){const t=j/segments,u=(j+1)/segments;for(const [a,side]of [[t,0],[t,1],[u,1],[t,0],[u,1],[u,0]]){positions.push(...point(a,side));uv.push(a,side);}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();return g;
}
const palmTextureUrl=name=>name;
const materials=new Map();
export async function loadPalmCardMaterial(width){
 if(![256,512,1024].includes(width))throw Error('Unknown palm bake size');
 if(materials.has(width))return materials.get(width);
 const promise=(async()=>{const loader=new THREE.TextureLoader(),[map,normalMap]=await Promise.all([loader.loadAsync(palmTextureUrl(`palm-frond-${width}-albedo.png`)),loader.loadAsync(palmTextureUrl(`palm-frond-${width}-normal.png`))]);
 map.colorSpace=THREE.SRGBColorSpace;normalMap.colorSpace=THREE.NoColorSpace;
 // Keep alpha cutouts crisp; ordinary alpha mipmaps erase the narrow pinnae.
 for(const tex of [map,normalMap]){tex.generateMipmaps=false;tex.minFilter=THREE.LinearFilter;tex.magFilter=THREE.LinearFilter;}
 const material=new THREE.MeshStandardMaterial({map,normalMap,normalMapType:THREE.ObjectSpaceNormalMap,alphaTest:.5,side:THREE.DoubleSide,roughness:1});
 material.onBeforeCompile=shader=>{
  shader.vertexShader='varying mat3 vPalmNormalBasis;\n'+shader.vertexShader;
  shader.fragmentShader='varying mat3 vPalmNormalBasis;\n'+shader.fragmentShader;
  shader.vertexShader=shader.vertexShader.replace('#include <defaultnormal_vertex>',`#include <defaultnormal_vertex>
 vPalmNormalBasis=normalMatrix;
 #ifdef USE_INSTANCING
 vPalmNormalBasis=normalMatrix*mat3(instanceMatrix);
 #endif`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`normal=normalize(vPalmNormalBasis*(texture2D(normalMap,vNormalMapUv).xyz*2.0-1.0));
 #ifdef DOUBLE_SIDED
 normal*=faceDirection;
 #endif`);
 };
 material.customProgramCacheKey=()=> 'palm-object-normal-instancing-v1';return material;})();
 materials.set(width,promise);try{return await promise;}catch(error){materials.delete(width);throw error;}
}