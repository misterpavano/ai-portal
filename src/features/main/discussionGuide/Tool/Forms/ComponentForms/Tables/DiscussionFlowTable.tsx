import { useState } from "react";
import Box from "@mui/material/Box";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  TextField,
  IconButton,
} from "@mui/material";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import { DiscussionFlowFormValues } from "../../../../../../../types/discussionGuidesTypes";
import Skeleton from "../../../../../../../components/layouts/Skeleton";

export type DiscussionFlowTableProps = {
  sections: DiscussionFlowFormValues[];
  onAddSection: (newSection: DiscussionFlowFormValues) => void;
  onRemoveSection: (index: number) => void;
  isLoading: boolean;
};

const DiscussionFlowTable = ({
  sections,
  onAddSection,
  onRemoveSection,
  isLoading,
}: DiscussionFlowTableProps) => {
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [newTime, setNewTime] = useState("");

  const handleAddSection = () => {
    if (newSectionTitle && newTime) {
      const timeWithMinutes = `${newTime} minutes`;
      onAddSection({
        sectionTitle: newSectionTitle,
        time: timeWithMinutes,
        sections: [],
      });
      setNewSectionTitle("");
      setNewTime("");
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
            <TableRow sx={{ borderBottom: "1px solid #d7d5d5" }}>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  textAlign: "left",
                  borderBottom: "1px solid #d7d5d5",
                }}
              >
                #
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  textAlign: "left",
                  borderBottom: "1px solid #d7d5d5",
                }}
              >
                Section Title
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  textAlign: "left",
                  borderBottom: "1px solid #d7d5d5",
                }}
              >
                Time
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  textAlign: "left",
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
              <TableRow
                key={index}
                sx={{
                  backgroundColor: "#fff",
                }}
              >
                <TableCell
                  sx={{
                    borderBottom: "1px solid #d7d5d5",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "20px",
                  }}
                >
                  <Tooltip title={`Section ${index + 1}`}>
                    <Typography sx={{ fontSize: "12px" }} noWrap>
                      {index + 1}
                    </Typography>
                  </Tooltip>
                </TableCell>
                <TableCell
                  sx={{
                    borderBottom: "1px solid #d7d5d5",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    width: "100%",
                    flex: 1,
                  }}
                >
                  <Tooltip title={section.sectionTitle || ""}>
                    <Typography sx={{ fontSize: "14px" }} noWrap>
                      {section.sectionTitle}
                    </Typography>
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
                  <Tooltip title={section.time || ""}>
                    <Typography sx={{ fontSize: "14px" }} noWrap>
                      {section.time}
                    </Typography>
                  </Tooltip>
                </TableCell>
                <TableCell
                  sx={{
                    borderBottom: "1px solid #d7d5d5",
                    textAlign: "center",
                  }}
                >
                  <IconButton onClick={() => onRemoveSection(index)}>
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
            ))
          )}
          {!isLoading && (
            <TableRow sx={{ backgroundColor: "#fff" }}>
              <TableCell sx={{ borderBottom: "none" }} />
              <TableCell sx={{ borderBottom: "none" }}>
                <TextField
                  variant="standard"
                  size="small"
                  multiline
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  placeholder="Add a section title"
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
                      padding: "10px",
                    },
                  }}
                />
              </TableCell>
              <TableCell sx={{ borderBottom: "none" }}>
                <TextField
                  variant="standard"
                  size="small"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  placeholder="Add a time"
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
                      borderRadius: "10px",
                      width: "120px",
                      padding: "8px",
                      border: `1px solid #A8A29E`,
                    },
                  }}
                />
              </TableCell>
              <TableCell sx={{ borderBottom: "none", textAlign: "center" }}>
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

export default DiscussionFlowTable;
