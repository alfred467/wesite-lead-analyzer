"use client";

interface DigitalMarkers {
  ssl: boolean;
  socials: boolean;
  phone: boolean;
  email: boolean;
  mobile: boolean;
  speed: "fast" | "medium" | "slow" | "fail";
}

interface MessageInputs {
  businessName: string;
  industry: string;
  location: string;
  status: "none" | "broken" | "working";
  qualityScore?: number;
  markers?: DigitalMarkers;
}

const openings = [
  "Hi {name},",
  "Hello {name},",
  "Hi there,",
  "Greetings from Xovix Labs,",
  "Hello,"
];

// Specific pain points based on markers
const painPoints = {
  noSsl:    "I noticed your website for {name} is currently flagged as 'Not Secure' due to a missing SSL certificate. This often turns away security-conscious customers.",
  noMobile: "I tried accessing your site from my phone and noticed it isn't mobile-responsive. With most Kenyans browsing on mobile, this could be a major barrier for your business.",
  slow:     "I ran a quick performance check on your site and it's loading quite slowly. High bounce rates are common when the initial load takes more than a few seconds.",
  noSocial: "I was looking for your brand on social media but couldn't find any links on your site. Building that social trust is vital for {industry} businesses in {location}.",
  broken:   "I tried visiting your website but it seems to be down or having critical technical issues at the moment.",
  none:     "I was looking for your business online and realized you don't have a website yet. In today's market, {industry} services in {location} are almost always searched for online first.",
};

const valueProps = [
  "We specialize in fixing these technical gaps to help businesses like {name} win more trust and customers.",
  "At Xovix Labs, we help local {industry} teams secure and optimize their digital presence for better sales.",
  "I'd love to share a few simple ideas on how we can improve these markers for you.",
  "We've helped similar businesses in {location} fix these exact issues with great results."
];

const closures = [
  "Would you be open to a 2-minute chat about a possible fix?",
  "Can I send over a quick proposal on how we'd approach this?",
  "Are you available for a brief talk tomorrow to discuss this further?",
  "Let me know if you're interested in seeing how we can help you grow your online reach."
];

export const generateOutreach = (inputs: MessageInputs): string[] => {
  const variations: string[] = [];
  const m = inputs.markers;

  // Determine the primary "Problem" text
  let problem = painPoints.none;
  if (inputs.status === "broken") problem = painPoints.broken;
  else if (inputs.status === "working" && m) {
    if (!m.ssl) problem = painPoints.noSsl;
    else if (!m.mobile) problem = painPoints.noMobile;
    else if (m.speed === "slow" || m.speed === "medium") problem = painPoints.slow;
    else if (!m.socials) problem = painPoints.noSocial;
    else problem = "I checked out your website and while it's live, I have a few ideas on how to make it even more effective for your customers.";
  }

  // Generate 3 variations
  for (let i = 0; i < 3; i++) {
    const opening = openings[Math.floor(Math.random() * openings.length)]
      .replace("{name}", inputs.businessName);
    
    const pText = problem
      .replace("{name}", inputs.businessName)
      .replace("{location}", inputs.location)
      .replace("{industry}", inputs.industry);
    
    const vText = valueProps[Math.floor(Math.random() * valueProps.length)]
      .replace("{name}", inputs.businessName)
      .replace("{location}", inputs.location)
      .replace("{industry}", inputs.industry);

    const closure = closures[Math.floor(Math.random() * closures.length)]
      .replace("{industry}", inputs.industry);

    variations.push(`${opening} ${pText} ${vText} ${closure}`);
  }

  return variations;
};

export const detectIntent = (text: string) => {
  const t = text.toLowerCase();
  if (t.includes("price") || t.includes("cost") || t.includes("how much") || t.includes("pesa")) return "price";
  if (t.includes("interested") || t.includes("yes") || t.includes("tell me more") || t.includes("sawa") || t.includes("affirmative")) return "interested";
  if (t.includes("no") || t.includes("not now") || t.includes("stop") || t.includes("hapana") || t.includes("later")) return "not_interested";
  if (t.includes("already") || t.includes("have one") || t.includes("my son") || t.includes("developer")) return "already_has";
  return "general";
};

export const suggestReply = (intent: string): string[] => {
  const replies = {
    price: [
      "Our solutions are very affordable and typically pay for themselves in new customers. Are you looking for a quick fix or a full redesign?",
      "I can give you a clear quote once I understand which features you need most. Would you like a breakdown of our standard pricing?",
      "We offer flexible payment plans for businesses in your area. Can we chat for 5 minutes to see what fits your budget?"
    ],
    interested: [
      "Excellent. I can prepare a brief audit showing exactly what needs to be done. Is tomorrow at 10 AM a good time for a quick 5-minute call?",
      "Glad to hear it. Fixing these digital markers is usually the fastest way to increase trust. Shall I send over some of our recent work?",
      "Perfect. I'd love to help {name} stand out. What's the best way to move forward?"
    ],
    not_interested: [
      "I appreciate the honesty! If you ever find your digital needs changing, feel free to keep my contact. All the best.",
      "No problem at all. Wishing you continued success with your business.",
      "Sawa, I understand. Have a great day!"
    ],
    already_has: [
      "That's great! However, many existing sites fail the mobile-readiness or SSL checks which hurts SEO. Would you be open to a free technical audit?",
      "Understood. If you're ever looking for a technical partner to keep things updated or fix performance lags, keep us in mind.",
      "Glad you have one! If it's not bringing in enough leads, we'd love to help you optimize it for better conversion."
    ],
    general: [
      "Thanks for getting back to me. Would you like to see a quick 2-minute video of how we've helped others in your industry?",
      "Understood. Is there anything specific about your online presence that's been on your mind lately?",
      "I appreciate the response. I'm here if you have any questions about the markers we detected."
    ]
  };

  return replies[intent as keyof typeof replies] || replies.general;
};

export const generateFollowUp = (businessName: string): string[] => {
  return [
    `Hi ${businessName}, just following up on the digital audit I sent over. I'm still seeing some critical markers that could be improved. Any thoughts?`,
    `Hello! I wanted to check if you had a moment to see my last message regarding ${businessName}'s online security and mobile readiness.`,
    `Hi there, hope you're having a productive week. Just dropping a quick note to see if you're ready to discuss those website improvements.`
  ];
};
