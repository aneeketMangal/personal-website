import test from 'node:test';
import assert from 'node:assert/strict';
import {available, freshRound, loadRound, normalize, places, placesByLetter, requiredLetter, submitPlace} from '../src/games/atlas-engine.js';

test('Atlas has exactly 40 unique real place records per letter', () => {
  assert.equal(places.length,1040);
  assert.equal(new Set(places.map(p=>normalize(p.name))).size,1040);
  for(const [letter, group] of Object.entries(placesByLetter)) {
    assert.equal(group.length,40);
    for(const p of group) {
      assert.equal(normalize(p.name)[0].toUpperCase(),letter);
      assert.match(p.country,/^[A-Z]{2}$/);
      assert.match(p.geonameId,/^\d+$/);
    }
  }
});
test('Atlas validates turns, accepts case and accents, and never mutates a failed round', () => {
  const round=freshRound(()=>0);
  const before=JSON.stringify(round);
  assert(submitPlace(round,'').error);
  assert(submitPlace(round,requiredLetter(round)==='A'?'Berlin':'Amsterdam').error);
  assert(submitPlace(round,requiredLetter(round)+'notarealplace').error);
  assert.equal(JSON.stringify(round),before);
  const place=available(round)[0];
  const next=submitPlace(round,'  '+place.name.toUpperCase()+' ',()=>0).round;
  assert.equal(next.chain.length,3);
  assert.equal(next.chain[1].name,place.name);
  assert.equal(normalize(next.chain[2].name)[0].toUpperCase(),place.name.replace(/[^a-z]/gi,'').slice(-1).toUpperCase());
  assert.equal(normalize('São Paulo'),normalize('Sao Paulo'));
  const duplicate={version:1,status:'playing',chain:[{...places.find(p=>p.name==='Amsterdam'),player:'atlas'},{...places.find(p=>p.name==='Mumbai'),player:'you'},{...places.find(p=>p.name==='Istanbul'),player:'atlas'},{...places.find(p=>p.name==='Lima'),player:'you'}]};
  assert.match(submitPlace(duplicate,'Amsterdam').error,/already/);
});
test('Atlas complete rounds obey the chain, exhaust safely and persist', () => {
  for(let seed=1;seed<=20;seed++) {
    let x=seed;
    const random=()=>{x=(x*1664525+1013904223)>>>0;return x/4294967296;};
    let round=freshRound(random);
    while(round.status==='playing') {
      const choices=available(round);
      assert(choices.length);
      const name=choices[Math.floor(random()*choices.length)].name;
      const result=submitPlace(round,name,random);
      assert(!result.error);
      round=result.round;
      assert(round.chain.length<=1040);
      assert.deepEqual(loadRound({getItem:()=>JSON.stringify(round)}),round);
    }
    assert(['won','lost'].includes(round.status));
    assert.equal(available(round).length,0);
    assert(submitPlace(round,'London').error);
  }
});
test('Atlas ignores malformed saved rounds and works without storage', () => {
  for(const value of ['nope','null','{}',JSON.stringify({version:1,chain:[{name:'fake',player:'atlas'}],status:'playing'})]) {
    const round=loadRound({getItem:()=>value});
    assert.equal(round.chain.length,1);
    assert.equal(round.status,'playing');
  }
  assert.equal(loadRound({getItem(){throw Error('disabled');}}).chain.length,1);
});
