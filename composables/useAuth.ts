import type { User } from "@instantdb/core";

// Reactive User
const user = ref<User | null>(null);

let listener: null | any = null;
const isAuthReady = ref(false);

export const useAuth = () => {
	const config = useRuntimeConfig();
	const { db } = useDB();

	// Setup the listener (only once)
	if (!listener) {
		listener = db.subscribeAuth((auth) => {
			if (auth.error) {
				// error
				// console.log("auth error", auth.error);
			} else if (auth.user) {
				// login
				// console.log("Auth user", auth.user);
				user.value = auth.user;
			} else {
				// logout
				// console.log("Auth logged out");
				user.value = null;
			}
			isAuthReady.value = true;
		});
	}

	// Wait for auth – middleware/login/user race condition
	async function waitForAuth() {
		return new Promise<void>((resolve) => {
			if (isAuthReady.value) {
				resolve();
			} else {
				watch(isAuthReady, () => {
					if (isAuthReady.value) {
						resolve();
					}
				});
			}
		});
	}

	// Send the code
	async function sendCode(email: string) {
		try {
			await db.auth.sendMagicCode({ email });
			return { error: null };
		} catch (err: any) {
			return { error: err.body?.message as string };
		}
	}

	// Verify and Signin with Code
	async function signInWithCode(email: string, code: string) {
		isAuthReady.value = false;
		try {
			await db.auth.signInWithMagicCode({ email, code });
			return { error: null };
		} catch (err: any) {
			return { error: err.body?.message as string };
		}
	}

	// Logout
	function signOut() {
		isAuthReady.value = true;
		db.auth.signOut();
		navigateTo(config.public.instant.login);
	}

	return {
		user: readonly(user),
		signOut,
		sendCode,
		signInWithCode,
		waitForAuth,
	};
};
