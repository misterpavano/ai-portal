import React from "react";
import {
  Box,
  Typography,
  LinearProgress,
  CircularProgress,
  TextField,
  Tooltip,
  Divider,
} from "@mui/material";
import { CheckCircle, Error as ErrorIcon } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { IconChecklist, IconRefresh } from "@tabler/icons-react";
import { TaskProgress, TASK_DISPLAY_NAMES } from "../types";

interface TaskProgressBarProps {
  tasks: TaskProgress[];
  compact?: boolean; // If true, shows compact version for sidebar
  /** Controlled search — filters issue cards in the parent, NOT the chips here */
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  /** Currently selected check-type filter (null = show all) */
  selectedCheckType?: string | null;
  onCheckTypeSelect?: (checkType: string | null) => void;
  reviewFilter?: "all" | "approved" | "rejected";
  onReviewFilterChange?: (filter: "all" | "approved" | "rejected") => void;
  reviewCounts?: {
    all: number;
    approved: number;
    rejected: number;
  };
  /** Severity range filter: low (1-3), mid (4-6), high (7-10). Toggle: click again to clear. */
  selectedSeverityRange?: "low" | "mid" | "high" | null;
  onSeverityRangeSelect?: (range: "low" | "mid" | "high" | null) => void;
  getSeverityColor?: (severity: number) => string;
  /** Retry a single failed task */
  onRetryTask?: (task: string) => void;
}

const CHECK_ICON_COLOR = "#1C1917";

/**
 * TaskProgressBar - Displays progress for individual validation tasks
 * Shows each task with its status (pending, loading, completed, error)
 * and overall progress percentage
 */
export const TaskProgressBar: React.FC<TaskProgressBarProps> = ({
  tasks,
  compact = false,
  searchQuery = "",
  onSearchChange,
  selectedCheckType = null,
  onCheckTypeSelect,
  reviewFilter = "all",
  onReviewFilterChange,
  reviewCounts,
  selectedSeverityRange = null,
  onSeverityRangeSelect,
  getSeverityColor,
  onRetryTask,
}) => {
  /** Three severity ranges with representative colors: low 1-3 (color 1), mid 4-6 (color 5), high 7-10 (color 10) */
  const SEVERITY_RANGES: {
    range: "low" | "mid" | "high";
    severityForColor: number;
  }[] = [
    { range: "low", severityForColor: 1 },
    { range: "mid", severityForColor: 5 },
    { range: "high", severityForColor: 10 },
  ];
  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const errorCount = tasks.filter((t) => t.status === "error").length;
  const loadingCount = tasks.filter(
    (t) => t.status === "loading" || t.status === "pending",
  ).length;
  const totalTasks = tasks.length;
  const progressPercentage =
    totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;

  const isAllComplete = completedCount + errorCount === totalTasks;
  const hasLoadingTasks = loadingCount > 0;

  if (tasks.length === 0) return null;

  // Compact version for sidebar
  if (compact) {
    return (
      <Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            mb: 1.5,
          }}
        >
          {[
            { key: "all", label: "All", count: reviewCounts?.all ?? 0 },
            {
              key: "approved",
              label: "Approved",
              count: reviewCounts?.approved ?? 0,
            },
            {
              key: "rejected",
              label: "Rejected",
              count: reviewCounts?.rejected ?? 0,
            },
          ].map((item) => {
            const isActive = reviewFilter === item.key;
            return (
              <Box
                key={item.key}
                onClick={() =>
                  onReviewFilterChange?.(
                    item.key as "all" | "approved" | "rejected",
                  )
                }
                sx={{
                  px: 1.25,
                  py: 0.5,
                  borderRadius: "8px",
                  bgcolor: isActive ? "#1C1917" : "transparent",
                  border: "1px solid",
                  borderColor: isActive ? "#1C1917" : "#E7E5E4",
                  cursor: "pointer",
                  userSelect: "none",
                  transition: "all 0.15s ease",
                  "&:hover": {
                    bgcolor: isActive ? "#1C1917" : "#F5F5F4",
                  },
                }}
              >
                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: isActive ? "#FFFFFF" : "#78716C",
                  }}
                >
                  {item.label} ({item.count})
                </Typography>
              </Box>
            );
          })}
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            mb: 1,
          }}
        >
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search issues..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            sx={{
              flex: 1,
              height: 32,
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                fontSize: 12,
                backgroundColor: "#FAFAF9",
                "& fieldset": {
                  borderColor: "#E7E5E4",
                },
                "&:hover fieldset": {
                  borderColor: "#D6D3D1",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#E86D5A",
                  borderWidth: "1.5px",
                },
              },
              "& .MuiOutlinedInput-input": {
                paddingY: 0.5,
                "&::placeholder": {
                  color: "#A8A29E",
                  opacity: 1,
                },
              },
            }}
          />
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
            {SEVERITY_RANGES.map(({ range, severityForColor }) => {
              const isSelected = selectedSeverityRange === range;
              const rangeLabel =
                range === "low"
                  ? "Low severity (1–3)"
                  : range === "mid"
                    ? "Mid severity (4–6)"
                    : "High severity (7–10)";
              return (
                <Tooltip key={range} title={rangeLabel}>
                  <Box
                    onClick={() =>
                      onSeverityRangeSelect?.(isSelected ? null : range)
                    }
                    sx={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      border: isSelected
                        ? "2px solid #1C1917"
                        : "1px solid #D6D3D1",
                      p: 0,
                      boxSizing: "border-box",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.18)",
                    }}
                  >
                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "inherit",
                        backgroundColor:
                          getSeverityColor?.(severityForColor) || "neutral.500",
                      }}
                    />
                  </Box>
                </Tooltip>
              );
            })}
          </Box>
        </Box>
        <Box
          sx={{
            marginTop: 0.5,
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 0.5,
            mb: 1.5,
          }}
        >
          {/* "All" chip to reset the filter */}
          <Box
            onClick={() => onCheckTypeSelect?.(null)}
            sx={{
              display: "flex",
              alignItems: "center",
              fontSize: "11px",
              mr: 0.25,
              mb: 0.5,
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                px: 1.5,
                py: 0.25,
                borderRadius: 2,
                backgroundColor:
                  selectedCheckType === null ? CHECK_ICON_COLOR : "#FFFFFF",
                border: `1px solid ${selectedCheckType === null ? CHECK_ICON_COLOR : "#D6D3D1"}`,
                transition: "background-color 0.15s, color 0.15s",
                "&:hover": {
                  backgroundColor:
                    selectedCheckType === null
                      ? CHECK_ICON_COLOR
                      : "rgba(28,25,23,0.06)",
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: "11px",
                  fontWeight: 400,
                  color:
                    selectedCheckType === null ? "#FFFFFF" : CHECK_ICON_COLOR,
                }}
              >
                All
              </Typography>
            </Box>
          </Box>

          {/* Task chips — search only filters issue cards below */}
          {tasks.map((taskProgress) => {
            const displayName =
              TASK_DISPLAY_NAMES[taskProgress.task] || taskProgress.task;
            const isLoading =
              taskProgress.status === "loading" ||
              taskProgress.status === "pending";
            const isCompleted = taskProgress.status === "completed";
            const isError = taskProgress.status === "error";
            const isSelected = selectedCheckType === taskProgress.task;

            const chip = (
              <Box
                key={taskProgress.task}
                onClick={() => {
                  if (!isCompleted || !onCheckTypeSelect) return;
                  onCheckTypeSelect(isSelected ? null : taskProgress.task);
                }}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "11px",
                  mr: 0.25,
                  mb: 0.5,
                  cursor: isCompleted ? "pointer" : "default",
                  userSelect: "none",
                }}
              >
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.5,
                    px: 1,
                    py: 0.25,
                    borderRadius: 2,
                    backgroundColor: isSelected
                      ? CHECK_ICON_COLOR
                      : isError
                        ? "#FDECEC"
                        : "#FFFFFF",
                    border: isLoading
                      ? "1px solid #D6D3D1"
                      : isError
                        ? "1px solid #DC5E5E"
                        : `1px solid ${isSelected ? CHECK_ICON_COLOR : "#D6D3D1"}`,
                    transition: "background-color 0.15s, color 0.15s",
                    "&:hover": isCompleted
                      ? {
                          backgroundColor: isSelected
                            ? CHECK_ICON_COLOR
                            : "rgba(28,25,23,0.06)",
                        }
                      : {},
                  }}
                >
                  {/* Status icon: grey spinner while loading, red error when failed, blue check when done */}
                  {isLoading ? (
                    <CircularProgress
                      size={10}
                      sx={{ color: "neutral.500", mr: 0.25 }}
                    />
                  ) : isError ? (
                    <ErrorIcon
                      sx={{ color: "#DC5E5E", fontSize: 12, mr: 0.25 }}
                    />
                  ) : null}
                  {isError && onRetryTask ? (
                    <Tooltip title="Retry" placement="top">
                      <Box
                        component="span"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          onRetryTask(taskProgress.task);
                        }}
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          cursor: "pointer",
                          ml: 0.25,
                          color: "#DC5E5E",
                          "&:hover": { opacity: 0.85 },
                        }}
                      >
                        <IconRefresh size={12} />
                      </Box>
                    </Tooltip>
                  ) : null}
                  {!isLoading && !isError && (
                    <IconChecklist
                      size={14}
                      color={isSelected ? "#FFFFFF" : CHECK_ICON_COLOR}
                      style={{ marginRight: 2 }}
                    />
                  )}
                  <Typography
                    sx={{
                      fontSize: "11px",
                      color: isSelected
                        ? "#FFFFFF"
                        : isError
                          ? "#DC5E5E"
                          : isLoading
                            ? "neutral.700"
                            : CHECK_ICON_COLOR,
                    }}
                  >
                    {displayName}
                  </Typography>
                  {isCompleted && taskProgress.result && (
                    <Typography
                      sx={{
                        fontSize: "10px",
                        color: isSelected
                          ? "rgba(255,255,255,0.85)"
                          : CHECK_ICON_COLOR,
                        ml: 0.5,
                      }}
                    >
                      {taskProgress.result.issues?.length || 0}
                    </Typography>
                  )}
                </Box>
              </Box>
            );

            return isError && taskProgress.error ? (
              <Tooltip
                key={taskProgress.task}
                title={taskProgress.error}
                placement="top"
                enterDelay={300}
              >
                <span>{chip}</span>
              </Tooltip>
            ) : (
              chip
            );
          })}
        </Box>

        {/* Show API/Heroku error details when any task failed */}
        {errorCount > 0 && (
          <Box
            sx={{
              mt: 1,
              p: 1,
              borderRadius: 1,
              backgroundColor: "#FDECEC",
              border: "1px solid #F5C4C4",
            }}
          >
            <Typography
              sx={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#C04444",
                mb: 0.5,
              }}
            >
              Validation errors
            </Typography>
            {tasks
              .filter((t) => t.status === "error" && t.error)
              .map((t) => (
                <Box
                  key={t.task}
                  sx={{
                    mb: 0.5,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 0.5,
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: "10px",
                        fontWeight: 600,
                        color: "#9E3333",
                      }}
                    >
                      {TASK_DISPLAY_NAMES[t.task] || t.task}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "10px",
                        color: "#C04444",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        maxHeight: 120,
                        overflow: "auto",
                      }}
                      component="pre"
                    >
                      {t.error}
                    </Typography>
                  </Box>
                  {onRetryTask && (
                    <Tooltip title="Retry this task" placement="left">
                      <IconButton
                        size="small"
                        onClick={() => onRetryTask(t.task)}
                        sx={{
                          p: 0.25,
                          color: "#C04444",
                          "&:hover": {
                            backgroundColor: "rgba(192,68,68,0.08)",
                          },
                        }}
                      >
                        <IconRefresh size={16} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              ))}
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        backgroundColor: "neutral.100",
        border: "1px solid #D6D3D1",
        borderRadius: "8px",
        padding: 2,
        marginBottom: 2,
      }}
    >
      {/* Overall progress header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 2,
        }}
      >
        <Typography
          sx={{ fontSize: "14px", fontWeight: 600, color: "text.primary" }}
        >
          Validation Progress
        </Typography>
        <Typography sx={{ fontSize: "14px", color: "text.secondary" }}>
          {completedCount} of {totalTasks} completed
          {errorCount > 0 && ` • ${errorCount} failed`}
        </Typography>
      </Box>

      {/* Overall progress bar */}
      <LinearProgress
        variant="determinate"
        value={progressPercentage}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: "neutral.300",
          marginBottom: 2,
          "& .MuiLinearProgress-bar": {
            backgroundColor:
              isAllComplete && errorCount === 0 ? "#3D9A5C" : "#E86D5A",
          },
        }}
      />

      {/* Task list */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {tasks.map((taskProgress) => {
          const displayName =
            TASK_DISPLAY_NAMES[taskProgress.task] || taskProgress.task;

          return (
            <Box
              key={taskProgress.task}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                padding: 1,
                borderRadius: "4px",
                backgroundColor:
                  taskProgress.status === "completed"
                    ? "#EDF7F0"
                    : taskProgress.status === "error"
                      ? "#FDECEC"
                      : taskProgress.status === "loading"
                        ? "#FEF2F0"
                        : "#FFFFFF",
                border: `1px solid ${
                  taskProgress.status === "completed"
                    ? "#3D9A5C"
                    : taskProgress.status === "error"
                      ? "#DC5E5E"
                      : taskProgress.status === "loading"
                        ? "#E86D5A"
                        : "#D6D3D1"
                }`,
              }}
            >
              {/* Status icon */}
              <Box sx={{ display: "flex", alignItems: "center", minWidth: 24 }}>
                {taskProgress.status === "completed" && (
                  <CheckCircle sx={{ color: "#3D9A5C", fontSize: 20 }} />
                )}
                {taskProgress.status === "error" && (
                  <ErrorIcon sx={{ color: "#DC5E5E", fontSize: 20 }} />
                )}
                {taskProgress.status === "loading" && (
                  <CircularProgress size={16} sx={{ color: "#E86D5A" }} />
                )}
                {taskProgress.status === "pending" && (
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      backgroundColor: "neutral.300",
                    }}
                  />
                )}
              </Box>

              {/* Task name */}
              <Typography
                sx={{
                  fontSize: "13px",
                  fontWeight: taskProgress.status === "loading" ? 600 : 500,
                  color:
                    taskProgress.status === "error"
                      ? "#DC5E5E"
                      : "text.primary",
                  flex: 1,
                }}
              >
                {displayName}
              </Typography>

              {/* Issue count (if completed) */}
              {taskProgress.status === "completed" && taskProgress.result && (
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "text.secondary",
                    marginLeft: "auto",
                  }}
                >
                  {taskProgress.result.issues?.length || 0} issue
                  {taskProgress.result.issues?.length !== 1 ? "s" : ""}
                </Typography>
              )}

              {/* Error message (if error) — show full API/Heroku error */}
              {taskProgress.status === "error" && taskProgress.error && (
                <Typography
                  sx={{
                    fontSize: "11px",
                    color: "#DC5E5E",
                    flex: 1,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    maxWidth: "100%",
                    maxHeight: 100,
                    overflow: "auto",
                  }}
                  component="pre"
                >
                  {taskProgress.error}
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default TaskProgressBar;
