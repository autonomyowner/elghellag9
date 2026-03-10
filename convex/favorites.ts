import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedAppUser } from "./auth";

export const listForUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedAppUser(ctx);
    if (!user) return [];

    const favs = await ctx.db
      .query("favorites")
      .withIndex("userId_listing", (q) => q.eq("userId", user._id))
      .collect();

    const listings = await Promise.all(
      favs.map(async (f) => {
        const listing = await ctx.db.get(f.listingId);
        return listing ? { ...listing, favoriteId: f._id } : null;
      })
    );

    return listings.filter(Boolean);
  },
});

export const isFavorited = query({
  args: { listingId: v.id("listings") },
  handler: async (ctx, { listingId }) => {
    const user = await getAuthenticatedAppUser(ctx);
    if (!user) return false;

    const fav = await ctx.db
      .query("favorites")
      .withIndex("userId_listing", (q) =>
        q.eq("userId", user._id).eq("listingId", listingId)
      )
      .first();

    return !!fav;
  },
});

export const toggle = mutation({
  args: { listingId: v.id("listings") },
  handler: async (ctx, { listingId }) => {
    const user = await getAuthenticatedAppUser(ctx);
    if (!user) throw new Error("غير مصرح");

    const existing = await ctx.db
      .query("favorites")
      .withIndex("userId_listing", (q) =>
        q.eq("userId", user._id).eq("listingId", listingId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return false;
    }

    await ctx.db.insert("favorites", {
      userId: user._id,
      listingId,
    });
    return true;
  },
});
