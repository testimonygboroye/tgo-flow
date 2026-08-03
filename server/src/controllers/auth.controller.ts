import { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser, refreshTokens, logoutUser, requestPasswordReset, resetPassword, recordAppReturn, deleteOwnAccount } from '../services/auth.service';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';
import { parseDurationToMs } from '../utils/time';

const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_PATH = '/api/auth';

function setRefreshCookie(res: Response, token: string): void {
  const isProduction = env.nodeEnv === 'production';
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: REFRESH_COOKIE_PATH,
    maxAge: parseDurationToMs(env.jwtRefreshExpires),
  });
}

function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: REFRESH_COOKIE_PATH });
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, password } = req.body;
    const result = await registerUser(name, email, password);
    setRefreshCookie(res, result.refreshToken);
    res.status(201).json({ status: 'success', user: result.user, accessToken: result.accessToken });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    setRefreshCookie(res, result.refreshToken);
    res.status(200).json({ status: 'success', user: result.user, accessToken: result.accessToken });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!token) {
      res.status(401).json({ status: 'error', message: 'No refresh token provided' });
      return;
    }
    const result = await refreshTokens(token);
    setRefreshCookie(res, result.refreshToken);
    res.status(200).json({ status: 'success', accessToken: result.accessToken });
  } catch (err) {
    clearRefreshCookie(res);
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies?.[REFRESH_COOKIE_NAME];
    if (token) {
      await logoutUser(token);
    }
    clearRefreshCookie(res);
    res.status(200).json({ status: 'success', message: 'Logged out' });
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    res.status(200).json({
      status: 'success',
      user: { id: user._id.toString(), name: user.name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = req.body;
    await requestPasswordReset(email);
    res.status(200).json({
      status: 'success',
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (err) {
    next(err);
  }
}

export async function resetPasswordHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { token, password } = req.body;
    await resetPassword(token, password);
    res.status(200).json({ status: 'success', message: 'Password has been reset successfully.' });
  } catch (err) {
    next(err);
  }
}

export async function appReturn(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await recordAppReturn(req.userId as string);
    res.status(200).json({ status: 'success' });
  } catch (err) {
    next(err);
  }
}

export async function deleteAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await deleteOwnAccount(req.userId as string);
    res.status(200).json({ status: 'success', message: 'Account deleted' });
  } catch (err) {
    next(err);
  }
}
