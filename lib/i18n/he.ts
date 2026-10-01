/**
 * Hebrew string deck for the dashboard analysis area (RTL).
 *
 * Israeli financial-media register (Globes / Calcalist / TheMarker). Standard
 * loan acronyms (P/E, ROE, FCF, EBITDA) are kept with a Hebrew gloss. Numbers,
 * percentages and tickers stay Western/LTR (see globals.css `.ltr-num`).
 */

import type { Band } from "@/lib/finance/fundamental-score";

/** Grade band → Hebrew word + short descriptive phrase. */
export const BAND_HE: Record<Band, { word: string; phrase: string }> = {
  excellent: { word: "מצוין", phrase: "נתונים יוצאי דופן לטובה" },
  good: { word: "טוב", phrase: "תמונה חיובית ובריאה" },
  fair: { word: "סביר", phrase: "בינוני, ללא בלטות" },
  weak: { word: "חלש", phrase: "סימני חולשה מהותיים" },
  poor: { word: "חלש מאוד", phrase: "מצב בעייתי הדורש זהירות" },
};

/** Color CSS var for a grade band. */
export function bandColor(band: Band): string {
  if (band === "excellent" || band === "good") return "var(--up)";
  if (band === "fair") return "var(--warn)";
  return "var(--down)";
}

export type Lean = "Bullish" | "Bearish" | "Neutral";

/** News sentiment lean → Hebrew label + color. */
export const LEAN_HE: Record<Lean, { label: string; color: string }> = {
  Bullish: { label: "חיובי", color: "var(--up)" },
  Bearish: { label: "שלילי", color: "var(--down)" },
  Neutral: { label: "מעורב", color: "var(--warn)" },
};

/** Analyst recommendationKey → Hebrew. */
export function recommendationHe(key?: string | null): string | null {
  if (!key) return null;
  const k = key.toLowerCase().replace(/\s+/g, "_");
  const map: Record<string, string> = {
    strong_buy: "קנייה חזקה",
    strongbuy: "קנייה חזקה",
    buy: "קנייה",
    hold: "החזק (ניטרלי)",
    underperform: "תת-ביצוע",
    sell: "מכירה",
    strong_sell: "מכירה חזקה",
    strongsell: "מכירה חזקה",
  };
  return map[k] ?? key;
}

/** The five pillar / section titles. */
export const PILLAR_TITLE = {
  profitability: "רווחיות",
  valuation: "הערכת שווי",
  cashFlow: "תזרים מזומנים",
  strengthForward: "איתנות פיננסית ונתונים עתידיים",
  news: "ניתוח פונדמנטלי של החדשות",
} as const;

/** Metric label + one-line tooltip, keyed by the Fundamentals field id. */
export const METRIC: Record<string, { label: string; hint: string }> = {
  // Profitability
  profitMargin: { label: "שולי רווח נקי", hint: "אחוז הרווח הנקי מתוך המחזור; ככל שגבוה יותר, החברה רווחית ויעילה יותר." },
  grossMargin: { label: "שולי רווח גולמי", hint: "אחוז הרווח לאחר עלות המכר; משקף את כוח התמחור ואת יעילות הייצור." },
  operatingMargin: { label: "שולי רווח תפעולי", hint: "אחוז הרווח מהפעילות השוטפת לפני מימון ומס; מדד מרכזי לבריאות העסק." },
  returnOnEquity: { label: "תשואה על ההון (ROE)", hint: "הרווח הנקי ביחס להון העצמי; כמה החברה מייצרת עבור בעלי המניות." },
  returnOnAssets: { label: "תשואה על הנכסים (ROA)", hint: "הרווח ביחס לסך הנכסים; עד כמה החברה ממנפת ביעילות את נכסיה לרווח." },
  ebitda: { label: "EBITDA", hint: "רווח תפעולי לפני ריבית, מס, פחת והפחתות; קירוב לכוח ייצור המזומנים מהפעילות." },
  netIncome: { label: "רווח נקי", hint: "הרווח שנותר אחרי כל ההוצאות, המימון והמס; “השורה התחתונה”." },

  // Valuation
  trailingPE: { label: "מכפיל רווח (P/E)", hint: "מחיר המניה חלקי הרווח למניה ב-12 החודשים האחרונים; גבוה משקף ציפיות צמיחה אך גם תמחור יקר יותר." },
  forwardPE: { label: "מכפיל רווח עתידי (Fwd P/E)", hint: "אותו מכפיל לפי תחזית הרווח קדימה; נמוך מהמכפיל הנוכחי מרמז על גידול צפוי ברווחים." },
  pegRatio: { label: "מכפיל PEG", hint: "מכפיל הרווח חלקי קצב צמיחת הרווח; סביב 1 נחשב תמחור הוגן, מעל כך יקר יחסית לצמיחה." },
  priceToBook: { label: "מכפיל הון (P/B)", hint: "שווי השוק ביחס להון העצמי; מתחת ל-1 עשוי לרמז על מניה זולה, אך בטכנולוגיה הוא לרוב גבוה." },
  priceToSales: { label: "מכפיל מכירות (P/S)", hint: "שווי השוק חלקי המחזור השנתי; שימושי במיוחד לחברות צמיחה שעדיין אינן רווחיות." },
  enterpriseToEbitda: { label: "מכפיל EV/EBITDA", hint: "שווי הפעילות חלקי הרווח התפעולי לפני פחת; משווה חברות ללא תלות במבנה החוב." },
  enterpriseValue: { label: "שווי פעילות (EV)", hint: "שווי השוק בתוספת חוב נטו; העלות הכוללת של רכישת החברה." },
  marketCap: { label: "שווי שוק", hint: "מחיר המניה כפול מספר המניות; הגודל הכולל של החברה בבורסה." },
  dividendYield: { label: "תשואת דיבידנד", hint: "הדיבידנד השנתי כאחוז ממחיר המניה; מה שמשקיע מקבל במזומן ביחס להשקעתו." },
  payoutRatio: { label: "יחס חלוקה", hint: "חלק הרווח המחולק כדיבידנד; גבוה מאוד עלול להעיב על קיימות החלוקה." },
  beta: { label: "בטא (Beta)", hint: "תנודתיות המניה ביחס לשוק; מעל 1 תנודתית מהשוק, מתחת ל-1 יציבה ממנו." },

  // Cash flow
  freeCashflow: { label: "תזרים מזומנים חופשי (FCF)", hint: "המזומן שנותר אחרי השקעות הוניות; הכסף הזמין לחלוקה, להחזר חוב או לצמיחה." },
  operatingCashflow: { label: "תזרים מפעילות שוטפת", hint: "המזומן שמייצרת הפעילות העסקית הליבתית; מדד אמין לאיכות הרווח." },
  totalRevenue: { label: "הכנסות (מחזור)", hint: "סך המכירות בתקופה לפני כל הוצאה; “השורה העליונה”." },

  // Financial strength
  totalCash: { label: "סך מזומנים", hint: "כלל המזומנים ושווי המזומנים במאזן; כרית הנזילות של החברה." },
  totalDebt: { label: "סך החוב", hint: "סך ההתחייבויות הנושאות ריבית; ככל שגבוה יותר, גדל סיכון המימון." },
  netCash: { label: "מזומן נטו", hint: "מזומנים בניכוי חוב; חיובי משקף איתנות, שלילי משקף מינוף." },
  debtToEquity: { label: "יחס חוב להון (D/E)", hint: "היקף החוב ביחס להון העצמי; גבוה מצביע על מינוף ועל רגישות לעליית ריבית." },
  currentRatio: { label: "יחס שוטף", hint: "נכסים שוטפים חלקי התחייבויות שוטפות; מעל 1 מצביע על יכולת לעמוד בהתחייבויות הקרובות." },
  quickRatio: { label: "יחס מהיר", hint: "כמו היחס השוטף אך ללא מלאי; מבחן נזילות מחמיר יותר." },
  netDebtEbitda: { label: "חוב נטו / EBITDA", hint: "כמה שנות רווח תפעולי (לפני פחת) נדרשות לכיסוי החוב נטו; נמוך מ-3 נחשב בריא, שלילי = מזומן נטו." },
  interestCoverage: { label: "כיסוי ריבית", hint: "הרווח התפעולי (EBIT) חלקי הוצאות הריבית; גבוה יותר = יכולת נוחה יותר לשרת את החוב." },

  // Growth / forward
  revenueGrowth: { label: "צמיחת הכנסות", hint: "קצב הגידול במחזור ביחס לתקופה המקבילה; מנוע הצמיחה המרכזי." },
  earningsGrowth: { label: "צמיחת רווח", hint: "קצב הגידול ברווח; מעיד אם הצמיחה מיתרגמת לשורה התחתונה." },
  forwardEps: { label: "רווח למניה צפוי (Fwd EPS)", hint: "תחזית הרווח לכל מניה לתקופה הקרובה; הבסיס למכפיל העתידי." },
  trailingEps: { label: "רווח למניה (EPS)", hint: "הרווח לכל מניה ב-12 החודשים האחרונים." },
  targetMeanPrice: { label: "מחיר יעד ממוצע", hint: "מחיר היעד הממוצע של האנליסטים המסקרים; ציפיית השוק למחיר קדימה." },
  upside: { label: "פוטנציאל עלייה", hint: "הפער באחוזים בין מחיר היעד למחיר הנוכחי; שלילי מסמן פוטנציאל ירידה." },
  numberOfAnalysts: { label: "מספר אנליסטים", hint: "כמה אנליסטים מסקרים את המניה; יותר אנליסטים מגבירים את מהימנות הקונצנזוס." },
  recommendationKey: { label: "המלצת קונצנזוס", hint: "ההמלצה הממוצעת של האנליסטים, מ“קנייה חזקה” עד “מכירה חזקה”." },
};

/** General dashboard / widget UI strings. */
export const UI = {
  // Widget titles
  fundamentalAnalysis: "ניתוח פונדמנטלי",
  keyStatistics: "נתונים מרכזיים",
  latestNews: "חדשות אחרונות",
  performance: "ביצועים",
  fearGreed: "פחד וחמדנות",
  trendBias: "מגמת מסחר",
  eventRisk: "סיכון אירועים",
  about: (x: string) => `אודות ${x}`,
  newsImpact: "השפעת החדשות (ניתוח AI)",

  // Composite header
  overallGrade: "דירוג כולל",
  whatsGoingOn: "מה קורה עם הנייר",

  // Bottom-line / strengths / risks (scannable summary)
  bottomLine: "בשורה התחתונה",
  strengths: "חוזקות",
  risks: "סיכונים ונקודות למעקב",
  outOf100: "מתוך 100",

  // Generic
  readMore: "קרא עוד",
  showLess: "הצג פחות",
  contextBehind: "ההקשר מאחורי הכותרת",
  dayRange: "טווח יומי",
  week52Range: "טווח 52 שבועות",
  previousClose: "מחיר סגירה קודם",
  open: "פתיחה",
  volume: "מחזור מסחר",
  exchange: "בורסה",
  currency: "מטבע",
  event: "אירוע",
  live: "חי",
  delayed: "מושהה",
  vsPrevClose: "מול סגירה קודמת",
  whyItMatters: "למה זה חשוב",

  // Trend-bias component labels
  technicalMomentum: "מומנטום טכני",
  marketSentiment: "סנטימנט שוק",
  biasWeighting: "משוקלל 60% טכני · 40% סנטימנט.",

  // Disclaimers
  aiDisclaimer: "ניתוח שנוצר באמצעות בינה מלאכותית — אינו מהווה ייעוץ השקעות",
  refDisclaimer: "סקירה כללית למידע בלבד — אינה מהווה ייעוץ השקעות",
  via: (s: string) => `מקור: ${s}`,
  notAdviceShort: "ניתוח, לא ייעוץ השקעות",

  // Loading / empty states
  loading: "טוען…",
  analyzing: "מנתח…",
  noNews: "אין כותרות חדשות עדכניות לנייר זה",
  noData: "אין נתונים זמינים",
  loadAnalysisFailed: "טעינת הניתוח נכשלה",
  couldntLoadSymbol: "טעינת הנייר נכשלה",
  tryAnother: "נסה נייר אחר — למשל AAPL, BTC, EURUSD.",
  noOverview: (x: string) => `אין סקירה זמינה עבור ${x} כרגע.`,
  tapToSummarize: "הקש על החץ ליד כל כותרת לקבלת ההקשר מאחוריה.",
  couldntSummarize: "לא ניתן לסכם כתבה זו כרגע.",
  noContext: "אין הקשר נוסף זמין לכתבה זו עדיין.",

  // Multi-period trends + DCF + peers
  trends: "מגמות רב-שנתיות",
  revenueCagr: "צמיחת הכנסות (CAGR)",
  earningsCagr: "צמיחת רווח (CAGR)",
  netMarginByYear: "מרווח נקי לפי שנה",
  fairValue: "שווי הוגן (DCF)",
  upsideToFair: "מרחק לשווי ההוגן",
  impliedGrowth: "צמיחה גלומה במחיר",
  dcfAssumptions: (rate: number, growth: number) =>
    `מודל שקוף: היוון ${rate}% · צמיחה ${growth}% · 5 שנים + צמיחה מתמשכת. אינו מחיר יעד.`,
  peers: "השוואת מתחרים",
  peersPercentile: "דירוג מול הסקטור",
  peersEmpty: "אין סט מתחרים זמין לנייר זה.",
  peerComposite: "ציון כולל",
  earnings: "דוחות קרובים",
  nextEarnings: "מועד הדוחות הבא",
  earningsEstimate: "(משוער)",
  beatMissHistory: "הפתעות רווח אחרונות",
  inDays: (n: number) => (n === 0 ? "היום" : n === 1 ? "מחר" : `בעוד ${n} ימים`),

  // Fundamentals specifics
  partialData: "נתונים חלקיים",
  noPillarData: "אין נתונים",
  degradedNotice:
    "לנכס זה (קריפטו / מט“ח / מדד) אין דוחות כספיים של חברה — מוצגים קריאת שוק, נתונים זמינים וניתוח חדשות בלבד.",
  marketRead: "קריאת שוק",
  fundamentalsViaYahoo: "מבוסס נתוני Yahoo Finance",

  anchor: "עוגן",

  // Performance widget helper
  perfHelper: "כל שינוי נמדד מפתיחת אותה תקופה (UTC) — לא מבט מתגלגל. העמודות מותאמות לתנועה הגדולה ביותר המוצגת.",
  eventHelper: "אירועי מאקרו בעלי השפעה גבוהה מזיזים את כל השוק.",
  noEvents: "אין אירועים בעלי השפעה גבוהה שנותרו השבוע.",
  dragHint: "טיפ: רחף מעל כרטיס וגרור את ⠿ כדי לסדר מחדש את הלוח.",
  dataFooter:
    "נתונים: Yahoo Finance · CoinDesk · FXStreet · Alternative.me · Forex Factory · TradingView. מאוגד למידע בלבד — ניתוח, לא ייעוץ השקעות.",
} as const;

/** Net-margin trajectory → Hebrew chip label. */
export function marginDirectionHe(d?: string | null): { label: string; color: string } | null {
  if (d === "expanding") return { label: "מרווחים מתרחבים", color: "var(--up)" };
  if (d === "contracting") return { label: "מרווחים מתכווצים", color: "var(--down)" };
  if (d === "stable") return { label: "מרווחים יציבים", color: "var(--warn)" };
  return null;
}

/** Calendar / news impact level → Hebrew. */
export function impactHe(impact?: string): string {
  return { High: "השפעה גבוהה", Medium: "השפעה בינונית", Low: "השפעה נמוכה", Holiday: "חג" }[impact ?? ""] ?? "";
}

/** Fear & Greed label → Hebrew. */
export function fgLabelHe(score: number): string {
  if (score < 25) return "פחד קיצוני";
  if (score < 45) return "פחד";
  if (score < 55) return "ניטרלי";
  if (score < 75) return "חמדנות";
  return "חמדנות קיצונית";
}

/** Trend-bias label → Hebrew. */
export function biasLabelHe(bias: number): string {
  if (bias <= -60) return "דובי חזק";
  if (bias < -20) return "דובי";
  if (bias <= 20) return "ניטרלי";
  if (bias < 60) return "שורי";
  return "שורי חזק";
}

/** Asset class → Hebrew tag. */
export function assetClassHe(c: string): string {
  return { equity: "מניה", crypto: "קריפטו", forex: "מט“ח", index: "מדד" }[c] ?? c;
}

/** Anchored timeframe row label → Hebrew (falls back to the original). */
export function periodLabelHe(label: string): string {
  const map: Record<string, string> = {
    Day: "יום",
    Week: "שבוע",
    Month: "חודש",
    Quarter: "רבעון",
    YTD: "מתחילת השנה",
    Year: "שנה",
    "1Y": "שנה",
  };
  return map[label] ?? label;
}

/** Relative time in Hebrew (past articles + future events). */
export function relTimeHe(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  const future = diff > 0;
  const mins = Math.round(Math.abs(diff) / 60000);
  let unit: string;
  if (mins < 1) return "ממש עכשיו";
  if (mins < 60) unit = `${mins} דק׳`;
  else if (mins < 1440) unit = `${Math.floor(mins / 60)} שע׳`;
  else unit = `${Math.floor(mins / 1440)} ימים`;
  return future ? `בעוד ${unit}` : `לפני ${unit}`;
}
