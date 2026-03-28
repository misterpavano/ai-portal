import { Box, Typography, List, ListItem, ListItemText } from "@mui/material";

const PowerpointSlideGeneratorHelp = () => {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        User Guide for PPTx Slide Generator
      </Typography>
      <Typography variant="subtitle1">
        Welcome to the PPTx Slide Generator – a specialized tool designed to
        create customized PowerPoint slides with information about Hedgehox.
      </Typography>

      <Typography variant="subtitle1" sx={{ mb: 6 }}>
        Whether you're preparing for a company presentation, a business meeting,
        or an educational session, this tool leverages AI to streamline your
        slide creation process.
      </Typography>

      <Typography variant="h4" sx={{ mb: 3 }}>
        How to Use the PPTx Slide Generator
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        <Typography component="span" fontWeight="bold">
          Step 1: Input Content Description
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
                  Start by describing the content you want on your PowerPoint
                  slide. Be as specific as possible about the information
                  related to Hedgehox you would like to present.
                </>
              }
            />
          </ListItem>
        </List>
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        <Typography component="span" fontWeight="bold">
          Step 2: AI Processing
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
                  Once you submit your description, the AI will use the training
                  data about Hedgehox to generate the relevant content. This
                  process includes curating information, organizing data, and
                  formulating it in a presentable manner.
                </>
              }
            />
          </ListItem>
        </List>
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        <Typography component="span" fontWeight="bold">
          Step 3: Content Integration
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
                  The generated content is then automatically inserted into a
                  PowerPoint template.
                </>
              }
            />
          </ListItem>
        </List>
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        <Typography component="span" fontWeight="bold">
          Step 4: Download the Template
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
                  After the content is placed into the template, the completed
                  PowerPoint file (.pptx) is available for download to your
                  Downloads folder. You can then open it with Microsoft
                  PowerPoint or compatible software to review and edit further
                  if necessary.
                </>
              }
            />
          </ListItem>
        </List>
      </Typography>
    </Box>
  );
};

export default PowerpointSlideGeneratorHelp;
