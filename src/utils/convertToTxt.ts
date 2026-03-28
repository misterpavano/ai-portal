import * as XLSX from "xlsx";
import { parse as csvParse } from "papaparse";

interface ConvertedFileInfo {
  file: File;
  originalFileName: string;
}

export const convertToTxtFile = async (
  file: File
): Promise<ConvertedFileInfo> => {
  const fileExtension = file.name.split(".").pop()?.toLowerCase();
  const originalFileName = file.name;

  if (!["csv", "xls", "xlsx"].includes(fileExtension || "")) {
    return { file, originalFileName };
  }

  try {
    let textContent = "";

    if (fileExtension === "csv") {
      const text = await file.text();
      const result = csvParse(text, { header: true });
      textContent = result.data
        .map((row) => Object.values(row as Record<string, any>).join("\t"))
        .join("\n");
    } else {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      textContent = jsonData
        .map((row) => Object.values(row as Record<string, any>).join("\t"))
        .join("\n");
    }

    const txtBlob = new Blob([textContent], { type: "text/plain" });
    const txtFile = new File([txtBlob], `${file.name.split(".")[0]}.txt`, {
      type: "text/plain",
    });

    return {
      file: txtFile,
      originalFileName,
    };
  } catch (error) {
    console.error("Error converting file:", error);
    throw error;
  }
};
