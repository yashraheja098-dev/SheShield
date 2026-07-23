import axios from "axios";

export const handleAIChat = async (req, res) => {
  try {
    const { message, userLocation, destination, travelMode } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: "Gemini API key is not configured." });
    }

    const systemPrompt = `You are the SheShield AI Safety Assistant. Your goal is to provide women's safety recommendations, nearby safe places, route explanations, emergency guidance, and general safety tips. Keep responses concise, supportive, and highly practical.
Current Context:
- User Location: ${userLocation || "Unknown"}
- Destination: ${destination || "Unknown"}
- Travel Mode: ${travelMode || "Unknown"}
`;

    const payload = {
      system_instruction: { parts: { text: systemPrompt } },
      contents: [
        {
          parts: [{ text: message }]
        }
      ]
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json"
      }
    });

    const aiText = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";

    res.status(200).json({ reply: aiText });
  } catch (error) {
    console.error("Error in handleAIChat:", error.response?.data || error.message);
    res.status(500).json({ message: "AI Assistant error" });
  }
};
