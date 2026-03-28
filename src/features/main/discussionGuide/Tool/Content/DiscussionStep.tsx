import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Tab, Tooltip, Typography, styled } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { IconAward } from "@tabler/icons-react";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import PromptValidatorLogo from "../../../../../assets/svg/PromptValidatorLogo";
import { discussionGuideFlowAtom } from "../../../../../atoms/discussionGuideAtom";
import InputDescriptionBox from "../../../../../components/layouts/InputDescriptionBox";
import DiscussionForm from "../Forms/MandatoryFields/DiscussionForm";
import DiscussionPromptValidator from "../Modals/PromptValidator";
import DiscussionStepNotes from "./DiscussionStepNotes";
import useAzureSharePoint from "../../../../../hooks/useAzureSharePoint";
import { sharePointDisccussionGuideFolderId } from "../../../../../constants/sharePoint";

export const StyledTab = styled(Tab)(({ theme }) => ({
  borderColor: theme.palette.divider,
  borderRadius: "30px",
  marginRight: "10px",
  width: "9em",
  marginBottom: "10px",
  backgroundColor: "#f7f7f7",
  "&.Mui-selected": {
    backgroundColor: "#DC5E5E",
    color: "white",
    fontWeight: theme.typography.fontWeightMedium,
  },
  "&:not(.Mui-selected)": {
    color: theme.palette.text.primary,
  },
}));

export const StyledTabs = styled(TabList)(() => ({
  borderBottom: "1px solid #f1f1f1",
  "& .MuiTabs-indicator": {
    display: "none",
  },
}));

const DiscussionStep = () => {
  const [discussionFormValues, setDiscussionFormValues] = useAtom(
    discussionGuideFlowAtom
  );
  const { fetchFilesByDriveAndFolderId } = useAzureSharePoint();
  const [value, setValue] = useState("Prompt");
  const [modalOpen, setModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [structures, setStructures] = useState([]);

  useEffect(() => {
    (async () => {
      const questionsFolderId =
        sharePointDisccussionGuideFolderId[discussionFormValues.type.name]
          .questionsId;
      const structuresFolderId =
        sharePointDisccussionGuideFolderId[discussionFormValues.type.name]
          .structuresId;
      const questions = await fetchFilesByDriveAndFolderId(questionsFolderId);
      const structures = await fetchFilesByDriveAndFolderId(structuresFolderId);

      setQuestions(questions);
      setStructures(structures);
    })();
  }, []);

  useEffect(() => {
    if (
      discussionFormValues.discussionObjectives ||
      discussionFormValues.audienceDiscussionObjectives ||
      discussionFormValues.caveatsDiscussionObjectives ||
      discussionFormValues.lengthDiscussionObjectives ||
      discussionFormValues.communicationStyleDiscussionObjectives
    ) {
      setDiscussionFormValues(discussionFormValues);
    } else {
      setDiscussionFormValues(discussionFormValues);
    }
  }, [discussionFormValues]);

  const handleExpandClick = () => {
    setIsExpanded(!isExpanded);
  };

  const isPromptDisabled = discussionFormValues.discussionObjectives === "";

  const handleOpenModal = (event: React.MouseEvent<HTMLElement>) => {
    if (!isPromptDisabled) {
      setAnchorEl(event.currentTarget);
      setModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setAnchorEl(null);
  };

  return (
    <TabContext value={value}>
      <Box
        sx={{
          paddingX: "20px",
          borderColor: "primary.400",
        }}
      ></Box>
      <TabPanel sx={{ px: "20px" }} value="Prompt">
        <Box
          sx={{
            height: isExpanded ? "60vh" : "",
          }}
          display="flex"
          flexDirection="row"
        >
          <Box
            sx={{
              flexBasis: "50%",
            }}
          >
            <DiscussionForm
              questions={questions}
              structures={structures}
              initialValues={discussionFormValues}
              setDiscussionFormValues={setDiscussionFormValues}
            />
          </Box>
          <Box
            display="flex"
            flexDirection="column"
            sx={{ flexBasis: "50%", marginTop: "-106px" }}
          >
            {!isExpanded && (
              <Button
                sx={{
                  alignSelf: "flex-end",
                  borderBottomRightRadius: "18px",
                  borderBottomLeftRadius: "18px",
                  fontSize: "12px",
                  background:
                    "linear-gradient(98.76deg, #DC5E5E 11.95%, #FF9A9A 149.3%)",
                  color: "white",
                  "&:hover": {
                    background:
                      "linear-gradient(98.76deg, #DC5E5E 11.95%, #FF9A9A 149.3%)",
                  },
                  marginLeft: "auto",
                }}
                onClick={handleExpandClick}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  Best Practice
                  <IconAward size="14px" />
                </Box>
              </Button>
            )}
            {!isExpanded && (
              <InputDescriptionBox
                marginTop="100px"
                text={
                  <Typography style={{ fontSize: 12 }}>
                    Use natural language to indicate how you would like to
                    modify the discussion guides being used for inspiration
                    below. Please include your{" "}
                    <Box component="span" fontWeight="bold">
                      Project Objectives
                    </Box>{" "}
                    for the discussion guide along with any of the following
                    (optional):{" "}
                    <Box component="span" fontWeight="bold">
                      Audience Objective
                    </Box>
                    ,{" "}
                    <Box component="span" fontWeight="bold">
                      Caveats
                    </Box>
                    ,{" "}
                    <Box component="span" fontWeight="bold">
                      Phrasing
                    </Box>
                    ,{" "}
                    <Box component="span" fontWeight="bold">
                      Length
                    </Box>
                    ,{" "}
                    <Box component="span" fontWeight="bold">
                      Tone
                    </Box>
                    , and{" "}
                    <Box component="span" fontWeight="bold">
                      Tense
                    </Box>
                    . This will ensure the generated guide aligns with your
                    goals and provides effective direction for the session.
                    <Box component="span" fontWeight="bold">
                      <br />
                      If you want to the change the disease space this guide
                      will talk about, include that here. Please also indicate
                      if you need different naming conventions throughout (i.e.,
                      if you are talking about a branded product but want it
                      referred to as Product X, say "Please always referred to
                      BRAND as PRODUCTX".)
                    </Box>
                  </Typography>
                }
              />
            )}
            {isExpanded && (
              <DiscussionStepNotes onExpandClick={handleExpandClick} />
            )}
          </Box>
          <DiscussionPromptValidator
            open={modalOpen}
            anchorEl={anchorEl}
            onClose={handleCloseModal}
          />
          {/* <Tooltip arrow title="Prompt Validator" placement="top">
            <Box
              sx={{
                cursor: isPromptDisabled ? "not-allowed" : "pointer",
                position: "absolute",
                bottom: 140,
                right: 70,
              }}
              onClick={handleOpenModal}
            >
              <PromptValidatorLogo
                isPromptDisabled={isPromptDisabled}
                style={{
                  filter: isPromptDisabled ? "grayscale(100%)" : "none",
                  opacity: isPromptDisabled ? 0.5 : 1,
                }}
              />
            </Box>
          </Tooltip> */}
        </Box>
      </TabPanel>
    </TabContext>
  );
};

export default DiscussionStep;
