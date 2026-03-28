import { Box, Dialog, Typography, Backdrop } from "@mui/material";
import DefaultButton from "../../../../../components/layouts/DefaultButton";

interface QuotaExceededModalProps {
  open: boolean;
  onClose: () => void;
  errorMessage: string;
}

const QuotaExceededModal: React.FC<QuotaExceededModalProps> = ({
  open,
  onClose,
  errorMessage,
}) => {
  const handleReturnBack = () => {
    // Hard reload to go back to first step
    window.location.reload();
  };

  // Extract message up to "You exceeded your current quota, please check your plan and billing details."
  const displayMessage = errorMessage.includes(
    "You exceeded your current quota, please check your plan and billing details."
  )
    ? "You exceeded your current quota, please check your plan and billing details."
    : errorMessage;

  return (
    <Dialog
      open={open}
      onClose={() => {}} // Prevent closing by clicking outside
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.15)",
          border: "1px solid #D6D3D1",
          overflow: "hidden",
        },
      }}
      BackdropComponent={Backdrop}
      BackdropProps={{
        sx: {
          backgroundColor: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(4px)",
        },
        onClick: () => {}, // Prevent closing by clicking backdrop
      }}
    >
      <Box
        sx={{
          padding: 4,
          backgroundColor: "white",
          borderRadius: 3,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontSize: "24px",
            fontWeight: "bold",
            mb: 3,
            color: "#1a1a1a",
          }}
        >
          Quota Exceeded
        </Typography>

        <Typography
          sx={{
            fontSize: "16px",
            color: "#595858",
            mb: 3,
            lineHeight: 1.7,
            fontWeight: 500,
          }}
        >
          {displayMessage}
        </Typography>

        <Typography
          sx={{
            fontSize: "16px",
            color: "#595858",
            mb: 4,
            lineHeight: 1.7,
            fontWeight: 500,
          }}
        >
          Please contact the <strong>Hedgehox team</strong> to exceed the
          current quota.
        </Typography>

        <Box display="flex" justifyContent="center" gap={2}>
          <DefaultButton
            style={{
              borderRadius: "15px",
              height: 45,
              minWidth: 150,
            }}
            textStyle={{ fontSize: "14px", fontWeight: 600 }}
            title="Return Back"
            type="primary"
            onClick={handleReturnBack}
          />
        </Box>
      </Box>
    </Dialog>
  );
};

export default QuotaExceededModal;
