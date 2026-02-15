import { prismaClient } from "../lib/prisma.js";

export type BudgetRecord = {
  id: number;
  date: Date;
  budget: {
    amount: number;
    memo: string;
    category: {
      id: number;
      name: string;
    };
  };
};

type BudgetFindManyArgs = {
  orderBy: [{ date: "desc" }, { id: "desc" }];
  select: {
    id: true;
    date: true;
    budget: {
      select: {
        amount: true;
        memo: true;
        category: {
          select: {
            id: true;
            name: true;
          };
        };
      };
    };
  };
};

type BudgetPrismaClient = {
  budget: {
    findMany: (args: BudgetFindManyArgs) => Promise<BudgetRecord[]>;
  };
};

const budgetFindManyArgs: BudgetFindManyArgs = {
  orderBy: [{ date: "desc" }, { id: "desc" }],
  select: {
    id: true,
    date: true,
    budget: {
      select: {
        amount: true,
        memo: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    },
  },
};

const budgetClient = prismaClient as unknown as BudgetPrismaClient;

export const findBudgets = (): Promise<BudgetRecord[]> => {
  return budgetClient.budget.findMany(budgetFindManyArgs);
};
