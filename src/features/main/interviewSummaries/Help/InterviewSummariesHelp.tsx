import { Box, Typography, List, ListItem, ListItemText } from "@mui/material";

const InterviewSummariesHelp = () => {
  return (
    <Box sx={{ p: "20px" }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        How to Use the Interview Summaries Tool
      </Typography>
      <Typography variant="subtitle1">
        Welcome to the Interview Summaries Tool! This customized interface
        enables you to generate comprehensive summaries of interviews and
        discussions.
      </Typography>

      <Typography variant="subtitle1" sx={{ mb: 6 }}>
        Follow these instructions to create a guide suited to your informational
        needs.
      </Typography>

      <Typography variant="h4" sx={{ mb: 3 }}>
        Step-by-Step Instructions
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        <Typography component="span" fontWeight="bold">
          Step 1: Selection
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary={
                <>
                  <Typography
                    variant="body1"
                    component="span"
                    fontWeight="bold"
                  >
                    •
                  </Typography>{" "}
                  Choose the type of interview or discussion you are
                  summarizing. Options include "1on1 Interview", "Advisory
                  Boards" and "TLE Interview".
                </>
              }
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={
                <>
                  <Typography
                    variant="body1"
                    component="span"
                    fontWeight="bold"
                  >
                    •
                  </Typography>{" "}
                  Click on the desired document type to proceed. For example,
                  click "Proceed to Step 2: Introduction" to start creating an
                  Interview guide.
                </>
              }
            />
          </ListItem>
        </List>
      </Typography>

      <Typography variant="body1" sx={{ mb: 4 }}>
        <Typography component="span" fontWeight="bold">
          Step 2: Introduction
        </Typography>
        <Typography sx={{ mb: 2 }} component="p">
          Enter the meeting notes or upload a transcript in the "Meeting Notes"
          section.
        </Typography>
        <Typography component="p">
          If desired, you can enable the option to generate discussion topics
          using AI.
        </Typography>
      </Typography>

      <Typography variant="body1" sx={{ mb: 4 }}>
        <Typography component="span" fontWeight="bold">
          Step 3: Structure
        </Typography>
        <ListItem>
          <ListItemText
            primary={
              <>
                <Typography variant="body1" component="span" fontWeight="bold">
                  • Discussion Topics:
                  <br />
                </Typography>{" "}
                • Review and modify the list of automatically generated
                discussion topics <br />• Add new topics by clicking on the "Add
                a topic" field.
              </>
            }
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary={
              <>
                <Typography variant="body1" component="span" fontWeight="bold">
                  • Components: Select the components you want to include in the
                  summary:
                  <br />
                </Typography>{" "}
                • Key Takeaways <br />
                • Key Recommendations <br />
                • Action Items <br />
                • Detailed Insights <br />
              </>
            }
          />
        </ListItem>
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        <Typography component="span" fontWeight="bold">
          Step 4: Review Generated Content
        </Typography>
        <Typography mb={2} component="p">
          Once the structure is set, proceed to review the generated content.
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary={
                <>
                  <Typography
                    variant="body1"
                    component="span"
                    fontWeight="bold"
                  >
                    • Click the "Review" button to see the generated summary.
                  </Typography>{" "}
                </>
              }
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={
                <>
                  <Typography
                    variant="body1"
                    component="span"
                    fontWeight="bold"
                  >
                    • Make any necessary adjustments before finalizing the
                    document. Reference Guide for Post-Generation Options
                  </Typography>{" "}
                </>
              }
            />
          </ListItem>
        </List>
      </Typography>

      <Typography variant="h3" sx={{ mb: 2 }}>
        <Typography variant="h3" component="span" fontWeight="bold">
          "Generate Word"
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary={
                <>
                  <Typography
                    variant="body1"
                    component="span"
                    fontWeight="bold"
                  >
                    • Purpose:
                  </Typography>{" "}
                  Creates a Microsoft Word document of the generated summary.
                </>
              }
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={
                <>
                  <Typography
                    variant="body1"
                    component="span"
                    fontWeight="bold"
                  >
                    • When to Use:
                  </Typography>{" "}
                  Use this when you are satisfied with the summary and want to
                  save or share it. "Regenerate Response"
                </>
              }
            />
          </ListItem>
        </List>
      </Typography>

      <Typography variant="h3" sx={{ mb: 2 }}>
        <Typography variant="h3" component="span" fontWeight="bold">
          "Regenerate Response"
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary={
                <>
                  <Typography
                    variant="body1"
                    component="span"
                    fontWeight="bold"
                  >
                    • Purpose:
                  </Typography>{" "}
                  Allows you to create a new summary based on the same input
                  parameters.
                </>
              }
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={
                <>
                  <Typography
                    variant="body1"
                    component="span"
                    fontWeight="bold"
                  >
                    • When to Use:
                  </Typography>{" "}
                  If the initial summary doesn't meet your expectations, or if
                  you want a different perspective on the same content.
                </>
              }
            />
          </ListItem>
        </List>
      </Typography>

      <Typography variant="h3" sx={{ mb: 2 }}>
        <Typography variant="h3" component="span" fontWeight="bold">
          "Reset"
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary={
                <>
                  <Typography
                    variant="body1"
                    component="span"
                    fontWeight="bold"
                  >
                    • Purpose:
                  </Typography>{" "}
                  Clears all input fields and selections, resetting the form.
                </>
              }
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={
                <>
                  <Typography
                    variant="body1"
                    component="span"
                    fontWeight="bold"
                  >
                    • When to Use:
                  </Typography>{" "}
                  Opt for this if you want to change the parameters
                  significantly, such as selecting a different document type,
                  changing the objectives, or adjusting your familiarity level.
                </>
              }
            />
          </ListItem>
        </List>
      </Typography>
    </Box>
  );
};

export default InterviewSummariesHelp;
