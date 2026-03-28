import { Backdrop, CircularProgress } from "@mui/material"

type SpinnerProps = {
    overlay?: boolean;
    size?: number;
    thickness?: number;
    color?: "inherit" | "primary" | "secondary" | "error" | "info" | "success" | "warning"
}

const Spinner = ({ overlay, size, thickness, color }: SpinnerProps) => {
    return overlay ?
        <Backdrop
            sx={{ background: '#ffffff80', zIndex: (theme) => theme.zIndex.modal + 1 }}
            open={true}
        >
            <CircularProgress size={size} thickness={thickness} color={color} />
        </Backdrop>
        : <CircularProgress size={size} thickness={thickness} color={color} />

}

export default Spinner;