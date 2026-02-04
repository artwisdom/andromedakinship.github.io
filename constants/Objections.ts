import { Industry } from '../contexts/AppContext';

export type Objection = {
  id: string;
  category: string;
  objection: string;
  tips: string[];
  sampleResponse: string;
  premium?: boolean; // Premium-only advanced objections
};

// Track recently shown objections for better randomization
let recentObjectionIds: string[] = [];
const MAX_RECENT_HISTORY = 10;

export const INDUSTRY_INFO: Record<Industry, { name: string; icon: string; color: string; description: string }> = {
  automotive: { name: 'Automotive', icon: '🚗', color: '#00D4AA', description: 'Car dealerships & vehicle sales' },
  saas: { name: 'SaaS / Tech', icon: '💻', color: '#6366F1', description: 'Software & technology solutions' },
  insurance: { name: 'Insurance', icon: '🛡️', color: '#F59E0B', description: 'Life, health, auto & property' },
  realestate: { name: 'Real Estate', icon: '🏠', color: '#EC4899', description: 'Residential & commercial property' },
  retail: { name: 'Retail', icon: '🛍️', color: '#22D3EE', description: 'Consumer goods & merchandise' },
  financial: { name: 'Financial Services', icon: '💰', color: '#10B981', description: 'Banking, loans & investments' },
  medical: { name: 'Medical/Healthcare', icon: '🏥', color: '#EF4444', description: 'Medical devices & healthcare' },
  solar: { name: 'Solar/Energy', icon: '☀️', color: '#FBBF24', description: 'Solar panels & clean energy' },
  telecom: { name: 'Telecom/Wireless', icon: '📱', color: '#8B5CF6', description: 'Phone, internet & communications' },
  hvac: { name: 'HVAC/Home Services', icon: '🔧', color: '#06B6D4', description: 'Heating, cooling & home improvement' },
  fitness: { name: 'Fitness/Wellness', icon: '💪', color: '#F472B6', description: 'Gyms, training & wellness programs' },
  general: { name: 'General Sales', icon: '💼', color: '#A855F7', description: 'Universal sales techniques' },
};

export const CATEGORIES = [
  { id: 'Price', name: 'Price', icon: 'dollar-sign', color: '#00F5D4' },
  { id: 'Timing', name: 'Timing', icon: 'clock', color: '#8B5CF6' },
  { id: 'Authority', name: 'Authority', icon: 'users', color: '#3B82F6' },
  { id: 'Need', name: 'Need', icon: 'help-circle', color: '#F59E0B' },
  { id: 'Trust', name: 'Trust', icon: 'shield', color: '#10B981' },
  { id: 'Competition', name: 'Competition', icon: 'flag', color: '#EF4444' },
  { id: 'Browsing', name: 'Browsing', icon: 'eye', color: '#22D3EE' },
  { id: 'Contract', name: 'Contract', icon: 'file-text', color: '#EC4899' },
];

export const QUOTES = [
  // === SALES QUOTES - From Sales Legends ===
  { text: "The key is not to call the decision maker. The key is to have the decision maker call you.", author: "Jeffrey Gitomer", category: "sales" },
  { text: "Every sale has five basic obstacles: no need, no money, no hurry, no desire, no trust.", author: "Zig Ziglar", category: "sales" },
  { text: "Sales are contingent upon the attitude of the salesman, not the attitude of the prospect.", author: "William Clement Stone", category: "sales" },
  { text: "Become the person who would attract the results you seek.", author: "Jim Cathcart", category: "sales" },
  { text: "Don't find customers for your products, find products for your customers.", author: "Seth Godin", category: "sales" },
  { text: "If you are not taking care of your customer, your competitor will.", author: "Bob Hooey", category: "sales" },
  { text: "Great salespeople are relationship builders who provide value and help their customers win.", author: "Jeffrey Gitomer", category: "sales" },
  { text: "Selling is essentially a transfer of feelings.", author: "Zig Ziglar", category: "sales" },
  { text: "The sale begins when the customer says no.", author: "Elmer Leterman", category: "sales" },
  { text: "Stop selling. Start helping.", author: "Zig Ziglar", category: "sales" },
  { text: "Every 'no' brings you closer to a 'yes'.", author: "Mark Cuban", category: "sales" },
  { text: "A goal is a dream with a deadline.", author: "Napoleon Hill", category: "sales" },
  { text: "In sales, it's not what you say; it's how they feel.", author: "Grant Cardone", category: "sales" },
  { text: "The customer's perception is your reality.", author: "Kate Zabriskie", category: "sales" },
  { text: "Approach each customer with the idea of helping them solve a problem.", author: "Brian Tracy", category: "sales" },
  { text: "Your attitude, not your aptitude, will determine your altitude.", author: "Zig Ziglar", category: "sales" },
  { text: "People don't buy for logical reasons. They buy for emotional reasons.", author: "Zig Ziglar", category: "sales" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier", category: "sales" },
  { text: "You don't close a sale, you open a relationship.", author: "Patricia Fripp", category: "sales" },
  { text: "The best salespeople know that their expertise can become their enemy in selling.", author: "Mike Bosworth", category: "sales" },
  { text: "Pretend that every single person you meet has a sign around their neck that says 'Make me feel important.'", author: "Mary Kay Ash", category: "sales" },
  { text: "If you don't believe in what you're selling, neither will your prospect.", author: "Frank Bettger", category: "sales" },
  { text: "The most important word in the vocabulary of sales is 'ask'.", author: "Brian Tracy", category: "sales" },
  { text: "A mediocre idea that generates enthusiasm will go further than a great idea that inspires no one.", author: "Mary Kay Ash", category: "sales" },
  { text: "To build a long-term, successful enterprise, when you don't close a sale, open a relationship.", author: "Patricia Fripp", category: "sales" },
  { text: "Make a customer, not a sale.", author: "Katherine Barchetti", category: "sales" },
  { text: "Always do your best. What you plant now, you will harvest later.", author: "Og Mandino", category: "sales" },
  { text: "Persistence and resilience only come from having been given the chance to work through difficult problems.", author: "Gever Tulley", category: "sales" },
  { text: "Sales is not about selling anymore, but about building trust and educating.", author: "Siva Devaki", category: "sales" },
  { text: "Spend a lot of time talking to customers face to face. You'd be amazed how many companies don't listen.", author: "Ross Perot", category: "sales" },
  { text: "Nobody counts the number of ads you run; they just remember the impression you make.", author: "William Bernbach", category: "sales" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson", category: "sales" },
  { text: "Quality performance starts with a positive attitude.", author: "Jeffrey Gitomer", category: "sales" },
  { text: "The secret of man's success resides in his insight into the moods of people.", author: "Grant Cardone", category: "sales" },
  { text: "Act as if what you do makes a difference. It does.", author: "William James", category: "sales" },
  { text: "High expectations are the key to everything.", author: "Sam Walton", category: "sales" },
  { text: "Opportunities don't happen. You create them.", author: "Chris Grosser", category: "sales" },
  { text: "Our greatest weakness lies in giving up. The most certain way to succeed is to try one more time.", author: "Thomas Edison", category: "sales" },
  { text: "I attribute my success to this: I never gave or took any excuse.", author: "Florence Nightingale", category: "sales" },
  { text: "Be patient with yourself. Self-growth is tender; it's holy ground.", author: "Stephen Covey", category: "sales" },
  { text: "The successful warrior is the average man with laser-like focus.", author: "Bruce Lee", category: "sales" },
  { text: "Don't be afraid to give up the good to go for the great.", author: "John D. Rockefeller", category: "sales" },
  { text: "If you really look closely, most overnight successes took a long time.", author: "Steve Jobs", category: "sales" },
  { text: "There are no shortcuts to any place worth going.", author: "Beverly Sills", category: "sales" },
  { text: "I find that the harder I work, the more luck I seem to have.", author: "Thomas Jefferson", category: "sales" },
  { text: "You will never find time for anything. If you want time, you must make it.", author: "Charles Buxton", category: "sales" },
  { text: "Courage is resistance to fear, mastery of fear - not absence of fear.", author: "Mark Twain", category: "sales" },
  
  // === SPORTS & ATHLETE QUOTES ===
  { text: "I've missed more than 9000 shots in my career. And that is why I succeed.", author: "Michael Jordan", category: "athlete" },
  { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke", category: "athlete" },
  { text: "Champions keep playing until they get it right.", author: "Billie Jean King", category: "athlete" },
  { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky", category: "athlete" },
  { text: "It's not whether you get knocked down, it's whether you get up.", author: "Vince Lombardi", category: "athlete" },
  { text: "The more difficult the victory, the greater the happiness in winning.", author: "Pelé", category: "athlete" },
  { text: "I hated every minute of training, but I said, 'Don't quit. Suffer now and live the rest of your life as a champion.'", author: "Muhammad Ali", category: "athlete" },
  { text: "The only way to prove you're a good sport is to lose.", author: "Ernie Banks", category: "athlete" },
  { text: "Winning isn't everything, but wanting to win is.", author: "Vince Lombardi", category: "athlete" },
  { text: "The difference between the impossible and the possible lies in determination.", author: "Tommy Lasorda", category: "athlete" },
  { text: "Excellence is not a singular act, but a habit. You are what you repeatedly do.", author: "Shaquille O'Neal", category: "athlete" },
  { text: "Pain is temporary. Quitting lasts forever.", author: "Lance Armstrong", category: "athlete" },
  { text: "The harder the battle, the sweeter the victory.", author: "Les Brown", category: "athlete" },
  { text: "Set your goals high, and don't stop till you get there.", author: "Bo Jackson", category: "athlete" },
  { text: "You can't put a limit on anything. The more you dream, the farther you get.", author: "Michael Phelps", category: "athlete" },
  { text: "Never give up, never give in, and when the upper hand is ours, may we have the ability to handle the win with the dignity that we absorbed the loss.", author: "Doug Williams", category: "athlete" },
  { text: "Gold medals aren't really made of gold. They're made of sweat, determination, and a hard-to-find alloy called guts.", author: "Dan Gable", category: "athlete" },
  { text: "Show me a guy who's afraid to look bad, and I'll show you a guy you can beat every time.", author: "Lou Brock", category: "athlete" },
  { text: "There may be people who have more talent than you, but there's no excuse for anyone to work harder than you do.", author: "Derek Jeter", category: "athlete" },
  { text: "Without self-discipline, success is impossible, period.", author: "Lou Holtz", category: "athlete" },
  { text: "The principle is competing against yourself. It's about self-improvement, about being better than you were the day before.", author: "Steve Young", category: "athlete" },
  { text: "One man can be a crucial ingredient on a team, but one man cannot make a team.", author: "Kareem Abdul-Jabbar", category: "athlete" },
  { text: "If you can believe it, the mind can achieve it.", author: "Ronnie Lott", category: "athlete" },
  { text: "Persistence can change failure into extraordinary achievement.", author: "Marv Levy", category: "athlete" },
  { text: "Make sure your worst enemy doesn't live between your own two ears.", author: "Laird Hamilton", category: "athlete" },
  { text: "What makes something special is not just what you have to gain, but what you feel there is to lose.", author: "Andre Agassi", category: "athlete" },
  { text: "Most people give up just when they're about to achieve success.", author: "Ross Perot", category: "athlete" },
  { text: "Age is no barrier. It's a limitation you put on your mind.", author: "Jackie Joyner-Kersee", category: "athlete" },
  { text: "When you've got something to prove, there's nothing greater than a challenge.", author: "Terry Bradshaw", category: "athlete" },
  { text: "Never let your head hang down. Find another way.", author: "Satchel Paige", category: "athlete" },
  
  // === BUSINESS LEADER QUOTES ===
  { text: "Your most unhappy customers are your greatest source of learning.", author: "Bill Gates", category: "business" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney", category: "business" },
  { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs", category: "business" },
  { text: "The biggest risk is not taking any risk.", author: "Mark Zuckerberg", category: "business" },
  { text: "Move fast and break things. Unless you are breaking stuff, you are not moving fast enough.", author: "Mark Zuckerberg", category: "business" },
  { text: "The people who are crazy enough to think they can change the world are the ones who do.", author: "Steve Jobs", category: "business" },
  { text: "It's fine to celebrate success but it is more important to heed the lessons of failure.", author: "Bill Gates", category: "business" },
  { text: "If you're not embarrassed by the first version of your product, you've launched too late.", author: "Reid Hoffman", category: "business" },
  { text: "Chase the vision, not the money. The money will end up following you.", author: "Tony Hsieh", category: "business" },
  { text: "The only thing worse than starting something and failing is not starting something.", author: "Seth Godin", category: "business" },
  { text: "Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work.", author: "Steve Jobs", category: "business" },
  { text: "I knew that if I failed I wouldn't regret that, but I knew the one thing I might regret is not trying.", author: "Jeff Bezos", category: "business" },
  { text: "Logic will get you from A to B. Imagination will take you everywhere.", author: "Albert Einstein", category: "business" },
  
  // === MOTIVATIONAL QUOTES ===
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt", category: "motivation" },
  { text: "The only limit to our realization of tomorrow is our doubts of today.", author: "Franklin D. Roosevelt", category: "motivation" },
  { text: "What you get by achieving your goals is not as important as what you become.", author: "Zig Ziglar", category: "motivation" },
  { text: "Whether you think you can or you think you can't, you're right.", author: "Henry Ford", category: "motivation" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb", category: "motivation" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt", category: "motivation" },
  { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle", category: "motivation" },
  { text: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson", category: "motivation" },
  { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair", category: "motivation" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill", category: "motivation" },
  { text: "Don't be pushed around by the fears in your mind. Be led by the dreams in your heart.", author: "Roy T. Bennett", category: "motivation" },
  { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson", category: "motivation" },
  { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", author: "Nelson Mandela", category: "motivation" },
  { text: "Life is 10% what happens to us and 90% how we react to it.", author: "Charles R. Swindoll", category: "motivation" },
  { text: "The mind is everything. What you think you become.", author: "Buddha", category: "motivation" },
  { text: "Strive not to be a success, but rather to be of value.", author: "Albert Einstein", category: "motivation" },
  { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins", category: "motivation" },
  { text: "Twenty years from now you will be more disappointed by the things you didn't do than by the ones you did do.", author: "Mark Twain", category: "motivation" },
  { text: "I am not a product of my circumstances. I am a product of my decisions.", author: "Stephen Covey", category: "motivation" },
  { text: "We become what we think about most of the time.", author: "Earl Nightingale", category: "motivation" },
  { text: "The pessimist sees difficulty in every opportunity. The optimist sees opportunity in every difficulty.", author: "Winston Churchill", category: "motivation" },
  { text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis", category: "motivation" },
  { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt", category: "motivation" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela", category: "motivation" },
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe", category: "motivation" },
];

// Track shown quotes to avoid repetition
let shownQuoteIndices: number[] = [];

export function getRandomQuote() {
  // If all quotes have been shown, reset the tracking
  if (shownQuoteIndices.length >= QUOTES.length) {
    shownQuoteIndices = [];
  }
  
  // Get indices that haven't been shown yet
  const availableIndices = QUOTES.map((_, i) => i).filter(i => !shownQuoteIndices.includes(i));
  
  // Pick a random index from available ones
  const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
  
  // Track this quote as shown
  shownQuoteIndices.push(randomIndex);
  
  return QUOTES[randomIndex];
}

export function clearQuoteHistory() {
  shownQuoteIndices = [];
}

export const OBJECTIONS: Record<Industry, Objection[]> = {
  automotive: [
    // Price (4)
    { id: 'auto-1', category: 'Price', objection: "The price is too high.", tips: ['Focus on value and features', 'Compare to similar vehicles', 'Break down the monthly payment'], sampleResponse: "I hear you. Let me show you what makes this vehicle worth every penny - the safety features alone could save you thousands. Let's look at what the monthly payment would actually be." },
    { id: 'auto-2', category: 'Price', objection: "Can you do better on the price?", tips: ['Understand what better means', 'Know your bottom line', 'Add value'], sampleResponse: "I want to get you the best deal possible. Is there a specific number you need to hit, or are you looking for more value?" },
    { id: 'auto-3', category: 'Price', objection: "The monthly payment is more than I wanted.", tips: ['Adjust term length', 'Discuss down payment', 'Show total cost of ownership'], sampleResponse: "Let's work with that. Would a longer term help? Or if you put a bit more down, we can get that payment right where you need it." },
    { id: 'auto-4', category: 'Price', objection: "My trade-in is worth more than that.", tips: ['Explain valuation process', 'Show market data', 'Focus on net cost'], sampleResponse: "I understand. Let me show you the market data we used. But here's the thing - whether it's in trade value or price reduction, let's get you to the same bottom line." },
    // Timing (4)
    { id: 'auto-5', category: 'Timing', objection: "I'm just looking today, not ready to buy.", tips: ['Build rapport', 'Understand their timeline', 'Plant seeds for urgency'], sampleResponse: "Absolutely, that's what we're here for! What prompted you to start looking? Let me make sure you have all the info you need when the time is right." },
    { id: 'auto-6', category: 'Timing', objection: "I want to think about it.", tips: ['Find out what they need to think about', 'Address specific concerns'], sampleResponse: "Of course! What specifically would you like to think over? Is it the vehicle itself, the numbers, or something else?" },
    { id: 'auto-7', category: 'Timing', objection: "I'll come back next week.", tips: ['Create urgency', 'Lock in pricing', 'Get commitment'], sampleResponse: "I'd love to see you! Just so you know, this pricing and this specific vehicle might not be here. Can I hold it for you with a small deposit?" },
    { id: 'auto-8', category: 'Timing', objection: "I want to wait for the new model year.", tips: ['Compare current deals', 'Discuss depreciation', 'Show current inventory'], sampleResponse: "The new models will be more expensive with fewer incentives. Right now you're getting last year's savings on a vehicle that'll look the same. Want me to show you the price difference?" },
    // Authority (3)
    { id: 'auto-9', category: 'Authority', objection: "I need to talk to my spouse first.", tips: ['Respect the decision', 'Offer to include them', 'Get commitment to return'], sampleResponse: "Of course! Would it help to bring them in, or I could set up a video call? What questions do you think they'll have?" },
    { id: 'auto-10', category: 'Authority', objection: "My dad wants to look at it first.", tips: ['Welcome the helper', 'Offer to arrange visit', 'Position as expert backup'], sampleResponse: "That's smart! Bring him in - I'd love to show him under the hood. When works best for both of you?" },
    { id: 'auto-11', category: 'Authority', objection: "I need to run the numbers by my accountant.", tips: ['Provide documentation', 'Offer tax info', 'Follow up timing'], sampleResponse: "Great idea for a business vehicle! I'll print everything including the tax deduction estimates. When do you think you'll hear back?" },
    // Competition (3)
    { id: 'auto-12', category: 'Competition', objection: "I got a better quote from another dealer.", tips: ['Ask to see the quote', 'Compare apples to apples', 'Add value'], sampleResponse: "I'd love to see that! Sometimes quotes don't include everything. Let me make sure we're comparing the exact same vehicle and features." },
    { id: 'auto-13', category: 'Competition', objection: "I'm also looking at a Honda/Toyota.", tips: ['Know competitor weaknesses', 'Highlight your strengths', 'Offer test drive comparison'], sampleResponse: "Great vehicles! Have you driven both? Here's what our customers tell us after comparing - let me show you the features that make the difference." },
    { id: 'auto-14', category: 'Competition', objection: "The dealer down the street has the same car.", tips: ['Differentiate on service', 'Highlight your value-adds', 'Build relationship'], sampleResponse: "They might have the car, but do they have me? Seriously though - our service department, our follow-up, our reputation. Let me show you why people drive past them to come here." },
    // Trust (3)
    { id: 'auto-15', category: 'Trust', objection: "I don't trust dealerships.", tips: ['Acknowledge their concern', 'Be transparent', 'Build personal trust'], sampleResponse: "I totally get it - this industry has earned some of that reputation. Here's what I can promise: I'll be completely transparent with you. No games, no pressure." },
    { id: 'auto-16', category: 'Trust', objection: "How do I know this isn't a lemon?", tips: ['Show vehicle history', 'Explain inspection process', 'Discuss warranty'], sampleResponse: "Great question! Here's the full Carfax, our 150-point inspection report, and this vehicle comes with our powertrain warranty. Want to have your own mechanic look at it?" },
    { id: 'auto-17', category: 'Trust', objection: "I've had bad experiences with car salespeople.", tips: ['Empathize genuinely', 'Set different expectations', 'Prove through action'], sampleResponse: "I'm sorry to hear that. I can't speak for them, but here's my approach: I'll give you all the information, answer every question, and there's zero pressure. You decide." },
    // Need (3)
    { id: 'auto-18', category: 'Need', objection: "My current car is fine.", tips: ['Explore pain points', 'Discuss future needs', 'Calculate repair costs'], sampleResponse: "That's great that it's running! What made you stop by today though? Sometimes 'fine' means we're spending more on maintenance than we realize." },
    { id: 'auto-19', category: 'Need', objection: "I don't really need a new car.", tips: ['Understand the visit reason', 'Find the underlying need', 'Show value of upgrading'], sampleResponse: "Fair enough! But something brought you in today. What would need to change for you to consider upgrading?" },
    { id: 'auto-20', category: 'Need', objection: "This car is more than I need.", tips: ['Find the right fit', 'Discuss practical needs', 'Show alternatives'], sampleResponse: "I appreciate your practicality! Let me show you something that might be a better fit. What features do you actually use daily?" },
  ],
  saas: [
    // Price (4)
    { id: 'saas-1', category: 'Price', objection: "It's too expensive.", tips: ['Calculate ROI together', 'Compare to cost of not solving'], sampleResponse: "I understand budget is important. Let's look at the ROI - how much time does your team spend on this problem weekly? You'd likely see payback within 2 months." },
    { id: 'saas-2', category: 'Price', objection: "We don't have budget for this.", tips: ['Find hidden budget', 'Show cost savings', 'Offer creative pricing'], sampleResponse: "I hear that a lot. But what's the cost of NOT solving this? Often we find budget by showing what you'll save elsewhere. Let me help build that case." },
    { id: 'saas-3', category: 'Price', objection: "Can you give us a discount?", tips: ['Understand the ask', 'Trade value for discount', 'Annual vs monthly'], sampleResponse: "I want to make this work! If you commit to annual billing, I can offer 20% off. Or if you add more seats, we have volume pricing. What works best?" },
    { id: 'saas-4', category: 'Price', objection: "There are free alternatives.", tips: ['Show hidden costs of free', 'Highlight support value', 'Discuss scalability'], sampleResponse: "Free tools are great for starting out. But how much time does your team spend working around their limitations? Our customers switch when they realize their time costs more." },
    // Timing (3)
    { id: 'saas-5', category: 'Timing', objection: "We're too busy to implement right now.", tips: ['Emphasize easy onboarding', 'Offer implementation support'], sampleResponse: "You're busy because of the exact problem we solve! Our average customer is up and running in 2 hours. What if we started with just one team?" },
    { id: 'saas-6', category: 'Timing', objection: "Let's revisit this next quarter.", tips: ['Create urgency', 'Quantify delay cost', 'Offer to stay in touch'], sampleResponse: "I understand planning cycles. But every month you wait costs you X in lost productivity. What if we did a pilot now so you're ready for full rollout next quarter?" },
    { id: 'saas-7', category: 'Timing', objection: "We're in the middle of another project.", tips: ['Show low effort needed', 'Offer delayed start', 'Run parallel'], sampleResponse: "Totally get it. This actually requires minimal bandwidth - most setup is on our end. We could even do the heavy lifting while you wrap up your other project." },
    // Competition (3)
    { id: 'saas-8', category: 'Competition', objection: "We're already using a competitor.", tips: ['Don\'t badmouth competitor', 'Ask about pain points'], sampleResponse: "Great, you see the value in this category! What made you start looking at alternatives? I'd love to understand what's working and what's not." },
    { id: 'saas-9', category: 'Competition', objection: "What makes you different from Competitor X?", tips: ['Know competitor weaknesses', 'Focus on your strengths', 'Use customer proof'], sampleResponse: "Great question! Our customers who switched from them say three things: better support, faster performance, and our unique feature X. Want to see a side-by-side?" },
    { id: 'saas-10', category: 'Competition', objection: "We're evaluating multiple vendors.", tips: ['Understand criteria', 'Position as partner', 'Offer trial'], sampleResponse: "Smart approach! What criteria matter most to you? I'd love to show you how we stack up. Would a hands-on trial help your evaluation?" },
    // Authority (3)
    { id: 'saas-11', category: 'Authority', objection: "I need to get approval from my boss.", tips: ['Offer to help build the business case', 'Provide ROI documentation'], sampleResponse: "Absolutely! Would it help if I put together an ROI summary for your boss? I can also join a call to answer technical questions." },
    { id: 'saas-12', category: 'Authority', objection: "IT needs to review this first.", tips: ['Provide security docs', 'Offer IT call', 'Address concerns proactively'], sampleResponse: "Of course! Here's our SOC 2 report, security whitepaper, and compliance docs. Would it help if our security team did a call with your IT?" },
    { id: 'saas-13', category: 'Authority', objection: "This needs to go through procurement.", tips: ['Understand process', 'Provide necessary docs', 'Offer direct support'], sampleResponse: "No problem! What does your procurement process look like? I'll get you all the paperwork and can work directly with them to speed things up." },
    // Need (3)
    { id: 'saas-14', category: 'Need', objection: "We've built our own internal solution.", tips: ['Acknowledge their investment', 'Ask about maintenance burden'], sampleResponse: "That's impressive! How much time does your team spend maintaining it? Freeing up devs to work on core product is often worth more than the subscription." },
    { id: 'saas-15', category: 'Need', objection: "We don't have this problem.", tips: ['Dig deeper', 'Share industry benchmarks', 'Plant seeds'], sampleResponse: "That's great! Can I ask how you currently handle X? I ask because most companies your size lose Y hours weekly here. Maybe you've solved it differently?" },
    { id: 'saas-16', category: 'Need', objection: "We're too small for this.", tips: ['Show small company success', 'Emphasize scalability', 'Start small'], sampleResponse: "Actually, our smallest customers see the biggest percentage gains! You can start with just 3 seats. Growing companies like yours are our sweet spot." },
    // Trust (3)
    { id: 'saas-17', category: 'Trust', objection: "How do I know you'll still be around?", tips: ['Share company metrics', 'Mention investors'], sampleResponse: "Great question! We've grown 3x in the last year, backed by top investors. I can connect you with customers who've been with us since day one." },
    { id: 'saas-18', category: 'Trust', objection: "What about data security?", tips: ['Share certifications', 'Explain architecture', 'Offer security review'], sampleResponse: "Security is our top priority. We're SOC 2 Type II certified, encrypt everything, and your data never leaves our secured cloud. Want to see our security documentation?" },
    { id: 'saas-19', category: 'Trust', objection: "I've never heard of your company.", tips: ['Share customer logos', 'Provide references', 'Offer trial'], sampleResponse: "We're growing fast! Here are some customers you might recognize: [logos]. I can also connect you with a reference in your industry. Or just try us free for 14 days." },
  ],
  insurance: [
    // Price (4)
    { id: 'ins-1', category: 'Price', objection: "Your rates are higher than my current provider.", tips: ['Compare coverage, not just price', 'Highlight claims experience'], sampleResponse: "Let's compare what you're actually getting. Often a lower premium means higher deductibles or less coverage. Can we look at your current policy together?" },
    { id: 'ins-2', category: 'Price', objection: "I can't afford this premium.", tips: ['Adjust coverage levels', 'Find discounts', 'Show payment options'], sampleResponse: "Let me help. We can adjust deductibles, bundle policies, or find discounts you qualify for. What's your target monthly budget?" },
    { id: 'ins-3', category: 'Price', objection: "Insurance is a waste of money.", tips: ['Share claim stories', 'Quantify the risk', 'Emotional appeal'], sampleResponse: "I understand - it feels that way until you need it. I had a client last month whose claim was $47,000. That one claim was worth 20 years of premiums." },
    { id: 'ins-4', category: 'Price', objection: "Why did my rate go up?", tips: ['Explain rate factors', 'Find new discounts', 'Shop coverage'], sampleResponse: "Great question. Rates change due to claims in your area, costs, and other factors. Let me review your policy - there might be new discounts or adjustments we can make." },
    // Trust (3)
    { id: 'ins-5', category: 'Trust', objection: "I've been with my agent for years.", tips: ['Respect the relationship', 'Offer to be a second opinion'], sampleResponse: "That loyalty is admirable! I'm not asking you to leave them - just let me review your coverage. If I can't do better, you'll know you're in good hands." },
    { id: 'ins-6', category: 'Trust', objection: "Insurance companies never pay claims.", tips: ['Share claims statistics', 'Explain process', 'Provide examples'], sampleResponse: "I understand that frustration. Our claims satisfaction rate is 94%. I'll be your advocate through any claim. Can I share some recent examples?" },
    { id: 'ins-7', category: 'Trust', objection: "How do I know you're giving me good advice?", tips: ['Explain fiduciary duty', 'Show credentials', 'Offer references'], sampleResponse: "Fair question! I'm licensed, and my reputation depends on happy clients. Here's what my reviews say. I can also connect you with clients I've helped." },
    // Need (3)
    { id: 'ins-8', category: 'Need', objection: "I don't think I need that much coverage.", tips: ['Explain worst-case scenarios', 'Share real claims stories'], sampleResponse: "I hope you never need it! But if your home was destroyed tomorrow, would your current coverage rebuild it at today's prices?" },
    { id: 'ins-9', category: 'Need', objection: "I'm young and healthy, I don't need life insurance.", tips: ['Show cost advantage of youth', 'Discuss future planning', 'Lock in rates'], sampleResponse: "That's exactly why NOW is the time! Your rates will never be lower. Lock in today's health rating forever. It's pennies a day right now." },
    { id: 'ins-10', category: 'Need', objection: "I already have coverage through work.", tips: ['Explain portability issues', 'Show coverage gaps', 'Discuss job changes'], sampleResponse: "That's a great start! But what happens if you change jobs or get laid off? Plus, work coverage is usually basic. Let me show you the gaps." },
    // Timing (3)
    { id: 'ins-11', category: 'Timing', objection: "I'll think about it and call you back.", tips: ['Create urgency with rates', 'Offer to hold a quote'], sampleResponse: "Of course! Just so you know, rates can change. I can hold this quote for 48 hours. Can I call you Thursday to follow up?" },
    { id: 'ins-12', category: 'Timing', objection: "I want to wait until my policy renews.", tips: ['Check for cancellation fees', 'Compare savings', 'Start process early'], sampleResponse: "When does it renew? We can time the switch perfectly. But let's run the numbers now - sometimes the savings justify switching early." },
    { id: 'ins-13', category: 'Timing', objection: "This isn't a good time.", tips: ['Understand the timing', 'Offer flexibility', 'Plant seeds'], sampleResponse: "I understand. Is it the time of day, or timing in general? I can work around your schedule, or if you prefer, I'll follow up in a month." },
    // Competition (3)
    { id: 'ins-14', category: 'Competition', objection: "I can get the same thing online for less.", tips: ['Emphasize personal service', 'Explain claims advocacy'], sampleResponse: "Online quotes look great until you have a claim. When you're dealing with a disaster, you want someone local who'll fight for you." },
    { id: 'ins-15', category: 'Competition', objection: "I'm getting quotes from multiple agents.", tips: ['Encourage comparison', 'Differentiate on service', 'Follow up'], sampleResponse: "You should! When comparing, make sure coverage limits match exactly. I'm confident we'll come out on top. When should I follow up?" },
    { id: 'ins-16', category: 'Competition', objection: "My current agent said they'd match any price.", tips: ['Question coverage matching', 'Discuss relationship', 'Provide value'], sampleResponse: "That's great they value your business! But are they matching coverage or just price? Let me show you what you'd actually be comparing." },
  ],
  realestate: [
    // Price (4)
    { id: 're-1', category: 'Price', objection: "The asking price is too high.", tips: ['Show comparable sales', 'Explain market conditions'], sampleResponse: "Let me show you recent sales in this area. Given the updates, location, and school district, this is priced competitively. What's your target budget?" },
    { id: 're-2', category: 'Price', objection: "Why should I pay 6% commission?", tips: ['Break down the value', 'Explain marketing costs'], sampleResponse: "Fair question! That covers professional photos, marketing, negotiations, paperwork. My listings sell for 8% more on average - that's more in your pocket even after commission." },
    { id: 're-3', category: 'Price', objection: "Can the seller come down on price?", tips: ['Understand motivation', 'Present offer strategy', 'Show value'], sampleResponse: "Let's find out! I'll prepare an offer that shows you're serious while leaving room to negotiate. What would make this the right price for you?" },
    { id: 're-4', category: 'Price', objection: "This is over our pre-approval amount.", tips: ['Discuss options', 'Talk to lender', 'Find alternatives'], sampleResponse: "Let's talk to your lender - sometimes they can adjust. Or we can look at similar homes in your range. What do you love most about this one?" },
    // Timing (3)
    { id: 're-5', category: 'Timing', objection: "We're waiting for the market to cool down.", tips: ['Discuss interest rates', 'Explain opportunity cost'], sampleResponse: "I understand. But even if prices drop 5%, higher interest rates could cost you more monthly. Let me run the numbers for you." },
    { id: 're-6', category: 'Timing', objection: "We're not in a rush.", tips: ['Understand timeline', 'Discuss market conditions', 'Stay in touch'], sampleResponse: "That's actually a great position to be in! What's your ideal timeline? I'll keep you updated on anything that matches your criteria." },
    { id: 're-7', category: 'Timing', objection: "We just started looking.", tips: ['Be patient', 'Educate about process', 'Build relationship'], sampleResponse: "Perfect! Let me help you understand the process and what to look for. By the time you're ready to buy, you'll know exactly what you want." },
    // Authority (3)
    { id: 're-8', category: 'Authority', objection: "We need to sell our house first.", tips: ['Discuss contingency offers', 'Explain bridge financing'], sampleResponse: "That's common! We have options - contingent offers, bridge loans, or I can help you sell quickly first. What feels most comfortable?" },
    { id: 're-9', category: 'Authority', objection: "We need to discuss this together.", tips: ['Include both parties', 'Schedule showing', 'Provide information'], sampleResponse: "Absolutely! Would it help to schedule a time when you can both tour the property? I want you both to feel great about this decision." },
    { id: 're-10', category: 'Authority', objection: "Our parents are helping with the down payment.", tips: ['Include in process', 'Address concerns', 'Provide documentation'], sampleResponse: "That's wonderful! Would they like to see the property too? I can also prepare materials that show the investment value." },
    // Need (3)
    { id: 're-11', category: 'Need', objection: "We like it but it needs too much work.", tips: ['Get repair estimates', 'Show renovation ROI'], sampleResponse: "Let's get a contractor estimate. Often what looks like a lot is actually manageable, and it gives us negotiating power on price." },
    { id: 're-12', category: 'Need', objection: "This doesn't have everything on our list.", tips: ['Prioritize must-haves', 'Discuss compromises', 'Show potential'], sampleResponse: "No home is perfect! What are your absolute must-haves? Sometimes the best homes are the ones we didn't expect. What could you live without?" },
    { id: 're-13', category: 'Need', objection: "The neighborhood isn't what we imagined.", tips: ['Share neighborhood info', 'Discuss lifestyle', 'Tour at different times'], sampleResponse: "Have you spent time here? It's different during the day, evenings, weekends. Let me show you the community - the parks, restaurants, schools." },
    // Competition (3)
    { id: 're-14', category: 'Competition', objection: "We're working with another agent.", tips: ['Respect relationship', 'Offer value', 'Stay professional'], sampleResponse: "No problem! If things change or you need a second opinion, I'm here. What specifically are you looking for? I'll keep an eye out." },
    { id: 're-15', category: 'Competition', objection: "We might just use a discount broker.", tips: ['Explain full-service value', 'Show negotiation results', 'Discuss risks'], sampleResponse: "I understand wanting to save. But in my experience, skilled negotiation more than makes up for the commission difference. Let me show you recent results." },
    { id: 're-16', category: 'Competition', objection: "We found a similar house for less.", tips: ['Compare properties', 'Explain differences', 'Add value'], sampleResponse: "Let's look at it together! Sometimes lower prices mean different finishes, lot size, or location. I want you to get the best value possible." },
  ],
  retail: [
    // Price (4)
    { id: 'ret-1', category: 'Price', objection: "I can get this cheaper online.", tips: ['Emphasize immediate availability', 'Offer price matching'], sampleResponse: "Let me look at that. You can take this home today, and if anything's wrong, just bring it back. No shipping hassles. Can I match that price for you?" },
    { id: 'ret-2', category: 'Price', objection: "That's more than I wanted to spend.", tips: ['Show value', 'Offer alternatives'], sampleResponse: "I understand. Let me show you what makes this worth it - or I can show you a similar option that's more budget-friendly. What's most important to you?" },
    { id: 'ret-3', category: 'Price', objection: "Is this going on sale soon?", tips: ['Be honest', 'Create urgency', 'Show current value'], sampleResponse: "I honestly don't know future sales, but I can tell you this is a popular item. If you want it, today's price is good. Want me to check for any current promotions?" },
    { id: 'ret-4', category: 'Price', objection: "Can you throw in anything extra?", tips: ['Find add-ons', 'Bundle value', 'Check promotions'], sampleResponse: "Let me see what I can do! We might have a bundle deal or I can add the extended warranty. What would make this feel like a great value?" },
    // Browsing (3)
    { id: 'ret-5', category: 'Browsing', objection: "I'm just looking.", tips: ['Give them space', 'Plant helpful seeds'], sampleResponse: "No problem at all! Take your time. I'm here if you have any questions. By the way, we have some unadvertised deals on that section." },
    { id: 'ret-6', category: 'Browsing', objection: "I'm just killing time.", tips: ['Be friendly', 'Soft sell', 'Create experience'], sampleResponse: "Hey, sometimes that's the best way to find something great! Anything in particular catch your eye? No pressure, just curious." },
    { id: 'ret-7', category: 'Browsing', objection: "I'm waiting for someone.", tips: ['Offer assistance', 'Light conversation', 'Soft introduction'], sampleResponse: "No problem! Feel free to look around. If you or your friend have any questions when they arrive, I'm happy to help." },
    // Need (3)
    { id: 'ret-8', category: 'Need', objection: "I don't really need this.", tips: ['Explore their original intent', 'Connect to their life'], sampleResponse: "What brought you in today? Sometimes we don't know we need something until we see how it fits our life." },
    { id: 'ret-9', category: 'Need', objection: "I have something similar at home.", tips: ['Find the upgrade', 'Show new features', 'Discuss replacement'], sampleResponse: "How's it working for you? Sometimes an upgrade makes a bigger difference than we expect. When did you get yours?" },
    { id: 'ret-10', category: 'Need', objection: "This is a want, not a need.", tips: ['Validate the want', 'Discuss treating yourself', 'Remove guilt'], sampleResponse: "You know what? Sometimes 'wants' matter too. You work hard! When's the last time you treated yourself to something you really wanted?" },
    // Timing (3)
    { id: 'ret-11', category: 'Timing', objection: "I'll come back later.", tips: ['Create urgency', 'Offer a reason to buy now'], sampleResponse: "Of course! Just so you know, this is our last one in this color, and the sale ends today." },
    { id: 'ret-12', category: 'Timing', objection: "I need to think about it.", tips: ['Understand concern', 'Offer info to take', 'Follow up'], sampleResponse: "Take your time! What would help you decide? I can write down the details for you. Would you like my card in case you have questions?" },
    { id: 'ret-13', category: 'Timing', objection: "I'm shopping for a gift and not sure yet.", tips: ['Understand recipient', 'Offer gift receipt', 'Suggest options'], sampleResponse: "Gift shopping can be tricky! Tell me about the person. And remember, we have easy returns and gift receipts for any occasion." },
    // Trust (3)
    { id: 'ret-14', category: 'Trust', objection: "What's the return policy?", tips: ['Explain policy clearly', 'Show confidence in product'], sampleResponse: "Great question! 30-day full refund, no questions asked. I'm confident you'll love it, but if not, bring it back. Keep your receipt." },
    { id: 'ret-15', category: 'Trust', objection: "Is this good quality?", tips: ['Share product knowledge', 'Personal experience', 'Warranty info'], sampleResponse: "I've sold hundreds of these and the feedback is excellent. It comes with a 2-year warranty, and honestly, I have one at home myself." },
    { id: 'ret-16', category: 'Trust', objection: "I've read bad reviews.", tips: ['Address concerns', 'Share positive feedback', 'Offer trial'], sampleResponse: "I appreciate you doing research! What specifically concerned you? I can address those points. Our return rate is actually very low on this item." },
  ],
  financial: [
    // Price (3)
    { id: 'fin-1', category: 'Price', objection: "Your fees are too high.", tips: ['Break down the value', 'Compare to alternatives'], sampleResponse: "Let's look at what you get: comprehensive planning, tax optimization, estate planning. After fees, my clients average significantly better returns than DIY investors." },
    { id: 'fin-2', category: 'Price', objection: "I don't want to pay for advice.", tips: ['Show cost of mistakes', 'Explain value', 'Compare options'], sampleResponse: "I understand. But one tax mistake or wrong investment can cost more than years of advisory fees. Let me show you what proper planning could save you." },
    { id: 'fin-3', category: 'Price', objection: "Index funds are cheaper.", tips: ['Discuss full service', 'Show beyond investing', 'Tax planning value'], sampleResponse: "They are! And I use them often. But investing is just part of it - tax planning, estate planning, insurance. The full picture is where I add the most value." },
    // Trust (4)
    { id: 'fin-4', category: 'Trust', objection: "I don't trust financial advisors.", tips: ['Acknowledge past experiences', 'Explain fiduciary standard'], sampleResponse: "I understand. I'm a fiduciary, legally required to put your interests first. Let me show you exactly how I get paid - complete transparency." },
    { id: 'fin-5', category: 'Trust', objection: "How do I know you won't lose my money?", tips: ['Set expectations', 'Discuss risk', 'Show track record'], sampleResponse: "Markets go up and down - no one can prevent that. But I can help you take appropriate risk for your goals and timeline. Let me show you how we manage downturns." },
    { id: 'fin-6', category: 'Trust', objection: "I had a bad experience with an advisor before.", tips: ['Empathize', 'Differentiate', 'Offer transparency'], sampleResponse: "I'm sorry to hear that. Would you share what happened? I want to make sure I do things differently. Here's how I work and how you can hold me accountable." },
    { id: 'fin-7', category: 'Trust', objection: "Are you just going to sell me products?", tips: ['Explain fee structure', 'Show independence', 'Client-first approach'], sampleResponse: "Great question! I'm fee-only, which means I don't earn commissions. My only income is from helping you succeed. No product sales, ever." },
    // Need (3)
    { id: 'fin-8', category: 'Need', objection: "I can manage my own investments.", tips: ['Respect their knowledge', 'Ask about their time'], sampleResponse: "That's great you're engaged! How much time do you spend weekly? My value isn't just returns - it's tax optimization and saving you 10+ hours monthly." },
    { id: 'fin-9', category: 'Need', objection: "I don't have enough money to invest.", tips: ['Start small', 'Discuss goals'], sampleResponse: "You can start with as little as $50/month. Let me show you how that could become half a million by retirement." },
    { id: 'fin-10', category: 'Need', objection: "I'm too young to worry about this.", tips: ['Show compound growth', 'Start early advantage', 'Make it real'], sampleResponse: "Actually, starting young is your superpower! $200/month starting at 25 beats $400/month starting at 35. Want to see the math?" },
    // Timing (3)
    { id: 'fin-11', category: 'Timing', objection: "The market is too volatile right now.", tips: ['Discuss long-term strategy', 'Explain dollar-cost averaging'], sampleResponse: "I get the hesitation. But waiting for 'the right time' often costs more than volatility. Time in the market beats timing the market." },
    { id: 'fin-12', category: 'Timing', objection: "I'll start investing when I make more money.", tips: ['Start small now', 'Build habits', 'Show opportunity cost'], sampleResponse: "I hear that a lot! But starting small now builds the habit. And you'll never 'have more' - lifestyle grows with income. Let's start with what you can." },
    { id: 'fin-13', category: 'Timing', objection: "Let me wait until after tax season.", tips: ['Connect to tax planning', 'Start relationship', 'No bad time'], sampleResponse: "Actually, this IS tax planning season! Let's review your situation now and potentially reduce next year's taxes. When can we meet?" },
    // Authority (3)
    { id: 'fin-14', category: 'Authority', objection: "I need to talk to my spouse first.", tips: ['Include spouse', 'Joint planning', 'Schedule together'], sampleResponse: "Absolutely! Financial planning should involve both of you. Can we schedule a time when you're both available? This works best as a team." },
    { id: 'fin-15', category: 'Authority', objection: "My accountant handles everything.", tips: ['Collaborate', 'Show different roles', 'Team approach'], sampleResponse: "Great that you have an accountant! We actually work well together - they handle taxes, I handle investments and planning. Many of my clients have both." },
    { id: 'fin-16', category: 'Authority', objection: "I need to think about it.", tips: ['Understand concerns', 'Offer information', 'Follow up'], sampleResponse: "Of course! What specifically would you like to think through? I can send some information, and let's schedule a follow-up call for your questions." },
  ],
  medical: [
    // Price (4)
    { id: 'med-1', category: 'Price', objection: "Our budget is already allocated.", tips: ['Show ROI in patient outcomes', 'Discuss financing options'], sampleResponse: "I understand budget cycles. This device pays for itself in 6 months through improved efficiency and patient outcomes. Can we discuss a pilot program?" },
    { id: 'med-2', category: 'Price', objection: "This is too expensive for our practice.", tips: ['Show ROI', 'Discuss financing', 'Phase implementation'], sampleResponse: "I hear that a lot initially. But when you factor in time savings and patient volume increase, most practices see positive ROI within 4 months. Let me show you the numbers." },
    { id: 'med-3', category: 'Price', objection: "Insurance doesn't reimburse for this.", tips: ['Show patient pay models', 'Discuss coding', 'Revenue potential'], sampleResponse: "Actually, many patients pay out-of-pocket for better outcomes. And there may be billing codes you're not aware of. Let me connect you with our reimbursement specialist." },
    { id: 'med-4', category: 'Price', objection: "We need to see more ROI data.", tips: ['Provide case studies', 'Offer pilot', 'Connect with references'], sampleResponse: "Absolutely! Here are case studies from similar practices. Better yet, let me connect you with a practice like yours who can share their real numbers." },
    // Trust (3)
    { id: 'med-5', category: 'Trust', objection: "We've had bad experiences with new technology.", tips: ['Provide case studies', 'Offer references'], sampleResponse: "That's valid. I'd love to connect you with Dr. Smith at General Hospital - they had similar hesitations but are now our biggest advocates." },
    { id: 'med-6', category: 'Trust', objection: "Is this FDA approved?", tips: ['Show certifications', 'Explain approval process', 'Provide documentation'], sampleResponse: "Great question! We're fully FDA cleared. Here's our documentation and clinical trial data. Patient safety is our top priority too." },
    { id: 'med-7', category: 'Trust', objection: "What about liability concerns?", tips: ['Discuss insurance', 'Show safety record', 'Provide legal docs'], sampleResponse: "Important concern! Our device has an excellent safety record, and we provide full documentation for your malpractice carrier. Most clients see reduced liability." },
    // Authority (3)
    { id: 'med-8', category: 'Authority', objection: "The physicians don't want to change.", tips: ['Address physician concerns', 'Show time savings'], sampleResponse: "Change is hard in healthcare. Once physicians see the 30% time savings, they become champions. Can I present to your physician committee?" },
    { id: 'med-9', category: 'Authority', objection: "This needs hospital board approval.", tips: ['Provide board materials', 'Offer presentation', 'Timeline planning'], sampleResponse: "I can help with that! When is your next board meeting? I'll prepare a presentation and ROI analysis specifically for board members." },
    { id: 'med-10', category: 'Authority', objection: "Our procurement process is lengthy.", tips: ['Start early', 'Provide documentation', 'Guide process'], sampleResponse: "I understand healthcare procurement. Let me provide all the documentation upfront. We've navigated this many times and can help move things along." },
    // Competition (3)
    { id: 'med-11', category: 'Competition', objection: "We're already using a competitor's product.", tips: ['Ask about pain points', 'Highlight differentiators'], sampleResponse: "How's that working for you? Most of our customers switched from that exact product. Would a side-by-side comparison be helpful?" },
    { id: 'med-12', category: 'Competition', objection: "We're considering multiple vendors.", tips: ['Understand criteria', 'Offer trial', 'Differentiate'], sampleResponse: "Smart approach! What's most important in your evaluation? Outcomes? Support? Integration? Let me show you where we excel." },
    { id: 'med-13', category: 'Competition', objection: "Another company offered a better deal.", tips: ['Compare total value', 'Discuss support', 'Long-term costs'], sampleResponse: "What did that deal include? Sometimes the initial price doesn't reflect total cost of ownership - training, support, updates. Let's compare apples to apples." },
    // Timing (3)
    { id: 'med-14', category: 'Timing', objection: "We're in the middle of a system upgrade.", tips: ['Show integration ease', 'Offer flexible timeline'], sampleResponse: "Perfect timing, actually! Our system integrates seamlessly. Adding us now means you won't need another disruption later." },
    { id: 'med-15', category: 'Timing', objection: "We just signed a contract with another vendor.", tips: ['Understand timeline', 'Plant seeds', 'Stay in touch'], sampleResponse: "I understand. When does that contract end? Let's plan to reconnect before then. In the meantime, I'll keep you updated on our innovations." },
    { id: 'med-16', category: 'Timing', objection: "We're too busy with patient care.", tips: ['Minimal disruption', 'Show time savings', 'Flexible training'], sampleResponse: "That's exactly why you need this - it saves time! Implementation is minimal disruption, and most training happens during regular workflow. Your patients benefit faster." },
  ],
  solar: [
    // Price (4)
    { id: 'sol-1', category: 'Price', objection: "Solar is too expensive upfront.", tips: ['Explain financing options', 'Show monthly savings'], sampleResponse: "That's why 80% of our customers choose $0 down financing. Your monthly payment is typically less than your current electric bill, so you save from day one." },
    { id: 'sol-2', category: 'Price', objection: "I can't afford the monthly payment.", tips: ['Adjust system size', 'Show utility comparison', 'Different financing'], sampleResponse: "Let's right-size the system for your budget. Even a smaller system saves money. And remember - you're paying for electricity anyway. This way you own it." },
    { id: 'sol-3', category: 'Price', objection: "I heard solar isn't worth it financially.", tips: ['Show real ROI', 'Local incentives', 'Utility rates'], sampleResponse: "Let me show you the real math for your home. With current incentives and your utility rates, most homeowners see 15-20% annual returns. Better than the stock market!" },
    { id: 'sol-4', category: 'Price', objection: "What about the tax credit? I don't have tax liability.", tips: ['Explain credit rollover', 'Alternative financing', 'Lease options'], sampleResponse: "Good thinking! The credit rolls over to next year. Or we have lease options where we claim the credit and pass savings to you. Let me show you both scenarios." },
    // Timing (3)
    { id: 'sol-5', category: 'Timing', objection: "I want to wait for better technology.", tips: ['Show current efficiency', 'Explain opportunity cost'], sampleResponse: "Solar tech improves 2-3% yearly, but rates increase 4% annually. Waiting costs more than it saves. Plus, your system can be upgraded later." },
    { id: 'sol-6', category: 'Timing', objection: "I'm selling my house soon.", tips: ['Show home value increase', 'Discuss buyer appeal'], sampleResponse: "Perfect! Homes with solar sell faster and for 4% more on average. It's a selling point, not a problem." },
    { id: 'sol-7', category: 'Timing', objection: "Let me wait until summer to decide.", tips: ['Lock in pricing', 'Installation timeline', 'Incentive deadlines'], sampleResponse: "I understand wanting to wait for sun! But prices typically increase, and installation takes 2-3 months. Lock in today's rate and be generating power by summer." },
    // Trust (3)
    { id: 'sol-8', category: 'Trust', objection: "What if you go out of business?", tips: ['Explain warranty structure', 'Show company stability'], sampleResponse: "Your warranty is backed by the manufacturer, not us. Even if we disappeared tomorrow, your 25-year warranty remains valid." },
    { id: 'sol-9', category: 'Trust', objection: "I've heard horror stories about solar companies.", tips: ['Acknowledge concerns', 'Show reviews', 'Offer references'], sampleResponse: "There are bad actors in every industry. Here's our BBB rating, Google reviews, and I can connect you with neighbors who chose us. We've been doing this for 15 years." },
    { id: 'sol-10', category: 'Trust', objection: "How do I know the savings are real?", tips: ['Show utility data', 'Provide guarantee', 'Reference customers'], sampleResponse: "Great question! I'll show you exactly how we calculate it using your actual utility bills. Plus, we offer a production guarantee - if it doesn't perform, we pay the difference." },
    // Need (3)
    { id: 'sol-11', category: 'Need', objection: "My roof is too old for solar.", tips: ['Offer roof assessment', 'Discuss roof replacement'], sampleResponse: "Let's take a look! If it needs replacing, we have roofing partners who can do both at once - and you may be able to finance it all together." },
    { id: 'sol-12', category: 'Need', objection: "My electricity bill isn't that high.", tips: ['Show lifetime savings', 'Future rate increases', 'Environmental impact'], sampleResponse: "Even moderate bills add up over 25 years! Plus, rates increase about 4% yearly. Let me show you what you'll spend over time vs. owning your power." },
    { id: 'sol-13', category: 'Need', objection: "I don't plan to stay here long enough.", tips: ['Show break-even', 'Home value increase', 'Transferability'], sampleResponse: "Solar increases home value and helps it sell faster. Even if you move in 5 years, you'll likely break even or profit. Want to see the numbers?" },
    // Authority (3)
    { id: 'sol-14', category: 'Authority', objection: "My HOA won't allow it.", tips: ['Know solar rights laws', 'Offer to help with HOA'], sampleResponse: "Actually, in most states, HOAs can't prohibit solar - it's the law! We work with HOAs regularly. Can I reach out to them for you?" },
    { id: 'sol-15', category: 'Authority', objection: "My spouse isn't convinced.", tips: ['Address spouse concerns', 'Offer joint meeting', 'Provide materials'], sampleResponse: "What are their concerns? I'd love to answer them directly. Can we schedule a time when you're both available? This is a family decision." },
    { id: 'sol-16', category: 'Authority', objection: "I need to get more quotes.", tips: ['Encourage comparison', 'Highlight differentiators', 'Lock in price'], sampleResponse: "You absolutely should! When comparing, ask about warranty, equipment quality, and installation standards. I'll hold this quote for you. What questions can I answer now?" },
  ],
  telecom: [
    // Price (3)
    { id: 'tel-1', category: 'Price', objection: "Your prices aren't any better.", tips: ['Compare total cost', 'Show hidden fees others charge'], sampleResponse: "Let's compare apples to apples. Others charge activation, equipment, and hidden fees. Our price is all-in. You're saving significantly." },
    { id: 'tel-2', category: 'Price', objection: "I'm getting a better deal elsewhere.", tips: ['Ask for details', 'Compare features', 'Match value'], sampleResponse: "What does that deal include? Let me compare it line by line. Sometimes promotions have catches - I want to make sure you're getting the best real value." },
    { id: 'tel-3', category: 'Price', objection: "I don't need all these features.", tips: ['Offer simpler plan', 'Show feature value', 'Customize package'], sampleResponse: "No problem! We have lighter plans. But let me ask - which features don't you think you'd use? Sometimes people are surprised what they actually end up loving." },
    // Contract (3)
    { id: 'tel-4', category: 'Contract', objection: "I'm stuck in a contract.", tips: ['Calculate buyout costs', 'Show savings offset'], sampleResponse: "How much time is left? We often cover early termination fees because our savings are so significant. Let me calculate if it makes sense to switch now." },
    { id: 'tel-5', category: 'Contract', objection: "I don't want to sign a contract.", tips: ['Offer no-contract options', 'Explain benefits'], sampleResponse: "I get it! We have month-to-month options. The contract just locks in a lower rate and free equipment. But flexibility is available if you prefer." },
    { id: 'tel-6', category: 'Contract', objection: "What if I want to cancel?", tips: ['Explain cancellation', 'Show satisfaction rate', 'Trial period'], sampleResponse: "Fair concern! Here's exactly what cancellation looks like - it's simple. But honestly, our satisfaction rate is 95%. Try us for 30 days risk-free." },
    // Competition (3)
    { id: 'tel-7', category: 'Competition', objection: "I've been with my carrier forever.", tips: ['Ask about loyalty rewards', 'Show they may be overcharged'], sampleResponse: "Loyalty is great, but are they loyal to you? Often long-time customers pay more than new ones. Let me show you what you should be paying." },
    { id: 'tel-8', category: 'Competition', objection: "Everyone uses [Competitor].", tips: ['Challenge assumption', 'Show differences', 'Independent reviews'], sampleResponse: "Popularity isn't always best value! We've grown 200% because people are switching. Want to see why? Here's how we compare on the things that matter." },
    { id: 'tel-9', category: 'Competition', objection: "I've always had good service with them.", tips: ['Acknowledge satisfaction', 'Show what you offer', 'Risk-free trial'], sampleResponse: "That's great! But what if you could have the same service AND save money? Or get better speeds? Try us risk-free - if we're not better, no hard feelings." },
    // Trust (3)
    { id: 'tel-10', category: 'Trust', objection: "I've heard your coverage is bad.", tips: ['Show coverage maps', 'Offer trial period'], sampleResponse: "We've invested billions in network upgrades. Try us for 30 days - if coverage isn't what you need, we'll cancel no questions asked." },
    { id: 'tel-11', category: 'Trust', objection: "What if the service doesn't work at my house?", tips: ['Check coverage', 'Satisfaction guarantee', 'Site survey'], sampleResponse: "Let's check right now! [checks coverage] You're in a strong area. And we have a 30-day satisfaction guarantee. If it doesn't work for you, full refund." },
    { id: 'tel-12', category: 'Trust', objection: "I've heard bad things about your customer service.", tips: ['Show improvements', 'Provide contact', 'Share ratings'], sampleResponse: "We've made huge investments in service. Here's our current rating - much improved. And here's my direct line. Any issues, you call me personally." },
    // Timing (3)
    { id: 'tel-13', category: 'Timing', objection: "I'm waiting for the new phone release.", tips: ['Explain trade-in programs', 'Show current deals'], sampleResponse: "Smart! But our trade-in program means you can upgrade anytime. Plus, today's deal saves you more than any launch promotion. Let me show you." },
    { id: 'tel-14', category: 'Timing', objection: "I just got a new phone.", tips: ['Focus on service', 'Bring your phone', 'Show savings'], sampleResponse: "Perfect - bring it with you! This is about service and savings, not a new phone. You'll keep your phone and pay less monthly." },
    { id: 'tel-15', category: 'Timing', objection: "Let me think about it.", tips: ['Understand concerns', 'Limited time offer', 'Follow up'], sampleResponse: "Of course! What specifically do you want to think over? This promo ends soon, but I can see if I can extend it. What would help you decide?" },
  ],
  hvac: [
    // Price (4)
    { id: 'hvac-1', category: 'Price', objection: "That quote is too high.", tips: ['Break down costs', 'Show quality differences'], sampleResponse: "Let me show you what's included. We use top-tier equipment with 10-year warranties. Cheaper quotes often cut corners. Plus, we have 0% financing." },
    { id: 'hvac-2', category: 'Price', objection: "The other guy quoted less.", tips: ['Compare scope', 'Discuss quality', 'Warranty differences'], sampleResponse: "Can I see their quote? Often there are differences in equipment quality, warranty, or what's included. I want to make sure you're comparing the same thing." },
    { id: 'hvac-3', category: 'Price', objection: "I wasn't expecting to spend this much.", tips: ['Offer options', 'Discuss financing', 'Show ROI'], sampleResponse: "I understand. I have good-better-best options, and we offer financing. Let me show you what each option includes and the energy savings over time." },
    { id: 'hvac-4', category: 'Price', objection: "Can you give me a discount?", tips: ['Offer promotions', 'Add value', 'Bundle services'], sampleResponse: "Let me check current promotions... We have a rebate available, and if you sign up for our maintenance plan, I can include the first year free. How's that?" },
    // Timing (3)
    { id: 'hvac-5', category: 'Timing', objection: "My current unit still works.", tips: ['Discuss efficiency', 'Calculate energy costs'], sampleResponse: "It works for now, but how old is it? Units over 10 years can cost 40% more to run. And they often fail on the hottest days." },
    { id: 'hvac-6', category: 'Timing', objection: "Let me get through winter first.", tips: ['Show risk of waiting', 'Lock in pricing', 'Schedule ahead'], sampleResponse: "Winter is actually when older units fail! Let's schedule now while you can plan, rather than as an emergency. I can lock in today's pricing too." },
    { id: 'hvac-7', category: 'Timing', objection: "I need to wait for my tax refund.", tips: ['Offer financing', 'Payment timing', 'Hold quote'], sampleResponse: "No problem! We have 0% financing so you can start now and pay when your refund comes. Or I can hold this quote until then. When do you expect it?" },
    // Competition (3)
    { id: 'hvac-8', category: 'Competition', objection: "I'm getting other quotes.", tips: ['Encourage comparison', 'Highlight differentiators'], sampleResponse: "Absolutely, you should! When comparing, ask about warranty, who does the install, and what's included. What matters most to you?" },
    { id: 'hvac-9', category: 'Competition', objection: "My neighbor used a different company.", tips: ['Ask about experience', 'Show your value', 'Offer reference'], sampleResponse: "How was their experience? I'd love to connect you with our customers in your neighborhood too. What convinced you to get quotes?" },
    { id: 'hvac-10', category: 'Competition', objection: "I have a handyman who can do it cheaper.", tips: ['Discuss licensing', 'Warranty concerns', 'Code compliance'], sampleResponse: "Is he licensed and insured for HVAC? Improper installation can void warranties and cause safety issues. It's also a code requirement. Let me explain why that matters." },
    // Trust (3)
    { id: 'hvac-11', category: 'Trust', objection: "How do I know you won't upsell me?", tips: ['Explain assessment process', 'Show options at different prices'], sampleResponse: "I'll show you three options: good, better, best. I'll explain exactly what each includes and why. No pressure." },
    { id: 'hvac-12', category: 'Trust', objection: "I don't know anything about HVAC.", tips: ['Educate simply', 'Build trust through knowledge', 'Explain everything'], sampleResponse: "That's okay! I'll explain everything in plain English. Ask me any question - there are no dumb questions. I want you to feel confident in your decision." },
    { id: 'hvac-13', category: 'Trust', objection: "Are your technicians qualified?", tips: ['Show certifications', 'Discuss training', 'Background checks'], sampleResponse: "Great question! All our techs are NATE certified, drug tested, and background checked. They're employees, not subcontractors. Here are their credentials." },
    // Need (3)
    { id: 'hvac-14', category: 'Need', objection: "I just need a repair, not a replacement.", tips: ['Assess honestly', 'Show repair vs replace math'], sampleResponse: "Let me take a look! If a repair makes sense, that's what I'll recommend. But if you're going to spend $800 on an old unit, let me show you the math on replacement." },
    { id: 'hvac-15', category: 'Need', objection: "It just needs Freon.", tips: ['Explain refrigerant rules', 'Check for leaks', 'Long-term solution'], sampleResponse: "If it needs refrigerant, there's likely a leak. R-22 is being phased out and is very expensive now. Let me check - we might be putting money into a dead end." },
    { id: 'hvac-16', category: 'Need', objection: "The house isn't that uncomfortable.", tips: ['Discuss health impacts', 'Efficiency', 'Room-by-room comfort'], sampleResponse: "Are all rooms equally comfortable? Indoor air quality and humidity matter too. Even 'okay' can be way better. Let me show you what a proper system feels like." },
  ],
  fitness: [
    // Price (4)
    { id: 'fit-1', category: 'Price', objection: "The membership is too expensive.", tips: ['Break down daily cost', 'Show value vs other spending'], sampleResponse: "That's $2 a day, less than a coffee. And the ROI is your health, energy, and potentially thousands saved in medical costs. What's that worth to you?" },
    { id: 'fit-2', category: 'Price', objection: "I can't afford a gym right now.", tips: ['Discuss priorities', 'Show payment options', 'Start small'], sampleResponse: "I hear you. But consider what you spend on things that don't serve you. We have flexible payment options. What if we started with basic membership?" },
    { id: 'fit-3', category: 'Price', objection: "Planet Fitness is only $10.", tips: ['Compare value', 'Show differences', 'Discuss results'], sampleResponse: "You get what you pay for! They have limited equipment, no classes, no coaching. Our members actually get results because we invest in your success. Let me show you." },
    { id: 'fit-4', category: 'Price', objection: "I don't want to pay for classes I won't use.", tips: ['Show class variety', 'Basic membership option', 'Trial classes'], sampleResponse: "Fair point! We have a basic membership without classes. But try a few first - most people are surprised what they end up loving. First class is on me." },
    // Timing (4)
    { id: 'fit-5', category: 'Timing', objection: "I don't have time to work out.", tips: ['Show efficient options', 'Discuss scheduling'], sampleResponse: "What if 30 minutes, 3x a week makes a huge difference? We have express classes and 24/7 access. When is your least productive 30 minutes?" },
    { id: 'fit-6', category: 'Timing', objection: "I'll start in January.", tips: ['Create urgency', 'Discuss head start'], sampleResponse: "Why wait? Imagine showing up in January already fit while everyone else is just starting. Start now, get ahead." },
    { id: 'fit-7', category: 'Timing', objection: "Summer is coming, it's too late.", tips: ['Year-round fitness', 'Start somewhere', 'Progress beats perfection'], sampleResponse: "It's never too late! And fitness isn't just for summer. The best time to start was yesterday. The second best time is today. Where do you want to be in 3 months?" },
    { id: 'fit-8', category: 'Timing', objection: "I'm too busy with work right now.", tips: ['Show stress relief benefits', 'Energy increase', 'Productivity gains'], sampleResponse: "Busy people need fitness most! Exercise reduces stress and increases energy. Many members say their work improved after they started. 30 minutes can change your whole day." },
    // Need (3)
    { id: 'fit-9', category: 'Need', objection: "I can work out at home.", tips: ['Discuss accountability', 'Show variety of equipment'], sampleResponse: "You can! But do you? Home workouts are easy to skip. Here you have accountability, coaching, variety, and a community pushing you." },
    { id: 'fit-10', category: 'Need', objection: "I'm not that out of shape.", tips: ['Discuss goals', 'Preventive fitness', 'Performance improvement'], sampleResponse: "That's great! But fitness isn't just for people who are out of shape. It's about feeling amazing, having energy, and preventing problems. What are your goals?" },
    { id: 'fit-11', category: 'Need', objection: "I just want to lose weight, I can diet.", tips: ['Exercise + diet', 'Metabolism benefits', 'Sustainable results'], sampleResponse: "Diet alone often fails because you lose muscle, which slows metabolism. Exercise plus diet is the proven formula. Want sustainable results or yo-yo dieting?" },
    // Trust (3)
    { id: 'fit-12', category: 'Trust', objection: "I've failed at fitness before.", tips: ['Acknowledge their history', 'Explain what\'s different'], sampleResponse: "Most people have! That's not failure, that's learning. We'll create a sustainable plan - small wins that build into big results." },
    { id: 'fit-13', category: 'Trust', objection: "Gyms are intimidating.", tips: ['Tour the gym', 'Show supportive community', 'Offer buddy system'], sampleResponse: "I totally understand! But walk in here - notice how friendly everyone is? We're not a bodybuilder gym. Everyone started somewhere. Let me introduce you to some members." },
    { id: 'fit-14', category: 'Trust', objection: "I won't know what to do.", tips: ['Offer orientation', 'Personal training', 'Classes for beginners'], sampleResponse: "That's what we're here for! You get a free orientation, and our trainers are always on the floor to help. We also have beginner classes. You'll never feel lost." },
    // Contract (3)
    { id: 'fit-15', category: 'Contract', objection: "I don't want a long-term contract.", tips: ['Offer month-to-month', 'Explain annual savings'], sampleResponse: "We have month-to-month! Annual saves 20%, but I want you committed because it's working, not because you're locked in." },
    { id: 'fit-16', category: 'Contract', objection: "What if I need to cancel?", tips: ['Explain policy', 'Freeze options', 'Easy process'], sampleResponse: "Life happens! Our cancellation is simple - just 30 days notice. We also have freeze options if you travel or need a break. No hassle." },
    { id: 'fit-17', category: 'Contract', objection: "I've been burned by gym contracts before.", tips: ['Different approach', 'Show transparency', 'No hidden fees'], sampleResponse: "I'm sorry you had that experience. We do things differently - everything is spelled out clearly, no hidden fees, and I'll personally help if you ever need to make changes." },
  ],
  general: [
    // Price (4)
    { id: 'gen-1', category: 'Price', objection: "It's too expensive.", tips: ['Understand their budget', 'Show value, not just features'], sampleResponse: "I hear you. Help me understand - is it outside your budget, or you're not sure it's worth it? Let me show you what makes this worth every penny." },
    { id: 'gen-2', category: 'Price', objection: "Can you do better on price?", tips: ['Understand what better means', 'Add value vs discount'], sampleResponse: "I want to make this work for you. What would 'better' look like? A lower price, more value, or different terms?" },
    { id: 'gen-3', category: 'Price', objection: "I wasn't planning to spend this much.", tips: ['Acknowledge budget', 'Show ROI', 'Offer options'], sampleResponse: "I understand. Sometimes the right solution costs more upfront but saves more long-term. Let me show you the return on this investment." },
    { id: 'gen-4', category: 'Price', objection: "Your competitor is cheaper.", tips: ['Compare value', 'Highlight differences', 'Ask questions'], sampleResponse: "What did their offer include? Often lower prices mean less service, quality, or support. Let's compare what you're actually getting." },
    // Timing (4)
    { id: 'gen-5', category: 'Timing', objection: "Not right now.", tips: ['Find out why', 'Create urgency'], sampleResponse: "I understand. What would need to change for this to be the right time? And just so you know, this promotion ends soon." },
    { id: 'gen-6', category: 'Timing', objection: "I need to think about it.", tips: ['Ask what they need to think about', 'Address specific concerns'], sampleResponse: "Of course! What specifically are you thinking over? I want to make sure you have all the information you need." },
    { id: 'gen-7', category: 'Timing', objection: "Call me back next month.", tips: ['Understand the delay', 'Create value for now', 'Lock in offer'], sampleResponse: "I'd be happy to! What's happening next month that makes it better timing? I can hold today's pricing for you until then." },
    { id: 'gen-8', category: 'Timing', objection: "We're too busy right now.", tips: ['Show low effort required', 'Discuss future time savings', 'Flexible scheduling'], sampleResponse: "I understand being busy. What if I handled most of the work? This actually saves time once implemented. When's your least hectic time?" },
    // Authority (4)
    { id: 'gen-9', category: 'Authority', objection: "I need to talk to someone else.", tips: ['Understand the decision process', 'Offer to help'], sampleResponse: "Absolutely. Who else is involved in this decision? Would it help if I put together some information for them?" },
    { id: 'gen-10', category: 'Authority', objection: "I'm not the decision maker.", tips: ['Find the decision maker', 'Empower the contact', 'Provide materials'], sampleResponse: "No problem! Who should I be speaking with? Or would it help if I gave you materials to share? What would convince them?" },
    { id: 'gen-11', category: 'Authority', objection: "I need approval from above.", tips: ['Help build the case', 'Provide documentation', 'Offer to present'], sampleResponse: "Understood! What does your approval process look like? I can help build the business case and provide any documentation they need." },
    { id: 'gen-12', category: 'Authority', objection: "My partner handles these decisions.", tips: ['Include partner', 'Schedule joint meeting', 'Leave information'], sampleResponse: "Of course! Should we schedule a time when they can join? Or I can leave detailed information. What questions would they likely have?" },
    // Competition (3)
    { id: 'gen-13', category: 'Competition', objection: "We're looking at other options.", tips: ['Ask about their criteria', 'Highlight differentiators'], sampleResponse: "Smart to shop around! What criteria are you using to compare? I'd love to show you how we stack up on what matters most." },
    { id: 'gen-14', category: 'Competition', objection: "We're happy with our current provider.", tips: ['Respect the relationship', 'Find pain points', 'Offer comparison'], sampleResponse: "That's great! What do you like most about them? I'm curious if there are any areas where you wish they were better." },
    { id: 'gen-15', category: 'Competition', objection: "We just signed with someone else.", tips: ['Stay positive', 'Plant seeds', 'Future opportunity'], sampleResponse: "Congratulations on making a decision! How did you choose them? I'd love to stay in touch in case things change or you need a second option." },
    // Trust (3)
    { id: 'gen-16', category: 'Trust', objection: "I don't know your company.", tips: ['Share social proof', 'Offer references'], sampleResponse: "That's fair - let me tell you about us. We've served thousands of customers. Here's what they say... And here's my personal guarantee." },
    { id: 'gen-17', category: 'Trust', objection: "How do I know this will work?", tips: ['Share case studies', 'Offer guarantee', 'Provide proof'], sampleResponse: "Great question! Here are results from customers like you. And we offer a guarantee - if you're not satisfied, we make it right. What would prove it to you?" },
    { id: 'gen-18', category: 'Trust', objection: "I've been burned before.", tips: ['Empathize', 'Differentiate', 'Reduce risk'], sampleResponse: "I'm sorry to hear that. What happened? I want to make sure we do things differently. Let me explain how we protect you from that situation." },
    // Need (3)
    { id: 'gen-19', category: 'Need', objection: "I don't need this.", tips: ['Ask about their situation', 'Uncover hidden needs'], sampleResponse: "Tell me more about your current situation. What brought you here today? Sometimes we don't know we need something until we see how it fits." },
    { id: 'gen-20', category: 'Need', objection: "We've always done it this way.", tips: ['Respect tradition', 'Show evolution', 'Gradual change'], sampleResponse: "And it's worked for you! But things change. What if there's a way to do it better without abandoning what works? Can I show you?" },
    { id: 'gen-21', category: 'Need', objection: "I don't see the value.", tips: ['Ask what they value', 'Connect to their goals', 'Show benefits'], sampleResponse: "Help me understand what's important to you. What would make this valuable? Let me show you how this connects to your goals." },
  ],
};

// Premium-only advanced objections for each industry
const PREMIUM_OBJECTIONS: Record<Industry, Objection[]> = {
  automotive: [
    { id: 'auto-p1', category: 'Price', objection: "I can get this same car $2000 cheaper at another dealer.", tips: ['Verify the claim', 'Show total value', 'Match with conditions'], sampleResponse: "Let me look into that. Often those quotes don't include the same equipment or fees. Can you show me what they quoted? I'll match it if it's apples to apples, plus I'll add extra value.", premium: true },
    { id: 'auto-p2', category: 'Authority', objection: "My financial advisor said this isn't a good time to buy.", tips: ['Respect the advisor', 'Provide data', 'Offer to include them'], sampleResponse: "I respect their opinion. But car values and interest rates are specific - would it help if I prepared some numbers you could share with them? Sometimes advisors aren't up to date on auto market specifics.", premium: true },
    { id: 'auto-p3', category: 'Trust', objection: "I've read terrible reviews about your service department.", tips: ['Acknowledge concerns', 'Show improvements', 'Personal guarantee'], sampleResponse: "I appreciate you bringing this up. We've made major changes in service leadership. Here's our current CSI scores. And I'll personally ensure your service experience is excellent - here's my cell.", premium: true },
    { id: 'auto-p4', category: 'Competition', objection: "Tesla doesn't negotiate, why should I negotiate with you?", tips: ['Different model', 'Show advantages', 'Flexibility is benefit'], sampleResponse: "That's their model. Ours gives you the power to negotiate the best deal. You just got $3000 off - that's money Tesla customers don't get. Plus we're here for service, not sending you to a center 50 miles away.", premium: true },
    { id: 'auto-p5', category: 'Timing', objection: "I'm waiting for the recession to hit so prices drop.", tips: ['Market education', 'Current opportunities', 'Risk of waiting'], sampleResponse: "Interesting strategy, but historically car prices rise during recessions due to supply issues. Right now we have inventory and incentives. In a recession, both disappear. Let me show you today's real savings.", premium: true },
  ],
  saas: [
    { id: 'saas-p1', category: 'Price', objection: "Your competitor offered 50% off to switch.", tips: ['Understand the offer', 'Show switching costs', 'Long-term value'], sampleResponse: "Aggressive offer! But let's calculate the real cost: migration time, retraining, lost productivity. Often that 50% off disappears when you factor in switching costs. Plus their renewal rates are typically higher.", premium: true },
    { id: 'saas-p2', category: 'Authority', objection: "Our CTO is against adding new vendors.", tips: ['Understand the concern', 'Show consolidation', 'Risk mitigation'], sampleResponse: "Vendor fatigue is real. But we actually replace multiple point solutions - you'd reduce vendors, not add one. Can we include your CTO in a technical deep-dive?", premium: true },
    { id: 'saas-p3', category: 'Trust', objection: "We got burned by a startup that went under. You're backed by VC too.", tips: ['Show stability', 'Customer references', 'Data portability'], sampleResponse: "Valid concern. We're Series C with 3 years runway, 500+ enterprise customers, and SOC2 compliant. But more importantly, we offer full data portability - you're never locked in.", premium: true },
    { id: 'saas-p4', category: 'Competition', objection: "Salesforce/Microsoft already does this.", tips: ['Specialization advantage', 'Integration benefits', 'Focus vs suite'], sampleResponse: "They do many things adequately. We do one thing exceptionally. Our customers see 3x better results because we're 100% focused on this problem. And we integrate seamlessly with both platforms.", premium: true },
    { id: 'saas-p5', category: 'Need', objection: "We built something in-house that works.", tips: ['Technical debt', 'Opportunity cost', 'Hidden costs'], sampleResponse: "Impressive! But what's the cost to maintain it? Most in-house solutions cost 3-5x more when you factor engineering time. What could your team build if they weren't maintaining this?", premium: true },
  ],
  insurance: [
    { id: 'ins-p1', category: 'Price', objection: "Online quotes are half your price.", tips: ['Coverage comparison', 'Service differences', 'Claims experience'], sampleResponse: "Let's compare apples to apples. Online quotes often have lower limits, higher deductibles, or excluded coverages. When you file a claim, do you want to talk to a bot or someone who knows you?", premium: true },
    { id: 'ins-p2', category: 'Trust', objection: "Insurance companies always find ways not to pay.", tips: ['Claims statistics', 'Personal advocacy', 'Policy transparency'], sampleResponse: "I hear this a lot. Our claims satisfaction is 97%. Here's why: I personally review your policy to ensure no gaps. When you file, I advocate for you. That's different from direct writers.", premium: true },
    { id: 'ins-p3', category: 'Need', objection: "I've never filed a claim in 20 years, why do I need more coverage?", tips: ['Risk changes', 'Asset protection', 'Liability exposure'], sampleResponse: "That's great luck! But your assets have grown in 20 years. If something happens now, are you protecting what you've built? Let's make sure a single incident can't undo decades of work.", premium: true },
    { id: 'ins-p4', category: 'Competition', objection: "My brother-in-law is an agent, I have to use him.", tips: ['Professional relationship', 'Comparison offer', 'No obligation review'], sampleResponse: "Family is important. But would you let him do your taxes without checking his work? Let me give you a comparison - if I can save you money with better coverage, at least you'll know your options.", premium: true },
  ],
  realestate: [
    { id: 're-p1', category: 'Price', objection: "Zillow says this house is worth $50K less.", tips: ['Algorithm limitations', 'Local expertise', 'Recent comps'], sampleResponse: "Zillow's algorithm can't walk through homes or know about upgrades. Their own data shows they're off by 7% on average. Let me show you actual recent sales in this neighborhood - real transactions, not estimates.", premium: true },
    { id: 're-p2', category: 'Authority', objection: "We want to sell FSBO to save the commission.", tips: ['Time investment', 'Net proceeds', 'Liability protection'], sampleResponse: "I respect that. But FSBO homes sell for 6% less on average AND take longer. My commission pays for itself. Plus I handle legal liability, negotiations, and marketing. What's your time worth?", premium: true },
    { id: 're-p3', category: 'Trust', objection: "Agents just want a quick sale, not the best price.", tips: ['Incentive alignment', 'Marketing investment', 'Track record'], sampleResponse: "Fair concern. Here's my average days on market and sale-to-list ratio. I invest my own money in marketing because a higher sale price benefits us both. My reputation depends on getting you top dollar.", premium: true },
    { id: 're-p4', category: 'Timing', objection: "We're going to wait for interest rates to drop.", tips: ['Competition increase', 'Price appreciation', 'Payment math'], sampleResponse: "If rates drop 1%, competition increases dramatically. Home prices typically rise more than the rate savings. Let's run the numbers - buying now at this price vs later at a higher price with lower rate.", premium: true },
  ],
  retail: [
    { id: 'ret-p1', category: 'Price', objection: "I'll just wait for it to go on sale.", tips: ['Inventory scarcity', 'Current value', 'Price protection'], sampleResponse: "I understand. But this style is selling fast - we're down to our last few. If it sells out, it won't be back. I can offer a price match guarantee if it goes on sale within 30 days.", premium: true },
    { id: 'ret-p2', category: 'Browsing', objection: "I'm just taking photos to remember what I liked.", tips: ['Offer help', 'Create list', 'Add value'], sampleResponse: "Great idea! Let me help - I can create a wish list with all the details and pricing. That way you have everything organized. I can also note which items are low stock.", premium: true },
    { id: 'ret-p3', category: 'Trust', objection: "How do I know this will last? Everything seems cheaply made now.", tips: ['Quality demonstration', 'Warranty details', 'Brand reputation'], sampleResponse: "Great question! Feel this construction - [demonstrate quality]. This brand has been making these for 50 years. Plus our warranty covers any defects for 2 years.", premium: true },
  ],
  financial: [
    { id: 'fin-p1', category: 'Price', objection: "Robinhood and Fidelity are free, why would I pay you?", tips: ['Value of advice', 'True cost', 'Comprehensive planning'], sampleResponse: "Free trading isn't free advice. Those platforms profit from your trades and data. I get paid to help you reach goals, not to generate transactions. Studies show advised investors earn 3% more annually.", premium: true },
    { id: 'fin-p2', category: 'Trust', objection: "How do I know you won't just put me in products that pay you more?", tips: ['Fiduciary standard', 'Fee transparency', 'Conflict disclosure'], sampleResponse: "I'm legally required to act in your best interest as a fiduciary. Here's my fee disclosure - no hidden compensation. I'll show you exactly how I'm paid on every recommendation.", premium: true },
    { id: 'fin-p3', category: 'Authority', objection: "I need to run this by my accountant first.", tips: ['Collaborate', 'Provide documentation', 'Three-way call'], sampleResponse: "Absolutely - that's smart. I actually like working with accountants. Can we do a three-way call? I'll prepare a summary they can review. Collaboration leads to better outcomes.", premium: true },
    { id: 'fin-p4', category: 'Timing', objection: "The market is too volatile to invest now.", tips: ['Time in market', 'Dollar cost averaging', 'Historical perspective'], sampleResponse: "Volatility feels scary, but it creates opportunity. Missing the best 10 days over 20 years cuts returns in half. Let's use dollar-cost averaging to reduce risk while capturing growth.", premium: true },
  ],
  medical: [
    { id: 'med-p1', category: 'Price', objection: "Your device costs 3x more than the alternative.", tips: ['Total cost of ownership', 'Outcomes data', 'Training included'], sampleResponse: "Upfront cost, yes. But factor in fewer complications, shorter procedures, and training included. Our total cost of ownership is actually lower. Can I show you the 5-year analysis?", premium: true },
    { id: 'med-p2', category: 'Trust', objection: "We've had bad experiences with new technology failing.", tips: ['Implementation support', 'Success stories', 'Guarantee'], sampleResponse: "I understand that concern. We provide dedicated implementation support for 90 days. Here are three similar facilities who had concerns - all are now advocates. We guarantee performance metrics.", premium: true },
    { id: 'med-p3', category: 'Authority', objection: "The physicians won't adopt new technology.", tips: ['Physician champions', 'Training program', 'Peer evidence'], sampleResponse: "Physician adoption is crucial. We identify champions early and provide hands-on training. I can connect you with peer physicians who were skeptical but became advocates. Would that help?", premium: true },
  ],
  solar: [
    { id: 'sol-p1', category: 'Price', objection: "I heard solar companies are going bankrupt left and right.", tips: ['Company stability', 'Warranty backing', 'Panel manufacturer'], sampleResponse: "Valid concern - some installers have struggled. We've been in business 15 years with solid financials. More importantly, your warranty is backed by the panel manufacturer, not just us.", premium: true },
    { id: 'sol-p2', category: 'Trust', objection: "The savings projections seem too good to be true.", tips: ['Show calculations', 'Conservative estimates', 'Guarantee'], sampleResponse: "Healthy skepticism! Let me show you exactly how we calculated this using your actual utility bills. We actually use conservative estimates. And we guarantee minimum production - in writing.", premium: true },
    { id: 'sol-p3', category: 'Timing', objection: "Solar technology keeps improving, I'll wait for better panels.", tips: ['Current efficiency', 'Diminishing returns', 'Lost savings'], sampleResponse: "Panels improve about 0.5% per year now - we're hitting physical limits. Every year you wait, you lose thousands in savings. Today's panels will produce for 25+ years. The best time was yesterday.", premium: true },
  ],
  telecom: [
    { id: 'tel-p1', category: 'Price', objection: "I'm getting a corporate discount with my current carrier.", tips: ['Match or beat', 'Total comparison', 'Hidden benefits'], sampleResponse: "Corporate discounts are great. Let me see if we can match it - we have business programs too. Sometimes our standard pricing beats their discounted rate. Can I see your current bill?", premium: true },
    { id: 'tel-p2', category: 'Trust', objection: "I've heard horror stories about switching and losing my number.", tips: ['Number portability law', 'Process explanation', 'Guarantee'], sampleResponse: "Number portability is federal law - your number comes with you. We handle the entire process. If anything goes wrong with the port, we'll fix it same day or give you a month free.", premium: true },
    { id: 'tel-p3', category: 'Competition', objection: "5G coverage maps all look the same now.", tips: ['Real-world testing', 'Local coverage', 'Try before commit'], sampleResponse: "Maps are marketing. Real coverage varies by location. Let's test it right here with a demo phone. I can also show you actual speed tests from your neighborhood. Try us risk-free for 30 days.", premium: true },
  ],
  hvac: [
    { id: 'hvac-p1', category: 'Price', objection: "My neighbor got the same system for $3000 less.", tips: ['Installation quality', 'Permit and code', 'Warranty differences'], sampleResponse: "Let me ask - did they pull permits, do a load calculation, and include a 10-year labor warranty? Cheap installs often cut corners that cost more later. What exactly did their quote include?", premium: true },
    { id: 'hvac-p2', category: 'Trust', objection: "How do I know you're not just trying to sell me a new system?", tips: ['Repair option', 'Decision framework', 'Transparent pricing'], sampleResponse: "Fair question. Here's my rule: if repair costs exceed 50% of replacement, or your system is over 15 years with major failure, replacement makes sense. Otherwise, I'll fix it. Let me show you both options.", premium: true },
    { id: 'hvac-p3', category: 'Timing', objection: "It's not that hot/cold yet, I'll wait until I really need it.", tips: ['Seasonal pricing', 'Emergency costs', 'Comfort value'], sampleResponse: "Right now you have options and normal pricing. When it fails in a heat wave, you'll pay emergency rates and take whatever's available. Comfortable people make better decisions than desperate ones.", premium: true },
  ],
  fitness: [
    { id: 'fit-p1', category: 'Price', objection: "Planet Fitness is $10/month, why would I pay $50?", tips: ['Value difference', 'Results focus', 'Accountability'], sampleResponse: "If $10 gyms got results, everyone would be fit! We're not selling access - we're selling transformation. Personal training, accountability, community. How long have you had that $10 membership without results?", premium: true },
    { id: 'fit-p2', category: 'Trust', objection: "I've joined gyms before and never went.", tips: ['Different approach', 'Accountability system', 'Success stories'], sampleResponse: "That's exactly why we're different. We don't just give you a key card. You get a coach who notices when you don't show up, a program that progresses, and a community that expects you. This isn't your old gym.", premium: true },
    { id: 'fit-p3', category: 'Contract', objection: "I don't want to be locked into a long contract.", tips: ['Commitment importance', 'Flexible options', 'Results timeline'], sampleResponse: "I get it. But here's the truth - real change takes 3-6 months. Monthly plans let people quit when it gets hard. The contract isn't locking you in, it's holding you accountable to your goals.", premium: true },
  ],
  general: [
    { id: 'gen-p1', category: 'Price', objection: "I can find something similar for free.", tips: ['Free vs valuable', 'Hidden costs', 'Support difference'], sampleResponse: "Free options exist for almost everything. But what's the cost of your time figuring it out? Of errors without support? Of missing features you need? Let's calculate the true cost comparison.", premium: true },
    { id: 'gen-p2', category: 'Authority', objection: "I need to form a committee to review this.", tips: ['Facilitate process', 'Provide materials', 'Expedite decision'], sampleResponse: "Committees are thorough. How can I help the process? I can provide comparison materials, attend a meeting, or do individual briefings. What would make the committee most comfortable?", premium: true },
    { id: 'gen-p3', category: 'Trust', objection: "Your company is too small/new for us to risk.", tips: ['Agility advantage', 'Customer focus', 'Growth trajectory'], sampleResponse: "Size concerns are valid. But our size means you get executive attention, faster response, and a company that's hungry to earn your business. Big companies have you talk to call centers. We have you talk to leaders.", premium: true },
    { id: 'gen-p4', category: 'Competition', objection: "We've always used [Big Competitor] and they're fine.", tips: ['Fine vs great', 'Complacency cost', 'Innovation gap'], sampleResponse: "'Fine' is the enemy of great. When was the last time they innovated for you? Brought you new ideas? We're constantly improving. Don't you deserve better than 'fine'?", premium: true },
    { id: 'gen-p5', category: 'Need', objection: "We're managing okay with our current process.", tips: ['Opportunity cost', 'Hidden inefficiencies', 'Competitive pressure'], sampleResponse: "'Okay' might be costing more than you think. What if you could do the same work in half the time? Your competitors are probably looking for that edge. Can I show you what 'great' looks like?", premium: true },
  ],
};

export function getObjectionsForIndustry(industry: Industry, includePremium: boolean = false): Objection[] {
  const baseObjections = OBJECTIONS[industry] || OBJECTIONS.general;
  if (includePremium) {
    const premiumObjections = PREMIUM_OBJECTIONS[industry] || PREMIUM_OBJECTIONS.general;
    return [...baseObjections, ...premiumObjections];
  }
  return baseObjections;
}

export function getRandomObjection(industry: Industry, includePremium: boolean = false): Objection {
  const objections = getObjectionsForIndustry(industry, includePremium);
  
  // Filter out recently shown objections
  const availableObjections = objections.filter(o => !recentObjectionIds.includes(o.id));
  
  // If we've shown everything, reset history but keep last few
  const pool = availableObjections.length > 0 ? availableObjections : objections;
  
  // Pick random from pool
  const selected = pool[Math.floor(Math.random() * pool.length)];
  
  // Track this objection
  recentObjectionIds.push(selected.id);
  if (recentObjectionIds.length > MAX_RECENT_HISTORY) {
    recentObjectionIds.shift();
  }
  
  return selected;
}

export function getObjectionsByCategory(industry: Industry, category: string, includePremium: boolean = false): Objection[] {
  const objections = getObjectionsForIndustry(industry, includePremium);
  return objections.filter(o => o.category === category);
}

export function clearRecentObjections() {
  recentObjectionIds = [];
}

export function getCategoriesForIndustry(industry: Industry): string[] {
  const objections = getObjectionsForIndustry(industry, true); // Include premium for category list
  return [...new Set(objections.map(o => o.category))];
}

export function getPremiumObjectionCount(industry: Industry): number {
  return (PREMIUM_OBJECTIONS[industry] || PREMIUM_OBJECTIONS.general).length;
}
