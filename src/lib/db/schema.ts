import { pgTable, text, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";

export const analysisRuns = pgTable("analysis_runs", {
  id: text("id").primaryKey(),
  userQuery: text("user_query"),
  workflow: text("workflow").notNull(),
  symbol: text("symbol"),
  timeframe: text("timeframe"),
  model: text("model"),
  status: text("status").notNull(),
  latencyMs: integer("latency_ms"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const toolCalls = pgTable("tool_calls", {
  id: text("id").primaryKey(),
  analysisRunId: text("analysis_run_id").notNull(),
  toolName: text("tool_name").notNull(),
  inputJson: jsonb("input_json"),
  outputJson: jsonb("output_json"),
  latencyMs: integer("latency_ms"),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const analysisResults = pgTable("analysis_results", {
  id: text("id").primaryKey(),
  analysisRunId: text("analysis_run_id").notNull(),
  marketContextJson: jsonb("market_context_json"),
  indicatorContextJson: jsonb("indicator_context_json"),
  signalContextJson: jsonb("signal_context_json"),
  aiOutputJson: jsonb("ai_output_json"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const feedback = pgTable("feedback", {
  id: text("id").primaryKey(),
  analysisRunId: text("analysis_run_id").notNull(),
  helpful: boolean("helpful"),
  rating: integer("rating"),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
