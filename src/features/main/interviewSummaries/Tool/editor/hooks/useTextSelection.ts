import { useEffect, useRef, useState } from "react";
import { SectionKey } from "../../../../../../types/interviewSummaries";

export const useTextSelection = (
  editorDivRefs: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>
) => {
  const selectionTimeoutRef = useRef<number>();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [highlightedText, setHighlightedText] = useState("");
  const [currentSection, setCurrentSection] = useState<SectionKey | null>(null);
  const [popoverAnchorPosition, setPopoverAnchorPosition] = useState({
    top: 0,
    left: 0,
  });

  const handleKeyDown = (e: KeyboardEvent) => {
    if (
      (e.key === "Backspace" || e.key === "Delete") &&
      window.getSelection()?.toString()
    ) {
      setPopoverOpen(false);
    }
  };

  const handleMouseUp = () => {
    if (selectionTimeoutRef.current) {
      window.clearTimeout(selectionTimeoutRef.current);
    }

    selectionTimeoutRef.current = window.setTimeout(() => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const selectedText = selection.toString();
        const parentNode = selection.anchorNode?.parentElement;

        const sectionKey = Object.keys(editorDivRefs.current).find(
          (key) =>
            editorDivRefs.current[key] &&
            parentNode &&
            editorDivRefs.current[key]?.contains(parentNode)
        );

        if (
          sectionKey &&
          selectedText.trim().length > 0 &&
          parentNode &&
          parentNode.closest(".ql-editor ul")
        ) {
          setHighlightedText(selectedText);
          setCurrentSection(sectionKey as SectionKey);

          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();

          setPopoverAnchorPosition({
            top: rect.top - 10,
            left: rect.left,
          });

          setPopoverOpen(true);
        } else {
          setPopoverOpen(false);
        }
      }
    }, 50);
  };

  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("keydown", handleKeyDown);
      if (selectionTimeoutRef.current) {
        window.clearTimeout(selectionTimeoutRef.current);
      }
    };
  }, []);

  return {
    popoverOpen,
    setPopoverOpen,
    highlightedText,
    setHighlightedText,
    currentSection,
    setCurrentSection,
    popoverAnchorPosition,
  };
};

