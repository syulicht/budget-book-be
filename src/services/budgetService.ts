import {
  findBudgets,
  type BudgetRecord,
} from "../repositories/budgetRepository.js";
import type { BudgetListResponse } from "../types/budget.js";

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
