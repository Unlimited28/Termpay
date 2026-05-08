import { Request, Response, NextFunction } from 'express'
import { UserRole } from '../types'

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated',
        code: 'NOT_AUTHENTICATED'
      })
      return
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `Access denied. Required roles: ${roles.join(', ')}`,
        code: 'INSUFFICIENT_PERMISSIONS'
      })
      return
    }

    next()
  }
}

export function requireSuperAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user || req.user.role !== 'super_admin') {
    res.status(403).json({
      success: false,
      error: 'Super admin access required',
      code: 'SUPER_ADMIN_REQUIRED'
    })
    return
  }
  next()
}
