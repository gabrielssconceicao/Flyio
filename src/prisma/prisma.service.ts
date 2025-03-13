import { Injectable, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
<<<<<<< HEAD
=======

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async findAll(
    model: {
      count: (args?: Prisma.Args<any, 'count'>) => Promise<number>;
      findMany: (args?: Prisma.Args<any, 'findMany'>) => Promise<any[]>;
    },
    options?: {
      where?: any;
      select?: any;
      orderBy?: any;
      skip?: number;
      take?: number;
    },
  ) {
    const { where, select, orderBy, skip, take } = options || {};

    const [count, items] = await Promise.all([
      model.count({ where }),
      model.findMany({ where, select, orderBy, skip, take }),
    ]);
    return { count, items };
  }
}
