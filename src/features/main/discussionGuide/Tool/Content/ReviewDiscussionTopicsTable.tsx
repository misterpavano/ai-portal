import Box from "@mui/material/Box";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
  TextField,
  IconButton,
  Tooltip,
} from "@mui/material";
import { DiscussionTopicsFormValues } from "../../../../../types/discussionGuidesTypes";
import {
  IconMinus,
  IconPlus,
  IconCheck,
  IconPencil,
  IconX,
} from "@tabler/icons-react";
import { useState } from "react";
import ContentEditable from "react-contenteditable";
import RegenerateDiscussionTopicsModal from "../Modals/RegenerateDiscussionTopicsModal";
import DeleteDiscussionTopicsModal from "../Modals/DeleteDiscussionTopicsModal";
import FollowUpQuestionsModal from "../Modals/FollowUpQuestionsModal";
import Skeleton from "../../../../../components/layouts/Skeleton";
import DraggableQuestions from "./DraggableQuestions";

export type ReviewDiscussionTopicsTableProps = {
  sections: DiscussionTopicsFormValues[];
  handleDeleteQuestion: (section: string, questionIndex: number) => void;
  handleDeleteTopic: (index: number) => void;
  handleRegenerateTopic: (topics: string, index: number, note?: string) => void;
  handleAddQuestion: (topics: string, question: string) => void;
  handleTopicChange: (index: number, newTopic: string) => void;
  handleQuestionChange: (
    sectionIndex: number,
    questionIndex: number,
    newQuestion: string
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
  sectionLoading: boolean[];
  setSectionLoading: (index: number, sectionLoading: boolean) => void;
};

const ReviewDiscussionTopicsTable = ({
  sections,
  handleDeleteQuestion,
  handleDeleteTopic,
  handleRegenerateTopic,
  handleAddQuestion,
  handleTopicChange,
  handleQuestionChange,
  handleDeleteFollowUpQuestion,
  handleChangeFollowUpQuestion,
  sectionLoading,
}: ReviewDiscussionTopicsTableProps) => {
  const [newQuestion, setNewQuestion] = useState<string[]>(
    sections.map(() => "")
  );
  const [notes, setNotes] = useState<string[]>(sections.map(() => ""));
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [followUpModalOpen, setFollowUpModalOpen] = useState<boolean>(false);
  const [currentTopicIndex, setCurrentTopicIndex] = useState<number | null>(
    null
  );
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number | null>(
    null
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<
    number | null
  >(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [hoveredIndex, setHoveredIndex] = useState<{
    sectionIndex: number | null;
    questionIndex: number | null;
    followUpIndex?: number | null;
  }>({ sectionIndex: null, questionIndex: null, followUpIndex: null });

  const handleInputChange = (index: number, value: string) => {
    const updatedQuestions = [...newQuestion];
    updatedQuestions[index] = value;
    setNewQuestion(updatedQuestions);
  };

  const handleNoteChange = (index: number, newNote: string) => {
    const updatedNotes = [...notes];
    updatedNotes[index] = newNote;
    setNotes(updatedNotes);
  };

  const handleAddQuestionClick = (topics: string, index: number) => {
    if (newQuestion[index].trim() !== "") {
      handleAddQuestion(topics, newQuestion[index]);
      handleInputChange(index, "");
    }
  };

  const handleOpenModal = (
    event: React.MouseEvent<HTMLElement>,
    index: number
  ) => {
    setCurrentTopicIndex(index);
    setAnchorEl(event.currentTarget);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setAnchorEl(null);
  };

  const handleOpenDeleteModal = (
    event: React.MouseEvent<HTMLElement>,
    index: number
  ) => {
    setCurrentTopicIndex(index);
    setAnchorEl(event.currentTarget);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setAnchorEl(null);
  };

  const handleOpenFollowUpModal = (
    event: React.MouseEvent<HTMLElement>,
    sectionIndex: number,
    questionIndex: number
  ) => {
    setCurrentSectionIndex(sectionIndex);
    setCurrentQuestionIndex(questionIndex);
    setAnchorEl(event.currentTarget);
    setFollowUpModalOpen(true);
  };

  const handleCloseFollowUpModal = () => {
    setFollowUpModalOpen(false);
    setAnchorEl(null);
  };

  const handleRegenerate = (note?: string) => {
    if (currentTopicIndex !== null) {
      handleRegenerateTopic(
        sections[currentTopicIndex].topics,
        currentTopicIndex,
        note
      );
      handleCloseModal();
    }
  };
  const handleMouseEnter = (
    sectionIndex: number,
    questionIndex: number,
    followUpIndex?: number
  ) => {
    setHoveredIndex({ sectionIndex, questionIndex, followUpIndex });
  };

  const handleMouseLeave = () => {
    setHoveredIndex({
      sectionIndex: null,
      questionIndex: null,
      followUpIndex: null,
    });
  };

  const moveQuestion = (
    fromIndex: number,
    toIndex: number,
    sectionIndex: number
  ) => {
    const updatedSections = [...sections];
    const [movedQuestion] = updatedSections[
      sectionIndex
    ].generatedAiQuestions.splice(fromIndex, 1);
    updatedSections[sectionIndex].generatedAiQuestions.splice(
      toIndex,
      0,
      movedQuestion
    );
    handleTopicChange(sectionIndex, updatedSections[sectionIndex].topics);
  };

  const handleEditStart = (content: string) => {
    setIsEditing(true);
    setEditedContent(content);
  };

  const handleEditComplete = (sectionIndex: number) => {
    handleTopicChange(sectionIndex, editedContent);
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditedContent("");
  };

  return (
    <Box sx={{ width: "100%", marginBottom: 5 }}>
      {sections.length === 0 ? (
        <Typography
          sx={{
            fontSize: "14px",
            fontWeight: 500,
            color: "text.secondary",
            textAlign: "start",
          }}
        >
          Sections were not added for this Discussion Topics
        </Typography>
      ) : (
        <>
          {sections.map((section, sectionIndex) => (
            <>
              <Box
                key={sectionIndex}
                sx={{
                  padding: "0 0 10px 0",
                  overflow: "hidden",
                  backgroundColor: "#E7E5E4",
                  height: "40px",
                  borderTop: "1px solid #D0D5DD ",
                }}
              >
                <Table>
                  <TableBody>
                    <TableRow
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderRadius: "10px",
                        overflow: "hidden",
                        "&:hover .edit-actions": {
                          opacity: 1,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          position: "relative",
                        }}
                      >
                        <Box
                          sx={{
                            display: "inline-block",
                            fontSize: "14px",
                            outline: "none",
                            borderRadius: "4px",
                            minWidth: "100px",
                            maxWidth: "fit-content",
                            position: "relative",
                            pr: "28px", // Add padding-right to accommodate the icon
                            ...(isEditing && {
                              border: `1px solid #fbbebe`,
                              boxShadow: "0 0 0 2px #feeaeb",
                            }),
                          }}
                        >
                          {isEditing ? (
                            <ContentEditable
                              html={editedContent}
                              onChange={(e) => setEditedContent(e.target.value)}
                              tagName="div"
                              style={{
                                alignItems: "center",
                                fontSize: "14px",
                                fontWeight: "bold",
                                padding: "4px 8px",
                                outline: "none",
                                whiteSpace: "nowrap",
                                minWidth: "100px",
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                alignItems: "center",
                                fontSize: "14px",
                                fontWeight: "bold",
                                padding: "4px 8px",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {section.topics}
                            </div>
                          )}
                          {isEditing ? (
                            <Box
                              className="edit-actions"
                              sx={{
                                position: "absolute",
                                right: -52,
                                top: "50%",
                                transform: "translateY(-50%)",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              <Tooltip title="Save changes">
                                <IconCheck
                                  size={20}
                                  style={{ cursor: "pointer", color: "green" }}
                                  onClick={() =>
                                    handleEditComplete(sectionIndex)
                                  }
                                />
                              </Tooltip>
                              <Tooltip title="Cancel editing">
                                <IconX
                                  size={20}
                                  style={{ cursor: "pointer", color: "red" }}
                                  onClick={handleEditCancel}
                                />
                              </Tooltip>
                            </Box>
                          ) : (
                            <Box
                              className="edit-actions"
                              sx={{
                                position: "absolute",
                                right: 4,
                                top: "50%",
                                transform: "translateY(-50%)",
                                opacity: 0,
                                transition: "opacity 0.2s ease-in-out",
                              }}
                            >
                              <Tooltip title="Edit topic">
                                <IconPencil
                                  size={16}
                                  style={{ cursor: "pointer" }}
                                  onClick={() =>
                                    handleEditStart(section.topics)
                                  }
                                />
                              </Tooltip>
                            </Box>
                          )}
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <TableCell
                          sx={{ cursor: "pointer", borderBottom: "none" }}
                          onClick={(event) =>
                            handleOpenModal(event, sectionIndex)
                          }
                        >
                          <Typography
                            sx={{
                              fontSize: "14px",
                              textDecoration: "underline",
                              cursor: "pointer",
                              color: "primary.600",
                            }}
                          >
                            Regenerate
                          </Typography>
                        </TableCell>
                        <TableCell
                          sx={{ cursor: "pointer", borderBottom: "none" }}
                          onClick={(event) =>
                            handleOpenDeleteModal(event, sectionIndex)
                          }
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
                      </Box>
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>
              {sectionLoading[sectionIndex] ? (
                <>
                  <Box sx={{ marginBottom: 4 }}>
                    <Skeleton variant="text" width="100%" height={80} />
                    <Skeleton variant="text" width="100%" height={80} />
                    <Skeleton variant="text" width="100%" height={80} />
                    <Skeleton variant="text" width="100%" height={80} />
                  </Box>
                </>
              ) : (
                <Box
                  sx={{
                    overflow: "hidden",
                    height: "auto",

                    borderTop: "1px solid #C0C5CD",
                    marginBottom: "60px",
                  }}
                >
                  {(section.generatedAiQuestions || []).map(
                    (questionItem, questionIndex) => (
                      <DraggableQuestions
                        section={section}
                        key={`question-${sectionIndex}-${questionIndex}`}
                        questionItem={questionItem}
                        index={questionIndex}
                        sectionIndex={sectionIndex}
                        moveQuestion={moveQuestion}
                        handleQuestionChange={handleQuestionChange}
                        handleDeleteQuestion={handleDeleteQuestion}
                        hoveredIndex={hoveredIndex}
                        handleMouseEnter={handleMouseEnter}
                        handleMouseLeave={handleMouseLeave}
                        handleOpenFollowUpModal={handleOpenFollowUpModal}
                        handleDeleteFollowUpQuestion={
                          handleDeleteFollowUpQuestion
                        }
                        handleChangeFollowUpQuestion={
                          handleChangeFollowUpQuestion
                        }
                      />
                    )
                  )}
                  <TableRow
                    sx={{
                      display: "flex",
                      borderRadius: "10px",
                      overflow: "hidden",
                    }}
                  >
                    <TableCell
                      sx={{
                        marginTop: 2,
                        marginBottom: 1,
                        marginLeft: -2,
                        alignItems: "center",
                        display: "flex",
                        borderBottom: "none",
                        width: "100%",
                        paddingTop: "10px",
                        paddingBottom: "10px",
                      }}
                    >
                      <TextField
                        placeholder="Add a new question"
                        variant="outlined"
                        size="small"
                        sx={{ width: "100%" }}
                        InputProps={{ style: { borderRadius: "10px" } }}
                        value={newQuestion[sectionIndex]}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleAddQuestionClick(
                              section.topics,
                              sectionIndex
                            );
                          }
                        }}
                        onChange={(e) =>
                          handleInputChange(sectionIndex, e.target.value)
                        }
                      />
                      <IconButton
                        onClick={() =>
                          handleAddQuestionClick(section.topics, sectionIndex)
                        }
                        sx={{ marginLeft: 0 }}
                      >
                        <Box
                          sx={{
                            borderRadius: 50,
                            justifyContent: "center",
                            alignItems: "center",
                            width: 15,
                            marginRight: "-5px",
                            marginLeft: "10px",
                            height: 15,
                            border: "2px solid black",
                            display: "flex",
                          }}
                        >
                          <IconPlus size={15} />
                        </Box>
                      </IconButton>
                    </TableCell>
                  </TableRow>
                </Box>
              )}
            </>
          ))}
        </>
      )}
      {modalOpen && currentTopicIndex !== null && (
        <RegenerateDiscussionTopicsModal
          open={modalOpen}
          onClose={handleCloseModal}
          anchorEl={anchorEl}
          onRegenerate={handleRegenerate}
          note={notes[currentTopicIndex]}
          onNoteChange={(newNote) =>
            handleNoteChange(currentTopicIndex, newNote)
          }
        />
      )}
      {deleteModalOpen && currentTopicIndex !== null && (
        <DeleteDiscussionTopicsModal
          open={deleteModalOpen}
          onClose={handleCloseDeleteModal}
          anchorEl={anchorEl}
          onDelete={() => {
            handleDeleteTopic(currentTopicIndex);
            handleCloseDeleteModal();
          }}
        />
      )}
      {followUpModalOpen &&
        currentSectionIndex !== null &&
        currentQuestionIndex !== null && (
          <FollowUpQuestionsModal
            open={followUpModalOpen}
            onClose={handleCloseFollowUpModal}
            anchorEl={anchorEl}
            sections={sections}
            currentSectionIndex={currentSectionIndex!}
            currentQuestionIndex={currentQuestionIndex!}
          />
        )}
    </Box>
  );
};

export default ReviewDiscussionTopicsTable;
