// Hysteresis keeps an entity in its current level near a distance boundary.
export function lodBand(distance,previous=-1,bounds=[30,60,90],hysteresis=3){
 if(previous>=0){const lo=previous===0?-Infinity:bounds[previous-1]-hysteresis,hi=previous===bounds.length?Infinity:bounds[previous]+hysteresis;if(distance>=lo&&distance<hi)return previous;}
 let level=0;while(level<bounds.length&&distance>=bounds[level])level++;return level;
}
export function uploadInstances(mesh,count){mesh.count=count;mesh.instanceMatrix.clearUpdateRanges();if(count){mesh.instanceMatrix.addUpdateRange(0,count*16);mesh.instanceMatrix.needsUpdate=true;}}
