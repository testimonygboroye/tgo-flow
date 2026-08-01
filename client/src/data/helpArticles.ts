export interface HelpArticle {
  id: string;
  category: string;
  title: string;
  keywords: string[];
  content: string;
}

export const helpArticles: HelpArticle[] = [
  {
    id: 'what-is-tgo-flow',
    category: 'Getting Started',
    title: 'What is TGO Flow?',
    keywords: ['what', 'about', 'overview', 'intro', 'tgo flow'],
    content: 'TGO Flow helps teams organize work using boards. Each board has columns (lists) like "To Do," "In Progress," and "Done." You create tasks, move them across columns as work progresses, assign people, and see updates live as your team works.',
  },
  {
    id: 'create-account',
    category: 'Getting Started',
    title: 'How to create an account',
    keywords: ['register', 'sign up', 'account', 'create account', 'new user'],
    content: 'Click "Sign up" on the login page. Enter your full name, a real email address, and a password (at least 8 characters, with one number). Confirm the password by typing it again. Click "Create account." You will be taken straight into the app.',
  },
  {
    id: 'login-logout',
    category: 'Getting Started',
    title: 'How to log in and log out',
    keywords: ['login', 'log in', 'logout', 'log out', 'sign in'],
    content: 'To log in, enter your email and password on the login page and click "Log in." To log out, click the "Log out" button at the top of your dashboard. You will be asked to confirm before you are logged out.',
  },
  {
    id: 'forgot-password',
    category: 'Getting Started',
    title: 'How to reset a forgotten password',
    keywords: ['forgot password', 'reset password', 'change password', 'lost password'],
    content: 'On the login page, click "Forgot password?" Enter your email and click "Send reset link." Check your email inbox (and spam folder) for a message from TGO Flow, and click the reset button inside it. Type your new password twice to confirm, then submit. Your old password will no longer work.',
  },
  {
    id: 'dark-light-mode',
    category: 'Getting Started',
    title: 'How to switch between dark mode and light mode',
    keywords: ['dark mode', 'light mode', 'theme', 'toggle', 'appearance'],
    content: 'Click the small switch at the top of any page (it shows a sun or moon icon). This instantly switches the whole app between light and dark themes. Your choice is remembered the next time you visit.',
  },
  {
    id: 'create-workspace',
    category: 'Workspaces',
    title: 'How to create a workspace',
    keywords: ['create workspace', 'new workspace', 'workspace'],
    content: 'On your Dashboard, click "+ New workspace." Type a name for your team or project and click "Create." You automatically become the "owner" of any workspace you create.',
  },
  {
    id: 'workspace-vs-board',
    category: 'Workspaces',
    title: "What's the difference between a workspace and a board?",
    keywords: ['workspace vs board', 'difference', 'workspace', 'board'],
    content: 'A workspace is your overall private space for a team or client — it holds your members, roles, and settings. A board lives inside a workspace and represents one specific project or piece of work, with its own columns and tasks. One workspace can contain many boards. Think of a workspace as a company, and each board as one of its projects.',
  },
  {
    id: 'rename-delete-workspace',
    category: 'Workspaces',
    title: 'How to rename or delete a workspace',
    keywords: ['rename workspace', 'delete workspace', 'edit workspace'],
    content: 'Open the workspace, and next to its name at the top you will see "Rename" and "Delete" buttons (only visible to owners and admins; only the owner can delete). Renaming lets you type a new name and save it. Deleting permanently removes the workspace and everything inside it — this cannot be undone.',
  },
  {
    id: 'leave-workspace',
    category: 'Workspaces',
    title: 'How to leave a workspace',
    keywords: ['leave workspace', 'exit workspace', 'quit workspace'],
    content: 'If you are a member or admin (not the owner) of a workspace, open it and click the "Leave" button next to the workspace name. You will need a new invite to rejoin later. Owners cannot leave — they must delete the workspace or transfer ownership.',
  },
  {
    id: 'create-board',
    category: 'Boards',
    title: 'How to create a board',
    keywords: ['create board', 'new board'],
    content: 'Inside a workspace, on the Boards tab, click "+ New board." Type a name and click "Create." Your board starts with three columns automatically: To Do, In Progress, and Done.',
  },
  {
    id: 'rename-delete-board',
    category: 'Boards',
    title: 'How to rename or delete a board',
    keywords: ['rename board', 'delete board', 'edit board'],
    content: 'Open the board, and next to its name at the top you will see "Rename" and "Delete" buttons (owners and admins only). Deleting a board permanently removes every task inside it.',
  },
  {
    id: 'add-list',
    category: 'Boards',
    title: 'How to add a new list (column)',
    keywords: ['add list', 'new column', 'create list'],
    content: 'On a board, click "+ Add list" on the far right. Type a name (like "Blocked" or "Review") and press Enter. A new column appears, ready for tasks.',
  },
  {
    id: 'create-task',
    category: 'Tasks',
    title: 'How to create a task',
    keywords: ['create task', 'new task', 'add task'],
    content: 'Under any column, click "+ Add task." Type a name and press Enter. The task appears as a card in that column.',
  },
  {
    id: 'task-details',
    category: 'Tasks',
    title: 'How to add a description, due date, labels, and assignees to a task',
    keywords: ['task details', 'description', 'due date', 'labels', 'assignees', 'assign'],
    content: 'Click directly on a task card to open its details. You can type a description, pick a due date, add labels as comma-separated words (like "urgent, design"), and click on people\'s initials to assign or unassign them. Everything saves automatically.',
  },
  {
    id: 'task-comments',
    category: 'Tasks',
    title: 'How to comment on a task',
    keywords: ['comment', 'task comment', 'discussion'],
    content: 'Open a task\'s details, scroll to "Comments," type your message, and click "Send." Everyone else viewing that task sees your comment appear instantly.',
  },
  {
    id: 'delete-task',
    category: 'Tasks',
    title: 'How to delete a task',
    keywords: ['delete task', 'remove task'],
    content: 'Open the task\'s details and click "Delete task" at the bottom, then confirm. This cannot be undone.',
  },
  {
    id: 'move-task-drag',
    category: 'Moving Tasks',
    title: 'How to move a task by dragging',
    keywords: ['drag', 'drag and drop', 'move task'],
    content: 'Press and hold a task card, drag it into a different column, and release. This works well on a computer or a large screen.',
  },
  {
    id: 'move-task-button',
    category: 'Moving Tasks',
    title: 'How to move a task without dragging (great for phones)',
    keywords: ['move button', 'move to', 'phone', 'mobile move'],
    content: 'Every task card has a small "Move ▾" button. Click it to see every list on the board. Click a list name to move the task straight to the end of that list — no dragging needed.',
  },
  {
    id: 'move-task-exact-position',
    category: 'Moving Tasks',
    title: 'How to move a task to an exact position/priority number',
    keywords: ['exact position', 'priority number', 'move to number', 'heirarchy', 'hierarchy', 'reorder'],
    content: 'Click "Move ▾" on a task card, then click the small "#" button next to any list (including the task\'s own current list). Type the exact position number you want (for example, 3), and click "Go." The task moves to precisely that spot. If you type an invalid number, you will see a clear error explaining the valid range.',
  },
  {
    id: 'priority-numbers',
    category: 'Moving Tasks',
    title: 'What do the small numbers on each task card mean?',
    keywords: ['priority number', 'numbers', 'ranking'],
    content: 'Each task shows a small number badge indicating its rank/order within its column — 1 is the top/highest priority in that column. This updates automatically whenever tasks are reordered.',
  },
  {
    id: 'search-filter',
    category: 'Search & Filter',
    title: 'How to search and filter tasks on a board',
    keywords: ['search', 'filter', 'find task'],
    content: 'At the top of a board, type into the search box to find tasks by title or description. Click a label or a person\'s initials to filter by that label or assignee. Click "Clear filters" to see everything again.',
  },
  {
    id: 'invite-member',
    category: 'Members & Roles',
    title: 'How to invite someone to a workspace',
    keywords: ['invite', 'add member', 'invite member'],
    content: 'In a workspace, go to the Members tab and click "+ Invite member." Enter their email and choose a role (Admin or Member), then click "Send invite." They will receive a real email with a link to join.',
  },
  {
    id: 'accept-decline-invite',
    category: 'Members & Roles',
    title: 'How to accept or decline an invite',
    keywords: ['accept invite', 'decline invite', 'join workspace'],
    content: 'Open the invite email and click the link. You will see two buttons: "Accept" to join the workspace, or "Decline" if you don\'t want to join.',
  },
  {
    id: 'roles-explained',
    category: 'Members & Roles',
    title: 'What is the difference between Owner, Admin, and Member?',
    keywords: ['roles', 'owner', 'admin', 'member', 'permissions'],
    content: 'Owner: full control, created the workspace, cannot be removed. Admin: can invite/remove people and manage boards, almost everything except deleting the workspace. Member: can view and work on tasks fully, but cannot manage people, boards, or settings.',
  },
  {
    id: 'change-remove-member',
    category: 'Members & Roles',
    title: "How to change someone's role or remove them",
    keywords: ['change role', 'remove member', 'promote', 'demote'],
    content: 'On the Members tab (as an owner or admin), use the dropdown next to a person\'s name to change their role, or click "Remove" to take them out of the workspace. You cannot change or remove the owner, or yourself.',
  },
  {
    id: 'activity-log',
    category: 'Activity',
    title: 'How to see what has happened in a workspace',
    keywords: ['activity', 'history', 'log', 'audit'],
    content: 'Click the "Activity" tab inside any workspace to see a running list of actions — who created tasks, invited people, moved things, and more — newest first.',
  },
  {
    id: 'real-time-sync',
    category: 'Activity',
    title: 'Why do I see other people\'s changes appear instantly?',
    keywords: ['real time', 'live updates', 'sync'],
    content: 'TGO Flow updates boards live. If someone else on your team moves a task or adds a comment while you\'re looking at the same board, you\'ll see it appear automatically, without needing to refresh the page.',
  },
];

export function searchHelpArticles(query: string): HelpArticle[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return helpArticles;

  return helpArticles.filter((article) => {
    const haystack = `${article.title} ${article.keywords.join(' ')} ${article.content}`.toLowerCase();
    return haystack.includes(normalized);
  });
}
