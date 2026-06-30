import express from 'express';
import {
    getOverviewAnalytics,
    getStatusAnalytics,
    getMonthlyAnalytics,
    getPriorityAnalytics,
    getLeaderboardAnalytics,
    getTimelineAnalytics
} from '../controllers/analyticsController.js';

const router = express.Router();

// Route: GET /api/analytics/overview
router.get('/overview', getOverviewAnalytics);

// Route: GET /api/analytics/status
router.get('/status', getStatusAnalytics);

// Route: GET /api/analytics/monthly
router.get('/monthly', getMonthlyAnalytics);

// Route: GET /api/analytics/priority
router.get('/priority', getPriorityAnalytics);

// Route: GET /api/analytics/leaderboard
router.get('/leaderboard', getLeaderboardAnalytics);

// Route: GET /api/analytics/timeline
router.get('/timeline', getTimelineAnalytics);

export default router;
