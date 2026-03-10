import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedAppUser } from "./auth";

export const viewer = query({
  args: {},
  handler: async (ctx) => {
    return await getAuthenticatedAppUser(ctx);
  },
});

export const getById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db.get(userId);
  },
});

export const createOrUpdate = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("buyer"), v.literal("seller")),
  },
  handler: async (ctx, { email, name, role }) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { name });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      email,
      name,
      role,
      isVerifiedSeller: false,
    });
  },
});

export const updateProfile = mutation({
  args: {
    phone: v.optional(v.string()),
    whatsapp: v.optional(v.string()),
    location: v.optional(v.string()),
    wilaya: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedAppUser(ctx);
    if (!user) throw new Error("غير مصرح");

    const updates: Record<string, string | undefined> = {};
    for (const [key, value] of Object.entries(args)) {
      if (value !== undefined) {
        updates[key] = value;
      }
    }

    await ctx.db.patch(user._id, updates);
    return user._id;
  },
});
