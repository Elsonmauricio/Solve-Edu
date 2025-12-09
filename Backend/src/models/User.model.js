import prisma from '../config/database.js';
import bcrypt from 'bcryptjs';

export class UserModel {
  static async create(data) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    return prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
      }
    });
  }

  static async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        studentProfile: true,
        companyProfile: true,
      }
    });
  }

  static async findById(id) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        studentProfile: true,
        companyProfile: true,
      }
    });
  }

  static async update(id, data) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        updatedAt: true,
      }
    });
  }

  static async comparePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }
}

export class StudentProfileModel {
  static async create(userId, data) {
    return prisma.studentProfile.create({
      data: {
        userId,
        ...data,
      }
    });
  }

  static async findByUserId(userId) {
    return prisma.studentProfile.findUnique({
      where: { userId }
    });
  }

  static async update(userId, data) {
    return prisma.studentProfile.update({
      where: { userId },
      data
    });
  }
}

export class CompanyProfileModel {
  static async create(userId, data) {
    return prisma.companyProfile.create({
      data: {
        userId,
        ...data,
      }
    });
  }

  static async findByUserId(userId) {
    return prisma.companyProfile.findUnique({
      where: { userId }
    });
  }

  static async update(userId, data) {
    return prisma.companyProfile.update({
      where: { userId },
      data
    });
  }
}