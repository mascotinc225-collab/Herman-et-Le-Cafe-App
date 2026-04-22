import { GoogleGenAI } from "@google/genai";

export async function getSalesPredictions(transactions: any[]) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const prompt = `
    Based on the following historical sales data for "Herman & Le Café":
    ${JSON.stringify(transactions)}
    
    Current trends:
    - Peak times: 7-9am (Commuters) and 2-4pm (Frappuccino hour)
    - Popular: Ivorian Lattes and Frappuccinos.
    
    Task:
    1. Predict growth for next 4 weeks.
    2. Suggest 3 personalized offers to maximize revenue.
    3. Identify the highest potential customer segment.
    
    Return the response in JSON format:
    {
      "prediction": "string",
      "growthPercent": number,
      "suggestedOffers": [{"title": "string", "reason": "string"}],
      "segmentFocus": "string"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Prediction failed:", error);
    return {
      prediction: "Growth expected to continue as loyalty adoption increases.",
      growthPercent: 12,
      suggestedOffers: [
        { title: "Ivorian Blend Showcase", reason: "Highlight locally sourced 100% Ivorian beans" },
        { title: "Morning Bundle Perk", reason: "Increase average ticket size before 10am" }
      ],
      segmentFocus: "Regular commuters looking for premium locally sourced options."
    };
  }
}

export async function getPersonalizedOffers(customer: any) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const prompt = `
    Create 2 high-value, personalized coffee offers for a member of the "Herman & Le Café" Signature Brew Club.
    
    Context:
    - Customer: ${customer.name}
    - Tier: ${customer.tier}
    - Points: ${customer.points}
    - Progress: ${customer.stamps}/9 stamps
    - Location: Abidjan, Côte d'Ivoire (Premium, locally sourced beans)
    
    Strategy:
    - If points are low: Encourage the "Journey to Silver/Gold" (e.g., "Silver Horizon", "Gold Gateway").
    - If stamps are high (7+): Offer a "Final Stretch" reward (e.g., "Signature Finish").
    - Tier Specifics:
      - Bronze: Focus on "Leveling Up" and discovering the Signature Blend.
      - Silver: Focus on "Premium Perks" and "The Path to Gold".
      - Gold: Focus on "Mastery", "Reserved Batches", and "VIP Treatment".
    - Tone: Premium, sophisticated, yet warm and local (Abidjan vibe).
    
    Each offer MUST have:
    1. title: Captivating and exclusive (e.g., "The Ebrié Selection", "Grand Bassam Roast").
    2. description: Mention specifically how it aligns with their ${customer.tier} status.
    3. icon: One of (Coffee, Zap, Star, Gift, Crown, Trophy, Sparkles, Flame, Heart, Target)
    4. badge: High-status label like "SIGNATURE EXCLUSIVE", "VIP ACCESS", or "LIMITED RESERVE"
    
    Return the response in JSON format:
    {
      "offers": [
        {
          "title": "string",
          "description": "string",
          "icon": "string",
          "badge": "string"
        }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text).offers;
  } catch (error) {
    console.error("AI Offers failed:", error);
    return [
      { 
        title: "Exclusive Ivorian Roast", 
        description: "A special batch from Man region, exclusively for our ${customer.tier} members.", 
        icon: "Star" 
      },
      { 
        title: "Weekend Indulgence", 
        description: "Enjoy a complimentary pastry with any Frappuccino purchase this Saturday.", 
        icon: "Gift" 
      }
    ];
  }
}
