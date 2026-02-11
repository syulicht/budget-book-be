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

export const findBudgets = async (): Promise<BudgetRecord[]> => {
  return prismaClient.budget.findMany({
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
  });
};
