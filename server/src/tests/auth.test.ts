import mongoose from 'mongoose';
import request from 'supertest';
import { buildTestApp } from './testApp';

const app = buildTestApp();

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI as string, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
  });
});

afterAll(async () => {
  const collections = await mongoose.connection.db?.listCollections().toArray();
  if (collections) {
    for (const { name } of collections) {
      await mongoose.connection.db?.collection(name).deleteMany({});
    }
  }
  await mongoose.disconnect();
});

describe('Auth flow', () => {
  const testUser = {
    name: 'Test User',
    email: 'jest-test-user@example.com',
    password: 'TestPass123',
  };

  it('registers a new user successfully', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.accessToken).toBeDefined();
    // Password must never be exposed in the response
    expect(res.body.user.password).toBeUndefined();
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it('rejects registration with a duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/already exists/i);
  });

  it('rejects registration with a weak password', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Weak Pass',
      email: 'weak-pass@example.com',
      password: 'short',
    });
    expect(res.status).toBe(400);
  });

  it('logs in with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('rejects login with wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: 'WrongPassword123',
    });
    expect(res.status).toBe(401);
  });

  it('rejects login for a non-existent email', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'nobody-here@example.com',
      password: 'TestPass123',
    });
    expect(res.status).toBe(401);
  });

  it('rejects access to a protected route without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
