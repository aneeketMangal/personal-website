import React from 'react';
import {Alert, AlertTitle, Box, Button, Stack} from '@mui/material';

// A game error must never unmount the rest of the personal page.
export default class GameBoundary extends React.Component {
  state = {error: false, attempt: 0};

  static getDerivedStateFromError() {
    return {error: true};
  }

  retry = (reset = false) => {
    if (reset) this.props.onReset();
    this.setState(({attempt}) => ({error: false, attempt: attempt + 1}));
  };

  render() {
    if (this.state.error) {
      return (
        <Alert severity="warning" data-testid="game-recovery">
          <AlertTitle>The game could not load</AlertTitle>
          The rest of the page is still available. Try again, or reset this game’s saved round.
          <Stack direction="row" spacing={1.5} useFlexGap sx={{mt: 2, flexWrap: 'wrap'}}>
            <Button variant="outlined" onClick={() => this.retry()}>Try again</Button>
            <Button color="inherit" onClick={() => this.retry(true)}>Reset game</Button>
          </Stack>
        </Alert>
      );
    }
    return <Box key={this.state.attempt}>{this.props.children}</Box>;
  }
}
