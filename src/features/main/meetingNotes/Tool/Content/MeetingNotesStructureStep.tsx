import { useState } from "react";
import { Box, Typography } from "@mui/material";
import update from "immutability-helper";
import { dndDebounce } from "../../../../../utils/dndDebounce";
import { useAtom } from "jotai";
import { meetingNotesDroppedItemsAtom } from "../../../../../atoms/dndAtom";
import Skeleton from "../../../../../components/layouts/Skeleton";
import MeetingNotesDrawer from "./MeetingNotesDrawer";
import MeetingNotesDraggableItem from "../../../../../components/layouts/MeetingNotesDraggableItems";
import MeetingNotesDropTarget from "../Drop/MeetingNotesDropTarget";

type StructureStepProps = {
  selectedType: string;
};

export type DraggableItemProps = {
  title: string;
  id: number;
  index?: number;
};

const typeItemsMap: { [key: string]: DraggableItemProps[] } = {
  "Project Meeting Notes": [
    { title: "Meeting Overview", id: 1 },
    { title: "Meeting Summaries", id: 2 },
    { title: "Action Items/Next Steps", id: 3 },
  ],
  "General Meeting Notes": [
    { title: "Meeting Summaries Key Takeaways", id: 1 },
  ],
};

const MeetingNotesStructureStep = ({ selectedType }: StructureStepProps) => {
  const items = typeItemsMap[selectedType] || [];
  const [droppedItems, setDroppedItems] = useAtom(meetingNotesDroppedItemsAtom);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [drawerText, setDrawerText] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const isItemDropped = (item: DraggableItemProps) => {
    return !!droppedItems.find((droppedItem) => droppedItem?.id === item?.id);
  };

  const handleDrop = (item: DraggableItemProps) => {
    if (!isItemDropped(item) && item.id) {
      setDroppedItems((prevDroppedItems) => [...prevDroppedItems, item]);
    }
  };

  const removeItemFromDroppedList = (item: DraggableItemProps) => {
    setDroppedItems((prevDroppedItems) =>
      prevDroppedItems.filter((prevItem) => prevItem.id !== item.id)
    );
  };

  const moveItem = dndDebounce((dragIndex: number, hoverIndex: number) => {
    const draggedItem = droppedItems[dragIndex];

    if (draggedItem?.id) {
      const updatedItems = update(droppedItems, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, draggedItem],
        ],
      });

      const reorderedItems = updatedItems.map((item, index) => ({
        ...item,
        index: index,
      }));

      setDroppedItems(reorderedItems);
    }
  }, 100);

  const handleItemClick = (item: DraggableItemProps) => {
    setDrawerText(item.title);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setDrawerText("");
  };

  return (
    <Box sx={{ display: "flex", gap: "16px", padding: "20px 20px 20px 20px" }}>
      <>
        {isLoading ? (
          <Box sx={{ padding: 2, width: "100%" }}>
            <Skeleton variant="text" width="100%" height={30} />
            <Skeleton variant="text" width="100%" height={80} />
            <Skeleton variant="text" width="100%" height={80} />
            <Skeleton variant="text" width="100%" height={80} />
            <Skeleton variant="text" width="100%" height={80} />
          </Box>
        ) : (
          <>
            <MeetingNotesDropTarget
              droppedItems={droppedItems}
              moveItem={moveItem}
              onItemClick={handleItemClick}
              onDrop={handleDrop}
              onRemoveItem={removeItemFromDroppedList}
            />
            <Box
              sx={{
                flex: 1,
                backgroundColor: "#E7E5E4",
                padding: "16px",
                borderRadius: "26px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                <Typography style={{ fontWeight: 550 }} variant="body1">
                  Components
                </Typography>
              </Box>
              {items.map((item, index) =>
                item ? (
                  <MeetingNotesDraggableItem
                    key={index}
                    title={item.title}
                    id={item.id}
                    index={index}
                    onMoveItem={moveItem}
                    isDisabled={isItemDropped(item)}
                    onRightIconClick={handleDrop}
                  />
                ) : null
              )}
            </Box>
          </>
        )}
      </>
      <MeetingNotesDrawer
        open={drawerOpen}
        onClose={handleCloseDrawer}
        text={drawerText}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />
    </Box>
  );
};

export default MeetingNotesStructureStep;
