import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import {
  Box,
  Button,
  Divider,
  Grid,
  MenuItem,
  Paper,
  SelectChangeEvent,
  Tab,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  IconBrandHeadlessui,
  IconCheck,
  IconComponents,
  IconNotebook,
  IconPalette,
  IconTextSize,
} from "@tabler/icons-react";
import * as React from "react";
import DefaultButton from "../../../components/layouts/DefaultButton";
import HeaderTitle from "../../../components/layouts/HeaderTitleText";
import Dropdown from "../../../components/layouts/Select";
import TextArea from "../../../components/layouts/TextArea";
import TextInput from "../../../components/layouts/TextInput";
import Toast from "../../../components/layouts/Toast";
import Tooltip from "../../../components/layouts/Tooltip";

type ThemeScale = Record<string, string>;

type ColorSection = {
  label: string;
  description: string;
  swatches: Array<{ token: string; value: string }>;
};

const typographyVariants = [
  ["h1", "Primary page titles and hero moments."],
  ["h2", "Section headers inside tools and reviews."],
  ["h3", "Compact card titles and grouped panels."],
  ["h4", "Dense labels with emphasis."],
  ["body", "Default app copy and helper text."],
  ["body_bold", "Prominent body text and button labels."],
  ["small", "Descriptions in cards, lists, and forms."],
  ["small_bold", "UI labels and light emphasis."],
  ["xsmall", "Metadata, timestamps, and support text."],
  ["tiny", "Overlines and dense control captions."],
] as const;

const sampleCopy =
  "The editor design system favors clear hierarchy, warm neutrals, and dense but readable UI surfaces.";

const getScaleEntries = (scale: ThemeScale, featured: string[] = []) => {
  const seen = new Set<string>();
  const orderedKeys = [
    ...featured.filter((key) => key in scale),
    ...Object.keys(scale).filter((key) => !featured.includes(key)),
  ];

  return orderedKeys
    .filter((key) => {
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return typeof scale[key] === "string";
    })
    .map((key) => ({ token: key, value: scale[key] }));
};

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

const ColorSwatch = ({ token, value }: { token: string; value: string }) => {
  const isTransparent = value === "transparent";

  return (
    <Paper
      variant="outlined"
      sx={{
        overflow: "hidden",
        borderColor: "neutral.300",
        borderRadius: 3,
        height: "100%",
      }}
    >
      <Box
        sx={{
          height: 82,
          bgcolor: isTransparent ? "common.white" : value,
          backgroundImage: isTransparent
            ? "repeating-conic-gradient(#E7E5E4 0% 25%, transparent 0% 50%)"
            : undefined,
          backgroundSize: isTransparent ? "14px 14px" : undefined,
        }}
      />
      <Box sx={{ p: 1.5, bgcolor: "common.white" }}>
        <Typography variant="small_bold" sx={{ color: "text.primary" }}>
          {token}
        </Typography>
        <Typography
          variant="xsmall"
          sx={{ color: "neutral.600", fontFamily: "monospace", wordBreak: "break-all" }}
        >
          {value}
        </Typography>
      </Box>
    </Paper>
  );
};

const DesignSystem = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = React.useState("components");
  const [inputValue, setInputValue] = React.useState("name@company.com");
  const [textAreaValue, setTextAreaValue] = React.useState(
    "Launch a route-assistant workspace with clear milestones, medical review checkpoints, and transcript-ready outputs."
  );
  const [selectValue, setSelectValue] = React.useState("");
  const [openTooltip, setOpenTooltip] = React.useState(false);
  const [openSuccessToast, setOpenSuccessToast] = React.useState(false);
  const [openWarningToast, setOpenWarningToast] = React.useState(false);
  const [openErrorToast, setOpenErrorToast] = React.useState(false);

  const colorSections: ColorSection[] = [
    {
      label: "Brand",
      description: "Primary accent, charcoal actions, and gold support tokens.",
      swatches: [
        ...getScaleEntries(theme.palette.accent as unknown as ThemeScale, ["50", "100", "200", "300", "main", "dark"]),
        ...getScaleEntries(theme.palette.gold as unknown as ThemeScale, ["50", "100", "200", "300", "main", "dark"]),
      ],
    },
    {
      label: "Neutral",
      description: "Foundational surfaces, borders, and text ramps used across the shell.",
      swatches: getScaleEntries(theme.palette.neutral as unknown as ThemeScale, [
        "100",
        "200",
        "300",
        "400",
        "500",
        "600",
        "700",
        "800",
        "900",
        "1000",
        "1100",
      ]),
    },
    {
      label: "Status",
      description: "Feedback colors for success, warning, and error states.",
      swatches: [
        ...getScaleEntries(theme.palette.success as unknown as ThemeScale, ["light", "main", "dark", "100", "200", "300", "400", "500"]),
        ...getScaleEntries(theme.palette.warning as unknown as ThemeScale, ["light", "main", "dark", "100", "200", "300", "400", "500"]),
        ...getScaleEntries(theme.palette.error as unknown as ThemeScale, ["light", "main", "dark", "100", "200", "300", "400", "500"]),
      ],
    },
  ];

  const tokenHighlights = [
    {
      label: "Text",
      items: [
        { token: "text.primary", value: theme.palette.text.primary },
        { token: "text.secondary", value: theme.palette.text.secondary },
        { token: "text.disabled", value: theme.palette.text.disabled },
      ],
    },
    {
      label: "Surfaces",
      items: [
        { token: "common.white", value: theme.palette.common.white },
        { token: "neutral.100", value: theme.palette.neutral[100] },
        { token: "divider", value: theme.palette.divider },
      ],
    },
    {
      label: "Transparent",
      items: [
        { token: "transparent.100", value: theme.palette.transparent[100] },
        { token: "transparent.300", value: theme.palette.transparent[300] },
        { token: "transparent.500", value: theme.palette.transparent[500] },
      ],
    },
  ];

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  const handleSelectChange = (event: SelectChangeEvent<string | string[]>) => {
    setSelectValue(event.target.value as string);
  };

  return (
    <Box sx={{ width: "100%", pb: 6 }}>
      <HeaderTitle
        title="Design System"
        icon={<IconBrandHeadlessui width={18} height={18} color={theme.palette.common.white} />}
        subtitle="Reference actual theme tokens, typography scales, and component states used in the revamp."
      />

      <Box sx={{ px: { xs: 2, md: 3 }, pt: 2 }}>
        <Paper
          variant="outlined"
          sx={{
            borderColor: "neutral.300",
            borderRadius: 4,
            overflow: "hidden",
            bgcolor: "common.white",
          }}
        >
          <Box sx={{ px: { xs: 2, md: 3 }, pt: 2.5, pb: 2, borderBottom: "1px solid", borderColor: "neutral.200" }}>
            <Typography variant="h2" sx={{ mb: 0.75 }}>
              Theme Overview
            </Typography>
            <Typography variant="small" sx={{ color: "neutral.600", maxWidth: 840 }}>
              This page is wired to the current MUI theme so token changes are visible here immediately. Use it to validate hierarchy, surface contrast, and status treatments before shipping UI changes.
            </Typography>
          </Box>

          <TabContext value={tabValue}>
            <Box sx={{ px: { xs: 1, md: 2 }, borderBottom: "1px solid", borderColor: "neutral.200" }}>
              <TabList onChange={handleTabChange} aria-label="design system tabs" variant="scrollable" scrollButtons="auto">
                <Tab icon={<IconComponents size={16} />} iconPosition="start" label="Components" value="components" sx={{ minHeight: 46 }} />
                <Tab icon={<IconPalette size={16} />} iconPosition="start" label="Colors" value="colors" sx={{ minHeight: 46 }} />
                <Tab icon={<IconTextSize size={16} />} iconPosition="start" label="Typography" value="typography" sx={{ minHeight: 46 }} />
              </TabList>
            </Box>

            <TabPanel value="components" sx={{ p: { xs: 2, md: 3 } }}>
              <SectionLabel>Buttons</SectionLabel>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 3.5 }}>
                <DefaultButton style={{ width: 110, height: 40 }} title="Primary" type="primary" onClick={() => {}} />
                <DefaultButton style={{ width: 110, height: 40 }} title="Secondary" type="secondary" onClick={() => {}} />
                <DefaultButton style={{ width: 110, height: 40 }} title="Disabled" type="primary" onClick={() => {}} disabled />
                <Button variant="subtle">Subtle</Button>
                <Button variant="subtleBordered">Subtle Bordered</Button>
              </Box>

              <Divider sx={{ borderColor: "neutral.200", mb: 3.5 }} />

              <SectionLabel>Inputs</SectionLabel>
              <Grid container spacing={2} sx={{ mb: 3.5 }}>
                <Grid item xs={12} md={6}>
                  <TextInput value={inputValue} onChange={(event) => setInputValue(event.target.value)} topText="Email" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextInput placeholder="Disabled input" value="System locked" disabled onChange={() => {}} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Dropdown value={selectValue} onSelect={handleSelectChange} styles={{ width: "100%", height: 48 }}>
                    {selectValue === "" && (
                      <MenuItem value="" disabled>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <IconNotebook width={18} height={18} color={theme.palette.neutral[700]} />
                          <Typography variant="small" sx={{ color: "neutral.600" }}>
                            Choose output format
                          </Typography>
                        </Box>
                      </MenuItem>
                    )}
                    <MenuItem value="ppt">Presentation outline</MenuItem>
                    <MenuItem value="doc">Discussion guide</MenuItem>
                    <MenuItem value="csv">Structured export</MenuItem>
                  </Dropdown>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextArea value={textAreaValue} onChange={(event) => setTextAreaValue(event.target.value)} />
                </Grid>
              </Grid>

              <Divider sx={{ borderColor: "neutral.200", mb: 3.5 }} />

              <SectionLabel>Feedback</SectionLabel>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                <Tooltip open={openTooltip} onClose={() => setOpenTooltip(false)} onOpen={() => setOpenTooltip(true)} title="Tooltips should stay short and instructional.">
                  <Button variant="outlined" size="small">Tooltip</Button>
                </Tooltip>
                <Button variant="contained" color="success" size="small" onClick={() => setOpenSuccessToast(true)}>
                  Success Toast
                </Button>
                <Button variant="contained" color="warning" size="small" onClick={() => setOpenWarningToast(true)}>
                  Warning Toast
                </Button>
                <Button variant="contained" color="error" size="small" onClick={() => setOpenErrorToast(true)}>
                  Error Toast
                </Button>
              </Box>

              <Toast
                open={openSuccessToast}
                onClose={() => setOpenSuccessToast(false)}
                type="success"
                icon={<IconCheck stroke={2} />}
                variant="filled"
                style={{ background: theme.palette.success.main }}
                title="Action was successful."
              />
              <Toast
                open={openWarningToast}
                onClose={() => setOpenWarningToast(false)}
                type="warning"
                title="Warning: review the prompt details before submitting."
              />
              <Toast
                open={openErrorToast}
                onClose={() => setOpenErrorToast(false)}
                type="error"
                title="An error occurred. Check the input and try again."
              />
            </TabPanel>

            <TabPanel value="colors" sx={{ p: { xs: 2, md: 3 } }}>
              <Grid container spacing={2} sx={{ mb: 4 }}>
                {tokenHighlights.map((group) => (
                  <Grid item xs={12} md={4} key={group.label}>
                    <Paper variant="outlined" sx={{ p: 2, borderColor: "neutral.300", borderRadius: 3, height: "100%" }}>
                      <Typography variant="small_bold" sx={{ color: "text.primary", mb: 1.5 }}>
                        {group.label}
                      </Typography>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                        {group.items.map((item) => (
                          <Box key={item.token} sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                            <Box sx={{ width: 28, height: 28, borderRadius: 2, bgcolor: item.value, border: "1px solid", borderColor: "neutral.300", flexShrink: 0 }} />
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="xsmall_bold" sx={{ color: "text.primary" }}>
                                {item.token}
                              </Typography>
                              <Typography variant="xsmall" sx={{ color: "neutral.600", fontFamily: "monospace" }}>
                                {item.value}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              {colorSections.map((section) => (
                <Box key={section.label} sx={{ mb: 4 }}>
                  <SectionLabel>{section.label}</SectionLabel>
                  <Typography variant="small" sx={{ color: "neutral.600", mb: 2 }}>
                    {section.description}
                  </Typography>
                  <Grid container spacing={1.5}>
                    {section.swatches.map((swatch) => (
                      <Grid item xs={6} sm={4} md={3} lg={2} key={`${section.label}-${swatch.token}-${swatch.value}`}>
                        <ColorSwatch token={swatch.token} value={swatch.value} />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ))}
            </TabPanel>

            <TabPanel value="typography" sx={{ p: { xs: 2, md: 3 } }}>
              <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderColor: "neutral.300", borderRadius: 3, mb: 3.5 }}>
                <Typography variant="small_bold" sx={{ color: "text.primary", mb: 0.75 }}>
                  Font Stack
                </Typography>
                <Typography variant="xsmall" sx={{ color: "neutral.600", fontFamily: "monospace" }}>
                  {theme.typography.fontFamily}
                </Typography>
              </Paper>

              <Paper variant="outlined" sx={{ borderColor: "neutral.300", borderRadius: 3, overflow: "hidden" }}>
                {typographyVariants.map(([variant, usage], index) => (
                  <Box
                    key={variant}
                    sx={{
                      px: { xs: 2, md: 3 },
                      py: 2.25,
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "120px minmax(0, 1fr) 240px" },
                      gap: 1.5,
                      alignItems: "baseline",
                      borderBottom: index < typographyVariants.length - 1 ? "1px solid" : "none",
                      borderColor: "neutral.200",
                      bgcolor: index % 2 === 0 ? "common.white" : "neutral.100",
                    }}
                  >
                    <Typography variant="xsmall_bold" sx={{ color: "neutral.600", fontFamily: "monospace" }}>
                      {variant}
                    </Typography>
                    <Typography variant={variant as any}>{sampleCopy}</Typography>
                    <Typography variant="small" sx={{ color: "neutral.600" }}>
                      {usage}
                    </Typography>
                  </Box>
                ))}
              </Paper>
            </TabPanel>
          </TabContext>
        </Paper>
      </Box>
    </Box>
  );
};

export default DesignSystem;
