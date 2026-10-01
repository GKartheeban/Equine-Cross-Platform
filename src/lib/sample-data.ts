// Placeholder data for building the pages.
// Later these will come from Supabase.

export const breeds = [
  { slug: "marwari", name: "Marwari" },
  { slug: "kathiawari", name: "Kathiawari" },
  { slug: "thoroughbred", name: "Thoroughbred" },
  { slug: "country-horse", name: "Country horse" },
  { slug: "pony", name: "Pony" },
  { slug: "sindhi", name: "Sindhi" },
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

export type Listing = {
  slug: string;
  breed: string;
  gender: "Mare" | "Stallion" | "Gelding";
  ageYears: number;
  heightInches: number;
  colour: string;
  priceInr: number;
  district: string;
  postedDaysAgo: number;
  hasVideo: boolean;
};

export const latestListings: Listing[] = [
  { slug: "marwari-mare-madurai-1001", breed: "Marwari", gender: "Mare", ageYears: 4, heightInches: 62, colour: "Bay", priceInr: 185000, district: "Madurai", postedDaysAgo: 1, hasVideo: true },
  { slug: "kathiawari-stallion-coimbatore-1002", breed: "Kathiawari", gender: "Stallion", ageYears: 6, heightInches: 60, colour: "Grey", priceInr: 240000, district: "Coimbatore", postedDaysAgo: 2, hasVideo: true },
  { slug: "country-horse-gelding-salem-1003", breed: "Country horse", gender: "Gelding", ageYears: 8, heightInches: 56, colour: "Chestnut", priceInr: 45000, district: "Salem", postedDaysAgo: 3, hasVideo: false },
  { slug: "marwari-stallion-trichy-1004", breed: "Marwari", gender: "Stallion", ageYears: 5, heightInches: 64, colour: "Black", priceInr: 320000, district: "Trichy", postedDaysAgo: 4, hasVideo: true },
  { slug: "pony-mare-chennai-1005", breed: "Pony", gender: "Mare", ageYears: 3, heightInches: 46, colour: "Palomino", priceInr: 38000, district: "Chennai", postedDaysAgo: 5, hasVideo: true },
  { slug: "thoroughbred-gelding-erode-1006", breed: "Thoroughbred", gender: "Gelding", ageYears: 7, heightInches: 65, colour: "Bay", priceInr: 410000, district: "Erode", postedDaysAgo: 6, hasVideo: false },
];

export function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
