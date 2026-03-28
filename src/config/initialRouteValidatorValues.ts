import { RouteValidatorFlow } from "../types/routeValidator";

export const initialRouteValidatorValues: RouteValidatorFlow = {
  documentType: "",
  file: {
    fileId: "",
    fileName: "",
  },
  tasks: [],
  selectedClient: "",
  additionalNotes: "",
  annotatedFile: null,
  useAdditionalNotes: false,
  useAnnotatedFile: false,
  extractedImages: [],
  extractedText: "",
};
