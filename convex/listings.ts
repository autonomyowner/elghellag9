import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedAppUser } from "./auth";

export const list = query({
  args: {
    category: v.optional(
      v.union(
        v.literal("vegetables"),
        v.literal("fruits"),
        v.literal("grains"),
        v.literal("livestock"),
        v.literal("equipment"),
        v.literal("land"),
        v.literal("seeds"),
        v.literal("fertilizers")
      )
    ),
    status: v.optional(v.string()),
    wilaya: v.optional(v.string()),
  },
  handler: async (ctx, { category, status, wilaya }) => {
    let q;

    if (category) {
      q = ctx.db
        .query("listings")
        .withIndex("category_status", (idx) =>
          idx.eq("category", category).eq("status", "active")
        );
    } else {
      q = ctx.db
        .query("listings")
        .withIndex("status", (idx) => idx.eq("status", "active"));
    }

    let results = await q.order("desc").collect();

    if (wilaya) {
      results = results.filter((l) => l.wilaya === wilaya);
    }

    return results;
  },
});

export const getById = query({
  args: { listingId: v.id("listings") },
  handler: async (ctx, { listingId }) => {
    return await ctx.db.get(listingId);
  },
});

export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("listings")
      .withIndex("sellerId", (q) => q.eq("sellerId", userId))
      .order("desc")
      .collect();
  },
});

export const getMyListings = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedAppUser(ctx);
    if (!user) return [];
    return await ctx.db
      .query("listings")
      .withIndex("sellerId", (q) => q.eq("sellerId", user._id))
      .order("desc")
      .collect();
  },
});

export const search = query({
  args: {
    searchTerm: v.string(),
    category: v.optional(
      v.union(
        v.literal("vegetables"),
        v.literal("fruits"),
        v.literal("grains"),
        v.literal("livestock"),
        v.literal("equipment"),
        v.literal("land"),
        v.literal("seeds"),
        v.literal("fertilizers")
      )
    ),
  },
  handler: async (ctx, { searchTerm, category }) => {
    let q = ctx.db
      .query("listings")
      .withSearchIndex("search_title", (s) => {
        let search = s.search("title", searchTerm);
        if (category) search = search.eq("category", category);
        search = search.eq("status", "active");
        return search;
      });

    return await q.collect();
  },
});

export const getRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    return await ctx.db
      .query("listings")
      .withIndex("status", (q) => q.eq("status", "active"))
      .order("desc")
      .take(limit ?? 8);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    price: v.number(),
    category: v.union(
      v.literal("vegetables"),
      v.literal("fruits"),
      v.literal("grains"),
      v.literal("livestock"),
      v.literal("equipment"),
      v.literal("land"),
      v.literal("seeds"),
      v.literal("fertilizers")
    ),
    images: v.array(v.string()),
    location: v.optional(v.string()),
    wilaya: v.optional(v.string()),
    condition: v.optional(
      v.union(
        v.literal("new"),
        v.literal("excellent"),
        v.literal("good"),
        v.literal("fair")
      )
    ),
    quantity: v.optional(v.number()),
    unit: v.optional(v.string()),
    isOrganic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedAppUser(ctx);
    if (!user) throw new Error("غير مصرح");
    if (user.role !== "seller")
      throw new Error("البائعون فقط يمكنهم إضافة منتجات");

    return await ctx.db.insert("listings", {
      ...args,
      sellerId: user._id,
      status: "active",
      viewCount: 0,
    });
  },
});

export const update = mutation({
  args: {
    listingId: v.id("listings"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    category: v.optional(
      v.union(
        v.literal("vegetables"),
        v.literal("fruits"),
        v.literal("grains"),
        v.literal("livestock"),
        v.literal("equipment"),
        v.literal("land"),
        v.literal("seeds"),
        v.literal("fertilizers")
      )
    ),
    images: v.optional(v.array(v.string())),
    location: v.optional(v.string()),
    wilaya: v.optional(v.string()),
    condition: v.optional(
      v.union(
        v.literal("new"),
        v.literal("excellent"),
        v.literal("good"),
        v.literal("fair")
      )
    ),
    quantity: v.optional(v.number()),
    unit: v.optional(v.string()),
    isOrganic: v.optional(v.boolean()),
  },
  handler: async (ctx, { listingId, ...updates }) => {
    const user = await getAuthenticatedAppUser(ctx);
    if (!user) throw new Error("غير مصرح");

    const listing = await ctx.db.get(listingId);
    if (!listing) throw new Error("المنتج غير موجود");
    if (listing.sellerId !== user._id) throw new Error("غير مصرح");

    const cleanUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) cleanUpdates[key] = value;
    }

    await ctx.db.patch(listingId, cleanUpdates);
    return listingId;
  },
});

export const updateStatus = mutation({
  args: {
    listingId: v.id("listings"),
    status: v.union(
      v.literal("active"),
      v.literal("sold"),
      v.literal("draft"),
      v.literal("archived")
    ),
  },
  handler: async (ctx, { listingId, status }) => {
    const user = await getAuthenticatedAppUser(ctx);
    if (!user) throw new Error("غير مصرح");

    const listing = await ctx.db.get(listingId);
    if (!listing || listing.sellerId !== user._id)
      throw new Error("غير مصرح");

    await ctx.db.patch(listingId, { status });
  },
});

export const remove = mutation({
  args: { listingId: v.id("listings") },
  handler: async (ctx, { listingId }) => {
    const user = await getAuthenticatedAppUser(ctx);
    if (!user) throw new Error("غير مصرح");

    const listing = await ctx.db.get(listingId);
    if (!listing || listing.sellerId !== user._id)
      throw new Error("غير مصرح");

    await ctx.db.patch(listingId, { status: "archived" });
  },
});

export const incrementViews = mutation({
  args: { listingId: v.id("listings") },
  handler: async (ctx, { listingId }) => {
    const listing = await ctx.db.get(listingId);
    if (!listing) return;
    await ctx.db.patch(listingId, {
      viewCount: (listing.viewCount ?? 0) + 1,
    });
  },
});
