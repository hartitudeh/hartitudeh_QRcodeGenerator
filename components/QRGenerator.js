'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box, Paper, Tabs, Tab, TextField, Grid, Accordion, AccordionSummary, AccordionDetails, Typography,
  ToggleButton, ToggleButtonGroup, Slider, Switch, FormControlLabel, MenuItem, Button, Stack, Snackbar,
  Alert, Tooltip, IconButton, Chip, Checkbox,
} from '@mui/material';
import styled from 'styled-components';
import {
  MdExpandMore, MdPalette, MdImage, MdTune, MdEdit, MdDownload, MdContentCopy, MdShare, MdRestartAlt,
  MdDelete, MdCloudUpload, MdSwapHoriz, MdSave,
} from 'react-icons/md';
import {
  CONTENT_TYPES, DOT_TYPES, CORNER_SQUARE_TYPES, CORNER_DOT_TYPES, DEFAULT_STYLE, TEMPLATES, LOGO_PRESETS,
} from '@/lib/qr';

/* ---------- styled-components ---------- */
const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 380px;
  gap: 24px;
  align-items: start;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
`;
const Sticky = styled.div`
  position: sticky;
  top: 88px;
  @media (max-width: 900px) { position: static; }
`;
const PreviewBox = styled.div`
  aspect-ratio: 1;
  width: 100%;
  border-radius: 16px;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: repeating-conic-gradient(#0000000d 0 25%, transparent 0 50%) 50% / 20px 20px;
  canvas, svg { width: 100% !important; height: 100% !important; }
`;
const ShapeBtn = styled.button`
  all: unset;
  cursor: pointer;
  border-radius: 12px;
  padding: 8px;
  display: grid;
  place-items: center;
  gap: 4px;
  font-size: 11px;
  text-transform: capitalize;
  border: 2px solid ${(p) => (p.$active ? p.theme.palette.primary.main : p.theme.palette.divider)};
  background: ${(p) => (p.$active ? p.theme.palette.primary.main + '14' : 'transparent')};
  transition: all .15s;
  &:hover { border-color: ${(p) => p.theme.palette.primary.main}; transform: translateY(-2px); }
`;
const ColorField = styled.label`
  display: flex; align-items: center; gap: 10px; flex: 1;
  border: 1px solid ${(p) => p.theme.palette.divider}; border-radius: 12px; padding: 6px 10px;
  input[type=color] { width: 36px; height: 36px; border: none; background: none; padding: 0; cursor: pointer; }
  input[type=text] { all: unset; flex: 1; font-family: monospace; min-width: 0; }
`;
const TemplateCard = styled.button`
  all: unset; cursor: pointer; border-radius: 16px; padding: 12px; text-align: center;
  background: ${(p) => p.theme.palette.background.paper};
  border: 1px solid ${(p) => p.theme.palette.divider};
  transition: all .2s;
  &:hover { transform: translateY(-4px); box-shadow: 0 12px 30px #6c4cf133; border-color: ${(p) => p.theme.palette.primary.main}; }
  .sw { height: 70px; border-radius: 10px; margin-bottom: 8px; }
`;
const SectionTitle = styled.h2`
  font-size: clamp(1.4rem, 3vw, 2rem); margin: 56px 0 16px; font-weight: 800;
`;

/* ---------- helpers ---------- */
function Color({ value, onChange, label }) {
  return (
    <Box sx={{ flex: 1, minWidth: 160 }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <ColorField>
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} />
      </ColorField>
    </Box>
  );
}

function ShapePreview({ kind, type }) {
  const c = 'currentColor';
  if (kind === 'dot') {
    const r = { square: 0, dots: 50, rounded: 25, 'extra-rounded': 40, classy: 0, 'classy-rounded': 20 }[type];
    const br = type.startsWith('classy') ? `${r}% 0 ${r}% 0` : `${r}%`;
    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3,12px)', gap: '2px' }}>
        {[1, 1, 0, 1, 0, 1, 0, 1, 1].map((v, i) => (
          <Box key={i} sx={{ width: 12, height: 12, bgcolor: v ? c : 'transparent', borderRadius: type.startsWith('classy') ? (type === 'classy' ? '0 6px 0 6px' : '2px 6px 2px 6px') : br }} />
        ))}
      </Box>
    );
  }
  const r = { square: 0, 'extra-rounded': 10, dot: 50 }[type];
  if (kind === 'cs')
    return <Box sx={{ width: 36, height: 36, border: '6px solid', borderRadius: type === 'dot' ? '50%' : `${r}px` }} />;
  return <Box sx={{ width: 20, height: 20, bgcolor: c, borderRadius: type === 'dot' ? '50%' : 0, m: '8px' }} />;
}

function buildOptions(data, s, size = 300) {
  const grad = (c1, c2) =>
    s.dotGradient === 'none'
      ? undefined
      : { type: s.dotGradient, rotation: (s.gradRotation * Math.PI) / 180, colorStops: [{ offset: 0, color: c1 }, { offset: 1, color: c2 }] };
  return {
    width: size,
    height: size,
    type: 'canvas',
    data: data || ' ',
    margin: Math.round((s.margin / 300) * size),
    image: s.logo || undefined,
    qrOptions: { errorCorrectionLevel: s.ecl },
    imageOptions: { crossOrigin: 'anonymous', margin: s.logoMargin, imageSize: s.logoSize, hideBackgroundDots: s.hideBgDots },
    dotsOptions: { type: s.dotType, color: s.dotColor, gradient: grad(s.dotColor, s.dotColor2) },
    backgroundOptions: { color: s.bgTransparent ? 'transparent' : s.bgColor },
    cornersSquareOptions: { type: s.cornerSquareType, color: s.cornerSquareColor },
    cornersDotOptions: { type: s.cornerDotType, color: s.cornerDotColor },
  };
}

// WCAG-ish luminance contrast check for scannability warnings
const lum = (hex) => {
  const v = hex.replace('#', '').match(/.{2}/g)?.map((x) => parseInt(x, 16) / 255) || [0, 0, 0];
  const [r, g, b] = v.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

/* ---------- main ---------- */
export default function QRGenerator() {
  const [type, setType] = useState('url');
  const [fields, setFields] = useState({ url: { url: 'https://www.example.com' } });
  const [s, setS] = useState(DEFAULT_STYLE);
  const [expanded, setExpanded] = useState('content');
  const [toast, setToast] = useState(null);
  const [history, setHistory] = useState([]);
  const [dlSize, setDlSize] = useState(1000);
  const ref = useRef(null);
  const qr = useRef(null);
  const QRClass = useRef(null);

  const ct = CONTENT_TYPES.find((c) => c.id === type);
  const data = useMemo(() => ct.build(fields[type] || {}), [ct, fields, type]);
  const set = (patch) => setS((p) => ({ ...p, ...patch }));
  const setField = (k, v) => setFields((f) => ({ ...f, [type]: { ...(f[type] || {}), [k]: v } }));

  useEffect(() => {
    try { setHistory(JSON.parse(localStorage.getItem('hartitudeh-qr-history') || '[]')); } catch {}
  }, []);

  // init + live update (debounced)
  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      if (!QRClass.current) QRClass.current = (await import('qr-code-styling')).default;
      if (cancelled) return;
      const opts = buildOptions(data, s, 600);
      if (!qr.current) {
        qr.current = new QRClass.current(opts);
        ref.current.innerHTML = '';
        qr.current.append(ref.current);
      } else qr.current.update(opts);
    }, 150);
    return () => { cancelled = true; clearTimeout(t); };
  }, [data, s]);

  const download = useCallback(async (ext) => {
    const Q = QRClass.current || (await import('qr-code-styling')).default;
    const o = buildOptions(data, s, dlSize);
    if (ext === 'svg') o.type = 'svg';
    if (ext === 'jpeg' && s.bgTransparent) o.backgroundOptions.color = '#ffffff';
    await new Q(o).download({ name: `qrcode-${type}`, extension: ext });
    const entry = { id: Date.now(), type, fields: fields[type], s, data, at: new Date().toISOString() };
    const next = [entry, ...history.filter((h) => h.data !== data)].slice(0, 12);
    setHistory(next);
    localStorage.setItem('hartitudeh-qr-history', JSON.stringify(next));
    setToast({ sev: 'success', msg: `Downloaded ${ext.toUpperCase()} (${dlSize}px)` });
  }, [data, s, dlSize, type, fields, history]);

  const getBlob = async () => {
    const Q = QRClass.current;
    return new Q(buildOptions(data, s, 1000)).getRawData('png');
  };
  const copy = async () => {
    try {
      const blob = await getBlob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setToast({ sev: 'success', msg: 'QR image copied to clipboard' });
    } catch { setToast({ sev: 'error', msg: 'Clipboard not supported in this browser' }); }
  };
  const share = async () => {
    try {
      const file = new File([await getBlob()], 'qrcode.png', { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: 'My QR code' });
      else throw 0;
    } catch { setToast({ sev: 'info', msg: 'Sharing not available on this device' }); }
  };

  const onLogo = (file) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => set({ logo: r.result, ecl: 'H' });
    r.readAsDataURL(file);
  };

  const saveTemplate = () => {
    localStorage.setItem('hartitudeh-qr-custom-style', JSON.stringify(s));
    setToast({ sev: 'success', msg: 'Design saved as your default template' });
  };
  useEffect(() => {
    const c = localStorage.getItem('hartitudeh-qr-custom-style');
    if (c) try { setS({ ...DEFAULT_STYLE, ...JSON.parse(c) }); } catch {}
  }, []);

  const cr = contrast(s.dotColor, s.bgTransparent ? '#ffffff' : s.bgColor);
  const acc = (id, icon, title, children) => (
    <Accordion expanded={expanded === id} onChange={() => setExpanded(expanded === id ? false : id)} disableGutters
      sx={{ mb: 1.5, borderRadius: '14px !important', '&:before': { display: 'none' }, border: 1, borderColor: 'divider' }} elevation={0}>
      <AccordionSummary expandIcon={<MdExpandMore size={24} />}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>
          <Typography fontWeight={700}>{title}</Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );

  return (
    <>
      <Box id="generator" sx={{ scrollMarginTop: 80 }}>
        <Paper elevation={0} sx={{ mb: 2, border: 1, borderColor: 'divider', overflow: 'hidden' }}>
          <Tabs value={type} onChange={(_, v) => setType(v)} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>
            {CONTENT_TYPES.map((c) => (
              <Tab key={c.id} value={c.id} label={c.label} icon={<c.icon size={20} />} iconPosition="top" sx={{ minWidth: 84 }} />
            ))}
          </Tabs>
        </Paper>

        <Layout>
          <div>
            {acc('content', <MdEdit size={22} />, `Enter ${ct.label} content`, (
              <Grid container spacing={2}>
                {ct.fields.map((f) => (
                  <Grid key={f.k} size={{ xs: 12, sm: f.half ? 6 : 12 }}>
                    {f.check ? (
                      <FormControlLabel control={<Checkbox checked={!!fields[type]?.[f.k]} onChange={(e) => setField(f.k, e.target.checked)} />} label={f.l} />
                    ) : (
                      <TextField fullWidth label={f.l} placeholder={f.ph} type={f.type || 'text'} select={!!f.select}
                        multiline={f.multiline} minRows={f.multiline ? 3 : undefined}
                        slotProps={f.type ? { inputLabel: { shrink: true } } : undefined}
                        value={fields[type]?.[f.k] ?? (f.select ? f.select[0] : '')} onChange={(e) => setField(f.k, e.target.value)}>
                        {f.select?.map((o) => <MenuItem key={o} value={o}>{o === 'nopass' ? 'None' : o}</MenuItem>)}
                      </TextField>
                    )}
                  </Grid>
                ))}
                <Grid size={12}>
                  <Typography variant="caption" color="text.secondary">
                    Encoded: {data.length} chars · Static QR – works forever, no tracking, no expiry.
                  </Typography>
                </Grid>
              </Grid>
            ))}

            {acc('colors', <MdPalette size={22} />, 'Set colors', (
              <Stack spacing={2}>
                <ToggleButtonGroup exclusive size="small" value={s.dotGradient} onChange={(_, v) => v && set({ dotGradient: v })}>
                  <ToggleButton value="none">Single color</ToggleButton>
                  <ToggleButton value="linear">Linear gradient</ToggleButton>
                  <ToggleButton value="radial">Radial gradient</ToggleButton>
                </ToggleButtonGroup>
                <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap alignItems="flex-end">
                  <Color label={s.dotGradient === 'none' ? 'Foreground' : 'Gradient start'} value={s.dotColor} onChange={(v) => set({ dotColor: v })} />
                  {s.dotGradient !== 'none' && (
                    <>
                      <IconButton onClick={() => set({ dotColor: s.dotColor2, dotColor2: s.dotColor })}><MdSwapHoriz /></IconButton>
                      <Color label="Gradient end" value={s.dotColor2} onChange={(v) => set({ dotColor2: v })} />
                    </>
                  )}
                </Stack>
                {s.dotGradient === 'linear' && (
                  <Box><Typography variant="caption">Rotation {s.gradRotation}°</Typography>
                    <Slider value={s.gradRotation} min={0} max={360} onChange={(_, v) => set({ gradRotation: v })} /></Box>
                )}
                <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                  <Color label="Eye frame" value={s.cornerSquareColor} onChange={(v) => set({ cornerSquareColor: v })} />
                  <Color label="Eye ball" value={s.cornerDotColor} onChange={(v) => set({ cornerDotColor: v })} />
                </Stack>
                <Button size="small" sx={{ alignSelf: 'flex-start' }} onClick={() => set({ cornerSquareColor: s.dotColor, cornerDotColor: s.dotColor })}>
                  Use foreground color for eyes
                </Button>
                <Stack direction="row" spacing={2} alignItems="flex-end" flexWrap="wrap" useFlexGap>
                  {!s.bgTransparent && <Color label="Background" value={s.bgColor} onChange={(v) => set({ bgColor: v })} />}
                  <FormControlLabel control={<Switch checked={s.bgTransparent} onChange={(e) => set({ bgTransparent: e.target.checked })} />} label="Transparent background" />
                </Stack>
                {cr < 3 && <Alert severity="warning">Low contrast ({cr.toFixed(1)}:1). Some scanners may fail — aim for at least 4:1 with dark dots on a light background.</Alert>}
              </Stack>
            ))}

            {acc('logo', <MdImage size={22} />, 'Add logo image', (
              <Stack spacing={2}>
                <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                  <ShapeBtn $active={!s.logo} onClick={() => set({ logo: '' })} style={{ width: 56, height: 56 }}>None</ShapeBtn>
                  {LOGO_PRESETS.map((l) => (
                    <ShapeBtn key={l.name} $active={s.logo === l.src} onClick={() => set({ logo: l.src, ecl: 'H' })} title={l.name}>
                      <img src={l.src} alt={l.name} width={40} height={40} />
                    </ShapeBtn>
                  ))}
                </Stack>
                <Stack direction="row" spacing={1}>
                  <Button component="label" variant="outlined" startIcon={<MdCloudUpload />}>
                    Upload image
                    <input hidden type="file" accept="image/*" onChange={(e) => onLogo(e.target.files?.[0])} />
                  </Button>
                  {s.logo && <Button color="error" startIcon={<MdDelete />} onClick={() => set({ logo: '' })}>Remove</Button>}
                </Stack>
                <Box><Typography variant="caption">Logo size {Math.round(s.logoSize * 100)}%</Typography>
                  <Slider value={s.logoSize} min={0.1} max={0.5} step={0.01} onChange={(_, v) => set({ logoSize: v })} /></Box>
                <Box><Typography variant="caption">Logo padding {s.logoMargin}px</Typography>
                  <Slider value={s.logoMargin} min={0} max={20} onChange={(_, v) => set({ logoMargin: v })} /></Box>
                <FormControlLabel control={<Switch checked={s.hideBgDots} onChange={(e) => set({ hideBgDots: e.target.checked })} />} label="Remove background behind logo" />
              </Stack>
            ))}

            {acc('design', <MdTune size={22} />, 'Customize design', (
              <Stack spacing={2.5}>
                {[['Body shape', 'dot', DOT_TYPES, 'dotType'], ['Eye frame shape', 'cs', CORNER_SQUARE_TYPES, 'cornerSquareType'], ['Eye ball shape', 'cd', CORNER_DOT_TYPES, 'cornerDotType']].map(([t, kind, list, key]) => (
                  <Box key={key}>
                    <Typography fontWeight={600} mb={1}>{t}</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(84px, 1fr))', gap: 1 }}>
                      {list.map((v) => (
                        <ShapeBtn key={v} $active={s[key] === v} onClick={() => set({ [key]: v })}>
                          <ShapePreview kind={kind} type={v} />{v.replace('-', ' ')}
                        </ShapeBtn>
                      ))}
                    </Box>
                  </Box>
                ))}
                <Box><Typography variant="caption">Quiet zone (margin) {s.margin}px</Typography>
                  <Slider value={s.margin} min={0} max={40} onChange={(_, v) => set({ margin: v })} /></Box>
                <Box>
                  <Typography fontWeight={600} mb={1}>Error correction</Typography>
                  <ToggleButtonGroup exclusive size="small" value={s.ecl} onChange={(_, v) => v && set({ ecl: v })}>
                    {[['L', '7%'], ['M', '15%'], ['Q', '25%'], ['H', '30%']].map(([v, p]) => (
                      <Tooltip key={v} title={`Recovers ~${p} damage`}><ToggleButton value={v}>{v}</ToggleButton></Tooltip>
                    ))}
                  </ToggleButtonGroup>
                </Box>
              </Stack>
            ))}
          </div>

          <Sticky>
            <Paper elevation={0} sx={{ p: 2.5, border: 1, borderColor: 'divider' }}>
              <PreviewBox ref={ref} />
              <Box mt={2}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">Low quality</Typography>
                  <Typography variant="caption" fontWeight={700}>{dlSize} × {dlSize} px</Typography>
                  <Typography variant="caption" color="text.secondary">High quality</Typography>
                </Stack>
                <Slider value={dlSize} min={200} max={4000} step={100} onChange={(_, v) => setDlSize(v)} />
              </Box>
              <Button fullWidth size="large" variant="contained" startIcon={<MdDownload />} onClick={() => download('png')}
                sx={{ py: 1.5, background: 'linear-gradient(90deg,#6C4CF1,#00C2A8)' }}>
                Download PNG
              </Button>
              <Stack direction="row" spacing={1} mt={1}>
                {['svg', 'jpeg', 'webp'].map((e) => (
                  <Button key={e} fullWidth variant="outlined" onClick={() => download(e)}>.{e.toUpperCase()}</Button>
                ))}
              </Stack>
              <Stack direction="row" spacing={1} mt={1} justifyContent="center">
                <Tooltip title="Copy image"><IconButton onClick={copy}><MdContentCopy /></IconButton></Tooltip>
                <Tooltip title="Share"><IconButton onClick={share}><MdShare /></IconButton></Tooltip>
                <Tooltip title="Save design as default"><IconButton onClick={saveTemplate}><MdSave /></IconButton></Tooltip>
                <Tooltip title="Reset design"><IconButton onClick={() => { localStorage.removeItem('hartitudeh-qr-custom-style'); setS(DEFAULT_STYLE); }}><MdRestartAlt /></IconButton></Tooltip>
              </Stack>
            </Paper>
          </Sticky>
        </Layout>
      </Box>

      <section id="templates" style={{ scrollMarginTop: 80 }}>
        <SectionTitle>Design templates</SectionTitle>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 2 }}>
          {TEMPLATES.map((t) => (
            <TemplateCard key={t.name} onClick={() => { set(t.s); document.getElementById('generator').scrollIntoView({ behavior: 'smooth' }); }}>
              <div className="sw" style={{ background: `linear-gradient(135deg, ${t.s.dotColor}, ${t.s.dotGradient === 'none' ? t.s.cornerSquareColor : t.s.dotColor2})`, outline: `6px solid ${t.s.bgColor}`, outlineOffset: -6 }} />
              <Typography fontWeight={700}>{t.name}</Typography>
            </TemplateCard>
          ))}
        </Box>
      </section>

      <section id="history" style={{ scrollMarginTop: 80 }}>
        <SectionTitle>Recent QR codes</SectionTitle>
        {history.length === 0 ? (
          <Typography color="text.secondary">Your downloaded QR codes appear here (stored only on this device).</Typography>
        ) : (
          <Stack spacing={1}>
            {history.map((h) => (
              <Paper key={h.id} elevation={0} sx={{ p: 1.5, border: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Chip label={h.type} size="small" color="primary" />
                <Typography noWrap sx={{ flex: 1, minWidth: 0 }}>{h.data}</Typography>
                <Button size="small" onClick={() => { setType(h.type); setFields((f) => ({ ...f, [h.type]: h.fields })); setS(h.s); document.getElementById('generator').scrollIntoView({ behavior: 'smooth' }); }}>Load</Button>
                <IconButton size="small" onClick={() => { const n = history.filter((x) => x.id !== h.id); setHistory(n); localStorage.setItem('hartitudeh-qr-history', JSON.stringify(n)); }}><MdDelete /></IconButton>
              </Paper>
            ))}
          </Stack>
        )}
      </section>

      <Snackbar open={!!toast} autoHideDuration={2500} onClose={() => setToast(null)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        {toast ? <Alert severity={toast.sev} variant="filled" onClose={() => setToast(null)}>{toast.msg}</Alert> : <span />}
      </Snackbar>
    </>
  );
}
