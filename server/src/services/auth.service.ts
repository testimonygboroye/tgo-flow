import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Types } from 'mongoose';
import { User } from '../models/User';
import { RefreshToken } from '../models/RefreshToken';
import { PasswordResetToken } from '../models/PasswordResetToken';
import { sendPasswordResetEmail } from './email.service';
import { AppError } from '../utils/AppError';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { sha256 } from '../utils/hash';
import { parseDurationToMs } from '../utils/time';
import { env } from '../config/env';

const BCRYPT_ROUNDS = 12;
const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

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

export async function requestPasswordReset(email: string): Promise<void> {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    // Do not reveal whether the email exists - prevents account enumeration.
    return;
  }

  await PasswordResetToken.deleteMany({ user: user._id });

  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = sha256(rawToken);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);

  await PasswordResetToken.create({ user: user._id, tokenHash, expiresAt });

  const resetLink = `${env.clientUrl}/reset-password?token=${rawToken}`;
  await sendPasswordResetEmail(user.email, resetLink);
}

export async function resetPassword(rawToken: string, newPassword: string): Promise<void> {
  const tokenHash = sha256(rawToken);
  const resetToken = await PasswordResetToken.findOne({ tokenHash });

  if (!resetToken) {
    throw new AppError('Invalid or expired reset link', 400);
  }

  if (resetToken.expiresAt.getTime() < Date.now()) {
    await PasswordResetToken.deleteOne({ _id: resetToken._id });
    throw new AppError('This reset link has expired', 400);
  }

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await User.findByIdAndUpdate(resetToken.user, { passwordHash });

  await PasswordResetToken.deleteOne({ _id: resetToken._id });
  // Invalidate all existing sessions for security, since the password changed.
  await RefreshToken.deleteMany({ user: resetToken.user });
}
