import TextArea from "../../../../components/layouts/TextArea";

export type PowerpointSlideGeneratorFormProps = {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PowerpointSlideGeneratorForm = ({ value, onChange }: PowerpointSlideGeneratorFormProps) => {

    return (
        <TextArea
            styles={{ width: 500, minHeight: 100 }}
            topText="Describe the topic of the slide"
            value={value}
            onChange={onChange}
        />
    )
}

export default PowerpointSlideGeneratorForm