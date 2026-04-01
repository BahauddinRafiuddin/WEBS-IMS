import Company from "../models/Company.js";
import InternshipProgram from "../models/InternshipProgram.js";

let cache = {
  data: null,
  expiresAt: 0,
};

const TTL = 10 * 60 * 1000; // 10 minutes

export const getCachedPublicData = async () => {
  if (cache.data && Date.now() < cache.expiresAt) {
    return cache.data; // ✅ Cache HIT — no DB call
  }

  // Cache MISS — fetch from DB once
  const [programs, companies] = await Promise.all([
    InternshipProgram.find().populate("company", "name").limit(10),
    Company.find({ isActive: true }).select("name").limit(10),
  ]);

  cache.data = { programs, companies };
  cache.expiresAt = Date.now() + TTL;
  return cache.data;
}

// Call this when admin creates/updates a program
export const invalidatePublicCache = () => {
  cache.data = null;
  cache.expiresAt = 0;
}