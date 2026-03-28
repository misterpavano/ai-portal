import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import {
  Button,
  MenuItem,
  SelectChangeEvent,
  Typography,
  Box,
  Tab,
  Grid,
  Divider,
} from "@mui/material";
import {
  IconBrandHeadlessui,
  IconCheck,
  IconNotebook,
  IconPalette,
  IconTextSize,
  IconComponents,
} from "@tabler/icons-react";
import * as React from "react";
import { useTheme, Theme } from "@mui/material/styles";
import DefaultButton from "../../../components/layouts/DefaultButton";
import HeaderTitle from "../../../components/layouts/HeaderTitleText";
import TextInput from "../../../components/layouts/TextInput";
import Dropdown from "../../../components/layouts/Select";
import TextArea from "../../../components/layouts/TextArea";
import Toast from "../../../components/layouts/Toast";
import Tooltip from "../../../components/layouts/Tooltip";
import { colors } from "../../../theme/colors";

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Simple relative-luminance check to decide if text on a colored
 * background should be dark (true) or light (false).
 */
const shouldUseDarkText = (hex: string): boolean => {
  if (!hex.startsWith("#") || hex.length < 7) return false;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55;
};

// ── Dynamic palette from theme/colors.ts ─────────────────────────────────────

type SwatchGroup = {
  label: string;
  swatches: { name: string; value: string; textDark: boolean }[];
};

/** Keys in the colors object we want to display as scales, in order. */
const PALETTE_CONFIG: { key: keyof typeof colors; label: string }[] = [
  { key: "coral", label: "Coral / Accent" },
  { key: "neutral", label: "Neutral" },
  { key: "gold", label: "Gold" },
  { key: "success", label: "Success" },
  { key: "warning", label: "Warning" },
  { key: "error", label: "Error" },
];

const buildPaletteGroups = (): SwatchGroup[] =>
  PALETTE_CONFIG.map(({ key, label }) => {
    const scale = colors[key] as Record<string, string>;
    return {
      label,
      swatches: Object.entries(scale)
        .filter(([, v]) => typeof v === "string" && v.startsWith("#"))
        .map(([name, value]) => ({
          name,
          value,
          textDark: shouldUseDarkText(value),
        })),
    };
  });

const paletteGroups = buildPaletteGroups();

// ── Dynamic typography specs ─────────────────────────────────────────────────

type TypoSpec = {
  variant: string;
  label: string;
};

const HEADING_VARIANTS: TypoSpec[] = [
  { variant: "h1", label: "h1" },
  { variant: "h2", label: "h2" },
  { variant: "h3", label: "h3" },
  { variant: "h4", label: "h4" },
];

const BODY_VARIANTS: TypoSpec[] = [
  { variant: "body", label: "body" },
  { variant: "body_bold", label: "body_bold" },
  { variant: "small", label: "small" },
  { variant: "small_bold", label: "small_bold" },
  { variant: "xsmall", label: "xsmall" },
  { variant: "xsmall_bold", label: "xsmall_bold" },
  { variant: "tiny", label: "tiny" },
];

/** Extract fontSize and fontWeight from the live theme for a given variant. */
const getTypoMeta = (
  theme: Theme,
  variant: string
): { size: string; weight: string | number } => {
  const spec = (theme.typography as Record<string, any>)[variant];
  if (!spec) return { size: "—", weight: "—" };
  return {
    size: String(spec.fontSize ?? "—"),
    weight: spec.fontWeight ?? "—",
  };
};

// ── Color Swatch ─────────────────────────────────────────────────────────────

const ColorSwatch = ({
  name,
  value,
}: {
  name: string;
  value: string;
  textDark?: boolean;
}) => (
  <Box
    sx={{
      borderRadius: 2,
      overflow: "hidden",
      border: "1px solid",
      borderColor: "neutral.300",
    }}
  >
    <Box sx={{ height: 52, bgcolor: value }} />
    <Box sx={{ px: 1.5, py: 1, bgcolor: "white" }}>
      <Typography sx={{ fontSize: 11, fontWeight: 600, color: "text.primary" }}>
        {name}
      </Typography>
      <Typography
        sx={{ fontSize: 10, color: "neutral.600", fontFamily: "monospace" }}
      >
        {value}
      </Typography>
    </Box>
  </Box>
);

// ── Typography Row ───────────────────────────────────────────────────────────

const TypographyRow = ({
  variant,
  label,
  isLast,
}: {
  variant: string;
  label: string;
  isLast: boolean;
}) => {
  const theme = useTheme();
  const { size, weight } = getTypoMeta(theme, variant);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "baseline",
        gap: 3,
        px: 3,
        py: variant.startsWith("h") ? 2.5 : 2,
        borderBottom: isLast ? "none" : "1px solid",
        borderColor: "neutral.200",
        bgcolor: "white",
      }}
    >
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 600,
          color: "neutral.500",
          fontFamily: "monospace",
          minWidth: variant.startsWith("h") ? 60 : 80,
          flexShrink: 0,
        }}
      >
        {label}
      </Typography>
      <Typography variant={variant as any}>
        {label} — {size} / {weight}. The quick brown fox jumps over the lazy
        dog.
      </Typography>
    </Box>
  );
};

// ── Section Label ────────────────────────────────────────────────────────────

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <Typography
    sx={{
      fontSize: 13,
      fontWeight: 600,
      color: "neutral.700",
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      mb: 2,
    }}
  >
    {children}
  </Typography>
);

// ── Main Component ───────────────────────────────────────────────────────────

const DesignSystem = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = React.useState("components");
  const [inputValue, setInputValue] = React.useState("name@gmail.com");
  const [textAreaValue, setTextAreaValue] = React.useState(
    "Cras erat lacus, pretium et erat ut, pellentesque varius purus. Orci varius natoque penatibus et magnis dis parturient montes"
  );
  const [selectValue, setSelectValue] = React.useState("");
  const [openTooltip, setOpenTooltip] = React.useState(false);
  const [openSuccessToast, setOpenSuccessToast] = React.useState(false);
  const [openWarningToast, setOpenWarningToast] = React.useState(false);
  const [openErrorToast, setOpenErrorToast] = React.useState(false);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleTextAreaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTextAreaValue(event.target.value);
  };

  const handleSelectChange = (event: SelectChangeEvent<string | string[]>) => {
    setSelectValue(event.target.value as string);
  };

  return (
    <Box sx={{ width: "100%", typography: "body1", pb: 6 }}>
      <HeaderTitle
        title="Design System"
        icon={<IconBrandHeadlessui width={18} height={18} color="#FFFFFF" />}
      />

      <Box sx={{ pl: 2, pt: 2 }}>
        <TabContext value={tabValue}>
          {/* Tab nav */}
          <Box
            sx={{
              borderBottom: "1.5px solid",
              borderColor: "neutral.300",
              mb: 4,
            }}
          >
            <TabList onChange={handleTabChange} aria-label="design system tabs">
              <Tab
                icon={<IconComponents size={16} />}
                iconPosition="start"
                label={
                  <Typography variant="body_bold" sx={{ fontSize: 13 }}>
                    Components
                  </Typography>
                }
                value="components"
                sx={{ minHeight: 44, gap: 0.5 }}
              />
              <Tab
                icon={<IconPalette size={16} />}
                iconPosition="start"
                label={
                  <Typography variant="body_bold" sx={{ fontSize: 13 }}>
                    Colors
                  </Typography>
                }
                value="colors"
                sx={{ minHeight: 44, gap: 0.5 }}
              />
              <Tab
                icon={<IconTextSize size={16} />}
                iconPosition="start"
                label={
                  <Typography variant="body_bold" sx={{ fontSize: 13 }}>
                    Typography
                  </Typography>
                }
                value="typography"
                sx={{ minHeight: 44, gap: 0.5 }}
              />
            </TabList>
          </Box>

          {/* ── Components Tab ───────────────────────────────────────────── */}
          <TabPanel value="components" sx={{ p: 0 }}>
            {/* Buttons */}
            <SectionLabel>Buttons</SectionLabel>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", pb: 3 }}>
              <DefaultButton
                style={{ width: 100, height: 40, borderRadius: 4 }}
                title="Primary"
                type="primary"
                onClick={() => {}}
              />
              <DefaultButton
                style={{ width: 100, height: 40, borderRadius: 4 }}
                title="Disabled"
                type="primary"
                onClick={() => {}}
                disabled
              />
              <DefaultButton
                style={{ width: 100, height: 40, borderRadius: 4 }}
                title="Secondary"
                type="secondary"
                onClick={() => {}}
              />
              <DefaultButton
                style={{ width: 100, height: 40, borderRadius: 4 }}
                title="Disabled"
                type="secondary"
                onClick={() => {}}
                disabled
              />
            </Box>

            <Divider sx={{ borderColor: "neutral.200", mb: 3 }} />

            {/* Text Areas */}
            <SectionLabel>Text Area</SectionLabel>
            <Box sx={{ maxWidth: 600, mb: 3 }}>
              <Box sx={{ mb: 2 }}>
                <TextArea
                  value=""
                  onChange={() => {}}
                  placeholder="Briefly describe the direction for this discussion guide..."
                />
              </Box>
              <TextArea value={textAreaValue} onChange={handleTextAreaChange} />
            </Box>

            <Divider sx={{ borderColor: "neutral.200", mb: 3 }} />

            {/* Text Inputs */}
            <SectionLabel>Text Input</SectionLabel>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                mb: 2,
              }}
            >
              <TextInput
                value={inputValue}
                onChange={handleInputChange}
                containerStyles={{ width: 240 }}
              />
              <TextInput
                placeholder="Placeholder text"
                value=""
                onChange={() => {}}
                containerStyles={{ width: 240 }}
              />
              <TextInput
                disabled
                value="Disabled input field"
                onChange={() => {}}
                containerStyles={{ width: 240 }}
              />
              <TextInput
                icon={
                  <IconBrandHeadlessui
                    width={20}
                    height={20}
                    color={theme.palette.neutral[700]}
                  />
                }
                value="name@gmail.com"
                onChange={() => {}}
                containerStyles={{ width: 240 }}
              />
              <TextInput
                error={true}
                value="name@gmail.com"
                onChange={() => {}}
                containerStyles={{ width: 240 }}
              />
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}>
              <TextInput
                topText="Top text"
                value="Input with top text"
                onChange={() => {}}
                containerStyles={{ width: 240 }}
              />
              <TextInput
                bottomText="Bottom text"
                value="Input with bottom text"
                onChange={() => {}}
                containerStyles={{ width: 240 }}
              />
            </Box>

            <Divider sx={{ borderColor: "neutral.200", mb: 3 }} />

            {/* Select */}
            <SectionLabel>Select / Dropdown</SectionLabel>
            <Box sx={{ pb: 3 }}>
              <Dropdown
                value={selectValue}
                onSelect={handleSelectChange}
                styles={{ width: 280, height: 48 }}
              >
                {selectValue === "" && (
                  <MenuItem
                    sx={{ display: "flex", alignItems: "center" }}
                    value=""
                    disabled
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <IconNotebook
                        width={18}
                        height={18}
                        color={theme.palette.neutral[700]}
                      />
                      <Typography sx={{ fontSize: 13, color: "neutral.600" }}>
                        Choose output format
                      </Typography>
                    </Box>
                  </MenuItem>
                )}
                <MenuItem value="Output">Output</MenuItem>
                <MenuItem value="Output 1">Output 1</MenuItem>
                <MenuItem value="Output 2">Output 2</MenuItem>
              </Dropdown>
            </Box>

            <Divider sx={{ borderColor: "neutral.200", mb: 3 }} />

            {/* Tooltip + Toasts */}
            <SectionLabel>Feedback</SectionLabel>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, pb: 3 }}>
              <Tooltip
                open={openTooltip}
                onClose={() => setOpenTooltip(false)}
                onOpen={() => setOpenTooltip(true)}
                title="This is a tooltip"
              >
                <Button variant="outlined" size="small">
                  Tooltip
                </Button>
              </Tooltip>
              <Button
                variant="contained"
                size="small"
                color="success"
                onClick={() => setOpenSuccessToast(true)}
              >
                Success Toast
              </Button>
              <Button
                variant="contained"
                size="small"
                color="warning"
                onClick={() => setOpenWarningToast(true)}
              >
                Warning Toast
              </Button>
              <Button
                variant="contained"
                size="small"
                color="error"
                onClick={() => setOpenErrorToast(true)}
              >
                Error Toast
              </Button>
            </Box>

            <Toast
              open={openSuccessToast}
              onClose={() => setOpenSuccessToast(false)}
              type="success"
              icon={<IconCheck fontSize="inherit" />}
              variant="filled"
              style={{ background: theme.palette.success.main }}
              title="Action was successful."
            />
            <Toast
              open={openWarningToast}
              onClose={() => setOpenWarningToast(false)}
              type="warning"
              title="Warning: please be careful."
            />
            <Toast
              open={openErrorToast}
              onClose={() => setOpenErrorToast(false)}
              type="error"
              title="An error occurred. Please check and try again."
            />
          </TabPanel>

          {/* ── Colors Tab ───────────────────────────────────────────────── */}
          <TabPanel value="colors" sx={{ p: 0 }}>
            {paletteGroups.map((group) => (
              <Box key={group.label} sx={{ mb: 4 }}>
                <SectionLabel>{group.label}</SectionLabel>
                <Grid container spacing={1.5}>
                  {group.swatches.map((swatch) => (
                    <Grid item xs={6} sm={4} md={3} lg={2} key={swatch.name}>
                      <ColorSwatch
                        name={swatch.name}
                        value={swatch.value}
                        textDark={swatch.textDark}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))}

            {/* Accent semantic tokens */}
            <Divider sx={{ borderColor: "neutral.200", mb: 3 }} />
            <SectionLabel>Accent (Semantic)</SectionLabel>
            <Grid container spacing={1.5} sx={{ mb: 4 }}>
              {Object.entries(colors.accent)
                .filter(([, v]) => v.startsWith("#"))
                .map(([name, value]) => (
                  <Grid item xs={6} sm={4} md={3} lg={2} key={name}>
                    <ColorSwatch name={name} value={value} />
                  </Grid>
                ))}
            </Grid>

            {/* Special tokens */}
            <Divider sx={{ borderColor: "neutral.200", mb: 3 }} />
            <SectionLabel>Special</SectionLabel>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {[
                { label: "White", value: colors.common.white },
                { label: "Black", value: colors.common.black },
                { label: "Transparent", value: "transparent" },
              ].map((c) => (
                <Box
                  key={c.label}
                  sx={{
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "neutral.300",
                    overflow: "hidden",
                    width: 100,
                  }}
                >
                  <Box
                    sx={{
                      height: 52,
                      bgcolor: c.value,
                      backgroundImage:
                        c.value === "transparent"
                          ? `repeating-conic-gradient(${colors.neutral[300]} 0% 25%, transparent 0% 50%) 0 / 12px 12px`
                          : undefined,
                    }}
                  />
                  <Box sx={{ px: 1.5, py: 1, bgcolor: "white" }}>
                    <Typography
                      sx={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "text.primary",
                      }}
                    >
                      {c.label}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 10,
                        color: "neutral.600",
                        fontFamily: "monospace",
                      }}
                    >
                      {c.value}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </TabPanel>

          {/* ── Typography Tab ───────────────────────────────────────────── */}
          <TabPanel value="typography" sx={{ p: 0 }}>
            {/* Headings */}
            <SectionLabel>Headings</SectionLabel>
            <Box
              sx={{
                border: "1px solid",
                borderColor: "neutral.300",
                borderRadius: 3,
                overflow: "hidden",
                mb: 4,
              }}
            >
              {HEADING_VARIANTS.map((t, i) => (
                <TypographyRow
                  key={t.variant}
                  variant={t.variant}
                  label={t.label}
                  isLast={i === HEADING_VARIANTS.length - 1}
                />
              ))}
            </Box>

            {/* Body variants */}
            <SectionLabel>Body & UI Text</SectionLabel>
            <Box
              sx={{
                border: "1px solid",
                borderColor: "neutral.300",
                borderRadius: 3,
                overflow: "hidden",
                mb: 4,
              }}
            >
              {BODY_VARIANTS.map((t, i) => (
                <TypographyRow
                  key={t.variant}
                  variant={t.variant}
                  label={t.label}
                  isLast={i === BODY_VARIANTS.length - 1}
                />
              ))}
            </Box>

            {/* Font stack reference */}
            <SectionLabel>Font Stack</SectionLabel>
            <Box
              sx={{
                bgcolor: "neutral.200",
                borderRadius: 2,
                px: 2.5,
                py: 2,
                display: "inline-block",
              }}
            >
              <Typography
                sx={{
                  fontSize: 12,
                  fontFamily: "monospace",
                  color: "neutral.800",
                }}
              >
                {(theme.typography as any).fontFamily || "—"}
              </Typography>
            </Box>
          </TabPanel>
        </TabContext>
      </Box>
    </Box>
  );
};

export default DesignSystem;
