export const normalize=a=>((a%360)+360)%360;
export const distance=(a,b)=>Math.abs(((a-b+540)%360)-180);
export const direction=(guess,target)=>normalize(target-guess)<=180?'Clockwise':'Counterclockwise';
export function freshAngle(){const target=15+Math.floor(Math.random()*331);return{version:1,target,base:65+Math.floor(Math.random()*50),estimate:normalize(target+90+Math.floor(Math.random()*181)),guesses:[],moved:false}}
export const won=r=>r.guesses.some(g=>distance(g,r.target)<=5);
export const over=r=>won(r)||r.guesses.length>=4;
export const key='aneeket:angle:round:v1';
export function loadAngle(){try{const r=JSON.parse(localStorage.getItem(key));if(r?.version===1&&[r.target,r.base,r.estimate].every(n=>Number.isInteger(n)&&n>=0&&n<360)&&Array.isArray(r.guesses)&&r.guesses.length<=4&&r.guesses.every(n=>Number.isInteger(n)&&n>=0&&n<360))return r}catch{}return freshAngle()}
export function submitAngle(r){return over(r)||!r.moved?r:{...r,guesses:[...r.guesses,r.estimate],moved:false}}
