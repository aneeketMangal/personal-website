import React,{useEffect,useRef,useState} from 'react';
import LightModeOutlined from '@mui/icons-material/LightModeOutlined';

export default function HangingThemeSwitch({mode,onToggle}) {
  const [pulling,setPulling]=useState(false);
  const [compact,setCompact]=useState(false);
  const [position,setPosition]=useState(()=>{
    try {const saved=JSON.parse(localStorage.getItem('aneeket:switch-position:v2'));if(Number.isFinite(saved?.x)&&Number.isFinite(saved?.y))return saved;} catch {}
    return {x:Math.max(4,window.innerWidth-76),y:76};
  });
  const timer=useRef(),drag=useRef(),dragged=useRef(false),positionRef=useRef(position);
  useEffect(()=>{positionRef.current=position;},[position]);
  useEffect(()=>{
    function keepOnScreen() {setPosition(old=>({x:Math.max(0,Math.min(window.innerWidth-68,old.x)),y:Math.max(24,Math.min(window.innerHeight-120,old.y))}));}
    window.addEventListener('resize',keepOnScreen);
    keepOnScreen();
    return ()=>{clearTimeout(timer.current);window.removeEventListener('resize',keepOnScreen);};
  },[]);
  useEffect(()=>{
    const media=window.matchMedia('(max-width:600px)');
    function updateCompact() {
      const switchBottom=positionRef.current.y+120;
      setCompact(media.matches&&window.scrollY>switchBottom);
    }
    window.addEventListener('scroll',updateCompact,{passive:true});
    window.addEventListener('resize',updateCompact);
    media.addEventListener?.('change',updateCompact);
    updateCompact();
    return ()=>{
      window.removeEventListener('scroll',updateCompact);
      window.removeEventListener('resize',updateCompact);
      media.removeEventListener?.('change',updateCompact);
    };
  },[]);
  function pull() {
    if(pulling)return;
    setPulling(true);
    onToggle();
    clearTimeout(timer.current);
    timer.current=setTimeout(()=>setPulling(false),720);
  }
  function pointerDown(event) {
    if(event.button!==0)return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current={pointerId:event.pointerId,startX:event.clientX,startY:event.clientY,origin:positionRef.current};
    dragged.current=false;
  }
  function pointerMove(event) {
    if(!drag.current||drag.current.pointerId!==event.pointerId)return;
    const dx=event.clientX-drag.current.startX,dy=event.clientY-drag.current.startY;
    if(Math.hypot(dx,dy)>4)dragged.current=true;
    if(!dragged.current)return;
    const next={x:Math.max(0,Math.min(window.innerWidth-68,drag.current.origin.x+dx)),y:Math.max(24,Math.min(window.innerHeight-120,drag.current.origin.y+dy))};
    positionRef.current=next;
    setPosition(next);
  }
  function pointerUp(event) {
    if(!drag.current||drag.current.pointerId!==event.pointerId)return;
    drag.current=null;
    if(dragged.current){try {localStorage.setItem('aneeket:switch-position:v2',JSON.stringify(positionRef.current));} catch {}}
  }
  const next=mode==='dark'?'light':'dark';
  const anchorX=window.innerWidth-26,anchorY=8,endX=position.x+34,endY=position.y+3+(pulling?14:0);
  const cordPath=`M ${anchorX} ${anchorY} L ${endX} ${endY}`;
  return <>
  {!compact&&<>
    <span className="switch-fixed-clamp" aria-hidden="true"/>
    <svg className={`switch-cord-layer${pulling?' is-pulling':''}`} viewBox={`0 0 ${window.innerWidth} ${window.innerHeight}`} preserveAspectRatio="none" aria-hidden="true">
      <path className="switch-flex-wire" d={cordPath}/>
    </svg>
    <button type="button" className={`hanging-theme-switch${pulling?' is-pulling':''}`} style={{left:position.x,top:position.y,right:'auto'}}
      onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp}
      onClick={event=>{if(dragged.current){event.preventDefault();dragged.current=false;return;}pull();}}
      aria-label={`Switch to ${next} theme`} aria-pressed={mode==='light'} title={`Pull for ${next} theme`}>
      <span className={`switch-pendant bed-switch-body is-${mode}`} aria-hidden="true">
        <span className="bed-switch-neck"/>
        <span className={`bed-switch-rocker is-${mode}`}><span className={mode==='light'?'is-selected':''}>ON</span><span className={mode==='dark'?'is-selected':''}>OFF</span></span>
        <span className="bed-switch-screw screw-left"/><span className="bed-switch-screw screw-right"/>
        <span className="bed-switch-screw screw-bottom-left"/><span className="bed-switch-screw screw-bottom-right"/>
        <span className="bed-switch-state">{mode==='dark'?'LIGHT':'DARK'}</span>
        <span className="bed-switch-rating">6A 240V~</span>
      </span>
    </button>
  </>}
  {compact&&<button type="button" className="compact-theme-toggle" onClick={pull}
    aria-label={`Switch to ${next} theme`} aria-pressed={mode==='light'} title={`Switch to ${next} theme`}>
    <LightModeOutlined aria-hidden="true"/>
  </button>}
  </>;
}
