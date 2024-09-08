<template>
	<div class="flex flex-col gap-12">
		<!-- <pre>{{ teamData }}</pre> -->
		<!-- <UDivider /> -->
		<!-- <pre>{{ teams }}</pre> -->
		<!-- My teams -->
		<div>
			<ds-h1 class="mb-12">My Teams</ds-h1>
			<ds-surface>
				<div class="flex">
					<UButton @click="showCreateModal" class="ml-auto"
						>New Team <UKbd>C</UKbd></UButton
					>
				</div>
				<UTable
					:rows="teams.owned"
					:columns="teamsColumns"
					:empty-state="{
						icon: 'i-heroicons-circle-stack',
						label: 'No teams of your own yet. Create one ☝️',
					}"
				>
					<template #name-data="{ row }">
						<UButton
							size="sm"
							variant="link"
							:label="row.name"
							@click="showEditModal(row)"
						/>
					</template>
				</UTable>
			</ds-surface>
		</div>

		<!-- Collaborations -->
		<div v-if="teams.collaborations.length">
			<ds-h2 class="mb-12">Collaborations</ds-h2>
			<ds-surface>
				<UTable :rows="teams.collaborations" :columns="teamsColumns">
					<template #members-data="{ row }">
						<span>{{ row.members?.length + 1 || 1 }}</span>
					</template>
				</UTable>
			</ds-surface>
		</div>

		<!-- Create New Team Modal -->
		<teams-create-modal @create="createTeam" ref="createTeamModal" />

		<!-- Edit Team Modal -->
		<teams-edit-modal @update="updateTeam" ref="editModal" />
	</div>
</template>
<script setup lang="ts">
import type { Team, Collaboration } from "@/instant.schema.types";
const { user } = useAuth();
const { db, tx, id, lookup } = useDB();

//////////////////////////////////////////
// Get Data
const { data: teamData } = useQuery({
	// my stuff
	members: {
		$: {
			where: {
				id: user.value?.id,
			},
		},
		// teams I own
		teams_owned: {
			collaborations: {},
		},
		// teams I collaborate on
		collaborations: {
			$: {
				where: {
					email: user.value?.email,
				},
			},
			team: {
				collaborations: {},
			},
		},
	},
});

const teams = computed(() => {
	let combined = {
		owned: <Team[]>[],
		collaborations: <Team[]>[],
	};
	// No data no joy
	if (!user.value || !teamData.value || !teamData.value.members[0]) {
		return combined;
	}

	const td = teamData.value.members[0];

	// Owned Teams
	if (td.teams_owned && td.teams_owned.length) {
		const owned = td.teams_owned;
		combined.owned = owned;
	}
	combined.owned.sort((a, b) => a.name.localeCompare(b.name));

	// Collaborations
	if (td.collaborations && td.collaborations.length) {
		const collaborations = td.collaborations;
		const collaborationsTeams = collaborations.filter(
			(c) => c.team && c.team.length,
		);
		combined.collaborations = collaborationsTeams.map((c) => c.team![0]);
	}
	combined.collaborations.sort((a, b) => a.name.localeCompare(b.name));
	combined.collaborations = combined.collaborations.filter((c) => {
		if (combined.owned.find((o) => o.id === c.id)) return false;
		return true;
	});
	return combined;
});

const teamsColumns = ref([
	{
		key: "name",
		label: "Name",
	},
]);

//////////////////////////////////////////
// UI Variables & Modals
const createTeamModal = ref<any>(null);
const editModal = ref<any>(null);

// NuxtUI Shortcut (C)
defineShortcuts({
	c: {
		usingInput: false,
		handler: () => {
			showCreateModal();
		},
	},
});

// Show Create Modal
function showCreateModal() {
	createTeamModal.value.openModal();
}

// Create Team
async function createTeam(teamData: { name: string; collaborators: string[] }) {
	if (!user.value) {
		toastError("Please login to create a team");
		return;
	}

	// New Team
	const newTeam: Team = {
		id: id(),
		name: teamData.name,
		createdAt: Date.now(),
	};
	const ownerCollaboration: Collaboration = {
		id: id(),
		email: user.value.email,
		createdAt: Date.now(),
	};

	// Transactions
	try {
		await db.transact([
			tx.teams[newTeam.id].update(newTeam).link({ owner: [user.value.id] }),
			tx.collaborations[ownerCollaboration.id]
				.update(ownerCollaboration)
				.link({ team: newTeam.id })
				.link({ member: user.value.id }),
		]);
	} catch (err) {
		console.log(err);
		toastError("Error creating team");
		return;
	}

	// Add Collaborators
	teamData.collaborators.forEach(async (email) => {
		const newCollaboration: Collaboration = {
			id: id(),
			email,
			createdAt: Date.now(),
		};

		const collaborationTX = tx.collaborations[newCollaboration.id]
			.update(newCollaboration)
			.link({ team: newTeam.id })
			.link({ member: lookup("email", email) });

		try {
			await db.transact([
				collaborationTX,
				tx.teams[newTeam.id].link({ collaborations: newCollaboration.id }),
			]);
		} catch (err) {
			console.log(err);
			toastError(
				`Error: ${email} isn't registered yet. Ask them to sign-up first.`,
			);
		}
	});

	// Close modal + Clear fields
	createTeamModal.value.closeModal();
}

// Show Edit Modal
function showEditModal(teamData: any) {
	editModal.value.openModal(teamData);
}

// Update team
async function updateTeam(update: {
	id: string;
	name: string;
	memberEmailsToAdd: string[];
	collaborationIDsToRemove: string[];
}) {
	// Transactions
	let txs = [];

	// Update name
	txs.push(tx.teams[update.id].update({ name: update.name }));

	// Remove Collaborations
	update.collaborationIDsToRemove.forEach((cid) => {
		txs.push(tx.collaborations[cid].delete());
	});
	try {
		await db.transact(txs);
	} catch (err) {
		console.log(err);
		toastError("Error updating team");
		return;
	}

	// Try to add+connect new members if they exist
	update.memberEmailsToAdd.forEach(async (email) => {
		if (user.value?.email === email) return;
		const { data: existing, error: existingError } = await useQueryOnce({
			collaborations: {
				$: {
					where: {
						email: email,
					},
				},
				team: {
					$: {
						where: {
							id: update.id,
						},
					},
				},
			},
		});
		if (existingError) {
			console.log(existingError);
			toastError("Error Addign Collaborators");
			return;
		}
		if (
			existing?.collaborations.length &&
			existing.collaborations[0].team?.length
		) {
			// console.log("Already linked");
			return;
		}

		const newCollaboration: Collaboration = {
			id: id(),
			email,
			createdAt: Date.now(),
		};
		const collaborationTX = tx.collaborations[newCollaboration.id]
			.update(newCollaboration)
			.link({ team: update.id })
			.link({ member: lookup("email", email) });

		try {
			await db.transact(collaborationTX);
		} catch (err) {
			console.log(err);
			toastError(
				`Error: ${email} isn't registered yet. Ask them to sign-up first.`,
			);
		}
	});

	editModal.value.closeModal();
}
</script>
