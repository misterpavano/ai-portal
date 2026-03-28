import { Box, Skeleton, Typography } from "@mui/material";
import { Form, Formik } from "formik";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { discussionGuideFlowAtom } from "../../../../../../../atoms/discussionGuideAtom";
import DefaultButton from "../../../../../../../components/layouts/DefaultButton";
import { marketResearchSchema } from "../../../../../../../schemas/discussionGuideSchema";
import { MarketResearchFormValues } from "../../../../../../../types/discussionGuidesTypes";
import RegenerateMarketResearchModal from "../../../Modals/RegenerateMarketResearch";

export type MarketResearchFormProps = {
  handleSubmit: (formValues: MarketResearchFormValues) => void;
};

const MarketResearchForm = ({ handleSubmit }: MarketResearchFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [discussionGuideFlow] = useAtom(discussionGuideFlowAtom);

  const [initialFormValues, setFormInitialValues] = useState(
    discussionGuideFlow.marketResearchForm
  );

  const handleRegenerateClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setAnchorEl(null);
  };

  useEffect(() => {
    if (initialFormValues.marketResearchDisclousers) {
      setFormInitialValues(initialFormValues);
    }
  }, [initialFormValues]);

  return (
    <Formik
      initialValues={initialFormValues}
      validationSchema={marketResearchSchema}
      onSubmit={handleSubmit}
    >
      {({ values, setFieldValue }) => (
        <Form>
          <Box
            sx={{
              display: "flex",
              width: "100%",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                justifyContent: "flex-end",
              }}
            >
              <Typography
                onClick={handleRegenerateClick}
                sx={{
                  fontSize: "14px",
                  textDecoration: "underline",
                  cursor: "pointer",
                  color: "primary.600",
                  alignSelf: "flex-end",
                  marginBottom: 0.6,
                }}
              >
                Regenerate
              </Typography>
              {isLoading ? (
                <Box sx={{ marginBottom: 4 }}>
                  <Skeleton variant="text" width="100%" height={30} />
                  <Skeleton variant="text" width="100%" height={80} />
                </Box>
              ) : (
                <ReactQuill
                  id="marketResearchDisclousers"
                  theme="snow"
                  placeholder="Type Market Research Disclosure..."
                  value={values.marketResearchDisclousers!}
                  onChange={(value) =>
                    setFieldValue("marketResearchDisclousers", value)
                  }
                />
              )}
            </Box>
            <DefaultButton
              style={{
                alignSelf: "flex-end",
                width: 100,
                borderRadius: "15px",
                height: 45,
                marginTop: 3,
                marginBottom: 3,
              }}
              submit
              type="primary"
              title="Save"
            />
          </Box>
          <RegenerateMarketResearchModal
            open={modalOpen}
            onClose={handleCloseModal}
            anchorEl={anchorEl}
            setLoading={setIsLoading}
            isLoading={isLoading}
            setFieldValue={setFieldValue}
          />
        </Form>
      )}
    </Formik>
  );
};

export default MarketResearchForm;
