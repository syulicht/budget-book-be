import { Router } from "express";
import { createBudget, getBudgets } from "../controllers/budgetController.js";
import { healthCheck } from "../controllers/healthController.js";

const router = Router();

// ヘルスチェックエンドポイント
router.get("/health", healthCheck);

router.get("/budgets", getBudgets);
router.post("/budgets", createBudget);

export default router;
