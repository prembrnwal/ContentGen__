// ─── THEME COLORS ────────────────────────────────────────────────────────────
export const C = {
  green: "#1a8a5c",
  greenDark: "#136944",
  greenLight: "#e6f5ef",
  greenMid: "#2aaa74",
  greenAccent: "#0d7a4f",
  teal: "#17a37e",
  white: "#FFFFFF",
  bg: "#f4f6f8",
  sidebar: "#ffffff",
  cardBg: "#ffffff",
  gray50: "#f8fafb",
  gray100: "#eef1f4",
  gray200: "#dde2e8",
  gray400: "#8e9aaa",
  gray600: "#566070",
  gray800: "#1e2936",
  black: "#111923",
  red: "#c0392b",
  redLight: "#fdecea",
  amber: "#e07b00",
  amberLight: "#fff8ec",
};

// ─── CONTENT CONSTANTS ───────────────────────────────────────────────────────
export const TEMPLATE_ICONS = {
  Blog: "blog",
  Email: "email",
  LinkedIn: "linkedin",
  Ad: "ad",
  Social: "social",
  Product: "product",
};

export const TEMPLATES = [
  { id: "Blog", label: "Blog Post", hint: "Long-form editorial with SEO structure" },
  { id: "Email", label: "Email", hint: "Campaign & outreach copy" },
  { id: "LinkedIn", label: "LinkedIn", hint: "Professional thought-leadership" },
  { id: "Ad", label: "Ad Copy", hint: "Conversion-focused short copy" },
  { id: "Social", label: "Social Media", hint: "Platform-native captions & threads" },
  { id: "Product", label: "Product Desc.", hint: "Feature-benefit driven copy" },
];

export const TONES = ["Professional", "Friendly", "Funny", "Formal", "Persuasive", "Empathetic"];

export const TONE_HINTS = {
  Professional: "Clear, authoritative, business-ready.",
  Friendly: "Warm, approachable, conversational.",
  Funny: "Witty, light-hearted, engaging.",
  Formal: "Structured, precise, academic.",
  Persuasive: "Compelling, action-oriented, convincing.",
  Empathetic: "Caring, understanding, emotionally resonant.",
};

export const PLATFORMS = [
  { id: "General", label: "General", icon: "blog" },
  { id: "Instagram", label: "Instagram", icon: "social" },
  { id: "LinkedIn", label: "LinkedIn", icon: "linkedin" },
  { id: "Twitter/X", label: "Twitter / X", icon: "social" },
  { id: "Facebook", label: "Facebook", icon: "social" },
  { id: "YouTube", label: "YouTube", icon: "ad" },
  { id: "Email", label: "Email", icon: "email" },
  { id: "Website", label: "Website", icon: "product" },
];

export const AUDIENCES = [
  "General Public",
  "Business Professionals",
  "Entrepreneurs & Startups",
  "Students & Academics",
  "Tech Enthusiasts",
  "Healthcare Workers",
  "Parents & Families",
  "Marketers & Creatives",
  "E-commerce Shoppers",
  "Fitness Enthusiasts",
];

export const NUMBER_OF_IDEAS_OPTIONS = [1, 2, 3, 4, 5];

export const TYPE_COLOR = {
  Blog: "#1a8a5c",
  Email: "#7c3aed",
  LinkedIn: "#0077b5",
  Ad: "#e07b00",
  Social: "#e4405f",
  Product: "#f97316",
};

export const TYPE_BG = {
  Blog: "#e6f5ef",
  Email: "#ede9fe",
  LinkedIn: "#e8f4fd",
  Ad: "#fff8ec",
  Social: "#fce7f3",
  Product: "#fff7ed",
};

export const FEATURES = [
  { icon: "blog", title: "Blog Posts", desc: "SEO-optimised long-form articles with structured headings, key points, and natural keyword placement." },
  { icon: "email", title: "Email Campaigns", desc: "Engaging subject lines and persuasive body copy crafted to maximise open rates and conversions." },
  { icon: "linkedin", title: "LinkedIn Content", desc: "Professional posts and thought-leadership pieces tailored for B2B audiences." },
  { icon: "ad", title: "Ad Copy", desc: "Punchy, conversion-focused ad copy for Google, Meta, and more — with multiple hook variations." },
  { icon: "social", title: "Social Media", desc: "Platform-native captions, threads, and carousel scripts that drive engagement." },
  { icon: "product", title: "Product Descriptions", desc: "Feature-benefit-driven descriptions that sell while staying true to your brand voice." },
];

export const STATS = [
  { val: "2M+", label: "Content pieces generated" },
  { val: "50K+", label: "Active professionals" },
  { val: "98%", label: "Satisfaction rate" },
  { val: "10×", label: "Faster than manual" },
];
