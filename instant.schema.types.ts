export type Task = {
	id: string;
	name: string;
	done: boolean;
	createdAt: number;
	team?: Team[];
	assignee?: Member[];
};

export type Team = {
	id: string;
	name: string;
	createdAt: number;
	collaborations?: Collaboration[];
	owner?: Member[];
	tasks?: Task[];
};

export type Collaboration = {
	id: string;
	email: string;
	createdAt: number;
	team?: Team[];
	member?: Member[];
};

export type Member = {
	id: string;
	name: string;
	email: string;
	avatar: string;
	createdAt: number;
	collaborations?: Collaboration[];
	teams_owned?: Team[];
	tasks?: Task[];
};

export type Schema = {
	tasks: Task;
	teams: Team;
	members: Member;
	collaborations: Collaboration;
};
