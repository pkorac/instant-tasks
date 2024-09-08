import type { Ref, UnwrapRef } from "vue";

import type { Schema } from "@/instant.schema.types";

type QueryResult<T> = {
	[K in keyof T & keyof Schema]: Schema[K][];
};

export function useQuery<T extends Partial<Record<keyof Schema, object>>>(
	query: T,
) {
	const { db } = useDB();

	const data = ref<QueryResult<T> | null>(null) as Ref<UnwrapRef<
		QueryResult<T>
	> | null>;
	const error = ref<string | null>(null);
	const isLoading = ref(true);

	// No query no fun
	if (!query || Object.keys(query).length === 0) {
		error.value = "No query provided";
		return { data: data, error, isLoading: false };
	}

	// Subscribe to changes
	const unsubscribe = db.subscribeQuery(query, (res) => {
		if (res.error) {
			error.value = res.error.message;
			data.value = null;
		} else if (res.data) {
			error.value = null;
			data.value = res.data as UnwrapRef<QueryResult<T>>;
		}
		isLoading.value = false;
	});

	// Unsubscribe on unmount
	onUnmounted(() => unsubscribe());

	// Return data and error
	return { data, error, isLoading };
}
