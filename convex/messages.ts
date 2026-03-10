import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedAppUser } from "./auth";

export const listByConversation = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, { conversationId }) => {
    const user = await getAuthenticatedAppUser(ctx);
    if (!user) return [];

    const conv = await ctx.db.get(conversationId);
    if (!conv) return [];
    if (conv.buyerId !== user._id && conv.sellerId !== user._id) return [];

    return await ctx.db
      .query("messages")
      .withIndex("conversationId", (q) =>
        q.eq("conversationId", conversationId)
      )
      .order("asc")
      .collect();
  },
});

export const send = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
    messageType: v.union(
      v.literal("text"),
      v.literal("image"),
      v.literal("offer")
    ),
  },
  handler: async (ctx, { conversationId, content, messageType }) => {
    const user = await getAuthenticatedAppUser(ctx);
    if (!user) throw new Error("غير مصرح");

    const conv = await ctx.db.get(conversationId);
    if (!conv) throw new Error("المحادثة غير موجودة");
    if (conv.buyerId !== user._id && conv.sellerId !== user._id)
      throw new Error("غير مصرح");

    await ctx.db.insert("messages", {
      conversationId,
      senderId: user._id,
      content,
      messageType,
    });

    const updates: Record<string, unknown> = { lastMessageAt: Date.now() };
    if (user._id === conv.buyerId) {
      updates.sellerUnread = (conv.sellerUnread ?? 0) + 1;
    } else {
      updates.buyerUnread = (conv.buyerUnread ?? 0) + 1;
    }
    await ctx.db.patch(conversationId, updates);
  },
});
