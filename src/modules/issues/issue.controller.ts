import type { Request, Response } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import { issueService } from './issue.service.js';
import { IssueType, IssueStatus } from './issue.interface.js';

const VALID_TYPES: IssueType[] = ['bug', 'feature_request'];
const VALID_STATUSES: IssueStatus[] = ['open', 'in_progress', 'resolved'];

const createIssue = async (req: Request, res: Response) => {
  try {
    const { title, description, type } = req.body;
    const reporter_id = req.user!.id;

    if (!title || !description || !type) {
      return res.status(400).json({ success: false, message: 'title, description, and type are required' });
    }
    if (title.length > 150) {
      return res.status(400).json({ success: false, message: 'title must be at most 150 characters' });
    }
    if (description.length < 20) {
      return res.status(400).json({ success: false, message: 'description must be at least 20 characters' });
    }
    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({ success: false, message: 'type must be bug or feature_request' });
    }

    const result = await issueService.createIssueIntoDB({ title, description, type, reporter_id });

    return res.status(201).json({
      success: true,
      message: 'Issue created successfully',
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAllIssues = async (req: Request, res: Response) => {
  try {
    const { sort, type, status } = req.query as Record<string, string>;

    if (type && !VALID_TYPES.includes(type as IssueType)) {
      return res.status(400).json({ success: false, message: 'type must be bug or feature_request' });
    }
    if (status && !VALID_STATUSES.includes(status as IssueStatus)) {
      return res.status(400).json({ success: false, message: 'status must be open, in_progress, or resolved' });
    }

    const result = await issueService.getAllIssuesFromDB({ sort, type, status });

    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getIssueById = async (req: Request<ParamsDictionary>, res: Response) => {
  try {
    const id = parseInt(req.params['id'] as string);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid issue id' });
    }

    const result = await issueService.getIssueByIdFromDB(id);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateIssue = async (req: Request<ParamsDictionary>, res: Response) => {
  try {
    const id = parseInt(req.params['id'] as string);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid issue id' });
    }

    const issue = await issueService.getIssueByIdFromDB(id);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    const user = req.user!;

    if (user.role === 'contributor') {
      if (issue.reporter?.id !== user.id) {
        return res.status(403).json({ success: false, message: 'You can only update your own issues' });
      }
      if (issue.status !== 'open') {
        return res.status(409).json({ success: false, message: 'You can only edit issues with open status' });
      }
    }

    const { title, description, type, status } = req.body;

    if (title !== undefined && title.length > 150) {
      return res.status(400).json({ success: false, message: 'title must be at most 150 characters' });
    }
    if (description !== undefined && description.length < 20) {
      return res.status(400).json({ success: false, message: 'description must be at least 20 characters' });
    }
    if (type !== undefined && !VALID_TYPES.includes(type)) {
      return res.status(400).json({ success: false, message: 'type must be bug or feature_request' });
    }
    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: 'status must be open, in_progress, or resolved' });
    }

    const result = await issueService.updateIssueIntoDB(id, { title, description, type, status });

    return res.status(200).json({
      success: true,
      message: 'Issue updated successfully',
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteIssue = async (req: Request<ParamsDictionary>, res: Response) => {
  try {
    const id = parseInt(req.params['id'] as string);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid issue id' });
    }

    const existing = await issueService.getIssueByIdFromDB(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    await issueService.deleteIssueFromDB(id);

    return res.status(200).json({ success: true, message: 'Issue deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const issueController = {
  createIssue,
  getAllIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
};