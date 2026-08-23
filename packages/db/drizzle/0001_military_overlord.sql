ALTER TABLE "generation_runs" ADD COLUMN "kind" text DEFAULT 'brief' NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "parent_project_id" uuid;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "fork_mode" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "fork_source_run_id" uuid;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_parent_project_id_projects_id_fk" FOREIGN KEY ("parent_project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "projects_parent_project_id_idx" ON "projects" USING btree ("parent_project_id");--> statement-breakpoint
CREATE UNIQUE INDEX "projects_fork_source_run_mode_idx" ON "projects" USING btree ("fork_source_run_id","fork_mode") WHERE "projects"."fork_source_run_id" is not null;--> statement-breakpoint
ALTER TABLE "generation_runs" ADD CONSTRAINT "generation_runs_kind_check" CHECK ("generation_runs"."kind" in ('brief', 'exploration', 'fork-expansion'));--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_fork_mode_check" CHECK ("projects"."fork_mode" is null or "projects"."fork_mode" in ('safer', 'bolder', 'stranger'));