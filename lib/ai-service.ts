import { Activity } from './db/json-db';

// Gemini API direct REST call
async function queryGemini(prompt: string, apiKey: string): Promise<string> {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are EcoSphere, a helpful, encouraging, and knowledgeable carbon footprint tracking AI assistant. Your goal is to help the user understand, monitor, and reduce their carbon footprint. Provide actionable, specific suggestions. Keep answers clear, engaging, and under 150 words when possible. Here is the user's prompt: ${prompt}`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not process that suggestion.';
  } catch (error) {
    console.error('Gemini query failed, falling back to local engine:', error);
    throw error;
  }
}

// Local Semantic Rules Chatbot (offline/fallback mode)
const LOCAL_BOT_RESPONSES = [
  {
    keywords: ['hello', 'hi', 'hey', 'start'],
    response: 'Hello, Eco-Citizen! 🌍 I am your EcoSphere assistant. You can ask me how to reduce emissions in utilities, transportation, diet, or shopping, or query the impact of specific items (like "beef", "flying", or "recycled plastic")!',
  },
  {
    keywords: ['beef', 'meat', 'pork', 'lamb', 'cheese', 'dairy'],
    response: 'Eating animal proteins (especially beef and lamb) carries a high carbon cost (~27kg CO2e per kg of beef) due to methane production and farming resources. Swapping just one beef meal for chicken or beans saves around 4kg of CO2e! 🥗 Try joining our "Plant-Based Day" habit checklist.',
  },
  {
    keywords: ['car', 'petrol', 'gasoline', 'driving', 'vehicle'],
    response: 'Single-occupancy passenger driving is a massive carbon emitter. A gasoline car emits about 0.22kg of CO2e per kilometer. Walking, biking, or public transit are green alternatives. If you must drive, keep tires inflated properly to improve efficiency by 3%, or carpool with friends! 🚗',
  },
  {
    keywords: ['fly', 'flight', 'airplane', 'aviation'],
    response: 'Aviation accounts for ~2.5% of global emissions. A single short flight emits 150kg of CO2e, and long flights exceed 500kg per passenger. Consider taking high-speed rail for regional trips, vacationing locally, or offsetting necessary flights via our Offsets Planner page! ✈️',
  },
  {
    keywords: ['electricity', 'led', 'appliances', 'power', 'vampire'],
    response: 'Home utility emissions depend on local grid sources, averaging 0.4kg of CO2e per kWh. Swapping to LED bulbs saves up to 80% on lighting. Unplugging standby "vampire" loads (routers, TVs, chargers) saves up to 10% on electric bills! 💡',
  },
  {
    keywords: ['recycle', 'compost', 'waste', 'landfill'],
    response: 'Recycling cardboard, plastics, and glass keeps materials out of landfills where they rot and release methane. Composting organic scraps offsets about 120kg of CO2e annually. Bringing reusable grocery bags cuts plastic production emissions! ♻️',
  },
  {
    keywords: ['score', 'level', 'xp', 'points'],
    response: 'You earn XP and level up by logging daily sustainability habits or completing Community Challenges! Each milestone badge you unlock rewards you with +50 XP, boosting your ranking from a Green Novice towards a Climate Leader! 🏆',
  },
];

export async function getChatbotResponse(message: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      return await queryGemini(message, apiKey);
    } catch (e) {
      // Fall through to local matching
    }
  }

  // Local matching logic
  const query = message.toLowerCase();
  for (const item of LOCAL_BOT_RESPONSES) {
    if (item.keywords.some((kw) => query.includes(kw))) {
      return item.response;
    }
  }

  return 'That is a great sustainability question! Try focusing your habits on transportation, home utilities, or dietary adjustments. Cutting down personal vehicle trips and eating less beef are two of the highest-impact steps you can take. Ask me about those fields to learn more! 🌿';
}

// AI-powered Emission Prediction Engine
export interface PredictionData {
  monthName: string;
  projectedEmissions: number; // in tonnes CO2e (annualized rate)
  savingsAcquired: number; // cumulative savings logged in kg
}

export function generateEmissionForecasting(
  baselineTotal: number,
  activities: Activity[]
): PredictionData[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonthIdx = new Date().getMonth();
  
  // Calculate total savings logged per day/week
  const totalSavings = activities.reduce((sum, act) => sum + act.co2Saved, 0); // in kg
  
  // Projection logic:
  // Extrapolate savings over the last 30 days to annual rate.
  // Let's assume an average user trend. If they logged activities, we forecast reductions.
  // 1 kg saved cumulative is roughly 0.001 tonnes.
  // If they save 'totalSavings' kg over the active logs, we project progressive reductions month-by-month.
  
  const predictions: PredictionData[] = [];
  
  // Generate 6 months of forecasts starting from current month
  for (let i = 0; i < 6; i++) {
    const idx = (currentMonthIdx + i) % 12;
    // Progressive reduction modeling:
    // With continued habit logging, we project a 1.2% - 3.5% monthly reduction in annualized carbon footprints
    // depending on their active logging rate.
    const reductionMultiplier = Math.min(0.2, (totalSavings / 100) * 0.05); // capped at 20% max reduction for stability
    const projectedReduction = baselineTotal * (reductionMultiplier * (i / 5));
    const projected = Math.max(2.0, baselineTotal - projectedReduction); // Clamped at Paris Target (2.0 tonnes)
    
    predictions.push({
      monthName: months[idx] as string,
      projectedEmissions: parseFloat(projected.toFixed(2)),
      savingsAcquired: parseFloat((totalSavings + (totalSavings / 4) * i).toFixed(1)),
    });
  }

  return predictions;
}
