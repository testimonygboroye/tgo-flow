import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';
import { User } from '../models/User';
import { RefreshToken } from '../models/RefreshToken';
import { AppError } from '../utils/AppError';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { sha256 } from '../utils/hash';
import { parseDurationToMs } from '../utils/time';
import { env } from '../config/env';

const BCRYPT_ROUNDS = 12;

interface AuthResult {
  user: { id: string; name: string; email: string };
  accessToken: string;
  refreshToken: string;
}

async function issueTokens(userId: Types.ObjectId): Promise<{ accessToken: string; refreshToken: string }> {
  const accessToken = signAccessToken(userId.toString());
  const refreshToken = signRefreshToken(userId.toString());

  const expiresAt = new Date(Date.now() + parseDurationToMs(env.jwtRefreshExpires));
  await RefreshToken.create({
    user: userId,
    tokenHash: sha256(refreshToken),
    expiresAt,
  });

  return { accessToken, refreshToken };
}

export async function registerUser(name: string, email: string, password: string): Promise<AuthResult> {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new AppError('An account with this email already exists', 409);
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = await User.create({ name, email: email.toLowerCase(), passwordHash });

  const { accessToken, refreshToken } = await issueTokens(user._id);

  return {
    user: { id: user._id.toString(), name: user.name, email: user.email },
    accessToken,
    refreshToken,
  };
}

export async function loginUser(email: string, password: string): Promise<AuthResult> {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  const { accessToken, refreshToken } = await issueTokens(user._id);

  return {
    user: { id: user._id.toString(), name: user.name, email: user.email },
    accessToken,
    refreshToken,
  };
}

export async function refreshTokens(oldRefreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
  let payload;
  try {
    payload = verifyRefreshToken(oldRefreshToken);
  } catch {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const tokenHash = sha256(oldRefreshToken);
  const storedToken = await RefreshToken.findOne({ user: payload.sub, tokenHash });

  if (!storedToken) {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  await RefreshToken.deleteOne({ _id: storedToken._id });

  const userId = new Types.ObjectId(payload.sub);
  return issueTokens(userId);
}

export async function logoutUser(refreshToken: string): Promise<void> {
  const tokenHash = sha256(refreshToken);
  await RefreshToken.deleteOne({ tokenHash });
}
