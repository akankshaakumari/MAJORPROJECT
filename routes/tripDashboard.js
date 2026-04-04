const express = require("express");
const router = express.Router();
const { isLoggedIn, isTripMember } = require("../middleware");
const tripDashboardController = require("../controllers/tripDashboard");

// Apply middleware to all trip routes
router.use(isLoggedIn);
router.use("/:id", isTripMember);

// Dashboard Overview
router.get("/:id", tripDashboardController.index);
router.post("/:id/rules/agree", tripDashboardController.toggleRules);

// Trip Members
router.get("/:id/members", tripDashboardController.members);
router.post("/:id/members/update", tripDashboardController.updateMemberInfo);

// Trip Planner
router.get("/:id/planner", tripDashboardController.planner);
router.post("/:id/planner/add", tripDashboardController.addPlan);

// Group Chat
router.get("/:id/chat", tripDashboardController.chat);

// Expense Split Tracker
router.get("/:id/expenses", tripDashboardController.expenses);
router.post("/:id/expenses/add", tripDashboardController.addExpense);

// Packing Checklist
router.get("/:id/packing", tripDashboardController.packing);
router.post("/:id/packing/:itemId/toggle", tripDashboardController.togglePackingItem);

// Grocery Planner
router.get("/:id/grocery", tripDashboardController.grocery);
router.post("/:id/grocery/add", tripDashboardController.addGroceryItem);

module.exports = router;
