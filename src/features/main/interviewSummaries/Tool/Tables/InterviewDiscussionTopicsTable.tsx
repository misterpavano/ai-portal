import {
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
} from "@mui/material";
import Box from "@mui/material/Box";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import { ChangeEvent, useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import Skeleton from "../../../../../components/layouts/Skeleton";
import { DiscussionTopicsFormValues } from "../../../../../types/interviewSummaries";

export type DiscussionFlowTableProps = {
  sections: DiscussionTopicsFormValues[];
  deleteSection: (index: number) => void;
  updateSection: (index: number, field: string, value: string) => void;
  onAddSection: (newSection: DiscussionTopicsFormValues) => void;
  moveSection: (dragIndex: number, hoverIndex: number) => void;
  isLoading: boolean;
};

const ItemType = "SECTION";

type DraggableRowProps = {
  section: DiscussionTopicsFormValues;
  index: number;
  deleteSection: (index: number) => void;
  updateSection: (index: number, field: string, value: string) => void;
  moveSection: (dragIndex: number, hoverIndex: number) => void;
  hoverIndex: number | null;
  setHoverIndex: (index: number | null) => void;
};

interface ContentEditableProps {
  html: string;
  onChange: (newValue: string) => void;
  style?: React.CSSProperties;
}

const ContentEditable: React.FC<ContentEditableProps> = ({
  html,
  onChange,
  style,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleInput = (event: ChangeEvent<HTMLDivElement>) => {
    onChange(event.target.innerText);
  };

  return (
    <Box
      ref={contentRef}
      contentEditable
      dangerouslySetInnerHTML={{ __html: html }}
      onBlur={handleInput}
      style={style}
    />
  );
};

const DraggableRow = ({
  section,
  index,
  deleteSection,
  updateSection,
  moveSection,
  setHoverIndex,
}: DraggableRowProps) => {
  const ref = useRef<HTMLTableRowElement>(null);

  const [, drop] = useDrop({
    accept: ItemType,
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveSection(item.index, index);
        item.index = index;
      }
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <TableRow
      ref={ref}
      sx={{
        backgroundColor: "#fff",
        opacity: isDragging ? 0.5 : 1,
      }}
      onMouseEnter={() => setHoverIndex(index)}
      onMouseLeave={() => setHoverIndex(null)}
    >
      <TableCell
        sx={{
          borderBottom: "1px solid #d7d5d5",
          whiteSpace: "normal",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "200px",
          wordWrap: "break-word",
        }}
      >
        <Tooltip title={section.topics || ""}>
          <Box
            sx={{
              display: "block",
              fontSize: "14px",
              outline: "none",
              borderRadius: "4px",
              "&:hover": {
                border: `1px solid #fbbebe`,
                boxShadow: "0 0 0 2px #feeaeb",
                padding: "2px",
              },
              "&:focus-within": {
                border: `1px solid #fbbebe`,
                boxShadow: "0 0 0 2px #feeaeb",
                padding: "2px",
              },
            }}
          >
            <ContentEditable
              html={section.topics || ""}
              onChange={(newValue) => updateSection(index, "topics", newValue)}
              style={{
                fontSize: "14px",
                outline: "none",
                display: "inline-block",
                wordWrap: "break-word",
                whiteSpace: "pre-wrap",
                padding: "2px",
              }}
            />
          </Box>
        </Tooltip>
      </TableCell>
      <TableCell
        sx={{
          borderBottom: "1px solid #d7d5d5",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          flex: 1,
        }}
      >
        <Box
          sx={{
            display: "inline-block",
            fontSize: "14px",
            outline: "none",
            borderRadius: "4px",
            "&:hover": {
              border: `1px solid #fbbebe`,
              boxShadow: "0 0 0 2px #feeaeb",
              padding: "2px",
            },
            "&:focus-within": {
              border: `1px solid #fbbebe`,
              boxShadow: "0 0 0 2px #feeaeb",
              padding: "2px",
            },
          }}
        ></Box>
      </TableCell>
      <TableCell
        sx={{
          borderBottom: "1px solid #d7d5d5",
          backgroundColor: "#fff",
          cursor: "pointer",
        }}
      >
        <IconButton
          onClick={() => deleteSection(index)}
          id="minus_button"
          className="minus_topic_button"
        >
          <Box
            sx={{
              borderRadius: 50,
              justifyContent: "center",
              alignItems: "center",
              width: 12,
              height: 12,
              border: "1.5px solid black",
              display: "flex",
            }}
          >
            <IconMinus size={15} />
          </Box>
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

const InterviewDiscussionTopicsTable = ({
  sections,
  deleteSection,
  updateSection,
  moveSection,
  onAddSection,
  isLoading,
}: DiscussionFlowTableProps) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [newTopic, setNewTopic] = useState("");

  // Function to clean topic text by removing bullet points and other symbols
  const cleanTopic = (text: string): string => {
    if (!text) return "";

    // Remove all bullet point and list marker characters from anywhere in the text
    let cleaned = text
      // Step 1: Remove ALL bullet/list marker Unicode characters from anywhere in the string
      .replace(
        /[\u2022\u25E6\u25AA\u25AB\u25CF\u2023\u2043\u2219\u00B7\u25CB\u25C6\u25A0\u25A1\u25B6\u25C0\u25B8\u25C2\u2192\u2190\u2191\u2193\u25BA\u25C4\u25BC\u25B2\u25BE\u2024\u2025\u2026\u2047\u2048\u2049]/g,
        "",
      )
      // Step 2: Remove common bullet characters (including the one user mentioned: •)
      .replace(/[•◦▪▫●○■□▲△▼▽◆◇]/g, "")
      // Step 3: Remove any leading formatting characters (bullets, dashes, asterisks, arrows, whitespace variants)
      .replace(
        /^[\s\u00A0\u2000-\u200B\u2028\u2029\uFEFF\-*•◦▪▫→←\u2013\u2014\u2212]+/g,
        "",
      )
      // Step 4: Remove any trailing formatting characters
      .replace(
        /[\s\u00A0\u2000-\u200B\u2028\u2029\uFEFF\-*•◦▪▫→←\u2013\u2014\u2212]+$/g,
        "",
      )
      // Step 5: Remove any remaining non-alphanumeric characters at start (keep letters, numbers, accented chars, and basic punctuation)
      .replace(
        /^[^\w\u00C0-\u017F\u00C0-\u024F\u0400-\u04FF.,!?;:()\[\]{}'"]+/g,
        "",
      )
      // Step 6: Remove any remaining non-alphanumeric characters at end
      .replace(
        /[^\w\u00C0-\u017F\u00C0-\u024F\u0400-\u04FF.,!?;:()\[\]{}'"]+$/g,
        "",
      )
      // Step 7: Final trim
      .trim();

    return cleaned;
  };

  const normalizeAndSplitTopics = (text: string): string[] => {
    if (!text) return [];

    const normalized = text
      // normalize weird unicode spacing
      .replace(/[\u00A0\u200B\u2007\u202F]/g, " ")
      // normalize Word / Slack bullet variants into newlines
      .replace(
        /\s*[•\uF0B7\u2022\u25E6\u2023\u2043\u2219\u00B7\u25CF\u25CB\u25AA\u25AB\u25A0\u25A1\u25B6\u25C0\u25BA\u25C4]\s*/g,
        "\n",
      )
      // normalize real newlines
      .replace(/\r\n/g, "\n")
      .replace(/\n+/g, "\n");

    return normalized
      .split("\n")
      .map((line) => cleanTopic(line))
      .filter(Boolean);
  };

  const handlePaste = (event: React.ClipboardEvent) => {
    event.preventDefault();
    const pastedText = event.clipboardData.getData("text");

    // Parse the pasted text into multiple topics
    const normalized = pastedText
      // normalize weird unicode spacing
      .replace(/[\u00A0\u200B\u2007\u202F]/g, " ")
      // normalize Word / Slack bullet variants into newlines
      .replace(
        /\s*[•\uF0B7\u2022\u25E6\u2023\u2043\u2219\u00B7\u25CF\u25CB\u25AA\u25AB\u25A0\u25A1\u25B6\u25C0\u25BA\u25C4]\s*/g,
        "\n",
      )
      // normalize real newlines
      .replace(/\r\n/g, "\n")
      .replace(/\n+/g, "\n");
    const splitLines = normalized.split("\n");
    const topics = normalizeAndSplitTopics(pastedText);
    console.log("Pasted topics split debug:", {
      normalized,
      splitLines,
      topics,
    });

    if (topics.length > 0) {
      // Add all topics at once
      topics.forEach((topic) => {
        onAddSection({
          topics: topic,
          maxWordCountPerTopic: "8",
          sections: [],
        });
      });
      // Clear the input field after adding all topics
      setNewTopic("");
    }
  };

  const handleAddSection = () => {
    if (newTopic.trim()) {
      // Check if the input contains multiple lines (manually typed)
      const topics = normalizeAndSplitTopics(newTopic);

      if (topics.length > 0) {
        // Add all topics at once
        topics.forEach((topic) => {
          onAddSection({
            topics: topic,
            maxWordCountPerTopic: "8",
            sections: [],
          });
        });
        setNewTopic("");
      }
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Table
        sx={{
          backgroundColor: "#F5F5F4",
          borderTop: isLoading ? "" : "1px solid #d7d5d5",
        }}
      >
        {!isLoading && (
          <TableHead>
            <TableRow
              sx={{
                borderBottom: "1px solid #d7d5d5",
              }}
            >
              <TableCell
                sx={{
                  fontWeight: "bold",
                  textAlign: "left",
                  borderBottom: "1px solid #d7d5d5",
                }}
              >
                Topics
              </TableCell>
            </TableRow>
          </TableHead>
        )}
        <TableBody>
          {isLoading ? (
            <Box sx={{ padding: 2 }}>
              <Skeleton variant="text" width="100%" height={30} />
              <Skeleton variant="text" width="100%" height={80} />
              <Skeleton variant="text" width="100%" height={80} />
              <Skeleton variant="text" width="100%" height={80} />
            </Box>
          ) : (
            sections.map((section, index) => (
              <DraggableRow
                key={index}
                index={index}
                section={section}
                deleteSection={deleteSection}
                updateSection={updateSection}
                moveSection={moveSection}
                hoverIndex={hoverIndex}
                setHoverIndex={setHoverIndex}
              />
            ))
          )}
          {!isLoading && (
            <TableRow sx={{ backgroundColor: "#fff" }}>
              <TableCell sx={{ borderBottom: "none" }}>
                <TextField
                  variant="standard"
                  size="small"
                  multiline
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  onPaste={handlePaste}
                  placeholder="Add a topic (paste multiple topics separated by newlines)"
                  InputProps={{
                    disableUnderline: true,
                    sx: {
                      "&:hover": {
                        border: `1px solid #fbbebe`,
                        boxShadow: "0 0 0 2px #feeaeb",
                      },
                      "&:focus-within": {
                        border: `1px solid #fbbebe`,
                        boxShadow: "0 0 0 2px #feeaeb",
                      },
                      border: `1px solid #A8A29E`,
                      borderRadius: "10px",
                      width: "600px",
                      padding: "11px",
                    },
                  }}
                />
              </TableCell>
              <TableCell sx={{ borderBottom: "none" }}></TableCell>
              <TableCell sx={{ borderBottom: "none", textAlign: "flex-start" }}>
                <IconButton
                  onClick={handleAddSection}
                  id="plus_button"
                  className="plus_topic_button"
                >
                  <Box
                    sx={{
                      borderRadius: 50,
                      justifyContent: "center",
                      alignItems: "center",
                      width: 12,
                      height: 12,
                      border: "1.5px solid black",
                      display: "flex",
                    }}
                  >
                    <IconPlus size={15} />
                  </Box>
                </IconButton>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  );
};

export default InterviewDiscussionTopicsTable;
