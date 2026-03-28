import { ChangeEvent, useRef, useState } from "react";
import Box from "@mui/material/Box";
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
import { DiscussionTopicsFormValues } from "../../../../../../../types/discussionGuidesTypes";
import { useDrag, useDrop } from "react-dnd";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import Skeleton from "../../../../../../../components/layouts/Skeleton";

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
        >
          <ContentEditable
            html={section.numberOfQuestionsPerTopic || ""}
            onChange={(newValue) =>
              updateSection(index, "numberOfQuestionsPerTopic", newValue)
            }
            style={{
              fontSize: "14px",
              outline: "none",
              display: "inline-block",
              padding: "2px",
            }}
          />
        </Box>
      </TableCell>
      <TableCell
        sx={{
          borderBottom: "1px solid #d7d5d5",
          backgroundColor: "#fff",
          cursor: "pointer",
        }}
      >
        <IconButton onClick={() => deleteSection(index)}>
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

const DiscussionTopicsTable = ({
  sections,
  deleteSection,
  updateSection,
  moveSection,
  onAddSection,
  isLoading,
}: DiscussionFlowTableProps) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [newTopic, setNewTopic] = useState("");
  const [newNumberOfQuestion, setNewNumberOfQuestion] = useState("");

  const handleAddSection = () => {
    if (newTopic && newNumberOfQuestion) {
      onAddSection({
        topics: newTopic,
        numberOfQuestionsPerTopic: newNumberOfQuestion,
        generatedAiQuestions: [],
        sections: [],
      });
      setNewTopic("");
      setNewNumberOfQuestion("");
    }
  };

  return (
    <Box sx={{ width: "100%", marginBottom: 5 }}>
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
              <TableCell
                sx={{
                  fontWeight: "bold",
                  textAlign: "left",
                  borderBottom: "1px solid #d7d5d5",
                }}
              >
                Questions
              </TableCell>
              <TableCell
                sx={{
                  borderBottom: "1px solid #d7d5d5",
                }}
              />
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
                  placeholder="Add a topic"
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
                      width: "200px",
                      padding: "11px",
                    },
                  }}
                />
              </TableCell>
              <TableCell sx={{ borderBottom: "none" }}>
                <TextField
                  variant="standard"
                  size="small"
                  value={newNumberOfQuestion}
                  onChange={(e) => setNewNumberOfQuestion(e.target.value)}
                  placeholder="Add a number"
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
                      width: "200px",
                      padding: "11px",
                    },
                  }}
                />
              </TableCell>
              <TableCell sx={{ borderBottom: "none", textAlign: "flex-start" }}>
                <IconButton onClick={handleAddSection}>
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

export default DiscussionTopicsTable;
