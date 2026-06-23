import { Response, NextFunction, RequestHandler } from 'express';
import { AuthRequest } from './auth';

type AsyncController = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => Promise<unknown> | unknown;

// Envolve um controller, encaminhando qualquer erro (sync ou async) para o
// errorHandler via next(). Elimina o try/catch repetido em cada controller.
export function asyncHandler(fn: AsyncController): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req as AuthRequest, res, next)).catch(next);
  };
}
