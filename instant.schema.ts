import "dotenv/config";
import { i } from "@instantdb/core";

const INSTANT_APP_ID = process.env.INSTANT_APP_ID as string;

const graph = i.graph(
	INSTANT_APP_ID,
	{
		tasks: i.entity({
			name: i.string(),
			done: i.boolean(),
			createdAt: i.number(),
		}),

		teams: i.entity({
			name: i.string(),
			createdAt: i.number(),
		}),

		collaborations: i.entity({
			email: i.string(),
			createdAt: i.number(),
		}),

		members: i.entity({
			name: i.string(),
			email: i.string().unique(),
			avatar: i.string(),
			createdAt: i.number(),
		}),
	},
	{
		teamsOwned: {
			forward: {
				on: "teams",
				has: "one",
				label: "owner",
			},
			reverse: {
				on: "members",
				has: "many",
				label: "teams_owned",
			},
		},

		teamCollaborations: {
			forward: {
				on: "teams",
				has: "many",
				label: "collaborations",
			},
			reverse: {
				on: "collaborations",
				has: "one",
				label: "team",
			},
		},

		collaborationMember: {
			forward: {
				on: "collaborations",
				has: "one",
				label: "member",
			},
			reverse: {
				on: "members",
				has: "many",
				label: "collaborations",
			},
		},

		taskTeams: {
			forward: {
				on: "tasks",
				has: "one",
				label: "team",
			},
			reverse: {
				on: "teams",
				has: "many",
				label: "tasks",
			},
		},

		// teamTasks: {
		// 	forward: {
		// 		on: "teams",
		// 		has: "many",
		// 		label: "tasks",
		// 	},
		// 	reverse: {
		// 		on: "tasks",
		// 		has: "one",
		// 		label: "team",
		// 	},
		// },
		/* 
			👆 Relationship writtent this way will not allow team collaborators to create tasks – as they don't have team update access. When creating tasks we link team-task . 
		*/

		taskMember: {
			forward: {
				on: "tasks",
				has: "one",
				label: "assignee",
			},
			reverse: {
				on: "members",
				has: "many",
				label: "tasks",
			},
		},
	},
);

export default graph;
