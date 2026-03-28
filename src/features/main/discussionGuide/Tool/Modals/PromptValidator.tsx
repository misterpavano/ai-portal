import { Box, Popover, Tooltip, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import FilledCheckIcon from "../../../../../assets/svg/FilledCheckIcon";
import { discussionGuideFlowAtom } from "../../../../../atoms/discussionGuideAtom";
import { IconInfoCircle, IconXboxXFilled } from "@tabler/icons-react";
import useOpenAI from "../../../../../hooks/useOpenAI";
import { ChatCompletionMessageParam } from "openai/resources";
import { discussionGuidePromptValidator } from "../../../../../config/prompts";
import Spinner from "../../../../../components/layouts/Spinner";
import { initialValidators } from "../../../../../config/promptValidator";

type PromptValidatorProps = {
  open: boolean;
  onClose: () => void;
  anchorEl: HTMLElement | null;
};

const DiscussionPromptValidator: React.FC<PromptValidatorProps> = ({
  open,
  onClose,
  anchorEl,
}) => {
  const { chatCompletionOpenAi } = useOpenAI();
  const [promptValidatorsList, setPromptValidatorsList] =
    useState(initialValidators);
  const [discussionGuideForm] = useAtom(discussionGuideFlowAtom);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const fetchCompletion = async () => {
      const prompt = discussionGuidePromptValidator.replace(
        "{discussionObjectives}",
        discussionGuideForm.discussionObjectives
      );
      const messages: ChatCompletionMessageParam[] = [
        { role: "user", content: prompt },
      ];
      try {
        setIsLoading(true);
        const response = await chatCompletionOpenAi(messages);
        const responseObject = JSON.parse(response);
        const updatedValidators = initialValidators.map((validator) => ({
          ...validator,
          checked: responseObject[validator.name] === true,
        }));
        setPromptValidatorsList(updatedValidators);
      } catch (error) {
        console.error("Error fetching completion:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceFetch = () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      debounceTimer = setTimeout(() => {
        fetchCompletion();
        debounceTimer = null;
      }, 1000);
    };

    if (discussionGuideForm.discussionObjectives) {
      debounceFetch();
    }

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [discussionGuideForm.discussionObjectives]);

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
        {promptValidatorsList.map((validator, index) => {
          return (
            <Box
              key={validator.id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom:
                  index === promptValidatorsList.length - 1 ? 0 : 1.5,
                borderColor: isLoading
                  ? "#EBEBEB"
                  : validator.checked
                  ? "#4CC30F1A"
                  : "#C30F0F1A",
                backgroundColor: isLoading
                  ? "#FFFFF3"
                  : validator.checked
                  ? "#4CC30F1A"
                  : "#C30F0F1A",
                padding: "10px 15px 10px 15px",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  paddingInline: 1,
                  cursor: "pointer",
                }}
              >
                {isLoading ? (
                  <Spinner size={12} />
                ) : validator.checked ? (
                  <FilledCheckIcon />
                ) : (
                  <IconXboxXFilled size={15} color="#DC5E5E" />
                )}
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: isLoading
                      ? "#000000"
                      : validator.checked
                      ? "#4CC30F"
                      : "#DC5E5E",
                  }}
                >
                  {validator.name}
                </Typography>
              </Box>
              <Tooltip placement="top" arrow title={validator.desc}>
                <Box
                  sx={{
                    cursor: "pointer",
                    "& .MuiTooltip-tooltip": {
                      backgroundColor: "black",
                      fontSize: "14px",
                      padding: "10px",
                    },
                    "& .MuiTooltip-arrow": {
                      color: "black",
                    },
                  }}
                >
                  <IconInfoCircle size={15} />
                </Box>
              </Tooltip>
            </Box>
          );
        })}
      </Box>
    </Popover>
  );
};

export default DiscussionPromptValidator;
