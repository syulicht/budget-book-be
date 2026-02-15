export type BudgetListItem = {
  id: number;
  date: Date;
  category: {
    id: number;
    name: string;
  };
  amount: number;
  memo: string;
};

export type BudgetListResponse = {
  budgets: BudgetListItem[];
};
