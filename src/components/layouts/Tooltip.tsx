import { Tooltip as TooltipHint } from '@mui/material';
import { ReactElement } from 'react';

interface TooltipProps {
    open: boolean;
    onClose: () => void;
    onOpen: () => void;
    title: string;
    children: ReactElement<any, any>
}

const Tooltip = ({
    open,
    onClose,
    onOpen,
    title,
    children
}: TooltipProps) => {
    return (
        <TooltipHint
            open={open}
            onClose={onClose}
            onOpen={onOpen}
            title={title}
            placement="top"
            componentsProps={{
                tooltip: {
                    sx: {
                        fontSize: 14,
                        bgcolor: 'common.black',
                        '& .MuiTooltip-arrow': {
                            color: 'common.black',
                        },
                    },
                }
            }}
            arrow
        >
            {children}
        </TooltipHint>
    )
}

export default Tooltip;