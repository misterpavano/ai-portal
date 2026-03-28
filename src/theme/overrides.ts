import type { ThemeOptions } from '@mui/material/styles';
import '@mui/lab/themeAugmentation';

// ─── The Editor Design System ────────────────────────────────────────────
// Border-radius scale: sharp 2px | sm 6px | md 10px | lg 14px | xl 20px | full 9999px
// Accent color (coral): #E86D5A  |  Ring: rgba(232,109,90,0.12)
// Primary action (charcoal-900): #1C1917
// Neutral border (stone-200): #E7E5E4
// ─────────────────────────────────────────────────────────────────────────

const radius = {
  sharp: 2,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
} as const;

// Stone / Charcoal palette (from design system spec)
const stone = {
  50: '#FAFAF9',
  100: '#F5F5F4',
  200: '#E7E5E4',
  300: '#D6D3D1',
  400: '#A8A29E',
  500: '#78716C',
  600: '#57534E',
  700: '#44403C',
  800: '#292524',
  900: '#1C1917',
  950: '#0C0A09',
} as const;

const coral = {
  50: '#FEF2F0',
  100: '#FDDDD8',
  200: '#F9B4A8',
  300: '#F08D7A',
  400: '#EC7A65',
  500: '#E86D5A',
  600: '#D4563F',
  700: '#B84430',
  ring: 'rgba(232,109,90,0.12)',
} as const;

// Status colors for alerts
const status = {
  approved: { bg: '#F0FDF4', border: '#BBF7D0', text: '#166534', main: '#16A34A' },
  changes: { bg: '#FFFBEB', border: '#FDE68A', text: '#92400E', main: '#D97706' },
  rejected: { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B', main: '#DC2626' },
  info: { bg: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF', main: '#2563EB' },
} as const;

export const componentsOverrides: ThemeOptions['components'] = {

  // ─── Base ────────────────────────────────────────────────────────────
  MuiCssBaseline: {
    styleOverrides: {
      '*, *::before, *::after': {
        boxSizing: 'border-box',
      },
      body: {
        backgroundColor: stone[50],
        color: stone[900],
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      },
      '::selection': {
        backgroundColor: coral.ring,
        color: stone[950],
      },
    },
  },

  MuiButtonBase: {
    defaultProps: {
      disableRipple: true,
    },
  },

  // ─── Buttons ─────────────────────────────────────────────────────────
  MuiButton: {
    defaultProps: {
      disableElevation: true,
    },
    variants: [
      {
        props: { variant: 'subtle' },
        style: {
          color: stone[700],
          backgroundColor: 'transparent',
          '&:hover': {
            backgroundColor: stone[100],
            color: stone[900],
          },
        },
      },
      {
        props: { variant: 'subtleBordered' },
        style: {
          color: stone[900],
          backgroundColor: 'transparent',
          border: `1px solid ${stone[200]}`,
          '&:hover': {
            backgroundColor: stone[50],
            borderColor: stone[400],
          },
          '& .MuiLoadingButton-loadingIndicator': {
            color: stone[400],
          },
          '&.Mui-disabled:not(.MuiLoadingButton-loading)': {
            color: stone[400],
            borderColor: stone[200],
          },
        },
      },
      {
        props: { variant: 'subtleBordered', disabled: true },
        style: {
          borderColor: stone[200],
          color: stone[400],
        },
      },
    ],
    styleOverrides: {
      root: ({ ownerState, theme }) => ({
        borderRadius: radius.sm,
        fontWeight: 600,
        fontSize: '13px',
        height: 38,
        padding: '8px 24px',
        transition: 'all 200ms ease-out',
        textTransform: 'none' as const,

        // ── Contained (Primary) ──
        ...(ownerState.variant === 'contained' && {
          backgroundColor: stone[900],
          color: theme.palette.common.white,
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: stone[700],
            boxShadow: '0 2px 8px rgba(28,25,23,0.2)',
          },
          '&:active': {
            backgroundColor: stone[800],
            boxShadow: 'none',
          },
          '&.Mui-disabled': {
            backgroundColor: stone[300],
            color: stone[500],
          },
        }),

        // ── Outlined (Secondary) ──
        ...(ownerState.variant === 'outlined' && {
          backgroundColor: theme.palette.common.white,
          color: stone[900],
          borderColor: stone[200],
          borderWidth: 1,
          '&:hover': {
            backgroundColor: stone[50],
            borderColor: stone[400],
            borderWidth: 1,
          },
          '&:active': {
            backgroundColor: stone[100],
          },
          '&.Mui-disabled': {
            borderColor: stone[200],
            color: stone[400],
          },
        }),

        // ── Text (Ghost) ──
        ...(ownerState.variant === 'text' && {
          backgroundColor: 'transparent',
          color: stone[700],
          '&:hover': {
            backgroundColor: stone[100],
            color: stone[900],
          },
          '&:active': {
            backgroundColor: stone[200],
          },
        }),
      }),
      sizeSmall: {
        height: 32,
        fontSize: '12px',
        padding: '6px 16px',
      },
      sizeLarge: {
        height: 44,
        fontSize: '14px',
        padding: '10px 28px',
      },
      startIcon: {
        marginRight: 6,
      },
      endIcon: {
        marginLeft: 6,
      },
    },
  },

  MuiIconButton: {
    styleOverrides: {
      root: {
        borderRadius: radius.sm,
        transition: 'all 200ms ease-out',
        color: stone[700],
        '&:hover': {
          backgroundColor: stone[100],
          color: stone[900],
        },
      },
      sizeSmall: {
        padding: 6,
      },
    },
  },

  MuiLoadingButton: {
    defaultProps: {
      disableElevation: true,
    },
    styleOverrides: {
      root: {
        '& .MuiLoadingButton-loadingIndicator': {
          color: stone[400],
        },
      },
    },
  },

  MuiToggleButton: {
    styleOverrides: {
      root: {
        borderRadius: radius.sm,
        borderColor: stone[200],
        color: stone[600],
        fontWeight: 500,
        fontSize: '13px',
        textTransform: 'none' as const,
        transition: 'all 200ms ease-out',
        '&.Mui-selected': {
          backgroundColor: stone[900],
          color: '#fff',
          borderColor: stone[900],
          '&:hover': {
            backgroundColor: stone[700],
          },
        },
        '&:hover': {
          backgroundColor: stone[50],
        },
      },
    },
  },

  MuiToggleButtonGroup: {
    styleOverrides: {
      root: {
        gap: 0,
      },
      grouped: {
        '&:not(:first-of-type)': {
          borderLeft: `1px solid ${stone[200]}`,
          marginLeft: 0,
        },
      },
    },
  },

  MuiButtonGroup: {
    defaultProps: {
      disableElevation: true,
    },
    styleOverrides: {
      root: {
        borderRadius: radius.sm,
      },
      grouped: {
        '&:not(:last-of-type)': {
          borderRight: `1px solid ${stone[200]}`,
        },
      },
    },
  },

  // ─── Inputs & Forms ──────────────────────────────────────────────────
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: radius.sm,
        backgroundColor: '#fff',
        transition: 'all 200ms ease-out',
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: stone[400],
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: coral[500],
          borderWidth: 1,
          boxShadow: `0 0 0 3px ${coral.ring}`,
        },
        '&.Mui-error .MuiOutlinedInput-notchedOutline': {
          borderColor: status.rejected.main,
        },
        '&.Mui-disabled': {
          backgroundColor: stone[50],
        },
      },
      notchedOutline: {
        borderColor: stone[200],
        transition: 'border-color 200ms ease-out, box-shadow 200ms ease-out',
      },
      input: {
        height: 40,
        padding: '0 14px',
        boxSizing: 'border-box' as const,
        fontSize: '14px',
        '&::placeholder': {
          color: stone[400],
          opacity: 1,
        },
      },
      multiline: {
        padding: 0,
      },
      inputMultiline: {
        padding: '10px 14px',
        height: 'auto',
      },
    },
  },

  MuiFilledInput: {
    styleOverrides: {
      root: {
        borderRadius: radius.sm,
        backgroundColor: stone[50],
        transition: 'all 200ms ease-out',
        '&:hover': {
          backgroundColor: stone[100],
        },
        '&.Mui-focused': {
          backgroundColor: '#fff',
        },
        '&::before, &::after': {
          display: 'none',
        },
      },
    },
  },

  MuiInputBase: {
    styleOverrides: {
      root: {
        fontSize: '14px',
      },
    },
  },

  MuiInputLabel: {
    styleOverrides: {
      root: {
        fontSize: '12px',
        fontWeight: 600,
        color: stone[900],
        '&.Mui-focused': {
          color: stone[900],
        },
      },
      shrink: {
        top: 0,
      },
    },
  },

  MuiFormLabel: {
    styleOverrides: {
      root: {
        fontSize: '12px',
        fontWeight: 600,
        color: stone[900],
        '&.Mui-focused': {
          color: stone[900],
        },
      },
    },
  },

  MuiFormHelperText: {
    styleOverrides: {
      root: {
        margin: '4px 0 0',
        fontSize: '12px',
        lineHeight: 1.4,
      },
    },
  },

  MuiFormControlLabel: {
    styleOverrides: {
      root: {
        marginLeft: -6,
      },
      label: {
        fontSize: '13px',
        fontWeight: 500,
        color: stone[700],
      },
    },
  },

  MuiTextField: {
    defaultProps: {
      variant: 'outlined',
      size: 'small',
    },
  },

  MuiSelect: {
    styleOverrides: {
      select: {
        fontSize: '14px',
      },
      icon: {
        color: stone[400],
        transition: 'color 200ms ease-out',
      },
    },
  },

  MuiAutocomplete: {
    styleOverrides: {
      paper: {
        borderRadius: radius.md,
        boxShadow: '0px 10px 30px rgba(28,25,23,0.12), 0px 2px 8px rgba(28,25,23,0.06)',
        border: `1px solid ${stone[200]}`,
        marginTop: 4,
      },
      option: {
        fontSize: '13px',
        padding: '8px 14px',
        borderRadius: radius.sharp,
        margin: '0 4px',
        transition: 'background-color 150ms ease-out',
        '&[aria-selected="true"]': {
          backgroundColor: stone[100],
        },
        '&.Mui-focused': {
          backgroundColor: stone[50],
        },
      },
      listbox: {
        padding: '4px 0',
      },
      tag: {
        borderRadius: radius.full,
        fontSize: '12px',
        fontWeight: 500,
      },
    },
  },

  // ─── Checkbox / Radio / Switch ───────────────────────────────────────
  MuiCheckbox: {
    styleOverrides: {
      root: {
        color: stone[300],
        borderRadius: radius.sharp,
        padding: 6,
        transition: 'all 200ms ease-out',
        '&.Mui-checked': {
          color: stone[900],
        },
        '&:hover': {
          backgroundColor: stone[50],
        },
      },
    },
  },

  MuiRadio: {
    styleOverrides: {
      root: {
        color: stone[300],
        padding: 6,
        transition: 'all 200ms ease-out',
        '&.Mui-checked': {
          color: stone[900],
        },
        '&:hover': {
          backgroundColor: stone[50],
        },
      },
    },
  },

  MuiSwitch: {
    styleOverrides: {
      root: {
        width: 42,
        height: 24,
        padding: 0,
      },
      switchBase: {
        padding: 2,
        transitionDuration: '200ms',
        '&.Mui-checked': {
          transform: 'translateX(18px)',
          color: '#fff',
          '& + .MuiSwitch-track': {
            backgroundColor: coral[500],
            opacity: 1,
            border: 0,
          },
        },
        '&.Mui-disabled + .MuiSwitch-track': {
          opacity: 0.4,
        },
      },
      thumb: {
        boxSizing: 'border-box',
        width: 20,
        height: 20,
        boxShadow: '0 1px 3px rgba(28,25,23,0.15)',
      },
      track: {
        borderRadius: radius.full,
        backgroundColor: stone[300],
        opacity: 1,
        transition: 'background-color 200ms ease-out',
      },
    },
  },

  // ─── Cards & Surfaces ────────────────────────────────────────────────
  MuiCard: {
    defaultProps: {
      elevation: 0,
    },
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: radius.md,
        backgroundColor: theme.palette.common.white,
        boxShadow: theme.customShadows.raised,
        border: 'none',
        transition: 'box-shadow 200ms ease-out, transform 200ms ease-out',
        '&:hover': {
          boxShadow: theme.customShadows.elevated,
          transform: 'translateY(-2px)',
        },
      }),
    },
  },

  MuiCardHeader: {
    styleOverrides: {
      root: {
        padding: '20px 24px 0',
      },
      title: {
        fontSize: '16px',
        fontWeight: 600,
        color: stone[900],
      },
      subheader: {
        fontSize: '13px',
        color: stone[500],
        marginTop: 2,
      },
    },
  },

  MuiCardContent: {
    styleOverrides: {
      root: {
        padding: '16px 24px',
        '&:last-child': {
          paddingBottom: 20,
        },
      },
    },
  },

  MuiCardActions: {
    styleOverrides: {
      root: {
        padding: '12px 24px 20px',
        gap: 8,
      },
    },
  },

  MuiPaper: {
    defaultProps: {
      elevation: 0,
    },
    styleOverrides: {
      root: {
        backgroundImage: 'none',
      },
      rounded: {
        borderRadius: radius.md,
      },
      outlined: {
        borderColor: stone[200],
      },
    },
  },

  // ─── Accordion ───────────────────────────────────────────────────────
  MuiAccordion: {
    defaultProps: {
      elevation: 0,
      disableGutters: true,
    },
    styleOverrides: {
      root: {
        borderRadius: radius.md,
        border: `1px solid ${stone[200]}`,
        '&::before': {
          display: 'none',
        },
        '&.Mui-expanded': {
          margin: 0,
        },
      },
    },
  },

  MuiAccordionSummary: {
    styleOverrides: {
      root: {
        padding: '0 20px',
        minHeight: 52,
        fontWeight: 600,
        fontSize: '14px',
        color: stone[900],
        '&.Mui-expanded': {
          minHeight: 52,
        },
      },
      content: {
        margin: '14px 0',
        '&.Mui-expanded': {
          margin: '14px 0',
        },
      },
    },
  },

  MuiAccordionDetails: {
    styleOverrides: {
      root: {
        padding: '0 20px 20px',
        fontSize: '13px',
        color: stone[600],
      },
    },
  },

  // ─── Chips & Badges ──────────────────────────────────────────────────
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: radius.full,
        fontWeight: 600,
        fontSize: '11px',
        height: 'auto',
        padding: '3px 10px',
        transition: 'all 200ms ease-out',
      },
      filled: {
        backgroundColor: stone[100],
        color: stone[700],
        '&:hover': {
          backgroundColor: stone[200],
        },
      },
      outlined: {
        borderColor: stone[200],
        color: stone[700],
        '&:hover': {
          backgroundColor: stone[50],
        },
      },
      label: {
        padding: 0,
        lineHeight: 1.5,
      },
      icon: {
        fontSize: '14px',
        marginLeft: 0,
        marginRight: 4,
      },
      deleteIcon: {
        fontSize: '14px',
        color: stone[400],
        marginRight: 0,
        marginLeft: 4,
        '&:hover': {
          color: stone[600],
        },
      },
      sizeSmall: {
        fontSize: '10px',
        padding: '2px 8px',
      },
    },
  },

  MuiBadge: {
    styleOverrides: {
      badge: {
        fontSize: '10px',
        fontWeight: 700,
        minWidth: 18,
        height: 18,
        borderRadius: radius.full,
        padding: '0 5px',
      },
      colorPrimary: {
        backgroundColor: coral[500],
      },
    },
  },

  // ─── Tooltips ────────────────────────────────────────────────────────
  MuiTooltip: {
    defaultProps: {
      arrow: true,
    },
    styleOverrides: {
      tooltip: {
        backgroundColor: stone[950],
        color: '#fff',
        borderRadius: radius.sm,
        fontSize: '12px',
        fontWeight: 500,
        padding: '6px 12px',
        lineHeight: 1.5,
        maxWidth: 280,
      },
      arrow: {
        color: stone[950],
      },
    },
  },

  // ─── Dialogs / Modals ────────────────────────────────────────────────
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: radius.lg,
        boxShadow: '0px 20px 60px rgba(12,10,9,0.18), 0px 8px 20px rgba(12,10,9,0.1)',
        backgroundImage: 'none',
      },
      paperWidthSm: {
        maxWidth: 480,
      },
    },
  },

  MuiDialogTitle: {
    styleOverrides: {
      root: {
        fontSize: '18px',
        fontWeight: 600,
        color: stone[900],
        padding: '24px 28px 8px',
        letterSpacing: '-0.01em',
      },
    },
  },

  MuiDialogContent: {
    styleOverrides: {
      root: {
        padding: '16px 28px',
        fontSize: '14px',
        color: stone[600],
        lineHeight: 1.6,
      },
    },
  },

  MuiDialogActions: {
    styleOverrides: {
      root: {
        padding: '16px 28px 24px',
        gap: 8,
      },
    },
  },

  MuiBackdrop: {
    styleOverrides: {
      root: {
        backgroundColor: 'rgba(12,10,9,0.6)',
        backdropFilter: 'blur(4px)',
      },
      invisible: {
        backgroundColor: 'transparent',
        backdropFilter: 'none',
      },
    },
  },

  // ─── Tabs ────────────────────────────────────────────────────────────
  MuiTabs: {
    styleOverrides: {
      root: {
        minHeight: 40,
      },
      indicator: {
        height: 3,
        borderRadius: `${radius.sharp}px ${radius.sharp}px 0 0`,
        backgroundColor: coral[500],
      },
    },
  },

  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: 'none' as const,
        fontWeight: 500,
        fontSize: '13px',
        color: stone[400],
        minHeight: 40,
        padding: '8px 16px',
        transition: 'color 200ms ease-out',
        '&.Mui-selected': {
          color: stone[900],
          fontWeight: 600,
        },
        '&:hover': {
          color: stone[700],
        },
      },
    },
  },

  // ─── LinearProgress ──────────────────────────────────────────────────
  MuiLinearProgress: {
    styleOverrides: {
      root: {
        height: 8,
        borderRadius: radius.full,
        backgroundColor: stone[200],
      },
      bar: {
        borderRadius: radius.full,
        backgroundColor: coral[500],
      },
      colorPrimary: {
        backgroundColor: stone[200],
      },
      barColorPrimary: {
        backgroundColor: coral[500],
      },
      colorSecondary: {
        backgroundColor: stone[200],
      },
      barColorSecondary: {
        backgroundColor: stone[900],
      },
    },
  },

  MuiCircularProgress: {
    styleOverrides: {
      colorPrimary: {
        color: coral[500],
      },
    },
  },

  // ─── Divider ─────────────────────────────────────────────────────────
  MuiDivider: {
    styleOverrides: {
      root: {
        borderColor: stone[200],
      },
    },
  },

  // ─── Alert ───────────────────────────────────────────────────────────
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: radius.md,
        fontSize: '13px',
        fontWeight: 500,
        padding: '12px 16px',
        alignItems: 'center',
        border: '1px solid',
      },
      icon: {
        padding: 0,
        marginRight: 12,
        opacity: 1,
        fontSize: '20px',
      },
      message: {
        padding: 0,
      },
      standardSuccess: {
        backgroundColor: status.approved.bg,
        borderColor: status.approved.border,
        color: status.approved.text,
        '& .MuiAlert-icon': {
          color: status.approved.main,
        },
      },
      standardWarning: {
        backgroundColor: status.changes.bg,
        borderColor: status.changes.border,
        color: status.changes.text,
        '& .MuiAlert-icon': {
          color: status.changes.main,
        },
      },
      standardError: {
        backgroundColor: status.rejected.bg,
        borderColor: status.rejected.border,
        color: status.rejected.text,
        '& .MuiAlert-icon': {
          color: status.rejected.main,
        },
      },
      standardInfo: {
        backgroundColor: status.info.bg,
        borderColor: status.info.border,
        color: status.info.text,
        '& .MuiAlert-icon': {
          color: status.info.main,
        },
      },
      filledSuccess: {
        backgroundColor: status.approved.main,
      },
      filledWarning: {
        backgroundColor: status.changes.main,
      },
      filledError: {
        backgroundColor: status.rejected.main,
      },
      filledInfo: {
        backgroundColor: status.info.main,
      },
    },
  },

  MuiAlertTitle: {
    styleOverrides: {
      root: {
        fontWeight: 600,
        fontSize: '14px',
        marginBottom: 2,
      },
    },
  },

  // ─── Skeleton ────────────────────────────────────────────────────────
  MuiSkeleton: {
    defaultProps: {
      animation: 'wave',
    },
    styleOverrides: {
      root: {
        backgroundColor: stone[200],
        borderRadius: radius.sm,
        '&::after': {
          background: `linear-gradient(90deg, transparent, ${stone[100]}, transparent)`,
        },
      },
      rounded: {
        borderRadius: radius.sm,
      },
      circular: {
        borderRadius: radius.full,
      },
    },
  },

  // ─── Table ───────────────────────────────────────────────────────────
  MuiTableContainer: {
    styleOverrides: {
      root: {
        borderRadius: radius.md,
        border: `1px solid ${stone[200]}`,
      },
    },
  },

  MuiTableHead: {
    styleOverrides: {
      root: {
        backgroundColor: stone[50],
      },
    },
  },

  MuiTableCell: {
    styleOverrides: {
      root: {
        borderBottom: `1px solid ${stone[200]}`,
        padding: '12px 16px',
        fontSize: '13px',
        color: stone[700],
      },
      head: {
        fontWeight: 600,
        fontSize: '11px',
        color: stone[500],
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
        backgroundColor: stone[50],
        lineHeight: 1.5,
      },
    },
  },

  MuiTableRow: {
    styleOverrides: {
      root: {
        transition: 'background-color 150ms ease-out',
        '&:hover': {
          backgroundColor: stone[50],
        },
        '&:last-child td': {
          borderBottom: 0,
        },
      },
    },
  },

  MuiTablePagination: {
    styleOverrides: {
      root: {
        fontSize: '13px',
        color: stone[600],
      },
      selectLabel: {
        fontSize: '13px',
      },
      displayedRows: {
        fontSize: '13px',
      },
    },
  },

  // ─── List ────────────────────────────────────────────────────────────
  MuiList: {
    styleOverrides: {
      root: {
        padding: '4px 0',
      },
    },
  },

  MuiListItem: {
    styleOverrides: {
      root: {
        padding: '4px 8px',
      },
    },
  },

  MuiListItemButton: {
    styleOverrides: {
      root: {
        borderRadius: radius.sm,
        padding: '8px 12px',
        transition: 'all 150ms ease-out',
        '&:hover': {
          backgroundColor: stone[50],
        },
        '&.Mui-selected': {
          backgroundColor: stone[100],
          '&:hover': {
            backgroundColor: stone[100],
          },
        },
      },
    },
  },

  MuiListItemIcon: {
    styleOverrides: {
      root: {
        minWidth: 36,
        color: stone[500],
      },
    },
  },

  MuiListItemText: {
    styleOverrides: {
      primary: {
        fontSize: '13px',
        fontWeight: 500,
        color: stone[900],
      },
      secondary: {
        fontSize: '12px',
        color: stone[500],
        marginTop: 2,
      },
    },
  },

  MuiListSubheader: {
    styleOverrides: {
      root: {
        fontSize: '11px',
        fontWeight: 600,
        color: stone[500],
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
        lineHeight: '32px',
        backgroundColor: 'transparent',
      },
    },
  },

  // ─── Menu & Popover ──────────────────────────────────────────────────
  MuiMenu: {
    styleOverrides: {
      paper: {
        borderRadius: radius.md,
        boxShadow: '0px 10px 30px rgba(28,25,23,0.12), 0px 2px 8px rgba(28,25,23,0.06)',
        border: `1px solid ${stone[200]}`,
        minWidth: 180,
      },
      list: {
        padding: '4px',
      },
    },
  },

  MuiMenuItem: {
    styleOverrides: {
      root: {
        fontSize: '13px',
        fontWeight: 500,
        borderRadius: radius.sm,
        padding: '8px 12px',
        margin: '0 0 1px',
        transition: 'all 150ms ease-out',
        color: stone[700],
        '&:hover': {
          backgroundColor: stone[50],
        },
        '&.Mui-selected': {
          backgroundColor: stone[100],
          fontWeight: 600,
          color: stone[900],
          '&:hover': {
            backgroundColor: stone[100],
          },
        },
        '& .MuiListItemIcon-root': {
          minWidth: 28,
          color: stone[500],
        },
      },
    },
  },

  MuiPopover: {
    styleOverrides: {
      paper: {
        borderRadius: radius.md,
        boxShadow: '0px 10px 30px rgba(28,25,23,0.12), 0px 2px 8px rgba(28,25,23,0.06)',
        border: `1px solid ${stone[200]}`,
      },
    },
  },

  // ─── Drawer ──────────────────────────────────────────────────────────
  MuiDrawer: {
    styleOverrides: {
      paper: {
        border: 'none',
        boxShadow: '0px 20px 60px rgba(12,10,9,0.18)',
      },
    },
  },

  // ─── Avatar ──────────────────────────────────────────────────────────
  MuiAvatar: {
    styleOverrides: {
      root: {
        fontSize: '13px',
        fontWeight: 600,
        backgroundColor: stone[200],
        color: stone[700],
      },
      rounded: {
        borderRadius: radius.sm,
      },
    },
  },

  MuiAvatarGroup: {
    styleOverrides: {
      avatar: {
        border: '2px solid #fff',
        width: 32,
        height: 32,
        fontSize: '12px',
      },
    },
  },

  // ─── Breadcrumbs ─────────────────────────────────────────────────────
  MuiBreadcrumbs: {
    styleOverrides: {
      root: {
        fontSize: '13px',
      },
      separator: {
        color: stone[400],
      },
      li: {
        '& a': {
          color: stone[500],
          textDecoration: 'none',
          fontWeight: 500,
          transition: 'color 200ms ease-out',
          '&:hover': {
            color: stone[900],
          },
        },
      },
    },
  },

  // ─── Stepper ─────────────────────────────────────────────────────────
  MuiStepper: {
    styleOverrides: {
      root: {
        padding: 0,
      },
    },
  },

  MuiStepLabel: {
    styleOverrides: {
      label: {
        fontSize: '13px',
        fontWeight: 500,
        color: stone[500],
        '&.Mui-active': {
          fontWeight: 600,
          color: stone[900],
        },
        '&.Mui-completed': {
          fontWeight: 500,
          color: stone[600],
        },
      },
    },
  },

  MuiStepIcon: {
    styleOverrides: {
      root: {
        color: stone[300],
        '&.Mui-active': {
          color: stone[900],
        },
        '&.Mui-completed': {
          color: stone[900],
        },
      },
    },
  },

  MuiStepConnector: {
    styleOverrides: {
      line: {
        borderColor: stone[200],
      },
    },
  },

  // ─── Pagination ──────────────────────────────────────────────────────
  MuiPaginationItem: {
    styleOverrides: {
      root: {
        borderRadius: radius.sm,
        fontSize: '13px',
        fontWeight: 500,
        minWidth: 34,
        height: 34,
        transition: 'all 200ms ease-out',
        '&.Mui-selected': {
          backgroundColor: stone[900],
          color: '#fff',
          '&:hover': {
            backgroundColor: stone[700],
          },
        },
        '&:hover': {
          backgroundColor: stone[50],
        },
      },
    },
  },

  // ─── Slider ──────────────────────────────────────────────────────────
  MuiSlider: {
    styleOverrides: {
      root: {
        height: 6,
        color: coral[500],
      },
      track: {
        border: 'none',
        borderRadius: radius.full,
      },
      rail: {
        backgroundColor: stone[200],
        borderRadius: radius.full,
        opacity: 1,
      },
      thumb: {
        width: 18,
        height: 18,
        backgroundColor: '#fff',
        border: `2px solid ${coral[500]}`,
        boxShadow: '0 1px 4px rgba(28,25,23,0.15)',
        '&:hover, &.Mui-focusVisible': {
          boxShadow: `0 0 0 6px ${coral.ring}`,
        },
        '&.Mui-active': {
          boxShadow: `0 0 0 8px ${coral.ring}`,
        },
      },
      valueLabel: {
        backgroundColor: stone[950],
        borderRadius: radius.sm,
        fontSize: '12px',
        fontWeight: 500,
        padding: '4px 8px',
      },
    },
  },

  // ─── Rating ──────────────────────────────────────────────────────────
  MuiRating: {
    styleOverrides: {
      root: {
        color: '#F59E0B',
      },
      iconEmpty: {
        color: stone[300],
      },
    },
  },

  // ─── Snackbar ────────────────────────────────────────────────────────
  MuiSnackbar: {
    styleOverrides: {
      root: {
        '& .MuiPaper-root': {
          borderRadius: radius.md,
        },
      },
    },
  },

  MuiSnackbarContent: {
    styleOverrides: {
      root: {
        backgroundColor: stone[900],
        color: '#fff',
        borderRadius: radius.md,
        fontSize: '13px',
        fontWeight: 500,
        boxShadow: '0px 10px 30px rgba(12,10,9,0.2)',
      },
    },
  },

  // ─── Link ────────────────────────────────────────────────────────────
  MuiLink: {
    styleOverrides: {
      root: {
        color: coral[600],
        fontWeight: 500,
        textDecorationColor: 'transparent',
        transition: 'all 200ms ease-out',
        '&:hover': {
          color: coral[700],
          textDecorationColor: coral[700],
        },
      },
    },
  },

  // ─── AppBar & Toolbar ────────────────────────────────────────────────
  MuiAppBar: {
    defaultProps: {
      elevation: 0,
    },
    styleOverrides: {
      root: {
        backgroundColor: '#fff',
        color: stone[900],
        borderBottom: `1px solid ${stone[200]}`,
      },
    },
  },

  MuiToolbar: {
    styleOverrides: {
      root: {
        minHeight: '56px !important',
        padding: '0 24px !important',
      },
    },
  },

  // ─── Icons ───────────────────────────────────────────────────────────
  MuiSvgIcon: {
    styleOverrides: {
      fontSizeSmall: {
        fontSize: '16px',
      },
      fontSizeMedium: {
        fontSize: '20px',
      },
      fontSizeLarge: {
        fontSize: '24px',
      },
    },
  },

  // ─── Typography ──────────────────────────────────────────────────────
  MuiTypography: {
    styleOverrides: {
      root: {
        color: stone[900],
      },
      gutterBottom: {
        marginBottom: '0.5em',
      },
    },
  },

  // ─── Timeline ────────────────────────────────────────────────────────
  MuiTimelineDot: {
    styleOverrides: {
      root: {
        boxShadow: 'none',
        borderWidth: 2,
      },
    },
  },

  MuiTimelineConnector: {
    styleOverrides: {
      root: {
        backgroundColor: stone[200],
      },
    },
  },
};
