import React,{useEffect,useRef,useState} from 'react';
import {Alert,Box,Button,Chip,Stack,Typography} from '@mui/material';
import {counts,createBattle,piece,step,types} from './rps-engine';

function drawPiece(ctx,p) {
  ctx.save();ctx.translate(p.x,p.y);ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=2;
  ctx.shadowColor='#0d151b55';ctx.shadowBlur=5;ctx.shadowOffsetY=2;
  if(p.type==='rock') {
    ctx.beginPath();ctx.moveTo(-12,5);ctx.lineTo(-9,-7);ctx.lineTo(-2,-12);ctx.lineTo(8,-9);ctx.lineTo(12,1);ctx.lineTo(7,11);ctx.lineTo(-5,12);ctx.closePath();
    ctx.fillStyle='#718596';ctx.strokeStyle='#445766';ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.moveTo(-6,-5);ctx.lineTo(1,-8);ctx.lineTo(7,-4);ctx.strokeStyle='#b7c5cf';ctx.stroke();
  } else if(p.type==='paper') {
    ctx.beginPath();ctx.moveTo(-10,-13);ctx.lineTo(5,-13);ctx.lineTo(11,-7);ctx.lineTo(11,13);ctx.lineTo(-10,13);ctx.closePath();
    ctx.fillStyle='#f0d36f';ctx.strokeStyle='#a47f1e';ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.moveTo(5,-13);ctx.lineTo(5,-7);ctx.lineTo(11,-7);ctx.stroke();
    ctx.beginPath();ctx.moveTo(-5,-3);ctx.lineTo(6,-3);ctx.moveTo(-5,2);ctx.lineTo(6,2);ctx.moveTo(-5,7);ctx.lineTo(3,7);ctx.strokeStyle='#92731f';ctx.lineWidth=1.5;ctx.stroke();
  } else {
    ctx.shadowBlur=3;ctx.strokeStyle='#9a5f52';ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(-5,3);ctx.lineTo(11,-11);ctx.moveTo(5,3);ctx.lineTo(-10,-10);ctx.stroke();
    ctx.fillStyle='#db9e8b';ctx.beginPath();ctx.arc(-7,8,5,0,Math.PI*2);ctx.arc(7,8,5,0,Math.PI*2);ctx.fill();ctx.stroke();
  }
  ctx.restore();
}

function PieceIcon({type}) {
  const ref=useRef(null);
  useEffect(()=>{const ctx=ref.current?.getContext('2d');if(ctx){ctx.clearRect(0,0,28,28);drawPiece(ctx,{type,x:14,y:14});}},[type]);
  return <Box component="canvas" ref={ref} width={28} height={28} aria-hidden="true" sx={{width:28,height:28}}/>;
}

export default function RpsGame() {
  const canvas=useRef(null), pieces=useRef([]), hintTimer=useRef();
  const [running,setRunning]=useState(false),[started,setStarted]=useState(false),[result,setResult]=useState(null),[hintVisible,setHintVisible]=useState(false);
  const [score,setScore]=useState({rock:0,paper:0,scissors:0});
  function draw() {
    const ctx=canvas.current?.getContext('2d');if(!ctx)return;
    ctx.clearRect(0,0,800,500);
    for(const p of pieces.current) drawPiece(ctx,p);
  }
  useEffect(()=>{
    if(!running)return;
    let frame,last=0,lastScore=0;
    function animate(now) {
      const delta=last?Math.min((now-last)/1000,.04):0;last=now;
      const next=step(pieces.current,delta);draw();
      const remaining=types.filter(type=>next[type]>0);
      if(remaining.length===1) {setScore(next);setResult(remaining[0]);setRunning(false);return;}
      if(now-lastScore>200) {setScore(next);lastScore=now;}
      frame=requestAnimationFrame(animate);
    }
    frame=requestAnimationFrame(animate);
    return ()=>cancelAnimationFrame(frame);
  },[running]);
  useEffect(()=>()=>clearTimeout(hintTimer.current),[]);
  function start() {
    pieces.current=createBattle(100);setScore(counts(pieces.current));setResult(null);setStarted(true);setRunning(true);setHintVisible(true);draw();
    clearTimeout(hintTimer.current);hintTimer.current=setTimeout(()=>setHintVisible(false),2000);
  }
  function add(event) {
    if(!running || pieces.current.length>=300)return;
    const rect=canvas.current.getBoundingClientRect();
    pieces.current.push(piece(types[Math.floor(Math.random()*3)],Math.random,Math.max(15,Math.min(785,(event.clientX-rect.left)*800/rect.width)),Math.max(15,Math.min(485,(event.clientY-rect.top)*500/rect.height))));
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
      <Box component="canvas" ref={canvas} width={800} height={500} onClick={add} aria-label="Rock paper scissors battle arena" sx={{width:'100%',display:'block',cursor:running?'crosshair':'default'}}/>
      {!started && <Typography sx={{position:'absolute',inset:0,display:'grid',placeItems:'center',color:'#37434a',pointerEvents:'none'}}>Start a battle to fill the arena.</Typography>}
      {started && !result && hintVisible && <Typography variant="caption" sx={{position:'absolute',top:10,left:10,px:1.25,py:.5,borderRadius:5,color:'#243039',bgcolor:'#f6faf0d9',boxShadow:'0 4px 16px #17212a22',pointerEvents:'none'}}>Tap to drop a random piece</Typography>}
    </Box>
    <Typography variant="body2" color="text.secondary" sx={{mt:1.5}}>Rock beats scissors. Scissors beat paper. Paper beats rock. On contact, the loser joins the winning team.</Typography>
  </Box>;
}
