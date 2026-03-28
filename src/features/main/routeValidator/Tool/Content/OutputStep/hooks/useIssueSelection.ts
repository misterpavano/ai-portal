import { useState, useCallback } from "react";
import { Issue } from "../types";

interface UseIssueSelectionResult {
  activeIssueIds: Set<string>;
  setActiveIssueIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  handleIssueClick: (issueId: string, relatedIssueIds?: string[]) => string[];
  handleTextClick: (issueIds: string[]) => void;
  clearSelection: () => void;
}

/**
 * Hook to manage issue selection state
 * CRITICAL: 
 * - Text clicks: 1-to-many (clicking text activates all comments on that text)
 * - Comment clicks: 1-to-1 (clicking a comment activates only that specific comment)
 */
export const useIssueSelection = (
  issues: Issue[],
  onSelectionChange?: (issueIds: string[]) => void
): UseIssueSelectionResult => {
  const [activeIssueIds, setActiveIssueIds] = useState<Set<string>>(new Set());

  /**
   * Handle clicking on an issue card
   * CRITICAL: Only activates the single clicked issue (1-to-1 relationship)
   * Text clicks handle 1-to-many (multiple comments on same text)
   * (If clicking same issue again, deselects)
   */
  const handleIssueClick = useCallback(
    (issueId: string, relatedIssueIds?: string[]): string[] => {
      // Only activate the single clicked issue (1-to-1: comment to text)
      // Text clicks handle 1-to-many (text to comments) separately
      const issuesToActivate = [issueId];

      // REPLACE selection (deselect if clicking same issue)
      setActiveIssueIds(prev => {
        const isAlreadyActive = prev.has(issueId);

        let newSet: Set<string>;
        if (isAlreadyActive && prev.size === 1) {
          // If clicking the same issue that's already selected, deselect
          newSet = new Set();
        } else {
          // Otherwise, REPLACE selection with just this single issue
          newSet = new Set(issuesToActivate);
        }

        // Notify parent of selection change
        if (onSelectionChange) {
          onSelectionChange(Array.from(newSet));
        }

        return newSet;
      });

      return issuesToActivate;
    },
    [onSelectionChange]
  );

  /**
   * Handle clicking on highlighted text
   * REPLACES current selection with the clicked issues
   * (If clicking same text again, it deselects)
   */
  const handleTextClick = useCallback(
    (issueIds: string[]) => {
      if (issueIds.length === 0) return;

      setActiveIssueIds(prev => {
        // Check if all clicked issues are already active
        const allAlreadyActive = issueIds.every(id => prev.has(id));

        let newSet: Set<string>;
        if (allAlreadyActive && prev.size === issueIds.length) {
          // If clicking the same text that's already selected, deselect it
          newSet = new Set();
        } else {
          // Otherwise, REPLACE selection with the clicked issues
          newSet = new Set(issueIds);
        }

        if (onSelectionChange) {
          onSelectionChange(Array.from(newSet));
        }

        return newSet;
      });
    },
    [onSelectionChange]
  );

  /**
   * Clear all selections
   */
  const clearSelection = useCallback(() => {
    setActiveIssueIds(new Set());
    if (onSelectionChange) {
      onSelectionChange([]);
    }
  }, [onSelectionChange]);

  return {
    activeIssueIds,
    setActiveIssueIds,
    handleIssueClick,
    handleTextClick,
    clearSelection,
  };
};

export default useIssueSelection;
