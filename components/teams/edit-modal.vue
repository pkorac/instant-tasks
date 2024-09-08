<template>
	<UModal v-model="isOpen">
		<UCard>
			<!-- Header -->
			<template #header>
				<ds-h3>Edit Team</ds-h3>
			</template>

			<div class="flex flex-col gap-4" v-if="team">
				<!-- Team Name -->
				<ds-h4>Team Name</ds-h4>
				<UInput placeholder="Team name" v-model="team.name" class="mb-6" />

				<!-- Members -->
				<ds-h4>Add members</ds-h4>
				<div>
					<form class="flex gap-4" @submit.prevent="addMember">
						<UInput
							placeholder="someone@somewhere.com"
							type="email"
							class="grow"
							v-model="newMemberEmail"
						/>
						<UButton label="Add" type="submit" />
					</form>
				</div>
				<UTable
					:rows="membersForTable"
					:columns="membersColumns"
					v-if="membersForTable.length > 0"
				>
					<template #email-data="{ row }">
						<span>{{ row.email }}</span>
					</template>
					<template #remove-data="{ row }">
						<UButton
							square
							icon="i-heroicons-trash"
							variant="ghost"
							@click="removeMember(row.email)"
							v-if="!isMe(row.email)"
						/>
					</template>
				</UTable>
			</div>

			<!-- Footer -->
			<template #footer>
				<div class="flex gap-4">
					<UButton label="Update" @click="emitUpdate" />
					<UButton label="Cancel" @click="closeModal" variant="outline" />
				</div>
			</template>
		</UCard>
	</UModal>
</template>
<script setup lang="ts">
const { user } = useAuth();
import type { Team } from "@/instant.schema.types";
const emit = defineEmits(["update"]);
defineExpose({ openModal, closeModal });

// Data
let originalData: Team | null = null;
const team = ref<Team | null>(null);
const members = ref<Set<string>>(new Set());
const newMemberEmail = ref("");

// UI Variables & Methods
const isOpen = ref(false);
const membersColumns = ref([
	{
		key: "email",
		label: "Email",
	},
	{
		key: "remove",
		label: "",
	},
]);
const membersForTable = computed(() => {
	let mems: { email: string }[] = [];
	members.value.forEach((m) => {
		mems.push({ email: m });
	});
	return mems;
});

function isMe(email: string) {
	if (user.value?.email && user.value.email === email) return true;
	return false;
}

// Modal Operations
function openModal(teamData: Team) {
	isOpen.value = true;

	originalData = JSON.parse(JSON.stringify(teamData)); // store a copy
	team.value = JSON.parse(JSON.stringify(teamData)); // store a copy
	members.value = new Set();

	if (teamData.collaborations) {
		teamData.collaborations.forEach((collaboration) => {
			members.value.add(collaboration.email);
		});
	}
}
function closeModal() {
	isOpen.value = false;
}

// Updating
function addMember() {
	if (newMemberEmail.value.length < 4) return;
	if (user.value) {
		if (user.value.email === newMemberEmail.value) return; // let's not add ourselves
	}
	members.value.add(newMemberEmail.value);
	newMemberEmail.value = "";
}

function removeMember(email: string) {
	members.value.delete(email);
}

function emitUpdate() {
	if (!team.value || !originalData) return;

	const updatedName = team.value.name;

	const oldMembers = originalData.collaborations;
	let memberEmailsToAdd: string[] = [];
	let collaborationIDsToRemove: string[] = [];

	if (!oldMembers || oldMembers.length === 0) {
		// No old members before, just add what we have now
		memberEmailsToAdd = Array.from(members.value);
	} else {
		// Add members we didn't have before
		members.value.forEach((m) => {
			if (!oldMembers.find((om) => om.email === m)) {
				memberEmailsToAdd.push(m);
			}
		});

		// Remove members we had, but have removed now
		oldMembers.forEach((om) => {
			if (!members.value.has(om.email)) {
				collaborationIDsToRemove.push(om.id);
			}
		});
	}

	emit("update", {
		id: team.value.id,
		name: updatedName,
		memberEmailsToAdd,
		collaborationIDsToRemove,
	});
}
</script>
