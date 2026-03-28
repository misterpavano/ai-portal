import React from 'react';
import { createTheme } from '@mui/material/styles';
import { shadows } from './shadows';
import { createTypography } from './typography';
import { componentsOverrides } from './overrides';
import { colors } from './colors';
import { gradients } from './gradients';
import { backgrounds } from './backgrounds';

const theme = createTheme({
  components: componentsOverrides,
  typography: createTypography,
  spacing: 4,
  shape: {
    borderRadius: 10,
  },
  palette: {
    common: {
      black: colors.common.black,
      white: colors.common.white,
    },
    primary: {
      light: '#F09484',    // coral-300
      main: '#E86D5A',     // coral-400
      dark: '#D4553F',     // coral-500
      contrastText: colors.common.white,
      ...colors.primary,
    },
    error: {
      light: colors.error['200'],
      main: colors.error['300'],
      dark: colors.error['400'],
      contrastText: colors.common.white,
    },
    warning: {
      light: colors.warning['200'],
      main: colors.warning['300'],
      dark: colors.warning['400'],
      contrastText: colors.common.white,
    },
    success: {
      light: colors.success['200'],
      main: colors.success['300'],
      dark: colors.success['400'],
      contrastText: colors.common.white,
    },
    info: {
      light: '#89B3D1',
      main: '#5B8FB9',
      dark: '#47728F',
      contrastText: colors.common.white,
    },
    accent: {
      light: colors.coral['300'],
      main: colors.coral['400'],
      dark: colors.coral['500'],
      contrastText: colors.common.white,
      ...colors.coral,
    },
    gold: {
      light: colors.gold['300'],
      main: colors.gold['400'],
      dark: colors.gold['500'],
      contrastText: colors.common.white,
      ...colors.gold,
    },
    neutral: {
      ...colors.neutral,
    },
    transparent: {
      ...colors.transparent,
    },
    text: {
      primary: '#1C1917',    // charcoal-900
      secondary: '#44403C',  // charcoal-700
      disabled: '#A8A29E',   // charcoal-400
    },
    divider: '#E7E5E4',      // stone-200
  },
  customShadows: shadows,
  gradients,
  backgrounds,
});

/* eslint-disable no-unused-vars */
declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    subtle: true;
    subtleBordered: true;
  }
}

declare module '@mui/material/styles' {
  interface Theme {
    customShadows: typeof shadows;
    gradients?: typeof gradients;
    backgrounds: typeof backgrounds;
  }

  interface Palette {
    neutral: typeof colors.neutral;
    transparent: typeof colors.transparent;
    accent: Palette['primary'] & typeof colors.coral;
    gold: Palette['primary'] & typeof colors.gold;
  }

  interface ThemeOptions {
    customShadows?: typeof shadows;
    gradients?: typeof gradients;
    backgrounds?: typeof backgrounds;
  }

  interface PaletteOptions {
    neutral: typeof colors.neutral;
    transparent: typeof colors.transparent;
    accent?: PaletteOptions['primary'] & typeof colors.coral;
    gold?: PaletteOptions['primary'] & typeof colors.gold;
  }

  interface TypographyVariants {
    body: React.CSSProperties;
    body_bold: React.CSSProperties;
    body_paragraph: React.CSSProperties;
    small: React.CSSProperties;
    small_bold: React.CSSProperties;
    small_paragraph: React.CSSProperties;
    xsmall: React.CSSProperties;
    xsmall_bold: React.CSSProperties;
    xsmall_paragraph: React.CSSProperties;
    tiny: React.CSSProperties;
    tiny_bold: React.CSSProperties;
    tiny_paragraph: React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    body?: React.CSSProperties;
    body_bold?: React.CSSProperties;
    body_paragraph?: React.CSSProperties;
    small?: React.CSSProperties;
    small_bold?: React.CSSProperties;
    small_paragraph?: React.CSSProperties;
    xsmall?: React.CSSProperties;
    xsmall_bold?: React.CSSProperties;
    xsmall_paragraph?: React.CSSProperties;
    tiny?: React.CSSProperties;
    tiny_bold?: React.CSSProperties;
    tiny_paragraph?: React.CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    body: true;
    body_bold: true;
    body_paragraph: true;
    small: true;
    small_bold: true;
    small_paragraph: true;
    xsmall: true;
    xsmall_bold: true;
    xsmall_paragraph: true;
    tiny: true;
    tiny_bold: true;
    tiny_paragraph: true;
  }
}

export default theme;
