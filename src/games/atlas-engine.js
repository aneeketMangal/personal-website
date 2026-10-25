import stash from '../data/atlas-places.json' with {type: 'json'};

export const storageKey = 'aneeket:atlas:round:v2';
export const placesByLetter = stash;
export const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z]/g, '');
export const places = Object.values(stash).flat();
const lookup = new Map(places.map(place => [normalize(place.name), place]));
const pick = (items, random) => items[Math.min(items.length - 1, Math.floor(random() * items.length))];
export const lastLetter = name => normalize(name).slice(-1).toUpperCase();
export const requiredLetter = round => lastLetter(round.chain.at(-1).name);
export function available(round, letter = requiredLetter(round)) {
  const used = new Set(round.chain.map(place => normalize(place.name)));
  return (stash[letter] || []).filter(place => !used.has(normalize(place.name)));
}
export function freshRound(random = Math.random) {
  // Begin with a familiar country; reserve less familiar places for later turns.
  const first = pick(['India','Japan','France','Canada','Brazil','Australia','China','Germany','Spain','Italy','Nepal','Egypt'].map(name => lookup.get(normalize(name))).filter(Boolean), random);
  return {version: 1, chain: [{...first, player: 'atlas'}], status: 'playing'};
}
export function submitPlace(round, input, random = Math.random) {
  if (round.status !== 'playing') return {error: 'This round has ended. Start a new round.'};
  const key = normalize(input);
  if (!key) return {error: 'Enter a place to keep the chain going.'};
  if (key[0].toUpperCase() !== requiredLetter(round)) return {error: `Your place must start with ${requiredLetter(round)}.`};
  if (round.chain.some(place => normalize(place.name) === key)) return {error: 'That place is already in the chain. Try another.'};
  const place = lookup.get(key);
  if (!place) return {error: 'That place is not in this game’s stash. Use a hint or browse the 40 places for this letter.'};
  const next = {...round, chain: [...round.chain, {...place, player: 'you'}]};
  const replies = available(next);
  if (!replies.length) return {round: {...next, status: 'won'}};
  const reply = pick(replies.slice(0, 3), random);
  next.chain.push({...reply, player: 'atlas'});
  if (!available(next).length) next.status = 'lost';
  return {round: next};
}
export function loadRound(storage = globalThis.localStorage) {
  try {
    const round = JSON.parse(storage.getItem(storageKey));
    if (round?.version !== 1 || !Array.isArray(round.chain) || !round.chain.length || round.chain.length > places.length) throw Error();
    const used = new Set();
    round.chain.forEach((entry, i) => {
      const key = normalize(entry.name);
      if (!lookup.has(key) || used.has(key) || entry.player !== (i % 2 ? 'you' : 'atlas')) throw Error();
      if (i && key[0].toUpperCase() !== lastLetter(round.chain[i-1].name)) throw Error();
      used.add(key);
    });
    if (!['playing','won','lost'].includes(round.status)) throw Error();
    if (round.status === 'playing' && (round.chain.length % 2 !== 1 || !available(round).length)) throw Error();
    if (round.status === 'won' && (round.chain.length % 2 !== 0 || available(round).length)) throw Error();
    if (round.status === 'lost' && (round.chain.length % 2 !== 1 || available(round).length)) throw Error();
    return {...round, chain: round.chain.map(entry => ({...lookup.get(normalize(entry.name)), player:entry.player}))};
  } catch { return freshRound(); }
}
