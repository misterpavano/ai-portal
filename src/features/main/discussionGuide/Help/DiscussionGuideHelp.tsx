import { Box, Typography, List, ListItem, ListItemText } from "@mui/material";

const DiscussionGuideHelp = () => {
  return (
    <Box sx={{ p: "20px" }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        How to Use the Discussion Guide Tool
      </Typography>
      <Typography variant="subtitle1">
        Welcome to the Discussion Guide Tool! This customized interface enables
        you to generate tailored discussion guides for various purposes.
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
          Step 1: Select Document Type
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
                  Navigate to the main page where you can see various document
                  types such as Focus Group, Patient Journey, Communication
                  Testing, and more.
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
                  click "Proceed to Focus Group" to start creating an Focus
                  Group guide.
                </>
              }
            />
          </ListItem>
        </List>
      </Typography>

      <Typography variant="body1" sx={{ mb: 4 }}>
        <Typography component="span" fontWeight="bold">
          Step 2: Provide Direction
        </Typography>
        <Typography sx={{ mb: 2 }} component="p">
          Enter the discussion objectives in the provided text box. Include
          clear and concise objectives such as audience objective, caveats,
          phrasing, length, tone, and tense to ensure the generated guide aligns
          with your goals.
        </Typography>
        <Typography component="p">
          Optionally, upload a message file by dragging items into the "Upload
          meeting notes and/or transcript" area or by browsing files.
        </Typography>
      </Typography>

      <Typography variant="body1" sx={{ mb: 4 }}>
        <Typography component="span" fontWeight="bold">
          Step 3: Create Document Structure
        </Typography>
        <Typography sx={{ mb: 2 }} component="p">
          On the structure creation page, drag and drop guide components from
          the "Components" section to the main canvas area.
        </Typography>
        <Typography sx={{ mb: 2 }} component="p">
          Available components may include Discussion Flow, Background &
          Introduction, Market Research Disclosures, and Discussion Topics.
        </Typography>
        <Typography sx={{ mb: 2 }} component="p">
          Arrange these components in the desired order to structure your
          discussion guide.
        </Typography>
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
                    • Ensure that the guide meets your expectations and covers
                    all necessary areas.
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
                    • Reference Guide for Post-Question Generation Options
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
                  This function creates a Microsoft Word document containing the
                  list of questions you have generated. It allows for easy
                  saving, sharing, and printing.
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
                  Use this after you are satisfied with the list of generated
                  questions and would like to have them in a document format
                  that you can bring to your appointment or store for your
                  records.
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
                  This option allows you to create a new set of questions based
                  on the same parameters you previously submitted. It is helpful
                  if you are looking for different phrasing or additional
                  perspectives on the same topics.
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
                  If the initially generated list doesn't quite meet your
                  expectations or if you are curious about what other types of
                  questions might be provided, you can use this to regenerate
                  the list.
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
                  Resets all input fields and selections to their default state,
                  effectively clearing the form. This allows you to start the
                  question-generation process from scratch.
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

export default DiscussionGuideHelp;
