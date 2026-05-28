CREATE TABLE "battle_history" (
	"id" serial PRIMARY KEY,
	"character_id" integer NOT NULL,
	"monster_name" text NOT NULL,
	"result" text NOT NULL,
	"xp_gained" integer DEFAULT 0 NOT NULL,
	"gold_gained" integer DEFAULT 0 NOT NULL,
	"item_dropped" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "characters" (
	"id" serial PRIMARY KEY,
	"user_id" integer NOT NULL,
	"name" text NOT NULL UNIQUE,
	"class" text DEFAULT 'warrior' NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"xp" integer DEFAULT 0 NOT NULL,
	"gold" integer DEFAULT 100 NOT NULL,
	"reset_count" integer DEFAULT 0 NOT NULL,
	"map_id" integer DEFAULT 0 NOT NULL,
	"bonus_points" integer DEFAULT 0 NOT NULL,
	"stat_damage" integer DEFAULT 0 NOT NULL,
	"stat_defense" integer DEFAULT 0 NOT NULL,
	"stat_hp" integer DEFAULT 0 NOT NULL,
	"stat_speed" integer DEFAULT 0 NOT NULL,
	"stat_crit" integer DEFAULT 0 NOT NULL,
	"stat_luck" integer DEFAULT 0 NOT NULL,
	"current_hp" integer DEFAULT 100 NOT NULL,
	"max_hp" integer DEFAULT 100 NOT NULL,
	"last_online" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" serial PRIMARY KEY,
	"character_name" text NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"multiplier" integer DEFAULT 2 NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guild_members" (
	"id" serial PRIMARY KEY,
	"guild_id" integer NOT NULL,
	"character_id" integer NOT NULL UNIQUE,
	"joined_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "guilds" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL UNIQUE,
	"description" text DEFAULT '' NOT NULL,
	"leader_id" integer NOT NULL,
	"power" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "inventory_items" (
	"id" serial PRIMARY KEY,
	"character_id" integer NOT NULL,
	"item_data" text NOT NULL,
	"equipped" boolean DEFAULT false NOT NULL,
	"slot" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY,
	"username" text NOT NULL UNIQUE,
	"email" text NOT NULL UNIQUE,
	"password_hash" text NOT NULL,
	"password_salt" text NOT NULL,
	"session_token" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "battle_history" ADD CONSTRAINT "battle_history_character_id_characters_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id");--> statement-breakpoint
ALTER TABLE "characters" ADD CONSTRAINT "characters_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "guild_members" ADD CONSTRAINT "guild_members_guild_id_guilds_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id");--> statement-breakpoint
ALTER TABLE "guild_members" ADD CONSTRAINT "guild_members_character_id_characters_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id");--> statement-breakpoint
ALTER TABLE "guilds" ADD CONSTRAINT "guilds_leader_id_characters_id_fkey" FOREIGN KEY ("leader_id") REFERENCES "characters"("id");--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_character_id_characters_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id");