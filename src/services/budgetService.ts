import {
  createBudgetWithBaseInTx,
  findCategoryById,
  findBudgets,
  type BudgetRecord,
} from "../repositories/budgetRepository.js";
import type { BudgetListResponse } from "../types/budget.js";

export type BudgetType = "INCOME" | "EXPENSE";

export type CreateBudgetInput = {
  date: Date;
  amount: number;
  memo: string;
  categoryId: number;
};

export type CreatedBudgetResult = {
  id: number;
  type: BudgetType;
  date: string;
  amount: number;
  memo: string;
  categoryId: number;
  budgetBaseId: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
};

type DomainErrorCode = "VALIDATION_ERROR" | "NOT_FOUND";

export class DomainError extends Error {
  code: DomainErrorCode;

  constructor(code: DomainErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = "DomainError";
  }
}

const TEMP_USER_ID = 0;

const inferBudgetType = (amount: number): BudgetType =>
  amount > 0 ? "INCOME" : "EXPENSE";

export const toBudgetListResponse = (
  records: BudgetRecord[]
): BudgetListResponse => {
  return {
    budgets: records.map((record) => ({
      id: record.id,
      date: record.date,
      category: {
        id: record.budget.category.id,
        name: record.budget.category.name,
      },
      amount: record.budget.amount,
      memo: record.budget.memo,
    })),
  };
};

export const getBudgetList = async (): Promise<BudgetListResponse> => {
  const records = await findBudgets();

  return toBudgetListResponse(records);
};

export const createBudget = async (
  input: CreateBudgetInput
): Promise<CreatedBudgetResult> => {
  if (input.amount === 0) {
    throw new DomainError(
      "VALIDATION_ERROR",
      "`budget.amount` must be a non-zero integer"
    );
  }

  const category = await findCategoryById(input.categoryId);
  if (!category) {
    throw new DomainError("NOT_FOUND", "Category not found");
  }

  const created = await createBudgetWithBaseInTx({
    categoryId: category.id,
    amount: input.amount,
    memo: input.memo,
    date: input.date,
    userId: TEMP_USER_ID,
  });

  return {
    id: created.budget.id,
    type: inferBudgetType(created.budgetBase.amount),
    date: created.budget.date.toISOString(),
    amount: created.budgetBase.amount,
    memo: created.budgetBase.memo,
    categoryId: created.budgetBase.category_id,
    budgetBaseId: created.budgetBase.id,
    userId: created.budget.user_id,
    createdAt: created.budget.created_at.toISOString(),
    updatedAt: created.budget.updated_at.toISOString(),
  };
};
