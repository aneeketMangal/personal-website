import React from 'react';
import {Box, Typography, Stack} from '@mui/material';
import data from '../data/profile.json';
import {Brand, PhotoPlaceholder, Socials, Rich} from './Shared';

function WorkEntry({job}) {
  return <Box component="article" className="work-entry" sx={{py: 3}}>
    <Stack direction="row" spacing={{xs: 2, sm: 3}} sx={{alignItems: 'flex-start'}}>
      <Brand company={job.company} size={58}/>
      <Box sx={{minWidth: 0, flex: 1}}>
        <Typography variant="h4" component="h3" sx={{fontWeight: 700, mb: .5}}>{job.company}</Typography>
        <Typography sx={{fontSize: {xs: 18, md: 21}, mb: .7}}>{job.role}</Typography>
        <Typography sx={{color: 'text.secondary', fontSize: {xs: 14, md: 16}}}>{job.dates} · {job.location}</Typography>
      </Box>
    </Stack>
    <Box component="ul" sx={{mt: 2, mb: 0, pl: 2.5, ml: {xs: 0, sm: 10.25}}}>
      {job.homeHighlights.map((point, index) => <Typography component="li" key={index} sx={{color: 'text.secondary', mb: 1.2}}><Rich>{point}</Rich></Typography>)}
    </Box>
  </Box>;
}
export default function Home({view='home'}) {
  if(view==='home') return <>
    <Stack direction={{xs: 'column-reverse', sm: 'row'}} spacing={{xs: 3, md: 6}} sx={{alignItems: {xs: 'flex-start', sm: 'center'}, mb: 5}}>
      <Box sx={{flex: 1, minWidth: 0}}>
        <Typography variant="h1" component="h1" sx={{fontSize: {xs: 40, md: 54}, mb: 2}}>Aneeket Mangal</Typography>
        <Typography data-testid="profile-role" sx={{fontSize: {xs: 20, md: 23}, fontWeight: 600, mb: 1.5}}>Software Engineer</Typography>
        <Typography data-testid="profile-intro" sx={{color: 'text.secondary', fontWeight: 400, mb: 3, maxWidth: 650}}><Rich>{'Currently working as a Full Stack SDE2 at **Uber**. Previously at **Microsoft**. Me and my AI coding agents work on scaling backend systems, building user-friendly frontends and improving customer experience.'}</Rich></Typography>
        <Socials/>
      </Box>
      <PhotoPlaceholder/>
    </Stack>
    <Box component="section" className="flow-section" aria-labelledby="home-education-summary">
      <Typography id="home-education-summary" variant="h3" component="h2" sx={{mb: 2.5}}>Education</Typography>
      <Box className="experience-row">
        <Brand company="IIT Ropar" size={64}/>
        <Box sx={{minWidth: 0, flex: 1}}>
          <Typography variant="h4" component="h3" sx={{fontWeight: 700, mb: .5}}>IIT Ropar</Typography>
          <Typography sx={{mb: .7}}>B.Tech, Computer Science &amp; Engineering</Typography>
          <Typography sx={{color: 'text.secondary'}}>2019 – 2023</Typography>
        </Box>
      </Box>
    </Box>
    <Box component="section" className="flow-section" aria-labelledby="home-work-summary">
      <Typography id="home-work-summary" variant="h3" component="h2" sx={{mb: 1}}>Work Experience</Typography>
      {data.jobs.filter(job => !/intern/i.test(job.role)).map(job => <WorkEntry key={job.company} job={job}/>)}
    </Box>
    <Box component="section" className="flow-section" aria-labelledby="home-internships-summary">
      <Typography id="home-internships-summary" variant="h3" component="h2" sx={{mb: 1}}>Internships</Typography>
      {data.jobs.filter(job => /intern/i.test(job.role)).map(job => <WorkEntry key={job.company} job={job}/>)}
    </Box>
  </>;
  if(view==='education') return <>
    <Box component="section" className="flow-section" aria-labelledby="home-education">
      <Typography id="home-education" variant="h3" component="h2" sx={{mb: 2.5}}>Education</Typography>
      <Box className="experience-row">
        <Brand company="IIT Ropar" size={64}/>
        <Box sx={{minWidth: 0, flex: 1}}>
          <Typography variant="h4" component="h3" sx={{fontWeight: 700, mb: .5}}>IIT Ropar</Typography>
          <Typography sx={{mb: .7}}>B.Tech, Computer Science &amp; Engineering</Typography>
          <Typography sx={{color: 'text.secondary'}}>2019 – 2023</Typography>
        </Box>
      </Box>
    </Box>
  </>;
  return <>
    <Box component="section" className="flow-section" aria-labelledby="home-work">
      <Typography id="home-work" variant="h3" component="h2" sx={{mb: 1}}>Work Experience</Typography>
      {data.jobs.filter(job => !/intern/i.test(job.role)).map(job => <WorkEntry key={job.company} job={job}/>)}
    </Box>
    <Box component="section" className="flow-section" aria-labelledby="home-internships">
      <Typography id="home-internships" variant="h3" component="h2" sx={{mb: 1}}>Internships</Typography>
      {data.jobs.filter(job => /intern/i.test(job.role)).map(job => <WorkEntry key={job.company} job={job}/>)}
    </Box>
  </>;
}
