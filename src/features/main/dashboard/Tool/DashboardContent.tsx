import { Box, Typography } from "@mui/material";
import {
  IconTrendingUp,
  IconAntennaBars3,
  IconBaselineDensityMedium,
} from "@tabler/icons-react";

const DashboardContent = () => {
  return (
    <Box sx={{ margin: "40px 140px 0 200px" }}>
      <Typography
        sx={{ color: "neutral.500", fontWeight: "bold", fontSize: "30px", mb: 4 }}
        variant="h2"
        gutterBottom
      >
        Welcome to Kalabria
      </Typography>

      <Box sx={{ paddingRight: 10, mb: 6 }}>
        <Typography sx={{ color: "text.primary" }} variant="body1" paragraph>
          Kalabria is your destination to access custom tools that meet the
          growing needs of us. These tools have been developed with the input of
          our team members and leadership, and in some cases, configured to meet
          the needs of specific business units. The tools aim to assist you in
          working more effectively and efficiently, delivering more value to
          your team and clients. While AI plays an important role in generating
          initial outputs, please remember that the outputs will not be client
          ready and you must review all outputs fully to ensure, at minimum,
          accuracy, proper grammar, and relevancy. Instead, view them as a first
          draft—giving you more time to react, refine, expand, and make the
          content even sharper.{""}
        </Typography>
      </Box>

      <Box sx={{ paddingRight: 10, mb: 6 }}>
        <Typography variant="h4" gutterBottom>
          What to Expect
        </Typography>
        <Typography
          sx={{ fontSize: "14px" }}
          color={"text.primary"}
          variant="body1"
          paragraph
        >
          The AI tools within this portal are intended to:
        </Typography>
        <Box>
          {/* First Item */}
          <Box
            component="li"
            sx={{ display: "flex", alignItems: "center", mb: 2 }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: 20,
                height: 20,
                border: "1px solid",
                borderColor: "neutral.400",
                borderRadius: "8px",
                mr: 2,
              }}
            >
              <IconTrendingUp size={12} color="#FFC235" />
            </Box>
            <Typography color={"text.primary"} variant="body1">
              <strong>Increase speed:</strong> Accelerate initial drafts and the
              overall delivery process.
            </Typography>
          </Box>

          {/* Second Item */}
          <Box
            component="li"
            sx={{ display: "flex", alignItems: "center", mb: 2 }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: 20,
                height: 20,
                border: "1px solid",
                borderColor: "neutral.400",
                borderRadius: "8px",
                mr: 2,
              }}
            >
              <IconAntennaBars3 size={18} color="#9BE328" />
            </Box>
            <Typography color={"text.primary"} variant="body1">
              <strong>Improve quality:</strong> Enhance the baseline quality of
              deliverables.
            </Typography>
          </Box>

          {/* Third Item */}
          <Box
            component="li"
            sx={{ display: "flex", alignItems: "center", mb: 2 }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: 20,
                height: 20,
                border: "1px solid",
                borderColor: "neutral.400",
                borderRadius: "8px",
                mr: 2,
              }}
            >
              <IconBaselineDensityMedium size={12} color="#59A9FF" />
            </Box>
            <Typography color={"text.primary"} variant="body1">
              <strong>Standardize processes:</strong> Help ensure consistency
              across projects.
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ paddingRight: 10, mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Please remember:
        </Typography>

        <Typography variant="body1" paragraph>
          AI is a powerful ally, but human insight is critical. Think of these
          tools as a launchpad—your expertise will be required to review and
          refine the output to create a final deliverable that meets your and
          your clients’ needs
        </Typography>
      </Box>

      <Typography variant="body1" paragraph>
        As we continue to develop and refine these tools, expect more features
        and improvements to be added, ensuring that Kalabria's needs are always
        met with high value solutions
      </Typography>

      {/* <Box sx={{ paddingRight: 10, mb: 6 }}>
        <Typography variant="body1" paragraph>
          Need help with this site or tools? Email{" "}
          <a
            href="mailto:AItoolsHelp@mkgny.com"
            style={{ color: "blue", textDecoration: "underline" }}
          >
            AItoolsHelp@mkgny.com
          </a>{" "}
          to message the AI Help team.
        </Typography>
      </Box> */}

      <Box sx={{ paddingRight: 10, mb: 6 }}>
        <Typography sx={{ fontSize: "14px" }} variant="body1" paragraph>
          By accessing and utilizing the tool(s) within the Kalabria AI Portal,
          you confirm that you have the appropriate authorizations to utilize
          the Kalabria AI Portal and client data used within the Kalabria AI
          Portal. You confirm that you have read and understood all policies and
          procedures surrounding the use of Kalabria AI technology and the
          Kalabria AI Portal. You further confirm that you understand that AI
          outputs cannot solely be relied upon, and you must thoroughly review
          every output before using it for any Kalabria or client business. If,
          for any reason, your authorization is suspended or revoked in using
          the Kalabria AI Portal, you must immediately terminate all Kalabria AI
          Portal sessions. If you have erroneously input unauthorized Kalabria
          or client data into the Kalabria AI Portal, you must immediately
          delete such data and your manager
        </Typography>
      </Box>
    </Box>
  );
};

export default DashboardContent;
