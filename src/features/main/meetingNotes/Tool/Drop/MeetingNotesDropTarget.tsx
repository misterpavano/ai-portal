import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { useDragLayer, useDrop } from "react-dnd";
import { DraggableItemProps } from "../Content/MeetingNotesStructureStep";
import MeetingNotesDraggableItem from "../../../../../components/layouts/MeetingNotesDraggableItems";

interface DropTargetProps {
  droppedItems: DraggableItemProps[];
  moveItem: (dragIndex: number, hoverIndex: number) => void;
  onItemClick: (item: DraggableItemProps) => void;
  onDrop: (item: DraggableItemProps) => void;
  onRemoveItem: (item: DraggableItemProps) => void;
}

const MeetingNotesDropTarget: React.FC<DropTargetProps> = ({
  droppedItems,
  moveItem,
  onItemClick,
  onDrop,
  onRemoveItem,
}) => {
  const [itemExist, setItemExist] = useState(false);
  const [{ isOver, item }, drop] = useDrop({
    accept: "ITEM",
    drop: (item: DraggableItemProps) => {
      onDrop(item);
    },
    collect: (monitor) => {
      return {
        isOver: !!monitor.isOver(),
        item: monitor.getItem(),
      };
    },
  });

  const { isDragging } = useDragLayer((monitor) => ({
    isDragging: monitor.isDragging(),
  }));

  useEffect(() => {
    if (isOver && item) {
      const itemExists = droppedItems.some(
        (droppedItem) => droppedItem.id === item.id
      );
      setItemExist(itemExists);
    }
  }, [isOver, item, droppedItems]);

  return (
    <Box
      ref={drop}
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        backgroundColor: "#FFF",
        borderRadius: "26px",
        boxShadow: isDragging
          ? "0px 10px 20px rgba(0,0,0,0.2)"
          : "0px 5px 10px rgba(0,0,0,0.10)",
        minHeight: "200px",
        border: isDragging ? "1px dashed #000" : "none",
        padding: "16px",
        gap: "8px",
        overflow: "hidden",
        maxHeight: "calc(100vh - 200px)",
        width: "100%",
      }}
    >
      {!isDragging && droppedItems.length === 0 ? (
        <Typography
          sx={{ color: "#A8A29E", fontStyle: "italic", padding: "14px" }}
        >
          Drag guide component here...
        </Typography>
      ) : (
        droppedItems.map((item, index) => (
          <MeetingNotesDraggableItem
            key={item.id}
            index={index}
            id={item.id}
            title={item.title}
            isDropped
            fullWidth
            onMoveItem={moveItem}
            onRightIconClick={onRemoveItem}
            onClick={() => onItemClick(item)}
            isDragging={isDragging}
          />
        ))
      )}
      {isDragging && !itemExist ? (
        <MeetingNotesDraggableItem
          key="placeholder"
          title=""
          index={-1}
          id={-1}
          placeholder
          fullWidth
        />
      ) : (
        ""
      )}
    </Box>
  );
};

export default MeetingNotesDropTarget;
