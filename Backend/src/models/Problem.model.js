import prisma from '../config/database.js';

export class ProblemModel {
  static async create(data) {
    return prisma.problem.create({
      data: {
        ...data,
        deadline: new Date(data.deadline),
      },
      include: {
        company: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              }
            }
          }
        }
      }
    });
  }

  static async findById(id) {
    return prisma.problem.findUnique({
      where: { id },
      include: {
        company: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              }
            }
          }
        },
        solutions: {
          include: {
            student: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true,
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            solutions: true,
          }
        }
      }
    });
  }

  static async findAll(filters = {}, pagination = {}) {
    const {
      category,
      difficulty,
      status,
      companyId,
      search,
      minReward,
      maxReward,
    } = filters;

    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = pagination;

    const skip = (page - 1) * limit;

    const where = {
      AND: [
        status ? { status } : {},
        category ? { category } : {},
        difficulty ? { difficulty } : {},
        companyId ? { companyId } : {},
        minReward ? { reward: { gte: minReward } } : {},
        maxReward ? { reward: { lte: maxReward } } : {},
        search ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { tags: { has: search } },
          ]
        } : {},
      ]
    };

    const [problems, total] = await Promise.all([
      prisma.problem.findMany({
        where,
        include: {
          company: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                }
              }
            }
          },
          _count: {
            select: {
              solutions: true,
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      }),
      prisma.problem.count({ where }),
    ]);

    return {
      problems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async update(id, data) {
    if (data.deadline) {
      data.deadline = new Date(data.deadline);
    }

    return prisma.problem.update({
      where: { id },
      data,
      include: {
        company: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              }
            }
          }
        }
      }
    });
  }

  static async delete(id) {
    return prisma.problem.delete({
      where: { id }
    });
  }

  static async incrementViews(id) {
    return prisma.problem.update({
      where: { id },
      data: {
        views: { increment: 1 }
      }
    });
  }

  static async findByCompany(companyId, filters = {}) {
    return prisma.problem.findMany({
      where: {
        companyId,
        ...filters,
      },
      include: {
        _count: {
          select: {
            solutions: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static async getActiveProblems() {
    return prisma.problem.findMany({
      where: {
        status: 'ACTIVE',
        deadline: {
          gt: new Date(),
        },
      },
      include: {
        company: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              }
            }
          }
        },
        _count: {
          select: {
            solutions: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });
  }

  static async getFeaturedProblems() {
    return prisma.problem.findMany({
      where: {
        status: 'ACTIVE',
        isFeatured: true,
        deadline: {
          gt: new Date(),
        },
      },
      include: {
        company: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              }
            }
          }
        },
        _count: {
          select: {
            solutions: true,
          }
        }
      },
      take: 5,
    });
  }
}