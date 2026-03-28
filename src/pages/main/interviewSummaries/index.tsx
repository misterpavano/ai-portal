import { useAtom } from "jotai";
import InterviewSummaries from "../../../features/main/interviewSummaries";
import { interviewSummariesFormAtom } from "../../../atoms/interviewDiscusstionGuideAtom";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} from "docx";
import PptxGenJS from "pptxgenjs";
import { saveAs } from "file-saver";
import dayjs from "dayjs";

const InterviewSummariesPage = () => {
  const [interviewSummaries] = useAtom(interviewSummariesFormAtom);

  const generateParagraphsFromHtml = (htmlContent: string): Paragraph[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");
    const paragraphs: Paragraph[] = [];

    doc.body.childNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;

        if (element.tagName === "UL") {
          element.querySelectorAll("li").forEach((li) => {
            paragraphs.push(
              new Paragraph({
                text: li.textContent || "",
                bullet: { level: 0 },
              }),
            );
          });
        } else if (element.tagName === "H3") {
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: element.textContent || "",
                  bold: true,
                  size: 24,
                }),
              ],
              spacing: { after: 200 },
            }),
          );
        } else {
          paragraphs.push(
            new Paragraph({
              text: element.textContent || "",
            }),
          );
        }
      }
    });

    return paragraphs;
  };

  const createSectionBox = (title: string, content: Paragraph[]): Table => {
    return new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: title,
                      bold: true,
                      size: 28,
                      color: "000000",
                    }),
                  ],
                  heading: HeadingLevel.HEADING_1,
                }),
                ...content,
              ],
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 4, space: 0 },
                bottom: { style: BorderStyle.SINGLE, size: 4, space: 0 },
                left: { style: BorderStyle.SINGLE, size: 4, space: 0 },
                right: { style: BorderStyle.SINGLE, size: 4, space: 0 },
              },
              shading: {
                fill: "FFFFFF",
              },
            }),
          ],
        }),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
    });
  };

  const generateSlidesFromHtml = (
    pptx: any,
    componentTitle: string,
    htmlContent: string,
  ) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");

    // Extract topics and their bullets
    const topics: Array<{ title: string; bullets: string[] }> = [];
    let currentTopic: { title: string; bullets: string[] } | null = null;

    doc.body.childNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;

        if (element.tagName === "H3") {
          // Save previous topic if exists
          if (currentTopic) {
            topics.push(currentTopic);
          }
          // Start new topic
          currentTopic = {
            title: element.textContent || "",
            bullets: [],
          };
        } else if (element.tagName === "UL") {
          // If no H3 was provided, create a default topic so bullets aren't dropped
          if (!currentTopic) {
            currentTopic = {
              title: componentTitle,
              bullets: [],
            };
          }
          // Extract bullets for current topic
          element.querySelectorAll("li").forEach((li) => {
            const bulletText = li.textContent || "";
            if (bulletText.trim()) {
              currentTopic!.bullets.push(bulletText.trim());
            }
          });
        }
      }
    });

    // Don't forget the last topic
    if (currentTopic) {
      topics.push(currentTopic);
    }

    // Create one slide per topic
    topics.forEach((topic) => {
      // Topic with foursquare bullet (■)
      const topicText = `■ ${topic.title}`;

      // Helper function to create a new slide with header
      const createSlideWithHeader = () => {
        const newSlide = pptx.addSlide();
        // Component title at the top (e.g., "Key Takeaways")
        newSlide.addText(componentTitle, {
          x: 0.5,
          y: 0.3,
          w: 9.0,
          h: 0.5,
          fontSize: 22,
          fontFace: "Arial",
          bold: true,
          color: "2C3E50",
          align: "left",
        });
        return newSlide;
      };

      const contentStartY = 1.2;
      const bulletLineHeight = 0.25;
      const maxYPosition = 6.5;
      const slideWidth = 9.0;
      const charsPerLine = 80;
      const maxLinesPerSlide = Math.floor(
        (maxYPosition - contentStartY) / bulletLineHeight,
      );

      const bulletChunks: string[][] = [];
      let currentChunk: string[] = [];
      let currentLines = 0;

      topic.bullets.forEach((bulletText) => {
        const textWithBullet = `• ${bulletText}`;
        const estimatedLines = Math.max(
          1,
          Math.ceil(textWithBullet.length / charsPerLine),
        );

        if (
          currentChunk.length > 0 &&
          currentLines + estimatedLines > maxLinesPerSlide
        ) {
          bulletChunks.push(currentChunk);
          currentChunk = [];
          currentLines = 0;
        }

        currentChunk.push(textWithBullet);
        currentLines += estimatedLines;
      });

      if (currentChunk.length > 0) {
        bulletChunks.push(currentChunk);
      }

      bulletChunks.forEach((chunk) => {
        const slide = createSlideWithHeader();
        const bulletsText = chunk.join("\n");
        const estimatedLines = chunk.reduce(
          (sum, line) =>
            sum + Math.max(1, Math.ceil(line.length / charsPerLine)),
          0,
        );
        const textHeight = Math.max(1, estimatedLines) * bulletLineHeight;

        // Topic as its own element
        slide.addText(topicText, {
          x: 0.5,
          y: contentStartY,
          w: slideWidth - 0.3,
          h: 0.6,
          fontSize: 16,
          fontFace: "Arial",
          bold: true,
          color: "1F4E78",
          align: "left",
        });

        // Bullets as a single element
        slide.addText(bulletsText, {
          x: 0.8,
          y: contentStartY + 0.6,
          w: slideWidth - 0.3,
          h: textHeight,
          fontSize: 12,
          fontFace: "Arial",
          color: "000000",
          align: "left",
          lineSpacing: 20,
          breakLine: true,
        });
      });
    });
  };

  const handleDownloadFile = async (type: "Word" | "Powerpoint") => {
    const keyTakeaways = generateParagraphsFromHtml(
      (
        interviewSummaries.generatedInterviewSummaries.generatedKeyTakeaways ??
        []
      ).join(" "),
    );

    const actionItems = generateParagraphsFromHtml(
      (
        interviewSummaries.generatedInterviewSummaries.generatedActions ?? []
      ).join(" "),
    );

    const detailedInsights = generateParagraphsFromHtml(
      (
        interviewSummaries.generatedInterviewSummaries
          .generatedDetailedInsights ?? []
      ).join(" "),
    );

    const keyRecommendations = generateParagraphsFromHtml(
      (
        interviewSummaries.generatedInterviewSummaries
          .generatedKeyRecommendations ?? []
      ).join(" "),
    );

    if (type === "Word") {
      const doc = new Document({
        sections: [
          {
            children: [
              createSectionBox("1. Key Takeaways", keyTakeaways),
              new Paragraph({ text: "" }),

              createSectionBox("2. Key Recommendations", keyRecommendations),
              new Paragraph({ text: "" }),

              createSectionBox("3. Action Items", actionItems),
              new Paragraph({ text: "" }),

              createSectionBox("4. Detailed Insights", detailedInsights),
            ],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(
        blob,
        "Interview_Summaries_" + dayjs().format("DD_MM_YYYY") + ".docx",
      );
    } else if (type === "Powerpoint") {
      const pptx = new PptxGenJS();

      generateSlidesFromHtml(
        pptx,
        "1. Key Takeaways",
        (
          interviewSummaries.generatedInterviewSummaries
            .generatedKeyTakeaways ?? []
        ).join(" "),
      );

      generateSlidesFromHtml(
        pptx,
        "2. Key Recommendations",
        (
          interviewSummaries.generatedInterviewSummaries
            .generatedKeyRecommendations ?? []
        ).join(" "),
      );

      generateSlidesFromHtml(
        pptx,
        "3. Action Items",
        (
          interviewSummaries.generatedInterviewSummaries.generatedActions ?? []
        ).join(" "),
      );

      generateSlidesFromHtml(
        pptx,
        "4. Detailed Insights",
        (
          interviewSummaries.generatedInterviewSummaries
            .generatedDetailedInsights ?? []
        ).join(" "),
      );

      pptx.writeFile({
        fileName:
          "Interview_Summaries_" + dayjs().format("DD_MM_YYYY") + ".pptx",
      });
    }
  };

  const handleDownloadToplineFile = async (type: "Word" | "Powerpoint") => {
    const keyTakeaways = generateParagraphsFromHtml(
      (
        interviewSummaries.generatedInterviewSummaries.generatedKeyTakeaways ??
        []
      ).join(" "),
    );

    const actionItems = generateParagraphsFromHtml(
      (
        interviewSummaries.generatedInterviewSummaries.generatedActions ?? []
      ).join(" "),
    );

    const detailedInsights = generateParagraphsFromHtml(
      (
        interviewSummaries.generatedInterviewSummaries
          .generatedDetailedInsights ?? []
      ).join(" "),
    );

    const keyRecommendations = generateParagraphsFromHtml(
      (
        interviewSummaries.generatedInterviewSummaries
          .generatedKeyRecommendations ?? []
      ).join(" "),
    );

    if (type === "Word") {
      const doc = new Document({
        sections: [
          {
            children: [
              createSectionBox("1. Key Takeaways", keyTakeaways),
              new Paragraph({ text: "" }),

              createSectionBox("2. Action Items", actionItems),
              new Paragraph({ text: "" }),

              createSectionBox("3. Detailed Insights", detailedInsights),
              new Paragraph({ text: "" }),

              createSectionBox("4. Key Recommendations", keyRecommendations),
            ],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(
        blob,
        "Executive_Interview_Summaries_" +
          dayjs().format("DD_MM_YYYY") +
          ".docx",
      );
    } else if (type === "Powerpoint") {
      const pptx = new PptxGenJS();

      generateSlidesFromHtml(
        pptx,
        "1. Key Takeaways",
        (
          interviewSummaries.generatedToplineInterviewSummaries
            .generatedToplineKeyTakeaways ?? []
        ).join(" "),
      );

      generateSlidesFromHtml(
        pptx,
        "2. Action Items",
        (
          interviewSummaries.generatedToplineInterviewSummaries
            .generatedToplineActions ?? []
        ).join(" "),
      );

      generateSlidesFromHtml(
        pptx,
        "3. Key Recommendations",
        (
          interviewSummaries.generatedToplineInterviewSummaries
            .generatedToplineKeyRecommendations ?? []
        ).join(" "),
      );

      pptx.writeFile({
        fileName:
          "Topline_Interview_Summaries_" +
          dayjs().format("DD_MM_YYYY") +
          ".pptx",
      });
    }
  };

  return (
    <InterviewSummaries
      handleDownloadFile={handleDownloadFile}
      handleToplineDownloadFile={handleDownloadToplineFile}
    />
  );
};

export default InterviewSummariesPage;
