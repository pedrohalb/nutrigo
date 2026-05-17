import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { AppError } from '../../middleware/errorHandler';
import { authRepo } from './auth.repo';

function signToken(userId: string) {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, { expiresIn: '30d' });
}

export const authService = {
  async signup(email: string, password: string) {
    const existing = await authRepo.findByEmail(email);
    if (existing) throw new AppError(409, 'EMAIL_TAKEN', 'Email already in use');

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await authRepo.create(email, passwordHash);
    const token = signToken(user.id);
    return { token, user: { id: user.id, email: user.email } };
  },

  async login(email: string, password: string) {
    const user = await authRepo.findByEmail(email);
    if (!user) throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');

    const profile = await import('../../config/db').then(({ prisma }) =>
      prisma.profile.findUnique({ where: { userId: user.id } })
    );

    const token = signToken(user.id);
    return {
      token,
      user: { id: user.id, email: user.email },
      hasProfile: profile !== null,
    };
  },

  async resetPassword(email: string, newPassword: string) {
    const user = await authRepo.findByEmail(email);
    if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await authRepo.resetPassword(email, passwordHash);
  },
};
