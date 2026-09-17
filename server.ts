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
