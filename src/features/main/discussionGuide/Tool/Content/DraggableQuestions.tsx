import { useDrag, useDrop } from "react-dnd";
import {
  IconArrowsMove,
  IconCheck,
  IconMinus,
  IconPencil,
  IconX,
} from "@tabler/icons-react";
import { useRef, useState } from "react";
import { Box, TableCell, TableRow, Tooltip, Typography } from "@mui/material";
import ContentEditable from "react-contenteditable";
import { DiscussionTopicsFormValues } from "../../../../../types/discussionGuidesTypes";

type DraggableQuestionsProps = {
  section: DiscussionTopicsFormValues;
  questionItem: DiscussionTopicsFormValues["generatedAiQuestions"][number];
  index: number;
  sectionIndex: number;
  moveQuestion: (
    fromIndex: number,
    toIndex: number,
    sectionIndex: number
  ) => void;
  handleQuestionChange: (
    sectionIndex: number,
    questionIndex: number,
    newQuestion: string
  ) => void;
  handleDeleteQuestion: (section: string, questionIndex: number) => void;
  hoveredIndex: {
    sectionIndex: number | null;
    questionIndex: number | null;
    followUpIndex?: number | null;
  };
  handleMouseEnter: (sectionIndex: number, questionIndex: number) => void;
  handleMouseLeave: () => void;
  handleOpenFollowUpModal: (
    event: React.MouseEvent<HTMLElement>,
    sectionIndex: number,
    questionIndex: number
  ) => void;
  handleDeleteFollowUpQuestion: (
    sectionIndex: number,
    questionIndex: number,
    followUpIndex: number
  ) => void;
  handleChangeFollowUpQuestion: (
    sectionIndex: number,
    questionIndex: number,
    followUpIndex: number,
    newQuestion: string
  ) => void;
};

const DraggableQuestions = ({
  section,
  questionItem,
  index,
  sectionIndex,
  moveQuestion,
  handleQuestionChange,
  handleDeleteQuestion,
  hoveredIndex,
  handleMouseEnter,
  handleMouseLeave,
  handleOpenFollowUpModal,
  handleDeleteFollowUpQuestion,
  handleChangeFollowUpQuestion,
}: DraggableQuestionsProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<{
    sectionIndex: number;
    questionIndex: number;
    followUpIndex?: number;
  } | null>(null);
  const [tempQuestion, setTempQuestion] = useState("");

  const [{ isDragging }, drag] = useDrag({
    type: "QUESTION",
    item: { index, sectionIndex },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: "QUESTION",
    hover: (item: { index: number; sectionIndex: number }) => {
      if (item.index !== index) {
        moveQuestion(item.index, index, sectionIndex);
        item.index = index;
      }
    },
  });

  drag(drop(ref));

  const handleEdit = (
    event: React.MouseEvent,
    qIndex: number,
    followUpIndex?: number
  ) => {
    event.stopPropagation();
    setEditingQuestion({ sectionIndex, questionIndex: qIndex, followUpIndex });
    setTempQuestion(
      followUpIndex !== undefined
        ? questionItem.followUpQuestions[followUpIndex]
        : questionItem.question
    );
  };

  const isEditing = (qIndex: number, followUpIndex?: number) =>
    editingQuestion?.sectionIndex === sectionIndex &&
    editingQuestion?.questionIndex === qIndex &&
    editingQuestion?.followUpIndex === followUpIndex;

  const handleSave = (
    event: React.MouseEvent,
    qIndex: number,
    followUpIndex?: number
  ) => {
    event.stopPropagation();
    if (followUpIndex !== undefined) {
      handleChangeFollowUpQuestion(
        sectionIndex,
        qIndex,
        followUpIndex,
        tempQuestion
      );
    } else {
      handleQuestionChange(sectionIndex, qIndex, tempQuestion);
    }
    setEditingQuestion(null);
  };

  const handleCancel = (event: React.MouseEvent) => {
    event.stopPropagation();
    setTempQuestion("");
    setEditingQuestion(null);
  };

  return (
    <div ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }}>
      {/* Main question row - keeping the existing code */}
      <TableRow
        sx={{
          display: "flex",
          borderBottom: "1px solid #C0C5CD",
          backgroundColor: questionItem.followUpQuestions.length
            ? "#F4F4F4"
            : "",
          justifyContent: "space-between",
          alignItems: "center",
          overflow: "hidden",
          paddingLeft: "20px",
        }}
        onMouseEnter={() => handleMouseEnter(sectionIndex, index)}
        onMouseLeave={handleMouseLeave}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconArrowsMove size={15} style={{ cursor: "grab" }} />
          <Box
            sx={{
              display: "block",
              fontSize: "14px",
              alignItems: "center",
              justifyContent: "center",
              outline: "none",
              width: 600,
              borderRadius: "4px",
              height: "auto",
              ...(isEditing(index) && {
                border: `1px solid #fbbebe`,
                boxShadow: "0 0 0 2px #feeaeb",
                padding: "6px",
              }),
            }}
          >
            {isEditing(index) ? (
              <ContentEditable
                html={tempQuestion}
                onChange={(e) => setTempQuestion(e.target.value)}
                tagName="div"
                style={{
                  alignItems: "center",
                  fontSize: "14px",
                  fontWeight: "600",
                  padding: "4px 8px 0 8px",
                  outline: "none",
                }}
              />
            ) : (
              <div
                style={{
                  alignItems: "center",
                  fontSize: "14px",
                  fontWeight: "600",
                  padding: "4px 8px 0 8px",
                }}
              >
                {questionItem.question}
                {/* {hoveredIndex.sectionIndex === sectionIndex &&
                  hoveredIndex.questionIndex === index && ( */}
                <Tooltip title="Edit">
                  <IconPencil
                    size={16}
                    style={{ cursor: "pointer" }}
                    onClick={(e) => handleEdit(e, index)}
                  />
                </Tooltip>
                {/* )} */}
              </div>
            )}
          </Box>
        </Box>
        <Box
          onClick={(event) =>
            !questionItem.followUpQuestions.length
              ? handleOpenFollowUpModal(event, sectionIndex, index)
              : undefined
          }
          sx={{
            display: "flex",
            alignItems: "center",
            position: "relative",
            gap: 1,
          }}
        >
          {hoveredIndex.sectionIndex === sectionIndex &&
            hoveredIndex.questionIndex === index && (
              <>
                {!isEditing(index) ? (
                  <>
                    <Box>
                      <Typography
                        sx={{
                          fontSize: "14px",
                          textDecoration: "underline",
                          cursor: questionItem.followUpQuestions.length
                            ? "default"
                            : "pointer",
                          color: questionItem.followUpQuestions.length
                            ? "#9A9A9A"
                            : "primary.600",
                        }}
                      >
                        Followup questions
                      </Typography>
                    </Box>
                  </>
                ) : (
                  <>
                    <Tooltip title="Save changes">
                      <IconCheck
                        size={20}
                        style={{ cursor: "pointer", color: "green" }}
                        onClick={(e) => handleSave(e, index)}
                      />
                    </Tooltip>
                    <Tooltip title="Cancel editing">
                      <IconX
                        size={20}
                        style={{ cursor: "pointer", color: "red" }}
                        onClick={handleCancel}
                      />
                    </Tooltip>
                  </>
                )}
              </>
            )}
          {!isEditing(index) && (
            <TableCell
              sx={{ cursor: "pointer", borderBottom: "none" }}
              onClick={() => handleDeleteQuestion(section.topics, index)}
            >
              <Box
                sx={{
                  borderRadius: 50,
                  justifyContent: "center",
                  alignItems: "center",
                  width: 15,
                  height: 15,
                  border: "2px solid black",
                }}
              >
                <IconMinus size={15} />
              </Box>
            </TableCell>
          )}
        </Box>
      </TableRow>

      {/* Follow-up questions */}
      {(questionItem.followUpQuestions || []).map(
        (followUpQuestion, followUpIndex) => (
          <TableRow
            key={`follow-up-${index}-${followUpIndex}`}
            sx={{
              display: "flex",
              borderBottom: "1px solid #C0C5CD",
              justifyContent: "space-between",
              alignItems: "center",
              overflow: "hidden",
              paddingLeft: "40px",
            }}
            onMouseEnter={() => handleMouseEnter(sectionIndex, index)}
            onMouseLeave={handleMouseLeave}
          >
            <Box
              sx={{
                display: "block",
                fontSize: "14px",
                alignItems: "center",
                justifyContent: "center",
                outline: "none",
                width: 600,
                borderRadius: "4px",
                height: "auto",
                ...(isEditing(index, followUpIndex) && {
                  border: `1px solid #fbbebe`,
                  boxShadow: "0 0 0 2px #feeaeb",
                  padding: "6px",
                }),
              }}
            >
              {isEditing(index, followUpIndex) ? (
                <ContentEditable
                  html={tempQuestion}
                  onChange={(e) => setTempQuestion(e.target.value)}
                  tagName="div"
                  style={{
                    alignItems: "center",
                    fontSize: "14px",
                    padding: "4px 8px 0 8px",
                    outline: "none",
                  }}
                />
              ) : (
                <div
                  style={{
                    alignItems: "center",
                    fontSize: "14px",
                    padding: "4px 8px 0 8px",
                  }}
                >
                  {followUpQuestion}
                </div>
              )}
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {hoveredIndex.sectionIndex === sectionIndex &&
                hoveredIndex.questionIndex === index && (
                  <>
                    {!isEditing(index, followUpIndex) ? (
                      <IconPencil
                        size={20}
                        style={{ cursor: "pointer" }}
                        onClick={(e) => handleEdit(e, index, followUpIndex)}
                      />
                    ) : (
                      <>
                        <IconCheck
                          size={20}
                          style={{ cursor: "pointer", color: "green" }}
                          onClick={(e) => handleSave(e, index, followUpIndex)}
                        />
                        <IconX
                          size={20}
                          style={{ cursor: "pointer", color: "red" }}
                          onClick={handleCancel}
                        />
                      </>
                    )}
                  </>
                )}
              {!isEditing(index, followUpIndex) && (
                <TableCell sx={{ cursor: "pointer", borderBottom: "none" }}>
                  <Box
                    onClick={() =>
                      handleDeleteFollowUpQuestion(
                        sectionIndex,
                        index,
                        followUpIndex
                      )
                    }
                    sx={{
                      borderRadius: 50,
                      justifyContent: "center",
                      alignItems: "center",
                      width: 15,
                      height: 15,
                      border: "2px solid black",
                    }}
                  >
                    <IconMinus size={15} />
                  </Box>
                </TableCell>
              )}
            </Box>
          </TableRow>
        )
      )}
    </div>
  );
};

export default DraggableQuestions;
