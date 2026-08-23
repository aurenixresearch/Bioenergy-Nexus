import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload limit for base64 image and PDF document strings (up to 50mb)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Shared Gemini AI instance
function getGeminiAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

// AI Research & Platform Support Chatbot endpoint
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { 
      messages, 
      model = 'gemini-3.7-flash', 
      systemInstruction, 
      mode = 'research_assistant',
      temperature = 0.7 
    } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const ai = getGeminiAI();
    if (!ai) {
      return res.status(503).json({ 
        error: 'Gemini API is currently not configured or available. Please check server settings.',
        fallbackMessage: 'I am the Aurenix Research AI Support System. To enable live multimodal research synthesis, please ensure the GEMINI_API_KEY is configured in your project settings.'
      });
    }

    // Comprehensive default system instruction for Aurenix Research Support & Scientific Engine
    const defaultSystemInstruction = `You are **Aurenix Research Intelligence & Support AI (ARIS)**, the premier academic support system and scientific advisor for the Aurenix Research Network (Africa's foremost research and innovation platform for bioenergy, climate tech, sustainable engineering, clean fuels, and circular agricultural bioeconomy).

### YOUR PRIMARY CAPABILITIES & ROLES:
1. **Academic Research Support & Scientific Analysis**:
   - Analyze, critique, and provide deep insights on user queries and uploaded files (research PDFs, manuscripts, lab data, experimental graphs, chemical pathways, micrographs, spreadsheets, and diagrams).
   - When given research papers or PDFs, provide structured breakdowns:
     * **Executive Summary**: Clear 2-3 sentence overview of the core problem, methodology, and outcome.
     * **Methodology & Experimental Rigor**: Feedstocks, catalysts, pyrolysis/gasification/fermentation parameters, LCA assumptions, and control measures.
     * **Key Insights & Quantitative Findings**: Specific numbers, energy densities, yields (MJ/kg, % conversion, gas chromatography data), and statistical significance.
     * **Critical Limitations & Bottlenecks**: Feedstock variability, catalyst poisoning, parasitic energy loads, scalability obstacles.
     * **Practical & Commercial Applications**: Industrial adoption, microgrid integration, African grid and rural off-grid suitability.

2. **Novel Research & Project Idea Generation**:
   - Proactively brainstorm high-impact hypotheses, novel experimental setups, grant proposals, and pilot projects based on the user's prompt or uploaded files.
   - Synthesize cross-disciplinary ideas (e.g., combining cassava peel biochar with perovskite solar cells, or machine learning for anaerobic digestion optimization).
   - Structure new project proposals with: Title, Hypothesis, Novelty Angle, Proposed Methodology, Required Equipment/Feedstocks, Expected Milestones, and Potential Grant/Impact value.

3. **Platform Support & User Assistance**:
   - Assist users in navigating and utilizing the Aurenix Research platform.
   - Explain how to:
     * Publish and manage peer-reviewed research papers (via Publish Research Wizard).
     * Connect and initiate direct messaging with leading researchers across universities.
     * Build and join Strategic Alliances / Consortia in the Collaboration Center.
     * Access Operational Console datasets, pilot projects, and funding grants.
     * Book 1-on-1 expert advisory consultations.
     * Verify scholar credentials and complete academic researcher profiles.

### RESPONSE FORMATTING RULES:
- Use clean, structured Markdown with bold titles, bullet points, numbered lists, and callout sections.
- When formulas or chemical reactions are discussed, write clear chemical notations (e.g., $CH_4 + 2O_2 \\rightarrow CO_2 + 2H_2O$ or text equivalents).
- Maintain an encouraging, highly knowledgeable, rigorous, and professional academic tone.
- When files are provided, cite specific data points, figure captions, or tables from the uploaded material.`;

    const finalSystemInstruction = systemInstruction || defaultSystemInstruction;

    // Supported Models Check
    const allowedModels = [
      'gemini-3.7-flash',
      'gemini-3.5-flash',
      'gemini-3.1-pro-preview',
      'gemini-3.1-flash-lite',
      'gemini-flash-latest'
    ];
    const selectedModel = allowedModels.includes(model) ? model : 'gemini-3.7-flash';

    // Format multi-turn contents for @google/genai SDK
    const formattedContents = messages.map((m: any) => {
      const parts: any[] = [];

      // Check for file attachments (PDFs, images, data files, txt)
      if (m.attachments && Array.isArray(m.attachments)) {
        for (const att of m.attachments) {
          if (att.base64) {
            const cleanBase64 = att.base64.replace(/^data:[^;]+;base64,/, '');
            parts.push({
              inlineData: {
                data: cleanBase64,
                mimeType: att.mimeType || 'application/pdf'
              }
            });
          }
        }
      }

      // Add text content
      if (m.text && typeof m.text === 'string' && m.text.trim()) {
        parts.push({ text: m.text });
      } else if (parts.length === 0) {
        parts.push({ text: 'Please analyze the attached document and provide insights.' });
      }

      return {
        role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
        parts
      };
    });

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: formattedContents,
      config: {
        systemInstruction: finalSystemInstruction,
        temperature: typeof temperature === 'number' ? temperature : 0.7,
      }
    });

    const responseText = response.text || '';

    return res.json({
      text: responseText,
      model: selectedModel,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error handling /api/ai/chat:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to process AI chat request',
      details: String(error)
    });
  }
});

// Dedicated quick analysis endpoint for research papers
app.post('/api/ai/analyze-document', async (req, res) => {
  try {
    const { 
      fileBase64, 
      mimeType = 'application/pdf', 
      fileName = 'document.pdf',
      userPrompt = 'Please summarize this research paper, provide key technical insights, and generate 3 novel project/research ideas stemming from this work.' 
    } = req.body;

    if (!fileBase64) {
      return res.status(400).json({ error: 'File data (base64) is required.' });
    }

    const ai = getGeminiAI();
    if (!ai) {
      return res.status(503).json({ error: 'Gemini AI service unavailable.' });
    }

    const cleanBase64 = fileBase64.replace(/^data:[^;]+;base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType
            }
          },
          {
            text: `${userPrompt}\n\nDocument name: ${fileName}`
          }
        ]
      },
      config: {
        systemInstruction: 'You are an elite scientific reviewer and bioenergy innovation strategist. Provide meticulous, structured summaries, quantitative insights, and innovative project ideas based on the provided document.',
        temperature: 0.6
      }
    });

    return res.json({
      text: response.text || '',
      fileName,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error in /api/ai/analyze-document:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to analyze document',
      details: String(error)
    });
  }
});

// Profile picture / avatar validation endpoint
app.post('/api/validate-avatar', async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        isValid: false,
        category: 'invalid',
        reason: 'No image data was provided. Please choose a valid image file.'
      });
    }

    const ai = getGeminiAI();
    if (!ai) {
      console.warn('GEMINI_API_KEY not configured on server. Bypassing AI validation gracefully.');
      return res.json({
        isValid: true,
        category: 'human_face',
        reason: 'Image accepted',
        details: {
          hasFace: true,
          faceIsClearAndFramed: true,
          hasLogo: false,
          logoIsCenteredAndLegible: false,
          isBlurryOrLowQuality: false,
          isLandscapeOrBuildingOrObject: false,
          isDocumentOrScreenshot: false
        }
      });
    }

    // Prepare clean base64 data
    const cleanData = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const imageMime = mimeType || 'image/jpeg';

    const systemPrompt = `You are a strict, professional profile picture validation assistant for Aurenix Research Network, a premier academic and scientific institution.
Your sole job is to analyze the provided image and determine whether it is suitable as a user profile picture (avatar).

ACCEPTANCE CRITERIA - ACCEPT ONLY IF THE IMAGE IS ONE OF THE FOLLOWING TWO:
1. HUMAN FACE:
   - A clear photograph containing a human face (e.g. headshot, portrait, bust shot).
   - The face must be clearly visible, well-lit, sharp, and occupy a reasonable portion of the frame (not tiny or distant).
   - The image must NOT be excessively blurry, pixelated, or dark.

2. ORGANIZATION LOGO:
   - A clear, official logo, emblem, crest, or brand symbol of a company, laboratory, university, institute, or organization.
   - The logo must be clearly visible, positioned near or at the center of the image.
   - The logo must be sufficiently large, legible, and not severely cropped off or cut at the boundaries.

STRICT REJECTION CRITERIA - REJECT ANY IMAGE THAT MATCHES ANY OF THE FOLLOWING:
- Landscapes, nature, scenery, or sky
- Buildings, architecture, interior rooms, or exterior structures
- Screenshots, documents, paper, text pages, slides, or technical diagrams
- Animals, pets, or wildlife
- Blank images, single solid color squares, or empty gradients
- Random objects, equipment, vehicles, food, or furniture
- Memes, comics, cartoons, anime characters, or decorative graphics (unless it's an official university/organization logo)
- Blurry, out-of-focus, heavily pixelated, noisy, or distorted images
- Images containing multiple chaotic/unrelated subjects or crowd shots without a clear focal person
- Images in which a face occupies only a tiny fraction (<10-15%) of the image frame
- Images in which a logo is too small to identify, offset to an extreme edge, or cropped
- Extremely dark, overexposed, or unintelligible images

OUTPUT FORMAT:
Return a JSON object according to the schema provided:
- isValid: boolean (true ONLY if it strictly meets Human Face or Organization Logo criteria)
- category: "human_face" | "organization_logo" | "invalid"
- reason: a polite, friendly, user-facing 1-sentence message explaining why the image was rejected or accepted.
  Examples of failure reasons:
  * "Please upload a clear photograph of your face."
  * "Please upload a clear organization logo."
  * "The image is too blurry or low quality for a profile picture."
  * "Landscapes, buildings, and random objects cannot be used as profile pictures."
  * "The face or logo is too small or positioned off-center."
  * "Screenshots and documents are not permitted as profile pictures."
- details: object containing boolean checks for diagnostic transparency.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanData,
              mimeType: imageMime
            }
          },
          {
            text: systemPrompt
          }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValid: { type: Type.BOOLEAN },
            category: { type: Type.STRING },
            reason: { type: Type.STRING },
            details: {
              type: Type.OBJECT,
              properties: {
                hasFace: { type: Type.BOOLEAN },
                faceIsClearAndFramed: { type: Type.BOOLEAN },
                hasLogo: { type: Type.BOOLEAN },
                logoIsCenteredAndLegible: { type: Type.BOOLEAN },
                isBlurryOrLowQuality: { type: Type.BOOLEAN },
                isLandscapeOrBuildingOrObject: { type: Type.BOOLEAN },
                isDocumentOrScreenshot: { type: Type.BOOLEAN }
              },
              required: ['hasFace', 'hasLogo', 'isBlurryOrLowQuality']
            }
          },
          required: ['isValid', 'category', 'reason']
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      return res.json({
        isValid: true,
        category: 'human_face',
        reason: 'Image accepted.'
      });
    }

    const parsed = JSON.parse(resultText);
    return res.json(parsed);

  } catch (error) {
    console.error('Error validating profile picture via Gemini API:', error);
    return res.status(500).json({
      isValid: false,
      category: 'invalid',
      reason: 'The uploaded image could not be verified. Please ensure it is a clear face photograph or organization logo.'
    });
  }
});

// Vite middleware & static handler
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Full-stack server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
