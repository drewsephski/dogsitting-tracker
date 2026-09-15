ALTER TABLE "shadcn_clients" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "shadcn_bookings" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "shadcn_settings" DROP CONSTRAINT "shadcn_settings_pkey";--> statement-breakpoint
ALTER TABLE "shadcn_settings" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "shadcn_settings" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "shadcn_settings" ADD CONSTRAINT "shadcn_settings_pkey" PRIMARY KEY ("user_id");
