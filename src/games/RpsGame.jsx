import React,{useEffect,useRef,useState} from 'react';
import {Alert,Box,Button,Chip,Stack,Typography,useMediaQuery} from '@mui/material';
import {counts,createBattle,piece,step,types} from './rps-engine';

function drawPiece(ctx,p) {
  ctx.save();ctx.translate(p.x,p.y);ctx.lineCap='round';ctx.lineJoin='round';ctx.shadowColor='#0d151b66';ctx.shadowBlur=5;ctx.shadowOffsetY=2;
  if(p.type==='rock'){
    ctx.beginPath();ctx.moveTo(-11,5);ctx.lineTo(-8,-7);ctx.lineTo(-1,-12);ctx.lineTo(9,-8);ctx.lineTo(12,3);ctx.lineTo(7,11);ctx.lineTo(-6,12);ctx.closePath();ctx.fillStyle='#91b7a5';ctx.strokeStyle='#4f7564';ctx.lineWidth=1.8;ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.moveTo(-6,-5);ctx.lineTo(1,-9);ctx.lineTo(8,-5);ctx.moveTo(1,-9);ctx.lineTo(2,8);ctx.strokeStyle='#d2e4dc';ctx.lineWidth=1.3;ctx.stroke();
  }else if(p.type==='paper'){
    ctx.beginPath();ctx.moveTo(-9,-12);ctx.lineTo(4,-12);ctx.lineTo(10,-6);ctx.lineTo(10,12);ctx.lineTo(-9,12);ctx.closePath();ctx.fillStyle='#f6e7ae';ctx.strokeStyle='#a77d23';ctx.lineWidth=1.7;ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.moveTo(4,-12);ctx.lineTo(4,-6);ctx.lineTo(10,-6);ctx.moveTo(-5,0);ctx.lineTo(6,0);ctx.moveTo(-5,5);ctx.lineTo(5,5);ctx.strokeStyle='#b58b2f';ctx.lineWidth=1.3;ctx.stroke();
  }else{
    ctx.strokeStyle='#995f54';ctx.lineWidth=2.8;ctx.beginPath();ctx.moveTo(-4,2);ctx.lineTo(10,-10);ctx.moveTo(4,2);ctx.lineTo(-10,-10);ctx.stroke();
    ctx.fillStyle='#e3a292';ctx.beginPath();ctx.arc(-6,8,4.5,0,Math.PI*2);ctx.arc(6,8,4.5,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#171d24';ctx.beginPath();ctx.arc(-6,8,2,0,Math.PI*2);ctx.arc(6,8,2,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
}

export function RpsMark(){return <svg viewBox="0 0 96 52" aria-hidden="true" className="rps-mark"><g className="rps-rock" transform="translate(18 26)"><path d="M-13 6-10-9-2-15 11-10 15 4 8 14-8 15Z" fill="#91b7a5" stroke="#4f7564" strokeWidth="2"/><path d="m-8-6 9-5 10 5M1-11 2 10" fill="none" stroke="#d2e4dc" strokeWidth="1.6"/></g><g className="rps-paper" transform="translate(48 26)"><path d="M-11-15H5l8 8v22h-24Z" fill="#f6e7ae" stroke="#a77d23" strokeWidth="2"/><path d="M5-15v8h8M-7 1H8M-7 7H7" fill="none" stroke="#b58b2f" strokeWidth="1.6"/></g><g className="rps-scissors" transform="translate(79 25)"><path d="m-5 2 12-14M5 2-8-12" stroke="#995f54" strokeWidth="3.5" strokeLinecap="round"/><circle cx="-7" cy="10" r="6" fill="#e3a292" stroke="#995f54" strokeWidth="2"/><circle cx="7" cy="10" r="6" fill="#e3a292" stroke="#995f54" strokeWidth="2"/><circle cx="-7" cy="10" r="2.5" fill="#171d24"/><circle cx="7" cy="10" r="2.5" fill="#171d24"/></g></svg>}

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
