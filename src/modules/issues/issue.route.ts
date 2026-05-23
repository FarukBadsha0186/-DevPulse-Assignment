import { Router } from 'express';
import { issueController } from './issue.controller.js';
import { authenticate, requireMaintainer } from '../../middleware/authenticate.js';

const router = Router();

router.post('/', authenticate, issueController.createIssue);
router.get('/',  issueController.getAllIssues);
router.get('/:id', issueController.getIssueById);
router.patch('/:id', authenticate, issueController.updateIssue);
router.delete('/:id', authenticate, requireMaintainer, issueController.deleteIssue);

export const issueRouter = router;