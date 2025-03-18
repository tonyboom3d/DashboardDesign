import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const shippingBarSettings = pgTable("shipping_bar_settings", {
  id: serial("id").primaryKey(),
  instanceId: text("instance_id").notNull().unique(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  enabled: boolean("enabled").default(true).notNull(),
  threshold: integer("threshold").default(5000).notNull(), // Stored in cents
  currencySymbol: text("currency_symbol").default("$").notNull(),
  currencyCode: text("currency_code").default("USD").notNull(),
  productSuggestionMethod: text("product_suggestion_method").default("manual").notNull(),
  barStyle: text("bar_style").default("simple").notNull(),
  colors: jsonb("colors").notNull(),
  border: jsonb("border").notNull(),
  progressBarBorder: jsonb("progress_bar_border").notNull(),
  text: jsonb("text").notNull(),
  textAlignment: text("text_alignment").default("left").notNull(),
  textDirection: text("text_direction").default("ltr").notNull(),
  icon: jsonb("icon").notNull(),
  visibility: jsonb("visibility").notNull(),
  position: text("position").default("top").notNull(),
  recommendedProducts: jsonb("recommended_products").default([]).notNull(),
  analytics: jsonb("analytics").default({
    viewCount: 0,
    conversionRate: "0%",
    aov: "$0.00"
  }).notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const defaultShippingBarSettings = {
  enabled: true,
  threshold: 5000, // $50.00 in cents
  currencySymbol: "$",
  currencyCode: "USD",
  productSuggestionMethod: "manual",
  barStyle: "simple",
  colors: {
    backgroundColor: "#FFFFFF",
    bar: "#0070F3",
    progressBg: "#E5E7EB",
    text: "#111827",
    accent: "#10B981",
    highlight: "#F59E0B",
    gradientEnd: "#10B981" // Adding a secondary color for gradient
  },
  border: {
    color: "#E5E7EB",
    thickness: 1
  },
  progressBarBorder: {
    color: "#0070F3",
    thickness: 1
  },
  text: {
    barText: "Add ${remaining} more to get FREE shipping!",
    successText: "Congratulations! You've qualified for FREE shipping!",
    buttonText: "Add to Cart",
    initialText: "Start shopping to get FREE shipping!",
    showInitialText: true
  },
  textAlignment: "left",
  textDirection: "ltr",
  icon: {
    type: "emoji",
    selection: "🚚",
    position: "before"
  },
  visibility: {
    productPage: { desktop: true, mobile: true },
    cartPage: { desktop: true, mobile: true },
    miniCart: { desktop: true, mobile: true },
    header: { desktop: false, mobile: false }
  },
  position: "top",
  recommendedProducts: [],
  analytics: {
    viewCount: 0,
    conversionRate: "0%",
    aov: "$0.00"
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const insertShippingBarSettingsSchema = createInsertSchema(shippingBarSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateShippingBarSettingsSchema = insertShippingBarSettingsSchema.partial().extend({
  instanceId: z.string(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type ShippingBarSettings = typeof shippingBarSettings.$inferSelect;
export type InsertShippingBarSettings = z.infer<typeof insertShippingBarSettingsSchema>;
export type UpdateShippingBarSettings = z.infer<typeof updateShippingBarSettingsSchema>;
