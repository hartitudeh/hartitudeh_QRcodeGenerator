'use client';
import { useEffect, useState } from 'react';
import {
  AppBar, Toolbar, Button, IconButton, Box, Paper, BottomNavigation,
  BottomNavigationAction, useMediaQuery, useTheme, Tooltip,
} from '@mui/material';
import styled from 'styled-components';
import { MdQrCode2, MdDarkMode, MdLightMode, MdHistory, MdHelpOutline, MdAutoAwesome } from 'react-icons/md';

const NAV = [
  { id: 'generator', label: 'Generator', icon: <MdQrCode2 size={22} /> },
  { id: 'templates', label: 'Templates', icon: <MdAutoAwesome size={22} /> },
  { id: 'history', label: 'History', icon: <MdHistory size={22} /> },
  { id: 'faq', label: 'FAQ', icon: <MdHelpOutline size={22} /> },
];

const Logo = styled.a`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 800;
  font-size: 1.25rem;
  color: inherit;
  text-decoration: none;
  span { background: linear-gradient(90deg, #6c4cf1, #00c2a8); -webkit-background-clip: text; color: transparent; }
`;

export default function Navbar({ mode, onToggleMode }) {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));
  const [active, setActive] = useState('generator');

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' }
    );
    NAV.forEach((n) => { const el = document.getElementById(n.id); el && obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  const go = (id) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <AppBar position="sticky" color="inherit" elevation={0}
        sx={{ borderBottom: 1, borderColor: 'divider', backdropFilter: 'blur(10px)', bgcolor: (t) => t.palette.background.paper + 'cc' }}>
        <Toolbar sx={{ maxWidth: 1280, width: '100%', mx: 'auto' }}>
          <Logo href="#generator"><MdQrCode2 size={30} color="#6C4CF1" /><span>QRForge</span></Logo>
          <Box sx={{ flexGrow: 1 }} />
          {!mobile && NAV.map((n) => (
            <Button key={n.id} startIcon={n.icon} onClick={() => go(n.id)}
              color={active === n.id ? 'primary' : 'inherit'} sx={{ mx: 0.5 }}>
              {n.label}
            </Button>
          ))}
          <Tooltip title="Toggle theme">
            <IconButton onClick={onToggleMode} sx={{ ml: 1 }}>
              {mode === 'dark' ? <MdLightMode /> : <MdDarkMode />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {mobile && (
        <Paper elevation={8} sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1200,
          pb: 'env(safe-area-inset-bottom)', borderTop: 1, borderColor: 'divider' }}>
          <BottomNavigation showLabels value={active} onChange={(_, v) => go(v)}>
            {NAV.map((n) => (
              <BottomNavigationAction key={n.id} value={n.id} label={n.label} icon={n.icon} />
            ))}
          </BottomNavigation>
        </Paper>
      )}
    </>
  );
}
