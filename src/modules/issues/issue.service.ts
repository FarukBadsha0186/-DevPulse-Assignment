import pool from '../../db/index.js';
import { ICreateIssue, IUpdateIssue, IIssue } from './issue.interface.js';

const createIssueIntoDB = async (payload: ICreateIssue): Promise<IIssue> => {
  const { title, description, type, reporter_id } = payload;

  const result = await pool.query(
    `INSERT INTO issues (title, description, type, reporter_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [title, description, type, reporter_id]
  );

  return result.rows[0];
};

const getAllIssuesFromDB = async (filters: {
  sort?: string;
  type?: string;
  status?: string;
}) => {
  const conditions: string[] = [];
  const values: unknown[] = [];
  let count = 1;

  if (filters.type) {
    conditions.push(`i.type = $${count++}`);
    values.push(filters.type);
  }
  if (filters.status) {
    conditions.push(`i.status = $${count++}`);
    values.push(filters.status);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const order = filters.sort === 'oldest' ? 'ASC' : 'DESC';

  const result = await pool.query(
    `SELECT * FROM issues i ${where} ORDER BY i.created_at ${order}`,
    values
  );

  const issues = result.rows;

  if (issues.length === 0) return [];

  // fetch reporter data separately (no JOINs allowed)
  const reporterIds = [...new Set(issues.map((i: IIssue) => i.reporter_id))];
  const reporterResult = await pool.query(
    `SELECT id, name, role FROM users WHERE id = ANY($1)`,
    [reporterIds]
  );

  const reporterMap: Record<number, { id: number; name: string; role: string }> = {};
  for (const r of reporterResult.rows) {
    reporterMap[r.id] = r;
  }

  return issues.map((issue: IIssue) => ({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: reporterMap[issue.reporter_id] || null,
    created_at: issue.created_at,
    updated_at: issue.updated_at,
  }));
};

const getIssueByIdFromDB = async (id: number) => {
  const result = await pool.query(
    `SELECT * FROM issues WHERE id = $1`,
    [id]
  );

  if (result.rows.length === 0) return null;

  const issue: IIssue = result.rows[0];

  const reporterResult = await pool.query(
    `SELECT id, name, role FROM users WHERE id = $1`,
    [issue.reporter_id]
  );

  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: reporterResult.rows[0] || null,
    created_at: issue.created_at,
    updated_at: issue.updated_at,
  };
};

const updateIssueIntoDB = async (id: number, payload: IUpdateIssue): Promise<IIssue | null> => {
  const fields: string[] = [];
  const values: unknown[] = [];
  let count = 1;

  if (payload.title !== undefined) { fields.push(`title = $${count++}`); values.push(payload.title); }
  if (payload.description !== undefined) { fields.push(`description = $${count++}`); values.push(payload.description); }
  if (payload.type !== undefined) { fields.push(`type = $${count++}`); values.push(payload.type); }
  if (payload.status !== undefined) { fields.push(`status = $${count++}`); values.push(payload.status); }

  values.push(id);

  const result = await pool.query(
    `UPDATE issues SET ${fields.join(', ')} WHERE id = $${count} RETURNING *`,
    values
  );

  return result.rows[0] || null;
};

const deleteIssueFromDB = async (id: number): Promise<void> => {
  await pool.query(`DELETE FROM issues WHERE id = $1`, [id]);
};

export const issueService = {
  createIssueIntoDB,
  getAllIssuesFromDB,
  getIssueByIdFromDB,
  updateIssueIntoDB,
  deleteIssueFromDB,
};