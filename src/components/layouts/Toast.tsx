import { Alert, AlertTitle, Snackbar } from "@mui/material";

type ToastProps = {
    open: boolean;
    autoHideDuration?: number;
    onClose?: () => void;
    type: "success" | "warning" | "error";
    title: string;
    icon?: React.ReactNode;
    variant?: "filled" | "outlined" | "standard";
    style?: React.CSSProperties;
};

const Toast = ({ open, autoHideDuration, onClose, type, title, icon, variant, style }: ToastProps) => {
    return (
        <Snackbar
            open={open}
            autoHideDuration={autoHideDuration || 2000}
            onClose={onClose}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'center',
            }}
        >
            <Alert severity={type} sx={style} icon={icon} variant={variant}>
                {type === 'warning' && <AlertTitle>Warning</AlertTitle>}
                {title}
            </Alert>
        </Snackbar>
    )
}

export default Toast;