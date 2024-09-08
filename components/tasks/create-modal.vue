<template>
	<UModal v-model="isOpen">
		<UCard>
			<template #header>
				<ds-h3>Create Task</ds-h3>
			</template>

			<form class="flex flex-col gap-4" @submit.prevent="create">
				<UInput
					placeholder="Build something awesome"
					size="lg"
					v-model="taskName"
				/>
				<USelectMenu
					searchable
					searchable-placeholder="Find member..."
					:search-attributes="['name']"
					clear-search-on-close
					placeholder="Select a member"
					size="lg"
					v-model="assignee"
					:options="collaborationsAndNull"
					option-attribute="name"
					value-attribute="id"
				/>
				<div class="flex gap-4">
					<UButton label="Create" @click="create" />
					<UButton label="Cancel" variant="outline" @click="isOpen = false" />
				</div>
			</form>
		</UCard>
	</UModal>
</template>
<script setup lang="ts">
import type { Member } from "@/instant.schema.types";
const isOpen = ref(false);
const props = defineProps<{
	collaborations: Member[];
}>();
const collaborationsAndNull = computed(() => {
	return [
		{
			id: "",
			name: "Anyone",
		},
		...props.collaborations,
	];
});

const emits = defineEmits(["create"]);
defineExpose({ openModal, closeModal });

const taskName = ref("");
const assignee = ref("");

function openModal() {
	taskName.value = "";
	assignee.value = "";
	isOpen.value = true;
}
function closeModal() {
	isOpen.value = false;
}

function create() {
	if (!taskName.value) {
		toastError("Please enter a task name");
		return;
	}
	if (!assignee.value) {
		emits("create", { name: taskName.value });
		return;
	}
	emits("create", { name: taskName.value, assignee: assignee.value });
}
</script>
