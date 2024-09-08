<template>
	<div>
		<UTable
			:rows="tasks"
			:columns="tasksColumns"
			:empty-state="{
				icon: 'i-heroicons-check',
				label: 'All done ☕️',
			}"
		>
			<template #done-data="{ row }">
				<UCheckbox v-model="row.done" @change="updateTask(row)" />
			</template>
			<template #name-data="{ row }"
				><span class="font-semibold">{{ row.name }}</span>
			</template>
			<template #assignee-data="{ row }">
				<span>{{ row.assignee[0]?.name }}</span>
			</template>
			<template #remove-data="{ row }">
				<UButton
					square
					icon="i-heroicons-trash"
					variant="ghost"
					@click="removeTask(row.id)"
				/>
			</template>
		</UTable>

		<tasks-create-modal
			:key="teamID"
			:collaborations="collaborations"
			@create="createTask"
			ref="createTaskModal"
		/>
	</div>
</template>
<script setup lang="ts">
import type { Task, Member } from "@/instant.schema.types";
const { db, tx, id } = useDB();

defineExpose({ createNewTask: showCreateModal });
const createTaskModal = ref<any>(null);

const props = defineProps({
	teamID: {
		type: String,
		required: true,
	},
});

// Data
const { data } = useQuery({
	teams: {
		$: {
			where: {
				id: props.teamID,
			},
		},
		collaborations: {
			member: {},
		},
		tasks: {
			assignee: {},
		},
	},
});

// Tasks
const tasks = computed((): Task[] => {
	if (!data.value || !data.value.teams.length || !data.value.teams[0].tasks) {
		return [];
	}
	const sorted = data.value.teams[0].tasks.sort(
		(a, b) => b.createdAt - a.createdAt,
	);

	return sorted;
});
const tasksColumns = [
	{
		key: "done",
		label: "Done",
	},
	{
		key: "name",
		label: "Name",
	},
	{
		key: "assignee",
		label: "Assignee",
	},
	{
		key: "remove",
		label: "",
	},
];

// Collaborations
const collaborations = computed((): Member[] => {
	if (
		!data.value ||
		!data.value.teams.length ||
		!data.value.teams[0].collaborations?.length
	) {
		return [];
	}

	const collab = data.value.teams[0].collaborations;
	const collabsWithMembers = collab.filter((c) => c.member?.length);
	const members = collabsWithMembers.map((c) => c.member![0]);
	return members;

	// return data.value.teams[0].collaborations;
});

// Open Create Modal
async function showCreateModal() {
	createTaskModal.value.openModal();
}

// Create Task
async function createTask(taskData: { name: string; assignee?: string }) {
	createTaskModal.value.closeModal();

	// New Task
	const newTask: Task = {
		id: id(),
		name: taskData.name,
		done: false,
		createdAt: Date.now(),
	};

	let txs = [tx.tasks[newTask.id].update(newTask).link({ team: props.teamID })];
	// let txs = [tx.tasks[newTask.id].update(newTask)];
	if (taskData.assignee) {
		txs.push(
			tx.tasks[newTask.id].link({
				assignee: taskData.assignee,
			}),
		);
	}
	try {
		await db.transact(txs);
	} catch (err) {
		console.log(err);
		toastError("Error creating task");
	}
}

async function updateTask(task: Task) {
	db.transact(tx.tasks[task.id].update({ done: task.done }));
}

async function removeTask(taskID: string) {
	db.transact(tx.tasks[taskID].delete());
}
</script>
