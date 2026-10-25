import test from 'node:test';
import assert from 'node:assert/strict';
import {
  regions, graph, shortest, weighted, connected, newRound, guess, hint,
  reveal, loadRound, storageKey
} from '../src/games/states-engine.js';
import {
  normalize, distance, direction, freshAngle, submitAngle, won, over,
  loadAngle, key
} from '../src/games/angle-engine.js';

const route = () => ({
  version: 2, start: 'MH', end: 'RJ', max: 5, guesses: [],
  hints: 0, hintId: null, hintPath: [], status: 'playing', solution: []
});
const angle = () => ({
  version: 1, target: 301, base: 90, estimate: 200,
  guesses: [], moved: false
});
const storage = new Map();
globalThis.localStorage = {
  getItem: k => storage.get(k) ?? null,
  setItem: (k, v) => storage.set(k, v)
};

test('36 regions with unique IDs and symmetric land borders', () => {
  assert.equal(regions.length, 36);
  assert.equal(new Set(regions.map(r => r.id)).size, 36);
  for (const [id, borders] of graph) {
    assert(!borders.has(id));
    for (const other of borders) assert(graph.get(other)?.has(id), `${id} ↔ ${other}`);
  }
  assert.equal(shortest('AN', 'MH'), null);
  assert.equal(shortest('LD', 'MH'), null);
  assert.deepEqual([...graph.get('PY')], ['TN']);
});

test('every random route is solvable, has intermediates, and gets four extra guesses', () => {
  let previous;
  for (let i = 0; i < 500; i++) {
    const r = newRound(previous), path = shortest(r.start, r.end);
    assert(path.length >= 3);
    assert.equal(r.max, path.length - 2 + 4);
    if (previous) assert.notEqual([r.start, r.end].sort().join(), [previous.start, previous.end].sort().join());
    let result = r;
    // Guesses need not be entered in travel order.
    for (const id of path.slice(1, -1).reverse()) result = guess(result, id).round;
    assert.equal(result.status, 'won');
    assert(connected(result).has(result.end));
    previous = r;
  }
});

test('correct, duplicate, endpoint, unknown and island guesses', () => {
  const r = route();
  assert(guess(r, 'MH').error);
  assert(guess(r, 'RJ').error);
  assert(guess(r, 'not-a-region').error);
  const wrong = guess(r, 'AN');
  assert.match(wrong.message, /no land/);
  assert(guess(wrong.round, 'AN').error);
  const solved = guess(r, 'GJ').round;
  assert.equal(solved.status, 'won');
  assert.deepEqual(solved.solution, ['MH', 'GJ', 'RJ']);
  assert(guess(solved, 'UP').error);
});

test('weighted routing, sequential hints, and reveal', () => {
  assert.equal(weighted('MH', 'RJ').cost, 1);
  assert.equal(weighted('MH', 'RJ', new Set(['GJ'])).cost, 0);
  let r = route();
  for (let i = 1; i <= 3; i++) {
    r = hint(r);
    assert.equal(r.hints, i);
  }
  assert.equal(hint(r), r);
  assert(r.hintId);
  assert(r.hintPath.length >= 3);
  assert.equal(reveal(r).status, 'lost');
  assert(reveal(r).solution.length >= 3);
});

test('guess limit ends an unsuccessful round', () => {
  let r = route();
  for (const id of ['AN', 'LD', 'SK', 'ML', 'MN']) r = guess(r, id).round;
  assert.equal(r.guesses.length, 5);
  assert.equal(r.status, 'lost');
  assert(r.solution.length >= 3);
});

test('state round persists; malformed storage is discarded', () => {
  storage.set(storageKey, JSON.stringify(route()));
  assert.deepEqual(loadRound(), route());
  for (const value of ['no JSON', 'null', '{}', '{"version":2}', JSON.stringify({...route(), max: -1})]) {
    storage.set(storageKey, value);
    const r = loadRound();
    assert.equal(r.status, 'playing');
    assert(shortest(r.start, r.end));
  }
});

test('angle normalization, wraparound, and directional feedback', () => {
  assert.equal(normalize(-1), 359);
  assert.equal(normalize(720), 0);
  assert.equal(distance(359, 1), 2);
  assert.equal(distance(1, 359), 2);
  assert.equal(direction(350, 10), 'Clockwise');
  assert.equal(direction(10, 350), 'Counterclockwise');
});

test('angle matches within five degrees, including circular wraparound', () => {
  assert(won({...angle(), guesses: [296]}));
  assert(!won({...angle(), guesses: [295]}));
  assert(won({...angle(), target: 1, guesses: [359]}));
});

test('angle has exactly four attempts and requires moving the handle', () => {
  let r = angle();
  assert.equal(submitAngle(r), r);
  for (const estimate of [100, 150, 200, 250]) {
    r = submitAngle({...r, estimate, moved: true});
    assert.equal(r.moved, false);
  }
  assert.equal(r.guesses.length, 4);
  assert(over(r));
  assert(!won(r));
  assert.equal(submitAngle(r), r);
});

test('fresh angles are valid and saved rounds survive reload', () => {
  for (let i = 0; i < 100; i++) {
    const r = freshAngle();
    assert(r.target >= 15 && r.target <= 345);
    assert.equal(r.guesses.length, 0);
    assert(distance(r.estimate, r.target) >= 90);
  }
  storage.set(key, JSON.stringify(angle()));
  assert.deepEqual(loadAngle(), angle());
  storage.set(key, '{"version":1,"guesses":[null]}');
  assert.equal(loadAngle().guesses.length, 0);
});
