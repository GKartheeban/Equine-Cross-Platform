// Placeholder data for building the pages.
// Later this will come from Supabase.

export const breeds = [
  { slug: "marwari", name: "Marwari" },
  { slug: "kathiawari", name: "Kathiawari" },
  { slug: "thoroughbred", name: "Thoroughbred" },
  { slug: "country-horse", name: "Country horse" },
  { slug: "pony", name: "Pony" },
  { slug: "sindhi", name: "Sindhi" },
  { slug: "cross", name: "Cross" },
];

// All 38 districts of Tamil Nadu, alphabetical.
// `popular` ones are shown first on the home page.
export const districts = [
  { slug: "ariyalur", name: "Ariyalur" },
  { slug: "chengalpattu", name: "Chengalpattu" },
  { slug: "chennai", name: "Chennai", popular: true },
  { slug: "coimbatore", name: "Coimbatore", popular: true },
  { slug: "cuddalore", name: "Cuddalore" },
  { slug: "dharmapuri", name: "Dharmapuri" },
  { slug: "dindigul", name: "Dindigul" },
  { slug: "erode", name: "Erode", popular: true },
  { slug: "kallakurichi", name: "Kallakurichi" },
  { slug: "kancheepuram", name: "Kancheepuram" },
  { slug: "kanniyakumari", name: "Kanniyakumari" },
  { slug: "karur", name: "Karur" },
  { slug: "krishnagiri", name: "Krishnagiri" },
  { slug: "madurai", name: "Madurai", popular: true },
  { slug: "mayiladuthurai", name: "Mayiladuthurai" },
  { slug: "nagapattinam", name: "Nagapattinam" },
  { slug: "namakkal", name: "Namakkal" },
  { slug: "nilgiris", name: "Nilgiris" },
  { slug: "perambalur", name: "Perambalur" },
  { slug: "pudukkottai", name: "Pudukkottai" },
  { slug: "ramanathapuram", name: "Ramanathapuram" },
  { slug: "ranipet", name: "Ranipet" },
  { slug: "salem", name: "Salem", popular: true },
  { slug: "sivaganga", name: "Sivaganga" },
  { slug: "tenkasi", name: "Tenkasi" },
  { slug: "thanjavur", name: "Thanjavur", popular: true },
  { slug: "theni", name: "Theni" },
  { slug: "thoothukudi", name: "Thoothukudi" },
  { slug: "tiruchirappalli", name: "Tiruchirappalli (Trichy)", popular: true },
  { slug: "tirunelveli", name: "Tirunelveli", popular: true },
  { slug: "tirupathur", name: "Tirupathur" },
  { slug: "tiruppur", name: "Tiruppur" },
  { slug: "tiruvallur", name: "Tiruvallur" },
  { slug: "tiruvannamalai", name: "Tiruvannamalai" },
  { slug: "tiruvarur", name: "Tiruvarur" },
  { slug: "vellore", name: "Vellore" },
  { slug: "viluppuram", name: "Viluppuram" },
  { slug: "virudhunagar", name: "Virudhunagar" },
];

export const priceRanges = [
  { value: "0-50000", label: "Under ₹50,000" },
  { value: "50000-100000", label: "₹50,000 – ₹1 lakh" },
  { value: "100000-300000", label: "₹1 – 3 lakh" },
  { value: "300000-", label: "Above ₹3 lakh" },
];

// Fixed photo angles every seller is asked for.
export const photoAngles = ["Front", "Left side", "Right side", "Rear", "Teeth"] as const;

export type Listing = {
  slug: string;
  breed: string;
  gender: "Mare" | "Stallion" | "Gelding" | "Colt" | "Filly";
  ageYears: number;
  heightInches: number;
  colour: string;
  markings: string;
  priceInr: number;
  negotiable: boolean;
  district: string;
  town: string;
  postedDaysAgo: number;
  hasVideo: boolean;
  vaccinated: boolean;
  vetCertificate: boolean;
  trainingLevel: "Untrained" | "Ridden" | "Cart" | "Ridden and cart" | "Race" | "Dance only" | "All";
  handlerExperience: "Beginner" | "Intermediate" | "Expert";
  description: string;
  views: number;
  seller: { name: string; memberSince: string; listings: number };
};

export const latestListings: Listing[] = [
  {
    slug: "marwari-mare-madurai-1001",
    breed: "Marwari", gender: "Mare", ageYears: 4, heightInches: 62, colour: "Bay",
    markings: "White star on forehead, curved ears",
    priceInr: 185000, negotiable: true, district: "Madurai", town: "Melur",
    postedDaysAgo: 1, hasVideo: true, vaccinated: true, vetCertificate: true,
    trainingLevel: "Dance only", handlerExperience: "Beginner",
    description:
      "Healthy Marwari mare with classic curved ears. Ridden daily, calm with children, used at local functions. Selling because we are moving.",
    views: 214,
    seller: { name: "Murugan S.", memberSince: "2026", listings: 2 },
  },
  {
    slug: "kathiawari-stallion-coimbatore-1002",
    breed: "Kathiawari", gender: "Stallion", ageYears: 6, heightInches: 60, colour: "Grey",
    markings: "Dappled grey, dark mane",
    priceInr: 240000, negotiable: false, district: "Coimbatore", town: "Pollachi",
    postedDaysAgo: 2, hasVideo: true, vaccinated: true, vetCertificate: false,
    trainingLevel: "Race", handlerExperience: "Intermediate",
    description:
      "Strong Kathiawari stallion, shown at two horse fairs. Good bloodline. Serious buyers only.",
    views: 341,
    seller: { name: "Karthik R.", memberSince: "2026", listings: 1 },
  },
  {
    slug: "country-horse-gelding-salem-1003",
    breed: "Country horse", gender: "Gelding", ageYears: 8, heightInches: 56, colour: "Chestnut",
    markings: "White socks on hind legs",
    priceInr: 45000, negotiable: true, district: "Salem", town: "Attur",
    postedDaysAgo: 3, hasVideo: false, vaccinated: false, vetCertificate: false,
    trainingLevel: "Ridden and cart", handlerExperience: "Beginner",
    description: "Hardy country horse, used for cart and riding. Easy keeper.",
    views: 98,
    seller: { name: "Selvam P.", memberSince: "2026", listings: 3 },
  },
  {
    slug: "marwari-stallion-trichy-1004",
    breed: "Marwari", gender: "Stallion", ageYears: 5, heightInches: 64, colour: "Black",
    markings: "Full black, no markings",
    priceInr: 320000, negotiable: true, district: "Tiruchirappalli (Trichy)", town: "Srirangam",
    postedDaysAgo: 4, hasVideo: true, vaccinated: true, vetCertificate: true,
    trainingLevel: "Ridden", handlerExperience: "Expert",
    description:
      "Tall black Marwari stallion with excellent gait. Needs an experienced handler. Vet certificate available.",
    views: 402,
    seller: { name: "Anand K.", memberSince: "2026", listings: 1 },
  },
  {
    slug: "pony-mare-chennai-1005",
    breed: "Pony", gender: "Mare", ageYears: 3, heightInches: 46, colour: "Palomino",
    markings: "Light mane and tail",
    priceInr: 38000, negotiable: true, district: "Chennai", town: "Tambaram",
    postedDaysAgo: 5, hasVideo: true, vaccinated: true, vetCertificate: false,
    trainingLevel: "Untrained", handlerExperience: "Beginner",
    description: "Gentle pony, good for children's riding lessons. Halter trained.",
    views: 156,
    seller: { name: "Priya V.", memberSince: "2026", listings: 1 },
  },
  {
    slug: "thoroughbred-gelding-erode-1006",
    breed: "Thoroughbred", gender: "Gelding", ageYears: 7, heightInches: 65, colour: "Bay",
    markings: "Blaze on face",
    priceInr: 410000, negotiable: false, district: "Erode", town: "Gobichettipalayam",
    postedDaysAgo: 6, hasVideo: false, vaccinated: true, vetCertificate: true,
    trainingLevel: "Race", handlerExperience: "Expert",
    description: "Retired racehorse, fit and sound. Suitable for show jumping training.",
    views: 287,
    seller: { name: "Ramesh T.", memberSince: "2026", listings: 2 },
  },
];

export function getListing(slug: string) {
  return latestListings.find((l) => l.slug === slug);
}

export function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function postedLabel(days: number) {
  if (days === 0) return "Today";
  return days === 1 ? "1 day ago" : `${days} days ago`;
}
