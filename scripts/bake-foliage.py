"""Bake albedo/alpha and object-space normals from a serialized treeVariant(802) leaf mesh.
Input: JSON attributes position, normal, color. Output: 64/128/256 px tiles, 36 twig clusters x 3 views.
Uses NumPy and Pillow for an offline orthographic z-buffer rasterization; no generated imagery.
"""
import json,sys,io,os,hashlib
from pathlib import Path
import numpy as np
from PIL import Image
source=json.loads(Path(sys.argv[1]).read_text());out=Path(sys.argv[2]);out.mkdir(parents=True,exist_ok=True)
pos=np.array(source['position']).reshape(-1,3);norm=np.array(source['normal']).reshape(-1,3);col=np.array(source['color']).reshape(-1,3)
clusters=[]
# 12 leaves per twig, four triangles per leaf, three vertices per triangle.
for i in range(0,len(pos),144):
 p=pos[i:i+144];lo=p.min(axis=0);hi=p.max(axis=0);clusters.append({'lo':lo.tolist(),'hi':hi.tolist(),'start':i})
metadata={'sourceSHA256':hashlib.sha256(b''.join(np.array(source[k],dtype='<f4').tobytes() for k in ['position','normal','color'])).hexdigest(),'variantSeed':802,'clusterCount':len(clusters),'views':[[0,1,2],[2,1,0],[0,2,1]],'columns':16,'rows':8,'clusters':clusters,'resolutions':[],'sourceLeafTriangles':len(pos)//3,'cardLeafTriangles':len(clusters)*6}
for tile in [64,128,256]:
 pad=tile//16;inner=tile-2*pad;w,h=tile*16,tile*8
 rgba=np.zeros((h,w,4),dtype=np.uint8);normal_rgba=np.zeros_like(rgba);opaque=0
 for cluster_index,c in enumerate(clusters):
  start=c['start'];p=pos[start:start+144];n=norm[start:start+144];colors=col[start:start+144];lo=np.array(c['lo']);hi=np.array(c['hi'])
  for view,(u,v,depth) in enumerate(metadata['views']):
   slot=cluster_index*3+view;left=(slot%16)*tile;top=(slot//16)*tile;zbuf=np.full((tile,tile),-np.inf)
   projected=np.stack([pad+(p[:,u]-lo[u])/max(1e-8,hi[u]-lo[u])*inner,pad+(hi[v]-p[:,v])/max(1e-8,hi[v]-lo[v])*inner],axis=1)
   for triangle in range(0,144,3):
    abc=projected[triangle:triangle+3];xmin=max(pad,int(np.floor(abc[:,0].min())));xmax=min(tile-pad-1,int(np.ceil(abc[:,0].max())));ymin=max(pad,int(np.floor(abc[:,1].min())));ymax=min(tile-pad-1,int(np.ceil(abc[:,1].max())))
    if xmin>xmax or ymin>ymax:continue
    ax,ay=abc[0];bx,by=abc[1];cx,cy=abc[2];den=(by-cy)*(ax-cx)+(cx-bx)*(ay-cy)
    if abs(den)<1e-9:continue
    yy,xx=np.mgrid[ymin:ymax+1,xmin:xmax+1];px=xx+.5;py=yy+.5;a=((by-cy)*(px-cx)+(cx-bx)*(py-cy))/den;b=((cy-ay)*(px-cx)+(ax-cx)*(py-cy))/den;d=1-a-b;weights=np.stack([a,b,d],axis=-1)
    zz=np.sum(weights*p[triangle:triangle+3,depth],axis=-1);mask=(a>=0)&(b>=0)&(d>=0)&(zz>zbuf[yy,xx])
    if not mask.any():continue
    xx=xx[mask];yy=yy[mask];weights=weights[mask];zbuf[yy,xx]=zz[mask];color=weights@colors[triangle:triangle+3];normal=weights@n[triangle:triangle+3];normal/=np.maximum(1e-8,np.linalg.norm(normal,axis=1,keepdims=True))
    rgba[top+yy,left+xx,:3]=np.clip(np.rint(color*255),0,255).astype('uint8');rgba[top+yy,left+xx,3]=255
    normal_rgba[top+yy,left+xx,:3]=np.clip(np.rint((normal*.5+.5)*255),0,255).astype('uint8');normal_rgba[top+yy,left+xx,3]=255
 # Dilate RGB into transparent edge texels, keeping alpha unchanged, for clean filtered edges.
 for image in [rgba,normal_rgba]:
  known=image[:,:,3]>0
  for _ in range(pad):
   additions=np.zeros_like(known)
   for dy,dx in [(1,0),(-1,0),(0,1),(0,-1)]:
    neighbour=np.roll(known,(dy,dx),(0,1));select=~known&~additions&neighbour;shift=np.roll(image,(dy,dx),(0,1));image[select,:3]=shift[select,:3];additions|=select
   known|=additions
 for kind,array in [('albedo',rgba),('normal',normal_rgba)]:
  stream=io.BytesIO();Image.fromarray(array).save(stream,format='PNG');data=stream.getvalue();Image.open(io.BytesIO(data)).verify();target=out/f'leaf-{kind}-{tile}.png';temp=target.with_suffix('.tmp');temp.write_bytes(data);os.replace(temp,target)
 metadata['resolutions'].append({'tile':tile,'padding':pad,'width':w,'height':h,'opaquePixels':int((rgba[:,:,3]>0).sum()),'estimatedGpuBytesWithMipmaps':int(w*h*4*2*4/3)})
 print('Baked',tile,'px tiles:',w,'x',h,'opaque pixels',metadata['resolutions'][-1]['opaquePixels'])
(out/'atlas.json').write_text(json.dumps(metadata,indent=2)+'\n')
