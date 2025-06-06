import { Calendar, Coffee, Users } from "lucide-react";
import React, { useState, useEffect } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const HOURS = [
  "9 AM",
  "10 AM",
  "11 AM",
  "12 PM",
  "1 PM",
  "2 PM",
  "3 PM",
  "4 PM",
];

type FocusHistoryEntry = {
  time: string;
  focus: number;
  workDone: number;
};

const MEETING_TYPES: Record<
  string,
  {
    name: string;
    icon: React.ComponentType<{ size?: number }>;
    color: string;
    multiplier: number;
  }
> = {
  lunch: { name: "Lunch", icon: Coffee, color: "bg-yellow-500", multiplier: 1 },
  nextFeature: {
    name: "Next Feature Planning",
    icon: Calendar,
    color: "bg-blue-500",
    multiplier: 0,
  },
  other: {
    name: "Other Meeting",
    icon: Users,
    color: "bg-red-500",
    multiplier: 0.5,
  },
};

export default function DeveloperProductivitySimulator() {
  // Configuration state
  const [config, setConfig] = useState({
    totalFeatures: 10,
    workPerFeature: 20,
    focusGrowthFactor: 1.5,
  });

  // Calendar state (day -> hour -> meeting type)
  const [calendar, setCalendar] = useState(() => {
    const cal: Record<number, Record<number, string | null>> = {};
    for (let day = 0; day < 5; day++) {
      cal[day] = {};
      for (let hour = 0; hour < 8; hour++) {
        cal[day][hour] = hour === 3 ? "lunch" : null; // Lunch at 12 PM
      }
    }
    return cal;
  });

  // Metrics
  const [metrics, setMetrics] = useState({
    totalWeeks: 0,
    totalHours: 0,
    workingHours: 0,
    totalWork: 0,
    avgWorkPerHour: 0,
    avgFeaturesPerWeek: 0,
    focusHistory: [] as FocusHistoryEntry[],
    weeklyFeatures: [] as { week: string; features: number }[],
    debugInfo: {},
  });

  // Add or remove meeting
  const toggleMeeting = (day: number, hour: number, type: string | null) => {
    setCalendar((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [hour]: prev[day][hour] === type ? null : type,
      },
    }));
  };

  type HourData = {
    week: number;
    day: number;
    hour: number;
    focus: number;
    meeting: string | null;
    feature: number;
    workDone: number;
  };

  // Run simulation
  const runSimulation = () => {
    const state = {
      running: true,
      completed: false,
      currentWeek: 1,
      currentDay: 0,
      currentHour: 0,
      currentFeature: 0,
      workOnCurrentFeature: 0,
      featuresCompleted: 0,
      focus: 1,
      history: [] as HourData[],
    };

    const focusHistory: FocusHistoryEntry[] = [];

    const weeklyFeatures: Record<string, number> = {};
    let totalWork = 0;
    let workingHours = 0;
    let totalHours = 0;
    const featureCompletions = [];
    let focusResets = 0;

    while (state.featuresCompleted < config.totalFeatures) {
      const meeting = calendar[state.currentDay]?.[state.currentHour];

      // Record current state
      const hourData: HourData = {
        week: state.currentWeek,
        day: state.currentDay,
        hour: state.currentHour,
        focus: state.focus,
        meeting: meeting,
        feature: state.currentFeature,
        workDone: 0,
      };

      if (meeting) {
        // During meeting: apply focus multiplier
        const multiplier = MEETING_TYPES[meeting].multiplier;
        state.focus = Math.max(1, state.focus * multiplier);
      } else {
        // Working hour
        workingHours++;
        hourData.workDone = state.focus;
        state.workOnCurrentFeature += state.focus;
        totalWork += state.focus;

        // Check if feature is completed
        if (state.workOnCurrentFeature >= config.workPerFeature) {
          state.featuresCompleted++;
          state.currentFeature++;
          state.workOnCurrentFeature = 0;
          state.focus = 1; // Reset focus at feature completion
          focusResets++;
          featureCompletions.push({
            week: state.currentWeek,
            day: state.currentDay,
            hour: state.currentHour,
            previousFocus: hourData.focus,
          });

          // Track weekly features
          const weekKey = `Week ${state.currentWeek}`;
          weeklyFeatures[weekKey] = (weeklyFeatures[weekKey] || 0) + 1;
        } else {
          // Continue working on current feature
          state.focus *= config.focusGrowthFactor;
        }
      }

      focusHistory.push({
        time: `W${state.currentWeek}D${state.currentDay + 1}H${state.currentHour + 1}`,
        focus: hourData.focus,
        workDone: hourData.workDone,
      });

      state.history.push(hourData);
      totalHours++;

      // Advance time
      state.currentHour++;
      if (state.currentHour >= 8) {
        state.currentHour = 0;
        state.currentDay++;
        state.focus = 1; // Reset focus at start of day

        if (state.currentDay >= 5) {
          state.currentDay = 0;
          state.currentWeek++;
        }
      }

      // Safety check to prevent infinite loops
      if (totalHours > 10000) break;
    }

    // Calculate final metrics
    const totalWeeks = Math.ceil(totalHours / 40);
    const avgWorkPerHour = workingHours > 0 ? totalWork / workingHours : 0;
    const avgFeaturesPerWeek =
      totalWeeks > 0 ? config.totalFeatures / totalWeeks : 0;

    // Convert weekly features to array for chart
    const weeklyFeaturesArray = Object.entries(weeklyFeatures).map(
      ([week, count]) => ({
        week,
        features: count,
      }),
    );

    setMetrics({
      totalWeeks,
      totalHours,
      workingHours,
      totalWork,
      avgWorkPerHour: +avgWorkPerHour.toFixed(2),
      avgFeaturesPerWeek: +avgFeaturesPerWeek.toFixed(2),
      focusHistory: focusHistory.slice(0, 200), // Limit for performance
      weeklyFeatures: weeklyFeaturesArray,
      debugInfo: {
        featureCompletions,
        focusResets,
        avgWorkPerFeature: (totalWork / config.totalFeatures).toFixed(2),
      },
    });
  };

  // Auto-run simulation when config or calendar changes
  useEffect(() => {
    runSimulation();
  }, [config, calendar]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Developer Productivity Simulator
        </h1>

        {/* Configuration Panel */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Project Configuration</h2>
          <p className="text-sm text-gray-600 mb-4">
            Focus grows exponentially while working and maintains between
            features. It only resets at the start of each day or when
            interrupted by "Next Feature Planning" meetings.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Features: {config.totalFeatures}
              </label>
              <input
                type="range"
                min="5"
                max="50"
                value={config.totalFeatures}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    totalFeatures: Number.parseInt(e.target.value),
                  })
                }
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Work per Feature: {config.workPerFeature}
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={config.workPerFeature}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    workPerFeature: Number.parseInt(e.target.value),
                  })
                }
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Focus Growth Factor: {config.focusGrowthFactor}x
              </label>
              <input
                type="range"
                min="1.1"
                max="2"
                step="0.1"
                value={config.focusGrowthFactor}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    focusGrowthFactor: Number.parseFloat(e.target.value),
                  })
                }
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Weekly Calendar</h2>
          <div className="mb-4 flex gap-4">
            {Object.entries(MEETING_TYPES).map(([type, info]) => (
              <div key={type} className="flex items-center gap-2">
                <div className={`w-4 h-4 ${info.color} rounded`}></div>
                <span className="text-sm">
                  {info.name} (×{info.multiplier})
                </span>
              </div>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Time</th>
                  {DAYS.map((day) => (
                    <th key={day} className="px-4 py-2 text-center">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HOURS.map((hour, hourIdx) => (
                  <tr key={hourIdx} className="border-t">
                    <td className="px-4 py-2 font-medium">{hour}</td>
                    {DAYS.map((_, dayIdx) => {
                      const meeting = calendar[dayIdx][hourIdx];
                      return (
                        <td key={dayIdx} className="px-4 py-2">
                          <div className="flex gap-1">
                            {Object.keys(MEETING_TYPES).map((type) => (
                              <button
                                key={type}
                                onClick={() =>
                                  toggleMeeting(dayIdx, hourIdx, type)
                                }
                                className={`p-2 rounded ${
                                  meeting === type
                                    ? MEETING_TYPES[type].color + " text-white"
                                    : "bg-gray-200 hover:bg-gray-300"
                                }`}
                              >
                                {React.createElement(MEETING_TYPES[type].icon, {
                                  size: 16,
                                })}
                              </button>
                            ))}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Results */}
        {/* Metrics */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Results</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {metrics.totalWeeks}
              </div>
              <div className="text-gray-600">Weeks to Complete</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {metrics.avgWorkPerHour}
              </div>
              <div className="text-gray-600">Avg Work/Hour</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {metrics.avgFeaturesPerWeek}
              </div>
              <div className="text-gray-600">Avg Features/Week</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {metrics.totalHours > 0
                  ? ((metrics.workingHours / metrics.totalHours) * 100).toFixed(
                      0,
                    )
                  : 0}
                %
              </div>
              <div className="text-gray-600">Time Working</div>
            </div>
          </div>

          {/* Debug Info */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600 grid grid-cols-2 md:grid-cols-4 gap-2">
              <div>Total Work: {metrics.totalWork.toFixed(0)}</div>
              <div>Working Hours: {metrics.workingHours}</div>
              <div>Features Completed: {config.totalFeatures}</div>
              <div>
                Avg Work/Feature: {metrics.debugInfo?.avgWorkPerFeature || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">
              Focus Level Over Time
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.focusHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="focus"
                  stroke="#8884d8"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="workDone"
                  stroke="#82ca9d"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">
              Features Completed per Week
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.weeklyFeatures}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="features" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
