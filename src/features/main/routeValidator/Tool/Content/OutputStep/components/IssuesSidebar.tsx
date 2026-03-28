import React, { memo, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Divider,
  CircularProgress,
} from "@mui/material";
import { IssuesSidebarProps, TASK_DISPLAY_NAMES } from "../types";
import { COLORS } from "../constants";
import IssueCard from "./IssueCard";
import { TaskProgressBar } from "./TaskProgressBar";

/**
 * Right sidebar panel containing the list of validation issues
 */
export const IssuesSidebar: React.FC<IssuesSidebarProps> = memo(
  ({
    issues,
    activeIssueIds,
    isValidating,
    hasValidationResults,
    onIssueClick,
    onGoBackToValidation,
    getSeverityColor,
    panelRef,
    onReviewStatusChange,
    taskProgress = [],
    expandedIssueId,
    onExpandChange,
    currentPage,
    onClearSelection,
    onRetryTask,
  }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCheckType, setSelectedCheckType] = useState<string | null>(
      null,
    );
    const [reviewFilter, setReviewFilter] = useState<
      "all" | "approved" | "rejected"
    >("all");
    const [selectedSeverityRange, setSelectedSeverityRange] = useState<
      "low" | "mid" | "high" | null
    >(null);

    // When a chip is toggled, also clear the current issue selection
    const handleCheckTypeSelect = (checkType: string | null) => {
      setSelectedCheckType(checkType);
      onClearSelection?.();
    };

    // Filter issues by search text and/or selected check type
    const filteredIssues = useMemo(() => {
      let result = issues;
      if (reviewFilter !== "all") {
        result = result.filter(
          (issue) => (issue.reviewStatus ?? "not_reviewed") === reviewFilter,
        );
      }
      if (selectedSeverityRange !== null) {
        result = result.filter((issue) => {
          const s = issue.severity;
          if (selectedSeverityRange === "low") return s >= 1 && s <= 3;
          if (selectedSeverityRange === "mid") return s >= 4 && s <= 6;
          if (selectedSeverityRange === "high") return s >= 7 && s <= 10;
          return true;
        });
      }
      if (selectedCheckType) {
        // Issue IDs are formatted as "issue-{taskName}-{n}" where taskName
        // is the normalised task key (e.g. "spell_check"). Match by prefix.
        const taskPrefix = `issue-${selectedCheckType.toLowerCase().replace(/[^a-z0-9]/g, "_")}-`;
        result = result.filter((issue) => issue.id.startsWith(taskPrefix));
      }
      const q = searchQuery.trim().toLowerCase();
      if (q) {
        result = result.filter(
          (issue) =>
            issue.body.issue.toLowerCase().includes(q) ||
            issue.body.recommendation?.toLowerCase().includes(q) ||
            (TASK_DISPLAY_NAMES[issue.type] || issue.type)
              .toLowerCase()
              .includes(q),
        );
      }
      return result;
    }, [
      issues,
      reviewFilter,
      selectedSeverityRange,
      selectedCheckType,
      searchQuery,
    ]);

    const reviewCounts = useMemo(
      () => ({
        all: issues.length,
        approved: issues.filter(
          (i) => (i.reviewStatus ?? "not_reviewed") === "approved",
        ).length,
        rejected: issues.filter(
          (i) => (i.reviewStatus ?? "not_reviewed") === "rejected",
        ).length,
      }),
      [issues],
    );
    return (
      <Box
        ref={panelRef}
        sx={{
          width: "400px",
          backgroundColor: "#FFFFFF",
          borderRadius: "8px",
          overflowY: "auto",
          overflowX: "hidden",
          border: "1px solid",
          borderColor: "neutral.400",
          maxHeight: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          zIndex: 0, // Keep sidebar cards below connector SVG (zIndex: 1)
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            height: "4px",
            // marginBottom: 1.5,
            backgroundColor: "neutral.200",
            padding: "20px 12px 20px 12px",
          }}
        >
          <Typography
            sx={{
              fontSize: "16px",
              fontWeight: 600,
              color: "text.primary",
            }}
          >
            Issues Found
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 600,
                color: "text.primary",
              }}
            >
              {issues.length}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ p: 2 }}>
          {/* Compact Progress Bar — search filters issue cards, chips filter by check type */}
          {taskProgress.length > 0 && (
            <TaskProgressBar
              tasks={taskProgress}
              compact={true}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCheckType={selectedCheckType}
              onCheckTypeSelect={handleCheckTypeSelect}
              reviewFilter={reviewFilter}
              onReviewFilterChange={setReviewFilter}
              reviewCounts={reviewCounts}
              selectedSeverityRange={selectedSeverityRange}
              onSeverityRangeSelect={setSelectedSeverityRange}
              getSeverityColor={getSeverityColor}
              onRetryTask={onRetryTask}
            />
          )}

          <Divider sx={{ borderColor: "neutral.400", mb: 1.5 }} />

          {/* Hang tight note while checks are still running */}
          {(taskProgress ?? []).some(
            (t) => t.status === "loading" || t.status === "pending",
          ) && (
            <Box
              sx={{
                mt: 1,
                mb: 1.5,
                borderRadius: "10px",
                border: "1px solid rgba(234,179,8,0.35)",
                backgroundColor: "rgba(254,252,232,0.95)",
                px: 1.75,
                py: 1.25,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <CircularProgress
                size={14}
                sx={{ color: "rgba(28,25,23,0.33)", flexShrink: 0 }}
              />
              <Typography
                sx={{
                  fontSize: "12px",
                  lineHeight: 1.5,
                  color: "rgba(28,25,23,0.33)",
                  fontStyle: "italic",
                }}
              >
                Hang tight… we&apos;re still running a few checks and analyzing
                your document.
              </Typography>
            </Box>
          )}

          {/* Issues list */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {/* No validation results message */}
            {!hasValidationResults && !isValidating && (
              <Box
                sx={{
                  backgroundColor: COLORS.background.issueCard,
                  border: `1px solid ${COLORS.border.inactive}`,
                  borderRadius: "12px",
                  padding: 2,
                  textAlign: "center",
                }}
              >
                <Typography
                  sx={{ color: COLORS.text.secondary, marginBottom: 2 }}
                >
                  No validation results available. Please run validation first.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={onGoBackToValidation}
                  size="small"
                  sx={{ textTransform: "none" }}
                >
                  Go to Tasks & Direction Step
                </Button>
              </Box>
            )}

            {/* No issues found – only show "Great job" when no task failed */}
            {filteredIssues.length === 0 &&
              issues.length === 0 &&
              hasValidationResults &&
              (() => {
                const failedTasks = (taskProgress ?? []).filter(
                  (t) => t.status === "error",
                );
                if (failedTasks.length > 0) {
                  return (
                    <Box
                      sx={{
                        backgroundColor: "#FDECEC",
                        border: "1px solid rgba(220,94,94,0.3)",
                        borderRadius: "12px",
                        padding: 2,
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        sx={{
                          color: "#DC5E5E",
                          fontSize: "14px",
                          fontWeight: 600,
                          marginBottom: 0.5,
                        }}
                      >
                        Some checks could not be completed
                      </Typography>
                      <Typography
                        sx={{ color: COLORS.text.secondary, fontSize: "13px" }}
                      >
                        {failedTasks.length} check(s) failed (e.g. server slow
                        or timeout). Please try running validation again.
                      </Typography>
                    </Box>
                  );
                }
                return null;
              })()}

            {/* No issues for the selected filter */}
            {filteredIssues.length === 0 && issues.length > 0 && (
              <Box
                sx={{
                  borderRadius: "10px",
                  border: "1px solid",
                  borderColor: "neutral.300",
                  backgroundColor: "neutral.100",
                  px: 2,
                  py: 2.5,
                  textAlign: "center",
                  mt: 0.5,
                }}
              >
                <Typography
                  sx={{
                    color: "neutral.600",
                    fontSize: "13px",
                    fontWeight: 500,
                  }}
                >
                  {reviewFilter === "approved"
                    ? "No approved issues"
                    : reviewFilter === "rejected"
                      ? "No rejected issues"
                      : "No issues found"}
                  {selectedCheckType
                    ? ` for ${TASK_DISPLAY_NAMES[selectedCheckType] || selectedCheckType}`
                    : ""}
                  {selectedSeverityRange !== null
                    ? ` for ${selectedSeverityRange} severity (${selectedSeverityRange === "low" ? "1-3" : selectedSeverityRange === "mid" ? "4-6" : "7-10"})`
                    : ""}
                  {searchQuery.trim()
                    ? ` matching "${searchQuery.trim()}"`
                    : ""}
                </Typography>
              </Box>
            )}

            {/* Issue cards — filtered by search and/or check type */}
            {filteredIssues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                isActive={activeIssueIds.has(issue.id)}
                onClick={() => onIssueClick(issue.id)}
                getSeverityColor={getSeverityColor}
                onReviewStatusChange={onReviewStatusChange}
                isExpanded={expandedIssueId === issue.id}
                onExpandChange={onExpandChange}
                currentPage={currentPage}
              />
            ))}
          </Box>
        </Box>
      </Box>
    );
  },
  (prev, next) => {
    if (
      prev.issues.length !== next.issues.length ||
      prev.activeIssueIds.size !== next.activeIssueIds.size ||
      prev.isValidating !== next.isValidating ||
      prev.hasValidationResults !== next.hasValidationResults ||
      prev.expandedIssueId !== next.expandedIssueId ||
      prev.onRetryTask !== next.onRetryTask ||
      (prev.taskProgress?.length ?? 0) !== (next.taskProgress?.length ?? 0)
    ) {
      return false;
    }
    // Progress bar must update when task status changes (e.g. when changing page)
    const prevTasks = prev.taskProgress ?? [];
    const nextTasks = next.taskProgress ?? [];
    for (let i = 0; i < prevTasks.length; i++) {
      const p = prevTasks[i];
      const n = nextTasks[i];
      if (
        !p ||
        !n ||
        p.task !== n.task ||
        p.status !== n.status ||
        (p.result?.issues?.length ?? 0) !== (n.result?.issues?.length ?? 0)
      ) {
        return false;
      }
    }
    // Must re-render when any issue's reviewStatus (or id) changes (e.g. Like/Reject)
    for (let i = 0; i < prev.issues.length; i++) {
      const p = prev.issues[i];
      const n = next.issues[i];
      if (
        !p ||
        !n ||
        p.id !== n.id ||
        (p.reviewStatus ?? "not_reviewed") !==
          (n.reviewStatus ?? "not_reviewed")
      ) {
        return false;
      }
    }
    // Check activeIssueIds (only if size matches)
    if (prev.activeIssueIds.size > 0) {
      const prevIds = Array.from(prev.activeIssueIds).sort();
      const nextIds = Array.from(next.activeIssueIds).sort();
      if (prevIds.some((id, i) => id !== nextIds[i])) return false;
    }
    return true;
  },
);

IssuesSidebar.displayName = "IssuesSidebar";

export default IssuesSidebar;
