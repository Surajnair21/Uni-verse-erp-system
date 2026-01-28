import { Request, Response, NextFunction } from 'express'

type Role = 'ADMIN' | 'HOD' | 'FACULTY' | 'STUDENT'
type Action = 'create' | 'read' | 'update' | 'delete' | 'manage'
type Resource =
  | 'master'
  | 'departments'
  | 'programs'
  | 'courses'
  | 'subjects'
  | 'semesters'
  | 'sections'
  | 'users'
  | 'allocations'

/**
 * Very simple RBAC matrix.
 * - ADMIN: everything (manage all)
 * - HOD: read master data (later we will scope by department)
 * - FACULTY/STUDENT: read-only limited (later)
 */
const PERMISSIONS: Record<Role, Partial<Record<Resource, Action[]>>> = {
  ADMIN: {
    master: ['manage'],
    departments: ['manage'],
    programs: ['manage'],
    courses: ['manage'],
    subjects: ['manage'],
    semesters: ['manage'],
    sections: ['manage'],
    users: ['manage'],
    allocations: ['manage'],
  },

  HOD: {
    master: ['read'],
    departments: ['read'],
    programs: ['read'],
    courses: ['read'],
    subjects: ['read'],
    semesters: ['read'],
    sections: ['read'],
  },

  FACULTY: {
    master: ['read'],
    departments: ['read'],
    programs: ['read'],
    courses: ['read'],
    subjects: ['read'],
    semesters: ['read'],
    sections: ['read'],
  },

  STUDENT: {
    master: ['read'],
    departments: ['read'],
    programs: ['read'],
    courses: ['read'],
    subjects: ['read'],
    semesters: ['read'],
    sections: ['read'],
  },
}

function hasPermission(role: Role, resource: Resource, action: Action) {
  const actions = PERMISSIONS[role]?.[resource] || []
  return actions.includes('manage') || actions.includes(action)
}

/**
 * can('create','departments') etc
 */
export function can(action: Action, resource: Resource) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user
    if (!user) return res.status(401).json({ message: 'Unauthenticated' })

    if (!hasPermission(user.role, resource, action)) {
      return res.status(403).json({ message: 'Forbidden' })
    }

    next()
  }
}
