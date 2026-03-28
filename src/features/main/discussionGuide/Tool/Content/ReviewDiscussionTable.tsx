import Box from "@mui/material/Box";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import ContentEditable from "react-contenteditable";
import { DiscussionFlowFormValues } from "../../../../../types/discussionGuidesTypes";
import React from "react";

export type ReviewDiscussionTableProps = {
  sections: DiscussionFlowFormValues[];
  onSectionsChange: (updatedSections: DiscussionFlowFormValues[]) => void;
};

const ReviewDiscussionTable = ({
  sections,
  onSectionsChange,
}: ReviewDiscussionTableProps) => {
  const handleTitleChange = (index: number, newTitle: string) => {
    const updatedSections = sections.map((section, i) =>
      i === index ? { ...section, sectionTitle: newTitle } : section
    );
    onSectionsChange(updatedSections);
  };

  const handleTimeChange = (index: number, newTime: string) => {
    const updatedSections = sections.map((section, i) =>
      i === index ? { ...section, time: newTime } : section
    );
    onSectionsChange(updatedSections);
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
          Sections were not added for this Discussion Flow
        </Typography>
      ) : (
        <Table sx={{ tableLayout: "fixed" }}>
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: "#E7E5E4",
                height: "36px",
              }}
            >
              <TableCell
                sx={{
                  fontWeight: "bold",
                  textAlign: "center",
                  width: "10%",
                }}
              >
                #
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  textAlign: "left",
                  width: "70%",
                }}
              >
                Section Title
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", textAlign: "left", width: "20%" }}
              >
                Time
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sections.map((section, index) => (
              <React.Fragment key={index}>
                <TableRow
                  sx={{
                    borderBottom: "1.2px solid #dbd2d2",
                    alignItems: "center",
                    overflow: "hidden",
                    backgroundColor: "#F5F5F4",
                    minHeight: "38px",
                    marginBottom: "10px",
                  }}
                >
                  <TableCell
                    sx={{
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      style={{ fontSize: "14px", fontWeight: "bold" }}
                    >
                      {index + 1}
                    </Typography>
                  </TableCell>
                  <TableCell
                    sx={{
                      textAlign: "start",
                    }}
                  >
                    <Box
                      sx={{
                        "&:hover": {
                          display: "inline-block",
                          fontSize: "14px",
                          outline: "none",
                          borderRadius: "4px",
                          minWidth: "100px",
                          maxWidth: "fit-content",
                          position: "relative",
                          pr: "28px",
                          border: `1px solid #fbbebe`,
                          boxShadow: "0 0 0 2px #feeaeb",
                        },
                        "&:focus-within": {
                          display: "inline-block",
                          fontSize: "14px",
                          outline: "none",
                          borderRadius: "4px",
                          minWidth: "100px",
                          maxWidth: "fit-content",
                          position: "relative",
                          pr: "28px",
                          border: `1px solid #fbbebe`,
                          boxShadow: "0 0 0 2px #feeaeb",
                        },
                      }}
                    >
                      <ContentEditable
                        html={section.sectionTitle || ""}
                        onChange={(e) =>
                          handleTitleChange(index, e.target.value)
                        }
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
                    </Box>
                  </TableCell>
                  <TableCell
                    sx={{
                      textAlign: "start",
                    }}
                  >
                    <Box
                      sx={{
                        "&:hover": {
                          display: "inline-block",
                          fontSize: "14px",
                          outline: "none",
                          borderRadius: "4px",
                          minWidth: "100px",
                          maxWidth: "fit-content",
                          position: "relative",
                          pr: "28px",
                          border: `1px solid #fbbebe`,
                          boxShadow: "0 0 0 2px #feeaeb",
                        },
                        "&:focus-within": {
                          display: "inline-block",
                          fontSize: "14px",
                          outline: "none",
                          borderRadius: "4px",
                          minWidth: "100px",
                          maxWidth: "fit-content",
                          position: "relative",
                          pr: "28px",
                          border: `1px solid #fbbebe`,
                          boxShadow: "0 0 0 2px #feeaeb",
                        },
                      }}
                    >
                      <ContentEditable
                        html={
                          section.time?.includes("minutes")
                            ? section.time
                            : `${section.time} minutes`
                        }
                        onChange={(e) =>
                          handleTimeChange(index, e.target.value)
                        }
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
                    </Box>
                  </TableCell>
                </TableRow>

                {section.childrenTopics &&
                  section.childrenTopics.length > 0 && (
                    <TableRow
                      sx={{
                        backgroundColor: "white",
                        borderBottom: "1.2px solid #dbd2d2",
                      }}
                    >
                      <TableCell
                        sx={{
                          width: "100%",
                          padding: 0,
                        }}
                        colSpan={6}
                      >
                        <Box sx={{ width: "98%" }}>
                          {section.childrenTopics.map((topic, topicIndex) => (
                            <Box
                              key={topicIndex}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                padding: "10px",
                                borderBottom:
                                  topicIndex <
                                  section.childrenTopics!.length - 1
                                    ? "1.2px solid #dbd2d2"
                                    : "none",
                                width: "100%",
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: "14px",
                                  color: "#6c6767",
                                  pl: 22,
                                  width: "100%",
                                }}
                              >
                                {topic}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
};

export default ReviewDiscussionTable;
