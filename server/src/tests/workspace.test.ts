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

  it('creates a board within the workspace', async () => {
    const res = await request(app)
      .post(`/api/workspaces/${workspaceId}/boards`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ name: 'Jest Test Board' });

    expect(res.status).toBe(201);
    expect(res.body.board.name).toBe('Jest Test Board');
    expect(res.body.lists.length).toBe(3);
  });
});
