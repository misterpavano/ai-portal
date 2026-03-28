import { Box, Button, List, ListItemText, Typography } from "@mui/material";
import {
  IconArrowsDiagonalMinimize2,
  IconDetails,
  IconNotes,
  IconList,
  IconDirections,
  IconBracketsContainEnd,
} from "@tabler/icons-react";

type InterviewSummariesNotesProps = {
  onExpandClick: () => void;
};

const InterviewSummariesNotes: React.FC<InterviewSummariesNotesProps> = ({
  onExpandClick,
}) => {
  return (
    <>
      <Box
        sx={{
          flexBasis: "50%",
          pt: 2,
          mt: 2,
          bgcolor: "#FAFAF9",
          borderRadius: "20px 20px 20px 20px",
          border: "1px solid #DBDBDB",
          minHeight: "55vh",
          overflowY: "auto",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            paddingRight: "10px",
          }}
        >
          <Button
            sx={{
              background:
                "linear-gradient(98.76deg, #DC5E5E 11.95%, #FF9A9A 149.3%)",
              color: "white",
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: "0px",
              padding: "0px",
              "&:hover": {
                background:
                  "linear-gradient(98.76deg, #DC5E5E 11.95%, #FF9A9A 149.3%)",
              },
            }}
            onClick={onExpandClick}
          >
            <IconArrowsDiagonalMinimize2 size={15} />
          </Button>
        </Box>
        <Box borderBottom="1px solid #DBDBDB" pl={3} pr={3} pb={2}>
          <Typography
            sx={{ fontWeight: 700, fontSize: "16px" }}
            variant="subtitle1"
            gutterBottom
          >
            Best Practices
          </Typography>
          <Typography
            sx={{ fontWeight: 400, fontSize: "13px" }}
            variant="body2"
            gutterBottom
          >
            for Providing Interview Summaries to the Tool
          </Typography>
          <Typography
            sx={{ fontWeight: 400, fontSize: "13px", lineHeight: "15px" }}
            variant="body2"
            gutterBottom
          >
            To ensure the tool can effectively parse and summarize your
            interview notes, follow these best practices when providing content
            and directions. This will help generate accurate and useful
            summaries.
          </Typography>
        </Box>
        <Box borderBottom="1px solid #DBDBDB" pt={2} pl={3} pr={3} pb={1}>
          <Box display="flex" alignItems="center">
            <Box
              sx={{
                backgroundColor: "#A8A29E",
                borderRadius: "5px",
                color: "#fff",
                padding: "5px",
                display: "flex",
                width: "12px",
                height: "12px",
                alignItems: "center",
                mr: 1,
              }}
            >
              <IconNotes size={15} />
            </Box>
            <Typography
              sx={{ fontWeight: 700, fontSize: "14px" }}
              variant="body2"
            >
              Organize Your Notes
            </Typography>
          </Box>
          <List sx={{ padding: "10px" }}>
            <ListItemText
              primaryTypographyProps={{ variant: "body2" }}
              primary="• Include participant information: name and title of the interviewee."
            />
            <ListItemText
              primaryTypographyProps={{ variant: "body2" }}
              primary="• Specify the date of the interview."
            />
            <ListItemText
              primaryTypographyProps={{ variant: "body2" }}
              primary="• List key discussion points clearly and organized."
            />
          </List>
        </Box>

        <Box borderBottom="1px solid #DBDBDB" pt={2} pl={3} pr={3} pb={1}>
          <Box display="flex" alignItems="center">
            <Box
              sx={{
                backgroundColor: "#A8A29E",
                borderRadius: "5px",
                color: "#fff",
                padding: "5px",
                display: "flex",
                width: "12px",
                height: "12px",
                alignItems: "center",
                mr: 1,
              }}
            >
              <IconDetails size={20} />
            </Box>
            <Typography
              sx={{ fontWeight: 700, fontSize: "14px" }}
              variant="body2"
            >
              Provide Detailed Content
            </Typography>
          </Box>
          <List sx={{ padding: "10px" }}>
            <ListItemText
              primaryTypographyProps={{ variant: "body2" }}
              primary="• Capture all relevant details from the interview."
            />
            <ListItemText
              primaryTypographyProps={{ variant: "body2" }}
              primary="• Include direct
                      quotes where applicable."
            />
            <ListItemText
              primaryTypographyProps={{ variant: "body2" }}
              primary="•  Note significant observations or
                      insights."
            />
          </List>
        </Box>
        <Box borderBottom="1px solid #DBDBDB" pt={2} pl={3} pr={3} pb={1}>
          <Box display="flex" alignItems="center">
            <Box
              sx={{
                backgroundColor: "#A8A29E",
                borderRadius: "5px",
                color: "#fff",
                padding: "5px",
                display: "flex",
                width: "12px",
                height: "12px",
                alignItems: "center",
                mr: 1,
              }}
            >
              <IconList size={20} />
            </Box>
            <Typography
              sx={{ fontWeight: 700, fontSize: "14px" }}
              variant="body2"
            >
              Specify Output Format:
            </Typography>
          </Box>
          <List sx={{ padding: "10px" }}>
            <ListItemText
              primaryTypographyProps={{ variant: "body2" }}
              primary="• Specify the output by declaring whether the generated text
                      should appear as bulleted text or paragraphs."
            />
            <ListItemText
              primaryTypographyProps={{ variant: "body2" }}
              primary="• Include direct
                      quotes where applicable."
            />
            <ListItemText
              primaryTypographyProps={{ variant: "body2" }}
              primary="•  Note significant observations or
                      insights."
            />
          </List>
        </Box>
        <Box borderBottom="1px solid #DBDBDB" pt={2} pl={3} pr={3} pb={1}>
          <Box display="flex" alignItems="center">
            <Box
              sx={{
                backgroundColor: "#A8A29E",
                borderRadius: "5px",
                color: "#fff",
                padding: "5px",
                display: "flex",
                width: "12px",
                height: "12px",
                alignItems: "center",
                mr: 1,
              }}
            >
              <IconBracketsContainEnd size={20} />
            </Box>
            <Typography
              sx={{ fontWeight: 700, fontSize: "14px" }}
              variant="body2"
            >
              Set a Maximum Word Count:
            </Typography>
          </Box>
          <List sx={{ padding: "10px" }}>
            <ListItemText
              primaryTypographyProps={{ variant: "body2" }}
              primary="• Define a maximum word count for each section to ensure the
                      summary is concise and focused."
            />
          </List>
        </Box>
        <Box pt={2} pl={3} pr={3} pb={1}>
          <Box display="flex" alignItems="center">
            <Box
              sx={{
                backgroundColor: "#A8A29E",
                borderRadius: "5px",
                color: "#fff",
                padding: "5px",
                display: "flex",
                width: "12px",
                height: "12px",
                alignItems: "center",
                mr: 1,
              }}
            >
              <IconDirections size={20} />
            </Box>
            <Typography
              sx={{ fontWeight: 700, fontSize: "14px" }}
              variant="body2"
            >
              Include Additional Directions:
            </Typography>
          </Box>
          <List sx={{ padding: "10px" }}>
            <ListItemText
              primaryTypographyProps={{ variant: "body2" }}
              primary="• Provide any additional guidance to help the tool understand your
                      needs."
            />
            <ListItemText
              primaryTypographyProps={{ variant: "body2" }}
              primary="• Highlight key areas of interest or specify the tone and
                      style of the summary."
            />
          </List>
        </Box>
      </Box>
    </>
  );
};

export default InterviewSummariesNotes;
