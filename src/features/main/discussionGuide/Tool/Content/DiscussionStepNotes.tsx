import { Box, Button, List, ListItemText, Typography } from "@mui/material";
import { IconArrowsDiagonalMinimize2 } from "@tabler/icons-react";

type DiscussionStepNotesProps = {
  onExpandClick: () => void;
};

const DiscussionStepNotes: React.FC<DiscussionStepNotesProps> = ({
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
        <Box borderBottom="1px solid #DBDBDB" pl={3} pr={3} pb={1}>
          <Typography
            sx={{ fontWeight: 700, fontSize: "16px" }}
            variant="subtitle1"
            gutterBottom
          >
            Directions for Providing “Discussion Objectives”
          </Typography>
          <Typography
            sx={{ fontWeight: 400, fontSize: "13px", lineHeight: "15px" }}
            variant="body2"
            gutterBottom
          >
            To help the AI generate relevant topics and questions for your
            discussion, please provide detailed information in the “Discussion
            Objectives” input field. Include the following elements:
          </Typography>
        </Box>
        <Box borderBottom="1px solid #DBDBDB" pt={2} pl={3} pr={3} pb={1}>
          <Typography
            sx={{ fontWeight: 700, fontSize: "14px" }}
            variant="body2"
            gutterBottom
          >
            1. Audience:
          </Typography>
          <List>
            <ListItemText
              primaryTypographyProps={{ variant: "body2" }}
              primary="Specify who will be participating in the discussion (e.g., respiratory therapists, supply chain specialists)."
            />
          </List>
        </Box>
        <Box borderBottom="1px solid #DBDBDB" pt={2} pl={3} pr={3} pb={1}>
          <Typography
            sx={{ fontWeight: 700, fontSize: "14px" }}
            variant="body2"
            gutterBottom
          >
            2. Purpose of the Discussion:
          </Typography>
          <List dense>
            <ListItemText
              primaryTypographyProps={{ variant: "body2" }}
              primary="Clearly state the main goal or goals of the discussion (e.g., gather feedback on hospital equipment decision-making)."
            />
          </List>
        </Box>
        <Box borderBottom="1px solid #DBDBDB" pt={2} pl={3} pr={3} pb={1}>
          <Typography
            sx={{ fontWeight: 700, fontSize: "14px" }}
            variant="body2"
            gutterBottom
          >
            3. Discussion Flow:
          </Typography>
          <List dense>
            <ListItemText
              primaryTypographyProps={{ variant: "body2" }}
              primary="Outline the structure of the discussion, including time allocations for each section (e.g., 20 minutes for Background and Introduction, 40 minutes for Campaign Reactions, 20 minutes for Key Takeaways)."
            />
          </List>
        </Box>
        <Box borderBottom="1px solid #DBDBDB" pt={2} pl={3} pr={3} pb={1}>
          <Typography
            sx={{ fontWeight: 700, fontSize: "14px" }}
            variant="body2"
            gutterBottom
          >
            4. Possible Discussion Topics:
          </Typography>
          <List dense>
            <ListItemText
              primaryTypographyProps={{ variant: "body2" }}
              primary="List potential topics to be covered during the discussion (e.g., new  delivery system’s messaging, decision-making processes)."
            />
          </List>
        </Box>
        <Box borderBottom="1px solid #DBDBDB" pt={2} pl={3} pr={3} pb={1}>
          <Typography
            sx={{ fontWeight: 700, fontSize: "14px" }}
            variant="body2"
            gutterBottom
          >
            5. Number of Questions per Topic:
          </Typography>
          <List dense>
            <ListItemText
              primaryTypographyProps={{ variant: "body2" }}
              primary="Indicate how many questions should be asked for each topic (e.g., 3-5 questions per topic)."
            />
          </List>
        </Box>
        <Box pt={2} pl={3} pr={3} pb={1}>
          <Typography
            sx={{ fontWeight: 700, fontSize: "14px" }}
            variant="body2"
            gutterBottom
          >
            6. Additional Directions:
          </Typography>
          <List dense>
            <ListItemText
              primaryTypographyProps={{ variant: "body2" }}
              primary="Include any other information that will help the AI understand how to generate topics and questions (e.g., specific areas of interest, desired feedback formats)."
            />
          </List>
        </Box>
      </Box>
    </>
  );
};

export default DiscussionStepNotes;
