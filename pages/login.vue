<template>
	<div class="max-w-96 mx-auto pt-12 flex flex-col gap-12 h-full">
		<ds-h1 class="">Instant Tasks</ds-h1>
		<UCard>
			<template #header>
				<ds-h3>Login</ds-h3>
			</template>

			<div v-if="!user">
				<transition mode="out-in">
					<login-send-code
						v-model="email"
						:loading="loading"
						:errorMessage="errorMessage"
						@mailCode="mailCode"
						@enterCode="enterCode = true"
						v-if="!enterCode"
					/>

					<login-enterCode
						v-model="code"
						:email="email"
						:loading="loading"
						:errorMessage="errorMessage"
						@checkCode="checkCode"
						@enterEmail="enterCode = false"
						v-else="enterCode"
					/>
				</transition>
			</div>
			<div v-else class="flex flex-col gap-4">
				<p>Already logged in as {{ user.email }}</p>
				<UButton label="Sign out" @click="signOut" variant="outline" />
			</div>
		</UCard>
		<div class="mt-auto py-4">
			<UButton variant="link" label="Privacy policy" to="/privacy" />
			<UButton variant="link" label="Terms & Conditions" to="/terms" />
		</div>
	</div>
</template>
<script setup lang="ts">
import type { Member, Team } from "@/instant.schema.types";

const { db, tx, id } = useDB();

const { user, sendCode, signInWithCode, waitForAuth, signOut } = useAuth();
definePageMeta({
	layout: false,
});

const email = ref("");
const code = ref("");

const loading = ref(false);
const enterCode = ref(false);
const errorMessage = ref("");

async function mailCode(email: string) {
	// Süper basic validation
	if (!email) {
		errorMessage.value = "Please enter an email";
		return;
	}
	loading.value = true;

	// Send The Code
	const { error } = await sendCode(email);
	if (error) {
		errorMessage.value = error;
		return;
	}

	loading.value = false;
	enterCode.value = true;
	errorMessage.value = "";
}

async function checkCode({ code, email }: { code: string; email: string }) {
	// Süper basic validation
	if (!code) {
		errorMessage.value = "Please enter a code";
		return;
	}
	if (!email) {
		errorMessage.value = "Please enter an email";
		return;
	}
	loading.value = true;

	// Sign-in with Code
	const { error } = await signInWithCode(email, code);
	if (error) {
		errorMessage.value = error;
		loading.value = false;
		return;
	}

	// Wait for Authentication callback to set user
	await waitForAuth();
	if (!user.value) {
		errorMessage.value = "Something went wrong logging you in.";
		loading.value = false;
		return;
	}

	// Create the user in DB
	const { error: createError } = await createMember(
		user.value.id,
		user.value.email,
	);
	if (createError) {
		errorMessage.value = createError;
		loading.value = false;
		return;
	}
	loading.value = false;

	// Redirect to index
	navigateTo("/");
}

// Create the member function
async function createMember(
	userID: string,
	email: string,
): Promise<{ error: string | null }> {
	if (!userID || !email) return { error: null };

	// Let's check for existing member data
	const { data: existingMemberData, error: existingMemberError } =
		await useQueryOnce({
			members: {
				$: {
					where: {
						id: userID,
					},
				},
				teams: {},
			},
		});

	if (existingMemberError) {
		return { error: "Error fetching member data" };
	}

	// Does the member exist already?
	if (existingMemberData?.members[0]) {
		return { error: null };
	}

	// Doesn't exist yet, let's create one
	const member: Member = {
		id: userID,
		email: email,
		name: emailToName(email),
		avatar: "",
		createdAt: Date.now(),
	};

	// Default team if no team
	const team: Team = {
		id: id(),
		name: "Your first team",
		createdAt: Date.now(),
	};

	// Create the user in DB
	try {
		await db.transact([
			tx.members[member.id].update(member),
			// tx.teams[team.id].update(team).link({ members: member.id }),
		]);
	} catch (err: any) {
		console.log(err);
		return { error: err.message };
	}
	return { error: null };
}

// Helper func
function emailToName(email: string) {
	return email.split("@")[0];
}
</script>
