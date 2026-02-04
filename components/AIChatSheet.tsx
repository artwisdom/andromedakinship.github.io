import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Modal,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Image,
  PanResponder,
  Animated,
  Easing,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Theme from '../constants/Theme';
import { useApp, FREE_DAILY_COACH_MESSAGES } from '../contexts/AppContext';
import { useAI } from '../contexts/AIContext';
import { INDUSTRY_INFO } from '../constants/Objections';
import { Config, isAIConfigured } from '../constants/Config';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Modern markdown renderer for chat messages
const renderFormattedText = (text: string, isUser: boolean) => {
  const textColor = isUser ? '#000000' : Theme.colors.text.primary;
  const boldColor = isUser ? '#000000' : Theme.colors.text.primary;
  const mutedColor = isUser ? 'rgba(0,0,0,0.7)' : Theme.colors.text.secondary;
  
  // Split by lines first
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  
  lines.forEach((line, lineIndex) => {
    // Check for bullet points
    const bulletMatch = line.match(/^[\s]*[•\-\*]\s+(.*)$/);
    const numberedMatch = line.match(/^[\s]*(\d+)\.\s+(.*)$/);
    
    if (bulletMatch) {
      elements.push(
        <View key={lineIndex} style={{ flexDirection: 'row', marginVertical: 3, paddingLeft: 4 }}>
          <Text style={{ color: mutedColor, fontSize: 15, marginRight: 8 }}>•</Text>
          <Text style={{ color: textColor, fontSize: 15, lineHeight: 22, flex: 1 }}>
            {renderInlineFormatting(bulletMatch[1], boldColor, textColor, mutedColor)}
          </Text>
        </View>
      );
    } else if (numberedMatch) {
      elements.push(
        <View key={lineIndex} style={{ flexDirection: 'row', marginVertical: 3, paddingLeft: 4 }}>
          <Text style={{ color: mutedColor, fontSize: 15, marginRight: 8, minWidth: 18 }}>{numberedMatch[1]}.</Text>
          <Text style={{ color: textColor, fontSize: 15, lineHeight: 22, flex: 1 }}>
            {renderInlineFormatting(numberedMatch[2], boldColor, textColor, mutedColor)}
          </Text>
        </View>
      );
    } else if (line.trim() === '') {
      elements.push(<View key={lineIndex} style={{ height: 10 }} />);
    } else {
      elements.push(
        <Text key={lineIndex} style={{ color: textColor, fontSize: 15, lineHeight: 23, marginVertical: 2 }}>
          {renderInlineFormatting(line, boldColor, textColor, mutedColor)}
        </Text>
      );
    }
  });
  
  return elements;
};

// Handle **bold**, *italic*, "quotes"
const renderInlineFormatting = (text: string, boldColor: string, textColor: string, mutedColor: string) => {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;
  
  while (remaining.length > 0) {
    // Bold: **text**
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    // Italic: *text*
    const italicMatch = remaining.match(/(?<!\*)\*([^*]+)\*(?!\*)/);
    // Quotes: "text"
    const quoteMatch = remaining.match(/"([^"]+)"/);
    
    // Find earliest match
    const matches = [
      boldMatch ? { type: 'bold', match: boldMatch, index: remaining.indexOf(boldMatch[0]) } : null,
      italicMatch ? { type: 'italic', match: italicMatch, index: remaining.indexOf(italicMatch[0]) } : null,
      quoteMatch ? { type: 'quote', match: quoteMatch, index: remaining.indexOf(quoteMatch[0]) } : null,
    ].filter(Boolean).sort((a, b) => a!.index - b!.index);
    
    if (matches.length === 0) {
      parts.push(<Text key={key++}>{remaining}</Text>);
      break;
    }
    
    const earliest = matches[0]!;
    
    // Add text before match
    if (earliest.index > 0) {
      parts.push(<Text key={key++}>{remaining.slice(0, earliest.index)}</Text>);
    }
    
    // Add formatted text
    if (earliest.type === 'bold') {
      parts.push(
        <Text key={key++} style={{ fontWeight: '700', color: boldColor }}>
          {earliest.match![1]}
        </Text>
      );
      remaining = remaining.slice(earliest.index + earliest.match![0].length);
    } else if (earliest.type === 'italic') {
      parts.push(
        <Text key={key++} style={{ fontStyle: 'italic', color: mutedColor }}>
          {earliest.match![1]}
        </Text>
      );
      remaining = remaining.slice(earliest.index + earliest.match![0].length);
    } else if (earliest.type === 'quote') {
      parts.push(
        <Text key={key++} style={{ color: Theme.colors.accent.primary, fontWeight: '500' }}>
          "{earliest.match![1]}"
        </Text>
      );
      remaining = remaining.slice(earliest.index + earliest.match![0].length);
    }
  }
  
  return parts;
};

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

// Lightning Bolt Typing Indicator Component with orange spark tracing
const LightningTypingIndicator = () => {
  const dot1Opacity = useRef(new Animated.Value(0.3)).current;
  const dot2Opacity = useRef(new Animated.Value(0.3)).current;
  const dot3Opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Single pulse animation for each dot
    const createPulse = (dotAnim: Animated.Value) => {
      return Animated.sequence([
        Animated.timing(dotAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(dotAnim, {
          toValue: 0.3,
          duration: 300,
          useNativeDriver: true,
        }),
      ]);
    };

    // Staggered loop: dot1 -> dot2 -> dot3 -> repeat
    const runAnimation = () => {
      Animated.sequence([
        createPulse(dot1Opacity),
        createPulse(dot2Opacity),
        createPulse(dot3Opacity),
      ]).start(() => runAnimation());
    };

    runAnimation();

    return () => {
      dot1Opacity.stopAnimation();
      dot2Opacity.stopAnimation();
      dot3Opacity.stopAnimation();
    };
  }, []);

  return (
    <View style={typingStyles.container}>
      <Animated.View style={[typingStyles.dot, { opacity: dot1Opacity }]} />
      <Animated.View style={[typingStyles.dot, { opacity: dot2Opacity }]} />
      <Animated.View style={[typingStyles.dot, { opacity: dot3Opacity }]} />
    </View>
  );
};

const typingStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F59E0B',
  },
});

type Props = {
  visible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
};

const FREE_QUICK_ACTIONS = [
  { id: 'tip', text: 'Quick sales tip', icon: 'sun' },
  { id: 'motivate', text: 'Motivate me', icon: 'zap' },
  { id: 'objection', text: 'Objection help', icon: 'target' },
  { id: 'close', text: 'How to close', icon: 'check-circle' },
  { id: 'cold', text: 'Cold call tips', icon: 'phone' },
  { id: 'follow', text: 'Follow-up advice', icon: 'repeat' },
];

const PREMIUM_QUICK_ACTIONS = [
  { id: 'objection', text: 'Handle an objection', icon: 'target' },
  { id: 'practice', text: 'Roleplay practice', icon: 'play' },
  { id: 'script', text: 'Create a script', icon: 'file-text' },
  { id: 'motivate', text: 'Motivate me', icon: 'zap' },
  { id: 'tips', text: 'Pro sales tip', icon: 'sun' },
  { id: 'analyze', text: 'Analyze my game', icon: 'bar-chart-2' },
  { id: 'cold', text: 'Cold call script', icon: 'phone' },
  { id: 'negotiate', text: 'Negotiation help', icon: 'trending-up' },
];

// User context type for API
type UserContext = {
  name: string;
  industry: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  isPremium: boolean;
  readinessScore: number;
  todayStats: {
    objectionsCompleted: number;
    objectionsSuccessful: number;
    successRate: number;
    coachMessages: number;
    chironMessages: number;
    xpEarned: number;
  };
  weeklyTrends: {
    totalObjections: number;
    avgSuccessRate: number;
    totalXpEarned: number;
    activeDays: number;
  };
  goals: {
    total: number;
    completed: number;
  };
};

// Call SellCraft Backend API (which proxies to OpenAI) with retry logic
const callChironAPI = async (
  messages: { role: string; content: string }[],
  userContext: UserContext,
  retryCount = 0
): Promise<string> => {
  const MAX_RETRIES = 5;
  const TIMEOUT_MS = 60000; // 60 seconds per attempt

  try {
    // Add timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    console.log(`Chiron API attempt ${retryCount + 1}/${MAX_RETRIES + 1}...`);

    const response = await fetch(`${Config.API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        userContext,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Get response as text first
    const responseText = await response.text();

    if (!response.ok) {
      console.log('Chiron API error status:', response.status, responseText.substring(0, 200));
      let errorMsg = 'API request failed';
      try {
        const errorJson = JSON.parse(responseText);
        errorMsg = errorJson.error || errorMsg;
      } catch {}
      throw new Error(errorMsg);
    }

    // Parse successful response
    const data = JSON.parse(responseText);
    console.log('Chiron API response received, content length:', data.content?.length || 0);
    
    if (!data.content || data.content.trim() === '') {
      console.error('Empty content received from API');
      throw new Error('Empty response from Chiron. Retrying...');
    }
    
    return data.content;
  } catch (error: any) {
    // Retry on timeout, network errors, or empty responses
    if (retryCount < MAX_RETRIES) {
      const isRetryable = error.name === 'AbortError' || 
                          error.message?.includes('timeout') ||
                          error.message?.includes('network') ||
                          error.message?.includes('Failed to fetch') ||
                          error.message?.includes('Empty response') ||
                          error.message?.includes('500');
      
      if (isRetryable) {
        console.log(`Chiron API retry ${retryCount + 1}/${MAX_RETRIES} after error: ${error.message}`);
        // Wait before retrying (exponential backoff: 2s, 4s, 6s, 8s, 10s)
        await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1)));
        return callChironAPI(messages, userContext, retryCount + 1);
      }
    }

    if (error.name === 'AbortError') {
      console.error('Chiron API timeout after all retries');
      throw new Error('Connection is slow. Please try again in a moment.');
    }
    console.error('Chiron API call failed:', error);
    throw error;
  }
};

// Comprehensive free tier responses - valuable but limited
const getBasicResponse = (input: string, industry: string): string => {
  const lowInput = input.toLowerCase();
  
  // Motivation responses
  if (lowInput.includes('motivate') || lowInput.includes('motivation') || lowInput.includes('fired up') || lowInput.includes('pump')) {
    const motivations = [
      `⚡ Remember: every "no" is one step closer to a "yes." Keep pushing, champion! 💪`,
      `⚡ Top performers in ${industry} face rejection daily. What sets them apart is persistence. You've got this!`,
      `⚡ Your next big win could be on the very next call. The gods favor the bold!`,
      `⚡ The prospect who rejected you yesterday might say yes today. Circumstances change - keep following up!`,
      `⚡ Every master was once a disaster. Your struggles today are building your success tomorrow!`,
      `⚡ Champions aren't made when they win - they're made in the moments they refuse to quit. Keep going!`,
      `⚡ Your competition is sleeping on follow-ups. That's your edge. Be relentless!`,
      `⚡ One more call, one more email, one more try. That's all it takes to change everything!`,
      `⚡ Remember why you started. Your family, your goals, your future. Let that drive you today!`,
      `⚡ The best closers weren't born - they were built through practice and persistence. You're building yourself right now!`,
    ];
    return motivations[Math.floor(Math.random() * motivations.length)];
  }
  
  // Quick tips
  if (lowInput.includes('tip') || lowInput.includes('advice') || lowInput.includes('help me')) {
    const tips = [
      `⚡ **Quick Tip:** Always end your pitch with a question - it keeps the conversation going and shows you value their input.`,
      `⚡ **Pro Move:** Listen more than you talk. Top salespeople have a 60/40 listen-to-talk ratio. The customer will tell you how to sell to them.`,
      `⚡ **Remember:** People buy from people they trust. Focus on building rapport first, selling second.`,
      `⚡ **Golden Rule:** Never assume you know the objection. Ask clarifying questions before responding.`,
      `⚡ **Power Tip:** Use the prospect's name 3 times in conversation - it builds connection and trust.`,
      `⚡ **Closer's Secret:** Silence is powerful. After making your pitch, stop talking. Let them respond.`,
      `⚡ **Smart Move:** Send a follow-up within 24 hours of every meeting. Speed shows you care.`,
      `⚡ **Key Insight:** Features tell, benefits sell. Always connect what you're selling to how it helps them.`,
      `⚡ **Timing Trick:** The best time to ask for the sale is right after they agree with something you said.`,
      `⚡ **Expert Move:** When they say "that's interesting," ask "what specifically interests you about that?"`,
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  }
  
  // Objection handling basics
  if (lowInput.includes('objection') || lowInput.includes('handle') || lowInput.includes('overcome')) {
    const objectionTips = [
      `⚡ **Objection Framework: LAER**\n\n• **L**isten - Let them finish completely\n• **A**cknowledge - "I understand..."\n• **E**xplore - Ask questions to understand the real concern\n• **R**espond - Address their specific worry\n\n**Practice this in the Arena!**\n\n✨ *Premium gives you AI roleplay for any objection!*`,
      `⚡ **Quick Objection Tip:**\n\nWhen they say "it's too expensive," don't defend the price. Ask: "Compared to what?"\n\nThis reveals what they're actually comparing you to - and often it's not a fair comparison!\n\n✨ *Premium users get custom scripts for any objection.*`,
      `⚡ **The Feel-Felt-Found Method:**\n\n"I understand how you **feel**. Other customers have **felt** the same way. What they **found** was..."\n\nThis validates their concern while shifting perspective.\n\n✨ *Get unlimited objection practice with Premium!*`,
      `⚡ **Isolate the Objection:**\n\nAlways ask: "Is that the only thing holding you back?"\n\nThis prevents new objections from appearing after you solve the first one. Handle them ALL upfront.\n\n✨ *Premium AI gives you word-for-word scripts!*`,
    ];
    return objectionTips[Math.floor(Math.random() * objectionTips.length)];
  }
  
  // Price objections specifically
  if (lowInput.includes('price') || lowInput.includes('expensive') || lowInput.includes('cost') || lowInput.includes('budget')) {
    return `⚡ **Handling Price Objections - Quick Guide:**\n\n1. **Don't defend** - Ask questions instead\n2. **Break it down** - Show daily/monthly cost\n3. **Show ROI** - What's the cost of NOT buying?\n4. **Add value** - Before dropping price\n\n**Quick Script:**\n"I understand price is important. Can I ask - is it the total amount or the monthly investment that concerns you?"\n\n*"Price is only an issue in the absence of value."*\n\n✨ *Premium users get ${industry}-specific price scripts!*`;
  }
  
  // Closing help
  if (lowInput.includes('close') || lowInput.includes('closing') || lowInput.includes('ask for')) {
    return `⚡ **5 Powerful Closes:**\n\n1. **Assumptive:** "When would you like delivery - this week or next?"\n\n2. **Alternative:** "Would you prefer the standard or premium package?"\n\n3. **Summary:** "So we've got [benefits]. Ready to move forward?"\n\n4. **Urgency:** "This pricing is only available until [date]."\n\n5. **Direct:** "Based on everything we discussed, I think this is the right fit. Let's do it."\n\n*The key: ASK for the sale!*\n\n✨ *Premium gives you advanced ${industry} closing strategies!*`;
  }
  
  // Cold calling
  if (lowInput.includes('cold') || lowInput.includes('call') || lowInput.includes('phone') || lowInput.includes('dial')) {
    return `⚡ **Cold Calling Quick Tips:**\n\n• **First 7 seconds** matter most - be confident!\n• **Pattern interrupt:** Start differently than competitors\n• Lead with **value**, not features\n• Have **ONE goal:** book a meeting\n• **Smile** while you dial - they can hear it!\n\n**Quick Opener:**\n"Hi [Name], this is [You] with [Company]. Did I catch you at a bad time?" (counterintuitive but works!)\n\n✨ *Premium users get complete cold call scripts!*`;
  }
  
  // Follow up
  if (lowInput.includes('follow') || lowInput.includes('up') || lowInput.includes('reach out')) {
    return `⚡ **Follow-Up Formula:**\n\n• **Day 1:** Thank you email\n• **Day 3:** Value-add message (article, insight)\n• **Day 7:** Check-in call\n• **Day 14:** New angle/offer\n• **Day 30+:** Monthly touchpoint\n\n**Key insight:** 80% of sales happen after 5+ contacts, but most salespeople quit after 2!\n\n*"The fortune is in the follow-up."*\n\n✨ *Premium includes follow-up templates!*`;
  }
  
  // Rapport building
  if (lowInput.includes('rapport') || lowInput.includes('connect') || lowInput.includes('relationship')) {
    return `⚡ **Building Instant Rapport:**\n\n• **Mirror** their energy and pace\n• Use their **name** naturally (3x rule)\n• Find **common ground** quickly\n• **Listen actively** - nod, respond, paraphrase\n• Be **genuinely curious** about them\n• **Match** their communication style\n\n**Quick Win:** Find something in their office/background to comment on genuinely.\n\n*People buy from people they like!*\n\n✨ *Premium users get rapport-building exercises!*`;
  }
  
  // Negotiation help
  if (lowInput.includes('negotiat') || lowInput.includes('discount') || lowInput.includes('deal')) {
    return `⚡ **Negotiation Basics:**\n\n1. **Never be the first** to name a number\n2. **Silence is power** - let them fill the void\n3. **Flinch visibly** at their first offer\n4. **Trade, don't give** - get something for every concession\n5. **Walk away power** - be willing to lose the deal\n\n**Key phrase:** "What would it take to get this done today?"\n\n✨ *Premium gives you advanced negotiation tactics!*`;
  }
  
  // Qualifying leads
  if (lowInput.includes('qualify') || lowInput.includes('lead') || lowInput.includes('prospect')) {
    return `⚡ **BANT Qualification Framework:**\n\n• **B**udget - Can they afford it?\n• **A**uthority - Can they decide?\n• **N**eed - Do they have a real problem?\n• **T**imeline - When do they need to act?\n\n**Quick qualifier:** "If this solves your problem, who else would need to be involved in the decision?"\n\n✨ *Premium users get advanced qualification scripts!*`;
  }
  
  // Industry-specific quick info
  if (lowInput.includes('industry') || lowInput.includes(industry.toLowerCase())) {
    return `⚡ **${industry} Sales Insight:**\n\nEvery industry has unique objections and buying cycles. The key is understanding your customer's specific pain points and timing.\n\n**Quick ${industry} tip:** Know your top 5 competitor differences by heart!\n\n**Practice** industry-specific objections in the Arena to build muscle memory.\n\n✨ *Premium gives you deep ${industry} expertise and AI roleplay scenarios!*`;
  }
  
  // Email help
  if (lowInput.includes('email') || lowInput.includes('write') || lowInput.includes('message')) {
    return `⚡ **Email Best Practices:**\n\n• **Subject line** is everything - make it intriguing\n• Keep it **short** - under 100 words\n• **One CTA** only - don't confuse them\n• **Personalize** the first line\n• End with a **question**\n\n**Subject line formula:** "[Name], quick question about [topic]"\n\n✨ *Premium AI writes custom emails for you!*`;
  }
  
  // Default free response
  return `⚡ Greetings! I am Chiron, your sales training assistant!\n\n**Free features:**\n• Quick tips & motivation\n• Objection frameworks\n• Closing techniques\n• Follow-up strategies\n• Negotiation basics\n\n**Try asking:**\n• "Give me a sales tip"\n• "Motivate me"\n• "Help with objections"\n• "How do I close?"\n• "Cold call tips"\n• "Negotiation help"\n\n✨ **Upgrade to Premium** for:\n🧠 **Elite AI Coach** - Deep personalized ${industry} coaching\n🎭 **Adaptive Roleplay** - Targets your weak areas\n📝 **Custom Scripts** - Built for your market\n📊 **Performance Analysis** - Data-driven improvement`;
};

// Premium responses - Expert AI sales coach
const getPremiumResponse = (input: string, industry: string): string => {
  const lowInput = input.toLowerCase();
  
  if (lowInput.includes('motivate') || lowInput.includes('motivation')) {
    const motivations = [
      `⚡ Every "no" brings you closer to a "yes." In ${industry} sales, persistence is what separates the champions from the rest.\n\n**Action step:** Before your next call, visualize the successful outcome. See yourself closing the deal. Your confidence will transfer to the prospect.\n\n*"Fortune favors the bold."*`,
      `⚡ Remember: The prospect who seems hardest to close is often your next biggest win. Champions are built in the moments they want to quit.\n\n**Quick exercise:** Write down 3 wins you've had this month, no matter how small. Momentum builds momentum.\n\n*"The race is won by the persistent."*`,
      `⚡ Your competition is probably taking it easy right now. That's your advantage. Every extra call you make, every follow-up you send - it compounds.\n\n**Challenge:** Make 5 more contacts today than you normally would.\n\n*"Speed is the essence of trade."*`,
    ];
    return motivations[Math.floor(Math.random() * motivations.length)];
  }
  
  if (lowInput.includes('tip') || lowInput.includes('advice')) {
    const tips = [
      `⚡ **Pro Strategy: The Assumptive Close**\n\nInstead of asking "Would you like to move forward?", try "When would you like to get started - this week or next?"\n\nThis subtle shift assumes the sale and focuses the conversation on timing rather than the decision itself.\n\n*Swift action brings swift results.*`,
      `⚡ **Power Move: The Echo Technique**\n\nMirror your prospect's last 3 words as a question. It:\n• Builds rapport subconsciously\n• Gets them talking more\n• Shows you're actively listening\n\nExample:\nProspect: "We need to reduce costs"\nYou: "Reduce costs?"\n\n*The merchant who listens, prospers.*`,
      `⚡ **Advanced Tip: The Takeaway**\n\nWhen a prospect hesitates, try: "Maybe this isn't the right fit for you right now, and that's okay."\n\nThis counterintuitive approach removes pressure and often makes them reconsider. People want what they can't have.\n\n*Sometimes retreat is the path to victory.*`,
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  }
  
  if (lowInput.includes('objection') || lowInput.includes('handle') || lowInput.includes('price')) {
    return `⚡ Let's conquer this objection together! 🎯\n\n**Tell me:**\n1. What exactly did the customer say?\n2. What product/service were you discussing?\n3. Where are you in the sales process?\n\nWith these details, I'll craft a strategic response that turns their hesitation into enthusiasm.`;
  }
  
  if (lowInput.includes('practice') || lowInput.includes('roleplay') || lowInput.includes('scenario')) {
    return `⚡ Let's practice! I'll play the customer. 🎭\n\n*Scenario: You're selling to a busy decision-maker who just said:*\n\n**"Look, I've only got 2 minutes. What do you want?"**\n\nThis is your moment - how do you respond? Type your answer and I'll provide expert feedback.`;
  }
  
  if (lowInput.includes('script') || lowInput.includes('pitch')) {
    return `⚡ I'd be honored to help you craft a winning script! 📝\n\n**Tell me:**\n1. What are you selling?\n2. Who is your target customer?\n3. What's the main problem you solve?\n4. What makes you different from competitors?\n\nWith this info, I'll forge a script as powerful as the words of the gods themselves.`;
  }
  
  if (lowInput.includes('analyze') || lowInput.includes('performance') || lowInput.includes('improve')) {
    return `⚡ Let's analyze your performance! 📊\n\nBased on your SellCraft stats:\n• **Success Rate:** Shows your objection handling prowess\n• **Streak:** Indicates your consistency and dedication\n• **XP:** Reflects your overall commitment to mastery\n\n**Areas to focus on:**\n1. Practice more objection scenarios to boost confidence\n2. Review sample responses for new techniques\n3. Set daily practice goals\n\nWhat specific area would you like to improve?`;
  }
  
  if (lowInput.includes('cold') || lowInput.includes('call') || lowInput.includes('phone')) {
    return `⚡ Let's build you a killer cold call script! 📞\n\n**Tell me:**\n1. What are you selling?\n2. Who's your ideal prospect (title, industry)?\n3. What's their biggest pain point?\n4. What's your goal? (meeting, demo, sale?)\n\nI'll create a proven ${industry} cold call script with:\n• Pattern-interrupt opener\n• Value proposition\n• Objection handling\n• Strong close`;
  }
  
  if (lowInput.includes('negotiat') || lowInput.includes('discount') || lowInput.includes('deal')) {
    return `⚡ Let's sharpen your negotiation skills! 💰\n\n**Advanced Negotiation Tactics for ${industry}:**\n\n1. **Anchoring** - Set the frame early with a high starting point\n2. **Flinch** - React visibly to their first offer\n3. **Silence** - Let uncomfortable pauses work for you\n4. **Trade-offs** - Never give without getting\n5. **Walk-away power** - Be willing to lose the deal\n\n**What specific negotiation scenario are you facing?** Tell me and I'll give you word-for-word tactics.`;
  }
  
  return `⚡ Greetings, champion! I am Chiron, your **Real AI Sales Expert** specializing in ${industry}! 🧠\n\n**As your elite coach, I offer:**\n• 🎯 Word-for-word objection scripts for any ${industry} scenario\n• 🎭 Realistic roleplay - I'll be your toughest customer\n• 📝 Custom pitches, emails, and cold call scripts\n• 📊 Performance analysis and improvement plans\n• 💰 Advanced negotiation and closing tactics\n\n*I have deep expertise in ${industry} buying cycles, common objections, and proven closing techniques.*\n\nWhat challenge shall we conquer today?`;
};

export default function AIChatSheet({ visible, onClose, onUpgrade }: Props) {
  const { state, useCoachMessage, canUseCoach, getRemainingMessages, addXP, getTodayStats, updateTodayStats, getWeeklyStats, getReadinessScore, getXpToNextLevel, addGoal } = useApp();
  const { initialPrompt, clearInitialPrompt } = useAI();
  const { user } = state;
  const goals = state.goals || [];
  const industryInfo = user.industry ? INDUSTRY_INFO[user.industry] : null;
  const industryName = industryInfo?.name || 'General';
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [hasStartedConversation, setHasStartedConversation] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const translateY = useRef(new Animated.Value(0)).current;

  const remainingMessages = getRemainingMessages();
  const aiEnabled = isAIConfigured();

  // Swipe down to close pan responder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only activate for downward swipes on the handle area
        return gestureState.dy > 10 && Math.abs(gestureState.dx) < 30;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          // Swipe threshold met - close the sheet
          Animated.timing(translateY, {
            toValue: SCREEN_HEIGHT,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            translateY.setValue(0);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          });
        } else {
          // Snap back
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 8,
          }).start();
        }
      },
    })
  ).current;

  // Build full user context for API
  const buildUserContext = (): UserContext => {
    const todayStats = getTodayStats();
    const weeklyStats = getWeeklyStats() || [];
    const readiness = getReadinessScore();
    
    // Calculate weekly trends with null safety
    const totalObjections = weeklyStats.reduce((sum, d) => sum + (d.objectionsCompleted || 0), 0);
    const totalSuccessful = weeklyStats.reduce((sum, d) => sum + (d.objectionsSuccessful || 0), 0);
    const avgSuccessRate = totalObjections > 0 ? Math.round((totalSuccessful / totalObjections) * 100) : 0;
    const totalXpEarned = weeklyStats.reduce((sum, d) => sum + (d.xpEarned || 0), 0);
    const activeDays = weeklyStats.filter(d => (d.objectionsCompleted || 0) > 0 || (d.coachMessages || 0) > 0).length;
    
    // Goal stats with null safety
    const userGoals = state.goals || [];
    const completedGoals = userGoals.filter((g: any) => g.status === 'completed').length;
    
    return {
      name: user.name || 'Champion',
      industry: industryName,
      level: user.level || 1,
      xp: user.xp || 0,
      xpToNextLevel: getXpToNextLevel(),
      streak: user.streak || 0,
      isPremium: user.isPremium || false,
      readinessScore: readiness || 0,
      todayStats: {
        objectionsCompleted: todayStats?.objectionsCompleted || 0,
        objectionsSuccessful: todayStats?.objectionsSuccessful || 0,
        successRate: (todayStats?.objectionsCompleted || 0) > 0 
          ? Math.round(((todayStats?.objectionsSuccessful || 0) / todayStats.objectionsCompleted) * 100) 
          : 0,
        coachMessages: todayStats?.coachMessages || 0,
        chironMessages: todayStats?.chironMessages || 0,
        xpEarned: todayStats?.xpEarned || 0,
      },
      weeklyTrends: {
        totalObjections,
        avgSuccessRate,
        totalXpEarned,
        activeDays,
      },
      goals: {
        total: userGoals.length,
        completed: completedGoals,
      },
    };
  };

  // Start new conversation
  const handleNewConversation = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setMessages([]);
    setHasStartedConversation(false);
  };

  // Pre-fill input with initialPrompt when chat opens
  useEffect(() => {
    if (visible && initialPrompt) {
      setInputText(initialPrompt);
      clearInitialPrompt();
    }
  }, [visible, initialPrompt]);

  useEffect(() => {
    if (visible && messages.length === 0 && !hasStartedConversation) {
      // Add welcome message only for new conversations
      let welcomeContent: string;
      const context = buildUserContext();
      
      if (user.isPremium && aiEnabled) {
        welcomeContent = `⚡ Greetings, ${user.name || 'champion'}! I am Chiron, your AI Sales Expert specializing in ${industryName}.\n\nI can see you're at **Level ${context.level}** with a **${context.readinessScore}% readiness** score today. ${context.streak > 0 ? `Impressive ${context.streak}-day streak!` : ''}\n\nI have full access to your stats and can give you personalized insights. What would you like to work on?`;
      } else if (user.isPremium) {
        welcomeContent = `⚡ Greetings, ${user.name || 'champion'}! I am Chiron, your ${industryName} sales coach.\n\n**I can help with:**\n• Objection handling scripts\n• Roleplay practice\n• Sales tips & techniques\n\nHow may I assist you today?`;
      } else if (aiEnabled) {
        // Free user with API access - they get real AI (gpt-4.1-mini) too
        welcomeContent = `⚡ Greetings, ${user.name || 'champion'}! I am Chiron, your ${industryName} sales coach.\n\n📊 **Free Plan:** ${remainingMessages}/${FREE_DAILY_COACH_MESSAGES} messages today\n\nAsk me anything — sales tips, objection handling, closing strategies, or have me set goals for you!\n\n✨ **Upgrade to Premium** for elite AI coaching, unlimited messages, and deep stat analysis.`;
      } else {
        welcomeContent = `⚡ Greetings, ${user.name || 'champion'}! I am Chiron, trainer of heroes.\n\n📊 **Free Plan:** ${remainingMessages}/${FREE_DAILY_COACH_MESSAGES} messages today\n\n**Try asking me:**\n• "Give me a sales tip"\n• "Motivate me"\n• "Help with objections"\n\n✨ **Upgrade to Premium** for **elite AI-powered coaching** — deeper analysis, adaptive role-play, and unlimited guidance!`;
      }
      
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: welcomeContent,
      };
      setMessages([welcomeMessage]);
    }
  }, [visible]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0)
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSend = async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText) return;

    // Check if user can send message (free tier limit)
    if (!user.isPremium && !canUseCoach()) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      const limitMessage: Message = {
        id: `limit_${Date.now()}`,
        role: 'assistant',
        content: `⚡ Alas! You've reached your daily limit of ${FREE_DAILY_COACH_MESSAGES} free messages. 😔\n\n✨ **Upgrade to Premium** for **unlimited** AI coaching, advanced roleplay, custom scripts, and more!\n\nYour messages will reset at dawn, or upgrade now to continue your journey.`,
      };
      setMessages(prev => [...prev, limitMessage]);
      scrollToBottom();
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: messageText,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    scrollToBottom();

    // Track coach message usage
    useCoachMessage();
    
    // Award XP for consulting with Chiron (5 XP per message)
    addXP(5);
    
    // Slight readiness boost for Chiron consultation (2% per message)
    const todayStats = getTodayStats();
    updateTodayStats({
      chironMessages: (todayStats.chironMessages || 0) + 1,
    });

    // Check if we should use real AI (API backend configured)
    if (aiEnabled) {
      try {
        // Build conversation history for context (last 10 messages)
        const conversationHistory = [...messages, userMessage]
          .filter(m => m.id !== 'welcome')
          .slice(-10)
          .map(m => ({ role: m.role, content: m.content }));

        // Build full user context for personalized responses
        // isPremium flag routes to different models on backend (premium→GPT-4.1, free→4.1-mini)
        const userContext = buildUserContext();
        
        const aiResponse = await callChironAPI(
          conversationHistory,
          userContext
        );

        // Check for goal creation commands in the response
        const goalMatch = aiResponse.match(/\[CREATE_GOAL\](.*?)\[\/CREATE_GOAL\]/);
        if (goalMatch) {
          try {
            const goalData = JSON.parse(goalMatch[1]);
            let endDate: Date;
            let startDate: Date | null = null;
            
            // Parse startDate from Chiron if provided (for single-day or future-start goals)
            if (goalData.startDate && goalData.startDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
              startDate = new Date(goalData.startDate + 'T00:00:00');
            }
            
            // Use exact endDate from Chiron if provided (date-aware)
            if (goalData.endDate && goalData.endDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
              endDate = new Date(goalData.endDate + 'T23:59:59');
            } else {
              // Fallback: calculate from deadline string
              endDate = new Date();
              switch (goalData.deadline) {
                case '1 week':
                  endDate.setDate(endDate.getDate() + 7);
                  break;
                case '2 weeks':
                  endDate.setDate(endDate.getDate() + 14);
                  break;
                case '1 month':
                  endDate.setMonth(endDate.getMonth() + 1);
                  break;
                case '3 months':
                  endDate.setMonth(endDate.getMonth() + 3);
                  break;
                default:
                  endDate.setDate(endDate.getDate() + 7);
              }
            }
            
            // Calculate deadline label from days remaining
            const daysRemaining = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            let deadlineLabel = goalData.deadline || '1 week';
            if (goalData.endDate) {
              if (daysRemaining <= 1) deadlineLabel = '1 day';
              else if (daysRemaining <= 7) deadlineLabel = '1 week';
              else if (daysRemaining <= 14) deadlineLabel = '2 weeks';
              else if (daysRemaining <= 31) deadlineLabel = '1 month';
              else deadlineLabel = '3 months';
            }
            
            // Determine status based on startDate
            const now = new Date();
            const goalStatus = (startDate && startDate > now) ? 'upcoming' : 'active';
            
            // Create the goal
            addGoal({
              title: goalData.title,
              type: goalData.type || 'sales',
              target: goalData.target || 1,
              current: 0,
              unit: goalData.unit || 'items',
              deadline: deadlineLabel,
              startDate: startDate ? startDate.toISOString() : new Date().toISOString(),
              endDate: endDate.toISOString(),
              recurrence: goalData.recurrence || 'none',
              recurringStreak: 0,
              priority: goalData.priority || 'medium',
              notes: goalData.notes || '',
              status: goalStatus,
            });
            
            // Give haptic feedback for goal creation
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch (e) {
            console.log('Failed to parse goal:', e);
          }
        }
        
        // Remove the goal creation tags from the displayed message
        const cleanedResponse = aiResponse.replace(/\[CREATE_GOAL\].*?\[\/CREATE_GOAL\]/g, '').trim();

        setHasStartedConversation(true);
        const aiMessage: Message = {
          id: `ai_${Date.now()}`,
          role: 'assistant',
          content: cleanedResponse,
        };
        setMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);
        scrollToBottom();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        // Fall back to template response on API error
        console.error('Chiron API error, falling back to templates:', error);
        const fallbackResponse = user.isPremium 
          ? getPremiumResponse(messageText, industryName)
          : getBasicResponse(messageText, industryName);
        const fallbackMessage: Message = {
          id: `ai_${Date.now()}`,
          role: 'assistant',
          content: `⚡ *The connection wavers...* 🌩️\n\nI encountered a brief disturbance. Here's wisdom from my training scrolls:\n\n${fallbackResponse}`,
        };
        setMessages(prev => [...prev, fallbackMessage]);
        setIsTyping(false);
        scrollToBottom();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    } else {
      // AI not configured - use template responses only
      setTimeout(() => {
        const response = user.isPremium 
          ? getPremiumResponse(messageText, industryName)
          : getBasicResponse(messageText, industryName);
        
        const aiMessage: Message = {
          id: `ai_${Date.now()}`,
          role: 'assistant',
          content: response,
        };
        setMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);
        scrollToBottom();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, 800 + Math.random() * 400);
    }
  };

  const handleQuickAction = (action: { id: string; text: string }) => {
    handleSend(action.text);
  };

  const handleClose = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Keyboard.dismiss();
    onClose();
  };

  const handleUpgradePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onUpgrade();
  };

  const quickActions = user.isPremium ? PREMIUM_QUICK_ACTIONS : FREE_QUICK_ACTIONS;
  
  // Calculate current remaining for display
  const currentRemaining = getRemainingMessages();

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.container}>
        {/* Backdrop */}
        <Pressable style={styles.backdrop} onPress={handleClose}>
          <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark" />
        </Pressable>

        {/* Sheet with swipe-to-close */}
        <Animated.View 
          style={[
            styles.sheet, 
            { 
              transform: [{ translateY }],
            }
          ]}
        >
          <LinearGradient
            colors={[Theme.colors.background.elevated, Theme.colors.background.primary]}
            style={styles.sheetGradient}
          >
            {/* Swipeable Top Area - Handle + Header */}
            <View {...panResponder.panHandlers}>
              {/* Handle */}
              <View style={styles.handleContainer}>
                <View style={styles.handle} />
              </View>

              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <View style={styles.aiAvatar}>
                    <Image 
                      source={require('../assets/chiron.png')} 
                      style={styles.chironHeaderImage}
                      resizeMode="cover"
                    />
                  </View>
                  <View>
                    <View style={styles.titleRow}>
                      <Text style={styles.headerTitle}>Chiron</Text>
                      {user.isPremium && (
                        <View style={styles.premiumBadge}>
                          <Feather name="star" size={10} color={Theme.colors.warning} />
                          <Text style={styles.premiumText}>PRO</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.statusRow}>
                      <View style={styles.statusDot} />
                      <Text style={styles.statusText}>
                        {user.isPremium 
                          ? 'Elite AI • Unlimited' 
                          : `${currentRemaining}/${FREE_DAILY_COACH_MESSAGES} messages remaining`}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.headerRight}>
                  {messages.length > 1 && (
                    <Pressable onPress={handleNewConversation} style={styles.newChatButton}>
                      <Feather name="plus" size={18} color={Theme.colors.text.secondary} />
                    </Pressable>
                )}
                <Pressable onPress={handleClose} style={styles.closeButton}>
                  <Feather name="x" size={20} color={Theme.colors.text.secondary} />
                </Pressable>
              </View>
            </View>
              </View>

            {/* Free user upgrade banner */}
            {!user.isPremium && (
              <Pressable onPress={handleUpgradePress} style={styles.upgradeBanner}>
                <Feather name="zap" size={14} color={Theme.colors.warning} />
                <Text style={styles.upgradeBannerText}>Upgrade for unlimited guidance from Chiron</Text>
                <Feather name="chevron-right" size={16} color={Theme.colors.text.tertiary} />
              </Pressable>
            )}

            <KeyboardAvoidingView
              style={styles.keyboardView}
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 140 : 0}
            >
              {/* Messages */}
              <ScrollView
                ref={scrollViewRef}
                style={styles.messagesContainer}
                contentContainerStyle={styles.messagesContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
              >
                {messages.map((message) => (
                  <View
                    key={message.id}
                    style={[
                      styles.messageRow,
                      message.role === 'user' && styles.userMessageRow,
                    ]}
                  >
                    {message.role === 'assistant' && (
                      <View style={styles.messageAvatarContainer}>
                        <Image 
                          source={require('../assets/chiron.png')} 
                          style={styles.messageAvatarImage}
                          resizeMode="cover"
                        />
                      </View>
                    )}
                    <View
                      style={[
                        styles.messageBubble,
                        message.role === 'user' ? styles.userBubble : styles.aiBubble,
                      ]}
                    >
                      <View style={styles.messageContent}>
                        {renderFormattedText(message.content, message.role === 'user')}
                      </View>
                    </View>
                  </View>
                ))}

                {isTyping && (
                  <View style={styles.messageRow}>
                    <View style={styles.messageAvatarContainer}>
                      <Image 
                        source={require('../assets/chiron.png')} 
                        style={styles.messageAvatarImage}
                        resizeMode="cover"
                      />
                    </View>
                    <View style={[styles.messageBubble, styles.aiBubble, styles.typingBubble]}>
                      <LightningTypingIndicator />
                    </View>
                  </View>
                )}

                {/* Quick Actions */}
                {messages.length <= 1 && (
                  <View style={styles.quickActions}>
                    {quickActions.map((action) => (
                      <Pressable
                        key={action.id}
                        onPress={() => handleQuickAction(action)}
                        style={({ pressed }) => [
                          styles.quickAction,
                          pressed && { opacity: 0.7 },
                        ]}
                      >
                        <Feather name={action.icon as any} size={14} color={Theme.colors.warning} />
                        <Text style={styles.quickActionText}>{action.text}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </ScrollView>

              {/* Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Seek guidance from Chiron..."
                    placeholderTextColor={Theme.colors.text.tertiary}
                    value={inputText}
                    onChangeText={setInputText}
                    maxLength={500}
                    returnKeyType="send"
                    onSubmitEditing={() => {
                      if (inputText.trim()) {
                        handleSend();
                      }
                    }}
                    blurOnSubmit={false}
                  />
                  <Pressable
                    onPress={() => handleSend()}
                    disabled={!inputText.trim()}
                    style={({ pressed }) => [styles.sendButton, pressed && { opacity: 0.8 }]}
                  >
                    <LinearGradient
                      colors={inputText.trim() ? ['#F59E0B', '#D97706'] : [Theme.colors.background.card, Theme.colors.background.card]}
                      style={styles.sendButtonGradient}
                    >
                      <Feather
                        name="send"
                        size={16}
                        color={inputText.trim() ? Theme.colors.background.primary : Theme.colors.text.tertiary}
                      />
                    </LinearGradient>
                  </Pressable>
                </View>
              </View>
            </KeyboardAvoidingView>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    height: SCREEN_HEIGHT * 0.85,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  sheetGradient: {
    flex: 1,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Theme.colors.text.muted,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border.primary,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  chironHeaderImage: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.text.primary,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  premiumText: {
    fontSize: 9,
    fontWeight: '700',
    color: Theme.colors.warning,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Theme.colors.success,
  },
  statusText: {
    fontSize: 11,
    color: Theme.colors.text.tertiary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  newChatButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Theme.colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 8,
  },
  upgradeBannerText: {
    flex: 1,
    fontSize: 12,
    color: Theme.colors.text.secondary,
    fontWeight: '500',
  },
  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '88%',
    alignItems: 'flex-start',
  },
  userMessageRow: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  messageAvatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    marginRight: 10,
    marginTop: 2,
    borderWidth: 2,
    borderColor: 'rgba(245, 158, 11, 0.5)',
    backgroundColor: Theme.colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    maxWidth: '85%',
  },
  userBubble: {
    backgroundColor: Theme.colors.accent.primary,
    borderBottomRightRadius: 6,
    marginLeft: 40,
  },
  aiBubble: {
    backgroundColor: Theme.colors.background.card,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: Theme.colors.border.primary,
  },
  messageContent: {
    flexDirection: 'column',
  },
  messageText: {
    fontSize: 15,
    color: Theme.colors.text.primary,
    lineHeight: 23,
  },
  typingBubble: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    minWidth: 80,
  },
  quickActions: {
    marginTop: 20,
    gap: 10,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.15)',
  },
  quickActionText: {
    fontSize: 14,
    color: Theme.colors.text.secondary,
    fontWeight: '500',
  },
  inputContainer: {
    padding: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border.secondary,
    backgroundColor: Theme.colors.background.primary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    backgroundColor: Theme.colors.background.card,
    borderRadius: 24,
    paddingLeft: 18,
    paddingRight: 6,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Theme.colors.border.primary,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Theme.colors.text.primary,
    maxHeight: 100,
    paddingVertical: 10,
  },
  sendButton: {},
  sendButtonGradient: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
