import prisma from '../config/database.js';

export class SolutionModel {
  static async create(data) {
    return prisma.solution.create({
      data,
      include: {
        problem: {
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
        },
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
    });
  }

  static async findById(id) {
    return prisma.solution.findUnique({
      where: { id },
      include: {
        problem: {
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
        },
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
    });
  }

  static async findAll(filters = {}, pagination = {}) {
    const {
      problemId,
      studentId,
      status,
      search,
      minRating,
      maxRating,
    } = filters;

    const {
      page = 1,
      limit = 20,
      sortBy = 'submittedAt',
      sortOrder = 'desc',
    } = pagination;

    const skip = (page - 1) * limit;

    const where = {
      AND: [
        problemId ? { problemId } : {},
        studentId ? { studentId } : {},
        status ? { status } : {},
        minRating ? { rating: { gte: parseFloat(minRating) } } : {},
        maxRating ? { rating: { lte: parseFloat(maxRating) } } : {},
        search ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { technologies: { has: search } },
          ]
        } : {},
      ]
    };

    const [solutions, total] = await Promise.all([
      prisma.solution.findMany({
        where,
        include: {
          problem: {
            select: {
              id: true,
              title: true,
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
          },
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
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      }),
      prisma.solution.count({ where }),
    ]);

    return {
      solutions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async update(id, data) {
    if (data.status === 'REVIEWED' || data.status === 'ACCEPTED' || data.status === 'REJECTED') {
      data.reviewedAt = new Date();
    }

    return prisma.solution.update({
      where: { id },
      data,
      include: {
        problem: {
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
        },
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
    });
  }

  static async delete(id) {
    return prisma.solution.delete({
      where: { id }
    });
  }

  static async incrementViews(id) {
    return prisma.solution.update({
      where: { id },
      data: {
        views: { increment: 1 }
      }
    });
  }

  static async incrementLikes(id) {
    return prisma.solution.update({
      where: { id },
      data: {
        likes: { increment: 1 }
      }
    });
  }

  static async findByProblem(problemId) {
    return prisma.solution.findMany({
      where: { problemId },
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
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });
  }

  static async findByStudent(studentId) {
    return prisma.solution.findMany({
      where: { studentId },
      include: {
        problem: {
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
        }
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });
  }

  static async getTopSolutions(limit = 10) {
    return prisma.solution.findMany({
      where: {
        status: 'ACCEPTED',
        rating: {
          gte: 4.5,
        },
      },
      include: {
        problem: {
          select: {
            id: true,
            title: true,
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
        },
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
      },
      orderBy: {
        rating: 'desc',
      },
      take: limit,
    });
  }

  static async getStats() {
    const [
      total,
      accepted,
      pending,
      averageRating,
    ] = await Promise.all([
      prisma.solution.count(),
      prisma.solution.count({ where: { status: 'ACCEPTED' } }),
      prisma.solution.count({ where: { status: 'PENDING_REVIEW' } }),
      prisma.solution.aggregate({
        _avg: {
          rating: true,
        },
        where: {
          rating: {
            not: null,
          },
        },
      }),
    ]);

    return {
      total,
      accepted,
      pending,
      acceptanceRate: total > 0 ? (accepted / total) * 100 : 0,
      averageRating: averageRating._avg.rating || 0,
    };
  }
}