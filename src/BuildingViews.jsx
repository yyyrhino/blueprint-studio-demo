import React from 'react';
import {ENTRANCE} from './game.js';
const cyan='#84d9df',navy='#071923';

/** Fixed orthographic axonometric: shared plan geometry, explicit low-poly furniture. */
export default function BuildingViews({plan,mode='iso',solid=false,roof=false}){
 const items=plan.items,steel=plan.structure==='steel',timber=plan.structure==='timber';
 const ink=solid?'#405951':cyan;
 const palette={floor:solid?'#838d79':'#102e3c',post:solid?(timber?'#b99b71':steel?'#71898e':'#acb4a5'):'#224653',glass:solid?'#8fbdbd':'#16485c',wood:solid?'#ba9a6c':'#193f4b',chair:solid?'#587e73':'#194c55',leaf:solid?'#708b62':'#205443',path:solid?'#b3b29b':'#153f4c'};
 const p=(x,y,z=0)=>[450+(x-y)*26,140+(x+y)*13-z*24];
 const polygon=points=>points.map(q=>p(...q).join(',')).join(' ');
 const line=(a,b,props={})=><path d={`M${p(...a).join(',')}L${p(...b).join(',')}`} stroke={ink} fill="none" {...props}/>;
 function box(x,y,w,d,h,fill,key,z=0){return <g key={key} stroke={ink} strokeWidth={solid?.5:.8}>
  <polygon points={polygon([[x,y,z+h],[x+w,y,z+h],[x+w,y+d,z+h],[x,y+d,z+h]])} fill={fill}/>
  <polygon points={polygon([[x+w,y,z],[x+w,y+d,z],[x+w,y+d,z+h],[x+w,y,z+h]])} fill={fill} style={{filter:'brightness(.82)'}}/>
  <polygon points={polygon([[x,y+d,z],[x+w,y+d,z],[x+w,y+d,z+h],[x,y+d,z+h]])} fill={fill} style={{filter:'brightness(.68)'}}/>
 </g>}
 function furniture(item){
  const {x,y,w,h,rotation=0,id}=item;
  // Quarter-turn furniture coordinates inside its unchanged module footprint.
  const transform=(u,v)=>rotation===90?[w-v,u]:rotation===180?[w-u,h-v]:rotation===270?[v,h-u]:[u,v];
  const smallBox=(u,v,a,b,height,fill,key,z=0)=>{const corners=[[u,v],[u+a,v],[u,v+b],[u+a,v+b]].map(q=>transform(...q));const xs=corners.map(q=>q[0]),ys=corners.map(q=>q[1]);return box(x+Math.min(...xs),y+Math.min(...ys),Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys),height,fill,key,z)};
  const chair=(u,v,key)=><g key={key}>{smallBox(u,v,.28,.3,.1,palette.chair,'seat',.32)}{smallBox(u,v,.28,.06,.45,palette.chair,'back',.35)}{smallBox(u+.04,v+.05,.04,.2,.3,palette.post,'leg')}</g>;
  if(id==='office')return <g>{smallBox(.27,.55,1.46,.9,.12,palette.wood,'desk',.65)}{[.33,1.58].map(u=>[.63,1.3].map(v=>smallBox(u,v,.05,.05,.65,palette.post,`${u}${v}`)))}{[.45,1.25].map(u=><g key={u}>{chair(u,.17,'north')}{chair(u,1.55,'south')}{smallBox(u,.8,.35,.035,.3,palette.glass,'monitor',.77)}</g>)}</g>;
  if(id==='meeting')return <g>{smallBox(.55,.27,.9,1.46,.12,palette.wood,'table',.65)}{smallBox(.9,.75,.2,.5,.65,palette.post,'pedestal')}{[.44,1.2].map(v=><g key={v}>{chair(.13,v,'left')}{chair(1.6,v,'right')}</g>)}</g>;
  if(id==='lounge')return <g>{smallBox(.2,.2,1.6,.5,.38,palette.chair,'sofa')}{smallBox(.2,.2,1.6,.09,.72,palette.chair,'back')}{smallBox(.68,1,.65,.45,.1,palette.wood,'table',.36)}{smallBox(.2,1.25,.32,.48,.35,palette.chair,'chair1')}{smallBox(1.48,1.25,.32,.48,.35,palette.chair,'chair2')}</g>;
  if(id==='garden')return <g>{smallBox(.12,.12,1.76,1.76,.12,palette.wood,'planter')}{[[.6,.6],[1.35,.85],[.8,1.42]].map(([u,v],i)=>{const [tx,ty]=transform(u,v),point=p(x+tx,y+ty,1.18+i*.1);return <g key={i}>{smallBox(u-.04,v-.04,.08,.08,.9,palette.wood,'trunk')}<ellipse cx={point[0]} cy={point[1]} rx={13+i} ry={16+i} fill={palette.leaf} stroke={ink} strokeWidth=".7"/></g>})}</g>;
  return null;
 }
 const elevation=mode==='elevation';
 return <div className={`building-view ${solid?'materialized':'blueprint'}`}><svg viewBox={elevation?'0 0 900 500':'0 0 900 600'} role="img" aria-label={elevation?'依据当前方案绘制的固定南立面':`${solid?'实体桌面模型':'轴测蓝图'}，依据当前方案位置绘制`}>
  <rect width="900" height="600" fill={navy}/><text x="55" y="38" fill={cyan} fontSize="12" letterSpacing="2">{elevation?'SOUTH ELEVATION / 南立面':solid?'BUILT MODEL / 实体呈现':'AXONOMETRIC / 固定轴测'}</text>
  {elevation?<>
   <path d="M65 375H835" stroke={ink}/><rect x="90" y="158" width="720" height="210" fill="#10313e" stroke={ink}/>
   {Array.from({length:6},(_,n)=><g key={n}><rect x={96+n*120} y="174" width="108" height={n===2?182:174} fill={palette.glass} fillOpacity=".35" stroke={cyan} strokeWidth={plan.envelope==='lowe'?3:1}/><path d={`M${150+n*120} 174V356M${96+n*120} 260h108`} stroke={ink}/>{plan.envelope==='lowe'&&<rect x={101+n*120} y="179" width="98" height="164" stroke={cyan} fill="none"/>}{n===2&&<><path d="M384 270v20m12-20v20" stroke="#e4c17b"/><text x="390" y="400" textAnchor="middle" fill="#e4c17b" fontSize="12">主入口</text></>}</g>)}
   {items.filter(i=>!i.id.startsWith('path')).map(i=><g key={i.uid} opacity={.15+i.y/16} transform={`translate(${90+i.x*60} ${340-(12-i.y)*4})`} stroke={cyan} fill="#174454"><rect x="8" y={i.id==='garden'?-45:-23} width={i.w*60-16} height={i.id==='garden'?45:12} rx={i.id==='garden'?18:1}/><path d={`M15-10V0M${i.w*60-15}-10V0`} fill="none"/></g>)}
   {Array.from({length:7},(_,n)=>steel&&n%2?null:<g key={n}><rect x={86+n*120} y="146" width={timber?8:steel?7:14} height="222" fill={palette.post} stroke={ink}/>{steel&&<path d={`M${81+n*120} 148h20m-20 218h20`} stroke={ink} strokeWidth="3"/>}</g>)}
   <rect x="85" y="144" width="730" height="14" fill={palette.post} stroke={ink}/><rect x="85" y="356" width="730" height="14" fill={palette.floor} stroke={ink}/>
   {plan.envelope==='shade'&&Array.from({length:31},(_,n)=><path key={n} d={`M${95+n*23} 164v180`} stroke="#e6c47e" strokeWidth="4"/>)}
   <text x="450" y="439" textAnchor="middle" fill={cyan} fontSize="12">{timber?'木混合框架':steel?'钢结构大跨':'混凝土框架'} · {plan.envelope==='lowe'?'双层保温玻璃':plan.envelope==='shade'?'外遮阳系统':'普通玻璃围护'}</text>
  </>:<>
   <g className="model-slab">{box(-.3,-.3,12.6,12.6,.45,solid?'#566358':'#102a37','base',-.45)}
    <g stroke={ink} strokeWidth=".45">{Array.from({length:7},(_,n)=><g key={n} opacity=".2">{line([n*2,0],[n*2,12])}{line([0,n*2],[12,n*2])}</g>)}
    {items.map(i=><polygon key={i.uid} points={polygon([[i.x,i.y],[i.x+i.w,i.y],[i.x+i.w,i.y+i.h],[i.x,i.y+i.h]])} fill={i.id.startsWith('path')?palette.path:palette.floor}/>)}</g>
    {[0,10].map(x=><g key={x}>{box(x,10,2,2,.1,palette.post,'stair')}{Array.from({length:8},(_,n)=><g key={n}>{line([x+.15,10.2+n*.22,.11],[x+1.85,10.2+n*.22,.11],{strokeWidth:'.6'})}</g>)}</g>)}
   </g>
   <g className="model-envelope">{Array.from({length:6},(_,n)=><g key={n} stroke={ink} strokeWidth=".9"><polygon points={polygon([[n*2+.1,0,.3],[n*2+1.9,0,.3],[n*2+1.9,0,3.3],[n*2+.1,0,3.3]])} fill={palette.glass} fillOpacity={solid?.45:.12}/><polygon points={polygon([[0,n*2+.1,.3],[0,n*2+1.9,.3],[0,n*2+1.9,3.3],[0,n*2+.1,3.3]])} fill={palette.glass} fillOpacity={solid?.45:.12}/>{plan.envelope==='lowe'&&<><polyline points={polygon([[n*2+.2,0,.5],[n*2+1.8,0,.5],[n*2+1.8,0,3.1],[n*2+.2,0,3.1],[n*2+.2,0,.5]])} fill="none"/><polyline points={polygon([[0,n*2+.2,.5],[0,n*2+1.8,.5],[0,n*2+1.8,3.1],[0,n*2+.2,3.1],[0,n*2+.2,.5]])} fill="none"/></>}{plan.envelope==='shade'&&[.4,.8,1.2,1.6].map(k=><g key={k}>{line([-.12,n*2+k,.3],[-.12,n*2+k,3.5],{stroke:'#d9b574',strokeWidth:'3'})}</g>)}</g>)}</g>
   <g className="model-interior">{items.filter(i=>!i.id.startsWith('path')).sort((a,b)=>(a.x+a.y)-(b.x+b.y)).map(i=><g key={i.uid}>{furniture(i)}</g>)}</g>
   <g className="model-structure">{Array.from({length:49},(_,n)=>{const x=n%7*2,y=Math.floor(n/7)*2;if(steel&&(x%4||y%4))return null;const width=timber?.14:steel?.09:.22;return box(x-width/2,y-width/2,width,width,3.5,palette.post,`post${n}`)})}
    {[0,12].map(y=>box(0,y-.08,12,.16,.18,palette.post,`beam${y}`,3.5))}{[0,12].map(x=>box(x-.08,0,.16,12,.18,palette.post,`beamx${x}`,3.5))}
   </g>
   <g className="model-envelope">{box(0,11.96,ENTRANCE[0],.05,.4,palette.glass,'front1')}{box(ENTRANCE.at(-1)+1,11.96,12-ENTRANCE.at(-1)-1,.05,.4,palette.glass,'front2')}{box(11.96,0,.05,12,.4,palette.glass,'right')}</g>
   {roof&&<g className="model-roof">{box(-.15,-.15,12.3,12.3,.2,solid?'#8a9383':'#164052','roof',3.75)}</g>}
   <text x="450" y="520" textAnchor="middle" fill={cyan} fontSize="12">{roof?'平屋顶显示':'屋顶隐藏 · 前侧围护降低展示'} · 同一方案 / 固定视角</text>
   <text x="450" y="548" textAnchor="middle" fill={cyan} opacity=".55" fontSize="10">{solid?'方案建成 · 可替换的桌面模型占位素材':'结构、窗户与布局实时对应平面数据'}</text>
  </>}
 </svg></div>;
}
