import { Router } from "express";
import { createBudget, getBudgets } from "../controllers/budgetController.js";
import { healthCheck } from "../controllers/healthController.js";
import { requireCognitoAuth } from "../middlewares/requireCognitoAuth.js";

const router = Router();

// ヘルスチェックエンドポイント
router.get("/health", healthCheck);

router.get("/budgets", requireCognitoAuth, getBudgets);
router.post("/budgets", requireCognitoAuth, createBudget);

export default router;
