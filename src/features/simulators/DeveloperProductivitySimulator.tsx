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
    multiplier: number;
  }
> = {
  lunch: { name: "Lunch", icon: Coffee, multiplier: 1 },
  nextFeature: {
    name: "Next Feature Planning",
    icon: Calendar,
    multiplier: 0,
  },
  other: {
    name: "Other Meeting",
    icon: Users,
    multiplier: 0.5,
  },
};

const DeveloperProductivitySimulator = () => {
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
    debugInfo: {
      featureCompletions: [],
      focusResets: 0,
      avgWorkPerFeature: "0",
    },
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
    <div className="w-full mx-auto">
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: var(--accent);
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          transition: all 0.1s ease;
        }
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          background: var(--secondary);
        }
        .slider {
          background: var(--foreground);
          opacity: 0.3;
        }
      `}</style>

      {/* Configuration Panel */}
      <div
        className="border border-current rounded p-4 mb-4"
        style={{ backgroundColor: "var(--background)" }}
      >
        <h2
          className="text-sm font-semibold mb-2"
          style={{ color: "var(--accent)" }}
        >
          Project Configuration
        </h2>
        <p
          className="text-xs mb-4"
          style={{ color: "var(--foreground)", opacity: 0.8 }}
        >
          Focus grows exponentially while working and maintains between
          features. It only resets at the start of each day or when
          interrupted by &quot;Next Feature Planning&quot; meetings.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label
              className="block text-xs font-medium"
              style={{ color: "var(--foreground)" }}
              htmlFor="totalFeatures"
            >
              Total Features:{" "}
              <span className="font-mono" style={{ color: "var(--accent)" }}>
                {config.totalFeatures}
              </span>
            </label>
            <input
              id="totalFeatures"
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
              className="w-full h-1 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
          <div className="space-y-1">
            <label
              className="block text-xs font-medium"
              style={{ color: "var(--foreground)" }}
              htmlFor="workPerFeature"
            >
              Work per Feature:{" "}
              <span className="font-mono" style={{ color: "var(--secondary)" }}>
                {config.workPerFeature}
              </span>
            </label>
            <input
              id="workPerFeature"
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
              className="w-full h-1 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
          <div className="space-y-1">
            <label
              className="block text-xs font-medium"
              style={{ color: "var(--foreground)" }}
              htmlFor="focusGrowthFactor"
            >
              Focus Growth Factor:{" "}
              <span className="font-mono" style={{ color: "var(--tertiary)" }}>
                {config.focusGrowthFactor}x
              </span>
            </label>
            <input
              id="focusGrowthFactor"
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
              className="w-full h-1 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div
        className="border border-current rounded p-4 mb-4"
        style={{ backgroundColor: "var(--background)" }}
      >
        <h2
          className="text-sm font-semibold mb-3"
          style={{ color: "var(--accent)" }}
        >
          Weekly Calendar
        </h2>
        <div className="mb-4 flex gap-4 text-xs">
          {Object.entries(MEETING_TYPES).map(([type, info]) => (
            <div key={type} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{
                  backgroundColor:
                    type === "lunch"
                      ? "var(--highlight)"
                      : type === "nextFeature"
                        ? "var(--error)"
                        : "var(--tertiary)",
                }}
              />
              <span style={{ color: "var(--foreground)" }}>
                {info.name} (×{info.multiplier})
              </span>
            </div>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th
                  className="px-3 py-2 text-left text-xs font-semibold"
                  style={{ color: "var(--accent)" }}
                >
                  Time
                </th>
                {DAYS.map((day) => (
                  <th
                    key={day}
                    className="px-3 py-2 text-center text-xs font-semibold"
                    style={{ color: "var(--accent)" }}
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOURS.map((hour, hourIdx) => (
                <tr key={`hour-${hourIdx}`} className="border-t border-current">
                  <td
                    className="px-3 py-2 font-medium text-xs"
                    style={{ color: "var(--foreground)" }}
                  >
                    {hour}
                  </td>
                  {DAYS.map((_, dayIdx) => {
                    const meeting = calendar[dayIdx][hourIdx];
                    return (
                      <td key={`day-${dayIdx}`} className="px-3 py-1">
                        <div className="flex gap-1">
                          {Object.keys(MEETING_TYPES).map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() =>
                                toggleMeeting(dayIdx, hourIdx, type)
                              }
                              className="p-1.5 rounded border border-current transition-colors"
                              style={{
                                backgroundColor:
                                  meeting === type
                                    ? type === "lunch"
                                      ? "var(--highlight)"
                                      : type === "nextFeature"
                                        ? "var(--error)"
                                        : "var(--tertiary)"
                                    : "var(--background)",
                                color:
                                  meeting === type
                                    ? "var(--background)"
                                    : "var(--foreground)",
                              }}
                            >
                              {React.createElement(MEETING_TYPES[type].icon, {
                                size: 12,
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

      {/* Metrics */}
      <div className="flex gap-3 mb-4">
        <div
          className="border border-current rounded p-3 flex-1"
          style={{
            backgroundColor: "var(--background)",
            borderLeftColor: "var(--secondary)",
            borderLeftWidth: "4px",
          }}
        >
          <div
            className="flex items-center gap-1 mb-1"
            style={{ color: "var(--secondary)" }}
          >
            <Calendar className="w-4 h-4" />
            <span className="text-xs font-semibold">Duration</span>
          </div>
          <div
            className="text-xl font-bold"
            style={{ color: "var(--foreground)" }}
          >
            {metrics.totalWeeks}
          </div>
          <div
            className="text-xs"
            style={{ color: "var(--foreground)", opacity: 0.7 }}
          >
            weeks
          </div>
        </div>

        <div
          className="border border-current rounded p-3 flex-1"
          style={{
            backgroundColor: "var(--background)",
            borderLeftColor: "var(--accent)",
            borderLeftWidth: "4px",
          }}
        >
          <div
            className="flex items-center gap-1 mb-1"
            style={{ color: "var(--accent)" }}
          >
            <Coffee className="w-4 h-4" />
            <span className="text-xs font-semibold">Work/Hour</span>
          </div>
          <div
            className="text-xl font-bold"
            style={{ color: "var(--foreground)" }}
          >
            {metrics.avgWorkPerHour}
          </div>
          <div
            className="text-xs"
            style={{ color: "var(--foreground)", opacity: 0.7 }}
          >
            average
          </div>
        </div>

        <div
          className="border border-current rounded p-3 flex-1"
          style={{
            backgroundColor: "var(--background)",
            borderLeftColor: "var(--tertiary)",
            borderLeftWidth: "4px",
          }}
        >
          <div
            className="flex items-center gap-1 mb-1"
            style={{ color: "var(--tertiary)" }}
          >
            <Users className="w-4 h-4" />
            <span className="text-xs font-semibold">Features/Week</span>
          </div>
          <div
            className="text-xl font-bold"
            style={{ color: "var(--foreground)" }}
          >
            {metrics.avgFeaturesPerWeek}
          </div>
          <div
            className="text-xs"
            style={{ color: "var(--foreground)", opacity: 0.7 }}
          >
            delivery
          </div>
        </div>

        <div
          className="border border-current rounded p-3 flex-1"
          style={{
            backgroundColor: "var(--background)",
            borderLeftColor: "var(--highlight)",
            borderLeftWidth: "4px",
          }}
        >
          <div
            className="flex items-center gap-1 mb-1"
            style={{ color: "var(--highlight)" }}
          >
            <Users className="w-4 h-4" />
            <span className="text-xs font-semibold">Focus Time</span>
          </div>
          <div
            className="text-xl font-bold"
            style={{ color: "var(--foreground)" }}
          >
            {metrics.totalHours > 0
              ? ((metrics.workingHours / metrics.totalHours) * 100).toFixed(
                  0,
                )
              : 0}
            %
          </div>
          <div
            className="text-xs"
            style={{ color: "var(--foreground)", opacity: 0.7 }}
          >
            productive
          </div>
        </div>
      </div>

      {/* Debug Info */}
      <div
        className="border border-current rounded p-3 mb-4"
        style={{ backgroundColor: "var(--background)" }}
      >
        <div
          className="text-xs grid grid-cols-2 md:grid-cols-4 gap-2"
          style={{ color: "var(--foreground)", opacity: 0.7 }}
        >
          <div className="font-mono">Total Work: {metrics.totalWork.toFixed(0)}</div>
          <div className="font-mono">Working Hours: {metrics.workingHours}</div>
          <div className="font-mono">Features Completed: {config.totalFeatures}</div>
          <div className="font-mono">
            Avg Work/Feature: {metrics.debugInfo.avgWorkPerFeature}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div
          className="border border-current rounded p-4"
          style={{ backgroundColor: "var(--background)" }}
        >
          <h3
            className="text-sm font-semibold mb-3"
            style={{ color: "var(--accent)" }}
          >
            Focus Level Over Time
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart
              data={metrics.focusHistory}
              margin={{ top: 5, right: 5, left: 5, bottom: 35 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10 }}
                label={{
                  value: "Time",
                  position: "insideBottom",
                  offset: -5,
                  style: { fontSize: 10 },
                }}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                label={{
                  value: "Focus Level",
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: 10 },
                }}
              />
              <Tooltip
                formatter={(value, name) => [
                  value,
                  name === "focus" ? "Focus Level" : "Work Done",
                ]}
                contentStyle={{ fontSize: 12 }}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: "15px" }}
                verticalAlign="bottom"
                height={30}
              />
              <Line
                type="monotone"
                dataKey="focus"
                stroke="var(--accent)"
                strokeWidth={2}
                name="Focus"
                dot={{ fill: "var(--accent)", r: 1 }}
                animationDuration={200}
              />
              <Line
                type="monotone"
                dataKey="workDone"
                stroke="var(--secondary)"
                strokeWidth={2}
                name="Work Done"
                dot={{ fill: "var(--secondary)", r: 1 }}
                animationDuration={200}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div
          className="border border-current rounded p-4"
          style={{ backgroundColor: "var(--background)" }}
        >
          <h3
            className="text-sm font-semibold mb-3"
            style={{ color: "var(--accent)" }}
          >
            Features Completed per Week
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={metrics.weeklyFeatures}
              margin={{ top: 5, right: 5, left: 5, bottom: 35 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 10 }}
                label={{
                  value: "Week",
                  position: "insideBottom",
                  offset: -5,
                  style: { fontSize: 10 },
                }}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                label={{
                  value: "Features",
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: 10 },
                }}
              />
              <Tooltip
                formatter={(value, name) => [`${value} features`, "Completed"]}
                labelFormatter={(week) => `${week}`}
                contentStyle={{ fontSize: 12 }}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: "15px" }}
                verticalAlign="bottom"
                height={30}
              />
              <Bar
                dataKey="features"
                fill="var(--tertiary)"
                name="Features"
                animationDuration={200}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DeveloperProductivitySimulator;