import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
    whatsapp: v.optional(v.string()),
    location: v.optional(v.string()),
    wilaya: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    role: v.union(v.literal("buyer"), v.literal("seller")),
    isVerifiedSeller: v.optional(v.boolean()),
  })
    .index("email", ["email"])
    .index("role", ["role"]),

  listings: defineTable({
    sellerId: v.id("users"),
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
    status: v.union(
      v.literal("active"),
      v.literal("sold"),
      v.literal("draft"),
      v.literal("archived")
    ),
    viewCount: v.optional(v.number()),
  })
    .index("sellerId", ["sellerId"])
    .index("category", ["category"])
    .index("status", ["status"])
    .index("category_status", ["category", "status"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["category", "status", "wilaya"],
    }),

  conversations: defineTable({
    listingId: v.optional(v.id("listings")),
    buyerId: v.id("users"),
    sellerId: v.id("users"),
    lastMessageAt: v.optional(v.number()),
    buyerUnread: v.optional(v.number()),
    sellerUnread: v.optional(v.number()),
  })
    .index("buyerId", ["buyerId"])
    .index("sellerId", ["sellerId"])
    .index("listing_buyer", ["listingId", "buyerId"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
    messageType: v.union(
      v.literal("text"),
      v.literal("image"),
      v.literal("offer")
    ),
  }).index("conversationId", ["conversationId"]),

  favorites: defineTable({
    userId: v.id("users"),
    listingId: v.id("listings"),
  }).index("userId_listing", ["userId", "listingId"]),

  reviews: defineTable({
    reviewerId: v.id("users"),
    sellerId: v.id("users"),
    rating: v.number(),
    comment: v.optional(v.string()),
  }).index("sellerId", ["sellerId"]),
});
