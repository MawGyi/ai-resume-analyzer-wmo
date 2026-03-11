// Note: pdf-parse usually requires careful importing in ESM, trying default export first
import * as pdfModule from "pdf-parse";
const pdf = (pdfModule as any).default || pdfModule;

// Server-side PDF Parsing Action
export async function action({ request }: { request: Request }) {
  try {
    const formData = await request.formData();
    const resumeFile = formData.get("resume") as File;

    if (!resumeFile || resumeFile.size === 0) {
      return Response.json({ error: "No file uploaded or file is empty." }, { status: 400 });
    }

    if (resumeFile.type !== "application/pdf") {
      return Response.json({ error: "Only PDF files are supported." }, { status: 400 });
    }

    // Convert File to ArrayBuffer, then to Buffer for pdf-parse
    const buffer = Buffer.from(await resumeFile.arrayBuffer());
    const data = await pdf(buffer);

    return Response.json({ 
      text: data.text,
      info: data.info,
      pages: data.numpages 
    });

  } catch (error) {
    console.error("PDF Parse Error:", error);
    return Response.json({ error: "Failed to parse PDF. Please check the file." }, { status: 500 });
  }
}
