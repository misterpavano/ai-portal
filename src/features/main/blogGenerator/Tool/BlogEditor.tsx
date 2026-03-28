import { Stack } from "@mui/material";
import { useState } from "react";
import TextArea from "../../../../components/layouts/TextArea";
import DefaultButton from "../../../../components/layouts/DefaultButton";

const BlogEditor = ({ handleGeneratePrompt, isDisabled }: { handleGeneratePrompt: (value: string) => void, isDisabled: boolean }) => {
    const [value, setValue] = useState<string>("");

    const handleTextAreaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);
    };

    return (
        <Stack alignItems='flex-start'>
            <TextArea
                value={value}
                onChange={handleTextAreaChange}
                topText="Enter your prompt*"
                styles={{ width: 520, height: 400 }}
            />
            <DefaultButton
                onClick={() => handleGeneratePrompt(value)}
                style={{ marginTop: "20px", height: "40px", width: "100px" }}
                title={"Generate"}
                disabled={isDisabled}
                type={"primary"}
            />
        </Stack>
    );
};

export default BlogEditor;
