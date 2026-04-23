import { prisma } from '../../prisma/client'
import { AuthedUser } from '../../middlewares/auth'

export class NoticesService {
  static async createNotice(
    user: AuthedUser,
    data: { title: string; content: string; audience: any; departmentId?: string }
  ) {
    return prisma.notice.create({
      data: {
        title: data.title,
        content: data.content,
        audience: data.audience,
        departmentId: data.departmentId || null,
        authorId: user.id
      }
    })
  }

  static async getNotices(user: AuthedUser) {
    // Determine which notices to show based on Role
    // Admins see all
    if (user.role === 'ADMIN') {
      return prisma.notice.findMany({
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { name: true, role: true } }, department: true }
      })
    }

    // Role specific audience
    const roleAudienceMap = {
      'STUDENT': ['ALL', 'STUDENT'],
      'FACULTY': ['ALL', 'FACULTY'],
      'HOD': ['ALL', 'FACULTY']
    } as any;

    const myAudiences = roleAudienceMap[user.role] || ['ALL']

    const orClauses: any[] = [
      { audience: { in: myAudiences }, departmentId: null },
    ]

    // Only show department-scoped notices if user belongs to a department
    if (user.departmentId) {
      orClauses.push({ audience: 'DEPARTMENT', departmentId: user.departmentId })
    }

    return prisma.notice.findMany({
      where: { OR: orClauses },
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { name: true, role: true } }, department: true }
    })
  }
}
