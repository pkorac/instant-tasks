<template>
	<div class="flex flex-col gap-12">
		<ds-h1>Profile</ds-h1>

		<div class="max-w-sm">
			<!-- Logged in, let's display data -->
			<profile-member-data
				v-if="user && profile"
				:profile="profile"
				@signOut="signUserOut"
				@updateProfile="updateProfile"
			/>

			<!-- Not logged in, let's show login button -->
			<div v-else>
				<UAlert
					icon="i-heroicons-information-circle"
					variant="subtle"
					title="Logging in"
					description="If nothing loads for a while, go to login page."
					class="mb-4"
				/>
				<UButton
					label="Login"
					:to="config.public.instant.login"
					variant="outline"
				/>
			</div>
		</div>

		<UDivider />

		<ds-surface class="max-w-sm flex flex-col gap-6">
			<ds-h1>Build with Nuxt/Vue.js</ds-h1>
			<p>
				This is an example project built with
				<a
					class="hover:underline text-indigo-600"
					href="https://www.instantdb.com/"
					target="_blank"
					>InstantDB</a
				>
				and
				<a
					class="hover:underline text-indigo-600"
					href="https://nuxt.com/"
					target="_blank"
					>Nuxt</a
				>. I've built a set of Nuxt/Vue <strong>composables</strong>,
				<strong>middleware,</strong> <strong>utilities</strong> and other
				features that might one day become a fully featured
				<strong>Nuxt module.</strong>
			</p>
			<p>
				See the
				<a
					class="hover:underline text-indigo-600"
					href="https://github.com/pkorac/instant-tasks"
					target="_blank"
					>code repository</a
				>
				and grab any composables you need.
			</p>

			<!-- Privacy Policy -->
			<div class="mt-auto py-4">
				<UButton variant="link" label="Privacy policy" to="/privacy" />
				<UButton variant="link" label="Terms & Conditions" to="/terms" />
			</div>
		</ds-surface>
	</div>
</template>
<script setup lang="ts">
import type { Member } from "@/instant.schema.types";

const { user, signOut } = useAuth();
const { db, tx } = useDB();
const config = useRuntimeConfig();

// Get member info
const { data } = useQuery({
	members: {
		$: {
			where: {
				id: user.value?.id,
			},
		},
	},
});
const profile = computed((): Member | null => {
	if (!data.value) return null;
	return data.value?.members[0];
});

// Update profile
async function updateProfile({ name }: { name: string }) {
	if (!user.value || !name) return;
	try {
		db.transact(tx.members[user.value.id].update({ name }));
		toastSuccess("Profile updated");
	} catch (err: any) {
		console.log(err);
		toastError(err.message);
	}
}

// Signout
function signUserOut() {
	signOut();
}
</script>
