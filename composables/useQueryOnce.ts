import type { Schema } from "@/instant.schema.types";

type QueryResult<T> = {
	[K in keyof T & keyof Schema]: Schema[K][];
};

type QueryResponse<T> = {
	data: QueryResult<T> | null;
	error: string | null;
};

// One of query
// Subscribes, then unsubscribes
export async function useQueryOnce<
	T extends Partial<Record<keyof Schema, object>>,
>(query: T): Promise<QueryResponse<T>> {
	const { db } = useDB();

	return new Promise((resolve) => {
		const unsubscribe = db.subscribeQuery(query, (res) => {
			if (res.error) {
				setTimeout(() => {
					unsubscribe();
				}, 1);
				resolve({ data: null, error: res.error.message });
			}
			const data = res.data as QueryResult<T>;
			setTimeout(() => {
				unsubscribe();
			}, 1);
			resolve({ data: data, error: null });
		});
	});
}
