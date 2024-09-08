<template>
	<UModal v-model="isOpen">
		<UCard>
			<template #header>
				<ds-h3>Create Team</ds-h3>
			</template>
			<div class="flex flex-col gap-4">
				<UFormGroup label="Name" class="" size="lg">
					<UInput placeholder="Team name" v-model="newTeamName" />
				</UFormGroup>
				<ds-h4>Collaborators</ds-h4>
				<div class="flex flex-col gap-4">
					<UTable
						:rows="collaboratorsTableRows"
						:columns="columns"
						v-if="collaborators.size"
					>
						<template #remove-data="{ row }">
							<UButton
								square
								icon="i-heroicons-trash"
								variant="ghost"
								@click="removeCollaborator(row.email)"
							/>
						</template>
					</UTable>
					<form class="flex gap-4" @submit.prevent="addCollaborator">
						<UInput
							placeholder="someone@somewhere.com"
							type="email"
							class="grow"
							v-model="newCollaborator"
						/>
						<UButton label="Add" type="submit" />
					</form>
				</div>
			</div>
			<template #footer>
				<div class="flex gap-4">
					<UButton label="Create" @click="createTeam" />
					<UButton label="Cancel" @click="closeModal" variant="outline" />
				</div>
			</template>
		</UCard>
	</UModal>
</template>
<script setup lang="ts">
// UI Variables & Methods
const isOpen = ref(false);
function openModal() {
	newTeamName.value = "";
	collaborators.value.clear();
	isOpen.value = true;
}
function closeModal() {
	isOpen.value = false;
}
function clearFields() {
	newTeamName.value = "";
	collaborators.value.clear();
	closeModal();
}
defineExpose({ clearFields, openModal, closeModal });
const emit = defineEmits(["create"]);

// Data
const newTeamName = ref(`Team ${(Math.random() * 100).toFixed(0)}`);
const newCollaborator = ref("");

const collaborators = ref(new Set<string>());
const collaboratorsTableRows = computed(() => {
	const collaboratorsArray = Array.from(collaborators.value);
	return collaboratorsArray.map((email) => ({
		email,
	}));
});
const columns = ref([
	{
		key: "email",
		label: "Email",
	},
	{
		key: "remove",
		label: "",
	},
]);

// Add Collaborators
function addCollaborator() {
	collaborators.value.add(newCollaborator.value);
	newCollaborator.value = "";
}

// Remove Collaborators
function removeCollaborator(email: string) {
	collaborators.value.delete(email);
}

// Emit Create Team
async function createTeam() {
	if (!newTeamName.value) {
		toastError("Please enter a team name");
		return;
	}

	emit("create", {
		name: newTeamName.value,
		collaborators: Array.from(collaborators.value),
	});
}
</script>
