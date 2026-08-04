export interface HelpArticle {
  id: string;
  category: string;
  title: string;
  keywords: string[];
  content: string;
  publicSafe?: boolean;
}

export const PUBLIC_CATEGORIES = ['Getting Started'];

export const helpArticles: HelpArticle[] = [
  {
    id: 'why-logged-out',
    category: 'Getting Started',
    title: 'Why was I logged out even though I didn\'t click "Log out"?',
    keywords: ['logged out', 'session', 'signed out', 'session expired'],
    content: 'TGO Flow tries to keep you signed in for up to 30 days. On some phones and browsers, privacy settings can occasionally clear sign-in information earlier than that, especially after the app has been closed for a while. If this happens, simply log in again — it takes a few seconds, and your data is never affected.',
  },
  {
    id: 'messages-page-owner',
    category: 'For the Founder',
    title: 'How the Messages page works (founder only)',
    keywords: ['messages page', 'owner messages', 'feedback inbox'],
    content: 'Only the founder\'s account can see the Messages page, reached via the floating ✦ button. It lists every piece of feedback submitted through the feedback form, with filters for All, Unread, and Read. Each message can be marked as read/unread or deleted. New messages also arrive by email automatically.',
  },
  {
    id: 'analytics-page-owner',
    category: 'For the Founder',
    title: 'How the User Analytics page works (founder only)',
    keywords: ['analytics page', 'owner analytics', 'activity tracking'],
    content: 'Only the founder\'s account can see this page, reached via the floating ✦ button. It shows a live feed of account-level activity across every user — account creation, logins, logouts, and app-return events (when someone comes back after being away for a while) — separate from any individual workspace\'s own Activity tab.',
  },
  {
    id: 'delete-account',
    category: 'Getting Started',
    title: 'How to delete your account',
    keywords: ['delete account', 'remove account', 'close account'],
    content: 'On your Dashboard, click \'Delete account\' at the top. You will need to type an exact confirmation phrase to proceed, as a safety check. If you own any workspaces, you must delete or transfer them first. This action is permanent.',
  },
  {
    id: 'command-palette',
    category: 'Getting Started',
    title: 'How to use the command palette (quick actions)',
    keywords: ['command palette', 'shortcut', 'ctrl k', 'cmd k', 'quick actions'],
    content: 'On a computer, press Ctrl+K (or Cmd+K on Mac) at any time to open a quick command box. Type a few letters of what you want to do — like \'help,\' \'theme,\' or \'logout\' — and click it. This gives you fast access to common actions without navigating through menus.',
  },
  {
    id: 'about-founder',
    category: 'Getting Started',
    title: 'About the founder and TGO DevStudio',
    keywords: ['founder', 'tgo devstudio', 'who made this', 'testimony', 'about tgo devstudio', 'brand'],
    content: 'TGO Flow is built and maintained by Testimony Oluwatimilehin Gboroye, the founder of TGO DevStudio. TGO DevStudio is the technology brand behind TGO Flow, focused on building software products with real-world usefulness and polish. TGO Flow is TGO DevStudio\'s flagship project — a demonstration of full production-quality software engineering. You can reach the founder directly at any time using the floating ✦ button available throughout the app.',
  },
  {
    id: 'navigate-back',
    category: 'Getting Started',
    title: 'How to go back to a previous page',
    keywords: ['back', 'go back', 'previous page', 'navigate back'],
    content: 'You can go back in two ways: use your phone or browser\'s own back button (the normal back gesture or arrow you already use elsewhere), or click the TGO Flow logo at the top-left of most pages, which takes you back to your workspace or dashboard.',
  },
  {
    id: 'what-is-tgo-flow',
    category: 'Getting Started',
    title: 'About TGO Flow',
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

export function searchHelpArticles(query: string, articleList: HelpArticle[] = helpArticles): HelpArticle[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return articleList;

  return articleList.filter((article) => {
    const haystack = `${article.title} ${article.keywords.join(' ')} ${article.content}`.toLowerCase();
    return haystack.includes(normalized);
  });
}

export function getPublicArticles(): HelpArticle[] {
  return helpArticles.filter((a) => PUBLIC_CATEGORIES.includes(a.category));
}

export const additionalHelpArticles: HelpArticle[] = [
  {
    id: 'rename-delete-board-updated',
    category: 'Boards',
    title: 'How to see when a board or workspace was created',
    keywords: ['created date', 'created at', 'when created', 'age'],
    content: 'On your Dashboard and inside a workspace\'s Boards tab, each card shows how long ago it was created (e.g. "Created 2 hours ago"). Hover over or tap-and-hold the text on most devices to see the exact date and time.',
  },
  {
    id: 'feedback-form',
    category: 'Feedback & Support',
    title: 'How to give feedback or message the founder',
    keywords: ['feedback', 'message founder', 'contact', 'suggestion', 'review'],
    content: 'Click the floating ✦ button (usually near a bottom corner of the screen — you can drag it anywhere you like) and choose "Send Feedback." Your message goes directly and privately to the founder of TGO DevStudio, along with your name and email so they can follow up if needed.',
  },
  {
    id: 'floating-brand-button',
    category: 'Feedback & Support',
    title: 'What is the floating ✦ button for?',
    keywords: ['floating button', 'brand button', 'star button', 'circle button'],
    content: 'This small draggable button gives you quick access to things related to TGO DevStudio (the technology brand behind TGO Flow — see \'About the founder and TGO DevStudio\' above) and this project\'s founder — sending feedback, contacting the founder directly on WhatsApp or by phone, and links to the founder\'s GitHub, Facebook, and Instagram. It is separate from the project\'s own features. You can drag it to any corner of the screen; clicking it (without dragging) opens the menu, and clicking anywhere outside closes it.',
  },
  {
    id: 'contact-founder-direct',
    category: 'Feedback & Support',
    title: 'How to contact the founder directly',
    keywords: ['whatsapp', 'phone', 'call founder', 'direct contact'],
    content: 'Open the floating ✦ button menu and choose "WhatsApp the founder" to start a chat, or "Call the founder" to dial directly. These go straight to the founder, not to general project support.',
  },
]

helpArticles.push(...additionalHelpArticles);

