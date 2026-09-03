CREATE TABLE "analysis_results" (
	"id" text PRIMARY KEY NOT NULL,
	"analysis_run_id" text NOT NULL,
	"market_context_json" jsonb,
	"indicator_context_json" jsonb,
	"signal_context_json" jsonb,
	"ai_output_json" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analysis_runs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_query" text,
	"workflow" text NOT NULL,
	"symbol" text,
	"timeframe" text,
	"model" text,
	"status" text NOT NULL,
	"latency_ms" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" text PRIMARY KEY NOT NULL,
	"analysis_run_id" text NOT NULL,
	"helpful" boolean,
	"rating" integer,
	"comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tool_calls" (
	"id" text PRIMARY KEY NOT NULL,
	"analysis_run_id" text NOT NULL,
	"tool_name" text NOT NULL,
	"input_json" jsonb,
	"output_json" jsonb,
	"latency_ms" integer,
	"status" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "analysis_results" ADD CONSTRAINT "analysis_results_analysis_run_id_analysis_runs_id_fk" FOREIGN KEY ("analysis_run_id") REFERENCES "public"."analysis_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_analysis_run_id_analysis_runs_id_fk" FOREIGN KEY ("analysis_run_id") REFERENCES "public"."analysis_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tool_calls" ADD CONSTRAINT "tool_calls_analysis_run_id_analysis_runs_id_fk" FOREIGN KEY ("analysis_run_id") REFERENCES "public"."analysis_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "analysis_results_run_idx" ON "analysis_results" USING btree ("analysis_run_id");--> statement-breakpoint
CREATE INDEX "analysis_runs_created_at_idx" ON "analysis_runs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "feedback_run_idx" ON "feedback" USING btree ("analysis_run_id");--> statement-breakpoint
CREATE INDEX "tool_calls_run_idx" ON "tool_calls" USING btree ("analysis_run_id");