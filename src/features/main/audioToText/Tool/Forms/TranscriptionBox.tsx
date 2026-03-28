import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  IconButton,
  Divider,
  Chip,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  Autocomplete,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CancelIcon from "@mui/icons-material/Cancel";
import { useAtom } from "jotai";
import { audioToTextFormAtom } from "../../../../../atoms/audioToTextAtom";

// Helper function to parse markdown-style text and convert to React elements
const parseMarkdownText = (text: string): React.ReactNode[] => {
  if (!text) return [];

  const parts: React.ReactNode[] = [];
  let key = 0;

  // Split by line breaks
  const lines = text.split("\n");

  lines.forEach((line, lineIndex) => {
    if (lineIndex > 0) {
      parts.push(<br key={`br-${key++}`} />);
    }

    // Parse each line for inline formatting
    const parseLine = (lineText: string): React.ReactNode[] => {
      const lineParts: React.ReactNode[] = [];
      let lastIndex = 0;

      // Match **text** for bold
      const boldRegex = /\*\*(.+?)\*\*/g;
      let match;

      while ((match = boldRegex.exec(lineText)) !== null) {
        // Add text before the bold part
        if (match.index > lastIndex) {
          const beforeText = lineText.substring(lastIndex, match.index);
          lineParts.push(beforeText);
        }

        // Add bold text
        lineParts.push(
          <strong key={`bold-${key++}`} style={{ fontWeight: 600 }}>
            {match[1]}
          </strong>,
        );

        lastIndex = match.index + match[0].length;
      }

      // Add remaining text in the line
      if (lastIndex < lineText.length) {
        lineParts.push(lineText.substring(lastIndex));
      }

      return lineParts;
    };

    // Parse the line and add to parts
    const parsedLine = parseLine(line);
    parts.push(...parsedLine);
  });

  return parts;
};

type TranscriptSegment = {
  timestamp: string;
  timestampSeconds: number;
  speaker: string;
  text: string;
};

type TranscriptData = {
  segments: TranscriptSegment[];
  fullText: string;
};

type TranscriptBoxProps = {
  transcript: string | TranscriptData;
  resetKey?: string | number;
  transcriptionOptions?: {
    provideSummary: boolean;
    includeTimestamps: boolean;
    includeSpeakerIdentifier: boolean;
  };
};

const TranscriptBox: React.FC<TranscriptBoxProps> = ({
  transcript,
  resetKey,
  transcriptionOptions = {
    provideSummary: false,
    includeTimestamps: false,
    includeSpeakerIdentifier: false,
  },
}) => {
  const [audioToTextFormValues, setAudioToTextFormValues] =
    useAtom(audioToTextFormAtom);
  const [viewMode, setViewMode] = useState<"segmented" | "full" | "summary">(
    "segmented",
  );
  const [editingSpeaker, setEditingSpeaker] = useState<string | null>(null);
  const [speakerEdits, setSpeakerEdits] = useState<Record<string, string>>({});
  const [currentEditValue, setCurrentEditValue] = useState<string>("");
  const [segmentSpeakerReassignments, setSegmentSpeakerReassignments] =
    useState<Record<number, string>>({});
  const [newSpeakers, setNewSpeakers] = useState<string[]>([]);
  const [editingSegmentIndex, setEditingSegmentIndex] = useState<number | null>(
    null,
  );
  const [segmentEditValue, setSegmentEditValue] = useState<string>("");
  const [editingTextGroupIndex, setEditingTextGroupIndex] = useState<
    number | null
  >(null);
  const [segmentTextEditValue, setSegmentTextEditValue] = useState<string>("");
  const [segmentTextEdits, setSegmentTextEdits] = useState<
    Record<number, string>
  >({});

  // Sync edits to atom whenever they change
  useEffect(() => {
    setAudioToTextFormValues((prev) => ({
      ...prev,
      transcriptEdits: {
        speakerEdits,
        segmentTextEdits,
        segmentSpeakerReassignments,
      },
    }));
  }, [
    speakerEdits,
    segmentTextEdits,
    segmentSpeakerReassignments,
    setAudioToTextFormValues,
  ]);

  // Reset all state when resetKey changes or when transcript changes from empty to non-empty or vice versa
  useEffect(() => {
    // Reset all editing states
    setEditingSpeaker(null);
    setSpeakerEdits({});
    setCurrentEditValue("");
    setSegmentSpeakerReassignments({});
    setNewSpeakers([]);
    setEditingSegmentIndex(null);
    setSegmentEditValue("");
    setEditingTextGroupIndex(null);
    setSegmentTextEditValue("");
    setSegmentTextEdits({});
    setViewMode("segmented");
  }, [resetKey]); // Only reset when resetKey changes explicitly

  // Reset view mode to segmented if provideSummary is false
  useEffect(() => {
    if (
      !transcriptionOptions.provideSummary &&
      (viewMode === "full" || viewMode === "summary")
    ) {
      setViewMode("segmented");
    }
  }, [transcriptionOptions.provideSummary, viewMode]);

  // Also reset when transcript changes from empty to non-empty or vice versa
  const prevTranscriptRef = useRef<string | TranscriptData | null>(null);
  useEffect(() => {
    const wasEmpty =
      !prevTranscriptRef.current ||
      (typeof prevTranscriptRef.current === "string" &&
        prevTranscriptRef.current === "") ||
      (typeof prevTranscriptRef.current === "object" &&
        !prevTranscriptRef.current.segments);
    const isEmpty =
      !transcript ||
      (typeof transcript === "string" && transcript === "") ||
      (typeof transcript === "object" && !transcript.segments);

    // If transcript changed from empty to non-empty or vice versa, reset
    if (wasEmpty !== isEmpty) {
      setEditingSpeaker(null);
      setSpeakerEdits({});
      setCurrentEditValue("");
      setSegmentSpeakerReassignments({});
      setNewSpeakers([]);
      setEditingSegmentIndex(null);
      setSegmentEditValue("");
      setEditingTextGroupIndex(null);
      setSegmentTextEditValue("");
      setSegmentTextEdits({});
      setViewMode("segmented");
    }

    prevTranscriptRef.current = transcript;
  }, [transcript]);

  const isSegmentedTranscript =
    typeof transcript === "object" && transcript?.segments;

  const transcriptData: TranscriptData | null = isSegmentedTranscript
    ? (transcript as TranscriptData)
    : null;

  const originalSpeakers = transcriptData
    ? Array.from(new Set(transcriptData.segments.map((s) => s.speaker)))
    : [];

  const resolveSpeakerName = (original: string) =>
    speakerEdits[original] || original;

  const speakers = useMemo(() => {
    const allSpeakers = [...originalSpeakers, ...newSpeakers];
    return Array.from(new Set(allSpeakers));
  }, [originalSpeakers, newSpeakers]);

  const speakerDisplayNames = useMemo(() => {
    return speakers.map((speaker) => resolveSpeakerName(speaker));
  }, [speakers, speakerEdits]);

  const getSegmentSpeaker = (segmentIndex: number, originalSpeaker: string) => {
    return segmentSpeakerReassignments[segmentIndex] || originalSpeaker;
  };

  const getSegmentText = (segmentIndex: number, originalText: string) => {
    return segmentTextEdits[segmentIndex] !== undefined
      ? segmentTextEdits[segmentIndex]
      : originalText;
  };

  const groupedSegments = transcriptData
    ? transcriptData.segments.reduce(
        (acc, segment, segmentIndex) => {
          const reassignedSpeaker = getSegmentSpeaker(
            segmentIndex,
            segment.speaker,
          );
          const displaySpeaker = resolveSpeakerName(reassignedSpeaker);
          const lastGroup = acc[acc.length - 1];

          // Check if this segment was reassigned (speaker changed)
          const isReassigned =
            segmentSpeakerReassignments[segmentIndex] !== undefined;

          // Check if the last segment in the last group was reassigned
          const lastSegmentIndex =
            lastGroup?.originalSegmentIndices[
              lastGroup.originalSegmentIndices.length - 1
            ];
          const lastWasReassigned =
            lastSegmentIndex !== undefined &&
            segmentSpeakerReassignments[lastSegmentIndex] !== undefined;

          // Check if the last segment in the last group and current segment were originally consecutive with the same original speaker
          const wasOriginallyConsecutive =
            lastSegmentIndex !== undefined &&
            segmentIndex === lastSegmentIndex + 1 &&
            transcriptData.segments[lastSegmentIndex].speaker ===
              segment.speaker;

          // Only group if:
          // 1. Same speaker as last group
          // 2. AND both segments were NOT reassigned
          // 3. AND they were originally consecutive with the same original speaker
          const shouldGroup =
            lastGroup &&
            lastGroup.speakerKey === reassignedSpeaker &&
            !isReassigned &&
            !lastWasReassigned &&
            wasOriginallyConsecutive;

          if (shouldGroup) {
            lastGroup.segments.push(segment);
            lastGroup.originalSegmentIndices.push(segmentIndex);
            lastGroup.endTime = segment.timestamp;
          } else {
            acc.push({
              speakerKey: reassignedSpeaker,
              speaker: displaySpeaker,
              startTime: segment.timestamp,
              endTime: segment.timestamp,
              segments: [segment],
              originalSegmentIndices: [segmentIndex],
            });
          }
          return acc;
        },
        [] as Array<{
          speakerKey: string;
          speaker: string;
          startTime: string;
          endTime: string;
          segments: TranscriptSegment[];
          originalSegmentIndices: number[];
        }>,
      )
    : [];

  // Clean up unused speakers when reassignments change
  useEffect(() => {
    if (!transcriptData) return;

    // Find all speakers currently in use
    const speakersInUse = new Set<string>();
    transcriptData.segments.forEach((segment, idx) => {
      const reassigned = segmentSpeakerReassignments[idx] || segment.speaker;
      speakersInUse.add(reassigned);
    });

    // Remove new speakers that are no longer in use
    setNewSpeakers((prev) => {
      return prev.filter((speaker) => speakersInUse.has(speaker));
    });
  }, [segmentSpeakerReassignments, transcriptData]);

  const getSpeakerColor = (speaker: string) => {
    const colors = [
      "#E86D5A",
      "#2e7d32",
      "#ed6c02",
      "#9c27b0",
      "#DC5E5E",
      "#0288d1",
      "#6d4c41",
    ];
    const index = speaker.charCodeAt(0) - 65;
    return colors[index % colors.length];
  };

  const startEditingSpeaker = (speaker: string) => {
    setEditingSpeaker(speaker);
    setCurrentEditValue(resolveSpeakerName(speaker));
  };

  const handleSegmentSpeakerChange = (
    groupIndex: number,
    newSpeaker: string,
  ) => {
    if (!transcriptData || !newSpeaker.trim()) return;

    const group = groupedSegments[groupIndex];
    if (!group) return;

    const trimmedSpeaker = newSpeaker.trim();

    // Find if this speaker name already exists (checking both original names and display names after edits)
    let existingSpeakerKey: string | null = null;

    // Check original speakers (and their edited names)
    for (const originalSpeaker of originalSpeakers) {
      const displayName = resolveSpeakerName(originalSpeaker);
      if (
        displayName === trimmedSpeaker ||
        originalSpeaker === trimmedSpeaker
      ) {
        existingSpeakerKey = originalSpeaker;
        break;
      }
    }

    // Check new speakers
    if (!existingSpeakerKey) {
      for (const newSpeakerKey of newSpeakers) {
        if (newSpeakerKey === trimmedSpeaker) {
          existingSpeakerKey = newSpeakerKey;
          break;
        }
      }
    }

    // If speaker doesn't exist, add it as a new speaker
    if (!existingSpeakerKey) {
      setNewSpeakers((prev) => {
        if (!prev.includes(trimmedSpeaker)) {
          return [...prev, trimmedSpeaker];
        }
        return prev;
      });
      existingSpeakerKey = trimmedSpeaker;
    }

    // Get the old speaker key for this group
    const oldSpeakerKey = group.speakerKey;

    // Reassign all segments in this group to the existing/new speaker key
    setSegmentSpeakerReassignments((prev) => {
      const updated = { ...prev };
      group.originalSegmentIndices.forEach((segmentIndex) => {
        updated[segmentIndex] = existingSpeakerKey!;
      });
      return updated;
    });

    setEditingSegmentIndex(null);
    setSegmentEditValue("");
  };

  const startEditingSegmentSpeaker = (groupIndex: number) => {
    const group = groupedSegments[groupIndex];
    setEditingSegmentIndex(groupIndex);
    setSegmentEditValue(group.speaker);
  };

  const startEditingSegmentText = (groupIndex: number) => {
    if (!transcriptData) return;
    const group = groupedSegments[groupIndex];
    if (!group) return;

    // Get the current text for all segments in this group
    const currentText = group.originalSegmentIndices
      .map((idx) => getSegmentText(idx, transcriptData.segments[idx].text))
      .join(" ");

    setEditingTextGroupIndex(groupIndex);
    setSegmentTextEditValue(currentText);
  };

  const handleSaveSegmentText = (groupIndex: number) => {
    if (!transcriptData || !segmentTextEditValue.trim()) return;

    const group = groupedSegments[groupIndex];
    if (!group) return;

    const editedText = segmentTextEditValue.trim();

    // Update all segments in the group with the edited text
    // Since segments are grouped by speaker, we'll update each segment in the group
    setSegmentTextEdits((prev) => {
      const updated = { ...prev };
      group.originalSegmentIndices.forEach((segmentIndex) => {
        updated[segmentIndex] = editedText;
      });
      return updated;
    });

    setEditingTextGroupIndex(null);
    setSegmentTextEditValue("");
  };

  const handleCancelSegmentTextEdit = () => {
    setEditingTextGroupIndex(null);
    setSegmentTextEditValue("");
  };

  // Compute full text from all segments with edits
  const computedFullText = useMemo(() => {
    if (!transcriptData) return "";

    return transcriptData.segments
      .map((segment, idx) => {
        const editedText = segmentTextEdits[idx];
        return editedText !== undefined ? editedText : segment.text;
      })
      .join(" ");
  }, [transcriptData, segmentTextEdits]);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5" fontWeight={600}>
          Transcription
        </Typography>
      </Box>

      {/* Speaker Summary */}
      {isSegmentedTranscript &&
        speakers.length > 0 &&
        transcriptionOptions.includeSpeakerIdentifier && (
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              Speakers Detected: {speakers.length}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {speakers.map((speaker) => {
                const color = getSpeakerColor(speaker);
                const displayName = resolveSpeakerName(speaker);
                const isEditing = editingSpeaker === speaker;

                return (
                  <Chip
                    key={speaker}
                    icon={<PersonIcon />}
                    label={
                      isEditing ? (
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <TextField
                            variant="standard"
                            value={currentEditValue}
                            onChange={(e) =>
                              setCurrentEditValue(e.target.value)
                            }
                            size="small"
                            autoFocus
                            sx={{
                              width: 100,
                              "& input": { fontSize: 13, p: 0.3 },
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                setSpeakerEdits({
                                  ...speakerEdits,
                                  [speaker]: currentEditValue || speaker,
                                });
                                setEditingSpeaker(null);
                              }
                            }}
                          />
                          <IconButton
                            size="small"
                            sx={{ ml: 0.5 }}
                            onClick={() => {
                              setSpeakerEdits({
                                ...speakerEdits,
                                [speaker]: currentEditValue || speaker,
                              });
                              setEditingSpeaker(null);
                            }}
                          >
                            <CheckIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <Typography sx={{ fontWeight: 500 }}>
                            {displayName}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => startEditingSpeaker(speaker)}
                            sx={{
                              p: 0.2,
                              "&:hover": { bgcolor: "transparent" },
                            }}
                          >
                            <EditIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Box>
                      )
                    }
                    size="small"
                    sx={{
                      bgcolor: `${color}20`,
                      color: color,
                      fontWeight: 500,
                      borderRadius: "8px",
                    }}
                  />
                );
              })}
            </Box>
          </Box>
        )}
      {isSegmentedTranscript && transcriptionOptions.provideSummary && (
        <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, newMode) => {
              if (newMode) setViewMode(newMode);
            }}
            size="small"
            sx={{
              backgroundColor: "neutral.200",
              borderRadius: 2,
              "& .MuiToggleButton-root": {
                textTransform: "none",
                fontWeight: 500,
                border: "none",
                borderRadius: 2,
                px: 2,
                py: 0.8,
                transition: "all 0.2s",
              },
              "& .Mui-selected": {
                backgroundColor: "primary.main",
                color: "#fff",
                "&:hover": {
                  backgroundColor: "primary.dark",
                },
              },
            }}
          >
            <ToggleButton value="segmented">Segmented View</ToggleButton>
            <ToggleButton value="full">Full Text</ToggleButton>
            <ToggleButton value="summary">Summary</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      )}

      <Divider sx={{ mb: 2 }} />

      {/* Transcript Content */}
      <Box sx={{ maxHeight: "60vh", overflowY: "auto", pr: 1 }}>
        {!isSegmentedTranscript ? (
          <Typography sx={{ whiteSpace: "pre-wrap", fontSize: 14 }}>
            {typeof transcript === "string"
              ? transcript
              : "No transcript available."}
          </Typography>
        ) : viewMode === "summary" && transcriptionOptions.provideSummary ? (
          <Typography
            sx={{
              whiteSpace: "pre-wrap",
              fontSize: 14,
              lineHeight: 1.8,
              color:
                !audioToTextFormValues.summary ||
                audioToTextFormValues.summary.includes("couldn't find") ||
                audioToTextFormValues.summary.includes("feel free to upload")
                  ? "text.secondary"
                  : "text.primary",
            }}
          >
            {audioToTextFormValues.summary &&
            !audioToTextFormValues.summary.includes("couldn't find") &&
            !audioToTextFormValues.summary.includes("feel free to upload")
              ? parseMarkdownText(audioToTextFormValues.summary)
              : "Summary is being generated... This may take a few moments."}
          </Typography>
        ) : viewMode === "full" && transcriptionOptions.provideSummary ? (
          <Typography
            sx={{ whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.8 }}
          >
            {computedFullText ||
              transcriptData?.fullText ||
              "No transcript available."}
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {groupedSegments.map((group, idx) => {
              const color = getSpeakerColor(group.speakerKey);
              return (
                <Paper
                  key={idx}
                  elevation={0}
                  sx={{
                    p: 2,
                    borderLeft: `4px solid ${color}`,
                    bgcolor: `${color}08`,
                    transition: "all 0.2s",
                    "&:hover": {
                      bgcolor: `${color}15`,
                      transform: "translateX(4px)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {transcriptionOptions.includeSpeakerIdentifier && (
                        <PersonIcon sx={{ fontSize: 18, color }} />
                      )}
                      {transcriptionOptions.includeSpeakerIdentifier &&
                      editingSegmentIndex === idx ? (
                        <Autocomplete
                          freeSolo
                          options={speakerDisplayNames}
                          inputValue={segmentEditValue}
                          onInputChange={(_, newInputValue) => {
                            setSegmentEditValue(newInputValue);
                          }}
                          onChange={(_, newValue) => {
                            if (typeof newValue === "string") {
                              handleSegmentSpeakerChange(idx, newValue);
                            } else if (newValue === null) {
                              setSegmentEditValue("");
                            }
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              variant="standard"
                              size="small"
                              autoFocus
                              sx={{
                                width: 120,
                                "& input": { fontSize: 13, p: 0.3 },
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleSegmentSpeakerChange(
                                    idx,
                                    segmentEditValue,
                                  );
                                }
                                if (e.key === "Escape") {
                                  setEditingSegmentIndex(null);
                                  setSegmentEditValue("");
                                }
                              }}
                            />
                          )}
                          sx={{ minWidth: 120 }}
                        />
                      ) : transcriptionOptions.includeSpeakerIdentifier ? (
                        <Typography
                          variant="subtitle2"
                          fontWeight={600}
                          sx={{ color }}
                        >
                          {group.speaker}
                        </Typography>
                      ) : null}
                      {transcriptionOptions.includeSpeakerIdentifier &&
                        (editingSegmentIndex === idx ? (
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleSegmentSpeakerChange(idx, segmentEditValue)
                            }
                            sx={{
                              p: 0.2,
                              "&:hover": { bgcolor: "transparent" },
                            }}
                          >
                            <CheckIcon sx={{ fontSize: 14, color }} />
                          </IconButton>
                        ) : (
                          <IconButton
                            size="small"
                            onClick={() => startEditingSegmentSpeaker(idx)}
                            sx={{
                              p: 0.2,
                              "&:hover": { bgcolor: "transparent" },
                            }}
                          >
                            <EditIcon sx={{ fontSize: 14, color }} />
                          </IconButton>
                        ))}
                    </Box>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      {transcriptionOptions.includeTimestamps && (
                        <>
                          <AccessTimeIcon
                            sx={{ fontSize: 16, color: "text.secondary" }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {group.startTime}
                            {group.startTime !== group.endTime &&
                              ` - ${group.endTime}`}
                          </Typography>
                        </>
                      )}
                      {editingTextGroupIndex === idx ? (
                        <>
                          <IconButton
                            size="small"
                            onClick={() => handleSaveSegmentText(idx)}
                            sx={{
                              p: 0.2,
                              "&:hover": { bgcolor: "transparent" },
                            }}
                          >
                            <CheckIcon
                              sx={{ fontSize: 14, color: "text.secondary" }}
                            />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={handleCancelSegmentTextEdit}
                            sx={{
                              p: 0.2,
                              "&:hover": { bgcolor: "transparent" },
                            }}
                          >
                            <CancelIcon
                              sx={{ fontSize: 14, color: "text.secondary" }}
                            />
                          </IconButton>
                        </>
                      ) : (
                        <IconButton
                          size="small"
                          onClick={() => startEditingSegmentText(idx)}
                          sx={{
                            p: 0.2,
                            "&:hover": { bgcolor: "transparent" },
                          }}
                        >
                          <EditIcon
                            sx={{ fontSize: 14, color: "text.secondary" }}
                          />
                        </IconButton>
                      )}
                    </Box>
                  </Box>
                  {editingTextGroupIndex === idx ? (
                    <Box sx={{ mt: 1, width: "100%" }}>
                      <TextField
                        multiline
                        fullWidth
                        value={segmentTextEditValue}
                        onChange={(e) =>
                          setSegmentTextEditValue(e.target.value)
                        }
                        variant="outlined"
                        size="small"
                        autoFocus
                        minRows={10}
                        maxRows={10}
                        sx={{
                          width: "100%",
                          "& .MuiOutlinedInput-root": {
                            fontSize: 14,
                            lineHeight: 1.7,
                            color: "text.primary",
                            backgroundColor: "background.paper",
                            alignItems: "flex-start",
                            padding: "0 !important",
                            overflow: "hidden",
                            display: "flex",
                            flexDirection: "column",
                            "& fieldset": {
                              borderColor: "rgba(0, 0, 0, 0.12)",
                              borderWidth: "1px",
                            },
                            "&:hover fieldset": {
                              borderColor: "rgba(0, 0, 0, 0.23)",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "primary.main",
                              borderWidth: "2px",
                            },
                            "& .MuiOutlinedInput-input": {
                              padding: "12px 14px !important",
                              boxSizing: "border-box",
                              wordWrap: "break-word",
                              overflowWrap: "break-word",
                              whiteSpace: "pre-wrap",
                              width: "100%",
                              resize: "none",
                              overflow: "visible",
                            },
                            "& textarea": {
                              padding: "12px 14px !important",
                              boxSizing: "border-box",
                              wordWrap: "break-word",
                              overflowWrap: "break-word",
                              whiteSpace: "pre-wrap",
                              width: "100% !important",
                              minHeight: "60px",
                              margin: "0 !important",
                              overflow: "visible",
                              display: "block",
                              height: "auto",
                              lineHeight: "1.7",
                              verticalAlign: "top",
                              resize: "none",
                            },
                          },
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && e.ctrlKey) {
                            handleSaveSegmentText(idx);
                          }
                          if (e.key === "Escape") {
                            handleCancelSegmentTextEdit();
                          }
                        }}
                      />
                    </Box>
                  ) : (
                    <Typography
                      sx={{
                        fontSize: 14,
                        lineHeight: 1.7,
                        color: "text.primary",
                      }}
                    >
                      {transcriptData
                        ? group.originalSegmentIndices
                            .map((idx) =>
                              getSegmentText(
                                idx,
                                transcriptData.segments[idx].text,
                              ),
                            )
                            .join(" ")
                        : ""}
                    </Typography>
                  )}
                </Paper>
              );
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default TranscriptBox;
