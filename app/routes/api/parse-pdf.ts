import { json } from "react-router";
import type { ActionFunctionArgs } from "react-router";
import pdf from "pdf-parse";

// Server-side PDF Parsing Action
export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();
    const resumeFile = formData.get("resume") as File;

    if (!resumeFile || resumeFile.size === 0) {
      return json({ error: "No file uploaded or file is empty." }, { status: 400 });
    }

    if (resumeFile.type !== "application/pdf") {
      return json({ error: "Only PDF files are supported." }, { status: 400 });
    }

    // Convert File to ArrayBuffer, then to Buffer for pdf-parse
    const buffer = Buffer.from(await resumeFile.arrayBuffer());
    const data = await pdf(buffer);

    return json({ 
      text: data.text,
      info: data.info,
      pages: data.numpages 
    });

  } catch (error) {
    console.error("PDF Parse Error:", error);
    return json({ error: "Failed to parse PDF. Please check the file." }, { status: 500 });
  }
}
