import { Box, Card, CardActionArea, CardContent, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { IconArrowRight } from "@tabler/icons-react";
import { QuickAction } from "../dashboardData";

type DashboardQuickActionCardProps = {
  action: QuickAction;
  onSelect: (path: string) => void;
};

const DashboardQuickActionCard = ({
  action,
  onSelect,
}: DashboardQuickActionCardProps) => {
  const theme = useTheme();
  const Icon = action.icon;

  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "neutral.300",
        borderRadius: 3,
        bgcolor: "common.white",
        boxShadow: theme.customShadows.raised,
        transition: "all 150ms ease-out",
        "&:hover": {
          borderColor: "accent.main",
          boxShadow: theme.customShadows.elevated,
          transform: "translateY(-1px)",
        },
      }}
    >
      <CardActionArea onClick={() => onSelect(action.path)} sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: { xs: "flex-start", sm: "center" },
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: { xs: "flex-start", sm: "center" },
                gap: 2,
                minWidth: 0,
                flex: 1,
              }}
            >
              <Box
                sx={{
                  width: 46,
                  height: 46,
                  borderRadius: 2.5,
                  bgcolor: "accent.50",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "accent.main",
                  flexShrink: 0,
                }}
              >
                <Icon size={26} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "text.primary",
                    mb: 0.25,
                  }}
                >
                  {action.title}
                </Typography>
                <Typography variant="small" sx={{ color: "neutral.600", lineHeight: 1.5 }}>
                  {action.description}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ color: "neutral.500", flexShrink: 0, pt: { xs: 0.5, sm: 0 } }}>
              <IconArrowRight size={16} />
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default DashboardQuickActionCard;
