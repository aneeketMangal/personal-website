import React from 'react';
import {Box, Typography, Stack, Chip, Button} from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';
import GitHubIcon from '@mui/icons-material/GitHub';
import PlayCircleOutlined from '@mui/icons-material/PlayCircleOutlined';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import data from '../data/profile.json';
import {PageHeader, PillLink} from './Shared';

function destination(project) {
  if (project.url.startsWith('https://github.com/')) {
    return {label: 'Repository', description: 'GitHub repository', tone: 'github', icon: GitHubIcon};
  }
  if (/demo/i.test(project.link)) {
    return {label: 'Watch Demo', description: 'watch demo video', tone: 'muted', icon: PlayCircleOutlined};
  }
  return {label: 'Resume', description: 'view resume', tone: 'mint', icon: DescriptionOutlined};
}

export default function Projects({project:slug,onSelect}) {
  const selected=slug?data.projects.find(project=>project.slug===slug):null;
  if(selected){
    const action=destination(selected);
    return <Box className="project-detail-page" data-testid="project-detail">
      <Button startIcon={<ArrowBack/>} onClick={()=>onSelect(null)} sx={{mb:3}}>All projects</Button>
      <Typography variant="overline" sx={{color:'text.secondary'}}>{selected.category}</Typography>
      <Typography variant="h2" component="h2" sx={{mt:.75,mb:2}}>{selected.title}</Typography>
      <Typography sx={{color:'text.secondary',fontSize:{xs:'1.05rem',md:'1.2rem'},lineHeight:1.75,maxWidth:820}}>{selected.overview||selected.description}</Typography>
      <Stack direction="row" spacing={1} useFlexGap sx={{flexWrap:'wrap',my:3}}>
        {selected.tech.map(tech=><Chip label={tech} variant="outlined" key={tech}/>) }
      </Stack>
      <Box className="project-detail-panel">
        <Typography variant="h4" component="h3" sx={{fontWeight:700,mb:2}}>What it does</Typography>
        <Box component="ul" sx={{m:0,pl:2.5}}>
          {selected.highlights.map(item=><Typography component="li" key={item} sx={{color:'text.secondary',mb:1.4,lineHeight:1.75}}>{item}</Typography>)}
        </Box>
      </Box>
      <Box sx={{mt:3}}><PillLink href={selected.url} tone={action.tone} icon={action.icon}
        aria-label={`${selected.title}: ${action.description}`}>{action.label}</PillLink></Box>
    </Box>;
  }
  return <>
    <PageHeader title="Projects"/>
    <Box className="project-list">
      {data.projects.map((project, index) => {
        const action = destination(project);
        return <Box component="article" key={project.title} className="project-row" role="link" tabIndex={0}
          aria-labelledby={`project-${index}-title`} onClick={()=>onSelect(project.slug)} onKeyDown={event=>{
            if(event.key==='Enter'||event.key===' '){event.preventDefault();onSelect(project.slug);}
          }}>
          <Typography className="row-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</Typography>
          <Box sx={{minWidth: 0}}>
            <Typography variant="overline" sx={{color: 'text.secondary', display: 'block', mb: .7}}>{project.category}</Typography>
            <Typography id={`project-${index}-title`} variant="h4" component="h3" sx={{fontWeight: 700, mb: .8}}>{project.title}</Typography>
            <Typography sx={{color: 'text.secondary', lineHeight: 1.7, maxWidth: 790}}>{project.description}</Typography>
            <Stack direction="row" spacing={1} useFlexGap sx={{flexWrap: 'wrap', mt: 2}}>
              {project.tech.map(tech => <Chip label={tech} size="small" variant="outlined" key={tech}/>)}
            </Stack>
          </Box>
          <PillLink href={project.url} tone={action.tone} icon={action.icon} className="project-action" onClick={event=>event.stopPropagation()}
            aria-label={`${project.title}: ${action.description}`}>{action.label}</PillLink>
        </Box>;
      })}
    </Box>
  </>;
}
