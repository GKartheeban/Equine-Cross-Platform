// EquineTrade load test (k6): visitors browsing the site.
// Each fake visitor: Home -> Search -> a horse page -> a district page, with pauses like a real person.
//
// Run from the project folder:
//   k6 run -e BASE_URL=https://your-site.netlify.app load-tests/browse.js
//
// Kept small on purpose (max 20 visitors at once, ~3 minutes) so it stays within the
// free Netlify/Supabase plans. Raise "target" numbers only on paid plans.

import http from "k6/http";
import { check, group, sleep } from "k6";

const BASE = (__ENV.BASE_URL || "").replace(/\/$/, "");
if (!BASE) throw new Error("Set the site address: k6 run -e BASE_URL=https://your-site.netlify.app load-tests/browse.js");

export const options = {
  stages: [
    { duration: "30s", target: 5 },  // warm up to 5 visitors
    { duration: "1m", target: 20 },  // rise to 20 visitors at the same time
    { duration: "1m", target: 20 },  // hold
    { duration: "30s", target: 0 },  // calm down
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],    // fewer than 1% of requests fail
    http_req_duration: ["p(95)<2000"], // 95% of pages answer within 2 seconds
  },
};

const DISTRICTS = ["madurai", "coimbatore", "chennai", "tiruchirappalli", "salem"];
const BREEDS = ["marwari", "kathiawari", "country-horse", ""];

export default function () {
  let horseLinks = [];

  group("Home", () => {
    const res = http.get(`${BASE}/`, { tags: { page: "home" } });
    check(res, { "home loads": (r) => r.status === 200 });
    // Find horse pages linked from the home page, e.g. /horses/marwari-mare-madurai-3f9a2c
    horseLinks = [...new Set((res.body || "").match(/\/horses\/[a-z0-9-]+/g) || [])];
  });
  sleep(2 + Math.random() * 3);

  group("Search", () => {
    const breed = BREEDS[Math.floor(Math.random() * BREEDS.length)];
    const res = http.get(`${BASE}/horses${breed ? `?breed=${breed}` : ""}`, { tags: { page: "search" } });
    check(res, { "search loads": (r) => r.status === 200 });
  });
  sleep(2 + Math.random() * 3);

  if (horseLinks.length) {
    group("Horse page", () => {
      const link = horseLinks[Math.floor(Math.random() * horseLinks.length)];
      const res = http.get(`${BASE}${link}`, { tags: { page: "horse" } });
      check(res, { "horse page loads": (r) => r.status === 200 });
    });
    sleep(3 + Math.random() * 5);
  }

  group("District page", () => {
    const d = DISTRICTS[Math.floor(Math.random() * DISTRICTS.length)];
    const res = http.get(`${BASE}/horses-for-sale/${d}`, { tags: { page: "district" } });
    check(res, { "district page loads": (r) => r.status === 200 });
  });
  sleep(2 + Math.random() * 3);
}
