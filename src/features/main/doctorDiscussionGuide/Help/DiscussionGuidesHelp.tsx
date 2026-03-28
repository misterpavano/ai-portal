import { Box, Typography, List, ListItem, ListItemText } from "@mui/material";

const DiscussionGuideHelp = () => {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        How to Use the Doctor Discussion Guide Generator
      </Typography>
      <Typography variant="subtitle1">
        Welcome to the Doctor Discussion Guide Tool! This customized interface
        enables you to generate a tailored set of questions to facilitate
        discussions with your healthcare provider about medications.
      </Typography>

      <Typography variant="subtitle1" sx={{ mb: 6 }}>
        Follow these instructions to create a guide suited to your informational needs and comfort level with the subject matter.
      </Typography>

      <Typography variant="h4" sx={{ mb: 3 }}>
        Step-by-Step Instructions
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        <Typography component="span" fontWeight="bold">
          Step 1: Choose AI Type
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
                    • OpenAI (GPT-x):
                  </Typography>{" "}
                  Opt for this to leverage OpenAI ChatGPT model.
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
                    • Gemini:
                  </Typography>{" "}
                  Select Gemini for a different style of question generation,
                  which might suit different user needs.
                </>
              }
            />
          </ListItem>
        </List>
      </Typography>

      <Typography variant="body1" sx={{ mb: 6 }}>
        <Typography component="p">
          It's encouraged to{" "}
          <Typography component="span" fontWeight="bold">
            experiment with different AI solutions
          </Typography>
          . Some AIs might generate better questions based on the drug's
          complexity, your familiarity with it, and the desired tone of the
          questions.
        </Typography>
      </Typography>

      <Typography variant="body1" sx={{ mb: 4 }}>
        <Typography component="span" fontWeight="bold">
          Step 2: Drug Name
        </Typography>
        <Typography component="p">
          Clearly{" "}
          <Typography component="span" fontWeight="bold">
            input the medication name
          </Typography>{" "}
          you're inquiring about.
        </Typography>
      </Typography>

      <Typography variant="body1" sx={{ mb: 4 }}>
        <Typography component="span" fontWeight="bold">
          Step 3: Number of Questions
        </Typography>
        <Typography component="p">
          Select the{" "}
          <Typography component="span" fontWeight="bold">
            quantity of questions
          </Typography>{" "}
          desired, typically ranging from 5 to 25.
        </Typography>
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        <Typography component="span" fontWeight="bold">
          Step 4: Patient Familiarity
        </Typography>
        <Typography component="p">
          Indicate how well you understand the medication:
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
                    • None:
                  </Typography>{" "}
                  You have no prior knowledge of the medication.
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
                    • Somewhat:
                  </Typography>{" "}
                  You know basic information or have heard of the drug.
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
                    • Advanced:
                  </Typography>{" "}
                  You're well-versed in the medication, possibly from personal
                  use or extensive research.
                </>
              }
            />
          </ListItem>
        </List>
      </Typography>

      <Typography component="p" sx={{ mb: 4 }}>
        The familiarity level helps the AI tailor questions that match your
        understanding, ensuring the generated questions are neither too basic
        nor too complex.
      </Typography>

      <Typography variant="body1" sx={{ mb: 4 }}>
        <Typography component="span" fontWeight="bold">
          Step 5: Focus Areas
        </Typography>
        <Typography component="p">
          Check the topics you wish to include. Each area brings a different
          dimension to your guide:
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
                    • General Questions:
                  </Typography>{" "}
                  These are broad and foundational questions that cover the
                  basics of the medication.
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
                    • Mechanism of Action:
                  </Typography>{" "}
                  Understand how the drug works within the body at a biological
                  and chemical level.
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
                    • Side Effects:
                  </Typography>{" "}
                  Learn about potential adverse reactions, their severity, and
                  frequency.
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
                    • Dosage:
                  </Typography>{" "}
                  Get information on the proper dosage, timing, and whether the
                  dosage might vary under certain conditions.
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
                    • Interactions:
                  </Typography>{" "}
                  Find out how the medication interacts with other drugs, food,
                  beverages, or health conditions.
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
                    • Clinical Efficacy:
                  </Typography>{" "}
                  Inquire about the drug's success rate, supported by clinical
                  trials and research studies.
                </>
              }
            />
          </ListItem>
        </List>
      </Typography>

      <Typography variant="body1" sx={{ mb: 4 }}>
        <Typography component="span" fontWeight="bold">
          Step 6: Tones
        </Typography>
        <Typography component="p">
          Select the tone that reflects how you want your questions to come
          across:
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
                    • Curious:
                  </Typography>{" "}
                  Exhibits an inquiring mind, suitable for when you're exploring
                  options or seeking to understand.
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
                    • Warm:
                  </Typography>{" "}
                  Implies a friendly and personal approach, conveying trust and
                  openness.
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
                    • Wary:
                  </Typography>{" "}
                  Shows caution or concern, indicating that you have
                  reservations or doubts.
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
                    • Assured:
                  </Typography>{" "}
                  Communicates confidence and self-assuredness, often used when
                  you have some background knowledge.
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
                    • Formal:
                  </Typography>{" "}
                  Carries a professional and serious undertone, appropriate for
                  discussing clinical or technical details.
                </>
              }
            />
          </ListItem>
        </List>
      </Typography>

      <Typography variant="body1" sx={{ mb: 8 }}>
        <Typography component="span" fontWeight="bold">
          Step 7: Generate
        </Typography>
        <Typography component="p">
          After filling out all sections, press the "Submit" button to create
          your doctor discussion guide.
        </Typography>
      </Typography>

      <Typography variant="h2" sx={{ mb: 4 }}>
        Reference Guide for Post-Question Generation Options
      </Typography>

      <Typography variant="h3" sx={{ mb: 4 }}>
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
                  list of questions that you have generated. It allows for easy
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
                  significantly, such as selecting a different drug, changing
                  the number of questions, or adjusting your familiarity level.
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
