import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Stack, Button, Autocomplete, TextField, Chip, Alert, AlertTitle, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Tooltip } from '@mui/material';
import HelpOutline from '@mui/icons-material/HelpOutlined';
import Refresh from '@mui/icons-material/Refresh';
import ArrowForward from '@mui/icons-material/ArrowForward';
import LightbulbOutlined from '@mui/icons-material/LightbulbOutlined';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutlined';
import IndiaMap from './IndiaMap';
import { regions, byId, connected, newRound, loadRound, guess, hint, reveal, storageKey } from './states-engine';
export default function StatesGame() {
  const [round, setRound] = useState(loadRound),
    [selected, setSelected] = useState(null),
    [feedback, setFeedback] = useState(''),
    [error, setError] = useState(false),
    [hidden, setHidden] = useState(new Set()),
    [help, setHelp] = useState(false),
    [reset, setReset] = useState(false);
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(round));
    } catch {}
  }, [round]);
  const done = round.status !== 'playing',
    used = new Set([round.start, round.end, ...round.guesses.map(g => g.id)]),
    linked = connected(round);
  function add() {
    if (!selected) {
      setFeedback('Choose a state from the list.');
      setError(true);
      return;
    }
    const result = guess(round, selected.id);
    setRound(result.round);
    setFeedback(result.error || result.message);
    setError(Boolean(result.error));
    if (!result.error) setSelected(null);
  }
  function restart() {
    setRound(newRound(round));
    setSelected(null);
    setFeedback('');
    setHidden(new Set());
    setReset(false);
  }
  return <Box data-testid="states-game" data-start={round.start} data-end={round.end}><Stack direction={{
      xs: 'column',
      sm: 'row'
    }} spacing={2} sx={{
      justifyContent: "space-between",
      alignItems: {
        xs: 'stretch',
        sm: 'center'
      },
      mb: 3
    }}><Box><Typography variant="h2" component="h3">2 States</Typography><Typography sx={{
          color: "text.secondary",
          mt: 1
        }}>Connect the start and destination using land borders.</Typography></Box><Stack direction="row" spacing={1}><Tooltip title="Rules"><IconButton aria-label="Game rules" onClick={() => setHelp(true)}><HelpOutline /></IconButton></Tooltip><Button startIcon={<Refresh />} variant="outlined" onClick={() => round.guesses.length && !done ? setReset(true) : restart()}>New route</Button></Stack></Stack><Box className="game-layout"><Paper variant="outlined" sx={{
        p: {
          xs: 1.5,
          sm: 2
        }
      }}><IndiaMap round={round} hidden={hidden} /><Stack direction="row" useFlexGap spacing={1.5} sx={{
          flexWrap: "wrap",
          pt: 2,
          pb: .5
        }}><Chip label={`Start: ${byId.get(round.start).name}`} sx={{
            maxWidth: '100%', height: 'auto', minHeight: 34, '& .MuiChip-label': {whiteSpace: 'normal', py: .5},
            bgcolor: '#b6c8e51b',
            color: '#cbdaf0'
          }} /><Chip label={`Destination: ${byId.get(round.end).name}`} sx={{
            maxWidth: '100%', height: 'auto', minHeight: 34, '& .MuiChip-label': {whiteSpace: 'normal', py: .5},
            bgcolor: '#e8baa61b',
            color: '#efd0c2'
          }} /></Stack><Typography variant="caption" sx={{display: 'block', color: 'text.secondary', mt: 1.5}}>Map: geoBoundaries / DataMeet · <a href="https://creativecommons.org/licenses/by/2.5/in/" target="_blank" rel="noreferrer">CC BY 2.5 India</a></Typography></Paper><Paper variant="outlined" sx={{
        p: {
          xs: 2.5,
          md: 3
        },
        alignSelf: 'start'
      }}>{done && <Alert severity={round.status === 'won' ? 'success' : 'info'} sx={{
          mb: 3
        }}><AlertTitle>{round.status === 'won' ? 'Route complete' : 'Route revealed'}</AlertTitle>{round.guesses.length} guesses used.</Alert>}<Typography variant="h5" sx={{
          mb: 2
        }}>Add a state</Typography><Typography sx={{
          color: "text.secondary",
          mb: 2
        }}>{round.guesses.length} / {round.max} guesses</Typography><Autocomplete options={regions.filter(r => !used.has(r.id)).sort((a, b) => a.name.localeCompare(b.name))} getOptionLabel={r => r.name} filterOptions={(options, {
          inputValue
        }) => {
          const q = inputValue.toLowerCase().replace(/[^a-z]/g, '');
          return options.filter(r => [r.name, r.id, r.badge, ...r.aliases].some(s => s.toLowerCase().replace(/[^a-z]/g, '').includes(q)));
        }} value={selected} onChange={(_, v) => setSelected(v)} disabled={done} isOptionEqualToValue={(a, b) => a.id === b.id} renderInput={p => <TextField {...p} label="State or union territory" onKeyDown={e => {
          if (e.key === 'Enter' && selected) {
            e.preventDefault();
            add();
          }
        }} />} renderOption={({key, ...props}, r) => <li {...props} key={key}><Stack><Typography>{r.name}</Typography><Typography variant="caption" sx={{
              color: "text.secondary"
            }}>{r.kind}</Typography></Stack></li>} /><Button fullWidth variant="contained" endIcon={<ArrowForward />} disabled={done} onClick={add} sx={{
          mt: 2
        }}>Add state</Button>{feedback && <Typography role="status" sx={{
          color: error ? 'error.main' : 'text.secondary',
          mt: 2
        }}>{feedback}</Typography>}<Box sx={{
          mt: 3
        }}><Typography variant="h6" sx={{
            mb: 1.5
          }}>Your route</Typography><Stack direction="row" spacing={1} useFlexGap sx={{
            flexWrap: "wrap"
          }}>{round.guesses.length ? round.guesses.map(g => <Chip key={g.id} label={byId.get(g.id).name} icon={g.rating === 'optimal' ? <CheckCircleOutline /> : undefined} onClick={() => setHidden(h => {
              const n = new Set(h);
              n.has(g.id) ? n.delete(g.id) : n.add(g.id);
              return n;
            })} variant={hidden.has(g.id) ? 'outlined' : 'filled'} sx={{
              color: linked.has(g.id) ? '#c7e5d4' : 'text.primary',
              bgcolor: hidden.has(g.id) ? undefined : '#26323b',
              height: 'auto',
              minHeight: 34,
              '& .MuiChip-label': {
                py: .7,
                whiteSpace: 'normal'
              }
            }} />) : <Typography sx={{
              color: "text.secondary"
            }}>No states added.</Typography>}</Stack></Box>{done ? <Box sx={{
          mt: 3
        }}><Typography sx={{
            color: "text.secondary"
          }}>{round.solution.map(id => byId.get(id).name).join(' → ')}</Typography><Button variant="outlined" onClick={restart} sx={{
            mt: 2
          }}>New route</Button></Box> : <Stack spacing={1.5} sx={{
          mt: 4
        }}><Button color="secondary" variant="outlined" startIcon={<LightbulbOutlined />} disabled={round.hints === 3} onClick={() => {
            setRound(hint(round));
            setFeedback('Hint added to the map.');
            setError(false);
          }}>{['Reveal next outline', 'Reveal route outlines', 'Show state initials', 'Hints used'][round.hints]}</Button><Button color="inherit" onClick={() => {
            setRound(reveal(round));
            setFeedback('');
          }}>Reveal route</Button></Stack>}</Paper></Box><Dialog open={help} onClose={() => setHelp(false)} fullWidth maxWidth="sm"><DialogTitle>2 States rules</DialogTitle><DialogContent><Typography sx={{
          mb: 2
        }}>Choose the states or union territories needed to connect the two highlighted regions. A complete land route finishes the round.</Typography><Typography sx={{
          mb: 2
        }}>States can be added in any order. Blue is the start, peach is the destination, and connected guesses are mint. You get four extra guesses beyond a shortest route.</Typography><Typography sx={{
          mb: 2
        }}>Hints reveal outlines and then initials. Island territories have no land route. Puducherry connects through Tamil Nadu only; remote exclaves do not create shortcuts.</Typography><Typography variant="body2" sx={{
          color: "text.secondary"
        }}>Map data: geoBoundaries / DataMeet, CC BY 2.5 India. Boundaries are used for gameplay, not as an authoritative statement.</Typography></DialogContent><DialogActions><Button onClick={() => setHelp(false)}>Close</Button></DialogActions></Dialog><Dialog open={reset} onClose={() => setReset(false)}><DialogTitle>Start a new route?</DialogTitle><DialogContent><Typography>The current route will be cleared.</Typography></DialogContent><DialogActions><Button onClick={() => setReset(false)}>Cancel</Button><Button variant="contained" onClick={restart}>New route</Button></DialogActions></Dialog></Box>;
}
