import React, {useState, useRef, useEffect} from 'react';
import {Box, Typography, Stack, ButtonBase, Button, Dialog, DialogTitle, DialogContent, IconButton, Chip, useMediaQuery} from '@mui/material';
import Close from '@mui/icons-material/Close';
import OpenInNew from '@mui/icons-material/OpenInNew';
import {books} from '../data/books';
import {PageHeader, asset} from './Shared';

export default function Library() {
  const [selected, setSelected] = useState(null), [pulling, setPulling] = useState(null);
  const [open, setOpen] = useState(false), [coverError, setCoverError] = useState(false);
  const timer = useRef(), origin = useRef();
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  useEffect(() => () => clearTimeout(timer.current), []);
  function choose(book, event) {
    if (pulling || open) return;
    origin.current = event.currentTarget;
    setSelected(book); setCoverError(false); setPulling(book.id);
    timer.current = setTimeout(() => setOpen(true), reduced ? 0 : 360);
  }
  function close() {
    setOpen(false); setPulling(null);
    origin.current?.focus({preventScroll: true});
  }
  function bookButton(book) {
    return <ButtonBase key={book.id} className={`shelf-book${book.stacked ? ' horizontal-book' : ''}${book.title.length > 28 ? ' long-title' : ''}${pulling === book.id ? ' is-pulling' : ''}`}
      aria-label={`Open ${book.title}`} aria-haspopup="dialog" aria-expanded={pulling === book.id}
      onClick={event => choose(book, event)} style={{'--book-color': book.color, '--book-width': `${book.width}px`, '--book-height': `${book.height}px`, '--book-lean': `${book.lean || 0}deg`}}>
      <span className="spine-band top"/><span className="book-spine-title">{book.title}</span><span className="spine-band bottom"/>
    </ButtonBase>;
  }
  return <Box>
    <PageHeader title="Library" description="Books and articles."/>
    {[['tech', 'Tech'], ['non-tech', 'Non-tech']].map(([category, label]) => {
      const entries = books.filter(book => book.category === category);
      const articles = entries.filter(book => book.type === 'Article').length;
      const upright = entries.filter(book => !book.stacked);
      const stacked = entries.filter(book => book.stacked);
      return <Box component="section" key={category} className="library-shelf" aria-label={`${label} bookshelf`}>
        <Stack direction="row" sx={{alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.5}}>
          <Typography variant="h4" component="h3">{label}</Typography>
          <Typography variant="body2" sx={{color: 'text.secondary', textAlign: 'right'}}>{entries.length - articles} books{articles ? ` · ${articles} article` : ''}</Typography>
        </Stack>
        <Box className="shelf-scroll"><Box className="book-rack">
          <Box className="upright-books">{upright.map(bookButton)}</Box>
          {stacked.length>0&&<Box className="stacked-books">{stacked.map(bookButton)}</Box>}
        </Box></Box>
        <Box className="wooden-plank" aria-hidden="true"/>
      </Box>;
    })}
    <Typography variant="body2" sx={{color: 'text.secondary'}}>Select a spine to open it. Swipe the shelves on smaller screens.</Typography>
    <Dialog open={open} onClose={close} fullWidth maxWidth="md" transitionDuration={reduced ? 0 : 180} aria-labelledby="book-dialog-title">
      <DialogTitle component="div" sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <Stack direction="row" spacing={1}><Chip size="small" label={selected?.category === 'tech' ? 'Tech' : 'Non-tech'} variant="outlined"/>{selected?.type === 'Article' && <Chip label="Article" size="small" variant="outlined"/>}</Stack>
        <IconButton aria-label="Close book" onClick={close}><Close/></IconButton>
      </DialogTitle>
      <DialogContent sx={{pb: 4}}>{selected && <Stack direction={{xs: 'column', sm: 'row'}} spacing={4} sx={{alignItems: {xs: 'center', sm: 'flex-start'}}}>
        <Box className="book-cover" style={{'--book-color': selected.color}}>
          {selected.cover && !coverError ? <img src={asset(selected.cover)} alt={`${selected.title} cover`} onError={() => setCoverError(true)}/> : <><Typography variant="h4">{selected.title}</Typography><Typography>{selected.author}</Typography></>}
        </Box>
        <Box sx={{flex: 1, minWidth: 0}}>
          <Typography id="book-dialog-title" component="h2" variant="h3" sx={{mb: 1}}>{selected.title}</Typography>
          <Typography sx={{color: 'text.secondary', mb: 2.5}}>{selected.author}</Typography>
          <Typography sx={{mb: 3}}>{selected.description}</Typography>
          {selected.note && <><Typography variant="h6" sx={{mb: 1}}>Notes</Typography><Typography sx={{color: 'text.secondary', mb: 3}}>{selected.note}</Typography></>}
          <Button href={selected.url} target="_blank" rel="noopener noreferrer" variant="outlined" endIcon={<OpenInNew/>}>{selected.linkLabel}</Button>
        </Box>
      </Stack>}</DialogContent>
    </Dialog>
  </Box>;
}
