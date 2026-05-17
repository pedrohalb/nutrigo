import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authService } from './auth.service';

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const resetSchema = z.object({
  email: z.string().email(),
  newPassword: z.string().min(8),
});

export const authController = {
  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = signupSchema.parse(req.body);
      const result = await authService.signup(email, password);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const result = await authService.login(email, password);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  forgotPassword(_req: Request, res: Response) {
    res.json({ ok: true });
  },

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, newPassword } = resetSchema.parse(req.body);
      await authService.resetPassword(email, newPassword);
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  },

  logout(_req: Request, res: Response) {
    res.json({ ok: true });
  },
};
