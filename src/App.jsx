import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Box, ButtonBase, Stack, Typography, useMediaQuery
} from '@mui/material';
import HomeOutlined from '@mui/icons-material/HomeOutlined';
import SchoolOutlined from '@mui/icons-material/SchoolOutlined';
import WorkOutlined from '@mui/icons-material/WorkOutlined';
import CodeOutlined from '@mui/icons-material/CodeOutlined';
import SportsEsportsOutlined from '@mui/icons-material/SportsEsportsOutlined';
import MenuBookOutlined from '@mui/icons-material/MenuBookOutlined';
import Home from './components/Home';
import Projects from './components/Projects';
import Games from './components/Games';
import Library from './components/Library';

const sections = [
  ['home', 'Home', HomeOutlined],
  ['education', 'Education', SchoolOutlined],
  ['experience', 'Work Experience', WorkOutlined],
  ['projects', 'Projects', CodeOutlined],
  ['games', 'Games', SportsEsportsOutlined],
  ['library', 'Library', MenuBookOutlined]
];

function readHash() {
  const [name, detail] = window.location.hash.slice(1).split('/');
  return {
    section: sections.some(([id]) => id === name) ? name : 'home',
    game: name === 'games' && ['2-states', 'angle', 'atlas', 'rps'].includes(detail) ? detail : null
  };
}

export default function App() {
  const [activeSection, setActiveSection] = useState(() => readHash().section);
  const [game, setGame] = useState(() => readHash().game);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const navigationTimer = useRef();

  const scrollToSection = useCallback((section, instant = false) => {
    document.getElementById(section)?.scrollIntoView({
      block: 'start',
      behavior: instant || reducedMotion ? 'instant' : 'smooth'
    });
  }, [reducedMotion]);

  function updateHash(hash) {
    if (window.location.hash !== `#${hash}`) {
      window.history.pushState(null, '', `#${hash}`);
    }
  }

  function navigate(section, event) {
    // Preserve native open-in-new-tab / copy-link behavior for anchor navigation.
    if (event && (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)) return;
    event?.preventDefault();
    updateHash(section === 'games' && game ? `games/${game}` : section);
    setActiveSection(section);
    clearTimeout(navigationTimer.current);
    navigationTimer.current = setTimeout(() => scrollToSection(section), 0);
  }

  function selectGame(nextGame) {
    setGame(nextGame);
    setActiveSection('games');
    updateHash(nextGame ? `games/${nextGame}` : 'games');
    requestAnimationFrame(() => scrollToSection('games'));
  }

  useEffect(() => {
    let frame;
    let cancelled = false;
    function followHash() {
      const next = readHash();
      if (next.section === 'games') setGame(next.game);
      setActiveSection(next.section);
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => scrollToSection(next.section, true));
    }
    // Fonts can change line wrapping, so settle layout before an initial deep link.
    Promise.resolve(document.fonts?.ready).then(() => {
      if (!cancelled) followHash();
    });
    window.addEventListener('hashchange', followHash);
    window.addEventListener('popstate', followHash);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      clearTimeout(navigationTimer.current);
      window.removeEventListener('hashchange', followHash);
      window.removeEventListener('popstate', followHash);
    };
  }, [scrollToSection]);

  useEffect(() => {
    let frame;
    function markVisibleSection() {
      frame = null;
      const line = 96;
      let visible = 'home';
      for (const [id] of sections) {
        if (document.getElementById(id)?.getBoundingClientRect().top <= line) visible = id;
      }
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) {
        visible = 'library';
      }
      setActiveSection(visible);
    }
    function requestUpdate() {
      if (!frame) frame = requestAnimationFrame(markVisibleSection);
    }
    window.addEventListener('scroll', requestUpdate, {passive: true});
    window.addEventListener('resize', requestUpdate);
    requestUpdate();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
  }, []);

  if (game) return <Box component="main" className="dedicated-game-page">
    <Box sx={{maxWidth:1120,mx:'auto',px:{xs:2,sm:4,lg:6},py:{xs:3,md:5}}}>
      <Games game={game} onSelect={selectGame}/>
    </Box>
  </Box>;

  const navigation = (
    <Box component="nav" id="site-menu" aria-label="Main sections" className="top-navigation" sx={{position:'fixed',top:0,left:0,right:0,zIndex:1100,height:64,bgcolor:'background.default',borderBottom:1,borderColor:'divider'}}>
      <svg width="0" height="0" aria-hidden="true" focusable="false" style={{position: 'absolute', pointerEvents: 'none'}}>
        <defs>
          <linearGradient id="games-menu-gold" x1="0" y1="0" x2="1" y2="0" gradientTransform="translate(-2 0)">
            <stop offset="0%" stopColor="#e7bc61"/>
            <stop offset="38%" stopColor="#e7bc61"/>
            <stop offset="50%" stopColor="#fff5cf"/>
            <stop offset="62%" stopColor="#e7bc61"/>
            <stop offset="100%" stopColor="#e7bc61"/>
            {!reducedMotion && <animateTransform attributeName="gradientTransform" type="translate"
              values="-2 0;2 0;2 0" keyTimes="0;0.45;1" dur="5.5s" repeatCount="indefinite"/>}
          </linearGradient>
        </defs>
      </svg>
      <ButtonBase component="a" href="#home" aria-label="Aneeket Mangal home" onClick={event=>navigate('home',event)}
        sx={{position:'absolute',left:{xs:8,sm:14},top:11,width:42,height:42,borderRadius:'13px',zIndex:1,color:'primary.main',bgcolor:'background.paper',border:1,borderColor:'divider',fontSize:'.94rem',fontWeight:800,letterSpacing:'-.06em',boxShadow:'0 7px 18px #0004','&:hover':{transform:'translateY(-1px)',color:'primary.main'},'&.Mui-focusVisible':{outline:'2px solid #b5c9e7',outlineOffset:2}}}>AM</ButtonBase>
      <Stack direction="row" spacing={{xs:.25,sm:.75}} useFlexGap sx={{position:'absolute',left:{xs:58,sm:70},right:78,height:'100%',px:{xs:.5,sm:1},justifyContent:'flex-start',alignItems:'stretch',overflowX:'auto',scrollbarWidth:'none','& > :first-of-type':{ml:'auto'},'&::-webkit-scrollbar':{display:'none'}}}>
        {sections.map(([id, label, Icon]) => <ButtonBase component="a" key={id} href={`#${id}`} data-testid={`nav-${id}`} aria-label={label}
          className={id === 'games' ? 'games-menu-item' : undefined}
          aria-current={activeSection === id ? 'location' : undefined} onClick={event => navigate(id, event)}
          sx={{height:64,minWidth:'max-content',px:{xs:1,sm:1.5},justifyContent:'center',gap:{xs:.5,sm:.75},borderBottom:activeSection===id?2:2,borderColor:activeSection===id?(id==='games'?'#e7bc61':'primary.main'):'transparent',
            color: id === 'games' ? '#e7bc61' : activeSection === id ? 'primary.main' : 'text.secondary', bgcolor: 'transparent',
            '&:hover': {color: id === 'games' ? '#f5d38f' : 'primary.main'},
            '&.Mui-focusVisible': {outline: `2px solid ${id === 'games' ? '#e7bc61' : '#b5c9e7'}`, outlineOffset: 2}}}>
          <Icon sx={{fontSize:{xs:19,sm:21},...(id === 'games' && {fill: reducedMotion ? 'currentColor' : 'url(#games-menu-gold)'})}}/>
          <Typography className={id === 'games' ? 'games-menu-label' : undefined}
            sx={{display:{xs:'none',md:'block'},fontSize:'.86rem',whiteSpace:'nowrap',fontWeight:id==='games'||activeSection===id?650:400}}>{label}</Typography>
        </ButtonBase>)}
      </Stack>
    </Box>
  );
  return <Box>
    {navigation}
    <Box component="main" className="site-main" sx={{minWidth:0,pt:'64px'}}>
      <Box sx={{maxWidth: 1120, mx: 'auto', px: {xs: 2, sm: 4, lg: 6}, py: {xs: 3, md: 5}}}>
        <Box component="section" id="home" className="page-section" aria-label="Home"><Home/></Box>
        <Box component="section" id="projects" className="page-section flow-section" aria-label="Projects"><Projects/></Box>
        <Box component="section" id="games" className="page-section flow-section" aria-label="Games"><Games game={game} onSelect={selectGame}/></Box>
        <Box component="section" id="library" className="page-section flow-section" aria-label="Library"><Library/></Box>
      </Box>
    </Box>
  </Box>;
}
