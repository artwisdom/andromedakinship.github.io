// SellCraft Backend - Chiron AI Chat API
// Deployed on Vercel as serverless function

// Industry expertise data for personalized coaching
const INDUSTRY_EXPERTISE = {
  'Automotive': {
    commonObjections: ['Price too high', 'Need to think about it', 'Spouse approval', 'Trade-in value too low', 'Found it cheaper online'],
    closingTechniques: ['Assumptive close', 'Puppy dog close', 'Ben Franklin close', 'If I could... would you close'],
  },
  'SaaS / Tech': {
    commonObjections: ['Too expensive', 'Already using competitor', 'Need buy-in from team', 'Not the right time', 'Too complex to implement'],
    closingTechniques: ['Trial close', 'Pilot program', 'Champion building', 'ROI close'],
  },
  'Insurance': {
    commonObjections: ['Happy with current provider', 'Rates too high', 'Need to compare quotes', 'Don\'t trust insurance companies'],
    closingTechniques: ['Fear of loss', 'Story close', 'Comparison close', 'What-if scenario'],
  },
  'Real Estate': {
    commonObjections: ['Price too high', 'Market timing', 'Need to sell first', 'Not ready to commit', 'Neighborhood concerns'],
    closingTechniques: ['Scarcity close', 'Emotional vision close', 'Deadline close', 'Tour close'],
  },
  'Financial Services': {
    commonObjections: ['Don\'t trust advisors', 'Can do it myself', 'Fees too high', 'Market is too volatile', 'Need to talk to spouse'],
    closingTechniques: ['Future pacing', 'Pain point amplification', 'Social proof', 'Calculator close'],
  },
  'Retail': {
    commonObjections: ['Just browsing', 'Found it cheaper online', 'Need to think about it', 'Don\'t need it right now'],
    closingTechniques: ['Add-on close', 'Now or never', 'Emotional close', 'Bundle close'],
  },
  'Medical/Healthcare': {
    commonObjections: ['Insurance won\'t cover it', 'Need second opinion', 'Too expensive', 'Afraid of the procedure', 'Want to wait'],
    closingTechniques: ['Urgency close', 'Testimonial close', 'Payment plan close', 'Education close'],
  },
  'Solar/Energy': {
    commonObjections: ['Too expensive upfront', 'Roof isn\'t suitable', 'Moving soon', 'Don\'t trust the savings claims', 'Lease vs buy confusion'],
    closingTechniques: ['Savings calculator close', 'Environmental impact close', 'Neighbor reference close', 'Federal incentive deadline'],
  },
  'Telecom/Wireless': {
    commonObjections: ['Happy with current plan', 'Contract lock-in', 'Coverage concerns', 'Too many hidden fees', 'Don\'t need an upgrade'],
    closingTechniques: ['Comparison close', 'Trade-in incentive', 'Family plan close', 'Limited time offer'],
  },
  'HVAC/Home Services': {
    commonObjections: ['Quote is too high', 'Getting other quotes', 'Can wait another season', 'DIY fix', 'Neighbor used someone else'],
    closingTechniques: ['Emergency urgency close', 'Warranty value close', 'Seasonal discount close', 'Financing close'],
  },
  'Fitness/Wellness': {
    commonObjections: ['Too expensive', 'No time to work out', 'Can exercise at home', 'Not ready to commit', 'Tried before and quit'],
    closingTechniques: ['Transformation story close', 'Free trial close', 'Accountability partner close', 'Goal-setting close'],
  },
  'B2B Services': {
    commonObjections: ['No budget', 'Need to consult team', 'Happy with current vendor', 'Not a priority right now'],
    closingTechniques: ['ROI close', 'Referral close', 'Pilot program', 'Executive sponsor close'],
  },
  'General': {
    commonObjections: ['Price', 'Timing', 'Need approval', 'Competition', 'Trust'],
    closingTechniques: ['Assumptive', 'Alternative choice', 'Summary close', 'Urgency close'],
  }
};

// Build system prompt
const CHIRON_SYSTEM_PROMPT = (userContext) => {
  const expertise = INDUSTRY_EXPERTISE[userContext.industry] || INDUSTRY_EXPERTISE['General'];
  
  // Current date/time context for calendar awareness
  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayOfWeek = days[now.getDay()];
  const dateStr = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
  const daysUntilMonday = ((8 - now.getDay()) % 7) || 7;
  
  const statsContext = userContext.isPremium ? `

USER STATS:
- Level ${userContext.level} | ${userContext.xp} XP | ${userContext.streak} day streak | ${userContext.readinessScore}% readiness
- Today: ${userContext.todayStats.objectionsCompleted} objections at ${userContext.todayStats.successRate}% success
- This week: ${userContext.weeklyTrends.totalObjections} objections, ${userContext.weeklyTrends.activeDays}/7 active days
- Goals: ${userContext.goals.completed}/${userContext.goals.total} completed

Reference these stats naturally. If success rate is low, suggest techniques. If streak is going, encourage them.

GOAL CREATION: When user asks to set a goal, include this exact tag in your response:
[CREATE_GOAL]{"title":"Title","type":"sales","target":5,"unit":"deals","deadline":"1 week","startDate":"YYYY-MM-DD","endDate":"YYYY-MM-DD","recurrence":"none","priority":"medium"}[/CREATE_GOAL]
Types: "sales", "personal", "skill". Recurrence: "none", "daily", "weekly", "biweekly", "monthly". Priority: "high", "medium", "low".
Always calculate exact startDate AND endDate based on today's date.
CRITICAL: If the goal is for a SPECIFIC DAY (e.g. "sell 2 cars this Saturday", "make 10 calls on Monday"), set BOTH startDate AND endDate to that same day. This is a single-day goal.
If the goal spans a range (e.g. "this week", "by end of month"), startDate = today, endDate = the deadline.
Examples: "this Saturday" = startDate and endDate both = "${(() => { const sat = new Date(now); sat.setDate(sat.getDate() + ((6 - sat.getDay() + 7) % 7 || 7)); return sat.toISOString().split('T')[0]; })()}", "next Monday" = startDate and endDate "${new Date(now.getTime() + daysUntilMonday * 86400000).toISOString().split('T')[0]}" if single-day, "end of month" = endDate is last day of current month with startDate today, "2 weeks" = 14 days from today.
If user says "every week" or "recurring", set recurrence accordingly. If user says "important" or "top priority", set priority to "high".` : '';

  return `You are Chiron, an elite sales coach. 25+ years closing experience. Named after the legendary centaur who trained Greek heroes like Achilles, Hercules, and Jason.

TODAY: ${dayOfWeek}, ${dateStr}. Next Monday is in ${daysUntilMonday} days.

Coaching ${userContext.name} in ${userContext.industry} sales.${statsContext}

Industry expertise - Common objections: ${expertise.commonObjections.join(', ')}
Proven techniques: ${expertise.closingTechniques.join(', ')}

Rules:
- Talk like a trusted mentor, not a textbook
- Give actionable advice they can use TODAY  
- When sharing quotes, ALWAYS include who said it (e.g. "As Zig Ziglar said...")
- When they want scripts, give powerful phrases in quotes
- For roleplay, become the skeptical customer completely
- Be real - if something won't work, say so
- Match their energy - casual or focused
- Keep responses concise but valuable
- When setting goals with dates, use the current date above to calculate exact dates
${userContext.isPremium ? `- PREMIUM USER: Go deeper on analysis. Reference their specific stats and trends. Create adaptive role-plays that target their weak areas. Provide multi-step action plans. Challenge them to grow.` : `- Keep responses focused and brief. Encourage upgrading for deeper coaching.`}`;
};

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({ status: 'ok', message: 'SellCraft API is running' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, userContext } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array required' });
  }

  const context = userContext || {
    name: 'Champion',
    industry: 'General',
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    streak: 0,
    isPremium: false,
    readinessScore: 0,
    todayStats: { objectionsCompleted: 0, successRate: 0, coachMessages: 0, chironMessages: 0, xpEarned: 0 },
    weeklyTrends: { totalObjections: 0, avgSuccessRate: 0, activeDays: 0, totalXpEarned: 0 },
    goals: { total: 0, completed: 0 }
  };

  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('OPENAI_API_KEY not configured');
    return res.status(500).json({ error: 'Server configuration error - no API key' });
  }

  const systemPrompt = CHIRON_SYSTEM_PROMPT(context);
  const fullMessages = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ];

  // Model routing based on subscription tier
  // GPT-4.1 family = fastest non-reasoning models (no hidden reasoning tokens = instant responses)
  // Premium: gpt-4.1 → gpt-4.1-mini → gpt-4o-mini
  // Free:    gpt-4.1-mini → gpt-4o-mini
  const isPremium = context.isPremium === true;
  const models = isPremium
    ? ['gpt-4.1', 'gpt-4.1-mini', 'gpt-4o-mini']
    : ['gpt-4.1-mini', 'gpt-4o-mini'];
  
  console.log(`[Chiron] User: ${context.name} | Premium: ${isPremium} | Model chain: ${models.join(' → ')}`);

  for (const model of models) {
    try {
      console.log(`[Chiron] Trying ${model} with ${messages.length} messages...`);
      
      const requestBody = {
        model,
        messages: fullMessages,
        max_tokens: model === 'gpt-4.1' ? 600 : 500,
        temperature: 0.8,
      };
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      const responseText = await response.text();
      console.log(`[Chiron] ${model} status: ${response.status}, length: ${responseText.length}`);
      
      if (!response.ok) {
        console.log(`[Chiron] ${model} error:`, responseText.substring(0, 300));
        continue; // Try next model
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.log(`[Chiron] ${model} parse failed:`, responseText.substring(0, 200));
        continue; // Try next model
      }

      const content = data.choices?.[0]?.message?.content;
      
      if (!content || content.trim() === '') {
        console.log(`[Chiron] ${model} returned empty content. Finish reason: ${data.choices?.[0]?.finish_reason}`);
        continue; // Try next model
      }

      // Log token usage for cost monitoring
      const usage = data.usage || {};
      console.log(`[Chiron] ✅ ${model} success | Tokens: ${usage.prompt_tokens || '?'}in/${usage.completion_tokens || '?'}out`);
      
      return res.status(200).json({ 
        content,
        model, // Tell the frontend which model responded
      });
      
    } catch (error) {
      console.log(`[Chiron] ${model} threw error: ${error.message}`);
      continue; // Try next model
    }
  }

  // All models failed
  console.log('[Chiron] ❌ All models failed to produce a response');
  return res.status(500).json({ error: 'AI service temporarily unavailable. Please try again.' });
}
