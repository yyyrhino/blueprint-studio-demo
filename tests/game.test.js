import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,reducer,evaluate,accessibility,canPlace,getPlan,buyPrice,sellPrice,availableOffers,getFootprint} from '../src/game.js';
const act=(s,type,extra={})=>reducer(s,{type,...extra});
test('seed plan viable and all modules accessible; disconnect entrance fails',()=>{const s=createGame();assert.equal(evaluate(s).passed,true);s.committed.items=s.committed.items.filter(i=>!(i.id==='path'&&i.y===10));assert.equal(accessibility(getPlan(s)).reachable.size,0);assert.equal(evaluate(s).passed,false)});
test('rotation and half grid boundary occupancy',()=>{const p={items:[]};assert.equal(canPlace(p,'path_half',11,8,0).valid,true);assert.equal(canPlace(p,'path_half',11,8,90).valid,false);assert.equal(canPlace(p,'office',10,10).valid,false);p.items.push({uid:'x',id:'path',x:0,y:0,w:2,h:2,rotation:0});assert.equal(canPlace(p,'office',1,0).valid,false);assert.equal(canPlace(p,'path',0,0,90).valid,true)});
test('equal resale includes investment and persistent mastery',()=>{let s=act(createGame(),'ENTER_ROUND');const money=s.money;s=act(s,'UPGRADE',{id:'office'});assert.equal(buyPrice(s,'office'),sellPrice(s,'office'));s=act(s,'SELL',{id:'office'});s=act(s,'BUY',{id:'office'});assert.equal(s.owned.office,2);assert.equal(s.money,money-5)});
test('rollback restores baseline and suppresses conflicting later replacement',()=>{let s=act(act(createGame(),'ENTER_ROUND'),'LEAVE_SHOP');s.equipped=['office','meeting'];const old=getPlan(s).items.find(i=>i.id==='office');s=act(s,'ERASE',{uid:old.uid});s=act(s,'PLACE',{id:'meeting',x:old.x,y:old.y});assert.equal(getPlan(s).items.find(i=>i.x===old.x&&i.y===old.y).id,'meeting');s=act(s,'UNEQUIP',{id:'office'});const p=getPlan(s);assert.equal(p.items.find(i=>i.x===old.x&&i.y===old.y).id,'office')});
test('full three round route and phase gates',()=>{let s=createGame();assert.equal(act(s,'SUBMIT').phase,'progress');s=act(act(s,'ENTER_ROUND'),'LEAVE_SHOP');s=act(act(s,'SUBMIT'),'NEXT');assert.equal(s.phase,'shop');s=act(act(s,'LEAVE_SHOP'),'ENTER_ROUND');s=act(s,'EQUIP',{id:'timber'});s=act(s,'APPLY',{id:'timber'});s=act(act(s,'SUBMIT'),'NEXT');assert.equal(s.round,2);s=act(act(s,'LEAVE_SHOP'),'ENTER_ROUND');s=act(s,'EQUIP',{id:'lowe'});s=act(s,'APPLY',{id:'lowe'});s=act(s,'EQUIP',{id:'timber'});s=act(s,'APPLY',{id:'timber'});assert.equal(evaluate(s).passed,true);s=act(act(s,'SUBMIT'),'NEXT');assert.equal(s.phase,'won')});
test('failed review consumes hearts and returns to build until lost',()=>{let s=act(act(createGame(),'ENTER_ROUND'),'LEAVE_SHOP');s.committed.items=[];for(let i=0;i<3;i++)s=act(act(s,'SUBMIT'),'NEXT');assert.equal(s.phase,'lost');assert.equal(s.hearts,0)});

test('only the marked entrance connects circulation, never arbitrary exterior or diagonal',()=>{
 const i=(uid,id,x,y,w=2,h=2)=>({uid,id,x,y,w,h,rotation:0});
 const plan={items:[i('p','path',8,10),i('o','office',8,8)]};
 assert.equal(accessibility(plan).reachable.size,0);
 plan.items=[i('p','path',4,10),i('corner','office',6,8),i('side','office',6,10)];
 assert.equal(accessibility(plan).reachable.has('corner'),false);
 assert.equal(accessibility(plan).reachable.has('side'),true);
 assert.equal(accessibility(plan).reachable.has('p'),true);
});
test('unreachable modules have zero multiplier and sum of displayed contributions equals total',()=>{
 const s=createGame();s.committed.items.push({uid:'unreachable',id:'office',x:10,y:0,w:2,h:2,rotation:0});
 const result=evaluate(s),row=result.rows.find(r=>r.uid==='unreachable');
 assert.equal(row.score,0);assert.equal(row.multiplier,0);assert.equal(result.passed,false);
 assert.equal(result.total,result.rows.reduce((sum,r)=>sum+r.score,0));
 for(const r of result.rows)assert.equal(r.score,Math.round(r.base*r.multiplier));
});
test('random shop changes, basics and returned cards survive refresh, offstock cannot be purchased',()=>{
 let s=act(createGame(),'ENTER_ROUND');const before=availableOffers(s).map(c=>c.id);
 s=act(s,'REFRESH');assert.notDeepEqual(availableOffers(s).map(c=>c.id),before);
 s=act(s,'SELL',{id:'timber'});s=act(s,'REFRESH');assert.ok(availableOffers(s).some(c=>c.id==='timber'));
 for(const id of ['concrete','office','path','basic'])assert.ok(availableOffers(s).some(c=>c.id===id));
 const unavailable=['shade','lowe','garden','path_wide'].find(id=>!availableOffers(s).some(c=>c.id===id));
 assert.ok(unavailable);const denied=act(s,'BUY',{id:unavailable});assert.equal(denied.money,s.money);assert.equal(denied.owned[unavailable],undefined);
});
test('upgrading then selling cannot retain unpaid uncommitted performance; repurchase retains level',()=>{
 let s=act(createGame(),'ENTER_ROUND');const base=evaluate(s).total;
 s=act(s,'UPGRADE',{id:'office'});assert.ok(evaluate(s).total>base);
 s=act(s,'SELL',{id:'office'});assert.equal(evaluate(s).total,base);assert.equal(s.mastery.office,2);
 s=act(s,'BUY',{id:'office'});assert.equal(evaluate(s).total,base);
 s=act(s,'LEAVE_SHOP');s=act(s,'EQUIP',{id:'office'});assert.ok(evaluate(s).total>base);
 s=act(s,'UNEQUIP',{id:'office'});assert.equal(evaluate(s).total,base);
});
test('approved performance survives selling next round, without mutating prior states',()=>{
 let s=act(createGame(),'ENTER_ROUND');s=act(s,'UPGRADE',{id:'office'});s=act(s,'LEAVE_SHOP');
 const snapshot=JSON.stringify(s);const passed=act(s,'SUBMIT');assert.equal(JSON.stringify(s),snapshot);
 s=act(passed,'NEXT');const total=evaluate(s).total;s=act(s,'SELL',{id:'office'});assert.equal(evaluate(s).total,total);
});
test('same anchor rotation changes orientation once, footprint and slots stay consistent',()=>{
 let s=act(act(createGame(),'ENTER_ROUND'),'LEAVE_SHOP');s=act(s,'UNEQUIP',{id:'basic'});s=act(s,'EQUIP',{id:'path_half'});
 s=act(s,'PLACE',{id:'path_half',x:8,y:0,rotation:0});const original=getPlan(s).items.find(i=>i.id==='path_half');
 s=act(s,'PLACE',{id:'path_half',x:8,y:0,rotation:90});const placed=getPlan(s).items.filter(i=>i.id==='path_half');
 assert.equal(placed.length,1);assert.equal(placed[0].uid,original.uid);assert.deepEqual([placed[0].w,placed[0].h],[2,1]);
 assert.deepEqual(getFootprint('path_half',90),{w:2,h:1});
 const denied=act(s,'EQUIP',{id:'meeting'});assert.equal(denied.equipped.length,3);assert.ok(!denied.equipped.includes('meeting'));
 s=act(s,'UNEQUIP',{id:'path_half'});assert.ok(!getPlan(s).items.some(i=>i.id==='path_half'));
});
test('function adjacency, daylight and thermal losses make placement matter',()=>{
 let s=createGame();s.round=2;
 const north=evaluate(s).rows.find(r=>r.id==='office'&&r.reasons.includes('近窗位置 +25%'));
 assert.ok(north.reasons.some(r=>r.includes('近窗光热 ×0.90')));
 s.committed.envelope='lowe';const insulated=evaluate(s).rows.find(r=>r.uid===north.uid);
 assert.ok(insulated.score>north.score);assert.ok(insulated.reasons.some(r=>r.includes('办公邻接')));
 const noAdjacent=structuredClone(s);const target=noAdjacent.committed.items.find(i=>i.uid===north.uid);
 noAdjacent.committed.items=noAdjacent.committed.items.filter(i=>i.uid===target.uid||i.id==='path');
 assert.ok(evaluate(noAdjacent).rows.find(r=>r.uid===target.uid).score<insulated.score);
});
test('rollback cancels dependent conflicting placements, instead of invisible dormant modules',()=>{
 let s=act(act(createGame(),'ENTER_ROUND'),'LEAVE_SHOP');s.equipped=['office','meeting'];
 const old=getPlan(s).items.find(i=>i.id==='office');s=act(s,'ERASE',{uid:old.uid});s=act(s,'PLACE',{id:'meeting',x:old.x,y:old.y});
 s=act(s,'UNEQUIP',{id:'office'});assert.equal(s.patches.meeting.ops.length,0);
 s=act(s,'EQUIP',{id:'office'});s=act(s,'ERASE',{uid:old.uid});assert.ok(!getPlan(s).items.some(i=>i.x===old.x&&i.y===old.y));
});
test('circulation has no paid no-op upgrade and dimensions never change with level',()=>{
 let s=act(createGame(),'ENTER_ROUND');const money=s.money;s=act(s,'UPGRADE',{id:'path'});assert.equal(s.money,money);assert.equal(s.owned.path,1);
 const shape=getFootprint('office');s=act(s,'UPGRADE',{id:'office'});assert.deepEqual(getFootprint('office'),shape);
});
test('shop starts can be replayed from a seed and differ between seeds',()=>{
 assert.deepEqual(availableOffers(createGame(17)),availableOffers(createGame(17)));
 assert.notDeepEqual(availableOffers(createGame(17)),availableOffers(createGame(18)));
});

