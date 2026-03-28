import { atom } from "jotai";

export type DraggableItemProps = {
  title: string;
  id: number;
  index?: number;
};

export type ComponentItem = {
  title: string;
  id: number;
  checked?: boolean;
};

export const droppedItemsAtom = atom<DraggableItemProps[]>([]);

export const projectBriefDroppedItemsAtom = atom<DraggableItemProps[]>([]);

export const meetingNotesDroppedItemsAtom = atom<DraggableItemProps[]>([]);

export const generalMeetingNotesDroppedItemsAtom = atom<ComponentItem[]>([]);

export const interviewSelectedComponentsAtom = atom<ComponentItem[]>([]);
