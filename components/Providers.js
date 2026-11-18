'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { ThemeProvider as ScThemeProvider, createGlobalStyle } from 'styled-components';

const ColorModeContext = createContext({ mode: 'light', toggle: () => {} });
export const useColorMode = () => useContext(ColorModeContext);

const GlobalStyle = createGlobalStyle`
  html { scroll-behavior: smooth; }
  body { min-height: 100vh; }
  ::selection { background: ${(p) => p.theme.palette.primary.main}; color: #fff; }
`;

export default function Providers({ children }) {
  const [mode, setMode] = useState('light');

  useEffect(() => {
    const saved = localStorage.getItem('qrforge-mode');
    if (saved) setMode(saved);
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) setMode('dark');
  }, []);

  const ctx = useMemo(
    () => ({
      mode,
      toggle: () =>
        setMode((m) => {
          const n = m === 'light' ? 'dark' : 'light';
          localStorage.setItem('qrforge-mode', n);
          return n;
        }),
    }),
    [mode]
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: '#6C4CF1' },
          secondary: { main: '#00C2A8' },
          background:
            mode === 'light'
              ? { default: '#F4F5FB', paper: '#FFFFFF' }
              : { default: '#0E0F1A', paper: '#171927' },
        },
        shape: { borderRadius: 14 },
        typography: {
          fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
          button: { textTransform: 'none', fontWeight: 600 },
        },
        components: {
          MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
          MuiButton: { defaultProps: { disableElevation: true } },
        },
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={ctx}>
      <MuiThemeProvider theme={theme}>
        <ScThemeProvider theme={theme}>
          <CssBaseline />
          <GlobalStyle />
          {children}
        </ScThemeProvider>
      </MuiThemeProvider>
    </ColorModeContext.Provider>
  );
}
