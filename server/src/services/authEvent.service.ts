import { AuthEvent, AuthEventType } from '../models/AuthEvent';

export async function logAuthEvent(
  userId: string | null,
  userEmail: string,
  userName: string,
  eventType: AuthEventType,
  metadata = ''
): Promise<void> {
  try {
    await AuthEvent.create({ user: userId, userEmail, userName, eventType, metadata });
  } catch (err) {
    console.error('Failed to log auth event:', err);
  }
}

export async function listAuthEvents(limit = 200) {
  return AuthEvent.find().sort({ createdAt: -1 }).limit(limit);
}
