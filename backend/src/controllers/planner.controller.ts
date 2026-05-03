import { Request, Response } from 'express';
import Groq from 'groq-sdk';
import supabase from '../config/supabase';
import { env } from '../config/env';
import { logger } from '../config/logger';

// ──────────────────────────────────────────────────────────────
// ORIGIN CITY PRICE DATABASE (2026 verified via MakeMyTrip/IRCTC/Google)
// NOTE: Flight prices are for connecting flights where no direct exists
// All prices are ONE-WAY per person
// ──────────────────────────────────────────────────────────────
interface CityData { train?: { sl: number; ac3: number; ac2: number; hours: number }; bus?: { cost: number; hours: number }; flight?: { min: number; max: number; hours: number; isDirect: boolean }; minBudgetPerDay: number; }
const CITY_PRICES: Record<string, CityData> = {
  // --- NEARBY (within Jharkhand / Bihar) ---
  'ranchi':      {                                                       bus: { cost: 0, hours: 0 },                                                                       minBudgetPerDay: 600 },
  'dhanbad':     { train: { sl: 120, ac3: 350, ac2: 550, hours: 2.5 },  bus: { cost: 200, hours: 3 },                                                                       minBudgetPerDay: 600 },
  'jamshedpur':  { train: { sl: 150, ac3: 400, ac2: 650, hours: 3.5 },  bus: { cost: 250, hours: 4 },                                                                       minBudgetPerDay: 600 },
  'deoghar':     { train: { sl: 180, ac3: 450, ac2: 700, hours: 4 },    bus: { cost: 280, hours: 5 },                                                                       minBudgetPerDay: 600 },
  'bokaro':      { train: { sl: 100, ac3: 300, ac2: 500, hours: 2 },    bus: { cost: 180, hours: 3 },                                                                       minBudgetPerDay: 600 },
  'patna':       { train: { sl: 350, ac3: 850, ac2: 1300, hours: 7 },   bus: { cost: 450, hours: 8 },                                                                       minBudgetPerDay: 700 },

  // --- EAST INDIA ---
  'kolkata':     { train: { sl: 400, ac3: 1050, ac2: 1600, hours: 8 },  bus: { cost: 550, hours: 9 },   flight: { min: 4500, max: 7500, hours: 1.5, isDirect: true },        minBudgetPerDay: 800 },
  'bhubaneswar': { train: { sl: 450, ac3: 1100, ac2: 1700, hours: 9 },                                  flight: { min: 5500, max: 9000, hours: 3, isDirect: false },          minBudgetPerDay: 800 },
  'guwahati':    { train: { sl: 600, ac3: 1600, ac2: 2500, hours: 18 },                                 flight: { min: 6000, max: 10000, hours: 3, isDirect: false },         minBudgetPerDay: 850 },

  // --- NORTH INDIA ---
  'delhi':       { train: { sl: 600, ac3: 1900, ac2: 3000, hours: 18 },                                 flight: { min: 4500, max: 9000, hours: 2.2, isDirect: true },         minBudgetPerDay: 800 },
  'lucknow':     { train: { sl: 500, ac3: 1500, ac2: 2400, hours: 14 },                                 flight: { min: 5500, max: 9500, hours: 3, isDirect: false },          minBudgetPerDay: 800 },
  'varanasi':    { train: { sl: 450, ac3: 1200, ac2: 1900, hours: 10 },                                                                                                      minBudgetPerDay: 750 },
  'jaipur':      { train: { sl: 600, ac3: 1700, ac2: 2600, hours: 20 },                                 flight: { min: 6000, max: 11000, hours: 3.5, isDirect: false },       minBudgetPerDay: 850 },
  'chandigarh':  { train: { sl: 650, ac3: 1900, ac2: 2900, hours: 22 },                                 flight: { min: 6500, max: 11000, hours: 4, isDirect: false },         minBudgetPerDay: 900 },

  // --- WEST INDIA ---
  'mumbai':      { train: { sl: 850, ac3: 2500, ac2: 3800, hours: 32 },                                 flight: { min: 5500, max: 11000, hours: 2.5, isDirect: true },        minBudgetPerDay: 850 },
  'pune':        { train: { sl: 850, ac3: 2400, ac2: 3700, hours: 30 },                                 flight: { min: 6500, max: 12000, hours: 4, isDirect: false },         minBudgetPerDay: 900 },
  'ahmedabad':   { train: { sl: 800, ac3: 2300, ac2: 3500, hours: 30 },                                 flight: { min: 7000, max: 12000, hours: 4, isDirect: false },         minBudgetPerDay: 900 },
  'kolhapur':    { train: { sl: 900, ac3: 2700, ac2: 4000, hours: 36 },                                 flight: { min: 9500, max: 14000, hours: 7.5, isDirect: false },       minBudgetPerDay: 1000 },
  'nagpur':      { train: { sl: 550, ac3: 1600, ac2: 2500, hours: 16 },                                 flight: { min: 5500, max: 9500, hours: 3, isDirect: false },          minBudgetPerDay: 850 },
  'indore':      { train: { sl: 700, ac3: 2000, ac2: 3100, hours: 24 },                                 flight: { min: 7000, max: 12000, hours: 4, isDirect: false },         minBudgetPerDay: 900 },
  'bhopal':      { train: { sl: 600, ac3: 1700, ac2: 2600, hours: 18 },                                 flight: { min: 6000, max: 10000, hours: 3.5, isDirect: false },       minBudgetPerDay: 850 },

  // --- SOUTH INDIA ---
  'bengaluru':   { train: { sl: 950, ac3: 2800, ac2: 4200, hours: 35 },                                 flight: { min: 6000, max: 12000, hours: 3, isDirect: false },         minBudgetPerDay: 900 },
  'hyderabad':   { train: { sl: 750, ac3: 2200, ac2: 3400, hours: 24 },                                 flight: { min: 5500, max: 10000, hours: 3, isDirect: false },         minBudgetPerDay: 850 },
  'chennai':     { train: { sl: 850, ac3: 2500, ac2: 3800, hours: 30 },                                 flight: { min: 6000, max: 11000, hours: 3.5, isDirect: false },       minBudgetPerDay: 900 },
  'coimbatore':  { train: { sl: 1000, ac3: 2900, ac2: 4400, hours: 38 },                                flight: { min: 7500, max: 13000, hours: 5, isDirect: false },         minBudgetPerDay: 950 },
  'kochi':       { train: { sl: 1050, ac3: 3100, ac2: 4600, hours: 40 },                                flight: { min: 8000, max: 14000, hours: 5, isDirect: false },         minBudgetPerDay: 950 },
};

function lookupCity(input: string): CityData | null {
  const key = input.toLowerCase().trim().replace(/[^a-z]/g, '');
  return CITY_PRICES[key] || null;
}

function estimateMinBudget(city: CityData | null, days: number, travelers: number, style: string): number {
  const transportPerPerson = city?.train?.sl || city?.bus?.cost || 2000;
  const roundTrip = transportPerPerson * 2;
  const perNight = style === 'luxury' ? 6000 : style === 'comfort' ? 1800 : 900;
  const perDayFood = style === 'luxury' ? 1200 : style === 'comfort' ? 600 : 300;
  const perDayLocal = style === 'luxury' ? 2500 : style === 'comfort' ? 700 : 300;
  const activities = style === 'luxury' ? 500 : style === 'comfort' ? 300 : 150;
  const rooms = Math.ceil(travelers / 2); // 2 people per room
  const perPerson = roundTrip + (days * (perDayFood + perDayLocal + activities));
  const totalAccommodation = days * perNight * rooms;
  return (perPerson * travelers) + totalAccommodation;
}

// ──────────────────────────────────────────────────────────────
// Build dynamic system prompt with city-specific prices
// ──────────────────────────────────────────────────────────────
function buildSystemPrompt(cityData: CityData | null, origin: string): string {
  let transportBlock = '';
  if (cityData) {
    const parts: string[] = [];
    if (cityData.train) parts.push(`Train: ${cityData.train.hours}h journey, Sleeper class ₹${cityData.train.sl}, 3AC ₹${cityData.train.ac3}, 2AC ₹${cityData.train.ac2} (one-way per person)`);
    if (cityData.bus) parts.push(`Bus: ${cityData.bus.hours}h journey, ₹${cityData.bus.cost} (one-way per person)`);
    if (cityData.flight) {
      const flightType = cityData.flight.isDirect ? 'DIRECT flight' : 'CONNECTING flight (no direct flights available, 1-2 stops)';
      parts.push(`Flight: ${flightType}, ${cityData.flight.hours}h total, ₹${cityData.flight.min} to ₹${cityData.flight.max} (one-way per person, book 2-3 weeks early for lower fares)`);
    }
    transportBlock = `VERIFIED TRANSPORT PRICES from ${origin} to Ranchi (one-way, per person):\n  ${parts.join('\n  ')}\n  IMPORTANT: These are VERIFIED prices. Use EXACTLY these numbers. Do NOT reduce them.`;
  } else {
    transportBlock = `Origin "${origin}" not in our verified database. For unknown cities, estimate conservatively: Train ₹500-2500 based on distance. Flights from Tier-2/3 cities are usually CONNECTING and cost ₹6000-14000 one-way. Always err on the higher side.`;
  }

  return `You are JharkhandAI — an expert, HONEST travel planner for Jharkhand, India.

CRITICAL RULES:
1. NEVER invent prices. Use ONLY the verified prices provided below.
2. If a user's budget is insufficient, you MUST set budgetHonesty to "Insufficient — please increase budget" and explain WHY in the summary (e.g. "Transport alone costs ₹X, leaving only ₹Y for ${3} days").
3. If budget is very tight, set "Very tight — expect compromises" and suggest cuts.
4. Return ONLY valid JSON. No markdown, no backticks, no commentary.
5. All monetary values are plain integers (INR). Never use ₹ symbol in JSON values.

${transportBlock}

LOCAL TRANSPORT in Jharkhand (daily costs):
  Budget: shared autos + local buses = ₹200-400/day
  Comfort: Rapido/Ola app cabs = ₹500-1000/day
  Luxury: private AC cab = ₹1800-3500/day

REAL HOTELS (verified 2026 MakeMyTrip/Goibibo rates — use THESE exact prices):
  RANCHI:
    Budget: OYO Townhouse (₹800-1200), Treebo Trip Hotel (₹900-1300), FabHotel (₹1000-1400)
    Comfort: Hotel Capitol Hill (₹1500-2500), Hotel Arya (₹1400-2000), Chanakya BNR (₹2500-4000)
    Luxury: Radisson Blu (₹5500-9000), Marriott Courtyard (₹6500-10000)
  DEOGHAR:
    Budget: OYO/FabHotel (₹600-1000), Dharamshala near temple (₹300-500)
    Comfort: Hotel Natraj (₹1000-1600), Hotel Akash Ganga (₹1200-1800)
  JAMSHEDPUR:
    Budget: Treebo/OYO (₹700-1100)
    Comfort: Hotel Ginger (₹1500-2200), Lemon Tree (₹2200-3200)
    Luxury: The Sonnet (₹3000-5000)
  NETARHAT: Forest Rest House (₹600-1000), State Guest House (₹400-800)
  BETLA: Forest Rest House (₹600-1200), Tiger Camp (₹800-1500)

FOOD (per person per day):
  Budget: dhabas/street food ₹150-300
  Comfort: restaurants ₹400-700
  Luxury: hotel dining ₹800-2000

BOOKING LINKS — every transport and hotel MUST have a bookingLink:
  Trains: "https://www.irctc.co.in"
  Buses: "https://www.redbus.in"
  Flights: "https://www.makemytrip.com/flights/"
  Hotels by city:
    Ranchi: "https://www.makemytrip.com/hotels/hotel-listing/?city=ranchi"
    Deoghar: "https://www.makemytrip.com/hotels/hotel-listing/?city=deoghar"  
    Jamshedpur: "https://www.makemytrip.com/hotels/hotel-listing/?city=jamshedpur"
    Generic: "https://www.goibibo.com/hotels/CITYNAME-hotels/"

PLACES: Hundru Falls, Dassam Falls, Jonha Falls, Lodh Falls (tallest 143m), Baidyanath Dham, Pahari Mandir, Rajrappa Temple, Betla National Park, Dalma Sanctuary, Netarhat, Parasnath Hill, Tribal Museum Ranchi

EMERGENCY & USEFUL INFO (include in mustKnow):
  Tourist Helpline: 1800-345-3652 (toll free)
  Police: 100 | Ambulance: 108
  Ranchi Airport: Birsa Munda Airport (IXR)
  ATM warning: limited ATMs in Netarhat, Betla, Latehar — carry cash
  Mobile signal: weak in Netarhat, Betla forest, Latehar — download offline maps
  Permits: Betla forest entry ₹250/person, camera ₹100 extra

JSON SCHEMA — return exactly this structure:
{
  tripTitle: string,
  summary: string (mention if budget is insufficient here),
  budgetHonesty: "Comfortable — good coverage for this trip" | "Tight but doable — budget travel only" | "Very tight — expect compromises" | "Insufficient — please increase budget",
  minimumBudgetNeeded: integer (what this trip actually costs at minimum),
  weather: { currentSeason, temperature, expectedConditions, advice },
  transport: {
    options: [{ type: "train"|"bus"|"flight", name, from, to, duration, approxCost: int, class, tips, bookingLink }]  (2-4 options, cheapest first),
    localTransport: { primary, dailyCost: int, tips }
  },
  accommodation: {
    recommended: [{ name, location, rating, pricePerNight: int, highlights, bestFor, bookingLink, phone }]  (2-4 hotels)
  },
  budgetBreakdown: { intercityTransport: int, localTransport: int, accommodation: int, food: int, activities: int, miscellaneous: int, total: int, perPersonCost: int, savingTips: string[] },
  days: [{ day: int, title, locations: string[], morning, afternoon, evening, estimatedDayCost: int, mapLink, transport, accommodation: { name, pricePerNight: int }, meals: { breakfast, lunch, dinner }, localTip }],
  packingChecklist: { essentials: string[], clothing: string[], documents: string[], forYourInterests: string[] },
  mustKnow: string[] (include emergency numbers, ATM warnings, signal issues),
  bestTimeToVisit: string,
  nearbyAttractions: string[],
  emergencyContacts: { touristHelpline: string, police: string, ambulance: string, nearestHospital: string }
}`;
}

// ──────────────────────────────────────────────────────────────
// Generate AI Plan
// ──────────────────────────────────────────────────────────────
export const generatePlan = async (req: Request, res: Response) => {
  try {
    const { location, budget, days, travelers, travelStyle, interests, travelDates } = req.body;

    if (!env.GROQ_API_KEY) {
      return res.status(503).json({ success: false, error: 'AI service not configured' });
    }

    // Look up origin city prices
    const cityData = lookupCity(location);
    const minBudget = estimateMinBudget(cityData, days, travelers, travelStyle);

    // Build dynamic prompt with city-specific verified prices
    const systemPrompt = buildSystemPrompt(cityData, location);

    const userPrompt = `Plan a Jharkhand trip for me:
- Origin city: ${location}
- Total budget (₹): ${budget}
- Days: ${days}
- Travelers: ${travelers}
- Style: ${travelStyle}
- Interests: ${JSON.stringify(interests)}
- Travel dates: ${travelDates || 'Flexible'}
- My estimated minimum budget for this trip: ₹${minBudget}

${budget < minBudget ? `WARNING: The user's budget ₹${budget} is BELOW the estimated minimum ₹${minBudget}. You MUST set budgetHonesty to "Insufficient — please increase budget" and explain in summary what the minimum needed is. Still generate a plan showing what the trip would actually cost.` : ''}

Return ONLY the JSON object. No other text.`;

    logger.info(`AI Plan: ${location} → Jharkhand, ₹${budget}, ${days}d, ${travelers}pax, min=₹${minBudget}`);

    const groq = new Groq({ apiKey: env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 4096,
      temperature: 0.3,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return res.status(502).json({ success: false, error: 'AI returned empty response' });
    }

    let plan: any;
    try {
      plan = JSON.parse(content);
    } catch {
      logger.error('JSON parse failed, retrying...');
      const retry = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 4096,
        temperature: 0.2,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt + '\n\nCRITICAL: Return ONLY valid JSON. No markdown.' },
        ],
        response_format: { type: 'json_object' },
      });
      try {
        plan = JSON.parse(retry.choices[0]?.message?.content || '');
      } catch {
        return res.status(502).json({ success: false, error: 'AI response malformed' });
      }
    }

    // Inject server-side budget check if AI didn't flag it
    if (budget < minBudget && !plan.budgetHonesty?.includes('Insufficient')) {
      plan.budgetHonesty = 'Insufficient — please increase budget';
      plan.summary = `⚠️ Your budget of ₹${budget.toLocaleString('en-IN')} is below the estimated minimum of ₹${minBudget.toLocaleString('en-IN')} for this trip. ${plan.summary || ''}`;
    }
    plan.minimumBudgetNeeded = plan.minimumBudgetNeeded || minBudget;

    logger.info(`AI Plan generated: "${plan.tripTitle}" — ${plan.budgetHonesty}`);
    return res.json({ success: true, data: plan });

  } catch (error: any) {
    logger.error('AI planner error:', error?.message || error);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, error: 'AI generation failed. Please try again.' });
    }
  }
};

// ──────────────────────────────────────────────────────────────
// Save / Fetch / Delete plans (unchanged)
// ──────────────────────────────────────────────────────────────
export const savePlan = async (req: Request, res: Response) => {
  try {
    const planData = { ...req.body, user_id: req.user!.id };
    const { data, error } = await supabase.from('trip_plans').insert(planData).select().single();
    if (error) return res.status(400).json({ success: false, error: error.message });
    return res.status(201).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to save plan' });
  }
};

export const getMyPlans = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('trip_plans').select('*').eq('user_id', req.user!.id).order('created_at', { ascending: false });
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch plans' });
  }
};

export const getPlanById = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('trip_plans').select('*').eq('id', req.params.id).eq('user_id', req.user!.id).single();
    if (error || !data) return res.status(404).json({ success: false, error: 'Plan not found' });
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch plan' });
  }
};

export const toggleBookmark = async (req: Request, res: Response) => {
  try {
    const { data: plan } = await supabase.from('trip_plans').select('is_bookmarked').eq('id', req.params.id).eq('user_id', req.user!.id).single();
    if (!plan) return res.status(404).json({ success: false, error: 'Plan not found' });
    const { data, error } = await supabase.from('trip_plans').update({ is_bookmarked: !plan.is_bookmarked, updated_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
    if (error) return res.status(400).json({ success: false, error: error.message });
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to toggle bookmark' });
  }
};

export const deletePlan = async (req: Request, res: Response) => {
  try {
    const { error } = await supabase.from('trip_plans').delete().eq('id', req.params.id).eq('user_id', req.user!.id);
    if (error) return res.status(400).json({ success: false, error: error.message });
    return res.json({ success: true, message: 'Plan deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to delete plan' });
  }
};
