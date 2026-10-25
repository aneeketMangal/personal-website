import React,{useEffect,useRef,useState} from 'react';
import {Alert,Box,Button,Chip,Stack,Typography,useMediaQuery} from '@mui/material';
import {counts,createBattle,piece,step,types} from './rps-engine';

function drawPiece(ctx,p) {
  const palette={rock:['#d7e0e7','#647888'],paper:['#f8f3dc','#b98d28'],scissors:['#f4d2c8','#a25f54']}[p.type];
  ctx.save();ctx.translate(p.x,p.y);ctx.lineCap='round';ctx.lineJoin='round';ctx.shadowColor='#0d151b66';ctx.shadowBlur=5;ctx.shadowOffsetY=2;
  ctx.beginPath();ctx.arc(0,0,13,0,Math.PI*2);ctx.fillStyle=palette[0];ctx.fill();ctx.strokeStyle=palette[1];ctx.lineWidth=1.5;ctx.stroke();ctx.shadowBlur=0;
  if(p.type==='rock'){
    ctx.beginPath();ctx.moveTo(-8,4);ctx.lineTo(-6,-5);ctx.lineTo(-1,-9);ctx.lineTo(7,-6);ctx.lineTo(9,2);ctx.lineTo(5,8);ctx.lineTo(-4,9);ctx.closePath();ctx.fillStyle='#718697';ctx.strokeStyle='#425563';ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.moveTo(-5,-4);ctx.lineTo(0,-7);ctx.lineTo(6,-4);ctx.moveTo(0,-7);ctx.lineTo(1,6);ctx.strokeStyle='#b9c6cf';ctx.lineWidth=1.2;ctx.stroke();
  }else if(p.type==='paper'){
    ctx.beginPath();ctx.moveTo(-7,-9);ctx.lineTo(3,-9);ctx.lineTo(8,-4);ctx.lineTo(8,9);ctx.lineTo(-7,9);ctx.closePath();ctx.fillStyle='#fff9df';ctx.strokeStyle='#9b7620';ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.moveTo(3,-9);ctx.lineTo(3,-4);ctx.lineTo(8,-4);ctx.moveTo(-4,0);ctx.lineTo(5,0);ctx.moveTo(-4,4);ctx.lineTo(4,4);ctx.strokeStyle='#b28b2b';ctx.lineWidth=1.2;ctx.stroke();
  }else{
    ctx.strokeStyle='#825047';ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(-3,2);ctx.lineTo(7,-7);ctx.moveTo(3,2);ctx.lineTo(-7,-7);ctx.stroke();
    ctx.fillStyle='#df9485';ctx.beginPath();ctx.arc(-5,6,3.5,0,Math.PI*2);ctx.arc(5,6,3.5,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#f8eee9';ctx.beginPath();ctx.arc(-5,6,1.5,0,Math.PI*2);ctx.arc(5,6,1.5,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
}

export function RpsMark(){return <svg viewBox="0 0 92 52" aria-hidden="true" className="rps-mark"><g transform="translate(20 26)"><circle r="18" fill="#d7e0e7" stroke="#647888"/><path d="M-10 5-8-7-1-12 9-8 12 3 7 11-6 12Z" fill="#718697" stroke="#425563" strokeWidth="2"/><path d="m-6-5 7-4 7 4M1-9 2 8" fill="none" stroke="#b9c6cf" strokeWidth="1.5"/></g><g transform="translate(46 26)"><circle r="18" fill="#f8f3dc" stroke="#b98d28"/><path d="M-9-12H4l7 7v17H-9Z" fill="#fff9df" stroke="#9b7620" strokeWidth="2"/><path d="M4-12v7h7M-5 1h11M-5 6h10" fill="none" stroke="#b28b2b" strokeWidth="1.5"/></g><g transform="translate(72 26)"><circle r="18" fill="#f4d2c8" stroke="#a25f54"/><path d="m-4 2 10-11M4 2-7-9" stroke="#825047" strokeWidth="3" strokeLinecap="round"/><circle cx="-6" cy="8" r="5" fill="#df9485" stroke="#825047"/><circle cx="6" cy="8" r="5" fill="#df9485" stroke="#825047"/><circle cx="-6" cy="8" r="2" fill="#f8eee9"/><circle cx="6" cy="8" r="2" fill="#f8eee9"/></g></svg>}

function PieceIcon({type}) {
  const ref=useRef(null);
  useEffect(()=>{const ctx=ref.current?.getContext('2d');if(ctx){ctx.clearRect(0,0,28,28);drawPiece(ctx,{type,x:14,y:14});}},[type]);
  return <Box component="canvas" ref={ref} width={28} height={28} aria-hidden="true" sx={{width:28,height:28}}/>;
}

export default function RpsGame() {
  const mobile=useMediaQuery('(max-width:600px)'),arenaWidth=mobile?420:800,arenaHeight=mobile?520:500;
  const canvas=useRef(null), pieces=useRef([]), hintTimer=useRef();
  const [running,setRunning]=useState(false),[started,setStarted]=useState(false),[result,setResult]=useState(null),[hintVisible,setHintVisible]=useState(false);
  const [score,setScore]=useState({rock:0,paper:0,scissors:0});
  function draw() {
    const ctx=canvas.current?.getContext('2d');if(!ctx)return;
    ctx.clearRect(0,0,arenaWidth,arenaHeight);
    for(const p of pieces.current) drawPiece(ctx,p);
  }
  useEffect(()=>{
    if(!running)return;
    let frame,last=0,lastScore=0;
    function animate(now) {
      const delta=last?Math.min((now-last)/1000,.04):0;last=now;
      const next=step(pieces.current,delta,arenaWidth,arenaHeight);draw();
      const remaining=types.filter(type=>next[type]>0);
      if(remaining.length===1) {setScore(next);setResult(remaining[0]);setRunning(false);return;}
      if(now-lastScore>200) {setScore(next);lastScore=now;}
      frame=requestAnimationFrame(animate);
    }
    frame=requestAnimationFrame(animate);
    return ()=>cancelAnimationFrame(frame);
  },[running,arenaWidth,arenaHeight]);
  useEffect(()=>{if(started){pieces.current=createBattle(100,Math.random,arenaWidth,arenaHeight);setScore(counts(pieces.current));draw();}},[arenaWidth,arenaHeight]);
  useEffect(()=>()=>clearTimeout(hintTimer.current),[]);
  function start() {
    pieces.current=createBattle(100,Math.random,arenaWidth,arenaHeight);setScore(counts(pieces.current));setResult(null);setStarted(true);setRunning(true);setHintVisible(true);draw();
    clearTimeout(hintTimer.current);hintTimer.current=setTimeout(()=>setHintVisible(false),2000);
  }
  function add(event) {
    if(!running || pieces.current.length>=300)return;
    const rect=canvas.current.getBoundingClientRect();
    pieces.current.push(piece(types[Math.floor(Math.random()*3)],Math.random,Math.max(15,Math.min(arenaWidth-15,(event.clientX-rect.left)*arenaWidth/rect.width)),Math.max(15,Math.min(arenaHeight-15,(event.clientY-rect.top)*arenaHeight/rect.height)),arenaWidth,arenaHeight));
    setScore(counts(pieces.current));draw();
  }
  return <Box data-testid="rps-game">
    <Typography variant="h2" component="h3" sx={{fontSize:{xs:'1.8rem',sm:'2.1rem'}}}>Rock Paper Scissors Battle</Typography>
    <Typography color="text.secondary" sx={{mt:.5,mb:1.5}}>Last team standing wins.</Typography>
    <Stack direction="row" spacing={1} sx={{alignItems:'center',justifyContent:'space-between',mb:1.5}}>
      <Stack direction="row" spacing={{xs:.5,sm:1}} sx={{minWidth:0}}>{types.map(type=><Chip key={type} icon={<PieceIcon type={type}/>} label={score[type]} aria-label={`${type}: ${score[type]}`} data-testid={`rps-${type}-count`} sx={{minWidth:{xs:54,sm:64},'& .MuiChip-label':{fontVariantNumeric:'tabular-nums',px:{xs:.75,sm:1.5}}}}/>)}</Stack>
      <Button variant="contained" onClick={start} sx={{flexShrink:0,minWidth:0,px:{xs:1.25,sm:2}}}>{started?'Restart':'Start'}</Button>
    </Stack>
    {result && <Alert severity="success" role="status" sx={{mb:2}}>{result[0].toUpperCase()+result.slice(1)} wins!</Alert>}
    <Box sx={{position:'relative',borderRadius:3,overflow:'hidden',border:'1px solid #445060',bgcolor:'#edf0ed'}}>
      <Box component="canvas" ref={canvas} width={arenaWidth} height={arenaHeight} onClick={add} aria-label="Rock paper scissors battle arena" sx={{width:'100%',display:'block',cursor:running?'crosshair':'default'}}/>
      {!started && <Typography sx={{position:'absolute',inset:0,display:'grid',placeItems:'center',color:'#37434a',pointerEvents:'none'}}>Start a battle to fill the arena.</Typography>}
      {started && !result && hintVisible && <Typography variant="caption" sx={{position:'absolute',top:10,left:10,px:1.25,py:.5,borderRadius:5,color:'#243039',bgcolor:'#f6faf0d9',boxShadow:'0 4px 16px #17212a22',pointerEvents:'none'}}>Tap to drop a random piece</Typography>}
    </Box>
    <Typography variant="body2" color="text.secondary" sx={{mt:1.5}}>Rock beats scissors. Scissors beat paper. Paper beats rock. On contact, the loser joins the winning team.</Typography>
  </Box>;
}
