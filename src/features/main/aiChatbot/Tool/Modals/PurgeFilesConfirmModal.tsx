import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    IconButton,
    Divider,
    Box,
} from "@mui/material";
import { IconX } from "@tabler/icons-react";

interface PurgeFilesConfirmModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    loading?: boolean;
}

const PurgeFilesConfirmModal: React.FC<PurgeFilesConfirmModalProps> = ({
    open,
    onClose,
    onConfirm,
    loading = false,
}) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: "16px",
                    padding: "8px 0 4px 0",
                },
            }}
        >
            <DialogTitle
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontWeight: 700,
                    fontSize: "18px",
                    px: 3,
                    pt: 1,
                    pb: 0,
                }}
            >
                Purge Vector Store Files
                <IconButton size="small" onClick={onClose}>
                    <IconX size={18} />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ px: 3, pt: 2 }}>
                <Typography variant="body2" sx={{ color: "#444", lineHeight: 1.6 }}>
                    Purging will permanently remove all files associated with this conversation from the vector store. This
                    action cannot be undone and will erase any memory of uploaded content. If you continue the conversation
                    after purging, the AI will no longer reference or have access to those files.
                </Typography>
            </DialogContent>
            <Divider sx={{ my: 2 }} />
            <DialogActions
                sx={{
                    px: 3,
                    pb: 2,
                    display: "flex",
                    justifyContent: "space-between",
                }}
            >
                <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
                    <Button
                        onClick={onClose}
                        variant="outlined"
                        fullWidth
                        sx={{
                            borderRadius: "8px",
                            textTransform: "none",
                            fontWeight: 600,
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onConfirm}
                        variant="contained"
                        color="error"
                        fullWidth
                        disabled={loading}
                        sx={{
                            borderRadius: "8px",
                            textTransform: "none",
                            fontWeight: 600,
                            boxShadow: "none",
                        }}
                    >
                        {loading ? "Purging..." : "Purge"}
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
};

export default PurgeFilesConfirmModal;


