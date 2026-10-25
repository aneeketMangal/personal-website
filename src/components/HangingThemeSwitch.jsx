import React,{useEffect,useLayoutEffect,useRef,useState} from 'react';
import LightModeOutlined from '@mui/icons-material/LightModeOutlined';

const SWITCH_WIDTH=68;
function layoutSize(){return {w:document.documentElement.clientWidth,h:document.documentElement.clientHeight};}

export default function HangingThemeSwitch({mode,onToggle}) {
  const [pulling,setPulling]=useState(false);
  const [compact,setCompact]=useState(false);
  const [position,setPosition]=useState(()=>{
    try {const saved=JSON.parse(localStorage.getItem('aneeket:switch-position:v4'));if(Number.isFinite(saved?.x)&&Number.isFinite(saved?.y))return saved;} catch {}
    const {w,h}=layoutSize();
    return {x:Math.max(0,w-SWITCH_WIDTH),y:Math.min(76,Math.max(24,h-120))};
  });
  const [cord,setCord]=useState(()=>{const {w,h}=layoutSize();return {x1:0,y1:0,x2:0,y2:0,w,h};});
  const timer=useRef(),drag=useRef(),dragged=useRef(false),positionRef=useRef(position);
  const clampRef=useRef(null),switchRef=useRef(null);
  useEffect(()=>{positionRef.current=position;},[position]);
  useEffect(()=>{
    function keepOnScreen() {const {w,h}=layoutSize();setPosition(old=>({x:Math.max(0,Math.min(w-SWITCH_WIDTH,old.x)),y:Math.max(24,Math.min(h-120,old.y))}));}
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
    const {w,h}=layoutSize();
    const next={x:Math.max(0,Math.min(w-SWITCH_WIDTH,drag.current.origin.x+dx)),y:Math.max(24,Math.min(h-120,drag.current.origin.y+dy))};
    positionRef.current=next;
    setPosition(next);
  }
  function pointerUp(event) {
    if(!drag.current||drag.current.pointerId!==event.pointerId)return;
    drag.current=null;
    if(dragged.current){try {localStorage.setItem('aneeket:switch-position:v4',JSON.stringify(positionRef.current));} catch {}}
  }
  function updateCord() {
    const clamp=clampRef.current?.getBoundingClientRect();
    const neck=switchRef.current?.querySelector('.bed-switch-neck')?.getBoundingClientRect();
    const {w,h}=layoutSize();
    if(!clamp||!neck){setCord(old=>({...old,w,h}));return;}
    setCord({w,h,x1:clamp.left+clamp.width/2,y1:clamp.bottom+4,x2:neck.left+neck.width/2,y2:neck.top+2});
  }
  useLayoutEffect(()=>{
    if(compact)return;
    updateCord();
    window.addEventListener('resize',updateCord);
    return ()=>window.removeEventListener('resize',updateCord);
  },[position,pulling,compact]);
  const next=mode==='dark'?'light':'dark';
  const cordPath=`M ${cord.x1} ${cord.y1} L ${cord.x2} ${cord.y2}`;
  return <>
  {!compact&&<>
    <span ref={clampRef} className="switch-fixed-clamp" aria-hidden="true"/>
    <svg className={`switch-cord-layer${pulling?' is-pulling':''}`} width={cord.w} height={cord.h} viewBox={`0 0 ${cord.w} ${cord.h}`} preserveAspectRatio="none" aria-hidden="true">
      <path className="switch-flex-wire" d={cordPath}/>
    </svg>
    <button ref={switchRef} type="button" className={`hanging-theme-switch${pulling?' is-pulling':''}`} style={{left:position.x,top:position.y,right:'auto'}}
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
