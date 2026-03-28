import { Box } from "@mui/material";
import Docxtemplater from "docxtemplater";
import FileSaver from "file-saver";
import PizZip from "pizzip";
import { useState } from "react";
import DefaultButton from "../../../../components/layouts/DefaultButton";
import Spinner from "../../../../components/layouts/Spinner";
import Toast from "../../../../components/layouts/Toast";
import { hedgeHoxTrainingData } from "../../../../constants/training-data";
import useOpenAI from "../../../../hooks/useOpenAI";
import { formatJsonOpenAiResponse } from "../../../../utils/textFormatter";
import PowerpointSlideGeneratorForm from "./PowerPointSlideGeneratorForm";

const PowerpointSlideGeneratorTool = () => {
    const [value, setValue] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [showErrorMessage, setShowErrorMessage] = useState(false);
    const { chatCompletionOpenAi } = useOpenAI()

    const chatCompletionAI = async () => {
        setIsLoading(true);
        const response = await chatCompletionOpenAi([
            { role: "system", content: "I am a bot generating content response" },
            {
                role: "user",
                content: `Generate content for a powerpoint slide.
                The following is information about Hedgehox: ${hedgeHoxTrainingData}, please generate the content based on this information.
The slide will focus on ${value} and will leverage the training data that outlines what Hedgehox is and the services that they offer.
The output should be returned as a json object with two main objects: 1) the slide title, 2) bulleted list summarizing the content requested.
The content should not exceed 150 total words combined throughout all bullets.
KEEP ALWAYS THIS TYPE OF RESPONSE FORMAT as {
    "headline": "Headline of the slide...",
    "list": [{
        "content": "• Content of the slide..."
    }]
}`
            },
        ]);
        setIsLoading(false);
        return response
    }



    const generatePowerpointContent = ({ headline, list }: { headline: string, list: [{ content: string }] }) => {
        fetch('./ai-sample-slide1.pptx')
            .then(response => response.arrayBuffer())
            .then(buffer => {
                const zip = new PizZip(buffer);
                const doc = new Docxtemplater().loadZip(zip);

                doc.setData({
                    headline,
                    list: list?.map(
                        (item: { content: string }) => ({
                            content: item.content,
                        })
                    )
                });

                doc.render();

                const documentContent = doc.getZip().generate({ type: 'blob' });
                FileSaver.saveAs(documentContent, 'modifiedpptx_document.pptx');
            })
            .catch(error => console.error('Error loading document:', error));
    }


    const generateContent = async () => {
        const response = await chatCompletionAI();
        const formattedAiResponse = formatJsonOpenAiResponse(response)
        if (formattedAiResponse === 'error') {
            setShowErrorMessage(true)
            return
        }
        generatePowerpointContent({ headline: formattedAiResponse.headline, list: formattedAiResponse.list });
        setValue("");
    }

    return (
        <Box>
            <Box>
                <PowerpointSlideGeneratorForm value={value} onChange={(e) => setValue(e.target.value)} />
            </Box>
            <DefaultButton
                style={{
                    width: 200,
                    height: 45,
                    marginTop: 3,
                    marginBottom: 3
                }}
                type="primary"
                title="Generate"
                onClick={generateContent}
            />

            {isLoading && <Spinner overlay />}
            {showErrorMessage && <Toast
                open={showErrorMessage}
                onClose={() => setShowErrorMessage(false)}
                type="error"
                title="There was an error generating the content. Please try again."
            />}
        </Box>
    )

}

export default PowerpointSlideGeneratorTool
