const axios = require("axios");
require("dotenv").config();

async function generatePondRecommendation(record) {
  const prompt = `
You are an aquaculture expert.

Analyze the pond data and return ONLY valid JSON in this format:

{
  "recommendation_text": "string",
  "risk_level": "normal" | "warning" | "critical",
  "confidence_score": number
}

Rules:
- Short practical recommendation
- risk_level must be normal, warning, or critical
- confidence_score between 0 and 1
- STRICT JSON only

Pond data:
- pond_id: ${record.pond_id}
- fish_count: ${record.fish_count}
- average_weight_g: ${record.average_weight_g}
- feed_given_kg: ${record.feed_given_kg}
- water_temperature_c: ${record.water_temperature_c}
- ph: ${record.ph}
- dissolved_oxygen: ${record.dissolved_oxygen}
- mortality_count: ${record.mortality_count}
- observations: ${record.observations || ""}
`;

  try {
    const response = await axios.post(
      "https://api.mistral.ai/v1/chat/completions",
      {
        model: "mistral-small",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.2,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    let text = response.data.choices[0].message.content.trim();

    // Clean JSON (important)
    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(text);
  } catch (error) {
    console.error("Mistral error:", error.response?.data || error.message);

    // fallback response (VERY IMPORTANT so your app doesn't break)
    return {
      recommendation_text:
        "Unable to generate AI recommendation. Please review pond conditions manually.",
      risk_level: "warning",
      confidence_score: 0.5,
    };
  }
}

module.exports = { generatePondRecommendation };