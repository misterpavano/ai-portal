import { useEffect, useRef, useState } from "react";
import { GeneratedInterviewSummaries } from "../../../../../types/interviewSummaries";
import { useAtom } from "jotai";
import { interviewSelectedComponentsAtom } from "../../../../../atoms/dndAtom";
import { Box, Popover, Skeleton, Typography } from "@mui/material";
import RegenerateInterviewSummariesModal from "../Modals/RegenerateInterviewSummariesModal";
import { IconList, IconQuotes, IconTrash } from "@tabler/icons-react";
import GenerateQuotesModal from "../Modals/GenerateQuotesModal";
import GenerateBulletModal from "../Modals/GenerateBulletModal";
import AddTopicModal from "../Modals/AddTopicModal";
import QuotaExceededModal from "../Modals/QuotaExceededModal";
import ReactQuill from "react-quill";
import { InterviewEditor } from "../editor/InterviewEditor";
import { useInterviewFetch } from "../editor/hooks/useInterviewFetch";
import { useInterviewHandlers } from "../editor/hooks/useInterviewHandlers";
import { useTextSelection } from "../editor/hooks/useTextSelection";

const ExecutiveInterviewSummary = () => {
  const editorRefs = useRef<{ [key: string]: ReactQuill | null }>({});
  const editorDivRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [loadedSections, setLoadedSections] = useState<Set<string>>(new Set());
  const [selectedComponents] = useAtom(interviewSelectedComponentsAtom);
  const visibleItems = selectedComponents.filter((item) => item.checked);
  const filteredVisibleItems = visibleItems.filter(
    (item) => item.title !== "Discussion Topics"
  );

  const {
    fetchKeyTakeaways,
    fetchDetailedInsights,
    fetchActionItems,
    fetchKeyRecommendations,
    removeFiles,
    sectionLoading,
    setSectionLoading,
    interviewSummariesFormValues,
    setInterviewSummariesFormValues,
    quotaExceeded,
    quotaErrorMessage,
    setQuotaExceeded,
  } = useInterviewFetch();

  const {
    popoverOpen,
    setPopoverOpen,
    highlightedText,
    setHighlightedText,
    currentSection,
    setCurrentSection,
    popoverAnchorPosition,
  } = useTextSelection(editorDivRefs);

  const {
    modalOpen,
    topicModalOpen,
    showQuoteModal,
    showBulletModal,
    anchorEl,
    handleOpenModal,
    handleOpenTopicModal,
    handleCloseModal,
    handleTopicCloseModal,
    handleCloseQuoteModal,
    handleCloseBulletModal,
    handleReplaceBullet,
    handleQuoteInsert,
    handleDeleteContent,
    setShowQuoteModal,
    setShowBulletModal,
  } = useInterviewHandlers(
    editorRefs,
    highlightedText,
    currentSection,
    setHighlightedText,
    setCurrentSection
  );

  useEffect(() => {
    const fetchCompletions = async () => {
      const maxRetries = 1; // Reduced from 3 to 2 to reduce API costs (retry logic already exists in useInterviewFetch)

      const fetchWithRetry = async (
        fetchFunction: () => Promise<void>,
        sectionKey: string
      ) => {
        let retries = 0;
        while (retries < maxRetries) {
          try {
            await fetchFunction();
            setLoadedSections((prev) => new Set(prev).add(sectionKey));
            return;
          } catch (error) {
            console.error(`Error in fetch (attempt ${retries + 1}):`, error);
            retries++;
            if (retries >= maxRetries) {
              console.error(`Max retries reached for ${fetchFunction.name}`);
            }
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
      };

      try {
        // Order: generatedKeyTakeaways → generatedKeyRecommendations → generatedActions → generatedDetailedInsights
        await fetchWithRetry(fetchKeyTakeaways, "generatedKeyTakeaways");
        await fetchWithRetry(
          fetchKeyRecommendations,
          "generatedKeyRecommendations"
        );
        await fetchWithRetry(fetchActionItems, "generatedActions");
        await fetchWithRetry(
          fetchDetailedInsights,
          "generatedDetailedInsights"
        );
      } catch (error) {
        console.error("Error in interview fetch:", error);
      }
    };

    fetchCompletions();
  }, []);

  useEffect(() => {
    return () => {
      removeFiles();
    };
  }, []);

  const handleRegenerate = async (note: string) => {
    // Check if current content is fallback - enhance note if so
    let enhancedNote = note;
    if (currentSection === "generatedActions") {
      const currentContent =
        interviewSummariesFormValues.generatedInterviewSummaries
          ?.generatedActions?.[0] || "";
      if (
        currentContent.includes("No action items have been identified") ||
        currentContent.includes("No action items can be determined")
      ) {
        enhancedNote = `${note} Previous result was fallback: "No action items have been identified." You MUST find real action items.`;
      }
    } else if (currentSection === "generatedKeyRecommendations") {
      const currentContent =
        interviewSummariesFormValues.generatedInterviewSummaries
          ?.generatedKeyRecommendations?.[0] || "";
      if (
        currentContent.includes("No Key Recommendations can be determined") ||
        currentContent.includes("No Key Recommendations have been identified")
      ) {
        enhancedNote = `${note} Previous result was fallback: "No Key Recommendations can be determined." You MUST find real key recommendations.`;
      }
    } else if (currentSection === "generatedDetailedInsights") {
      const currentContent =
        interviewSummariesFormValues.generatedInterviewSummaries
          ?.generatedDetailedInsights?.[0] || "";
      if (
        currentContent.includes("Content for this topic is being processed") ||
        currentContent.includes("An error occurred while processing this topic")
      ) {
        enhancedNote = `${note} Previous result contained fallback content for one or more topics. You MUST find real detailed insights for ALL topics.`;
      }
    }

    if (currentSection === "generatedKeyTakeaways") {
      await fetchKeyTakeaways(enhancedNote);
      setLoadedSections((prev) => new Set(prev).add("generatedKeyTakeaways"));
    } else if (currentSection === "generatedDetailedInsights") {
      await fetchDetailedInsights(enhancedNote);
      setLoadedSections((prev) =>
        new Set(prev).add("generatedDetailedInsights")
      );
    } else if (currentSection === "generatedActions") {
      await fetchActionItems(enhancedNote);
      setLoadedSections((prev) => new Set(prev).add("generatedActions"));
    } else if (currentSection === "generatedKeyRecommendations") {
      await fetchKeyRecommendations(enhancedNote);
      setLoadedSections((prev) =>
        new Set(prev).add("generatedKeyRecommendations")
      );
    }
    setSectionLoading(null);
  };

  return (
    <Box>
      {filteredVisibleItems?.map((item) => {
        const valueKey = {
          "Key takeaways": "generatedKeyTakeaways",
          "Detailed Insights": "generatedDetailedInsights",
          "Action Items": "generatedActions",
          "Key Recommendations": "generatedKeyRecommendations",
        }[item.title] as keyof GeneratedInterviewSummaries;

        const value =
          interviewSummariesFormValues.generatedInterviewSummaries?.[
            valueKey
          ]?.join("\n") || "";
        const isSectionLoaded = loadedSections.has(valueKey);
        const isCurrentlyLoading = sectionLoading === valueKey;
        // Show loading if section is currently loading OR hasn't been loaded yet
        const isLoadingSection = isCurrentlyLoading || !isSectionLoaded;

        return (
          <Box sx={{ padding: "20px 20px 0 20px" }} key={item.id}>
            <InterviewEditor
              label={item.title}
              valueKey={valueKey}
              value={value}
              isLoadingSection={isLoadingSection}
              sectionLoading={sectionLoading}
              onOpenModal={handleOpenModal}
              onOpenTopicModal={handleOpenTopicModal}
              onChange={(val) => {
                setInterviewSummariesFormValues((prev) => ({
                  ...prev,
                  generatedInterviewSummaries: {
                    ...prev.generatedInterviewSummaries,
                    [valueKey]: val.split("\n"),
                  },
                }));
              }}
              editorRefs={editorRefs}
              editorDivRefs={editorDivRefs}
            />
          </Box>
        );
      })}
      <Popover
        open={popoverOpen}
        anchorReference="anchorPosition"
        anchorPosition={popoverAnchorPosition}
        onClose={() => setPopoverOpen(false)}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "5px",
            gap: 1,
          }}
        >
          {currentSection !== "generatedActions" && (
            <Box
              onClick={() => setShowQuoteModal(true)}
              sx={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#FDECEC",
                padding: 1,
                gap: 1,
              }}
            >
              <IconQuotes size={14} />
              <Typography
                sx={{
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: 550,
                  color: "#595858",
                }}
              >
                Generate Quotes
              </Typography>
            </Box>
          )}
          <Box
            onClick={() => setShowBulletModal(true)}
            sx={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#E7E5E4",
              padding: 1,
              gap: 1,
            }}
          >
            <IconList size={14} />
            <Typography
              sx={{
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: 550,
                color: "#595858",
              }}
            >
              Regenerate Content
            </Typography>
          </Box>
          <Box
            onClick={() => handleDeleteContent(setPopoverOpen)}
            sx={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#E7E5E4",
              padding: 1,
              gap: 1,
            }}
          >
            <IconTrash size={14} />
            <Typography
              sx={{
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: 550,
                color: "#595858",
              }}
            >
              Delete Content
            </Typography>
          </Box>
        </Box>
      </Popover>
      <GenerateBulletModal
        highlightedText={highlightedText}
        isOpen={showBulletModal}
        onClose={handleCloseBulletModal}
        onBulletSelect={handleReplaceBullet}
      />
      <GenerateQuotesModal
        highlightedText={highlightedText}
        isOpen={showQuoteModal}
        onClose={handleCloseQuoteModal}
        onQuoteSelect={handleQuoteInsert}
      />
      <RegenerateInterviewSummariesModal
        open={modalOpen}
        anchorEl={anchorEl}
        sectionKey={currentSection}
        onClose={handleCloseModal}
        onRegenerate={handleRegenerate}
      />
      <AddTopicModal
        open={topicModalOpen}
        anchorEl={anchorEl}
        sectionKey={currentSection}
        onClose={handleTopicCloseModal}
        sectionLoading={sectionLoading}
        setSectionLoading={setSectionLoading}
      />
      <QuotaExceededModal
        open={quotaExceeded}
        onClose={() => setQuotaExceeded(false)}
        errorMessage={quotaErrorMessage}
      />
    </Box>
  );
};

export default ExecutiveInterviewSummary;
