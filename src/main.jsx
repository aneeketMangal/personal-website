import '@fontsource-variable/montserrat';
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme, lightTheme } from './theme';
import App from './App';
import HangingThemeSwitch from './components/HangingThemeSwitch';
import './styles.css';
import './game-previews.css';
import './theme-switch.css';

function Root() {
  const [mode,setMode]=useState(()=>{
    try {const saved=localStorage.getItem('aneeket:theme');if(saved==='light'||saved==='dark')return saved;} catch {}
    return window.matchMedia?.('(prefers-color-scheme: light)').matches?'light':'dark';
  });
  useEffect(()=>{
    document.documentElement.dataset.theme=mode;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content',mode==='dark'?'#000000':'#f5efe2');
    try {localStorage.setItem('aneeket:theme',mode);} catch {}
  },[mode]);
  return <ThemeProvider theme={mode==='dark'?theme:lightTheme}>
    <CssBaseline/>
    <HangingThemeSwitch mode={mode} onToggle={()=>setMode(value=>value==='dark'?'light':'dark')}/>
    <App/>
  </ThemeProvider>;
}

createRoot(document.getElementById('root')).render(<Root/>);
