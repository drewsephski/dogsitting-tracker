CREATE TABLE "shadcn_bookings" (
	"id" varchar(30) PRIMARY KEY NOT NULL,
	"client_id" varchar(30) NOT NULL,
	"service_type" varchar(30) NOT NULL,
	"start_at" timestamp NOT NULL,
	"end_at" timestamp NOT NULL,
	"nights" integer,
	"calendar_days" integer,
	"care_hours" real,
	"revenue" real NOT NULL,
	"notes" text,
	"status" varchar(30) DEFAULT 'completed' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT current_timestamp
);
--> statement-breakpoint
CREATE TABLE "shadcn_clients" (
	"id" varchar(30) PRIMARY KEY NOT NULL,
	"dog_name" varchar(128) NOT NULL,
	"owner_name" varchar(128),
	"contact_email" varchar(256),
	"contact_phone" varchar(32),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT current_timestamp
);
--> statement-breakpoint
CREATE TABLE "shadcn_settings" (
	"id" varchar(30) PRIMARY KEY DEFAULT 'default' NOT NULL,
	"monthly_income_goal" real DEFAULT 0 NOT NULL,
	"monthly_expenses" real DEFAULT 0 NOT NULL,
	"move_out_savings_target" real DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT current_timestamp
);
--> statement-breakpoint
CREATE TABLE "shadcn_tasks" (
	"id" varchar(30) PRIMARY KEY NOT NULL,
	"code" varchar(128) NOT NULL,
	"title" varchar(128),
	"status" varchar(30) DEFAULT 'todo' NOT NULL,
	"label" varchar(30) DEFAULT 'bug' NOT NULL,
	"priority" varchar(30) DEFAULT 'low' NOT NULL,
	"estimated_hours" real DEFAULT 0 NOT NULL,
	"archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT current_timestamp,
	CONSTRAINT "shadcn_tasks_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "shadcn_bookings" ADD CONSTRAINT "shadcn_bookings_client_id_shadcn_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."shadcn_clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bookings_client_id_idx" ON "shadcn_bookings" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "bookings_start_at_idx" ON "shadcn_bookings" USING btree ("start_at");