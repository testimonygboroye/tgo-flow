import mongoose from 'mongoose';
import request from 'supertest';
import { buildTestApp } from './testApp';

const app = buildTestApp();

let ownerToken: string;
let memberToken: string;
let workspaceId: string;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI as string, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
  });

  const ownerRes = await request(app).post('/api/auth/register').send({
    name: 'Workspace Owner',
    email: 'jest-owner@example.com',
    password: 'TestPass123',
  });
  ownerToken = ownerRes.body.accessToken;

  const memberRes = await request(app).post('/api/auth/register').send({
    name: 'Workspace Member',
    email: 'jest-member@example.com',
    password: 'TestPass123',
  });
  memberToken = memberRes.body.accessToken;
}, 60000);

afterAll(async () => {
  const collections = await mongoose.connection.db?.listCollections().toArray();
  if (collections) {
    for (const { name } of collections) {
      await mongoose.connection.db?.collection(name).deleteMany({});
    }
  }
  await mongoose.disconnect();
});

describe('Workspace creation and permissions', () => {
  it('creates a workspace as the owner', async () => {
    const res = await request(app)
      .post('/api/workspaces')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ name: 'Jest Test Workspace' });

    expect(res.status).toBe(201);
    expect(res.body.workspace.name).toBe('Jest Test Workspace');
    workspaceId = res.body.workspace._id;
  });

  it('lists the workspace for the owner', async () => {
    const res = await request(app).get('/api/workspaces').set('Authorization', `Bearer ${ownerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.workspaces.length).toBeGreaterThan(0);
    expect(res.body.workspaces[0].role).toBe('owner');
  });

  it('denies access to a non-member', async () => {
    const res = await request(app)
      .get(`/api/workspaces/${workspaceId}`)
      .set('Authorization', `Bearer ${memberToken}`);
    expect(res.status).toBe(404);
  });

  it('creates an invite as the owner', async () => {
    const res = await request(app)
      .post(`/api/workspaces/${workspaceId}/invites`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ email: 'jest-member@example.com', role: 'member' });

    expect(res.status).toBe(201);
    expect(res.body.inviteToken).toBeDefined();
    inviteToken = res.body.inviteToken;
  });

  let inviteToken: string;

  it('accepts the invite as the invited member', async () => {
    const res = await request(app)
      .post('/api/workspaces/invites/accept')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ token: inviteToken });

    expect(res.status).toBe(200);
  });

  it('allows the member to view the workspace after joining', async () => {
    const res = await request(app)
      .get(`/api/workspaces/${workspaceId}`)
      .set('Authorization', `Bearer ${memberToken}`);
    expect(res.status).toBe(200);
    expect(res.body.role).toBe('member');
  });

  it('denies a member from inviting others (role enforcement)', async () => {
    const res = await request(app)
      .post(`/api/workspaces/${workspaceId}/invites`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ email: 'someone-else@example.com', role: 'member' });
    expect(res.status).toBe(403);
  });

  it('rejects assigning a task to a user who is not a workspace member', async () => {
    const boardRes = await request(app)
      .post(`/api/workspaces/${workspaceId}/boards`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ name: 'Assignee Validation Board' });
    const listId = boardRes.body.lists[0]._id;
    const boardId = boardRes.body.board._id;

    const outsiderRes = await request(app).post('/api/auth/register').send({
      name: 'Outsider',
      email: 'jest-outsider@example.com',
      password: 'TestPass123',
    });
    const outsiderId = outsiderRes.body.user.id;

    const res = await request(app)
      .post(`/api/workspaces/${workspaceId}/boards/${boardId}/tasks/list/${listId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: 'Task with bad assignee', assignees: [outsiderId] });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/not members of this workspace/i);
  });

  it('creates a board within the workspace', async () => {
    const res = await request(app)
      .post(`/api/workspaces/${workspaceId}/boards`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ name: 'Jest Test Board' });

    expect(res.status).toBe(201);
    expect(res.body.board.name).toBe('Jest Test Board');
    expect(res.body.lists.length).toBe(3);
  });

  it('denies a member from creating a board (owner/admin only)', async () => {
    const res = await request(app)
      .post(`/api/workspaces/${workspaceId}/boards`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ name: 'Unauthorized Board Attempt' });

    expect(res.status).toBe(403);
  });

  it('allows a member to still view boards (read access preserved)', async () => {
    const res = await request(app)
      .get(`/api/workspaces/${workspaceId}/boards`)
      .set('Authorization', `Bearer ${memberToken}`);

    expect(res.status).toBe(200);
  });

  it('prevents cross-tenant access to a board via a mismatched workspace ID in the URL', async () => {
    // Create a second, completely separate workspace + board owned by the same owner
    const otherWorkspaceRes = await request(app)
      .post('/api/workspaces')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ name: 'A Different Workspace' });
    const otherWorkspaceId = otherWorkspaceRes.body.workspace._id;

    const otherBoardRes = await request(app)
      .post(`/api/workspaces/${otherWorkspaceId}/boards`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ name: 'A Board In The Other Workspace' });
    const otherBoardId = otherBoardRes.body.board._id;

    // Attempt to access the OTHER workspace's board through THIS workspace's URL
    const res = await request(app)
      .get(`/api/workspaces/${workspaceId}/boards/${otherBoardId}`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(404);
  });
});
