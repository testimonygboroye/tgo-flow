import { Request, Response, NextFunction } from 'express';
import * as boardService from '../services/board.service';

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name } = req.body;
    const result = await boardService.createBoard(req.params.workspaceId, req.userId as string, name);
    res.status(201).json({ status: 'success', ...result });
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const boards = await boardService.listBoards(req.params.workspaceId);
    res.status(200).json({ status: 'success', boards });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await boardService.getBoardWithLists(req.params.boardId, req.params.workspaceId);
    res.status(200).json({ status: 'success', ...result });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await boardService.deleteBoard(req.params.boardId, req.params.workspaceId);
    res.status(200).json({ status: 'success', message: 'Board deleted' });
  } catch (err) {
    next(err);
  }
}

export async function createList(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name } = req.body;
    const list = await boardService.createList(req.params.boardId, name);
    res.status(201).json({ status: 'success', list });
  } catch (err) {
    next(err);
  }
}

export async function reorderList(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { position } = req.body;
    const list = await boardService.reorderList(req.params.listId, req.params.boardId, position);
    res.status(200).json({ status: 'success', list });
  } catch (err) {
    next(err);
  }
}

export async function deleteList(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await boardService.deleteList(req.params.listId, req.params.boardId);
    res.status(200).json({ status: 'success', message: 'List deleted' });
  } catch (err) {
    next(err);
  }
}
