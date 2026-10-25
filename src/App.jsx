import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Box, ButtonBase, Drawer, IconButton, Stack, Typography, useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
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
    game: name === 'games' && ['2-states', 'angle'].includes(detail) ? detail : null
  };
}

export default function App() {
  const [activeSection, setActiveSection] = useState(() => readHash().section);
  const [game, setGame] = useState(() => readHash().game);
  const [mobileOpen, setMobileOpen] = useState(false);
  const desktop = useMediaQuery('(min-width:900px)');
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
    setMobileOpen(false);
    clearTimeout(navigationTimer.current);
    navigationTimer.current = setTimeout(() => scrollToSection(section), mobileOpen ? 250 : 0);
  }

  function selectGame(nextGame) {
    setGame(nextGame);
    setActiveSection('games');
    updateHash(nextGame ? `games/${nextGame}` : 'games');
    requestAnimationFrame(() => scrollToSection('games'));
  }

  useEffect(() => {
    if (desktop) setMobileOpen(false);
  }, [desktop]);

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
      const line = desktop ? 110 : 145;
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
  }, [desktop]);

  const navigation = (
    <Box component="nav" id="site-menu" aria-label="Main sections" className="floating-navigation" sx={{position: desktop ? 'fixed' : 'relative', right: desktop ? 24 : 'auto', top: desktop ? '50%' : 'auto', transform: desktop ? 'translateY(-50%)' : 'none', zIndex: 1100, maxHeight: desktop ? 'calc(100dvh - 16px)' : 'none', overflowY: 'auto', scrollbarWidth: 'none', '&::-webkit-scrollbar': {display: 'none'}}}>
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
      <Stack spacing={1} useFlexGap>
        {sections.map(([id, label, Icon]) => <ButtonBase component="a" key={id} href={`#${id}`} data-testid={`nav-${id}`} aria-label={label}
          className={id === 'games' ? 'games-menu-item' : undefined}
          aria-current={activeSection === id ? 'location' : undefined} onClick={event => navigate(id, event)}
          sx={{minHeight: 48, minWidth: 48, width: desktop ? 192 : '100%', px: desktop ? 0 : 2, justifyContent: 'flex-start', gap: 1.5,
            color: id === 'games' ? '#e7bc61' : activeSection === id ? 'primary.main' : 'text.secondary', bgcolor: 'transparent',
            '&:hover': {color: id === 'games' ? '#f5d38f' : 'primary.main'},
            '&.Mui-focusVisible': {outline: `2px solid ${id === 'games' ? '#e7bc61' : '#b5c9e7'}`, outlineOffset: 2}}}>
          <Icon sx={{fontSize: 25, ...(id === 'games' && {fill: reducedMotion ? 'currentColor' : 'url(#games-menu-gold)'})}}/>
          <Typography className={id === 'games' ? 'games-menu-label' : undefined}
            sx={{fontSize: '1rem', whiteSpace: 'nowrap', fontWeight: id === 'games' || activeSection === id ? 650 : 400}}>{label}</Typography>
        </ButtonBase>)}
      </Stack>
    </Box>
  );
  return <Box>
    {desktop ? navigation : <>
      <IconButton aria-label="Open navigation" aria-controls={mobileOpen ? 'site-menu' : undefined} aria-expanded={mobileOpen}
        onClick={() => setMobileOpen(true)} sx={{position: 'fixed', top: 12, right: 12, zIndex: 1100, width: 48, height: 48, bgcolor: 'transparent', color: 'text.primary'}}>
        <MenuIcon/>
      </IconButton>
      <Drawer anchor="right" open={mobileOpen} onClose={() => setMobileOpen(false)}
        sx={{'& .MuiDrawer-paper': {width: 288, maxWidth: 'calc(100vw - 32px)', bgcolor: '#12171d', backgroundImage: 'none'}}}>
        <Box sx={{p: 2}}>
          <Box sx={{display: 'flex', justifyContent: 'flex-end', mb: 2}}>
            <IconButton aria-label="Close navigation" onClick={() => setMobileOpen(false)}><CloseIcon/></IconButton>
          </Box>
          {navigation}
        </Box>
      </Drawer>
    </>}
    <Box component="main" className="site-main" sx={{minWidth: 0, pr: desktop ? '240px' : 0, pt: desktop ? 0 : 5}}>
      <Box sx={{maxWidth: 1120, mx: 'auto', px: {xs: 2, sm: 4, lg: 6}, py: {xs: 3, md: 5}}}>
        <Box component="section" id="home" className="page-section" aria-label="Home"><Home/></Box>
        <Box component="section" id="projects" className="page-section flow-section" aria-label="Projects"><Projects/></Box>
        <Box component="section" id="games" className="page-section flow-section" aria-label="Games"><Games game={game} onSelect={selectGame}/></Box>
        <Box component="section" id="library" className="page-section flow-section" aria-label="Library"><Library/></Box>
      </Box>
    </Box>
  </Box>;
}
