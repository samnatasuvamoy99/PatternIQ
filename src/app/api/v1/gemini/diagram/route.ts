import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Ordered list of models to try — falls through on 503 / 404
const FALLBACK_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-2.5-flash",
  "gemini-2.5-flash-preview-05-20",
];

function buildSystemPrompt(category?: string): string {
  let instruction = `You are a technical diagram generator for a software engineering platform.
Generate a valid Mermaid diagram for the user's description.
Rules:
- Return ONLY the raw Mermaid code, without markdown code fences (no \`\`\`mermaid wrapper).
- Do NOT add %% comments or :::className class assignments. They break parsers.
- Do NOT use classDef or class statements.
- Use simple, clean node labels. Keep node text concise (max 5 words per label).
- Prefer graph TD or graph LR for flowcharts. Use erDiagram for databases, sequenceDiagram for APIs.
- Make the diagram meaningful and educational — not a placeholder.`;

  if (category) {
    const cat = category.toUpperCase();
    if (cat === "DATABASE") {
      instruction += "\nFocus on Entity-Relationship Diagrams (erDiagram) or tabular structures representing schemas.";
    } else if (cat === "SYSTEM_DESIGN") {
      instruction += "\nFocus on Architecture diagrams (graph TD/LR) representing microservices, databases, and client interactions.";
    } else if (cat === "DSA") {
      instruction += "\nFocus on flowcharts, tree structures, or array visualizations to explain Data Structures and Algorithms.";
    } else if (cat === "DEVOPS") {
      instruction += "\nFocus on CI/CD pipelines, deployment flows, or cloud infrastructure diagrams.";
    } else if (cat === "GENAI") {
      instruction += "\nFocus on AI/ML pipeline flows: data ingestion, model training, inference, and evaluation steps.";
    } else if (cat === "DEVELOPMENT") {
      instruction += "\nFocus on software architecture, class diagrams (classDiagram), or sequence diagrams (sequenceDiagram).";
    } else if (cat === "CORE_CS") {
      instruction += "\nFocus on OS, networking, or compiler concepts using clear flowcharts or state diagrams (stateDiagram-v2).";
    } else if (cat === "PROGRAMMING") {
      instruction += "\nFocus on control flow, recursion trees, or call stack visualizations using flowcharts.";
    }
  }

  return instruction;
}

function extractMermaid(raw: string): string {
  const trimmed = raw.trim();
  // Strip ```mermaid ... ``` fences if the model added them anyway
  const fenceMatch = trimmed.match(/^```(?:mermaid)?\s*\n?([\s\S]*?)```\s*$/);
  if (fenceMatch) return fenceMatch[1].trim();
  // Return raw code directly
  return trimmed;
}

export async function POST(req: Request) {
  try {
    const { prompt, category } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: { message: "Prompt is required" } },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: { message: "Gemini API key is not configured" } },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const systemPrompt = buildSystemPrompt(category);
    const fullPrompt = `${systemPrompt}\n\nUser Description:\n${prompt}`;

    let lastError: string = "Failed to generate diagram";

    for (const modelName of FALLBACK_MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(fullPrompt);
        const text = result.response.text();
        const mermaidCode = extractMermaid(text);

        console.log(`[Gemini] Successfully generated diagram using model: ${modelName}`);
        return NextResponse.json({ success: true, data: mermaidCode });
      } catch (modelError: any) {
        lastError = modelError.message || lastError;
        const is503 = modelError.message?.includes("503");
        const is404 = modelError.message?.includes("404");

        if (is503 || is404) {
          console.warn(`[Gemini] Model ${modelName} unavailable (${is503 ? "503" : "404"}), trying next...`);
          continue; // try the next model
        }

        // For any other error (auth, quota, bad request) — fail fast
        throw modelError;
      }
    }

    // All models failed
    return NextResponse.json(
      { success: false, error: { message: `All Gemini models are currently unavailable. Please try again in a moment. (${lastError})` } },
      { status: 503 }
    );
  } catch (error: any) {
    console.error("Error generating Gemini diagram:", error);
    return NextResponse.json(
      { success: false, error: { message: error.message || "Failed to generate diagram" } },
      { status: 500 }
    );
  }
}
