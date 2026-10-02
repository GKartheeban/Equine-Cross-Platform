// Fixed lists used across the site: breeds, districts, price ranges,
// plus small formatting helpers. (Real horses come from Supabase: see listings.ts.)

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
