import Box from "@mui/material/Box";
import {
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import ContentEditable from "react-contenteditable";
import { DiscussionTopicsFormValues } from "../../../../../types/interviewSummaries";
import { useState } from "react";

export type ReviewDiscussionTopicsTableProps = {
  sections: DiscussionTopicsFormValues[];
  handleDeleteTopic: (index: number) => void;
  handleTopicChange: (index: number, newTopic: string) => void;
  addTopic: (topic: string) => void;
};

const ReviewInterviewDiscussionTopicsTable = ({
  sections,
  handleDeleteTopic,
  handleTopicChange,
  addTopic,
}: ReviewDiscussionTopicsTableProps) => {
  const [newTopic, setNewTopic] = useState<string>("");

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTopic.trim()) {
      addTopic(newTopic);
      setNewTopic("");
    }
  };

  const handleAddTopicClick = () => {
    if (newTopic.trim()) {
      addTopic(newTopic);
      setNewTopic("");
    }
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
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#F5F5F4",
              borderRadius: "10px",
              height: "36px",
              marginBottom: "10px",
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{ fontWeight: "bold", textAlign: "left", width: "65%" }}
                  >
                    Topics
                  </TableCell>
                </TableRow>
              </TableHead>
            </Table>
          </Box>
          {sections.map((section, index) => (
            <Box
              key={index}
              sx={{
                borderRadius: "10px",
                padding: "10px",
                overflow: "hidden",
                height: "auto",
                border: "1px solid #D0D5DD !important",
                marginBottom: "10px",
              }}
            >
              <Table>
                <TableBody>
                  <TableRow
                    sx={{
                      display: "flex",
                      borderRadius: "10px",
                      overflow: "hidden",
                    }}
                  >
                    <ContentEditable
                      html={section.topics}
                      onChange={(e) => handleTopicChange(index, e.target.value)}
                      tagName="div"
                      style={{
                        border: "1px solid #D0D5DD",
                        margin: "0 20px 5px 0",
                        alignItems: "center",
                        width: "100%",
                        fontSize: "16px",
                        fontWeight: "bold",
                        padding: "10px",
                        borderRadius: "10px",
                      }}
                    />
                    <TableCell
                      sx={{ cursor: "pointer", borderBottom: "none" }}
                      onClick={() => handleDeleteTopic(index)}
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
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          ))}
        </>
      )}
      <Box sx={{ display: "flex", flexDirection: "row", marginTop: 5 }}>
        <TextField
          placeholder="Add a new topic"
          variant="outlined"
          size="small"
          sx={{ width: "100%" }}
          InputProps={{ style: { borderRadius: "10px" } }}
          value={newTopic}
          onChange={(e) => setNewTopic(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <IconButton onClick={handleAddTopicClick} sx={{ marginLeft: 0 }}>
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
      </Box>
    </Box>
  );
};

export default ReviewInterviewDiscussionTopicsTable;
