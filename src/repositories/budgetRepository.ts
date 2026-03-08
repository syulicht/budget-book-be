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

export type CategoryRecord = {
  id: number;
};

type BudgetBaseWriteRecord = {
  id: number;
  category_id: number;
  amount: number;
  memo: string;
};

type BudgetWriteRecord = {
  id: number;
  user_id: string;
  date: Date;
  created_at: Date;
  updated_at: Date;
};

export type CreatedBudgetRecords = {
  budgetBase: BudgetBaseWriteRecord;
  budget: BudgetWriteRecord;
};

type BudgetFindManyArgs = {
  where: {
    user_id: string;
  };
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

type BudgetCreateTx = {
  budgetBase: {
    create: (args: {
      data: {
        category_id: number;
        amount: number;
        memo: string;
      };
    }) => Promise<BudgetBaseWriteRecord>;
  };
  budget: {
    create: (args: {
      data: {
        budget_base_id: number;
        user_id: string;
        date: Date;
      };
    }) => Promise<BudgetWriteRecord>;
  };
};

type BudgetPrismaClient = {
  budget: {
    findMany: (args: BudgetFindManyArgs) => Promise<BudgetRecord[]>;
  };
  category: {
    findFirst: (args: {
      where: { id: number; user_id: string };
      select: { id: true };
    }) => Promise<CategoryRecord | null>;
  };
  $transaction: <T>(fn: (tx: BudgetCreateTx) => Promise<T>) => Promise<T>;
};

const budgetClient = prismaClient as unknown as BudgetPrismaClient;

const createBudgetFindManyArgs = (userSub: string): BudgetFindManyArgs => {
  return {
    where: {
      user_id: userSub,
    },
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
};

export const findBudgets = (userSub: string): Promise<BudgetRecord[]> => {
  return budgetClient.budget.findMany(createBudgetFindManyArgs(userSub));
};

export const findCategoryById = async (
  categoryId: number,
  userSub: string
): Promise<CategoryRecord | null> =>
  budgetClient.category.findFirst({
    where: { id: categoryId, user_id: userSub },
    select: { id: true },
  });

export const createBudgetWithBaseInTx = async (params: {
  categoryId: number;
  amount: number;
  memo: string;
  date: Date;
  userId: string;
}): Promise<CreatedBudgetRecords> => {
  const { categoryId, amount, memo, date, userId } = params;

  return budgetClient.$transaction(async (tx) => {
    const budgetBase = await tx.budgetBase.create({
      data: {
        category_id: categoryId,
        amount,
        memo,
      },
    });

    const budget = await tx.budget.create({
      data: {
        budget_base_id: budgetBase.id,
        user_id: userId,
        date,
      },
    });

    return { budgetBase, budget };
  });
};
