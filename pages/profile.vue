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
