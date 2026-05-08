import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { JWTPayload, ParentJWTPayload } from '../types'

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload
      parent?: ParentJWTPayload
    }
  }
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'No token provided',
      code: 'NO_TOKEN'
    })
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as JWTPayload

    // Reject parent tokens on admin routes
    if ((decoded as any).type === 'parent') {
      res.status(403).json({
        success: false,
        error: 'Parent tokens cannot access admin routes',
        code: 'INVALID_TOKEN_TYPE'
      })
      return
    }

    req.user = decoded
    next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: 'Token has expired',
        code: 'TOKEN_EXPIRED'
      })
      return
    }

    res.status(401).json({
      success: false,
      error: 'Invalid token',
      code: 'INVALID_TOKEN'
    })
  }
}

export function parentAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'No token provided',
      code: 'NO_TOKEN'
    })
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as ParentJWTPayload

    if (decoded.type !== 'parent') {
      res.status(403).json({
        success: false,
        error: 'Invalid token type for parent route',
        code: 'INVALID_TOKEN_TYPE'
      })
      return
    }

    req.parent = decoded
    next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: 'Token has expired',
        code: 'TOKEN_EXPIRED'
      })
      return
    }

    res.status(401).json({
      success: false,
      error: 'Invalid token',
      code: 'INVALID_TOKEN'
    })
  }
}
