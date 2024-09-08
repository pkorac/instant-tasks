<template>
	<div class="flex flex-col gap-12">
		<ds-h1>Instant Tasks</ds-h1>

		<ds-surface v-if="teams.length" class="flex flex-col gap-6">
			<div class="flex justify-between gap-4">
				<!-- Team Selector -->
				<USelectMenu
					searchable
					searchable-placeholder="Find a team..."
					:search-attributes="['name']"
					clear-search-on-close
					class="grow max-w-md"
					placeholder="Select a team"
					size="lg"
					v-model="selectedTeamID"
					:options="teams"
					option-attribute="name"
					value-attribute="id"
				/>
				<UButton @click="createNewTask">Create Task <UKbd>C</UKbd></UButton>
			</div>

			<!-- Tasks Table -->
			<tasks
				:key="selectedTeamID"
				:teamID="selectedTeamID"
				ref="tasksComponent"
			/>
		</ds-surface>
	</div>
</template>
<script setup lang="ts">
import type { Team } from "@/instant.schema.types";
const { user } = useAuth();

const selectedTeamID = ref("");
const tasksComponent = ref<any>(null);

onMounted(() => {
	const lastSelected = localStorage.getItem("InstantTasks.selectedTeamID");
	if (lastSelected) {
		selectedTeamID.value = lastSelected;
	}
});
watch(selectedTeamID, (newVal) => {
	localStorage.setItem("InstantTasks.selectedTeamID", newVal);
});

const { data: teamData } = useQuery({
	// my stuff
	members: {
		$: {
			where: {
				id: user.value?.id,
			},
		},

		// teams I collaborate on
		collaborations: {
			$: {
				where: {
					email: user.value?.email,
				},
			},
			team: {},
		},
	},
});
const teams = computed(() => {
	let combined: Team[] = [];

	if (
		!teamData.value ||
		!teamData.value.members.length ||
		!teamData.value.members[0].collaborations?.length
	) {
		return combined;
	}

	const collaborations = teamData.value.members[0].collaborations.filter(
		(c) => c.team?.length,
	);
	let teams = collaborations.map((c) => {
		return c.team![0];
	});

	return teams;
});

function createNewTask() {
	tasksComponent.value.createNewTask();
}
defineShortcuts({
	c: {
		usingInput: false,
		handler: () => {
			createNewTask();
		},
	},
});
</script>
