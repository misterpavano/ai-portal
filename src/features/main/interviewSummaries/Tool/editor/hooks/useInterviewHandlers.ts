import { useState } from "react";
import { SectionKey } from "../../../../../../types/interviewSummaries";
import ReactQuill from "react-quill";

export const useInterviewHandlers = (
  editorRefs: React.MutableRefObject<{ [key: string]: ReactQuill | null }>,
  highlightedText: string,
  currentSection: SectionKey | null,
  setHighlightedText: (text: string) => void,
  setCurrentSection: (section: SectionKey | null) => void
) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [topicModalOpen, setTopicModalOpen] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showBulletModal, setShowBulletModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleOpenModal = (
    section: SectionKey,
    event: React.MouseEvent<HTMLElement>
  ) => {
    setCurrentSection(section);
    setAnchorEl(event.currentTarget);
    setModalOpen(true);
  };

  const handleOpenTopicModal = (
    section: SectionKey,
    event: React.MouseEvent<HTMLElement>
  ) => {
    setCurrentSection(section);
    setAnchorEl(event.currentTarget);
    setTopicModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setAnchorEl(null);
  };

  const handleTopicCloseModal = () => {
    setTopicModalOpen(false);
    setAnchorEl(null);
  };

  const handleCloseQuoteModal = () => {
    setShowQuoteModal(false);
  };

  const handleCloseBulletModal = () => {
    setShowBulletModal(false);
  };

  const handleReplaceBullet = (newBullet: string) => {
    if (currentSection && editorRefs.current[currentSection]) {
      const quillEditor = editorRefs.current[currentSection]?.getEditor();
      if (quillEditor) {
        const highlightedIndex = quillEditor.getText().indexOf(highlightedText);
        if (highlightedIndex !== -1) {
          quillEditor.deleteText(highlightedIndex, highlightedText.length);
          quillEditor.insertText(highlightedIndex, newBullet, {
            list: "bullet",
          });
        }
      }
    }
    setShowBulletModal(false);
  };

  const handleQuoteInsert = (quote: string) => {
    if (currentSection && editorRefs.current[currentSection]) {
      const quillEditor = editorRefs.current[currentSection]?.getEditor();
      if (quillEditor) {
        const highlightedIndex = quillEditor.getText().indexOf(highlightedText);
        if (highlightedIndex !== -1) {
          const insertionIndex = highlightedIndex + highlightedText.length;
          let endOfListItem = insertionIndex;
          while (
            endOfListItem < quillEditor.getLength() &&
            quillEditor.getText(endOfListItem, 1) !== "\n"
          ) {
            endOfListItem++;
          }
          quillEditor.insertText(endOfListItem, "\n", { list: "bullet" });
          quillEditor.insertText(endOfListItem + 1, quote, {
            indent: 1,
            italic: true,
            color: "#57534E",
          });
        }
      }
    }
    setShowQuoteModal(false);
  };

  const handleDeleteContent = (
    setPopoverOpen: (open: boolean) => void
  ) => {
    if (currentSection && editorRefs.current[currentSection]) {
      const quillEditor = editorRefs.current[currentSection]?.getEditor();
      if (quillEditor) {
        const highlightedIndex = quillEditor.getText().indexOf(highlightedText);
        if (highlightedIndex !== -1) {
          quillEditor.deleteText(highlightedIndex, highlightedText.length);
          setPopoverOpen(false);
        }
      }
    }
  };

  return {
    modalOpen,
    topicModalOpen,
    showQuoteModal,
    showBulletModal,
    anchorEl,
    handleOpenModal,
    handleOpenTopicModal,
    handleCloseModal,
    handleTopicCloseModal,
    handleCloseQuoteModal,
    handleCloseBulletModal,
    handleReplaceBullet,
    handleQuoteInsert,
    handleDeleteContent,
    setShowQuoteModal,
    setShowBulletModal,
  };
};

