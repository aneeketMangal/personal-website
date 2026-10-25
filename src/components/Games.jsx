import React from 'react';
import {Box, Button, Card, CardContent, Typography} from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';
import ArrowForward from '@mui/icons-material/ArrowForward';
import MapOutlined from '@mui/icons-material/MapOutlined';
import ExploreOutlined from '@mui/icons-material/ExploreOutlined';
import PublicOutlined from '@mui/icons-material/PublicOutlined';
import LandscapeOutlined from '@mui/icons-material/LandscapeOutlined';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import ContentCutOutlined from '@mui/icons-material/ContentCutOutlined';
import {PageHeader} from './Shared';
import GameBoundary from './GameBoundary';
// Eager imports: opening a game never fetches a potentially stale lazy chunk.
import StatesGame from '../games/StatesGame';
import AngleGame from '../games/AngleGame';
import AtlasGame from '../games/AtlasGame';
import RpsGame from '../games/RpsGame';
import {storageKey as atlasKey} from '../games/atlas-engine';
import {storageKey as statesKey} from '../games/states-engine';
import {key as angleKey} from '../games/angle-engine';

export default function Games({game, onSelect}) {
  function resetSavedGame() {
    try {
      if (game === 'rps') return;
      localStorage.removeItem(game === '2-states' ? statesKey : game === 'atlas' ? atlasKey : angleKey);
    } catch {
      // Both engines also work without browser storage.
    }
  }

  return (
    <>
      {!game && <PageHeader title="Games"/>}
      {game ? (
        <Box data-testid="dedicated-game" sx={{minHeight:'100dvh'}}>
          <Button startIcon={<ArrowBack/>} onClick={() => onSelect(null)} sx={{mb: 4}}>
            All games
          </Button>
          <GameBoundary key={game} onReset={resetSavedGame}>
            {game === '2-states' ? <StatesGame/> : game === 'atlas' ? <AtlasGame/> : game === 'rps' ? <RpsGame/> : <AngleGame/>}
          </GameBoundary>
        </Box>
      ) : (
        <Box className="games-grid">
          <Card>
            <Box className="game-preview modern-game-preview preview-states">
              <Box className="game-icon-orbit"><MapOutlined/></Box>
              <Typography className="preview-kicker">FIND THE ROUTE</Typography>
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
            <Box className="game-preview modern-game-preview preview-rps">
              <StackedBattleIcons/>
              <Typography className="preview-kicker">LAST TEAM STANDING</Typography>
            </Box>
            <CardContent sx={{p:3}}>
              <Typography variant="h3" component="h3">Rock Paper Scissors Battle</Typography>
              <Typography sx={{color:'text.secondary',my:2}}>Watch rocks, paper and scissors collide and convert. Which team takes over?</Typography>
              <Button variant="contained" endIcon={<ArrowForward/>} aria-label="Play Rock Paper Scissors Battle" onClick={() => onSelect('rps')}>Play</Button>
            </CardContent>
          </Card>
          <Card>
            <Box className="game-preview modern-game-preview preview-angle">
              <Box className="game-icon-orbit"><ExploreOutlined/></Box>
              <Typography className="preview-kicker">MATCH THE ANGLE</Typography>
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
          <Card>
            <Box className="game-preview modern-game-preview preview-atlas">
              <Box className="game-icon-orbit"><PublicOutlined/></Box>
              <Typography className="preview-kicker">PLACE TO PLACE</Typography>
            </Box>
            <CardContent sx={{p:3}}>
              <Typography variant="h3" component="h3">Atlas Antakshri</Typography>
              <Typography sx={{color:'text.secondary',my:2}}>Trade places with Atlas. The last letter starts the next adventure.</Typography>
              <Button variant="contained" endIcon={<ArrowForward/>} aria-label="Play Atlas Antakshri" onClick={() => onSelect('atlas')}>Play</Button>
            </CardContent>
          </Card>
        </Box>
      )}
    </>
  );
}

function StackedBattleIcons() {
  return <Box className="battle-icon-stack" aria-hidden="true">
    <Box><LandscapeOutlined/></Box><Box><DescriptionOutlined/></Box><Box><ContentCutOutlined/></Box>
  </Box>;
}
