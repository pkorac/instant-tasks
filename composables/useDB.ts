import { init, tx, id, InstantClient, lookup } from "@instantdb/core";

// Schema Typescript Types
// !Not the same as schema as code!
import type { Schema } from "@/instant.schema.types";

let db: InstantClient<Schema>;

export const useDB = () => {
	// Nuxt Config
	const config = useRuntimeConfig();
	const APP_ID = config.public.instant.appID;
	const DEVTOOL = config.public.instant.devtool;

	// Initialise DB just once
	function initDB() {
		if (db) return;
		db = init<Schema>({ appId: APP_ID, devtool: DEVTOOL });
	}
	initDB();

	// Add Record Wrapper
	async function addRecord(table: string, data: any) {
		if (!data || !table) throw new Error("No data or table");
		try {
			await db.transact(tx[table][data.id ? data.id : id()].update(data));
			return { error: null };
		} catch (err: any) {
			return { error: err.message };
		}
	}

	// Remove Record Wrapper
	async function removeRecord(table: string, id: string) {
		if (!id || !table) throw new Error("No id or table");
		try {
			await db.transact(tx[table][id].delete());
			return { error: null };
		} catch (err: any) {
			return { error: err.message };
		}
	}

	return {
		db,
		tx,
		id,
		lookup,
		addRecord,
		removeRecord,
	};
};
