ALTER TABLE "shadcn_clients" ADD COLUMN "user_id" varchar(128);--> statement-breakpoint
ALTER TABLE "shadcn_bookings" ADD COLUMN "user_id" varchar(128);--> statement-breakpoint
ALTER TABLE "shadcn_settings" ADD COLUMN "user_id" varchar(128);--> statement-breakpoint
CREATE INDEX "clients_user_id_idx" ON "shadcn_clients" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "bookings_user_id_idx" ON "shadcn_bookings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "bookings_user_id_client_id_idx" ON "shadcn_bookings" USING btree ("user_id","client_id");
