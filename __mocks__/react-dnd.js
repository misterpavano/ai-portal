"use strict";
module.exports = {
  DndProvider: ({ children }) => children,
  useDrag: () => [{ isDragging: false }, () => null],
  useDrop: () => [{ isOver: false }, () => null],
};
