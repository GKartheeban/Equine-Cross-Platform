// Approximate location of each Tamil Nadu district's headquarters town
// (latitude, longitude). Used only to estimate road distance for horse transport.

export const districtCoords: Record<string, [number, number]> = {
  ariyalur: [11.14, 79.08],
  chengalpattu: [12.69, 79.98],
  chennai: [13.08, 80.27],
  coimbatore: [11.02, 76.96],
  cuddalore: [11.75, 79.77],
  dharmapuri: [12.13, 78.16],
  dindigul: [10.36, 77.98],
  erode: [11.34, 77.72],
  kallakurichi: [11.74, 78.96],
  kancheepuram: [12.83, 79.7],
  kanniyakumari: [8.18, 77.41],
  karur: [10.96, 78.08],
  krishnagiri: [12.52, 78.21],
  madurai: [9.93, 78.12],
  mayiladuthurai: [11.1, 79.65],
  nagapattinam: [10.77, 79.84],
  namakkal: [11.22, 78.17],
  nilgiris: [11.41, 76.7],
  perambalur: [11.23, 78.88],
  pudukkottai: [10.38, 78.82],
  ramanathapuram: [9.37, 78.83],
  ranipet: [12.93, 79.33],
  salem: [11.66, 78.15],
  sivaganga: [9.85, 78.48],
  tenkasi: [8.96, 77.3],
  thanjavur: [10.79, 79.14],
  theni: [10.01, 77.48],
  thoothukudi: [8.76, 78.13],
  tiruchirappalli: [10.79, 78.7],
  tirunelveli: [8.71, 77.76],
  tirupathur: [12.5, 78.57],
  tiruppur: [11.11, 77.34],
  tiruvallur: [13.14, 79.91],
  tiruvannamalai: [12.23, 79.07],
  tiruvarur: [10.77, 79.64],
  vellore: [12.92, 79.13],
  viluppuram: [11.94, 79.49],
  virudhunagar: [9.58, 77.96],
};

/** Estimated road distance in km between two districts (straight line × 1.25). */
export function roadKm(from: string, to: string): number | null {
  const a = districtCoords[from];
  const b = districtCoords[to];
  if (!a || !b) return null;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b[0] - a[0]);
  const dLng = rad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2;
  const straight = 2 * 6371 * Math.asin(Math.sqrt(h));
  return Math.round(straight * 1.25);
}
