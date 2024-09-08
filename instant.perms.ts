export default {
	tasks: {
		bind: ["loggedIn", "auth.id != null"],
		allow: {
			view: "loggedIn",
			create: "loggedIn",
			delete: "loggedIn",
			update: "loggedIn",
		},
	},
	teams: {
		bind: [
			"isCollaborator",
			"auth.email in data.ref('collaborations.email')",
			"isOwner",
			"auth.id in data.ref('owner.id')",
		],
		allow: {
			view: "isOwner || isCollaborator",
			create: "isOwner",
			delete: "isOwner",
			update: "isOwner",
		},
	},
	members: {
		bind: [
			"theUser",
			"auth.id == data.id",
			"sameTeam",
			"auth.email in data.ref('collaborations.team.collaborations.email')",
		],
		allow: {
			view: "theUser || sameTeam",
			create: "theUser",
			delete: "theUser",
			update: "theUser",
		},
	},
	collaborations: {
		bind: [
			"isCollaborator",
			"auth.email in data.ref('team.collaborations.email')",
			"isTeamOwner",
			"auth.id in data.ref('team.owner.id')",
		],
		allow: {
			view: "isTeamOwner || isCollaborator",
			create: "isTeamOwner",
			delete: "isTeamOwner",
			update: "isTeamOwner",
		},
	},
};
