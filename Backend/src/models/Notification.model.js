import prisma from '../config/database.js';

export class NotificationModel {
  static async create(data) {
    return prisma.notification.create({
      data,
    });
  }

  static async findByUserId(userId, filters = {}) {
    const { isRead, type } = filters;

    return prisma.notification.findMany({
      where: {
        userId,
        ...(isRead !== undefined && { isRead }),
        ...(type && { type }),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static async markAsRead(id) {
    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  static async markAllAsRead(userId) {
    return prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: { isRead: true },
    });
  }

  static async delete(id) {
    return prisma.notification.delete({
      where: { id },
    });
  }

  static async getUnreadCount(userId) {
    return prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }
}