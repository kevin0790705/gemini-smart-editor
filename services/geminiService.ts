import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY || '';

// Initialize AI instance
const ai = new GoogleGenAI({ apiKey: API_KEY });

const SYSTEM_INSTRUCTION = `
You are an expert technical writer and editor. Your goal is to produce or modify HTML content for a WYSIWYG editor.
You must strictly adhere to a provided "Specification Text".

**CITATION RULE (MANDATORY):**
- You must prove compliance with the Specification.
- Append a reference note to every major section header or key specific data field.
- Format: <small class="spec-ref">[Ref: "Section Name"]</small>
- **DO NOT INVENT PAGE NUMBERS.** Only cite the Section Name or Paragraph Topic found in the "Specification Text".
- If the spec text doesn't have headers, cite the key phrase, e.g., [Ref: "Formatting Rules"].

**HTML OUTPUT RULES:**
- Output raw HTML only. No markdown fences.
- Use <table> for data.
- Use <figure class="image"> for placeholders.
`;

/**
 * Generates the initial draft based on spec, topic, and optional example.
 */
export const generateDraft = async (
  specificationText: string,
  topic: string,
  exampleText?: string
): Promise<string> => {
  if (!API_KEY) throw new Error("API Key missing.");

  let prompt = `
    **TASK**: Generate a new HTML document based on the "Topic" following the "Specification" guidelines.
  `;

  if (exampleText && exampleText.trim()) {
    prompt += `
    **Reference Example (Style & Structure Template):**
    Use the following text as a concrete example of the desired tone, structure, and formatting. 
    Mimic the style of this example, but replace the content with the new "Topic" information.
    ---
    ${exampleText}
    ---
    `;
  }

  prompt += `
    **Specification (Source of Truth):**
    ${specificationText}

    **Topic / User Request:**
    ${topic}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.2, // Low temp for strict adherence
      },
    });

    return cleanResponse(response.text || '');
  } catch (error) {
    console.error("Gemini Generate Error:", error);
    throw new Error("Failed to generate draft.");
  }
};

/**
 * Refines existing content based on user instructions and the original spec.
 */
export const refineContent = async (
  specificationText: string,
  currentContent: string,
  instruction: string,
  exampleText?: string
): Promise<string> => {
  if (!API_KEY) throw new Error("API Key missing.");

  let prompt = `
    **TASK**: Update the "Current Content" based on the "User Instruction". 
    Ensure the updated content STILL complies with the "Specification".
  `;

  if (exampleText && exampleText.trim()) {
    prompt += `
    **Reference Example:**
    If the user instruction asks to match the style, refer to this text:
    ---
    ${exampleText}
    ---
    `;
  }

  prompt += `
    **Specification (Source of Truth):**
    ${specificationText}

    **Current HTML Content (Context):**
    ${currentContent}

    **User Instruction (What to change):**
    ${instruction}

    **Constraint:** 
    - Return the FULLY updated HTML document. Do not return just the changed part.
    - Maintain existing citations if valid, or add new ones if adding new sections.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.2,
      },
    });

    return cleanResponse(response.text || '');
  } catch (error) {
    console.error("Gemini Refine Error:", error);
    throw new Error("Failed to update content.");
  }
};

/**
 * Analyzes the content against the specification and returns a list of suggestions.
 */
export const analyzeContent = async (
  specificationText: string,
  currentContent: string
): Promise<string> => {
  if (!API_KEY) throw new Error("API Key missing.");

  const prompt = `
    **TASK**: Analyze the "Current Content" against the "Specification".
    Identify areas where the content might not fully comply with the specification or could be improved.

    **Specification (Source of Truth):**
    ${specificationText}

    **Current HTML Content:**
    ${currentContent}

    **Output Requirements:**
    1. **Language Detection**: Identify the primary language of the "Current HTML Content".
    2. **Response Language**: You MUST generate the suggestions in the SAME language as the "Current HTML Content".
    3. **Format**: Provide a concise list (bullet points) of 3-5 specific suggestions.
    4. **Content**: Focus on formatting, missing sections, tone, or specific data requirements from the spec.
    5. **No Code**: Do NOT generate HTML code. Just return plain text advice.
    6. **Success Message**: If the content looks good, return a message confirming compliance in the detected language.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.1,
      },
    });

    return response.text || 'No suggestions available.';
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze content.");
  }
};

const cleanResponse = (text: string): string => {
  return text.replace(/^```html\s*/i, '').replace(/\s*```$/, '');
};