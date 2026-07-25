import { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import api from '../api/axiosInstance';

import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Button,
  FormControl,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Download as DownloadIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend,
  LineChart, Line,
  ResponsiveContainer
} from 'recharts';
import { useReactToPrint } from 'react-to-print';

// Theme Colors
const COLORS = {
  primary: '#1b2e35',
  accent: '#59e3a7',
  textSecondary: '#797979',
  background: '#f4f6f8',
  white: '#ffffff',
  charts: ['#59e3a7', '#1b2e35', '#797979', '#ff9800', '#f44336']
};

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  const [overview, setOverview] = useState(null);
  const [statusData, setStatusData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [priorityData, setPriorityData] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [timeline, setTimeline] = useState([]);

  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Nexora_Analytics_Report',
  });

  const getFilterDates = useCallback(() => {
    const end = new Date();
    let start = new Date();

    if (filter === '7days') {
      start.setDate(start.getDate() - 7);
    } else if (filter === '30days') {
      start.setDate(start.getDate() - 30);
    } else if (filter === 'year') {
      start.setFullYear(start.getFullYear() - 1);
    } else {
      return ''; // all time
    }

    return `?startDate=${start.toISOString()}&endDate=${end.toISOString()}`;
  }, [filter]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const query = getFilterDates();
        const [overviewRes, statusRes, monthlyRes, priorityRes, leaderboardRes, timelineRes] = await Promise.all([
          api.get(`/analytics/overview${query}`),
          api.get(`/analytics/status${query}`),
          api.get(`/analytics/monthly${query}`),
          api.get(`/analytics/priority${query}`),
          api.get(`/analytics/leaderboard${query}`),
          api.get(`/analytics/timeline${query}`)
        ]);

        setOverview(overviewRes.data.data);

        const formattedStatus = statusRes.data.data.map(s => ({
          name: s.status.charAt(0).toUpperCase() + s.status.slice(1),
          value: s.count
        }));
        setStatusData(formattedStatus);

        const formattedMonthly = monthlyRes.data.data.map(m => ({
          name: `${monthNames[m.month - 1]} ${m.year}`,
          Users: m.usersJoined,
          Tasks: m.tasksCreated
        }));
        setMonthlyData(formattedMonthly);

        const formattedPriority = priorityRes.data.data.map(p => ({
          name: p.priority.charAt(0).toUpperCase() + p.priority.slice(1),
          Count: p.count
        }));
        setPriorityData(formattedPriority);

        setLeaderboard(leaderboardRes.data.data);
        setTimeline(timelineRes.data.data);

        setError(null);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setError("Failed to load analytics data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [filter, getFilterDates]);

  if (loading && !overview) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress sx={{ color: COLORS.accent }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: COLORS.background, minHeight: '100vh' }}>
      {/* Header Actions */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: COLORS.primary, fontFamily: 'Platypi, sans-serif' }}>
          Analytics Dashboard
        </Typography>
        <Box display="flex" gap={2}>
          <FormControl size="small" sx={{ minWidth: 150, backgroundColor: COLORS.white, borderRadius: 1 }}>
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              displayEmpty
            >
              <MenuItem value="all">All Time</MenuItem>
              <MenuItem value="7days">Last 7 Days</MenuItem>
              <MenuItem value="30days">Last 30 Days</MenuItem>
              <MenuItem value="year">This Year</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handlePrint}
            sx={{ backgroundColor: COLORS.primary, '&:hover': { backgroundColor: '#142226' } }}
          >
            Export PDF
          </Button>
        </Box>
      </Box>

      {/* Printable Area */}
      <div ref={componentRef} style={{ padding: '20px', backgroundColor: COLORS.background }}>

        {/* KPI Cards Section */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard title="Total Users" value={overview?.totalUsers || 0} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard title="Total Tasks" value={overview?.totalTasks || 0} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard title="Completed Tasks" value={overview?.completedTasks || 0} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard title="Completion Rate" value={`${overview?.completionRate || 0}%`} />
          </Grid>
        </Grid>

        <Grid container spacing={4} mb={4}>
          {/* Line Chart: Monthly Trend */}
          <Grid item xs={12} md={8}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: COLORS.primary, mb: 3 }}>
                Activity Trend
              </Typography>
              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={monthlyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <RechartsTooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Legend iconType="circle" />
                    <Line type="monotone" dataKey="Users" stroke={COLORS.primary} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="Tasks" stroke={COLORS.accent} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* Pie Chart: Task Status */}
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: COLORS.primary, mb: 1 }}>
                Task Status
              </Typography>
              <Box sx={{ width: '100%', height: 300, flexGrow: 1 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={statusData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS.charts[index % COLORS.charts.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Legend iconType="circle" verticalAlign="bottom" />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Grid container spacing={4}>
          {/* Leaderboard Table */}
          <Grid item xs={12} md={8}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: COLORS.primary, mb: 3 }}>
                Top Productive Users (Completed Tasks)
              </Typography>
              <TableContainer>
                <Table sx={{ minWidth: 500 }} aria-label="leaderboard table">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', color: COLORS.textSecondary }}>Rank</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: COLORS.textSecondary }}>User</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: COLORS.textSecondary }}>Completed Tasks</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {leaderboard.length > 0 ? leaderboard.map((row, index) => (
                      <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell component="th" scope="row">
                          <Typography variant="h6" sx={{ color: index < 3 ? COLORS.accent : COLORS.primary, fontWeight: 'bold' }}>
                            #{index + 1}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar sx={{ bgcolor: COLORS.primary }}>
                              {row.fullName.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" fontWeight="bold">{row.fullName}</Typography>
                              <Typography variant="body2" color="textSecondary">{row.email}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="h6" fontWeight="bold" color={COLORS.primary}>
                            {row.completedTasks}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={3} align="center">No data available.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Activity Timeline */}
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: COLORS.primary, mb: 3 }}>
                Activity Timeline
              </Typography>
              <List disablePadding>
                {timeline.length > 0 ? timeline.map((event, index) => (
                  <Box key={index}>
                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {event.type === 'task' ?
                          <AssignmentIcon sx={{ color: COLORS.accent }} /> :
                          <PersonIcon sx={{ color: COLORS.primary }} />
                        }
                      </ListItemIcon>
                      <ListItemText
                        primary={event.title}
                        secondary={new Date(event.createdAt).toLocaleString()}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 'bold', color: COLORS.primary }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                    {index < timeline.length - 1 && <Divider component="li" />}
                  </Box>
                )) : (
                  <Typography variant="body2" color="textSecondary">No recent activity.</Typography>
                )}
              </List>
            </Paper>
          </Grid>

          {/* Priority Bar Chart */}
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: COLORS.primary, mb: 3 }}>
                Priority Distribution
              </Typography>
              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={priorityData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }} barSize={40}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <RechartsTooltip
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Legend iconType="circle" />
                    <Bar dataKey="Count" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>

      </div>
    </Box>
  );
};

// Reusable KPI Card Component
const KPICard = ({ title, value }) => (
  <Card sx={{
    borderRadius: 3,
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    borderLeft: `4px solid ${COLORS.accent}`,
    transition: 'transform 0.2s',
    '&:hover': { transform: 'translateY(-4px)' }
  }}>
    <CardContent>
      <Typography color={COLORS.textSecondary} variant="subtitle2" gutterBottom textTransform="uppercase" fontWeight="bold">
        {title}
      </Typography>
      <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: COLORS.primary }}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

KPICard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default Analytics;
