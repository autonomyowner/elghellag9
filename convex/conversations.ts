import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedAppUser } from "./auth";

export const listForUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedAppUser(ctx);
    if (!user) return [];

    const asBuyer = await ctx.db
      .query("conversations")
      .withIndex("buyerId", (q) => q.eq("buyerId", user._id))
      .collect();

    const asSeller = await ctx.db
      .query("conversations")
      .withIndex("sellerId", (q) => q.eq("sellerId", user._id))
      .collect();

    const all = [...asBuyer, ...asSeller];
    all.sort((a, b) => (b.lastMessageAt ?? 0) - (a.lastMessageAt ?? 0));

    const enriched = await Promise.all(
      all.map(async (conv) => {
        const otherId =
          conv.buyerId === user._id ? conv.sellerId : conv.buyerId;
        const otherUser = await ctx.db.get(otherId);
        const listing = conv.listingId
          ? await ctx.db.get(conv.listingId)
          : null;

        const lastMessage = await ctx.db
          .query("messages")
          .withIndex("conversationId", (q) =>
            q.eq("conversationId", conv._id)
          )
          .order("desc")
          .first();

        const unread =
          conv.buyerId === user._id
            ? conv.buyerUnread ?? 0
            : conv.sellerUnread ?? 0;

        return {
          ...conv,
          otherUser,
          listing,
          lastMessage,
          unread,
        };
      })
    );

    return enriched;
  },
});

export const getOrCreate = mutation({
  args: {
    sellerId: v.id("users"),
    listingId: v.optional(v.id("listings")),
  },
  handler: async (ctx, { sellerId, listingId }) => {
    const user = await getAuthenticatedAppUser(ctx);
    if (!user) throw new Error("غير مصرح");

    if (listingId) {
      const existing = await ctx.db
        .query("conversations")
        .withIndex("listing_buyer", (q) =>
          q.eq("listingId", listingId).eq("buyerId", user._id)
        )
        .first();

      if (existing) return existing._id;
    }

    return await ctx.db.insert("conversations", {
      listingId,
      buyerId: user._id,
      sellerId,
      lastMessageAt: Date.now(),
      buyerUnread: 0,
      sellerUnread: 0,
    });
  },
});

export const getById = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, { conversationId }) => {
    const user = await getAuthenticatedAppUser(ctx);
    if (!user) return null;

    const conv = await ctx.db.get(conversationId);
    if (!conv) return null;
    if (conv.buyerId !== user._id && conv.sellerId !== user._id) return null;

    const otherId =
      conv.buyerId === user._id ? conv.sellerId : conv.buyerId;
    const otherUser = await ctx.db.get(otherId);
    const listing = conv.listingId
      ? await ctx.db.get(conv.listingId)
      : null;

    return { ...conv, otherUser, listing };
  },
});

export const markAsRead = mutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, { conversationId }) => {
    const user = await getAuthenticatedAppUser(ctx);
    if (!user) return;

    const conv = await ctx.db.get(conversationId);
    if (!conv) return;

    if (conv.buyerId === user._id) {
      await ctx.db.patch(conversationId, { buyerUnread: 0 });
    } else if (conv.sellerId === user._id) {
      await ctx.db.patch(conversationId, { sellerUnread: 0 });
    }
  },
});

export const getUnreadTotal = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedAppUser(ctx);
    if (!user) return 0;

    const asBuyer = await ctx.db
      .query("conversations")
      .withIndex("buyerId", (q) => q.eq("buyerId", user._id))
      .collect();

    const asSeller = await ctx.db
      .query("conversations")
      .withIndex("sellerId", (q) => q.eq("sellerId", user._id))
      .collect();

    let total = 0;
    for (const c of asBuyer) total += c.buyerUnread ?? 0;
    for (const c of asSeller) total += c.sellerUnread ?? 0;
    return total;
  },
});
