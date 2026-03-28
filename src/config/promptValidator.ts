import { Validator } from "../types/promptValidator";

export const initialValidators: Validator[] = [
  {
    id: 0,
    checked: false,
    name: "Audience",
    desc: "Group for whom the content is specifically designed and targeted.",
  },
  {
    id: 1,
    checked: false,
    name: "Objective",
    desc: "The primary goal or intended outcome of the discussion.",
  },
  {
    id: 2,
    checked: false,
    name: "Caveats",
    desc: "Specific conditions or limitations that affect the discussion's scope or content.",
  },
  {
    id: 3,
    checked: false,
    name: "Phrasing",
    desc: "Choice of words and style used in the questions and dialogue.",
  },
  {
    id: 4,
    checked: false,
    name: "Length",
    desc: "The total duration or word count allocated for the discussion.",
  },
  {
    id: 5,
    checked: false,
    name: "Tone",
    desc: "The overall feeling or attitude conveyed through the language used.",
  },
  {
    id: 6,
    checked: false,
    name: "Tense",
    desc: "The grammatical time setting indicating when the events are happening.",
  },
];
