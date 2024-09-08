// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: "2024-04-03",
	devtools: { enabled: false },
	modules: ["@nuxt/ui"],

	ssr: false, // currently required for all the instant stuff to work

	runtimeConfig: {
		public: {
			// Instant Configuration
			instant: {
				appID: process.env.INSTANT_APP_ID as string,
				redirect: true,
				login: "/login",
				exclude: ["/confirm-oauth", "/404", "/public"],
				devtool: false,
			},
		},
	},

	app: {
		head: {
			title: "Instant Tasks - InstantDB Nuxt Example",
			meta: [
				{
					name: "description",
					content:
						"Collaborative task-management app example built with Nuxt and InstantDB with authentication, permissions and routing middleware.",
				},
			],
		},
	},

	css: ["~/assets/main.css"],
});
