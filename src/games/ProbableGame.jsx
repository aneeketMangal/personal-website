import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Box, Button, Stack, Typography} from '@mui/material';
import Replay from '@mui/icons-material/Replay';
import wordsData from './probable-words.json';

const ROWS=6;
const KEYS=['QWERTYUIOP','ASDFGHJKL','ZXCVBNM'];
function randomWord(){return wordsData.words[Math.floor(Math.random()*wordsData.words.length)];}

export default function ProbableGame(){
  const [target,setTarget]=useState(()=>randomWord());
  const [current,setCurrent]=useState('');
  const [guesses,setGuesses]=useState([]);
  const [message,setMessage]=useState('Every clue has a little randomness. Trust your vocabulary, not your luck.');
  const won=guesses.some(guess=>guess.actual===target);
  const over=won||guesses.length===ROWS;
  const statuses=useMemo(()=>{
    const result={};
    guesses.forEach(({shown})=>[...shown].forEach((letter,index)=>{
      const next=letter===target[index]?'correct':target.includes(letter)?'partial':'wrong';
      if(result[letter]!=='correct'&&(result[letter]!=='partial'||next==='correct'))result[letter]=next;
    }));
    return result;
  },[guesses,target]);
  const start=useCallback(()=>{setTarget(randomWord());setCurrent('');setGuesses([]);setMessage('New word, new odds.');},[]);
  const move=useCallback(key=>{
    if(key==='BACKSPACE'){setCurrent(value=>value.slice(0,-1));return;}
    if(key==='ENTER'){
      if(over)return;
      if(current.length!==5){setMessage('Enter a five-letter word.');return;}
      if(!wordsData.words.includes(current)){setMessage('That word is not in this dictionary.');return;}
      const shown=Math.random()<.5?randomWord():current;
      const next=[...guesses,{actual:current,shown}];
      setGuesses(next);setCurrent('');
      if(current===target)setMessage('You got it. Probability defeated.');
      else if(next.length===ROWS)setMessage(`The word was ${target.toUpperCase()}.`);
      else setMessage(shown===current?'This clue played fair.':'The probability twist changed this clue.');
      return;
    }
    if(!over&&/^[A-Z]$/.test(key))setCurrent(value=>value.length<5?value+key.toLowerCase():value);
  },[current,guesses,over,target]);
  useEffect(()=>{
    const handler=event=>{const key=event.key.toUpperCase();if(key==='ENTER'||key==='BACKSPACE'||/^[A-Z]$/.test(key)){event.preventDefault();move(key);}};
    window.addEventListener('keydown',handler);return()=>window.removeEventListener('keydown',handler);
  },[move]);
  const rows=[...guesses.map(guess=>guess.shown),...(over?[]:[current]),...Array(Math.max(0,ROWS-guesses.length-(over?0:1))).fill('')];
  return <Box className="probable-game">
    <Box className="probable-heading">
      <Box><Typography variant="h2" component="h2">Probable</Typography><Typography sx={{color:'text.secondary'}}>A Wordle-style game where the feedback may bend the truth.</Typography></Box>
      <Button startIcon={<Replay/>} variant="outlined" onClick={start}>New word</Button>
    </Box>
    <Typography className="probable-message" role="status">{message}</Typography>
    <Box className="probable-board" aria-label="Probable word grid">
      {rows.map((word,rowIndex)=><Box className="probable-row" key={rowIndex}>
        {Array.from({length:5},(_,index)=>{const letter=word[index]||'';const submitted=rowIndex<guesses.length;const state=submitted?(letter===target[index]?'correct':target.includes(letter)?'partial':'wrong'):'';return <Box className={`probable-cell ${state}`} key={index}>{letter.toUpperCase()}</Box>;})}
      </Box>)}
    </Box>
    <Stack className="probable-keyboard" spacing={1}>
      {KEYS.map(row=><Box className="probable-key-row" key={row}>{[...row].map(letter=><button type="button" className={statuses[letter.toLowerCase()]||''} onClick={()=>move(letter)} key={letter}>{letter}</button>)}</Box>)}
      <Box className="probable-key-row probable-actions"><button type="button" onClick={()=>move('BACKSPACE')}>DELETE</button><button type="button" onClick={()=>move('ENTER')}>ENTER</button></Box>
    </Stack>
  </Box>;
}
