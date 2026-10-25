import React from 'react';
import { Box, Typography, Stack, Avatar, Button } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import MailOutline from '@mui/icons-material/MailOutlined';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import PhotoCameraOutlined from '@mui/icons-material/PhotoCameraOutlined';
import BusinessOutlined from '@mui/icons-material/BusinessOutlined';
export const urls = {
  github: 'https://github.com/aneeketMangal',
  linkedin: 'https://www.linkedin.com/in/aneeketmangal/',
  email: 'mailto:aneeketmangal@gmail.com',
  resume: 'https://drive.google.com/file/d/1QctsHCG83CnhnHtt3D_zHy4kSPafeu7g/view?usp=sharing'
};
export const profilePhoto = 'assets/profile-photo.jpg';
export const asset = path => `${import.meta.env.BASE_URL}${path}`;
export function Rich({
  children = ''
}) {
  return String(children).split('**').map((p, i) => i % 2 ? <Box component="strong" sx={{
    fontWeight: 600,
    color: 'text.primary'
  }} key={i}>{p}</Box> : p);
}
export function Brand({
  company,
  size = 58
}) {
  const name = company === 'Uber' ? 'uber.svg' : company === 'Microsoft' ? 'microsoft.svg' : company === 'IIT Ropar' ? 'iit-ropar.png' : company === 'Curer' ? 'curer-mark.png' : null;
  return <Box className="brand-mark" sx={{
    width: size,
    height: size,
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0
  }}>{name ? <Box component="img" src={asset(`brands/${name}`)} alt={`${company} logo`} sx={{
      width: company === 'Microsoft' ? size * .76 : size,
      height: company === 'Microsoft' ? size * .76 : size,
      objectFit: 'contain'
    }} /> : <BusinessOutlined sx={{
      color: 'text.secondary',
      fontSize: size * .48
    }} />}</Box>;
}
export function PhotoPlaceholder({
  small = false
}) {
  return profilePhoto ? <Avatar src={asset(profilePhoto)} alt="Aneeket Mangal" variant={small ? 'circular' : 'rounded'} sx={{
    width: small ? 64 : {xs: 150, md: 190},
    height: small ? 64 : {xs: 150, md: 190},
    borderRadius: small ? '50%' : '20px',
    flexShrink: 0
  }} /> : <Box aria-label="Profile photo placeholder" sx={{
    width: small ? 64 : {
      xs: 150,
      md: 180
    },
    height: small ? 64 : {
      xs: 170,
      md: 210
    },
    border: '1px dashed #627180',
    borderRadius: small ? '50%' : 3,
    bgcolor: '#b5c9e70b',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1.5,
    flexShrink: 0
  }}><PhotoCameraOutlined sx={{
      fontSize: small ? 26 : 38,
      color: '#b5c9e7'
    }} />{!small && <Typography variant="body2" sx={{
      color: "text.secondary"
    }}>Your photo here</Typography>}</Box>;
}
// The same rounded link design is shared by profile and project actions.
export function PillLink({href, icon: Icon, tone = 'mint', compact = false, children, ...props}) {
  const pill = {borderRadius: 999, px: compact ? 2 : 2.7, py: 1.1, minHeight: compact ? 44 : 50, fontSize: compact ? '.92rem' : '1.05rem', fontWeight: 650, '& .MuiButton-startIcon .MuiSvgIcon-root': {fontSize: 23}};
  const tones = {
    github: {bgcolor: '#20252c', color: '#f5f6f8', borderColor: '#464d57', '&:hover': {bgcolor: '#303740', borderColor: '#73808d'}},
    blue: {bgcolor: '#62b5d9', color: '#071b27', '&:hover': {bgcolor: '#83c8e5'}},
    muted: {bgcolor: '#222d38', color: '#b5c7d8', borderColor: '#465b6d', '&:hover': {bgcolor: '#2b3946', borderColor: '#6d8497'}},
    mint: {color: 'primary.main', borderColor: '#b7d6c775', '&:hover': {bgcolor: '#b7d6c70c', borderColor: 'primary.main'}}
  };
  return <Button {...props} size={compact ? 'small' : 'medium'} href={href} target="_blank" rel="noopener noreferrer"
    variant={tone === 'blue' ? 'contained' : 'outlined'} startIcon={Icon ? <Icon/> : undefined}
    sx={{...pill, ...tones[tone]}}>{children}</Button>;
}
export function Socials({
  compact = false,
  vertical = false
}) {
  return <Stack direction={vertical ? 'column' : 'row'} spacing={1.5} useFlexGap sx={{
    flexWrap: "wrap", alignItems: 'flex-start'
  }}><PillLink compact={compact} href={urls.github} tone="github" icon={GitHubIcon}>GitHub</PillLink>
    <PillLink compact={compact} href={urls.linkedin} tone="blue" icon={LinkedInIcon}>LinkedIn</PillLink>
    {!compact && <PillLink href={urls.resume} icon={DescriptionOutlined}>Resume</PillLink>}
    {!compact && <Button href={urls.email} color="primary" startIcon={<MailOutline />} sx={{borderRadius: 999, minHeight: 50}}>Email</Button>}</Stack>;
}
export function PageHeader({
  title,
  description,
  action
}) {
  return <Stack direction={{
    xs: 'column',
    sm: 'row'
  }} spacing={2.5} sx={{
    justifyContent: "space-between",
    alignItems: {
      xs: 'stretch',
      sm: 'center'
    },
    mb: 4
  }}><Box><Typography variant="h3" component="h2" sx={{
        fontSize: {
          xs: 27,
          md: 30
        },
        mb: description ? 1 : 0
      }}>{title}</Typography>{description && <Typography sx={{
        color: "text.secondary",
        maxWidth: 760
      }}>{description}</Typography>}</Box>{action}</Stack>;
}
export function Section({
  title,
  children,
  id
}) {
  return <Box component="section" id={id} sx={{
    mb: 5,
    scrollMarginTop: 100
  }}><Typography variant="h4" component="h2" sx={{
      mb: 2.5
    }}>{title}</Typography>{children}</Box>;
}
