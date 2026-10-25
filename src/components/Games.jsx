import React from 'react';
import {Box, Button, Typography} from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';
import MapOutlined from '@mui/icons-material/MapOutlined';
import ExploreOutlined from '@mui/icons-material/ExploreOutlined';
import LandscapeOutlined from '@mui/icons-material/LandscapeOutlined';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import ContentCutOutlined from '@mui/icons-material/ContentCutOutlined';
import CasinoOutlined from '@mui/icons-material/CasinoOutlined';
import {PageHeader} from './Shared';
import GameBoundary from './GameBoundary';
// Eager imports: opening a game never fetches a potentially stale lazy chunk.
import StatesGame from '../games/StatesGame';
import AngleGame from '../games/AngleGame';
import RpsGame from '../games/RpsGame';
import ProbableGame from '../games/ProbableGame';
import {storageKey as statesKey} from '../games/states-engine';
import {key as angleKey} from '../games/angle-engine';

export default function Games({game, onSelect}) {
  function resetSavedGame() {
    try {
      if (game === 'rps' || game === 'probable') return;
      localStorage.removeItem(game === '2-states' ? statesKey : angleKey);
    } catch {
      // Both engines also work without browser storage.
    }
  }

  return (
    <>
      {!game && <PageHeader title="Games" description="Always up for geography and word quizzes."/>}
      {game ? (
        <Box data-testid="dedicated-game" sx={{minHeight:'100dvh'}}>
          <Button startIcon={<ArrowBack/>} onClick={() => onSelect(null)} sx={{mb: 4}}>
            All games
          </Button>
          <GameBoundary key={game} onReset={resetSavedGame}>
            {game === '2-states' ? <StatesGame/> : game === 'probable' ? <ProbableGame/> : game === 'rps' ? <RpsGame/> : <AngleGame/>}
          </GameBoundary>
        </Box>
      ) : (
        <Box className="project-list game-list">
          {[
            {slug:'2-states',title:'2 States',subtext:'Geography',description:'Connect two Indian states using shared land borders.',icon:<MapOutlined/>},
            {slug:'probable',title:'Probable',subtext:'Word game',description:'A five-letter word game where a dash of randomness can bend the clues.',icon:<CasinoOutlined/>},
            {slug:'rps',title:'Rock Paper Scissors Battle',subtext:'Simulation',description:'Watch rocks, paper and scissors collide and convert. Which team takes over?',icon:<StackedBattleIcons/>},
            {slug:'angle',title:'What’s Your Angle',subtext:'Geometry',description:'Drag the handle to match a target angle. You have four attempts.',icon:<ExploreOutlined/>}
          ].map(item=><Box component="article" key={item.slug} className="project-row game-row" role="link" tabIndex={0}
            aria-labelledby={`game-${item.slug}-title`} onClick={()=>onSelect(item.slug)} onKeyDown={event=>{
              if(event.key==='Enter'||event.key===' '){event.preventDefault();onSelect(item.slug);}
            }}>
            <Box className="game-row-icon" aria-hidden="true">{item.icon}</Box>
            <Box sx={{minWidth:0}}>
              <Typography id={`game-${item.slug}-title`} variant="h4" component="h3" sx={{fontWeight:700}}>{item.title}</Typography>
              <Typography className="project-subtext" sx={{mt:.8,mb:1}}>{item.subtext}</Typography>
              <Typography sx={{color:'text.secondary',lineHeight:1.7,maxWidth:790}}>{item.description}</Typography>
            </Box>
          </Box>)}
        </Box>
      )}
    </>
  );
}

function StackedBattleIcons() {
  return <Box className="mini-battle-icons" aria-hidden="true">
    <LandscapeOutlined/><DescriptionOutlined/><ContentCutOutlined/>
  </Box>;
}
