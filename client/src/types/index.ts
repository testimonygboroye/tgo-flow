export interface User {
  id: string;
  name: string;
  email: string;
}

export type MembershipRole = 'owner' | 'admin' | 'member';

export interface Workspace {
  _id: string;
  name: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMembership {
  workspace: Workspace;
  role: MembershipRole;
}

export interface Board {
  _id: string;
  workspace: string;
  name: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface List {
  _id: string;
  board: string;
  name: string;
  position: number;
}

export interface Task {
  _id: string;
  list: string;
  board: string;
  title: string;
  description: string;
  position: number;
  assignees: User[];
  labels: string[];
  dueDate: string | null;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  task: string;
  author: User;
  body: string;
  createdAt: string;
}

export interface Member {
  membershipId: string;
  user: User;
  role: MembershipRole;
}
