import { ArrowBack } from "@mui/icons-material";
import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import ReactQuill from "react-quill";

const BlogPrompt = ({ blog, quotes, handleBackButton }: { blog: string, quotes: string, handleBackButton: () => void }) => {
    const [blogValue, setBlogValue] = useState<string>("");
    const [quotesValue, setQuotesValue] = useState<string>("");

    useEffect(() => {
        setBlogValue(blog);
        setQuotesValue(quotes);
    }, [blog, quotes])

    return (
        <Box>
            <ArrowBack onClick={handleBackButton} style={{ cursor: "pointer", marginBlock: 20 }} />
            <ReactQuill
                value={blogValue}
                onChange={(content) => setBlogValue(content)}
                style={{
                    width: "100%",
                    minHeight: "600px",
                    marginBottom: "50px",
                    borderRadius: "8px",
                    flex: 1,
                }}
            />
            <ReactQuill
                value={quotesValue}
                onChange={(content) => setQuotesValue(content)}
                style={{
                    width: "100%",
                    minHeight: "600px",
                    marginBottom: "50px",
                    borderRadius: "8px",
                    flex: 1,
                }}
            />
        </Box>
    );
};

export default BlogPrompt;
