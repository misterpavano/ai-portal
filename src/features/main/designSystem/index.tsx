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
import { useTheme } from "@mui/material/styles";
import DefaultButton from "../../../components/layouts/DefaultButton";
import HeaderTitle from "../../../components/layouts/HeaderTitleText";
import TextInput from "../../../components/layouts/TextInput";
import Dropdown from "../../../components/layouts/Select";
import TextArea from "../../../components/layouts/TextArea";
import Toast from "../../../components/layouts/Toast";
import Tooltip from "../../../components/layouts/Tooltip";

// ── Color Palette Data ───────────────────────────────────────────────────────

type SwatchGroup = {
  label: string;
  swatches: { name: string; value: string; textDark?: boolean }[];
};

const paletteGroups: SwatchGroup[] = [
  {
    label: "Coral / Accent",
    swatches: [
      { name: "50", value: "#FEF2F0", textDark: true },
      { name: "100", value: "#FDCFC7", textDark: true },
      { name: "200", value: "#F9A99C", textDark: true },
      { name: "300", value: "#F09484" },
      { name: "400 — main", value: "#E86D5A" },
      { name: "500 — hover", value: "#D4553F" },
      { name: "600", value: "#B84432" },
    ],
  },
  {
    label: "Neutral",
    swatches: [
      { name: "100", value: "#FAFAF9", textDark: true },
      { name: "200", value: "#F5F5F4", textDark: true },
      { name: "300", value: "#E7E5E4", textDark: true },
      { name: "400", value: "#D6D3D1", textDark: true },
      { name: "500", value: "#A8A29E", textDark: true },
      { name: "600", value: "#78716C" },
      { name: "700", value: "#57534E" },
      { name: "800", value: "#44403C" },
      { name: "900", value: "#292524" },
      { name: "1000", value: "#1C1917" },
      { name: "1100", value: "#0C0A09" },
    ],
  },
  {
    label: "Gold",
    swatches: [
      { name: "50", value: "#FDF8ED", textDark: true },
      { name: "100", value: "#F8EDCC", textDark: true },
      { name: "200", value: "#EDDA9E", textDark: true },
      { name: "300", value: "#D4B76E", textDark: true },
      { name: "400 — main", value: "#C4A35A" },
      { name: "500", value: "#A8884A" },
    ],
  },
  {
    label: "Success",
    swatches: [
      { name: "100", value: "#E8F5EE", textDark: true },
      { name: "200", value: "#A8DBBB", textDark: true },
      { name: "300 — main", value: "#3D9A5C" },
      { name: "400", value: "#2E7A46" },
      { name: "500", value: "#1F5A30" },
    ],
  },
  {
    label: "Warning",
    swatches: [
      { name: "100", value: "#FDF8ED", textDark: true },
      { name: "200", value: "#F8EDCC", textDark: true },
      { name: "300 — main", value: "#D4A03E", textDark: true },
      { name: "400", value: "#B8862E" },
      { name: "500", value: "#926A20" },
    ],
  },
  {
    label: "Error",
    swatches: [
      { name: "100", value: "#FDECEC", textDark: true },
      { name: "200", value: "#F5C4C4", textDark: true },
      { name: "300 — main", value: "#DC5E5E" },
      { name: "400", value: "#C04444" },
      { name: "500", value: "#9E3333" },
    ],
  },
];

// ── Typography variants ──────────────────────────────────────────────────────

const typographyVariants = [
  { variant: "h1" as const, label: "h1", sample: "Heading 1 — 24px / 700" },
  { variant: "h2" as const, label: "h2", sample: "Heading 2 — 20px / 600" },
  { variant: "h3" as const, label: "h3", sample: "Heading 3 — 16px / 600" },
  { variant: "h4" as const, label: "h4", sample: "Heading 4 — 14px / 600" },
];

const customVariants = [
  { variant: "body" as const, label: "body", sample: "Body — 14px / 400. The quick brown fox jumps over the lazy dog." },
  { variant: "body_bold" as const, label: "body_bold", sample: "Body Bold — 14px / 500. The quick brown fox jumps over the lazy dog." },
  { variant: "small" as const, label: "small", sample: "Small — 13px / 400. The quick brown fox jumps over the lazy dog." },
  { variant: "small_bold" as const, label: "small_bold", sample: "Small Bold — 13px / 600. The quick brown fox jumps over the lazy dog." },
  { variant: "xsmall" as const, label: "xsmall", sample: "XSmall — 12px / 500. The quick brown fox jumps over the lazy dog." },
  { variant: "xsmall_bold" as const, label: "xsmall_bold", sample: "XSmall Bold — 12px / 600. The quick brown fox jumps over the lazy dog." },
  { variant: "tiny" as const, label: "tiny", sample: "TINY — 10px / 600. THE QUICK BROWN FOX" },
];

// ── Color Swatch ─────────────────────────────────────────────────────────────

const ColorSwatch = ({
  name,
  value,
  textDark,
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
      <Typography sx={{ fontSize: 10, color: "neutral.600", fontFamily: "monospace" }}>
        {value}
      </Typography>
    </Box>
  </Box>
);

// ── Main Component ────────────────────────────────────────────────────────────

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
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "neutral.700",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    mb: 1.5,
                  }}
                >
                  {group.label}
                </Typography>
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

            {/* Special tokens */}
            <Divider sx={{ borderColor: "neutral.200", mb: 3 }} />
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 600,
                color: "neutral.700",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                mb: 1.5,
              }}
            >
              Special
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {[
                { label: "White", value: "#FFFFFF" },
                { label: "Black", value: "#000000" },
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
                          ? "repeating-conic-gradient(#E7E5E4 0% 25%, transparent 0% 50%) 0 / 12px 12px"
                          : undefined,
                    }}
                  />
                  <Box sx={{ px: 1.5, py: 1, bgcolor: "white" }}>
                    <Typography
                      sx={{ fontSize: 11, fontWeight: 600, color: "text.primary" }}
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
              {typographyVariants.map((t, i) => (
                <Box
                  key={t.variant}
                  sx={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 3,
                    px: 3,
                    py: 2.5,
                    borderBottom:
                      i < typographyVariants.length - 1
                        ? "1px solid"
                        : "none",
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
                      minWidth: 60,
                    }}
                  >
                    {t.label}
                  </Typography>
                  <Typography variant={t.variant}>{t.sample}</Typography>
                </Box>
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
              {customVariants.map((t, i) => (
                <Box
                  key={t.variant}
                  sx={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 3,
                    px: 3,
                    py: 2,
                    borderBottom:
                      i < customVariants.length - 1 ? "1px solid" : "none",
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
                      minWidth: 80,
                      flexShrink: 0,
                    }}
                  >
                    {t.label}
                  </Typography>
                  <Typography variant={t.variant}>{t.sample}</Typography>
                </Box>
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
                'Plus Jakarta Sans', system-ui, -apple-system, sans-serif
              </Typography>
            </Box>
          </TabPanel>
        </TabContext>
      </Box>
    </Box>
  );
};

// ── Sub-components ───────────────────────────────────────────────────────────

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

export default DesignSystem;
