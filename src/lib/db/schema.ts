import { pgTable, text, timestamp, integer, boolean, jsonb, index } from "drizzle-orm/pg-core";

export const analysisRuns = pgTable(
  "analysis_runs",
  {
    id: text("id").primaryKey(),
    userQuery: text("user_query"),
    workflow: text("workflow").notNull(),
    symbol: text("symbol"),
    timeframe: text("timeframe"),
    model: text("model"),
    status: text("status").notNull(),
    latencyMs: integer("latency_ms"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("analysis_runs_created_at_idx").on(table.createdAt)],
);

export const toolCalls = pgTable(
  "tool_calls",
  {
    id: text("id").primaryKey(),
    analysisRunId: text("analysis_run_id")
      .notNull()
      .references(() => analysisRuns.id, { onDelete: "cascade" }),
    toolName: text("tool_name").notNull(),
    inputJson: jsonb("input_json"),
    outputJson: jsonb("output_json"),
    latencyMs: integer("latency_ms"),
    status: text("status").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("tool_calls_run_idx").on(table.analysisRunId)],
);

export const analysisResults = pgTable(
  "analysis_results",
  {
    id: text("id").primaryKey(),
    analysisRunId: text("analysis_run_id")
      .notNull()
      .references(() => analysisRuns.id, { onDelete: "cascade" }),
    marketContextJson: jsonb("market_context_json"),
    indicatorContextJson: jsonb("indicator_context_json"),
    signalContextJson: jsonb("signal_context_json"),
    aiOutputJson: jsonb("ai_output_json"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("analysis_results_run_idx").on(table.analysisRunId)],
);

export const feedback = pgTable(
  "feedback",
  {
    id: text("id").primaryKey(),
    analysisRunId: text("analysis_run_id")
      .notNull()
      .references(() => analysisRuns.id, { onDelete: "cascade" }),
    helpful: boolean("helpful"),
    rating: integer("rating"),
    comment: text("comment"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("feedback_run_idx").on(table.analysisRunId)],
);
