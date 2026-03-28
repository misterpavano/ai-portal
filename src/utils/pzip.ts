import PizZipUtils from "pizzip/utils/index.js";

export function loadFile(url: string, callback: any) {
    PizZipUtils.getBinaryContent(url, callback);
}
