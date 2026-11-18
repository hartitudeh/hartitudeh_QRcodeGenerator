'use client';
import { Container, Typography, Box, Accordion, AccordionSummary, AccordionDetails, Stack } from '@mui/material';
import styled from 'styled-components';
import { MdExpandMore, MdBolt, MdLock, MdAllInclusive, MdHighQuality } from 'react-icons/md';
import Navbar from '@/components/Navbar';
import QRGenerator from '@/components/QRGenerator';
import { useColorMode } from '@/components/Providers';

const Hero = styled.header`
  text-align: center;
  padding: 40px 0 24px;
  h1 { font-size: clamp(1.8rem, 5vw, 3.2rem); font-weight: 900; margin: 0 0 8px; line-height: 1.1; }
  h1 span { background: linear-gradient(90deg, #6c4cf1, #00c2a8); -webkit-background-clip: text; color: transparent; }
`;
const Features = styled.div`
  display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-top: 56px;
  > div { padding: 20px; border-radius: 16px; background: ${(p) => p.theme.palette.background.paper}; border: 1px solid ${(p) => p.theme.palette.divider}; }
  svg { color: ${(p) => p.theme.palette.primary.main}; }
`;

const FAQ = [
  ['Are the QR codes free forever?', 'Yes. Codes are static — the data is encoded directly in the image, so they never expire and work without our servers.'],
  ['Can I use them commercially?', 'Absolutely. Everything you generate is yours to use for print, packaging, ads and more.'],
  ['Which format should I download?', 'Use SVG for print and scaling to any size, PNG for web/transparent backgrounds, JPEG or WEBP for small file sizes.'],
  ['Why does adding a logo change error correction to H?', 'A logo covers part of the code. Level H lets up to 30% of the code be obscured while staying scannable.'],
  ['Is my data private?', 'All generation happens in your browser. Nothing is uploaded; history is stored only on your device.'],
];

export default function Home() {
  const { mode, toggle } = useColorMode();
  return (
    <>
      <Navbar mode={mode} onToggleMode={toggle} />
      <Container maxWidth="lg" sx={{ pb: { xs: 12, md: 6 } }}>
        <Hero>
          <h1>Free QR Code Generator <span>with Logo</span></h1>
          <Typography color="text.secondary">Custom shapes, gradients, logos and print-ready exports — 100% in your browser.</Typography>
        </Hero>

        <QRGenerator />

        <Features>
          {[[MdAllInclusive, 'Never expires', 'Static codes that work forever.'], [MdHighQuality, 'Up to 4000px + SVG', 'Print-ready vector output.'],
            [MdLock, 'Private by design', 'No uploads, no tracking.'], [MdBolt, 'Live preview', 'Every tweak renders instantly.']].map(([I, t, d]) => (
            <div key={t}><I size={28} /><Typography fontWeight={700} mt={1}>{t}</Typography><Typography variant="body2" color="text.secondary">{d}</Typography></div>
          ))}
        </Features>

        <Box id="faq" sx={{ scrollMarginTop: 80 }}>
          <Typography variant="h4" fontWeight={800} mt={7} mb={2}>FAQ</Typography>
          {FAQ.map(([q, a]) => (
            <Accordion key={q} elevation={0} disableGutters sx={{ border: 1, borderColor: 'divider', mb: 1, borderRadius: '14px !important', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<MdExpandMore size={22} />}><Typography fontWeight={600}>{q}</Typography></AccordionSummary>
              <AccordionDetails><Typography color="text.secondary">{a}</Typography></AccordionDetails>
            </Accordion>
          ))}
        </Box>
        <Stack alignItems="center" mt={6}><Typography variant="caption" color="text.secondary">© {new Date().getFullYear()} QRForge</Typography></Stack>
      </Container>
    </>
  );
}
