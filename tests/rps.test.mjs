import test from 'node:test';
import assert from 'node:assert/strict';
import {counts,createBattle,step,types,winner} from '../src/games/rps-engine.js';
test('RPS resolves all pairings in either order',()=>{
  for(const type of types)assert.equal(winner(type,type),type);
  for(const [a,b] of [['rock','scissors'],['scissors','paper'],['paper','rock']]){assert.equal(winner(a,b),a);assert.equal(winner(b,a),a);}
});
test('RPS battles begin balanced and collisions preserve total population',()=>{
  assert.deepEqual(counts(createBattle(60)),{rock:20,paper:20,scissors:20});
  const pieces=[{type:'rock',x:40,y:40,vx:0,vy:0},{type:'scissors',x:42,y:42,vx:0,vy:0}];
  assert.deepEqual(step(pieces,.01),{rock:2,paper:0,scissors:0});
  assert.equal(pieces.length,2);
});
test('RPS pieces bounce inside the arena',()=>{
  const pieces=[{type:'paper',x:784,y:484,vx:100,vy:100}];
  step(pieces,.04);assert.equal(pieces[0].x,785);assert.equal(pieces[0].y,485);assert(pieces[0].vx<0 && pieces[0].vy<0);
});
