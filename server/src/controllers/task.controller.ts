import { Request, Response, NextFunction } from 'express';
import * as taskService from '../services/task.service';

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title, description, dueDate, labels, assignees } = req.body;
    const task = await taskService.createTask({
      listId: req.params.listId,
      boardId: req.params.boardId,
      title,
      description,
      dueDate,
      labels,
      assignees,
      createdBy: req.userId as string,
    });
    res.status(201).json({ status: 'success', task });
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tasks = await taskService.listTasksForBoard(req.params.boardId);
    res.status(200).json({ status: 'success', tasks });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const task = await taskService.getTask(req.params.taskId, req.params.boardId);
    res.status(200).json({ status: 'success', task });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const task = await taskService.updateTask(req.params.taskId, req.params.boardId, req.body);
    res.status(200).json({ status: 'success', task });
  } catch (err) {
    next(err);
  }
}

export async function move(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { listId, position } = req.body;
    const task = await taskService.moveTask(req.params.taskId, req.params.boardId, listId, position);
    res.status(200).json({ status: 'success', task });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await taskService.deleteTask(req.params.taskId, req.params.boardId);
    res.status(200).json({ status: 'success', message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
}

export async function addComment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { body } = req.body;
    const comment = await taskService.addComment(req.params.taskId, req.params.boardId, req.userId as string, body);
    res.status(201).json({ status: 'success', comment });
  } catch (err) {
    next(err);
  }
}

export async function listComments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const comments = await taskService.listComments(req.params.taskId, req.params.boardId);
    res.status(200).json({ status: 'success', comments });
  } catch (err) {
    next(err);
  }
}
