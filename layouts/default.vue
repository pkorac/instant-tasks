<template>
	<UContainer class="py-12 pb-36">
		<UHorizontalNavigation :links="links" class="mb-12" />
		<slot />
	</UContainer>
</template>
<script setup lang="ts">
const user = true;
const links = [
	[
		{
			label: "Tasks",
			to: "/",
			icon: "i-heroicons-squares-2x2",
		},
	],
	[
		{
			label: "My Teams",
			to: "/teams",
			icon: "i-heroicons-user-group",
		},
		{
			label: user ? "Profile" : "Login",
			to: user ? "/profile" : "/login",
			icon: "i-heroicons-user-circle",
		},
	],
];
</script>
