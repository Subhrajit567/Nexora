import TaskModel from '../models/taskSchema.js';
import UserModel from '../models/userSchema.js';
import PostModel from '../models/postSchema.js';

const getDateFilter = (req) => {
    const { startDate, endDate } = req.query;
    if (!startDate && !endDate) return [];
    const match = { createdAt: {} };
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
    return [{ $match: match }];
};

export const getOverviewAnalytics = async (req, res) => {
    try {
        const dateFilter = getDateFilter(req);
        
        let totalUsersFilter = {};
        if (dateFilter.length > 0) {
            totalUsersFilter = dateFilter[0].$match;
        }
        
        const totalUsers = await UserModel.countDocuments(totalUsersFilter);
        
        const taskStats = await TaskModel.aggregate([
            ...dateFilter,
            {
                $group: {
                    _id: "$taskStatus",
                    count: { $sum: 1 }
                }
            }
        ]);

        let completedTasks = 0;
        let pendingTasks = 0;

        taskStats.forEach(stat => {
            if (stat._id === 'completed') {
                completedTasks += stat.count;
            } else {
                pendingTasks += stat.count;
            }
        });

        const totalTasks = completedTasks + pendingTasks;
        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        return res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalTasks,
                completedTasks,
                pendingTasks,
                completionRate: parseFloat(completionRate.toFixed(2))
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getStatusAnalytics = async (req, res) => {
    try {
        const dateFilter = getDateFilter(req);
        const statusStats = await TaskModel.aggregate([
            ...dateFilter,
            {
                $group: {
                    _id: "$taskStatus",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    status: "$_id",
                    count: 1,
                    _id: 0
                }
            }
        ]);
        return res.status(200).json({ success: true, data: statusStats });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getMonthlyAnalytics = async (req, res) => {
    try {
        const dateFilter = getDateFilter(req);
        const taskStats = await TaskModel.aggregate([
            ...dateFilter,
            {
                $group: {
                    _id: { 
                        year: { $year: "$createdAt" }, 
                        month: { $month: "$createdAt" } 
                    },
                    tasksCreated: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
            {
                $project: {
                    year: "$_id.year",
                    month: "$_id.month",
                    tasksCreated: 1,
                    _id: 0
                }
            }
        ]);

        const userStats = await UserModel.aggregate([
            ...dateFilter,
            {
                $group: {
                    _id: { 
                        year: { $year: "$createdAt" }, 
                        month: { $month: "$createdAt" } 
                    },
                    usersJoined: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
            {
                $project: {
                    year: "$_id.year",
                    month: "$_id.month",
                    usersJoined: 1,
                    _id: 0
                }
            }
        ]);

        const combined = {};
        
        taskStats.forEach(t => {
            const key = `${t.year}-${t.month}`;
            combined[key] = { year: t.year, month: t.month, tasksCreated: t.tasksCreated, usersJoined: 0 };
        });

        userStats.forEach(u => {
            const key = `${u.year}-${u.month}`;
            if (!combined[key]) {
                combined[key] = { year: u.year, month: u.month, tasksCreated: 0, usersJoined: 0 };
            }
            combined[key].usersJoined = u.usersJoined;
        });

        const data = Object.values(combined).sort((a, b) => {
            if (a.year === b.year) {
                return a.month - b.month;
            }
            return a.year - b.year;
        });

        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getPriorityAnalytics = async (req, res) => {
    try {
        const dateFilter = getDateFilter(req);
        const priorityStats = await TaskModel.aggregate([
            ...dateFilter,
            {
                $group: {
                    _id: "$priority",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    priority: "$_id",
                    count: 1,
                    _id: 0
                }
            }
        ]);
        return res.status(200).json({ success: true, data: priorityStats });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getLeaderboardAnalytics = async (req, res) => {
    try {
        const dateFilter = getDateFilter(req);
        let matchStage = { taskStatus: 'completed' };
        if (dateFilter.length > 0) {
            matchStage = { ...matchStage, ...dateFilter[0].$match };
        }

        const leaderboard = await TaskModel.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: "$authorId",
                    completedTasks: { $sum: 1 }
                }
            },
            { $sort: { completedTasks: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: "$user" },
            {
                $project: {
                    userId: "$_id",
                    fullName: "$user.fullName",
                    email: "$user.email",
                    completedTasks: 1,
                    _id: 0
                }
            }
        ]);
        return res.status(200).json({ success: true, data: leaderboard });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getTimelineAnalytics = async (req, res) => {
    try {
        const dateFilter = getDateFilter(req);
        
        let matchFilter = {};
        if (dateFilter.length > 0) {
            matchFilter = dateFilter[0].$match;
        }

        const recentTasks = await TaskModel.find(matchFilter)
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('authorId', 'fullName')
            .lean();

        const recentUsers = await UserModel.find(matchFilter)
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        const events = [];
        
        recentTasks.forEach(task => {
            events.push({
                type: 'task',
                title: `Task "${task.title}" created by ${task.authorId?.fullName || 'User'}`,
                createdAt: task.createdAt
            });
        });

        recentUsers.forEach(user => {
            events.push({
                type: 'user',
                title: `New user joined: ${user.fullName}`,
                createdAt: user.createdAt
            });
        });

        events.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const limitedEvents = events.slice(0, 10);

        return res.status(200).json({ success: true, data: limitedEvents });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
