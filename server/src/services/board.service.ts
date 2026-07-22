import { Board } from '../models/Board';
import { List } from '../models/List';
import { Task } from '../models/Task';
import { AppError } from '../utils/AppError';
import { emitToBoard } from '../sockets';

export async function createBoard(workspaceId: string, userId: string, name: string) {
  const board = await Board.create({ workspace: workspaceId, name, createdBy: userId });

  const defaultListNames = ['To Do', 'In Progress', 'Done'];
  const lists = await List.insertMany(
    defaultListNames.map((listName, index) => ({
      board: board._id,
      name: listName,
      position: index,
    }))
  );

  return { board, lists };
}

export async function listBoards(workspaceId: string) {
  return Board.find({ workspace: workspaceId }).sort({ createdAt: 1 });
}

export async function getBoardWithLists(boardId: string, workspaceId: string) {
  const board = await Board.findOne({ _id: boardId, workspace: workspaceId });
  if (!board) {
    throw new AppError('Board not found', 404);
  }
  const lists = await List.find({ board: boardId }).sort({ position: 1 });
  return { board, lists };
}

export async function deleteBoard(boardId: string, workspaceId: string) {
  const board = await Board.findOne({ _id: boardId, workspace: workspaceId });
  if (!board) {
    throw new AppError('Board not found', 404);
  }

  const lists = await List.find({ board: boardId });
  const listIds = lists.map((l) => l._id);

  await Task.deleteMany({ list: { $in: listIds } });
  await List.deleteMany({ board: boardId });
  await Board.deleteOne({ _id: boardId });
}

export async function createList(boardId: string, name: string) {
  const lastList = await List.findOne({ board: boardId }).sort({ position: -1 });
  const position = lastList ? lastList.position + 1 : 0;
  const list = await List.create({ board: boardId, name, position });
  emitToBoard(boardId, 'list:created', list);
  return list;
}

export async function reorderList(listId: string, boardId: string, newPosition: number) {
  const list = await List.findOne({ _id: listId, board: boardId });
  if (!list) {
    throw new AppError('List not found', 404);
  }
  list.position = newPosition;
  await list.save();
  emitToBoard(boardId, 'list:updated', list);
  return list;
}

export async function deleteList(listId: string, boardId: string) {
  const list = await List.findOne({ _id: listId, board: boardId });
  if (!list) {
    throw new AppError('List not found', 404);
  }
  await Task.deleteMany({ list: listId });
  await List.deleteOne({ _id: listId });
  emitToBoard(boardId, 'list:deleted', { listId });
}
