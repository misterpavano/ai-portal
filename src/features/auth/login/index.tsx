import type { WithAuthenticatorProps } from "@aws-amplify/ui-react";
import { withAuthenticator, useTheme as useAmplifyTheme } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import "./login-overrides.css";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import logo from "../../../assets/kalabria-logo.svg";

const LOGIN_STYLES = {
  // Page wrapper — split layout
  wrapper: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  // Left panel — brand showcase
  leftPanel: {
    flex: "0 0 45%",
    background: "linear-gradient(160deg, #1C1917 0%, #253A4B 50%, #507DA0 100%)",
    display: { xs: "none", md: "flex" },
    flexDirection: "column" as const,
    justifyContent: "center",
    alignItems: "center",
    padding: "64px",
    position: "relative" as const,
    overflow: "hidden",
  },
  // Decorative circles
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
    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
  },
  // Right panel — form
  rightPanel: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "center",
    alignItems: "center",
    padding: "48px 32px",
    backgroundColor: "#FAFAF9",
  },
  formContainer: {
    width: "100%",
    maxWidth: "400px",
  },
} as const;

// Amplify theme override
const amplifyTheme = {
  name: "kalabria",
  tokens: {
    colors: {
      brand: {
        primary: {
          10: { value: "#FEF2F0" },
          20: { value: "#FDCFC7" },
          40: { value: "#F9A99C" },
          60: { value: "#F09484" },
          80: { value: "#E86D5A" },
          90: { value: "#D4553F" },
          100: { value: "#B84432" },
        },
      },
    },
    components: {
      authenticator: {
        router: {
          boxShadow: { value: "none" },
          borderWidth: { value: "0" },
        },
      },
      button: {
        primary: {
          backgroundColor: { value: "#1C1917" },
          _hover: {
            backgroundColor: { value: "#292524" },
          },
          _active: {
            backgroundColor: { value: "#0C0A09" },
          },
          borderRadius: { value: "8px" },
        },
      },
      fieldcontrol: {
        borderRadius: { value: "8px" },
        borderColor: { value: "#E7E5E4" },
        _focus: {
          borderColor: { value: "#E86D5A" },
          boxShadow: { value: "0 0 0 2px rgba(232, 109, 90, 0.15)" },
        },
      },
      tabs: {
        item: {
          _active: {
            color: { value: "#E86D5A" },
            borderColor: { value: "#E86D5A" },
          },
        },
      },
    },
    fonts: {
      default: {
        variable: { value: "'Plus Jakarta Sans', sans-serif" },
        static: { value: "'Plus Jakarta Sans', sans-serif" },
      },
    },
  },
};

export function Login({ user }: WithAuthenticatorProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [navigate, user]);

  return null;
}

function LoginWrapper(props: WithAuthenticatorProps) {
  return (
    <Box sx={LOGIN_STYLES.wrapper}>
      {/* Left brand panel */}
      <Box sx={LOGIN_STYLES.leftPanel}>
        {/* Decorative elements */}
        <Box sx={LOGIN_STYLES.decorCircle1} />
        <Box sx={LOGIN_STYLES.decorCircle2} />
        <Box sx={LOGIN_STYLES.decorLine} />

        {/* Content */}
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

          {/* Feature pills */}
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
          {/* Mobile logo (hidden on desktop) */}
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
            }}
          >
            Welcome back
          </Typography>
          <Typography
            sx={{
              fontSize: "14px",
              color: "#78716C",
              mb: 4,
            }}
          >
            Sign in to your Kalabria account
          </Typography>

          {/* Amplify authenticator renders here via HOC */}
          <Login {...props} />
        </Box>

        {/* Footer */}
        <Box sx={{ mt: 6, textAlign: "center" }}>
          <Typography
            sx={{
              fontSize: "12px",
              color: "#A8A29E",
            }}
          >
            Powered by Hedgehox &middot; hedgehox.com
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default withAuthenticator(LoginWrapper, {
  hideSignUp: true,
  components: {
    Header: () => null,
  },
  formFields: {
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
  },
});
