import React, { useCallback, useRef } from "react";
import { Box, Typography } from "@mui/material";
import { useDrag, useDrop } from "react-dnd";
import {
  IconArrowRight,
  IconArrowsMove,
  IconCheck,
  IconTrash,
} from "@tabler/icons-react";
import throttle from "lodash.throttle";
import { meetingNotesDroppedItemsAtom } from "../../atoms/dndAtom";
import { useAtom } from "jotai";
import { meetingNotesFormAtom } from "../../atoms/meetingNotesAtom";

interface DraggableItemProps {
  id: number;
  title: string;
  index: number;
  isDisabled?: boolean;
  isDropped?: boolean;
  fullWidth?: boolean;
  placeholder?: boolean;
  onMoveItem?: (dragIndex: number, hoverIndex: number) => void;
  onRightIconClick?: (item: DraggableItemProps, moveIn: boolean) => void;
  onClick?: () => void;
  isDragging?: boolean;
}

const MeetingNotesDraggableItem: React.FC<DraggableItemProps> = ({
  id,
  title,
  index,
  isDisabled = false,
  isDropped = false,
  fullWidth = false,
  placeholder,
  onMoveItem,
  onRightIconClick,
  onClick,
  isDragging = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = React.useState<boolean>(false);
  const [droppedItems] = useAtom(meetingNotesDroppedItemsAtom);
  const [meetingNotesValues] = useAtom(meetingNotesFormAtom);

  // const countEmptyValues = (id: number): number => {
  //   const keyMap: { [key: number]: keyof MeetingNotesFlow } = {
  //     1: "meetingOverview",
  //     2: "meetingSummaries",
  //     3: "actionItemsNextStep",
  //   };

  //   const sectionKey = keyMap[id];
  //   const values = meetingNotesValues[sectionKey];

  //   if (!values || typeof values !== "object") {
  //     return 0;
  //   }

  //   let additionalNotes = "";

  //   switch (sectionKey) {
  //     case "meetingOverview":
  //       additionalNotes =
  //         (values as MeetingOverviewFormValues).additionalNotes || "";
  //       return !additionalNotes ? 1 : 0;

  //     case "meetingSummaries":
  //       additionalNotes =
  //         (values as MeetingSummariesFormValues).additionalNotes || "";
  //       const structureType =
  //         (values as MeetingSummariesFormValues).structureType || "";
  //       return (!additionalNotes ? 1 : 0) + (!structureType ? 1 : 0);

  //     case "actionItemsNextStep":
  //       additionalNotes =
  //         (values as ActionItemsNextStepFormValues).additionalNotes || "";
  //       return !additionalNotes ? 1 : 0;

  //     default:
  //       return 0;
  //   }
  // };

  const isDroppedItem = droppedItems.some((item) => item.id === id);
  // const emptyCount = !isDisabled && isDroppedItem ? countEmptyValues(id) : 0;

  const [{ isDragging: localIsDragging }, drag] = useDrag(
    () => ({
      type: "ITEM",
      item: { id, index, title },
      canDrag: () => !isDisabled,
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    [isDisabled, id, index, title]
  );

  const moveItemThrottled = useCallback(
    throttle((dragIndex, hoverIndex) => {
      onMoveItem?.(dragIndex, hoverIndex);
    }, 100),
    [onMoveItem]
  );

  const [, drop] = useDrop({
    accept: "ITEM",
    hover: (draggedItem: DraggableItemProps, monitor) => {
      if (!ref.current) return;

      const dragIndex = draggedItem.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveItemThrottled(dragIndex, hoverIndex);
      draggedItem.index = hoverIndex;
    },
  });

  drag(drop(ref));

  return (
    <Box
      ref={ref}
      key={id}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        display: "flex",
        alignItems: "center",
        backgroundColor:
          isHovered && !isDisabled
            ? "#E8F0FF"
            : placeholder
            ? "#E7E5E4"
            : isDropped
            ? "#CFDFFF"
            : "#FFF",
        overflow: "hidden",
        border: "1px solid #D6D3D1",
        borderRadius: "8px",
        cursor: isDisabled ? "not-allowed" : "grab",
        gap: 2,
        boxShadow:
          localIsDragging || isDragging
            ? "0px 0px 10px rgba(0,0,0,0.5)"
            : "none",
        opacity: isDisabled || localIsDragging ? 0.4 : 1,
        width: fullWidth ? "100%" : "auto",
        height: 47,
      }}
      onClick={onClick}
    >
      {!placeholder && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "#E7E5E4",
            padding: "16px",
          }}
        >
          <IconArrowsMove
            color={isHovered && !isDisabled ? "#0066FF" : "#000000"}
            width={15}
            height={15}
          />
        </Box>
      )}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
        }}
      >
        <Typography style={{ fontWeight: 500 }} variant="body2">
          {title}
        </Typography>
      </Box>
      <Box
        sx={{
          cursor: "pointer",
          width: !isDisabled && isDropped ? 50 : "",
          gap: !isDisabled && isDropped ? 1 : "",
          paddingTop: 1,
          display: "flex",
          alignItems: "center",
        }}
      >
        {!isDisabled && isDroppedItem && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "green",
              borderRadius: "5px",
              padding: "4px 3px 4px 3px",
            }}
          >
            <IconCheck size={10} color="white" />
          </Box>
        )}
        {(isHovered || isDragging) &&
          !isDisabled &&
          !placeholder &&
          !isDragging &&
          (isDropped ? (
            <IconTrash
              onClick={(e) => {
                e.stopPropagation();
                onRightIconClick?.({ id, title, index }, isDropped);
              }}
              size={17}
            />
          ) : (
            <IconArrowRight />
          ))}
      </Box>
    </Box>
  );
};

export default MeetingNotesDraggableItem;
