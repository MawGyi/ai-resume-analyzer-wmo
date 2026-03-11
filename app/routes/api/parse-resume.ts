import { data } from "react-router";
import type { ActionFunctionArgs } from "react-router";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

const SUPPORTED_PDF = ["application/pdf"];
const SUPPORTED_DOCX = [
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];

// Server-side Resume Parsing Action — supports PDF and DOCX
export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();
    const resumeFile = formData.get("resume") as File;

    if (!resumeFile || resumeFile.size === 0) {
      return data({ error: "No file uploaded or file is empty." }, { status: 400 });
    }

    const buffer = Buffer.from(await resumeFile.arrayBuffer());
    const mimeType = resumeFile.type;

    // Also detect by extension if MIME type is generic
    const fileName = resumeFile.name.toLowerCase();
    const ext = fileName.split(".").pop();

    const isPdf = SUPPORTED_PDF.includes(mimeType) || ext === "pdf";
    const isDocx = SUPPORTED_DOCX.includes(mimeType) || ext === "docx" || ext === "doc";

    if (!isPdf && !isDocx) {
      return data(
        { error: "Unsupported file format. Please upload a PDF or DOCX file." },
        { status: 400 }
      );
    }

    let text = "";
    let pages = 0;

    if (isPdf) {
      const pdfParser = new PDFParse({ data: buffer });
      const result = await pdfParser.getText();
      text = result.text;
      pages = result.total;
      await pdfParser.destroy();
    } else if (isDocx) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
      pages = 1;
    }

    if (!text || text.trim().length === 0) {
      return data(
        { error: "Could not extract any text. The file may be image-based or corrupted." },
        { status: 422 }
      );
    }

    return data({ text, pages });

  } catch (error) {
    console.error("Resume Parse Error:", error);
    return data(
      { error: "Failed to parse the resume. Please check the file and try again." },
      { status: 500 }
    );
  }
}
