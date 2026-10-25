export const types = ['rock', 'paper', 'scissors'];
export function winner(a,b) {
  if (!types.includes(a) || !types.includes(b)) throw new Error('Unknown piece');
  if (a===b) return a;
  return {rock:'scissors',paper:'rock',scissors:'paper'}[a]===b ? a : b;
}
export function piece(type, random=Math.random, x, y, width=800, height=500) {
  x ??= random()*(width-40)+20;
  y ??= random()*(height-40)+20;
  const angle=random()*Math.PI*2;
  return {type,x,y,vx:Math.cos(angle)*65,vy:Math.sin(angle)*65};
}
export function createBattle(count,random=Math.random,width=800,height=500) {
  return Array.from({length:count},(_,i)=>piece(types[i%3],random,undefined,undefined,width,height));
}
export function counts(pieces) {
  return pieces.reduce((sum,p)=>{sum[p.type]++;return sum;},{rock:0,paper:0,scissors:0});
}
export function step(pieces,delta,width=800,height=500) {
  for (const p of pieces) {
    p.x+=p.vx*delta;p.y+=p.vy*delta;
    if(p.x<15 || p.x>width-15) {p.x=Math.max(15,Math.min(width-15,p.x));p.vx*=-1;}
    if(p.y<15 || p.y>height-15) {p.y=Math.max(15,Math.min(height-15,p.y));p.vy*=-1;}
  }
  for(let i=0;i<pieces.length;i++) for(let j=i+1;j<pieces.length;j++) {
    const a=pieces[i],b=pieces[j];
    if(a.type!==b.type && Math.hypot(a.x-b.x,a.y-b.y)<25) {
      const type=winner(a.type,b.type); a.type=type;b.type=type;
    }
  }
  return counts(pieces);
}
