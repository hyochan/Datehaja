/** Import generated pixel artwork: remove the green matte and align interchangeable parts.
 * ART_SHARP=/path/to/sharp node scripts/pack-pixel-avatars.mjs
 * This does not draw or alter faces, poses, or clothing. */
import { createRequire } from 'node:module';
import { mkdir, writeFile, mkdtemp, readdir, rename, rm } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const sharp = require(process.env.ART_SHARP || 'sharp');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, 'assets/agents/pixel-v1');
const destination = resolve(root, 'public/agents/pixel-v1');
await mkdir(destination, { recursive: true });
const output = await mkdtemp(resolve(destination,'.pack-'));
const hair = ['wave', 'crop', 'bob', 'bun', 'buzz'];
const faces = ['gentle', 'bright', 'cool', 'curious', 'blink'];
const outfits = ['cardigan', 'blazer', 'hoodie', 'starlight'];
const manifest = { heads: {}, bodies: {}, accessories: {} };

async function pixels(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const r=data[i],g=data[i+1],b=data[i+2];
    if (g > r + 5 && g > b + 5) { data[i]=data[i+1]=data[i+2]=data[i+3]=0; }
  }
  return { data, w: info.width, h: info.height };
}
function cuts(p, count, horizontal) {
  const length = horizontal ? p.w : p.h, other = horizontal ? p.h : p.w;
  const ink = new Uint32Array(length);
  for (let a=0;a<length;a++) for(let b=0;b<other;b++) {
    const i=horizontal ? b*p.w+a : a*p.w+b;
    if(p.data[i*4+3]>0)ink[a]++;
  }
  const result=[0];
  for(let n=1;n<count;n++) {
    const ideal=length*n/count, radius=length/count*.24;
    let best=Math.round(ideal),score=Infinity;
    for(let x=Math.ceil(ideal-radius);x<ideal+radius;x++) {
      const candidate=ink[x]*10000+Math.abs(x-ideal);
      if(candidate<score){score=candidate;best=x;}
    }
    result.push(best);
  }
  result.push(length);return result;
}
function crop(p,l,t,r,b) {
  const w=r-l,h=b-t,data=Buffer.alloc(w*h*4);
  for(let y=0;y<h;y++) p.data.copy(data,y*w*4,((y+t)*p.w+l)*4,((y+t)*p.w+r)*4);
  return {data,w,h};
}
function bounds(p, predicate=(r,g,b,a)=>a>0) {
  let l=p.w,t=p.h,r=0,b=0,count=0;
  for(let y=0;y<p.h;y++)for(let x=0;x<p.w;x++) {
    const k=(y*p.w+x)*4;
    if(predicate(...p.data.subarray(k,k+4))){l=Math.min(l,x);t=Math.min(t,y);r=Math.max(r,x+1);b=Math.max(b,y+1);count++;}
  }
  if(!count)throw Error('Empty part');return {l,t,r,b,w:r-l,h:b-t,count};
}
function skinRegion(p) {
  const seen=new Uint8Array(p.w*p.h);let best=[];
  const skin=i=>{const k=i*4,r=p.data[k],g=p.data[k+1],b=p.data[k+2];return p.data[k+3]>0&&r>185&&g>115&&b>75&&r>g*1.07&&r>b*1.18;};
  for(let i=0;i<seen.length;i++) {
    if(seen[i]||!skin(i))continue;
    const region=[i];seen[i]=1;
    for(let n=0;n<region.length;n++) {
      const j=region[n],x=j%p.w,y=Math.floor(j/p.w);
      for(const k of [x?j-1:-1,x<p.w-1?j+1:-1,y?j-p.w:-1,y<p.h-1?j+p.w:-1]) {
        if(k>=0&&!seen[k]&&skin(k)){seen[k]=1;region.push(k);}
      }
    }
    if(region.length>best.length)best=region;
  }
  if(best.length<100)throw Error('No stable skin anchor');
  const xs=best.map(i=>i%p.w),ys=best.map(i=>Math.floor(i/p.w));
  const l=Math.min(...xs),r=Math.max(...xs)+1,t=Math.min(...ys),b=Math.max(...ys)+1;
  return {l,r,t,b,w:r-l,h:b-t,count:best.length};
}
function removeGutterFragments(p) {
  const seen=new Uint8Array(p.w*p.h),parts=[];
  for(let i=0;i<seen.length;i++) {
    if(seen[i]||!p.data[i*4+3])continue;
    const part=[i];seen[i]=1;
    for(let n=0;n<part.length;n++) {
      const j=part[n],x=j%p.w,y=Math.floor(j/p.w);
      for(const k of [x?j-1:-1,x<p.w-1?j+1:-1,y?j-p.w:-1,y<p.h-1?j+p.w:-1]) {
        if(k>=0&&!seen[k]&&p.data[k*4+3]){seen[k]=1;part.push(k);}
      }
    }
    parts.push(part);
  }
  parts.sort((a,b)=>b.length-a.length);
  const main=parts[0],xs=main.map(i=>i%p.w),ys=main.map(i=>Math.floor(i/p.w));
  const l=Math.min(...xs)-12,r=Math.max(...xs)+12,t=Math.min(...ys)-12,b=Math.max(...ys)+12;
  for(const part of parts.slice(1)) {
    const distant=part.every(i=>i%p.w<l||i%p.w>r||Math.floor(i/p.w)<t||Math.floor(i/p.w)>b);
    if(part.length<=3||distant)for(const i of part)p.data.fill(0,i*4,i*4+4);
  }
  return p;
}
async function frame(p, name, ratio, anchorX, anchorY, targetX, targetY, height) {
  const box=bounds(p),cut=crop(p,box.l,box.t,box.r,box.b);
  const w=Math.round(cut.w*ratio),h=Math.round(cut.h*ratio);
  const left=Math.round(targetX-(anchorX-box.l)*ratio),top=Math.round(targetY-(anchorY-box.t)*ratio);
  if(left<0||top<0||left+w>320||top+h>height)throw Error(`${name}: part overflow ${left},${top},${w},${h}`);
  const buffer=await sharp(cut.data,{raw:{width:cut.w,height:cut.h,channels:4}}).resize(w,h,{kernel:'nearest'}).png().toBuffer();
  const canvas=await sharp({create:{width:320,height,channels:4,background:'#00000000'}}).composite([{input:buffer,left,top}]).png().toBuffer();
  await writeFile(resolve(output,name+'.png'),canvas);
  return { canvas, left,top,w,h,box };
}
async function packLegs(canvas,name) {
  const {data,info}=await sharp(canvas).raw().toBuffer({resolveWithObject:true});
  const labels=new Uint8Array(info.width*info.height),queue=[];
  const opaque=i=>i>=442*info.width&&i<labels.length&&data[i*4+3]>0;
  const seeds=[130,188].map(targetX=>{
    let best=-1,distance=Infinity;
    for(let y=550;y<640;y++)for(let x=70;x<250;x++) {
      const i=y*info.width+x,d=(x-targetX)**2+(y-600)**2;
      if(opaque(i)&&d<distance){distance=d;best=i;}
    }
    if(best<0)throw Error(name+': missing leg seed');return best;
  });
  if(seeds[0]===seeds[1])throw Error(name+': leg seeds overlap');
  seeds.forEach((seed,index)=>{labels[seed]=index+1;queue.push(seed);});
  // Grow along the actual opaque trouser contours. A vertical rectangle would
  // cut off a slanted trouser edge or a shoe extending across the centerline.
  for(let n=0;n<queue.length;n++) {
    const i=queue[n],x=i%info.width;
    for(const dy of [-1,0,1])for(const dx of [-1,0,1]) {
      if(x+dx<0||x+dx>=info.width)continue;
      const j=i+dy*info.width+dx;
      if(opaque(j)&&!labels[j]){labels[j]=labels[i];queue.push(j);}
    }
  }
  const parts=[Buffer.alloc(data.length),Buffer.alloc(data.length)];
  for(let i=442*info.width;i<labels.length;i++) {
    if(!opaque(i))continue;
    if(!labels[i]) {
      const distance=seed=>(i%info.width-seed%info.width)**2+(Math.floor(i/info.width)-Math.floor(seed/info.width))**2;
      labels[i]=distance(seeds[0])<distance(seeds[1])?1:2;
    }
    data.copy(parts[labels[i]-1],i*4,i*4,i*4+4);
  }
  for(const [index,side] of ['left','right'].entries()) {
    await sharp(parts[index],{raw:{width:info.width,height:info.height,channels:4}}).png().toFile(resolve(output,`${name}-leg-${side}.png`));
  }
}
try {
for(const gender of ['female','male']) {
  const sheet=await pixels(resolve(source,gender+'-heads.png')), ys=cuts(sheet,5,false);
  for(let row=0;row<5;row++) {
    const strip=crop(sheet,0,ys[row],sheet.w,ys[row+1]), xs=cuts(strip,5,true);
    for(let col=0;col<5;col++) {
      const p=removeGutterFragments(crop(strip,xs[col],0,xs[col+1],strip.h)),skin=skinRegion(p);
      const name=`${gender}-${hair[col]}-${faces[row]}`;
      const ratio=98/skin.w;
      const anchorX=(skin.l+skin.r)/2, anchorY=skin.b;
      const result=await frame(p,name,ratio,anchorX,anchorY,160,228,280);
      manifest.heads[name]={skin,ratio,anchorX,anchorY,left:result.left,top:result.top,w:result.w,h:result.h};
    }
  }
  const bodies=await pixels(resolve(source,gender+'-bodies.png')), rows=cuts(bodies,3,false);
  for(let row=0;row<1;row++) {
    const strip=crop(bodies,0,rows[row],bodies.w,rows[row+1]),xs=cuts(strip,4,true);
    for(let col=0;col<4;col++) {
      const p=removeGutterFragments(crop(strip,xs[col],0,xs[col+1],strip.h)),box=bounds(p);
      const neck=bounds(p,(r,g,b,a)=>a>0&&r>160&&g>100&&r>g*1.08&&r>b*1.2);
      // Only pixels at the very top belong to the neck; hands remain below.
      const topSkin=bounds(crop(p,0,0,p.w,Math.min(p.h,box.t+18)),(r,g,b,a)=>a>0&&r>160&&r>g*1.08&&r>b*1.2);
      const name=`${gender}-${outfits[col]}-idle`;
      const result=await frame(p,name,420/box.h,(topSkin.l+topSkin.r)/2,box.t,160,216,660);
      await packLegs(result.canvas,`${gender}-${outfits[col]}`);
      const {data,info}=await sharp(result.canvas).raw().toBuffer({resolveWithObject:true});
      let dyed=0;
      for(let i=0;i<data.length;i+=4) {
        const r=data[i],g=data[i+1],b=data[i+2],y=Math.floor(i/4/info.width);
        if(data[i+3]&&y<430&&b>r*1.1&&b>g*1.05&&b-r>8) {
          const light=Math.min(255,Math.round((r*.2126+g*.7152+b*.0722)*1.6));
          data[i]=data[i+1]=data[i+2]=light;dyed++;
        } else {data[i]=data[i+1]=data[i+2]=data[i+3]=0;}
      }
      if(dyed<100)throw Error(name+': no clothing color mask');
      await sharp(data,{raw:{width:info.width,height:info.height,channels:4}}).png().toFile(resolve(output,name+'-dye.png'));
      manifest.bodies[name]={left:result.left,top:result.top,w:result.w,h:result.h,dyed,neck};
    }
  }
}
const items=await pixels(resolve(source,'accessories.png'));
for(const [i,name] of ['glasses','headphones','star','scarf'].entries()) {
  const p=crop(items,i%2*Math.floor(items.w/2),Math.floor(i/2)*Math.floor(items.h/2),(i%2+1)*Math.floor(items.w/2),(Math.floor(i/2)+1)*Math.floor(items.h/2));
  const box=bounds(p),part=crop(p,box.l,box.t,box.r,box.b);
  const width={glasses:110,headphones:180,star:34,scarf:105}[name];
  const height=Math.round(part.h*width/part.w);
  await sharp(part.data,{raw:{width:part.w,height:part.h,channels:4}}).resize(width,height,{kernel:'nearest'}).png().toFile(resolve(output,`accessory-${name}.png`));
  manifest.accessories[name]={width,height};
}
await writeFile(resolve(source,'anchors.json'),JSON.stringify(manifest,null,2)+'\n');
for(const name of await readdir(output))await rename(resolve(output,name),resolve(destination,name));
console.log(`Packed ${Object.keys(manifest.heads).length} heads and ${Object.keys(manifest.bodies).length} bodies with independent clothing masks.`);
} finally {
  await rm(output,{recursive:true,force:true});
}
