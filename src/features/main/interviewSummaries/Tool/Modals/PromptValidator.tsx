import { Box, Popover, Typography } from "@mui/material";
// import { useEffect, useState } from "react";
// import { interviewSummariesFormAtom } from "../../../../../atoms/interviewDiscusstionGuideAtom";
// import { useAtom } from "jotai";
// import FilledCheckIcon from "../../../../../assets/svg/FilledCheckIcon";
// import UnFilledCheckIcon from "../../../../../assets/svg/UnFilledCheckIcon";

type PromptValidatorProps = {
  open: boolean;
  onClose: () => void;
  anchorEl: HTMLElement | null;
};

// type Validator = { id: number; checked: boolean; name: string };

// const initialValidators: Validator[] = [
//   { id: 0, checked: false, name: "Audience" },
//   { id: 1, checked: false, name: "Objective" },
//   { id: 2, checked: false, name: "Caveats" },
//   { id: 3, checked: false, name: "Phrasing" },
//   { id: 4, checked: false, name: "Length" },
//   { id: 5, checked: false, name: "Tone" },
//   { id: 6, checked: false, name: "Tense" },
// ];

// const checkObjectives = (objectives: string) => {
//   const updatedValidators = [...initialValidators];
//   updatedValidators.forEach((validator) => {
//     if (objectives.toLowerCase().includes(validator.name.toLowerCase())) {
//       validator.checked = true;
//     } else {
//       validator.checked = false;
//     }
//   });
//   return updatedValidators;
// };

const PromptValidator: React.FC<PromptValidatorProps> = ({
  open,
  onClose,
  anchorEl,
}) => {
  //   const [promptValidatorsList, setPromptValidatorsList] =
  //     useState(initialValidators);
  //   const [interviewSummariesForm] = useAtom(interviewSummariesFormAtom);

  //   useEffect(() => {
  //     const objectives = interviewSummariesForm.objectives;
  //     const updatedValidators = checkObjectives(objectives);
  //     setPromptValidatorsList(updatedValidators);
  //   }, [interviewSummariesForm.objectives]);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      transformOrigin={{ vertical: "bottom", horizontal: "right" }}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 5,
            width: 300,
            boxShadow: "none",
            border: "1px solid #D6D3D1",
          },
        },
      }}
    >
      <Box
        sx={{
          backgroundColor: "white",
          borderRadius: 2,
          maxWidth: 400,
          position: "relative",
        }}
      >
        <Box sx={{ height: 50, background: "#FAFAF9" }}>
          <Typography sx={{ fontSize: 14, fontWeight: "bold", pt: 2, pl: 2 }}>
            Prompt Validator
          </Typography>
        </Box>
        {/* {promptValidatorsList.map((validator, index) => {
          return (
            <Box
              key={validator.id}
              sx={{
                borderBottom:
                  index === promptValidatorsList.length - 1 ? 0 : 1.5,
                borderColor: validator.checked ? "#4CC30F1A" : "#EBEBEB",
                backgroundColor: validator.checked ? "#4CC30F1A" : "white",
                padding: "10px 15px 10px 15px",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  paddingInline: 1,
                }}
              >
                {validator.checked ? (
                  <FilledCheckIcon />
                ) : (
                  <UnFilledCheckIcon />
                )}
                <Typography sx={{ fontSize: 14, fontWeight: "700" }}>
                  {validator.name}
                </Typography>
              </Box>
            </Box>
          );
        })} */}
      </Box>
    </Popover>
  );
};

export default PromptValidator;
