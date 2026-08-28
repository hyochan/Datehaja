/**
 * Shared vocabularies. Imported by both the Convex backend and the React app
 * (via the `@convex` alias) so the chips a user taps are exactly the tokens the
 * matching engine scores.
 */

export const INTEREST_OPTIONS = [
  "Films", "Live music", "Running", "Hiking", "Yoga", "Climbing", "Cycling",
  "Coffee", "Wine", "Craft beer", "Cooking", "Baking", "Board games",
  "Photography", "Art galleries", "Museums", "Reading", "Poetry", "Theatre",
  "Stand-up comedy", "Vinyl", "Jazz", "K-pop", "Indie rock", "Techno",
  "Travel", "Languages", "Volunteering", "Design", "Architecture", "Startups",
  "Football", "Basketball", "Tennis", "Swimming", "Surfing", "Skiing",
  "Dogs", "Cats", "Plants", "Pottery", "Sewing", "Video games", "Anime",
  "Podcasts", "History", "Astronomy", "Chess", "Dancing", "Street food",
] as const;

export const HOBBY_OPTIONS = [
  "Journalling", "Gardening", "Cycling repair", "Home barista", "Knitting",
  "Painting", "Guitar", "Piano", "Singing", "Weightlifting", "Pilates",
  "Marathon training", "Bouldering", "Fermenting", "Woodwork", "Calligraphy",
  "Birdwatching", "Fishing", "Camping", "Roller skating", "Skateboarding",
  "Model building", "Puzzles", "Baking sourdough", "Mixology",
] as const;

export const LANGUAGE_OPTIONS = [
  "English", "Korean", "Japanese", "Mandarin", "Cantonese", "Spanish",
  "French", "German", "Italian", "Portuguese", "Russian", "Arabic",
  "Hindi", "Vietnamese", "Thai", "Indonesian", "Dutch", "Swedish",
] as const;

export const DATE_TYPE_OPTIONS = [
  { key: "coffee", label: "Coffee", emoji: "☕️" },
  { key: "dinner", label: "Dinner", emoji: "🍝" },
  { key: "drinks", label: "Drinks", emoji: "🍸" },
  { key: "exhibition", label: "Exhibition", emoji: "🖼️" },
  { key: "museum", label: "Museum", emoji: "🏛️" },
  { key: "walk", label: "Walk", emoji: "🌳" },
  { key: "dessert", label: "Dessert", emoji: "🍰" },
  { key: "live_music", label: "Live music", emoji: "🎷" },
  { key: "casual_activity", label: "Casual activity", emoji: "🎳" },
  { key: "surprise", label: "Something unexpected", emoji: "✨" },
] as const;

export const DATE_TYPE_KEYS = DATE_TYPE_OPTIONS.map((d) => d.key);

export const FIRST_DATE_VIBE_OPTIONS = [
  "Quiet and slow", "Lively and social", "Somewhere to talk", "Somewhere to do",
  "Outdoors", "Late night", "Daytime", "Short and easy", "Long and unhurried",
] as const;

export const OCCUPATION_CATEGORIES = [
  "Design", "Engineering", "Product", "Research", "Healthcare", "Education",
  "Law", "Finance", "Hospitality", "Construction", "Retail", "Media",
  "Arts", "Public service", "Non-profit", "Science", "Logistics",
  "Self-employed", "Student", "Between things", "Prefer not to say",
] as const;

export const DIETARY_OPTIONS = [
  { key: "vegetarian", label: "Vegetarian" },
  { key: "vegan", label: "Vegan" },
  { key: "halal", label: "Halal" },
  { key: "kosher", label: "Kosher" },
  { key: "gluten_free", label: "Gluten free" },
  { key: "no_pork", label: "No pork" },
  { key: "nut_allergy", label: "Nut allergy" },
  { key: "shellfish_allergy", label: "Shellfish allergy" },
  { key: "no_alcohol_venue", label: "Alcohol-free venue" },
] as const;

export const ACCESSIBILITY_OPTIONS = [
  { key: "step_free", label: "Step-free access" },
  { key: "no_stairs", label: "No stairs" },
  { key: "wheelchair", label: "Wheelchair accessible" },
  { key: "quiet_space", label: "Low-noise space" },
  { key: "service_animal", label: "Service animal welcome" },
  { key: "accessible_toilet", label: "Accessible toilet" },
] as const;

export const PASS_REASON_OPTIONS = [
  { key: "timing", label: "Timing doesn't work" },
  { key: "location", label: "Too far / wrong area" },
  { key: "activity", label: "Not my kind of date" },
  { key: "profile", label: "Not the right person for me" },
  { key: "budget", label: "Budget is off" },
  { key: "not_feeling_it", label: "Just not feeling it" },
] as const;

export const REPORT_CATEGORY_OPTIONS = [
  { key: "harassment", label: "Harassment or abuse" },
  { key: "inappropriate_content", label: "Inappropriate content" },
  { key: "fake_profile", label: "Fake or misleading profile" },
  { key: "underage", label: "Appears to be under 18" },
  { key: "scam_or_spam", label: "Scam, spam or solicitation" },
  { key: "no_show", label: "Didn't show up" },
  { key: "safety_concern", label: "Safety concern" },
  { key: "other", label: "Something else" },
] as const;

/** Preset logistics messages. Deliberately the whole vocabulary — Datehaja is
 *  not a chat app, it just needs to survive a delayed train. */
export const PRESET_MESSAGES = [
  { key: "running_late_10", body: "I'm running about 10 minutes late." },
  { key: "running_late_20", body: "I'm running about 20 minutes late." },
  { key: "im_here", body: "I'm here." },
  { key: "move_30_later", body: "Could we push the time back by 30 minutes?" },
  { key: "move_30_earlier", body: "Could we move the time 30 minutes earlier?" },
  { key: "on_my_way", body: "On my way." },
  { key: "looking_forward", body: "Looking forward to it." },
  { key: "cant_find", body: "I'm having trouble finding the place." },
] as const;

export type PresetMessageKey = (typeof PRESET_MESSAGES)[number]["key"];

/** Cities Datehaja can research and plan in. Approximate centroids only. */
export const SUPPORTED_CITIES = [
  {
    key: "seoul",
    city: "Seoul",
    countryCode: "KR",
    timezone: "Asia/Seoul",
    currency: "KRW",
    lat: 37.55,
    lng: 126.99,
    neighborhoods: [
      { name: "Seongsu", lat: 37.54, lng: 127.06 },
      { name: "Yeonnam", lat: 37.56, lng: 126.92 },
      { name: "Itaewon", lat: 37.53, lng: 126.99 },
      { name: "Gangnam", lat: 37.5, lng: 127.03 },
      { name: "Hongdae", lat: 37.56, lng: 126.92 },
      { name: "Euljiro", lat: 37.57, lng: 126.99 },
      { name: "Samcheong", lat: 37.58, lng: 126.98 },
      { name: "Mangwon", lat: 37.56, lng: 126.9 },
      { name: "Seochon", lat: 37.58, lng: 126.97 },
      { name: "Jamsil", lat: 37.51, lng: 127.1 },
    ],
  },
  {
    key: "tokyo",
    city: "Tokyo",
    countryCode: "JP",
    timezone: "Asia/Tokyo",
    currency: "JPY",
    lat: 35.68,
    lng: 139.76,
    neighborhoods: [
      { name: "Shimokitazawa", lat: 35.66, lng: 139.67 },
      { name: "Nakameguro", lat: 35.64, lng: 139.7 },
      { name: "Kichijoji", lat: 35.7, lng: 139.58 },
      { name: "Yanaka", lat: 35.73, lng: 139.77 },
      { name: "Ebisu", lat: 35.65, lng: 139.71 },
      { name: "Kuramae", lat: 35.71, lng: 139.79 },
      { name: "Shibuya", lat: 35.66, lng: 139.7 },
    ],
  },
  {
    key: "new-york",
    city: "New York",
    countryCode: "US",
    timezone: "America/New_York",
    currency: "USD",
    lat: 40.73,
    lng: -73.99,
    neighborhoods: [
      { name: "West Village", lat: 40.74, lng: -74.0 },
      { name: "Williamsburg", lat: 40.71, lng: -73.96 },
      { name: "Lower East Side", lat: 40.72, lng: -73.99 },
      { name: "Astoria", lat: 40.76, lng: -73.92 },
      { name: "Park Slope", lat: 40.67, lng: -73.98 },
      { name: "Harlem", lat: 40.81, lng: -73.95 },
    ],
  },
  {
    key: "london",
    city: "London",
    countryCode: "GB",
    timezone: "Europe/London",
    currency: "GBP",
    lat: 51.51,
    lng: -0.13,
    neighborhoods: [
      { name: "Shoreditch", lat: 51.53, lng: -0.08 },
      { name: "Peckham", lat: 51.47, lng: -0.07 },
      { name: "Soho", lat: 51.51, lng: -0.13 },
      { name: "Hackney", lat: 51.55, lng: -0.06 },
      { name: "Notting Hill", lat: 51.51, lng: -0.2 },
      { name: "Borough", lat: 51.5, lng: -0.09 },
    ],
  },
  {
    key: "san-francisco",
    city: "San Francisco",
    countryCode: "US",
    timezone: "America/Los_Angeles",
    currency: "USD",
    lat: 37.77,
    lng: -122.42,
    neighborhoods: [
      { name: "Mission", lat: 37.76, lng: -122.42 },
      { name: "Hayes Valley", lat: 37.78, lng: -122.43 },
      { name: "North Beach", lat: 37.8, lng: -122.41 },
      { name: "Outer Sunset", lat: 37.75, lng: -122.49 },
      { name: "Potrero Hill", lat: 37.76, lng: -122.4 },
    ],
  },
  {
    key: "berlin",
    city: "Berlin",
    countryCode: "DE",
    timezone: "Europe/Berlin",
    currency: "EUR",
    lat: 52.52,
    lng: 13.4,
    neighborhoods: [
      { name: "Kreuzberg", lat: 52.5, lng: 13.42 },
      { name: "Neukölln", lat: 52.48, lng: 13.44 },
      { name: "Prenzlauer Berg", lat: 52.54, lng: 13.42 },
      { name: "Mitte", lat: 52.52, lng: 13.4 },
      { name: "Friedrichshain", lat: 52.51, lng: 13.45 },
    ],
  },
] as const;

export type SupportedCity = (typeof SUPPORTED_CITIES)[number];

export function findCity(cityName: string): SupportedCity | undefined {
  return SUPPORTED_CITIES.find(
    (c) => c.city.toLowerCase() === cityName.trim().toLowerCase(),
  );
}

export function findNeighborhood(
  cityName: string,
  neighborhood: string,
): { name: string; lat: number; lng: number } | undefined {
  const city = findCity(cityName);
  if (!city) return undefined;
  return city.neighborhoods.find(
    (n) => n.name.toLowerCase() === neighborhood.trim().toLowerCase(),
  );
}

/** Sensible default budget bands per currency, per person. */
export const BUDGET_BANDS: Record<string, { min: number; max: number; step: number }> = {
  KRW: { min: 10000, max: 150000, step: 5000 },
  JPY: { min: 1000, max: 20000, step: 500 },
  USD: { min: 10, max: 200, step: 5 },
  GBP: { min: 10, max: 150, step: 5 },
  EUR: { min: 10, max: 150, step: 5 },
};

export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "KRW" || currency === "JPY" ? 0 : 0,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}
