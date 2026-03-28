import { useAtom } from "jotai";
import {
  discussionGuideFlowAtom,
  discussionGuideStepAtom,
} from "../../../atoms/discussionGuideAtom";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  TableRow,
  TableCell,
  WidthType,
  Table,
  BorderStyle,
} from "docx";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import DiscussionGuide from "../../../features/main/discussionGuide/index";
import DiscussionGuideFooter from "../../../features/main/discussionGuide/Tool/Content/DiscussionGuideFooter";
import { stripHtml } from "../../../utils/textFormatter";

const DiscussionGuidePage = () => {
  const [step, setCurrentStep] = useAtom(discussionGuideStepAtom);
  const [discussionGuideFlow] = useAtom(discussionGuideFlowAtom);

  const nextStep = () => {
    setCurrentStep((prevStep) => ({
      ...prevStep,
      currentStep: prevStep.currentStep + 1,
    }));
  };

  const isNextButtonVisible = step.currentStep !== 0;

  const headerRow = new TableRow({
    children: [
      new TableCell({
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: "#",
                bold: true,
                size: 24,
              }),
            ],
          }),
        ],
        width: { size: 10, type: WidthType.PERCENTAGE },
        borders: {
          bottom: { style: BorderStyle.SINGLE, size: 2, space: 0 },
        },
      }),
      new TableCell({
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: "Section Title",
                bold: true,
                size: 24,
              }),
            ],
          }),
        ],
        width: { size: 60, type: WidthType.PERCENTAGE },
        borders: {
          bottom: { style: BorderStyle.SINGLE, size: 2, space: 0 },
        },
      }),
      new TableCell({
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: "Time",
                bold: true,
                size: 24,
              }),
            ],
          }),
        ],
        width: { size: 30, type: WidthType.PERCENTAGE },
        borders: {
          bottom: { style: BorderStyle.SINGLE, size: 2, space: 0 },
        },
      }),
    ],
  });

  const sectionRows =
    discussionGuideFlow.discussionFlowForm.sections?.map(
      (item, key) =>
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph(`${key + 1}`)],
              borders: {
                top: undefined,
                bottom: undefined,
                left: undefined,
                right: undefined,
              },
            }),
            new TableCell({
              children: [new Paragraph(item.sectionTitle ?? "No Title")],
              borders: {
                top: undefined,
                bottom: undefined,
                left: undefined,
                right: undefined,
              },
            }),
            new TableCell({
              children: [new Paragraph(item.time ?? "No Time")],
              borders: {
                top: undefined,
                bottom: undefined,
                left: undefined,
                right: undefined,
              },
            }),
          ],
        })
    ) ?? [];

  const sectionTable = new Table({
    rows: [headerRow, ...sectionRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });

  const handleDownloadFile = async () => {
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "1. Discussion Flow",
                  bold: true,
                  size: 24,
                  color: "000000",
                }),
              ],
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({ text: "" }),
            sectionTable,
            new Paragraph({ text: "" }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "2. Introduction & Background",
                  bold: true,
                  size: 24,
                  color: "000000",
                }),
              ],
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: stripHtml(
                    discussionGuideFlow.discussionGuideGeneratedAi
                      .introductionGenerated ?? ""
                  ),
                }),
              ],
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "3. Market Research Disclosures",
                  bold: true,
                  size: 24,
                  color: "000000",
                }),
              ],
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: stripHtml(
                    discussionGuideFlow.marketResearchForm
                      .marketResearchDisclousers ?? ""
                  ),
                }),
              ],
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "4. Discussion Topics",
                  bold: true,
                  size: 24,
                  color: "000000",
                }),
              ],
              heading: HeadingLevel.HEADING_1,
            }),
            ...discussionGuideFlow.discussionTopicsForm.sections?.reduce<
              Paragraph[]
            >((acc, sectionItem) => {
              acc.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: sectionItem.topics,
                      bold: true,
                    }),
                  ],
                  spacing: {
                    before: 50,
                    after: 200,
                  },
                })
              );
              sectionItem.generatedAiQuestions?.forEach((questionItem) => {
                acc.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `${questionItem.question}`,
                      }),
                    ],
                    bullet: { level: 0 },
                    spacing: {
                      after: 100,
                    },
                  })
                );
                questionItem.followUpQuestions?.forEach((followUp) => {
                  acc.push(
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `${followUp}`,
                        }),
                      ],
                      bullet: { level: 1 },
                      spacing: {
                        after: 150,
                      },
                    })
                  );
                });
              });
              return acc;
            }, []),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "Discussion_Guide_" + dayjs().format("DD_MM_YYYY") + ".docx");
  };

  return (
    <DiscussionGuide
      footer={
        <DiscussionGuideFooter
          step={step}
          setCurrentStep={setCurrentStep}
          nextStep={nextStep}
          isNextButtonVisible={isNextButtonVisible}
          handleDownloadFile={handleDownloadFile}
        />
      }
    />
  );
};

export default DiscussionGuidePage;
