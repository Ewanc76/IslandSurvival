import * as THREE from '../cooper-west/vendor/three.module.js';
// Three fixed orthogonal cards per original twig cluster; no re-randomized canopy.
export function cardGeometry(atlas,tile){const resolution=atlas.resolutions.find(r=>r.tile===tile);if(!resolution)throw Error('Unknown atlas tile size');const positions=[],uvs=[],colors=[];
 atlas.clusters.forEach((cluster,i)=>atlas.views.forEach(([u,v,depth],view)=>{const slot=i*3+view,left=(slot%atlas.columns)*tile+resolution.padding,top=Math.floor(slot/atlas.columns)*tile+resolution.padding,inner=tile-2*resolution.padding;const uv=[[left/resolution.width,1-(top+inner)/resolution.height],[(left+inner)/resolution.width,1-(top+inner)/resolution.height],[(left+inner)/resolution.width,1-top/resolution.height],[left/resolution.width,1-top/resolution.height]];
 const corners=[[0,0],[1,0],[1,1],[0,1]].map(([x,y])=>{const p=cluster.lo.map((a,k)=>(a+cluster.hi[k])/2);p[u]=x?cluster.hi[u]:cluster.lo[u];p[v]=y?cluster.hi[v]:cluster.lo[v];return p;});
 for(const k of [0,1,2,0,2,3]){positions.push(...corners[k]);uvs.push(...uv[k]);colors.push(1,1,1);}
 }));const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.computeVertexNormals();return g;}
export const vertexShader=`
varying vec3 vTint;varying vec3 vNormal;varying vec2 vAtlasUV;varying vec3 vBasisX;varying vec3 vBasisY;varying vec3 vBasisZ;varying float vDistance;
void main(){
 mat4 instance=mat4(1.0);
 #ifdef USE_INSTANCING
 instance=instanceMatrix;
 #endif
 mat3 basis=mat3(modelMatrix)*mat3(instance);vBasisX=normalize(basis[0]);vBasisY=normalize(basis[1]);vBasisZ=normalize(basis[2]);
 vNormal=normalize(basis*normal);vTint=color;vAtlasUV=uv;vec4 p=modelViewMatrix*instance*vec4(position,1.0);vDistance=length(p.xyz);gl_Position=projectionMatrix*p;
}`;
export const fragmentShader=`
uniform sampler2D albedoAtlas;uniform sampler2D normalAtlas;
varying vec3 vTint;varying vec3 vNormal;varying vec2 vAtlasUV;varying vec3 vBasisX;varying vec3 vBasisY;varying vec3 vBasisZ;varying float vDistance;
void main(){vec3 albedo=vTint;vec3 n=normalize(vNormal);
 #ifdef CARD_FOLIAGE
 vec4 sampleColor=texture2D(albedoAtlas,vAtlasUV);if(sampleColor.a<0.5)discard;albedo=sampleColor.rgb;
 vec3 localN=normalize(texture2D(normalAtlas,vAtlasUV).rgb*2.0-1.0);n=normalize(vBasisX*localN.x+vBasisY*localN.y+vBasisZ*localN.z);
 #endif
 vec3 sun=normalize(vec3(-0.45,0.85,0.4));float light=0.58+0.42*abs(dot(n,sun));vec3 shaded=albedo*light;float fog=1.0-exp(-vDistance*vDistance*0.000005);gl_FragColor=vec4(mix(shaded,vec3(0.43,0.65,0.67),fog),1.0);
 #include <colorspace_fragment>
}`;
