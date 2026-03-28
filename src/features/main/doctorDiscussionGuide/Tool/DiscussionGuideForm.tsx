import React from "react";
import {
  Box,
  Checkbox,
  FormControlLabel,
  IconButton,
  Link,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { ErrorMessage, Form, Formik } from "formik";
import DefaultButton from "../../../../components/layouts/DefaultButton";
import Dropdown from "../../../../components/layouts/Select";
import Slider from "../../../../components/layouts/Slider";
import TextInput from "../../../../components/layouts/TextInput";
import { validationSchema } from "../../../../schemas/discussionGuideSchema";
import { DiscussionGuidesTypeForm } from "../../../../types/discussionGuidesTypes";
import { PropsWithChildren } from "react";

const numberOfQuestions = ["5", "10", "15", "20", "25"];
const focusAreaChoices = [
  "General Questions",
  "Mechanism of Action",
  "Side Effects",
  "Dosage",
  "Interactions",
  "Clinical Efficacy",
];
const tones = ["Curious", "Warm", "Wary", "Assured", "Formal"];
const allergies = ["Seasonal", "Food", "Drug", "Insect", "Pet", "Mold", "Dust"];

export type DiscussionGuidePrototypeFormProps = {
  indicators: string[];
  initialValues: DiscussionGuidesTypeForm;
  addedIndicator: string;
  onSelect: (value: string) => void;
  handleGenerateContent: (formValues: DiscussionGuidesTypeForm) => void;
  generateIndicators: (drugName: string) => Promise<void>;
  handleDrugNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setIndicators: React.Dispatch<React.SetStateAction<string[]>>;
  addIndicator: () => void;
  setAddedIndicator: React.Dispatch<React.SetStateAction<string>>;
};

const BoxContainer = ({ children }: PropsWithChildren) => (
  <Box
    sx={{
      width: 550,
      paddingTop: 2,
      paddingLeft: 3.5,
      paddingRight: 3.5,
      paddingBottom: 2.5,
      marginBottom: 3,
      backgroundColor: "primary.100",
      borderRadius: 4,
      justifyContent: "center",
    }}
  >
    {children}
  </Box>
);

const DiscussionGuideForm = ({
  initialValues,
  indicators,
  addedIndicator,
  handleGenerateContent,
  generateIndicators,
  handleDrugNameChange,
  addIndicator,
  setAddedIndicator,
}: DiscussionGuidePrototypeFormProps) => {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleGenerateContent}
    >
      {({ values, errors, setFieldValue, handleChange }) => (
        <Form>
          <BoxContainer>
            <Typography variant="h6" fontWeight="bold" sx={{ marginBottom: 1 }}>
              Drug
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <TextInput
                name="drugName"
                topText="Drug name:"
                value={values.drugName!}
                error={!!errors.drugName}
                onChange={(e) => {
                  handleChange(e);
                  handleDrugNameChange(e);
                }}
                containerStyles={{
                  width: values.drugName && indicators.length === 0 ? 350 : 480,
                  height: 45,
                  marginBottom: 5,
                  paddingRight: 3,
                }}
              />
              {values.drugName && indicators.length === 0 && (
                <Link
                  onClick={() => {
                    generateIndicators(values.drugName || "");
                  }}
                  sx={{
                    color: "#0066FF",
                    textDecoration: "underline",
                    cursor: "pointer",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  Get Indications
                </Link>
              )}
            </Box>

            {indicators.length > 0 && (
              <Typography sx={{ mb: 2 }} variant="body2">
                Indications:
              </Typography>
            )}
            {indicators.map((indicator, index) => (
              <Tooltip key={index} title={indicator}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name={`indicators.${indicator}`}
                      checked={values.indicators?.includes(indicator) || false}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        setFieldValue(
                          "indicators",
                          isChecked
                            ? [...(values.indicators || []), indicator]
                            : values.indicators?.filter(
                              (item) => item !== indicator
                            )
                        );
                      }}
                    />
                  }
                  label={
                    <Typography
                      sx={{
                        padding: "10px 0 10px 0",
                        fontSize: "0.9rem",
                      }}
                      variant="body2"
                    >
                      {indicator}
                    </Typography>
                  }
                  sx={{
                    marginBottom: 1,
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "flex-start",
                  }}
                />
              </Tooltip>
            ))}

            {indicators.length > 0 && (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <TextInput
                  name="indicators"
                  placeholder="Type in other indication"
                  value={addedIndicator}
                  onChange={(e) => setAddedIndicator(e.target.value)}
                  containerStyles={{
                    width: 300,
                    height: 45,
                    marginBottom: 5,
                    paddingRight: 1,
                  }}
                />
                <IconButton
                  color="primary"
                  aria-label="add"
                  onClick={addIndicator}
                  sx={{ marginLeft: 1 }}
                >
                  <AddIcon sx={{ color: "#0066FF", fontSize: "16px" }} />
                  <Link
                    sx={{
                      color: "#0066FF",
                      textDecoration: "none",
                      fontSize: "16px",
                      cursor: "pointer",
                      "&:hover": {
                        textDecoration: "underline",
                      },
                    }}
                  >
                    Add
                  </Link>
                </IconButton>
              </Box>
            )}
          </BoxContainer>

          <BoxContainer>
            <Typography variant="h6" fontWeight="bold" sx={{ marginBottom: 2 }}>
              Patient
            </Typography>
            <Slider
              name="patientFamiliarity"
              leftBottomText="None"
              rightBottomText="Advanced"
              topText="Patient familiarity"
              value={Number(values.patientFamiliarity!)}
              styles={{ width: 500 }}
              min={0}
              max={10}
              handleChange={handleChange}
            />
            <Slider
              name="exercise"
              leftBottomText="None"
              rightBottomText="Advanced"
              topText="Exercise habits"
              value={Number(values.exercise!)}
              styles={{ width: 500 }}
              min={0}
              max={10}
              handleChange={handleChange}
            />
            <Dropdown
              multiple
              topText="Focus area(s):"
              name="focusAreas"
              onSelect={handleChange}
              value={values.focusAreas}
              error={!!errors.focusAreas}
              styles={{
                width: 500,
                height: 45,
                marginBottom: 3,
              }}
            >
              {focusAreaChoices.map((focus, key) => (
                <MenuItem key={key} value={focus}>
                  <Checkbox checked={values.focusAreas!.includes(focus)} />
                  {focus}
                </MenuItem>
              ))}
            </Dropdown>
            <ErrorMessage
              className="error-message"
              name="focusAreas"
              component="div"
            />

            <Dropdown
              topText="Tone:"
              name="tone"
              onSelect={handleChange}
              value={values.tone}
              error={!!errors.tone}
              styles={{
                width: 500,
                height: 45,
                marginBottom: 3,
              }}
            >
              {tones.map((val, key) => (
                <MenuItem key={key} value={val}>
                  {val}
                </MenuItem>
              ))}
            </Dropdown>

            <Dropdown
              multiple
              topText="Allergies:"
              name="allergies"
              onSelect={handleChange}
              value={values.allergies}
              error={!!errors.allergies}
              styles={{
                width: 500,
                height: 45,
                marginBottom: 1,
              }}
            >
              {allergies.map((allergy, key) => (
                <MenuItem key={key} value={allergy}>
                  <Checkbox checked={allergies?.length > 0 ? values?.allergies?.includes(allergy) : false} />
                  {allergy}
                </MenuItem>
              ))}
            </Dropdown>
          </BoxContainer>

          <BoxContainer>
            <Typography variant="h6" fontWeight="bold" sx={{ marginBottom: 1 }}>
              Tool Misc
            </Typography>
            <Dropdown
              name="aiType"
              topText="AI Solution:"
              value={values.aiType}
              onSelect={handleChange}
              styles={{
                width: 500,
                height: 45,
                marginBottom: 3,
              }}
            >
              <MenuItem key="openai" value="openai">
                Open AI (gpt-3.5-turbo-0125)
              </MenuItem>
              <MenuItem key="gemini" value="gemini">
                Gemini AI
              </MenuItem>
              <MenuItem key="claude" value="claude">
                Claude AI
              </MenuItem>
            </Dropdown>
            <Dropdown
              topText="Number of questions:"
              name="numberOfQuestions"
              onSelect={handleChange}
              value={values.numberOfQuestions}
              error={!!errors.numberOfQuestions}
              styles={{
                width: 500,
                height: 45,
                marginBottom: 1,
              }}
            >
              {numberOfQuestions.map((val, key) => (
                <MenuItem key={key} value={val}>
                  {val}
                </MenuItem>
              ))}
            </Dropdown>
          </BoxContainer>

          <DefaultButton
            style={{
              width: 111,
              height: 49,
              borderRadius: 4,
              float: "right",
            }}
            submit
            type="primary"
            title="Generate"
          />
        </Form>
      )}
    </Formik>
  );
};

export default DiscussionGuideForm;
