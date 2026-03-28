import axios from "axios";
import mammoth from "mammoth";
import { API_URL } from "../constants/url";

const useAzureSharePoint = () => {
  const fetchFilesByDriveAndFolderId = async (folderId: string) => {
    try {
      const response = await axios.get(
        `${API_URL}/sharepoint/files/${folderId}`
      );
      return response.data;
    } catch (err) {
      console.error(err);
    }
  };

  const downloadFile = async (fileId: string) => {
    try {
      const response = await axios.get(
        `${API_URL}/sharepoint/download/${fileId}`,
        {
          headers: {
            "Content-Type": "application/octet-stream",
            "Content-Disposition": `attachment; filename=${fileId}`,
          },
          responseType: "arraybuffer",
        }
      );

      if (!response.data) {
        throw new Error(`Error fetching file: ${response.statusText}`);
      }

      const arrayBuffer = await response.data;
      const { value: plainText } = await mammoth.extractRawText({
        arrayBuffer,
      });
      return new Blob([plainText], { type: "text/plain" });
    } catch (err) {
      console.error(err);
    }
  };

  return { fetchFilesByDriveAndFolderId, downloadFile };
};

export default useAzureSharePoint;
