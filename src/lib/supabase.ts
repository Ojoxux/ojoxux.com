import { createClient } from "@supabase/supabase-js";

export function getSupabaseClient() {
	const supabaseUrl =
		process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
	if (!supabaseUrl) {
		throw new Error("Missing required environment variable: SUPABASE_URL");
	}
	const supabaseKey =
		process.env.SUPABASE_PUBLISHABLE_KEY ??
		process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
	if (!supabaseKey) {
		throw new Error(
			"Missing required environment variable: SUPABASE_PUBLISHABLE_KEY",
		);
	}

	return createClient(supabaseUrl, supabaseKey, {
		auth: {
			persistSession: false,
			autoRefreshToken: false,
		},
	});
}
