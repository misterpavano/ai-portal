import { TypographyOptions } from '@mui/material/styles/createTypography';

export const createTypography = (): TypographyOptions => ({
  htmlFontSize: 16,
  fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
  h1: {
    fontWeight: 700,
    fontSize: '24px',
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },
  h2: {
    fontWeight: 600,
    fontSize: '20px',
    lineHeight: 1.4,
  },
  h3: {
    fontWeight: 600,
    fontSize: '16px',
    lineHeight: 1.4,
  },
  h4: {
    fontWeight: 600,
    fontSize: '14px',
    lineHeight: 1.4,
  },
  body: {
    fontWeight: 400,
    fontSize: '14px',
    lineHeight: 1.6,
  },
  body_bold: {
    fontWeight: 500,
    fontSize: '14px',
    lineHeight: 1.6,
  },
  body_paragraph: {
    fontWeight: 400,
    fontSize: '14px',
    lineHeight: 1.6,
  },
  small: {
    fontWeight: 400,
    fontSize: '13px',
    lineHeight: 1.5,
  },
  small_bold: {
    fontWeight: 600,
    fontSize: '13px',
    lineHeight: 1.5,
  },
  small_paragraph: {
    fontWeight: 400,
    fontSize: '13px',
    lineHeight: 1.6,
  },
  xsmall: {
    fontWeight: 500,
    fontSize: '12px',
    lineHeight: 1.5,
  },
  xsmall_bold: {
    fontWeight: 600,
    fontSize: '12px',
    lineHeight: 1.5,
  },
  xsmall_paragraph: {
    fontWeight: 400,
    fontSize: '12px',
    lineHeight: 1.6,
  },
  tiny: {
    fontWeight: 600,
    fontSize: '10px',
    lineHeight: 1.4,
    letterSpacing: '0.04em',
  },
  tiny_bold: {
    fontWeight: 700,
    fontSize: '10px',
    lineHeight: 1.4,
    letterSpacing: '0.04em',
  },
  tiny_paragraph: {
    fontWeight: 400,
    fontSize: '10px',
    lineHeight: 1.6,
  },
  button: {
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '13px',
  },
});
