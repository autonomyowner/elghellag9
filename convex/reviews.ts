import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedAppUser } from "./auth";

export const listForSeller = query({
  args: { sellerId: v.id("users") },
  handler: async (ctx, { sellerId }) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("sellerId", (q) => q.eq("sellerId", sellerId))
      .order("desc")
      .collect();

    const enriched = await Promise.all(
      reviews.map(async (r) => {
        const reviewer = await ctx.db.get(r.reviewerId);
        return { ...r, reviewerName: reviewer?.name ?? "مجهول" };
      })
    );

    return enriched;
  },
});

export const getAverageRating = query({
  args: { sellerId: v.id("users") },
  handler: async (ctx, { sellerId }) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("sellerId", (q) => q.eq("sellerId", sellerId))
      .collect();

    if (reviews.length === 0) return { average: 0, count: 0 };

    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return {
      average: Math.round((sum / reviews.length) * 10) / 10,
      count: reviews.length,
    };
  },
});

export const create = mutation({
  args: {
    sellerId: v.id("users"),
    rating: v.number(),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, { sellerId, rating, comment }) => {
    const user = await getAuthenticatedAppUser(ctx);
    if (!user) throw new Error("غير مصرح");
    if (user._id === sellerId) throw new Error("لا يمكنك تقييم نفسك");
    if (rating < 1 || rating > 5) throw new Error("التقييم يجب أن يكون بين 1 و 5");

    const existing = await ctx.db
      .query("reviews")
      .withIndex("sellerId", (q) => q.eq("sellerId", sellerId))
      .collect();

    const alreadyReviewed = existing.find(
      (r) => r.reviewerId === user._id
    );
    if (alreadyReviewed) throw new Error("لقد قمت بتقييم هذا البائع مسبقاً");

    return await ctx.db.insert("reviews", {
      reviewerId: user._id,
      sellerId,
      rating,
      comment,
    });
  },
});
