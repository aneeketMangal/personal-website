import React, {useEffect, useRef, useState} from 'react';
import {Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Stack, TextField, Typography} from '@mui/material';
import Public from '@mui/icons-material/Public';
import Refresh from '@mui/icons-material/Refresh';
import {available, freshRound, loadRound, normalize, placesByLetter, requiredLetter, storageKey, submitPlace} from './atlas-engine';

const countryNames = new Intl.DisplayNames(['en'], {type:'region'});
const country = code => countryNames.of(code) || code;
export default function AtlasGame() {
  const [round, setRound] = useState(loadRound);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [hint, setHint] = useState(null);
  const [browse, setBrowse] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const inputRef = useRef(null);
  const letter = requiredLetter(round);
  const options = available(round);
  const used = new Set(round.chain.map(p => normalize(p.name)));
  const score = round.chain.filter(p => p.player === 'you').length;
  const finished = round.status !== 'playing';
  useEffect(() => { try { localStorage.setItem(storageKey, JSON.stringify(round)); } catch {} }, [round]);
  function play(event) {
    event.preventDefault();
    const result = submitPlace(round, input);
    if (result.error) { setError(result.error); return; }
    setRound(result.round); setInput(''); setError(''); setHint(null);
    inputRef.current?.focus();
  }
  function restart() {
    setRound(freshRound()); setInput(''); setError(''); setHint(null); setConfirm(false);
  }
  return <Box data-testid="atlas-game">
    <Stack direction={{xs:'column',sm:'row'}} spacing={2} sx={{justifyContent:'space-between',mb:3}}>
      <Box><Typography variant="h2" component="h3">Atlas Antakshri</Typography>
        <Typography color="text.secondary" sx={{mt:1}}>One place leads to the next. How far can you go?</Typography></Box>
      <Button startIcon={<Refresh/>} onClick={() => setConfirm(true)}>New round</Button>
    </Stack>
    <Stack direction="row" spacing={1} useFlexGap sx={{flexWrap:'wrap',mb:3}}>
      <Chip label={`${score} ${score === 1 ? 'place' : 'places'} played`}/><Chip variant="outlined" label="40 places × 26 letters"/>
    </Stack>
    <Paper variant="outlined" sx={{p:{xs:2,sm:4},background:'linear-gradient(135deg,#192b30,#171d24)',mb:3}}>
      <Stack direction="row" spacing={2} sx={{alignItems:'center',mb:2}}><Public sx={{fontSize:38,color:'primary.main'}}/>
        <Box><Typography variant="overline">{round.chain.at(-1).player === 'atlas' ? 'Atlas played' : 'You played'}</Typography>
          <Typography variant="h3" component="p" data-testid="atlas-last-place">{round.chain.at(-1).name}</Typography>
          <Typography variant="body2" color="text.secondary">{round.chain.at(-1).kind === 'country' ? 'Country / territory' : country(round.chain.at(-1).country)}</Typography></Box></Stack>
      <Box aria-live="polite" aria-atomic="true">
        {finished ? <Alert severity={round.status === 'won' ? 'success' : 'info'}>{round.status === 'won' ? 'You win! Atlas has no unused reply.' : 'No unused places remain for your letter. Well played!'} You played {score} places.</Alert> :
          <Typography sx={{my:2}}>Your turn. Name a place starting with <Box component="strong" data-testid="atlas-letter" sx={{fontSize:'1.7rem',color:'primary.main',ml:.5}}>{letter}</Box>.</Typography>}
      </Box>
      <Box component="form" onSubmit={play} sx={{mt:2}}>
        <Stack direction={{xs:'column',sm:'row'}} spacing={1.5}>
          <TextField fullWidth label={`Place starting with ${letter}`} value={input} inputRef={inputRef} disabled={finished}
            onChange={e => {setInput(e.target.value);setError('');}} autoComplete="off" error={!!error}
            helperText={error || 'Countries and cities from the stash. No repeats.'} slotProps={{htmlInput:{maxLength:100}}}/>
          <Button type="submit" variant="contained" disabled={finished || !input.trim()} sx={{minWidth:120,alignSelf:{sm:'flex-start'},minHeight:56}}>Play place</Button>
        </Stack>
      </Box>
      <Stack direction="row" spacing={1} useFlexGap sx={{flexWrap:'wrap',mt:1}}>
        <Button disabled={finished} onClick={() => setHint(options[0] || null)}>Give me a hint</Button>
        <Button onClick={() => setBrowse(true)}>Browse {letter} places · {options.length} left</Button>
      </Stack>
      {hint && <Alert severity="info" sx={{mt:2}}>Try {hint.name} ({country(hint.country)}).</Alert>}
    </Paper>
    <Typography variant="body2" color="text.secondary" sx={{mb:3}}>Atlas starts. Enter a place beginning with its last letter, then Atlas replies using yours. Spaces, punctuation and accents don’t count. This offline edition accepts the 1,040 countries, territories, cities and towns in its stash.</Typography>
    <Typography variant="h4" component="h4" sx={{mb:2}}>Your journey</Typography>
    <Box component="ol" aria-label="Place chain" sx={{listStyle:'none',p:0,m:0,display:'flex',flexDirection:'column',gap:1,maxHeight:360,overflowY:'auto'}}>
      {[...round.chain].reverse().map((place,i) => <Paper component="li" variant="outlined" key={place.name} sx={{px:2,py:1.5,display:'flex',gap:2,alignItems:'center'}}>
        <Typography color="text.secondary" sx={{minWidth:24}}>{round.chain.length-i}</Typography>
        <Box sx={{flex:1,minWidth:0}}><Typography sx={{overflowWrap:'anywhere'}}>{place.name}</Typography><Typography variant="caption" color="text.secondary">{place.kind === 'country' ? 'Country / territory' : country(place.country)}</Typography></Box>
        <Chip size="small" variant="outlined" color={place.player === 'you' ? 'primary' : 'default'} label={place.player === 'you' ? 'You' : 'Atlas'}/>
      </Paper>)}
    </Box>
    <Typography variant="caption" color="text.secondary" sx={{display:'block',mt:2}}>Place data: <a href="https://www.geonames.org/" target="_blank" rel="noreferrer">GeoNames</a> · CC BY 4.0</Typography>
    <Dialog open={browse} onClose={() => setBrowse(false)} fullWidth maxWidth="sm">
      <DialogTitle>Places starting with {letter}</DialogTitle><DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{mb:2}}>40 in the stash · {options.length} unused. Pick one to fill your answer.</Typography>
        <Stack spacing={.5}>{placesByLetter[letter].map(place => <Button key={place.name} disabled={finished || used.has(normalize(place.name))}
          sx={{justifyContent:'space-between',textAlign:'left',gap:2}} onClick={() => {setInput(place.name);setError('');setBrowse(false);}}>
          <span>{place.name}{used.has(normalize(place.name)) ? ' · used' : ''}</span><Typography variant="caption">{place.kind === 'country' ? 'Country / territory' : country(place.country)}</Typography>
        </Button>)}</Stack>
      </DialogContent><DialogActions><Button onClick={() => setBrowse(false)}>Close</Button></DialogActions>
    </Dialog>
    <Dialog open={confirm} onClose={() => setConfirm(false)}><DialogTitle>Start a new journey?</DialogTitle><DialogContent>Your current chain will be cleared.</DialogContent><DialogActions><Button onClick={() => setConfirm(false)}>Keep playing</Button><Button onClick={restart}>Start new round</Button></DialogActions></Dialog>
  </Box>;
}
