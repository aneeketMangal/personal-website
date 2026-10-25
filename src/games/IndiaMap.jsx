import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Box, IconButton, Stack, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CenterFocusStrong from '@mui/icons-material/CenterFocusStrong';
import { feature, merge } from 'topojson-client';
import { geoAzimuthalEqualArea, geoPath, geoCentroid, geoArea, select, zoom, zoomIdentity } from 'd3';
import topology from '../data/india-states.topo.json';
import { byId, connected } from './states-engine';
const outline = {
  type: 'Feature',
  properties: {},
  geometry: merge(topology, topology.objects.states.geometries)
};
const fs = feature(topology, topology.objects.states).features;
const features = fs.map(f => {
  if (f.id === 'PY') return {
    ...f,
    geometry: {
      ...f.geometry,
      coordinates: f.geometry.coordinates.filter(p => {
        const [x, y] = geoCentroid({
          type: 'Polygon',
          coordinates: p
        });
        return x > 79 && y > 10 && y < 13;
      })
    }
  };
  return f;
});
const main = f => f.geometry.type === 'MultiPolygon' ? {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'Polygon',
    coordinates: [...f.geometry.coordinates].sort((a, b) => geoArea({
      type: 'Polygon',
      coordinates: b
    }) - geoArea({
      type: 'Polygon',
      coordinates: a
    }))[0]
  }
} : f;
export default function IndiaMap({
  round,
  hidden
}) {
  const holder = useRef(),
    svgRef = useRef(),
    zoomRef = useRef();
  const [size, setSize] = useState({
      w: 520,
      h: 480
    }),
    [transform, setTransform] = useState(zoomIdentity);
  useEffect(() => {
    const node = holder.current;
    function measure(rect = node.getBoundingClientRect()) {
      const w = Math.round(rect.width), h = Math.round(rect.height);
      if (w <= 0 || h <= 0) return;
      setSize(previous => previous.w === w && previous.h === h ? previous : {w, h});
    }
    measure();
    if (typeof ResizeObserver === 'function') {
      const observer = new ResizeObserver(entries => {
        if (entries[0]) measure(entries[0].contentRect);
      });
      observer.observe(node);
      return () => observer.disconnect();
    }
    const resize = () => measure();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);
  const {
    projection,
    path
  } = useMemo(() => {
    const p = geoAzimuthalEqualArea().rotate([-82, -22]).fitExtent([[20, 14], [Math.max(220, size.w) - 20, size.h - 26]], outline);
    return {
      projection: p,
      path: geoPath(p)
    };
  }, [size]);
  useEffect(() => {
    const node = svgRef.current;
    const z = zoom().scaleExtent([1, 5]).filter(e => (e.type !== 'wheel' || e.ctrlKey || e.metaKey) && !e.button).on('zoom', e => setTransform(e.transform));
    zoomRef.current = z;
    select(node).call(z).on('dblclick.zoom', null);
    select(node).call(z.transform, zoomIdentity);
    return () => select(node).on('.zoom', null);
  }, [size.w, size.h]);
  const linked = connected(round),
    guessed = new Set(round.guesses.map(g => g.id));
  const styleFor = id => {
    if (hidden.has(id)) return {
      fill: 'transparent',
      stroke: 'transparent'
    };
    if (id === round.start) return {
      fill: '#b6c8e5',
      stroke: '#d1def0'
    };
    if (id === round.end) return {
      fill: '#e8baa6',
      stroke: '#f2d3c5'
    };
    if (guessed.has(id)) return {
      fill: linked.has(id) ? '#b7d6c7' : '#70818f',
      stroke: '#17212a'
    };
    if (round.status !== 'playing' && round.solution.includes(id)) return {
      fill: '#b7d6c780',
      stroke: '#c5dfd0'
    };
    if (round.hints >= 2 && round.hintPath.includes(id) || round.hints >= 1 && id === round.hintId) return {
      fill: '#c6b9e215',
      stroke: '#c6b9e2',
      strokeDasharray: '5 4'
    };
    return {
      fill: 'transparent',
      stroke: 'transparent'
    };
  };
  const initials = round.hints === 3 && round.status === 'playing' ? round.hintPath.filter(id => !guessed.has(id) && id !== round.start && id !== round.end) : [];
  return <Box ref={holder} className="india-map" sx={{
    height: {
      xs: 410,
      md: 510
    },
    position: 'relative',
    borderRadius: 3,
    overflow: 'hidden',
    bgcolor: '#121a22'
  }}><svg ref={svgRef} viewBox={`0 0 ${size.w} ${size.h}`} aria-label={`Indian map: ${byId.get(round.start).name} to ${byId.get(round.end).name}`} role="img" style={{
      display: 'block',
      width: '100%',
      height: '100%',
      touchAction: 'none'
    }}><g transform={transform.toString()}><path d={path(outline)} fill="#202d39" stroke="#5b7081" strokeWidth=".8" vectorEffect="non-scaling-stroke" />{features.map(f => {
          const known = f.id === round.start || f.id === round.end || guessed.has(f.id) || round.solution.includes(f.id);
          return <path key={f.id} data-region={f.id} data-start={f.id === round.start ? 'true' : undefined} d={path(f)} {...styleFor(f.id)} strokeWidth="1.1" vectorEffect="non-scaling-stroke" pointerEvents={known ? 'auto' : 'none'}>{known && <title>{byId.get(f.id).name}</title>}</path>;
        })}{[round.start, round.end, ...initials].map(id => {
          const f = features.find(f => f.id === id),
            p = projection(geoCentroid(main(f))),
            endpoint = id === round.start || id === round.end;
          return <g key={id} pointerEvents="none">{endpoint && <circle cx={p[0]} cy={p[1]} r="5" fill={id === round.start ? '#d5e2f4' : '#f3d4c6'} stroke="#17212a" strokeWidth="1.5" />}<text x={p[0]} y={p[1] + (endpoint ? 21 : 4)} fill="#edf0f2" fontFamily="Manrope, sans-serif" fontSize="13" fontWeight="600" textAnchor="middle" paintOrder="stroke" stroke="#17212a" strokeWidth="3">{endpoint ? id : byId.get(id).name.split(' ').map(s => s[0]).slice(0, 2).join('')}</text></g>;
        })}</g></svg><Stack sx={{
      position: 'absolute',
      right: 10,
      top: 10,
      bgcolor: '#171d24ed',
      borderRadius: 2,
      border: '1px solid #303a45'
    }}><Tooltip title="Zoom in"><IconButton aria-label="Zoom in" onClick={() => select(svgRef.current).call(zoomRef.current.scaleBy, 1.4)}><AddIcon /></IconButton></Tooltip><Tooltip title="Zoom out"><IconButton aria-label="Zoom out" onClick={() => select(svgRef.current).call(zoomRef.current.scaleBy, 1 / 1.4)}><RemoveIcon /></IconButton></Tooltip><Tooltip title="Reset map"><IconButton aria-label="Reset map" onClick={() => select(svgRef.current).call(zoomRef.current.transform, zoomIdentity)}><CenterFocusStrong /></IconButton></Tooltip></Stack></Box>;
}
