import React from 'react';
import {Box, Button, Card, CardContent, Typography} from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';
import ArrowForward from '@mui/icons-material/ArrowForward';
import {PageHeader, asset} from './Shared';
import GameBoundary from './GameBoundary';
// Eager imports: opening a game never fetches a potentially stale lazy chunk.
import StatesGame from '../games/StatesGame';
import AngleGame from '../games/AngleGame';
import {storageKey as statesKey} from '../games/states-engine';
import {key as angleKey} from '../games/angle-engine';

export default function Games({game, onSelect}) {
  function resetSavedGame() {
    try {
      localStorage.removeItem(game === '2-states' ? statesKey : angleKey);
    } catch {
      // Both engines also work without browser storage.
    }
  }

  return (
    <>
      <PageHeader title="Games"/>
      {game ? (
        <Box data-testid="inline-game">
          <Button startIcon={<ArrowBack/>} onClick={() => onSelect(null)} sx={{mb: 3}}>
            All games
          </Button>
          <GameBoundary key={game} onReset={resetSavedGame}>
            {game === '2-states' ? <StatesGame/> : <AngleGame/>}
          </GameBoundary>
        </Box>
      ) : (
        <Box className="games-grid">
          <Card>
            <Box className="game-preview map-preview">
              <img src={asset('assets/states-preview.svg')} alt="Indian map"/>
            </Box>
            <CardContent sx={{p: 3}}>
              <Typography variant="h3" component="h3">2 States</Typography>
              <Typography sx={{color: 'text.secondary', my: 2}}>
                Connect two Indian states using shared land borders.
              </Typography>
              <Button variant="contained" endIcon={<ArrowForward/>}
                aria-label="Play 2 States" onClick={() => onSelect('2-states')}>Play</Button>
            </CardContent>
          </Card>
          <Card>
            <Box className="game-preview angle-preview">
              <svg viewBox="0 0 440 260" aria-hidden="true">
                <circle cx="220" cy="132" r="98" fill="#242c38" stroke="#445060"/>
                <path d="M220 132v95" stroke="#9aa8b6" strokeWidth="4"/>
                <path d="m220 132 83 36" stroke="#e5b5a8" strokeWidth="5"/>
                <circle cx="303" cy="168" r="9" fill="#e5b5a8"/>
                <circle cx="220" cy="132" r="6" fill="#edf0f2"/>
                <path d="M220 170a38 38 0 1 1 35-24" fill="none" stroke="#c6b9e2" strokeWidth="3"/>
              </svg>
            </Box>
            <CardContent sx={{p: 3}}>
              <Typography variant="h3" component="h3">What’s Your Angle</Typography>
              <Typography sx={{color: 'text.secondary', my: 2}}>
                Drag the handle to match a target angle. You have four attempts.
              </Typography>
              <Button variant="contained" color="secondary" endIcon={<ArrowForward/>}
                aria-label="Play What’s Your Angle" onClick={() => onSelect('angle')}>Play</Button>
            </CardContent>
          </Card>
        </Box>
      )}
    </>
  );
}
