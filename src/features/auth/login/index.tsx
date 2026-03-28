import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import "./login-overrides.css";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import logo from "../../../assets/kalabria-logo.svg";

const LOGIN_STYLES = {
  wrapper: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  leftPanel: {
    flex: "0 0 45%",
    background:
      "linear-gradient(160deg, #1C1917 0%, #253A4B 50%, #507DA0 100%)",
    display: { xs: "none", md: "flex" },
    flexDirection: "column" as const,
    justifyContent: "center",
    alignItems: "center",
    padding: "64px",
    position: "relative" as const,
    overflow: "hidden",
  },
  decorCircle1: {
    position: "absolute" as const,
    top: "-120px",
    right: "-80px",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background: "rgba(232, 109, 90, 0.08)",
  },
  decorCircle2: {
    position: "absolute" as const,
    bottom: "-60px",
    left: "-100px",
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    background: "rgba(196, 163, 90, 0.06)",
  },
  decorLine: {
    position: "absolute" as const,
    top: "40%",
    left: 0,
    right: 0,
    height: "1px",
    background:
      "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
  },
  rightPanel: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "center",
    alignItems: "center",
    padding: "0 56px",
    backgroundColor: "#FAFAF9",
  },
  formContainer: {
    width: "100%",
    maxWidth: "380px",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
  },
} as const;

// Inner component that handles redirect after auth
function AuthRedirect() {
  const { user } = useAuthenticator((context) => [context.user]);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [navigate, user]);

  return null;
}

export default function LoginPage() {
  return (
    <Box sx={LOGIN_STYLES.wrapper}>
      {/* Left brand panel */}
      <Box sx={LOGIN_STYLES.leftPanel}>
        <Box sx={LOGIN_STYLES.decorCircle1} />
        <Box sx={LOGIN_STYLES.decorCircle2} />
        <Box sx={LOGIN_STYLES.decorLine} />

        <Box sx={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <img
            src={logo}
            alt="Kalabria"
            style={{
              width: "180px",
              marginBottom: "48px",
              filter: "brightness(0) invert(1)",
            }}
          />

          <Typography
            sx={{
              fontSize: "32px",
              fontWeight: 700,
              color: "#FFFFFF",
              lineHeight: 1.2,
              mb: 2,
              letterSpacing: "-0.02em",
            }}
          >
            Digital solutions for
            <br />
            pharmaceutical teams
          </Typography>

          <Typography
            sx={{
              fontSize: "15px",
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.7,
              maxWidth: "360px",
              mx: "auto",
            }}
          >
            AI-powered tools designed to enhance growth, efficiency, and skill
            development for marketing teams.
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              mt: 5,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {["Route Validation", "Audio Transcription", "AI Analysis"].map(
              (feature) => (
                <Box
                  key={feature}
                  sx={{
                    px: 2.5,
                    py: 1,
                    borderRadius: "20px",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "rgba(255,255,255,0.7)",
                    fontSize: "13px",
                    fontWeight: 500,
                    letterSpacing: "0.01em",
                  }}
                >
                  {feature}
                </Box>
              )
            )}
          </Box>
        </Box>
      </Box>

      {/* Right form panel */}
      <Box sx={LOGIN_STYLES.rightPanel}>
        <Box sx={LOGIN_STYLES.formContainer}>
          {/* Mobile logo */}
          <Box
            sx={{
              display: { xs: "flex", md: "none" },
              justifyContent: "center",
              mb: 4,
            }}
          >
            <img src={logo} alt="Kalabria" style={{ width: "140px" }} />
          </Box>

          <Typography
            sx={{
              fontSize: "24px",
              fontWeight: 700,
              color: "#1C1917",
              mb: 0.5,
              letterSpacing: "-0.01em",
              width: "100%",
            }}
          >
            Welcome back
          </Typography>
          <Typography
            sx={{
              fontSize: "14px",
              color: "#78716C",
              mb: 4,
              width: "100%",
            }}
          >
            Sign in to your Kalabria account
          </Typography>

          <Box sx={{ width: "100%" }}>
            <Authenticator
              hideSignUp={true}
              formFields={{
                signIn: {
                  username: {
                    placeholder: "Enter your email",
                    label: "Email",
                  },
                  password: {
                    placeholder: "Enter your password",
                    label: "Password",
                  },
                },
              }}
            >
              <AuthRedirect />
            </Authenticator>
          </Box>

          <Typography
            sx={{
              mt: 5,
              fontSize: "12px",
              color: "#A8A29E",
              width: "100%",
              textAlign: "left",
            }}
          >
            Powered by Hedgehox &middot; hedgehox.com
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
