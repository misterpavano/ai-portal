import { atom } from "jotai";
import { RouteValidatorFlow, RouteValidatorStep } from "../types/routeValidator";

export const routeValidatorStepAtom = atom<RouteValidatorStep>({
  currentStep: 0,
  isFinished: false,
});

const initialRouteValidatorValues: RouteValidatorFlow = {
  documentType: "route",
  file: {
    fileId: "",
    fileName: "",
  },
  tasks: [],
  selectedClient: "",
  clientBrand: "",
  organizationGuideline: undefined,
  brandGuideline: undefined,
  additionalNotes: "",
  annotatedFile: null,
  useAdditionalNotes: false,
  useAnnotatedFile: false,
  extractedImages: [],
  extractedText: "",
  geminiModel: undefined,
  aiReviewResults: undefined,
  threadId: undefined,
  validationResults: undefined,
};

export const routeValidatorFormAtom = atom<RouteValidatorFlow>(
  initialRouteValidatorValues
);

