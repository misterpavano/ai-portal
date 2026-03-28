/**
 * OutputStep - Validation results display component
 * 
 * This file re-exports the refactored OutputStep from the OutputStep folder.
 * The component has been split into smaller, more maintainable pieces:
 * 
 * Structure:
 * - OutputStep/
 *   - index.tsx        - Main component
 *   - types.ts         - TypeScript types
 *   - constants.ts     - Constants (colors, sizes)
 *   - utils.ts         - Helper functions
 *   - hooks/           - Custom hooks
 *     - useIssueProcessing.ts  - Process validation issues
 *     - useIssueSelection.ts   - Manage issue selection state
 *     - useConnector.ts        - Handle connector SVG drawing
 *   - components/      - Sub-components
 *     - IssueCard.tsx          - Individual issue card
 *     - IssuesSidebar.tsx      - Right panel with issues
 *     - DocumentViewer.tsx     - Main document display area
 *     - ImageThumbnails.tsx    - Left sidebar for screenshots
 *     - LoadingOverlay.tsx     - Loading state overlay
 *     - TextHighlighter.tsx    - Word text with highlights
 * 
 * CRITICAL REQUIREMENTS:
 * 1. All text-based comments must be linked to specific text in the document
 * 2. Multiple issues can point to the same text (e.g., grammar + SEO on same sentence)
 * 3. Clicking text highlights all related issues
 * 4. Clicking an issue card highlights all issues pointing to same text
 */

import OutputStep from "./OutputStep/index";

export default OutputStep;
export * from "./OutputStep/types";
export * from "./OutputStep/constants";
export * from "./OutputStep/utils";
