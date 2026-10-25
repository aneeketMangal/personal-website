import React, { useState, useEffect, useRef } from 'react';
import { Box, Paper, Typography, Stack, Button, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Alert, AlertTitle, Tooltip } from '@mui/material';
import HelpOutline from '@mui/icons-material/HelpOutlined';
import Refresh from '@mui/icons-material/Refresh';
import Check from '@mui/icons-material/Check';
import { normalize, distance, direction, freshAngle, loadAngle, submitAngle, won, over, key } from './angle-engine';
const point = (angle, r) => [220 + Math.cos(angle * Math.PI / 180) * r, 220 + Math.sin(angle * Math.PI / 180) * r];
const arc = (base, sweep, r, fill = false) => {
  if (sweep < .01) return '';
  const a = point(base, r),
    b = point(base + sweep, r);
  return `${fill ? 'M220 220L' : 'M'}${a[0]} ${a[1]}A${r} ${r} 0 ${sweep > 180 ? 1 : 0} 1 ${b[0]} ${b[1]}${fill ? 'Z' : ''}`;
};
function temperature(d) {
  return d <= 5 ? 'Matched' : d <= 30 ? 'Close' : d <= 60 ? 'Warm' : d <= 90 ? 'Cool' : 'Far';
}
export default function AngleGame() {
  const [r, setRound] = useState(loadAngle),
    [help, setHelp] = useState(false),
    [confirm, setConfirm] = useState(false);
  const svg = useRef(),
    drag = useRef(null);
  const finished = over(r),
    matched = won(r);
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(r));
    } catch {}
  }, [r]);
  const baseline = point(r.base, 192),
    handle = point(r.base + r.estimate, 180),
    target = point(r.base + r.target, 185),
    startLabel = point(r.base, 208);
  function setEstimate(a) {
    setRound(old => over(old) ? old : {
      ...old,
      estimate: normalize(Math.round(a)),
      moved: old.moved || normalize(Math.round(a)) !== old.estimate
    });
  }
  function move(e) {
    const matrix = svg.current.getScreenCTM();
    if (!matrix) return;
    const p = svg.current.createSVGPoint();
    p.x = e.clientX;
    p.y = e.clientY;
    const q = p.matrixTransform(matrix.inverse());
    setEstimate(normalize(Math.atan2(q.y - 220, q.x - 220) * 180 / Math.PI - r.base));
  }
  function restart() {
    setRound(freshAngle());
    setConfirm(false);
  }
  const closest = r.guesses.reduce((best, g) => best === null || distance(g, r.target) < distance(best, r.target) ? g : best, null);
  return <Box data-testid="angle-game" data-target={r.target}><Stack direction={{
      xs: 'column',
      sm: 'row'
    }} spacing={2} sx={{
      justifyContent: "space-between",
      alignItems: {
        xs: 'stretch',
        sm: 'center'
      },
      mb: 3
    }}><Box><Typography variant="h2" component="h3">What’s Your Angle</Typography><Typography sx={{
          color: "text.secondary",
          mt: 1
        }}>Drag the handle to match the target. Four attempts.</Typography></Box><Stack direction="row" spacing={1}><Tooltip title="Rules"><IconButton aria-label="Angle game rules" onClick={() => setHelp(true)}><HelpOutline /></IconButton></Tooltip><Button startIcon={<Refresh />} variant="outlined" onClick={() => r.guesses.length && !finished ? setConfirm(true) : restart()}>New angle</Button></Stack></Stack><Box className="game-layout"><Paper variant="outlined" sx={{
        p: {
          xs: 1,
          sm: 2
        },
        bgcolor: '#151d25'
      }}><Box sx={{
          width: '100%',
          maxWidth: 550,
          mx: 'auto'
        }}><svg ref={svg} viewBox="0 0 440 440" style={{
            width: '100%',
            display: 'block',
            touchAction: 'none'
          }} aria-label="Angle dial" role="group"><circle cx="220" cy="220" r="192" fill="#1c2631" stroke="#3c4a58" strokeWidth="1.5" /><path d={arc(r.base, r.estimate, 70, true)} fill="#b5c9e71c" /><path d={arc(r.base, r.estimate, 70)} fill="none" stroke="#9bb0cc" strokeWidth="2.5" />{r.guesses.map((g, i) => {
              const end = point(r.base + g, 176);
              return <line key={i} x1="220" y1="220" x2={end[0]} y2={end[1]} stroke="#e6b4a6" strokeWidth="2.5" opacity=".24" />;
            })}<line x1="220" y1="220" x2={baseline[0]} y2={baseline[1]} stroke="#8c9bac" strokeWidth="4" strokeLinecap="round" /><text x={startLabel[0]} y={startLabel[1]} textAnchor="middle" dominantBaseline="middle" fill="#b1bdca" fontFamily="Manrope,sans-serif" fontSize="11">START</text>{finished && <g data-testid="target-ray"><path d={arc(r.base, r.target, 90)} fill="none" stroke="#a8d0b7" strokeWidth="2.5" /><line x1="220" y1="220" x2={target[0]} y2={target[1]} stroke="#a8d0b7" strokeWidth="4" strokeLinecap="round" /></g>}<line x1="220" y1="220" x2={handle[0]} y2={handle[1]} stroke="#e6b4a6" strokeWidth="4" strokeLinecap="round" /><g className="angle-handle" role="slider" tabIndex={finished ? -1 : 0} aria-label="Angle estimate" aria-valuemin="0" aria-valuemax="359" aria-valuenow={r.estimate} aria-valuetext={`${r.estimate} degrees`} aria-disabled={finished} onPointerDown={e => {
              if (finished) return;
              e.preventDefault();
              e.currentTarget.focus();
              e.currentTarget.setPointerCapture(e.pointerId);
              drag.current = e.pointerId;
              move(e);
            }} onPointerMove={e => {
              if (drag.current === e.pointerId) move(e);
            }} onPointerUp={e => {
              drag.current = null;
              if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
            }} onPointerCancel={() => drag.current = null} onKeyDown={e => {
              if (finished) return;
              const steps = {
                ArrowRight: 1,
                ArrowUp: 1,
                ArrowLeft: -1,
                ArrowDown: -1,
                PageUp: 15,
                PageDown: -15
              };
              if (e.key in steps) {
                e.preventDefault();
                setEstimate(r.estimate + steps[e.key] * (e.shiftKey ? 10 : 1));
              } else if (e.key === 'Home' || e.key === 'End') {
                e.preventDefault();
                setEstimate(e.key === 'Home' ? 0 : 359);
              }
            }}><circle className="handle-hit" cx={handle[0]} cy={handle[1]} r="39" fill="transparent" /><circle className="handle-ring" cx={handle[0]} cy={handle[1]} r="17" fill="#e6b4a61c" stroke="#e6b4a659" /><circle cx={handle[0]} cy={handle[1]} r="9" fill="#e6b4a6" /></g><circle cx="220" cy="220" r="6.5" fill="#edf0f2" stroke="#151d25" strokeWidth="2.5" /></svg></Box></Paper><Paper variant="outlined" sx={{
        p: {
          xs: 2.5,
          md: 3
        },
        alignSelf: 'start'
      }}><Typography variant="body1" sx={{
          color: "text.secondary"
        }}>Target angle</Typography><Typography component="p" sx={{
          fontSize: 48,
          fontWeight: 500,
          color: '#e6b4a6',
          lineHeight: 1.3,
          my: 1
        }}>Make {r.target}°</Typography><Chip label="Within 5° counts as a match" size="small" variant="outlined" sx={{
          mb: 3
        }} /><Typography sx={{
          color: "text.secondary",
          mb: 2
        }}>Measure clockwise from the gray start line.</Typography><Stack direction="row" spacing={1} sx={{
          mb: 2
        }}>{[0, 1, 2, 3].map(i => <Box key={i} aria-hidden="true" sx={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            bgcolor: i < r.guesses.length ? '#e6b4a6' : '#394550'
          }} />)}</Stack><Typography sx={{
          mb: 2
        }}>{Math.max(0, 4 - r.guesses.length)} attempts left</Typography>{!finished && <><Button fullWidth variant="contained" disabled={!r.moved} sx={{
            bgcolor: '#e6b4a6',
            color: '#29211e',
            '&:hover': {
              bgcolor: '#f0c6b9'
            }
          }} onClick={() => setRound(submitAngle(r))}>Lock angle</Button><Typography variant="body2" sx={{
            color: "text.secondary",
            mt: 1.5
          }}>The exact value is shown after you lock your estimate.</Typography></>}{finished && <Alert severity={matched ? 'success' : 'info'} sx={{
          mb: 2
        }}><AlertTitle>{matched ? `Matched in ${r.guesses.length} ${r.guesses.length === 1 ? 'attempt' : 'attempts'}` : 'Round finished'}</AlertTitle>Closest estimate: {closest}° · {distance(closest, r.target)}° off</Alert>}<Box sx={{
          mt: 3
        }}><Typography variant="h6" sx={{
            mb: 1.5
          }}>Attempts</Typography>{r.guesses.length ? <Stack spacing={1}>{r.guesses.map((g, i) => <Paper key={i} variant="outlined" sx={{
              p: 1.5,
              bgcolor: '#ffffff03'
            }}><Stack direction="row" sx={{
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1
              }}><Typography variant="h6">{g}°</Typography><Chip label={temperature(distance(g, r.target))} color={distance(g, r.target) <= 5 ? 'success' : 'default'} size="small" /></Stack>{distance(g, r.target) > 5 && <Typography variant="body2" sx={{
                color: "text.secondary"
              }}>{direction(g, r.target)}</Typography>}</Paper>)}</Stack> : <Typography sx={{
            color: "text.secondary"
          }}>No attempts yet.</Typography>}</Box>{finished && <Button fullWidth variant="contained" sx={{
          mt: 3
        }} onClick={restart}>New angle</Button>}</Paper></Box><Dialog open={help} onClose={() => setHelp(false)} maxWidth="sm" fullWidth><DialogTitle>How to play</DialogTitle><DialogContent><Typography sx={{
          mb: 2
        }}>Make the target angle by dragging the peach handle. Measure clockwise from the gray start line.</Typography><Typography sx={{
          mb: 2
        }}>You have four attempts. The exact angle is hidden until you lock an estimate. Feedback shows whether to move clockwise or counterclockwise.</Typography><Typography sx={{
          mb: 2
        }}>Any estimate within five degrees of the target counts as a match. After the round, the correct ray appears in mint.</Typography><Typography sx={{
          color: "text.secondary"
        }}>Keyboard: focus the handle and use arrow keys. Hold Shift for larger steps.</Typography></DialogContent><DialogActions><Button onClick={() => setHelp(false)}>Close</Button></DialogActions></Dialog><Dialog open={confirm} onClose={() => setConfirm(false)}><DialogTitle>Start a new angle?</DialogTitle><DialogContent><Typography>The current round will be cleared.</Typography></DialogContent><DialogActions><Button onClick={() => setConfirm(false)}>Cancel</Button><Button variant="contained" onClick={restart}>New angle</Button></DialogActions></Dialog></Box>;
}
