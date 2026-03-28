import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import PptxGenJS from "pptxgenjs";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import { useAtom } from "jotai";
import AudioToText from "../../../features/main/audioToText";
import { audioToTextFormAtom } from "../../../atoms/audioToTextAtom";
import { TranscriptData } from "../../../types/response/openai";

const AudioToTextPage = () => {
  const [audioToTextFormValues] = useAtom(audioToTextFormAtom);

  const handleDownloadFile = async (type: "Word" | "Powerpoint") => {
    if (type !== "Word") return; // Only handle Word for now

    const { transcript, transcriptionOptions, transcriptEdits, summary } =
      audioToTextFormValues;

    if (!transcript) {
      console.error("No transcript available for download");
      return;
    }

    const { provideSummary, includeTimestamps, includeSpeakerIdentifier } =
      transcriptionOptions;

    // Helper function to resolve speaker name (apply edits)
    const resolveSpeakerName = (originalSpeaker: string): string => {
      return transcriptEdits.speakerEdits[originalSpeaker] || originalSpeaker;
    };

    // Helper function to get segment speaker (apply reassignments and edits)
    const getSegmentSpeaker = (
      segmentIndex: number,
      originalSpeaker: string,
    ): string => {
      const reassignedSpeaker =
        transcriptEdits.segmentSpeakerReassignments[segmentIndex] ||
        originalSpeaker;
      return resolveSpeakerName(reassignedSpeaker);
    };

    // Helper function to get segment text (apply edits)
    const getSegmentText = (
      segmentIndex: number,
      originalText: string,
    ): string => {
      return transcriptEdits.segmentTextEdits[segmentIndex] !== undefined
        ? transcriptEdits.segmentTextEdits[segmentIndex]
        : originalText;
    };

    // Determine if we should use full text or segmented view
    // Full text only when provideSummary is selected AND timestamps/speakers are NOT selected
    const useFullText =
      provideSummary && !includeTimestamps && !includeSpeakerIdentifier;

    const paragraphs: Paragraph[] = [];

    // Add summary at the top if it exists and provideSummary is checked
    if (provideSummary && summary) {
      paragraphs.push(
        new Paragraph({
          text: "Transcript Summary:",
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 200 },
        }),
      );
      paragraphs.push(
        new Paragraph({
          text: summary,
          spacing: { after: 400, line: 360 },
        }),
      );
    }

    if (useFullText) {
      // Download full text with edits applied
      if (typeof transcript === "string") {
        paragraphs.push(
          new Paragraph({
            text: transcript,
            spacing: { after: 300, line: 360 },
          }),
        );
      } else if (transcript.segments && transcript.segments.length > 0) {
        // Build full text from segments with edits
        const fullText = transcript.segments
          .map((segment, idx) => getSegmentText(idx, segment.text))
          .join(" ");

        paragraphs.push(
          new Paragraph({
            text: fullText,
            spacing: { after: 300, line: 360 },
          }),
        );
      } else {
        paragraphs.push(
          new Paragraph({
            text: transcript.fullText || "",
            spacing: { after: 300, line: 360 },
          }),
        );
      }
    } else {
      // Download segmented view
      if (typeof transcript === "string") {
        // If transcript is a string but we need segmented, just show the text
        paragraphs.push(
          new Paragraph({
            text: transcript,
            spacing: { after: 300, line: 360 },
          }),
        );
      } else if (transcript.segments && transcript.segments.length > 0) {
        // Process segments with edits applied
        transcript.segments.forEach((segment, segmentIndex) => {
          // Get edited speaker and text
          const editedSpeaker = getSegmentSpeaker(
            segmentIndex,
            segment.speaker,
          );
          const editedText = getSegmentText(segmentIndex, segment.text);

          // Create header line with speaker and timestamp
          const headerParts: TextRun[] = [];

          if (includeSpeakerIdentifier && editedSpeaker) {
            headerParts.push(
              new TextRun({
                text: editedSpeaker,
                bold: true,
                size: 28,
                color: "000000",
              }),
            );
          }

          if (includeTimestamps && segment.timestamp) {
            // Add spacing between speaker and timestamp
            if (includeSpeakerIdentifier && editedSpeaker) {
              headerParts.push(
                new TextRun({
                  text: "           ",
                  size: 28,
                }),
              );
            }
            headerParts.push(
              new TextRun({
                text: segment.timestamp,
                bold: false,
                size: 24,
                color: "666666",
              }),
            );
          }

          // Add header paragraph (speaker + timestamp on same line)
          if (headerParts.length > 0) {
            paragraphs.push(
              new Paragraph({
                children: headerParts,
                spacing: { after: 100 },
              }),
            );
          }

          // Add text paragraph below
          paragraphs.push(
            new Paragraph({
              text: editedText,
              spacing: { after: 300, line: 360 },
            }),
          );
        });
      } else {
        // Fallback to full text if segments are not available
        const fullText = transcript.fullText || "";
        paragraphs.push(
          new Paragraph({
            text: fullText,
            spacing: { after: 300, line: 360 },
          }),
        );
      }
    }

    const doc = new Document({
      sections: [
        {
          children: paragraphs,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "AudioToText_" + dayjs().format("DD_MM_YYYY") + ".docx");
  };

  return <AudioToText handleDownloadFile={handleDownloadFile} />;
};

export default AudioToTextPage;
