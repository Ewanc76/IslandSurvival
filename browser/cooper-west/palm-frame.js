export function smooth(a,b,x){const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);}
export function palmCrownHeight(growth,stemHeight){return .10+smooth(30,84,growth)*(stemHeight-.10);}
// Exact top of a cylinder rotated about Z and then Y, rooted at (x,0,z).
export function palmFrame(x,z,h,phase){const tilt=-Math.sin(phase)*.03,s=Math.sin(tilt),c=Math.cos(tilt);return{x:x-s*h*Math.cos(phase),y:c*h,z:z+s*h*Math.sin(phase),tilt};}
