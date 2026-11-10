/** Deliberately abstract design-game rules, not engineering predictions. */
export const COLS=6, ROWS=6, GRID=12;
export const STAIRS=Object.freeze([{x:0,y:10,w:2,h:2},{x:10,y:10,w:2,h:2}]);
export const ENTRANCE=Object.freeze([4,5]); // Southern edge; one grid bay.
export const CATALOG=Object.freeze([
 {id:'concrete',name:'混凝土框架',category:'structure',label:'结构',price:3,base:360,description:'稳定的基础结构。功能模块结构系数 ×1.00；厚方柱。'},
 {id:'timber',name:'木混合框架',category:'structure',label:'结构',price:5,base:400,description:'功能结构系数 ×1.15；第三轮光热系数 +0.12。细方柱，轴网不变。'},
 {id:'steel',name:'钢结构大跨',category:'structure',label:'结构',price:7,base:430,description:'跨越两个基础模数，功能结构系数 ×1.25。第三轮搭配普通围护时光热系数 −0.15。'},
 {id:'office',name:'开放办公单元',category:'function',label:'功能',price:3,base:120,w:2,h:2,description:'重复部署。第二轮起，相邻办公、休息区和近窗位置提升贡献；不可达不计分。'},
 {id:'meeting',name:'协作会议室',category:'function',label:'功能',price:4,base:140,w:2,h:2,description:'重复部署。第二轮起，相邻办公区 +25%；相邻休息区 +15%。'},
 {id:'lounge',name:'共享休息区',category:'function',label:'功能',price:3,base:100,w:2,h:2,description:'重复部署。第二轮起，相邻办公区 +40%；为办公单元提供休息支持。'},
 {id:'garden',name:'室内绿庭',category:'function',label:'功能',price:5,base:110,w:2,h:2,description:'第二轮起，近窗 ×1.50、内区 ×0.65。第三轮改善相邻办公单元的光热表现。'},
 {id:'path_half',name:'半格通路',category:'circulation',label:'通路',price:2,base:0,w:1,h:2,description:'半格宽、一格长。可旋转；与主入口连通后，让接触通路的功能可达。'},
 {id:'path',name:'一格通路',category:'circulation',label:'通路',price:2,base:0,w:2,h:2,description:'一格宽、一格长。自由布置、连接与移除；自身不产生设计费。'},
 {id:'path_wide',name:'两格通路',category:'circulation',label:'通路',price:3,base:0,w:4,h:2,description:'两格宽、一格长。可旋转；宽敞交通占用更多空间，自身不产生设计费。'},
 {id:'basic',name:'普通窗与围护',category:'envelope',label:'围护',price:2,base:100,description:'第三轮近窗光热系数 ×0.90、内区 ×1.00。普通围护的窗边存在热损失。'},
 {id:'lowe',name:'保温玻璃系统',category:'envelope',label:'围护',price:6,base:230,description:'第三轮近窗光热系数 ×1.50、内区 ×1.12；双层窗与保温边线清晰可见。'},
 {id:'shade',name:'遮阳围护系统',category:'envelope',label:'围护',price:5,base:200,description:'第三轮东西近窗 ×1.60、其余近窗 ×1.25、内区 ×1.05；外遮阳百叶。'},
]);
export const ROUNDS=Object.freeze([
 {name:'结构提案',theme:'structure',brief:'确定基础结构，留出从入口可达的功能空间。',slots:3,target:1550,gift:['timber','meeting']},
 {name:'功能组织',theme:'function',brief:'至少 8 个办公、1 个会议、1 个休息；邻接与近窗位置开始计分。',slots:4,target:2100,gift:['lounge','garden']},
 {name:'环境整合',theme:'envelope',brief:'保留功能要求，采用保温或遮阳围护；逐模块加入光热评价。',slots:5,target:3000,gift:['lowe','shade']},
]);
const cards=Object.fromEntries(CATALOG.map(c=>[c.id,c]));
const copy=value=>JSON.parse(JSON.stringify(value));
const tell=(state,message)=>({...state,message});
const spatial=id=>['function','circulation'].includes(cards[id]?.category);
const overlaps=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const adjacent=(a,b)=>((a.x+a.w===b.x||b.x+b.w===a.x)&&a.y<b.y+b.h&&b.y<a.y+a.h)||((a.y+a.h===b.y||b.y+b.h===a.y)&&a.x<b.x+b.w&&b.x<a.x+a.w);
export const nearWindow=item=>Math.min(item.x,item.y,GRID-item.x-item.w,GRID-item.y-item.h)<2;
const levelOf=(state,id)=>state.mastery[id]||1;
const rank=level=>1+(level-1)*.4;
export function getFootprint(id,rotation=0){const card=cards[id],w=card?.w||2,h=card?.h||2;return rotation%180?{w:h,h:w}:{w,h}}
export function canPlace(plan,id,x,y,rotation=0){
 if(!spatial(id))return {valid:false,reason:'请选择功能或通路蓝图'};
 if(!Number.isInteger(x)||!Number.isInteger(y)||!Number.isInteger(rotation)||rotation%90)return {valid:false,reason:'需要对齐半格网格与 90° 方向'};
 const box={x,y,...getFootprint(id,rotation)};
 if(x<0||y<0||x+box.w>GRID||y+box.h>GRID)return {valid:false,reason:'超出建筑边界'};
 if(STAIRS.some(stair=>overlaps(stair,box)))return {valid:false,reason:'固定楼梯不可占用'};
 const old=plan.items.find(i=>i.id===id&&i.x===x&&i.y===y);
 if(plan.items.some(i=>i!==old&&overlaps(i,box)))return {valid:false,reason:'空间重叠，请先移除原模块'};
 return {valid:true,reason:''};
}
export function accessibility(plan){
 const paths=new Set();
 for(const i of plan.items.filter(i=>cards[i.id]?.category==='circulation'))
  for(let x=i.x;x<i.x+i.w;x++)for(let y=i.y;y<i.y+i.h;y++)paths.add(`${x},${y}`);
 const queue=ENTRANCE.map(x=>`${x},${GRID-1}`).filter(k=>paths.has(k)),connected=new Set(queue),reachable=new Set();
 for(let n=0;n<queue.length;n++){
  const [x,y]=queue[n].split(',').map(Number);
  for(const key of [`${x-1},${y}`,`${x+1},${y}`,`${x},${y-1}`,`${x},${y+1}`])if(paths.has(key)&&!connected.has(key)){connected.add(key);queue.push(key)}
 }
 for(const i of plan.items){
  if(cards[i.id]?.category==='circulation'){
   if(connected.has(`${i.x},${i.y}`))reachable.add(i.uid);
   continue;
  }
  // A real edge contact (half a grid minimum), never diagonal corner contact.
  for(let x=i.x;x<i.x+i.w;x++)if(connected.has(`${x},${i.y-1}`)||connected.has(`${x},${i.y+i.h}`)||(i.y+i.h===GRID&&ENTRANCE.includes(x)))reachable.add(i.uid);
  for(let y=i.y;y<i.y+i.h;y++)if(connected.has(`${i.x-1},${y}`)||connected.has(`${i.x+i.w},${y}`))reachable.add(i.uid);
 }
 return {connected,reachable};
}
export function createGame(seed=Math.floor(Math.random()*2147483647)){
 const items=[];let uid=0;
 const add=(id,x,y)=>items.push({uid:`b${uid++}`,id,x,y,w:2,h:2,rotation:0});
 for(let y=0;y<12;y+=2)add('path',4,y);
 for(let y=0;y<10;y+=2)for(const x of [2,6])add(y===8?(x===2?'meeting':'lounge'):'office',x,y);
 const owned=Object.fromEntries(['concrete','office','basic','path','path_half','meeting','lounge','timber'].map(id=>[id,1]));
 return {round:0,phase:'progress',money:12,hearts:3,owned,mastery:{...owned},equipped:['concrete','office','basic'],committed:{structure:'concrete',envelope:'basic',items,levels:{...owned}},patches:{},history:[],shopSeed:seed,serial:100,started:false,returned:[],result:null,message:'查看评审主题，然后进入项目领取基础蓝图。'};
}
/** Replaying only equipped tools prevents edit-and-unequip from bypassing slot limits. */
export function getPlan(state,rejected=[]){
 const plan=copy(state.committed),operations=[];
 plan.levels||={};
 for(const id of state.equipped){
  if(state.owned[id])plan.levels[id]=state.owned[id];
  const patch=state.patches[id];if(!patch)continue;
  if(patch.structure)plan.structure=patch.structure;
  if(patch.envelope)plan.envelope=patch.envelope;
  operations.push(...(patch.ops||[]));
 }
 for(const op of operations.sort((a,b)=>a.n-b.n)){
  if(op.remove)plan.items=plan.items.filter(i=>i.uid!==op.remove);
  if(op.item){
   if(canPlace(plan,op.item.id,op.item.x,op.item.y,op.item.rotation).valid){
    plan.items=plan.items.filter(i=>i.uid!==op.item.uid);plan.items.push(copy(op.item));
   }else rejected.push(op.n);
  }
 }
 return plan;
}
function discardConflicts(state){
 const rejected=[];getPlan(state,rejected);const ids=new Set(rejected);
 for(const patch of Object.values(state.patches))if(patch.ops)patch.ops=patch.ops.filter(op=>!ids.has(op.n));
 return rejected.length;
}
export const upgradePrice=(state,id)=>cards[id].price+levelOf(state,id)*2;
export const buyPrice=(state,id)=>cards[id].price+Array.from({length:levelOf(state,id)-1},(_,i)=>cards[id].price+(i+1)*2).reduce((sum,v)=>sum+v,0);
export const sellPrice=buyPrice;
export function availableOffers(state){
 const basics=['concrete','office','meeting','lounge','basic','path','path_half'];
 const fixed=new Set([...basics,...(state.returned||[]),...CATALOG.filter(c=>c.category===ROUNDS[state.round].theme).map(c=>c.id)]);
 // Owned cards remain manageable in the inventory; random offerings rotate independently.
 const candidates=CATALOG.filter(c=>!basics.includes(c.id)&&c.category!==ROUNDS[state.round].theme);
 const start=state.shopSeed%candidates.length;
 for(let n=0;n<Math.min(2,candidates.length);n++)fixed.add(candidates[(start+n)%candidates.length].id);
 return CATALOG.filter(c=>fixed.has(c.id));
}
export function evaluate(state){
 const plan=getPlan(state),access=accessibility(plan),rows=[];
 const level=id=>plan.levels[id]||1;
 const structure=cards[plan.structure],structural={concrete:1,timber:1.15,steel:1.25}[plan.structure]+(level(plan.structure)-1)*.08;
 const structuralBase=Math.round(structure.base*rank(level(structure.id)));
 rows.push({key:'structure',id:structure.id,name:structure.name,base:structuralBase,multiplier:1,score:structuralBase,reasons:[`结构熟练度 ${level(structure.id)} 星`,`功能模块结构系数 ×${structural.toFixed(2)}`]});
 const modules=plan.items.filter(i=>cards[i.id].category==='function');
 for(const item of modules){
  const card=cards[item.id],near=modules.filter(other=>other.uid!==item.uid&&adjacent(item,other)),edge=nearWindow(item);
  const base=Math.round(card.base*rank(level(item.id)));
  let multiplier=structural;
  const reasons=[`${level(item.id)} 星基础 ${base}`,`结构 ×${structural.toFixed(2)}`];
  if(state.round>=1){
   let functional=1;
   if(item.id==='office'){
    const count=Math.min(2,near.filter(i=>i.id==='office').length);
    if(count){functional+=.15*count;reasons.push(`办公邻接 +${count*15}%`)}
    if(near.some(i=>i.id==='lounge')){functional+=.2;reasons.push('休息支持 +20%')}
    if(edge){functional+=.25;reasons.push('近窗位置 +25%')}
   }
   if(item.id==='meeting'){
    if(near.some(i=>i.id==='office')){functional+=.25;reasons.push('协作邻接 +25%')}
    if(near.some(i=>i.id==='lounge')){functional+=.15;reasons.push('交流支持 +15%')}
   }
   if(item.id==='lounge'&&near.some(i=>i.id==='office')){functional+=.4;reasons.push('服务办公 +40%')}
   if(item.id==='garden'){functional*=edge?1.5:.65;reasons.push(edge?'绿庭近窗 ×1.50':'绿庭内区 ×0.65')}
   multiplier*=functional;
  }
  if(state.round>=2){
   const side=Math.min(item.x,GRID-item.x-item.w)<2;
   let environment=plan.envelope==='lowe'?(edge?1.5:1.12):plan.envelope==='shade'?(side?1.6:edge?1.25:1.05):(edge?.9:1);
   environment+=(level(plan.envelope)-1)*.08;
   if(plan.structure==='timber')environment+=.12;
   if(plan.structure==='steel'&&plan.envelope==='basic')environment-=.15;
   if(item.id==='office'&&near.some(i=>i.id==='garden')){environment+=.2;reasons.push('绿庭支持 +0.20')}
   multiplier*=environment;reasons.push(`${edge?'近窗':'内区'}光热 ×${environment.toFixed(2)}`);
  }
  if(!access.reachable.has(item.uid)){multiplier=0;reasons.push('未连接入口通路 ×0')}else reasons.push('至少一侧可达');
  rows.push({key:item.uid,uid:item.uid,id:item.id,name:card.name,base,multiplier,score:Math.round(base*multiplier),reasons});
 }
 if(state.round>=2){const card=cards[plan.envelope],base=Math.round(card.base*rank(level(card.id)));rows.push({key:'envelope',id:card.id,name:card.name,base,multiplier:1,score:base,reasons:['围护方案贡献']})}
 const count=id=>modules.filter(i=>i.id===id).length;
 const requirements=[{label:'已采用结构方案',met:!!plan.structure},{label:'全部功能至少一侧连接入口',met:modules.length>0&&modules.every(i=>access.reachable.has(i.uid))}];
 if(state.round>=1)requirements.push({label:`至少 8 个办公单元（当前 ${count('office')}）`,met:count('office')>=8},{label:'至少 1 个会议室',met:count('meeting')>=1},{label:'至少 1 个休息区',met:count('lounge')>=1});
 if(state.round>=2)requirements.push({label:'采用保温或遮阳围护',met:plan.envelope!=='basic'});
 const target=ROUNDS[state.round].target,total=rows.reduce((sum,row)=>sum+row.score,0);
 return {plan,rows,requirements,total,target,passed:total>=target&&requirements.every(r=>r.met),accessibility:access};
}
export function reducer(state,action){
 if(action.type==='RESTART')return createGame();
 const shop=['BUY','SELL','UPGRADE','REFRESH','LEAVE_SHOP'],edit=['PLACE','ERASE','EQUIP','UNEQUIP','APPLY','SUBMIT'];
 if((shop.includes(action.type)&&state.phase!=='shop')||(edit.includes(action.type)&&state.phase!=='build'))return tell(state,'当前阶段不能执行此操作。');
 const next=copy(state),id=action.id,card=cards[id];
 const patch=id=>(next.patches[id]||={ops:[]});
 switch(action.type){
  case 'ENTER_ROUND':
   if(state.phase!=='progress')return state;
   next.phase=state.started?'build':'shop';next.message=state.started?'整理蓝图，开始本轮深化。':'基础与主题蓝图已领取。买卖等价，选择本轮灵感。';break;
  case 'LEAVE_SHOP':next.phase=state.started?'progress':'build';next.started=true;next.message=state.started?'回顾评审进程，进入下一个节点。':'本轮商店已关闭。整理装备，再进入平面搭建。';break;
  case 'BUY':
   if(!card||next.owned[id])return state;
   if(!availableOffers(state).some(c=>c.id===id))return tell(state,'该蓝图不在本次商品中。');
   if(next.money<buyPrice(state,id))return tell(state,'金币不足，可以等价出售暂时不用的蓝图。');
   next.money-=buyPrice(state,id);next.owned[id]=levelOf(state,id);next.mastery[id]||=1;next.message=`已获得「${card.name}」使用权限。`;break;
  case 'SELL':
   if(!next.owned[id])return state;
   next.money+=sellPrice(state,id);delete next.owned[id];next.equipped=next.equipped.filter(i=>i!==id);delete next.patches[id];
   if(!next.returned.includes(id))next.returned.push(id);
   next.message=`出售「${card.name}」，收回 ${sellPrice(state,id)} 金币；同星级可原价回购。`;break;
  case 'UPGRADE':
   if(card?.category==='circulation')return tell(state,'通路只有尺寸规格，不需要进修。');
   if(!next.owned[id]||next.owned[id]>=3)return tell(state,'请先拥有蓝图；最高熟练度为三星。');
   if(next.money<upgradePrice(state,id))return tell(state,`进修需要 ${upgradePrice(state,id)} 金币。`);
   next.money-=upgradePrice(state,id);next.mastery[id]=++next.owned[id];next.message=`「${card.name}」达到 ${next.owned[id]} 星。装备后同类性能同步提升，尺寸不变。`;break;
  case 'REFRESH':
   if(next.money<1)return tell(state,'刷新需要 1 金币。');
   next.money--;next.shopSeed++;next.message='随机灵感已更新；基础、主题与已出售蓝图仍可购买。';break;
  case 'EQUIP':{
   if(!next.owned[id])return tell(state,'尚未拥有这张蓝图。');
   if(next.equipped.includes(id))return state;
   const displaced=['structure','envelope'].includes(card.category)?next.equipped.filter(i=>cards[i].category===card.category):[];
   if(next.equipped.length-displaced.length>=ROUNDS[next.round].slots)return tell(state,'蓝图槽已满，请先卸下一张。');
   for(const old of displaced){next.equipped=next.equipped.filter(i=>i!==old);delete next.patches[old]}
   next.equipped.push(id);discardConflicts(next);next.message=`已装备「${card.name}」。${displaced.length?'原同类蓝图的本轮修改已撤回。':''}`;break;
  }
  case 'UNEQUIP':
   next.equipped=next.equipped.filter(i=>i!==id);delete next.patches[id];
   next.message=discardConflicts(next)?'已撤回该蓝图修改；与恢复方案冲突的本轮放置也已撤回，可重新布置。':'已撤回该蓝图的本轮修改，已确认的方案保留。';break;
  case 'APPLY':
   if(!next.equipped.includes(id)||!['structure','envelope'].includes(card?.category))return tell(state,'请先装备结构或围护蓝图。');
   patch(id)[card.category]=id;next.message=`已应用「${card.name}」，可切换平面、立面与轴测查看。`;break;
  case 'PLACE':{
   if(!next.equipped.includes(id)||!spatial(id))return tell(state,'请先装备这张空间蓝图。');
   const plan=getPlan(state),rotation=action.rotation??0,check=canPlace(plan,id,action.x,action.y,rotation);
   if(!check.valid)return tell(state,check.reason);
   const old=plan.items.find(i=>i.id===id&&i.x===action.x&&i.y===action.y);
   const item={uid:old?.uid||`i${next.serial++}`,id,x:action.x,y:action.y,rotation:((rotation%360)+360)%360,...getFootprint(id,rotation)};
   patch(id).ops.push({n:next.serial++,item});next.message=`已${old?'旋转':'布置'}「${card.name}」。蓝图可重复使用。`;break;
  }
  case 'ERASE':{
   const item=getPlan(state).items.find(i=>i.uid===action.uid);if(!item)return state;
   if(!next.equipped.includes(item.id))return tell(state,`移除需要装备「${cards[item.id].name}」。`);
   patch(item.id).ops.push({n:next.serial++,remove:item.uid});next.message='已移除该模块。卸下对应蓝图会撤回本轮修改。';break;
  }
  case 'SUBMIT':next.result=evaluate(state);next.phase='review';if(!next.result.passed)next.hearts--;next.message=next.result.passed?'评审通过，逐模块结算设计费。':'尚未通过，查看计分原因后可以继续调整。';break;
  case 'NEXT':
   if(state.phase!=='review')return state;
   if(!state.result.passed){next.phase=next.hearts>0?'build':'lost';next.result=null;next.message=next.hearts>0?'本轮试验已保留，调整后再次评审。':'信誉耗尽，本次提案结束。';break}
   next.committed=copy(state.result.plan);next.patches={};next.history.push({round:state.round,total:state.result.total});
   if(next.round===ROUNDS.length-1){next.phase='won';next.message='三轮交付完成，方案从蓝图变为实体模型。';break}
   next.round++;next.money+=6;next.phase='shop';next.result=null;next.shopSeed+=3;
   for(const gift of ROUNDS[next.round].gift){next.owned[gift]||=next.mastery[gift]||1;next.mastery[gift]||=1}
   next.message=`收到 6 金币与 ${ROUNDS[next.round].gift.map(id=>cards[id].name).join('、')}。`;break;
  default:return state;
 }
 return next;
}
