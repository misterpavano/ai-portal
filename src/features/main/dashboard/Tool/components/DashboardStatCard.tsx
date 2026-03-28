import { Box, Card, CardContent, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { DashboardStat } from "../dashboardData";

type DashboardStatCardProps = {
  stat: DashboardStat;
};

const DashboardStatCard = ({ stat }: DashboardStatCardProps) => {
  const theme = useTheme();
  const Icon = stat.icon;

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: "neutral.300",
        borderRadius: 3,
        bgcolor: "common.white",
        boxShadow: theme.customShadows.raised,
      }}
    >
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            bgcolor: "accent.50",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "accent.main",
            mb: 2,
          }}
        >
          <Icon size={20} />
        </Box>
        <Typography
          sx={{
            fontSize: 26,
            fontWeight: 700,
            color: "text.primary",
            lineHeight: 1,
            mb: 0.5,
          }}
        >
          {stat.value}
        </Typography>
        <Typography variant="xsmall" sx={{ color: "neutral.600" }}>
          {stat.label}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default DashboardStatCard;
