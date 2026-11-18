// Content types and payload builders
import {
  MdLink, MdTextFields, MdEmail, MdPhone, MdSms, MdWifi, MdContactPage,
  MdLocationOn, MdEvent, MdCurrencyBitcoin,
} from 'react-icons/md';
import { FaWhatsapp } from 'react-icons/fa';

const esc = (s = '') => s.replace(/([\\;,:"])/g, '\\$1');
const dt = (v) => (v ? v.replace(/[-:]/g, '') + '00' : '');

export const CONTENT_TYPES = [
  { id: 'url', label: 'URL', icon: MdLink, fields: [{ k: 'url', l: 'Website URL', ph: 'https://example.com' }],
    build: (d) => d.url || 'https://example.com' },
  { id: 'text', label: 'Text', icon: MdTextFields, fields: [{ k: 'text', l: 'Your text', multiline: true }],
    build: (d) => d.text || '' },
  { id: 'email', label: 'Email', icon: MdEmail,
    fields: [{ k: 'to', l: 'Email address' }, { k: 'subject', l: 'Subject' }, { k: 'body', l: 'Message', multiline: true }],
    build: (d) => `mailto:${d.to || ''}?subject=${encodeURIComponent(d.subject || '')}&body=${encodeURIComponent(d.body || '')}` },
  { id: 'phone', label: 'Phone', icon: MdPhone, fields: [{ k: 'phone', l: 'Phone number', ph: '+1 555 123 4567' }],
    build: (d) => `tel:${d.phone || ''}` },
  { id: 'sms', label: 'SMS', icon: MdSms, fields: [{ k: 'phone', l: 'Phone number' }, { k: 'msg', l: 'Message', multiline: true }],
    build: (d) => `SMSTO:${d.phone || ''}:${d.msg || ''}` },
  { id: 'whatsapp', label: 'WhatsApp', icon: FaWhatsapp, fields: [{ k: 'phone', l: 'Phone (intl, digits only)', ph: '15551234567' }, { k: 'msg', l: 'Message', multiline: true }],
    build: (d) => `https://wa.me/${(d.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(d.msg || '')}` },
  { id: 'wifi', label: 'WiFi', icon: MdWifi,
    fields: [{ k: 'ssid', l: 'Network name (SSID)' }, { k: 'pass', l: 'Password' },
      { k: 'enc', l: 'Encryption', select: ['WPA', 'WEP', 'nopass'] }, { k: 'hidden', l: 'Hidden network', check: true }],
    build: (d) => `WIFI:T:${d.enc || 'WPA'};S:${esc(d.ssid)};P:${esc(d.pass)};H:${d.hidden ? 'true' : ''};;` },
  { id: 'vcard', label: 'vCard', icon: MdContactPage,
    fields: [{ k: 'first', l: 'First name', half: true }, { k: 'last', l: 'Last name', half: true },
      { k: 'org', l: 'Company', half: true }, { k: 'title', l: 'Job title', half: true },
      { k: 'phone', l: 'Phone', half: true }, { k: 'email', l: 'Email', half: true },
      { k: 'web', l: 'Website' }, { k: 'addr', l: 'Address' }],
    build: (d) => ['BEGIN:VCARD', 'VERSION:3.0', `N:${d.last || ''};${d.first || ''}`, `FN:${d.first || ''} ${d.last || ''}`,
      d.org && `ORG:${d.org}`, d.title && `TITLE:${d.title}`, d.phone && `TEL:${d.phone}`, d.email && `EMAIL:${d.email}`,
      d.web && `URL:${d.web}`, d.addr && `ADR:;;${d.addr}`, 'END:VCARD'].filter(Boolean).join('\n') },
  { id: 'location', label: 'Location', icon: MdLocationOn,
    fields: [{ k: 'lat', l: 'Latitude', half: true, ph: '40.7128' }, { k: 'lng', l: 'Longitude', half: true, ph: '-74.0060' }],
    build: (d) => `geo:${d.lat || 0},${d.lng || 0}` },
  { id: 'event', label: 'Event', icon: MdEvent,
    fields: [{ k: 'title', l: 'Event title' }, { k: 'loc', l: 'Location' },
      { k: 'start', l: 'Start', type: 'datetime-local', half: true }, { k: 'end', l: 'End', type: 'datetime-local', half: true }],
    build: (d) => ['BEGIN:VEVENT', `SUMMARY:${d.title || ''}`, d.loc && `LOCATION:${d.loc}`,
      d.start && `DTSTART:${dt(d.start)}`, d.end && `DTEND:${dt(d.end)}`, 'END:VEVENT'].filter(Boolean).join('\n') },
  { id: 'crypto', label: 'Bitcoin', icon: MdCurrencyBitcoin,
    fields: [{ k: 'addr', l: 'BTC address' }, { k: 'amount', l: 'Amount', half: true }, { k: 'label', l: 'Label', half: true }],
    build: (d) => `bitcoin:${d.addr || ''}?amount=${d.amount || ''}&label=${encodeURIComponent(d.label || '')}` },
];

export const DOT_TYPES = ['square', 'dots', 'rounded', 'extra-rounded', 'classy', 'classy-rounded'];
export const CORNER_SQUARE_TYPES = ['square', 'extra-rounded', 'dot'];
export const CORNER_DOT_TYPES = ['square', 'dot'];

export const DEFAULT_STYLE = {
  size: 1000,
  margin: 10,
  ecl: 'Q',
  dotType: 'rounded',
  dotColor: '#1A1A2E',
  dotColor2: '#6C4CF1',
  dotGradient: 'none', // none | linear | radial
  gradRotation: 45,
  bgColor: '#FFFFFF',
  bgTransparent: false,
  cornerSquareType: 'extra-rounded',
  cornerSquareColor: '#6C4CF1',
  cornerDotType: 'dot',
  cornerDotColor: '#1A1A2E',
  logo: '',
  logoSize: 0.35,
  logoMargin: 6,
  hideBgDots: true,
};

export const TEMPLATES = [
  { name: 'Classic', s: { dotType: 'square', dotColor: '#000000', dotGradient: 'none', cornerSquareType: 'square', cornerSquareColor: '#000000', cornerDotType: 'square', cornerDotColor: '#000000', bgColor: '#FFFFFF' } },
  { name: 'Violet Glow', s: { dotType: 'rounded', dotColor: '#6C4CF1', dotColor2: '#00C2A8', dotGradient: 'linear', cornerSquareType: 'extra-rounded', cornerSquareColor: '#6C4CF1', cornerDotType: 'dot', cornerDotColor: '#00C2A8', bgColor: '#FFFFFF' } },
  { name: 'Sunset', s: { dotType: 'classy-rounded', dotColor: '#FF512F', dotColor2: '#DD2476', dotGradient: 'linear', cornerSquareType: 'extra-rounded', cornerSquareColor: '#DD2476', cornerDotType: 'dot', cornerDotColor: '#FF512F', bgColor: '#FFF8F2' } },
  { name: 'Ocean', s: { dotType: 'dots', dotColor: '#0052D4', dotColor2: '#4ECDC4', dotGradient: 'radial', cornerSquareType: 'dot', cornerSquareColor: '#0052D4', cornerDotType: 'dot', cornerDotColor: '#0052D4', bgColor: '#F0F8FF' } },
  { name: 'Forest', s: { dotType: 'extra-rounded', dotColor: '#134E5E', dotColor2: '#71B280', dotGradient: 'linear', cornerSquareType: 'extra-rounded', cornerSquareColor: '#134E5E', cornerDotType: 'square', cornerDotColor: '#71B280', bgColor: '#FFFFFF' } },
  { name: 'Night', s: { dotType: 'classy', dotColor: '#F8F8FF', dotGradient: 'none', cornerSquareType: 'extra-rounded', cornerSquareColor: '#FFD166', cornerDotType: 'dot', cornerDotColor: '#FFD166', bgColor: '#111122' } },
  { name: 'Gold', s: { dotType: 'rounded', dotColor: '#B8860B', dotColor2: '#FFD700', dotGradient: 'linear', cornerSquareType: 'square', cornerSquareColor: '#8B6508', cornerDotType: 'square', cornerDotColor: '#8B6508', bgColor: '#FFFDF5' } },
  { name: 'Candy', s: { dotType: 'dots', dotColor: '#F72585', dotColor2: '#7209B7', dotGradient: 'radial', cornerSquareType: 'dot', cornerSquareColor: '#7209B7', cornerDotType: 'dot', cornerDotColor: '#F72585', bgColor: '#FFF0F6' } },
];

const svg = (inner, bg) => 'data:image/svg+xml;utf8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="${bg}"/>${inner}</svg>`);

export const LOGO_PRESETS = [
  { name: 'Link', src: svg('<path d="M42 58l16-16M38 50l-6 6a9 9 0 0013 13l6-6M62 50l6-6a9 9 0 00-13-13l-6 6" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round"/>', '#6C4CF1') },
  { name: 'WiFi', src: svg('<path d="M25 45a35 35 0 0150 0M33 54a23 23 0 0134 0M41 63a11 11 0 0118 0" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="50" cy="72" r="4" fill="#fff"/>', '#0052D4') },
  { name: 'Mail', src: svg('<rect x="25" y="33" width="50" height="34" rx="4" fill="none" stroke="#fff" stroke-width="6"/><path d="M27 36l23 18 23-18" stroke="#fff" stroke-width="6" fill="none"/>', '#EA4335') },
  { name: 'Phone', src: svg('<path d="M36 28l8 0 4 12-6 4a30 30 0 0014 14l4-6 12 4v8a6 6 0 01-6 6A44 44 0 0130 34a6 6 0 016-6z" fill="#fff"/>', '#00C2A8') },
  { name: 'Heart', src: svg('<path d="M50 74L28 52a13 13 0 0122-17 13 13 0 0122 17z" fill="#fff"/>', '#F72585') },
  { name: 'Star', src: svg('<path d="M50 24l8 17 18 2-13 12 4 18-17-9-17 9 4-18-13-12 18-2z" fill="#fff"/>', '#FFB300') },
];
