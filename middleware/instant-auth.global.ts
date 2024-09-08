export default defineNuxtRouteMiddleware(async (to, from) => {
	const config = useRuntimeConfig();
	const { user, waitForAuth } = useAuth();

	await waitForAuth(); // deal with race condition (see docs)

	// Redirect to login if not logged in
	if (config.public.instant.redirect) {
		// Public URLs we shouldn't check
		const urlsToExclude = [
			config.public.instant.login,
			...config.public.instant.exclude,
		];
		if (urlsToExclude.includes(to.path)) return;

		// If we're not on login page
		if (to.path !== config.public.instant.login) {
			// If not logged in, redirect
			if (!user.value) {
				return navigateTo(config.public.instant.login);
			}
		}
	}
});
