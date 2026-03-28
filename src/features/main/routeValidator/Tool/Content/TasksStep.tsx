import React from "react";
import {
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useAtom } from "jotai";
import { routeValidatorFormAtom } from "../../../../../atoms/routeValidatorAtom";
import { useGetBrandGuidelinesQuery } from "../../../../../api/slices/routeValidatorSlice";

const TasksStep: React.FC = () => {
  const [routeValidatorFormValues, setRouteValidatorFormValues] = useAtom(
    routeValidatorFormAtom,
  );
  const { data: brandGuidelinesData, isLoading: isLoadingGuidelines } =
    useGetBrandGuidelinesQuery();

  const taskOptions = [
    "spell_check",
    "grammar_consistency",
    "organization_editorial_guideline",
    "client_brand_guideline",
    "wcag_compliance",
    "seo_checks",
  ];

  const taskDisplayNames: Record<string, string> = {
    spell_check: "Spell check",
    grammar_consistency: "Grammar consistency",
    wcag_compliance: "WCAG compliance",
    seo_checks: "SEO checks",
    organization_editorial_guideline: "AMA Guidelines",
    client_brand_guideline: "Client brand guideline",
  };

  const handleTaskToggle = (task: string) => {
    setRouteValidatorFormValues((prev) => {
      const currentTasks = prev.tasks || [];
      const newTasks = currentTasks.includes(task)
        ? currentTasks.filter((t) => t !== task)
        : [...currentTasks, task];
      return {
        ...prev,
        tasks: newTasks,
      };
    });
  };

  return (
    <Box sx={{ padding: "20px 0 60px 40px" }}>
      <Typography
        sx={{
          fontSize: "18px",
          fontWeight: 600,
          marginBottom: 3,
        }}
      >
        Tasks
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", maxWidth: 600 }}>
        {taskOptions.map((task) => (
          <FormControlLabel
            key={task}
            control={
              <Checkbox
                checked={
                  routeValidatorFormValues.tasks?.includes(task) || false
                }
                onChange={() => handleTaskToggle(task)}
                sx={{
                  color: "neutral.700",
                }}
              />
            }
            label={
              <Typography sx={{ fontSize: "14px" }}>
                {taskDisplayNames[task] || task}
              </Typography>
            }
          />
        ))}
      </Box>

      {routeValidatorFormValues.tasks?.includes("client_brand_guideline") && (
        <Box sx={{ marginTop: 3, maxWidth: 400 }}>
          <FormControl fullWidth>
            <InputLabel id="brand-guideline-select-label">
              Client Brand Guideline
            </InputLabel>
            <Select
              labelId="brand-guideline-select-label"
              id="brand-guideline-select"
              value={routeValidatorFormValues.brandGuideline || ""}
              label="Client Brand Guideline"
              onChange={(event) => {
                const value = event.target.value as string;
                setRouteValidatorFormValues((prev) => ({
                  ...prev,
                  brandGuideline: value,
                  // Derive clientBrand / selectedClient directly from brandGuideline
                  clientBrand: value,
                  selectedClient: value,
                }));
              }}
              disabled={isLoadingGuidelines}
              sx={{
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "neutral.400",
                },
              }}
            >
              {isLoadingGuidelines ? (
                <MenuItem value="" disabled>
                  Loading...
                </MenuItem>
              ) : brandGuidelinesData?.guidelines &&
                brandGuidelinesData.guidelines.length > 0 ? (
                brandGuidelinesData.guidelines.map(
                  (guideline: {
                    name: string;
                    fileName: string;
                    displayName: string;
                  }) => (
                    <MenuItem key={guideline.name} value={guideline.name}>
                      {guideline.displayName}
                    </MenuItem>
                  ),
                )
              ) : (
                <MenuItem value="" disabled>
                  No brand guidelines available
                </MenuItem>
              )}
            </Select>
          </FormControl>
        </Box>
      )}
    </Box>
  );
};

export default TasksStep;
