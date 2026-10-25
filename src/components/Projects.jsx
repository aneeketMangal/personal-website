import React from 'react';
import {Box, Typography, Stack, Chip} from '@mui/material';
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

export default function Projects() {
  return <>
    <PageHeader title="Projects"/>
    <Box className="project-list">
      {data.projects.map((project, index) => {
        const action = destination(project);
        return <Box component="article" key={project.title} className="project-row" aria-labelledby={`project-${index}-title`}>
          <Typography className="row-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</Typography>
          <Box sx={{minWidth: 0}}>
            <Typography variant="overline" sx={{color: 'text.secondary', display: 'block', mb: .7}}>{project.category}</Typography>
            <Typography id={`project-${index}-title`} variant="h4" component="h3" sx={{fontWeight: 700, mb: .8}}>{project.title}</Typography>
            <Typography sx={{color: 'text.secondary', lineHeight: 1.7, maxWidth: 790}}>{project.description}</Typography>
            <Stack direction="row" spacing={1} useFlexGap sx={{flexWrap: 'wrap', mt: 2}}>
              {project.tech.map(tech => <Chip label={tech} size="small" variant="outlined" key={tech}/>)}
            </Stack>
          </Box>
          <PillLink href={project.url} tone={action.tone} icon={action.icon} className="project-action"
            aria-label={`${project.title}: ${action.description}`}>{action.label}</PillLink>
        </Box>;
      })}
    </Box>
  </>;
}
