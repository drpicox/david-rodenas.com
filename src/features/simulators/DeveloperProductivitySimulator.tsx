import React, { useState, useEffect } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Simulation functions
const normalize = (x) => Math.max(0, Math.min(100, x));

const getMeeting = (calendar, meetingTypes, hour, day) => {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const timeSlots = Array.from({ length: 8 }, (_, i) => `${9 + i}:00`);

  const key = `${days[day]}-${timeSlots[hour]}`;
  const meetingType = calendar[key];

  return meetingType ? meetingTypes[meetingType] : null;
};

const simulateProductivity = (
  focus,
  fatigue,
  featureSize,
  weeks,
  calendar,
  meetingTypes,
) => {
  const results = [];
  let accumulatedProductivity = 0;
  let completedFeatures = 0;

  for (let week = 0; week < weeks; week++) {
    for (let day = 0; day < 5; day++) {
      let hourFocus = 0;
      let hourFatigue = 0;

      for (let hour = 0; hour < 8; hour++) {
        const meeting = getMeeting(calendar, meetingTypes, hour, day);

        if (meeting) {
          hourFocus = normalize(hourFocus + meeting.focus);
          hourFatigue = normalize(hourFatigue + meeting.fatigue);

          results.push({
            hourFocus,
            hourFatigue,
            hourProductivity: 0,
            accumulatedProductivity,
            completedFeatures,
            featureCompleted: false,
            hour,
            day,
            week,
          });
        } else {
          const remainingWork = featureSize - accumulatedProductivity;

          hourFocus = normalize(hourFocus + focus);
          hourFatigue = normalize(hourFatigue + fatigue);
          const potentialProductivity = normalize(hourFocus - hourFatigue);

          const featureCompleted = potentialProductivity > remainingWork;

          let hourProductivity;
          if (featureCompleted) {
            hourProductivity = remainingWork;
            completedFeatures += 1;
            accumulatedProductivity = 0;
          } else {
            hourProductivity = potentialProductivity;
            accumulatedProductivity += hourProductivity;
          }

          results.push({
            hourFocus,
            hourFatigue,
            hourProductivity,
            accumulatedProductivity,
            completedFeatures,
            featureCompleted,
            hour,
            day,
            week,
          });

          if (featureCompleted) {
            hourFocus = 0;
            accumulatedProductivity = 0;
          }
        }
      }
    }
  }

  return results;
};

const DeveloperProductivitySimulator = () => {
  const [focus, setFocus] = useState(25);
  const [fatigue, setFatigue] = useState(15);
  const [featureSize, setFeatureSize] = useState(300);
  const [weeks, setWeeks] = useState(8);
  const [currentMeetingType, setCurrentMeetingType] =
    useState("🏃 Sprint plan");
  const [showNewMeetingForm, setShowNewMeetingForm] = useState(false);
  const [newMeetingName, setNewMeetingName] = useState("");
  const [newMeetingFocus, setNewMeetingFocus] = useState(0);
  const [newMeetingFatigue, setNewMeetingFatigue] = useState(0);
  const [baselineResults, setBaselineResults] = useState(null);
  const [showComparison, setShowComparison] = useState(false);

  const [meetingTypes, setMeetingTypes] = useState({
    "🍽️ Lunch": { focus: -100, fatigue: -100, color: "var(--accent)" },
    "🏃 Sprint plan": { focus: -100, fatigue: 50, color: "var(--secondary)" },
    "😴 Boring": { focus: -50, fatigue: -25, color: "var(--error)" },
  });

  const [calendar, setCalendar] = useState(() => {
    const initialCalendar = {};
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    days.forEach((day) => {
      initialCalendar[`${day}-12:00`] = "🍽️ Lunch";
    });
    return initialCalendar;
  });

  const [isDragging, setIsDragging] = useState(false);
  const [dragAction, setDragAction] = useState(null);
  const [simulationResults, setSimulationResults] = useState([]);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const timeSlots = Array.from({ length: 8 }, (_, i) => `${9 + i}:00`);
  const availableColors = [
    "var(--tertiary)",
    "var(--highlight)",
    "var(--secondary)",
    "var(--accent)",
    "var(--error)",
  ];

  const addMeetingType = () => {
    setShowNewMeetingForm(true);
  };

  const createNewMeetingType = () => {
    if (!newMeetingName.trim()) return;

    const usedColors = Object.values(meetingTypes).map((m) => m.color);
    const availableColor =
      availableColors.find((c) => !usedColors.includes(c)) ||
      availableColors[0];

    const newType = {
      focus: newMeetingFocus,
      fatigue: newMeetingFatigue,
      color: availableColor,
    };

    setMeetingTypes({ ...meetingTypes, [newMeetingName]: newType });
    setCurrentMeetingType(newMeetingName);

    setNewMeetingName("");
    setNewMeetingFocus(0);
    setNewMeetingFatigue(0);
    setShowNewMeetingForm(false);
  };

  const updateMeetingType = (field, value) => {
    setMeetingTypes({
      ...meetingTypes,
      [currentMeetingType]: {
        ...meetingTypes[currentMeetingType],
        [field]: Number.parseInt(value),
      },
    });
  };

  const handleMouseDown = (day, timeSlot) => {
    const key = `${day}-${timeSlot}`;
    const isOccupied = !!calendar[key];

    setIsDragging(true);
    setDragAction(isOccupied ? "remove" : "add");

    if (isOccupied) {
      setCalendar((prev) => {
        const newCalendar = { ...prev };
        delete newCalendar[key];
        return newCalendar;
      });
    } else {
      setCalendar((prev) => ({
        ...prev,
        [key]: currentMeetingType,
      }));
    }
  };

  const handleMouseEnter = (day, timeSlot) => {
    if (!isDragging) return;

    const key = `${day}-${timeSlot}`;
    const isOccupied = !!calendar[key];

    if (dragAction === "add" && !isOccupied) {
      setCalendar((prev) => ({
        ...prev,
        [key]: currentMeetingType,
      }));
    } else if (dragAction === "remove" && isOccupied) {
      setCalendar((prev) => {
        const newCalendar = { ...prev };
        delete newCalendar[key];
        return newCalendar;
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragAction(null);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const results = simulateProductivity(
        focus,
        fatigue,
        featureSize,
        weeks,
        calendar,
        meetingTypes,
      );
      setSimulationResults(results);
    }, 500);
    return () => clearTimeout(timer);
  }, [focus, fatigue, featureSize, weeks, calendar, meetingTypes]);

  const getWeekSummaryData = () => {
    const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const weekSummary = dayNames.map((day) => ({
      day: day.slice(0, 3),
      productivity: 0,
      features: 0,
      meetings: 0,
    }));

    simulationResults.forEach((result) => {
      const dayIndex = result.day;
      weekSummary[dayIndex].productivity += result.hourProductivity;
      if (result.featureCompleted) {
        weekSummary[dayIndex].features += 1;
      }
      if (result.hourProductivity === 0) {
        weekSummary[dayIndex].meetings += 1;
      }
    });

    return weekSummary;
  };

  const getSimulationSummary = (results) => {
    if (!results || results.length === 0) return null;
    const { completedFeatures = 0, accumulatedProductivity = 0 } =
      results[results.length - 1] ?? {};
    const uncompletedFeatures =
      Math.round((10 * accumulatedProductivity) / featureSize) / 10;

    const totalFeatures = completedFeatures + uncompletedFeatures;
    const totalProductivity =
      completedFeatures * featureSize + accumulatedProductivity;
    const averageFeaturesPerWeek =
      Math.round((totalFeatures / weeks) * 100) / 100;
    const averageProductivityPerWeek =
      Math.round((totalProductivity / weeks) * 100) / 100;

    return {
      totalFeatures,
      totalProductivity,
      averageFeaturesPerWeek,
      averageProductivityPerWeek,
    };
  };

  const saveAsBaseline = () => {
    setBaselineResults(simulationResults);
    setShowComparison(true);
  };

  const clearBaseline = () => {
    setBaselineResults(null);
    setShowComparison(false);
  };

  const getHeatmapData = () => {
    // Initialize data structure for 8 hours x 5 days
    const heatmapData = {
      focus: Array(8)
        .fill(null)
        .map(() => Array(5).fill(0)),
      fatigue: Array(8)
        .fill(null)
        .map(() => Array(5).fill(0)),
      productivity: Array(8)
        .fill(null)
        .map(() => Array(5).fill(0)),
      features: Array(8)
        .fill(null)
        .map(() => Array(5).fill(0)),
      counts: Array(8)
        .fill(null)
        .map(() => Array(5).fill(0)),
    };

    // Aggregate data across all weeks
    simulationResults.forEach((result) => {
      const {
        hour,
        day,
        hourFocus,
        hourFatigue,
        hourProductivity,
        featureCompleted,
      } = result;
      heatmapData.focus[hour][day] += hourFocus;
      heatmapData.fatigue[hour][day] += hourFatigue;
      heatmapData.productivity[hour][day] += hourProductivity;
      if (featureCompleted) {
        heatmapData.features[hour][day] += 1;
      }
      heatmapData.counts[hour][day] += 1;
    });

    // Calculate averages and find min/max for scaling
    const averages = {
      focus: {
        data: [],
        min: Number.POSITIVE_INFINITY,
        max: Number.NEGATIVE_INFINITY,
      },
      fatigue: {
        data: [],
        min: Number.POSITIVE_INFINITY,
        max: Number.NEGATIVE_INFINITY,
      },
      productivity: {
        data: [],
        min: Number.POSITIVE_INFINITY,
        max: Number.NEGATIVE_INFINITY,
      },
      features: {
        data: [],
        min: Number.POSITIVE_INFINITY,
        max: Number.NEGATIVE_INFINITY,
      },
    };

    for (let hour = 0; hour < 8; hour++) {
      averages.focus.data[hour] = [];
      averages.fatigue.data[hour] = [];
      averages.productivity.data[hour] = [];
      averages.features.data[hour] = [];

      for (let day = 0; day < 5; day++) {
        const count = heatmapData.counts[hour][day];

        const avgFocus = count > 0 ? heatmapData.focus[hour][day] / count : 0;
        const avgFatigue =
          count > 0 ? heatmapData.fatigue[hour][day] / count : 0;
        const avgProductivity =
          count > 0 ? heatmapData.productivity[hour][day] / count : 0;
        const totalFeatures = heatmapData.features[hour][day];

        averages.focus.data[hour][day] = avgFocus;
        averages.fatigue.data[hour][day] = avgFatigue;
        averages.productivity.data[hour][day] = avgProductivity;
        averages.features.data[hour][day] = totalFeatures;

        // Update min/max for scaling
        averages.focus.min = Math.min(averages.focus.min, avgFocus);
        averages.focus.max = Math.max(averages.focus.max, avgFocus);
        averages.fatigue.min = Math.min(averages.fatigue.min, avgFatigue);
        averages.fatigue.max = Math.max(averages.fatigue.max, avgFatigue);
        averages.productivity.min = Math.min(
          averages.productivity.min,
          avgProductivity,
        );
        averages.productivity.max = Math.max(
          averages.productivity.max,
          avgProductivity,
        );
        averages.features.min = Math.min(averages.features.min, totalFeatures);
        averages.features.max = Math.max(averages.features.max, totalFeatures);
      }
    }

    return averages;
  };

  const getHeatmapColor = (value, min, max) => {
    if (max === min) return 0.1;
    const intensity = (value - min) / (max - min);
    return Math.max(0.1, Math.min(1, intensity));
  };

  const renderHeatmap = (title, data, min, max, color) => (
    <div className="border border-current rounded p-3">
      <h4
        className="text-xs font-semibold mb-2"
        style={{ color: "var(--foreground)" }}
      >
        {title}
      </h4>
      <div className="grid grid-cols-6 gap-px">
        <div
          className="w-8 text-xs font-mono opacity-60"
          style={{ color: "var(--foreground)" }}
        ></div>
        {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => (
          <div
            key={day}
            className="w-8 text-xs font-mono text-center opacity-60"
            style={{ color: "var(--foreground)" }}
          >
            {day}
          </div>
        ))}
        {timeSlots.map((timeSlot, hour) => (
          <React.Fragment key={timeSlot}>
            <div
              className="w-8 text-xs font-mono opacity-60"
              style={{ color: "var(--foreground)" }}
            >
              {timeSlot.split(":")[0]}
            </div>
            {data[hour].map((value, day) => {
              const opacity = getHeatmapColor(value, min, max);
              return (
                <div
                  key={day}
                  className="w-8 h-6 border border-current flex items-center justify-center"
                  style={{
                    backgroundColor: color,
                    opacity: opacity,
                  }}
                  title={`${timeSlot} ${["Mon", "Tue", "Wed", "Thu", "Fri"][day]}: ${Math.round(value * 100) / 100}`}
                >
                  <span
                    className="text-xs font-mono"
                    style={{
                      color:
                        opacity > 0.5
                          ? "var(--background)"
                          : "var(--foreground)",
                    }}
                  >
                    {Math.round(value)}
                  </span>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Controls */}
      <div className="border border-current rounded p-4 mb-4">
        <h2
          className="text-sm font-semibold mb-3"
          style={{ color: "var(--accent)" }}
        >
          Parameters
        </h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <span
              className="text-sm font-mono w-16"
              style={{ color: "var(--foreground)" }}
            >
              Focus: {focus}
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={focus}
              onChange={(e) => setFocus(Number.parseInt(e.target.value))}
              className="flex-1 h-1 rounded-lg appearance-none cursor-pointer slider focus-slider"
              style={{ background: "var(--foreground)", opacity: 0.3 }}
            />
          </div>

          <div className="flex items-center space-x-3">
            <span
              className="text-sm font-mono w-16"
              style={{ color: "var(--foreground)" }}
            >
              Fatigue: {fatigue}
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={fatigue}
              onChange={(e) => setFatigue(Number.parseInt(e.target.value))}
              className="flex-1 h-1 rounded-lg appearance-none cursor-pointer slider fatigue-slider"
              style={{ background: "var(--foreground)", opacity: 0.3 }}
            />
          </div>

          <div className="flex items-center space-x-3">
            <span
              className="text-sm font-mono w-20"
              style={{ color: "var(--foreground)" }}
            >
              Feature: {featureSize}
            </span>
            <input
              type="range"
              min="0"
              max="1000"
              value={featureSize}
              onChange={(e) => setFeatureSize(Number.parseInt(e.target.value))}
              className="flex-1 h-1 rounded-lg appearance-none cursor-pointer slider productivity-slider"
              style={{ background: "var(--foreground)", opacity: 0.3 }}
            />
          </div>

          <div className="flex items-center space-x-3">
            <span
              className="text-sm font-mono w-16"
              style={{ color: "var(--foreground)" }}
            >
              Weeks: {weeks}
            </span>
            <input
              type="range"
              min="1"
              max="16"
              value={weeks}
              onChange={(e) => setWeeks(Number.parseInt(e.target.value))}
              className="flex-1 h-1 rounded-lg appearance-none cursor-pointer slider features-slider"
              style={{ background: "var(--foreground)", opacity: 0.3 }}
            />
          </div>
        </div>

        {/* Meeting Type Section */}
        <div className="mb-4">
          <h3
            className="text-sm font-semibold mb-3"
            style={{ color: "var(--secondary)" }}
          >
            Meeting Type
          </h3>

          <div className="flex items-center space-x-3 flex-wrap gap-y-2">
            <select
              value={currentMeetingType}
              onChange={(e) => {
                if (e.target.value === "custom") {
                  addMeetingType();
                } else {
                  setCurrentMeetingType(e.target.value);
                }
              }}
              className="px-3 py-1 border border-current rounded"
              style={{
                backgroundColor: "var(--background)",
                color: "var(--foreground)",
              }}
            >
              {Object.keys(meetingTypes).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
              <option value="custom">+ New meeting type</option>
            </select>
            <div
              className="w-3 h-3 rounded"
              style={{
                backgroundColor: meetingTypes[currentMeetingType]?.color,
              }}
            ></div>
            {currentMeetingType && meetingTypes[currentMeetingType] && (
              <>
                <div className="flex items-center space-x-2">
                  <span
                    className="text-sm"
                    style={{ color: "var(--foreground)" }}
                  >
                    Focus:
                  </span>
                  <input
                    type="number"
                    min="-100"
                    max="100"
                    value={meetingTypes[currentMeetingType].focus}
                    onChange={(e) => updateMeetingType("focus", e.target.value)}
                    className="px-2 py-1 border border-current rounded w-20 font-mono"
                    style={{
                      backgroundColor: "var(--background)",
                      color: "var(--foreground)",
                    }}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className="text-sm"
                    style={{ color: "var(--foreground)" }}
                  >
                    Fatigue:
                  </span>
                  <input
                    type="number"
                    min="-100"
                    max="100"
                    value={meetingTypes[currentMeetingType].fatigue}
                    onChange={(e) =>
                      updateMeetingType("fatigue", e.target.value)
                    }
                    className="px-2 py-1 border border-current rounded w-20 font-mono"
                    style={{
                      backgroundColor: "var(--background)",
                      color: "var(--foreground)",
                    }}
                  />
                </div>
              </>
            )}
          </div>

          {showNewMeetingForm && (
            <div
              className="mb-3 p-3 border border-current rounded"
              style={{ backgroundColor: "var(--background)" }}
            >
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  placeholder="Meeting name"
                  value={newMeetingName}
                  onChange={(e) => setNewMeetingName(e.target.value)}
                  className="px-2 py-1 border border-current rounded flex-1"
                  style={{
                    backgroundColor: "var(--background)",
                    color: "var(--foreground)",
                  }}
                />
                <span
                  className="text-sm"
                  style={{ color: "var(--foreground)" }}
                >
                  Focus:
                </span>
                <input
                  type="number"
                  min="-100"
                  max="100"
                  value={newMeetingFocus}
                  onChange={(e) =>
                    setNewMeetingFocus(Number.parseInt(e.target.value) || 0)
                  }
                  className="px-2 py-1 border border-current rounded w-20 font-mono"
                  style={{
                    backgroundColor: "var(--background)",
                    color: "var(--foreground)",
                  }}
                />
                <span
                  className="text-sm"
                  style={{ color: "var(--foreground)" }}
                >
                  Fatigue:
                </span>
                <input
                  type="number"
                  min="-100"
                  max="100"
                  value={newMeetingFatigue}
                  onChange={(e) =>
                    setNewMeetingFatigue(Number.parseInt(e.target.value) || 0)
                  }
                  className="px-2 py-1 border border-current rounded w-20 font-mono"
                  style={{
                    backgroundColor: "var(--background)",
                    color: "var(--foreground)",
                  }}
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={createNewMeetingType}
                  className="px-3 py-1 border border-current rounded text-sm hover:opacity-80"
                  style={{
                    backgroundColor: "var(--accent)",
                    color: "var(--background)",
                  }}
                >
                  Create
                </button>
                <button
                  onClick={() => setShowNewMeetingForm(false)}
                  className="px-3 py-1 border border-current rounded text-sm hover:opacity-80"
                  style={{
                    backgroundColor: "var(--error)",
                    color: "var(--background)",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Calendar */}
      <div className="border border-current rounded p-4 mb-4">
        <h2
          className="text-sm font-semibold mb-3"
          style={{ color: "var(--secondary)" }}
        >
          Weekly Calendar
        </h2>
        <div
          className="border border-current rounded overflow-hidden select-none"
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            className="grid grid-cols-6"
            style={{ backgroundColor: "var(--background)" }}
          >
            <div
              className="p-2 text-sm font-semibold border-r border-current"
              style={{ color: "var(--accent)" }}
            >
              Time
            </div>
            {days.map((day) => (
              <div
                key={day}
                className="p-2 text-sm font-semibold text-center border-r border-current last:border-r-0"
                style={{ color: "var(--accent)" }}
              >
                {day.slice(0, 3)}
              </div>
            ))}
          </div>

          {timeSlots.map((timeSlot) => (
            <div
              key={timeSlot}
              className="grid grid-cols-6 border-t border-current"
            >
              <div
                className="p-2 text-sm font-mono border-r border-current"
                style={{
                  backgroundColor: "var(--background)",
                  color: "var(--foreground)",
                  opacity: 0.7,
                }}
              >
                {timeSlot}
              </div>
              {days.map((day) => {
                const key = `${day}-${timeSlot}`;
                const meetingType = calendar[key];
                const meeting = meetingType ? meetingTypes[meetingType] : null;
                return (
                  <div
                    key={day}
                    className="p-1 border-r border-current last:border-r-0 cursor-pointer hover:opacity-80"
                    style={{
                      backgroundColor: meeting
                        ? meeting.color
                        : "var(--background)",
                      opacity: meeting ? 0.8 : 1,
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleMouseDown(day, timeSlot);
                    }}
                    onMouseEnter={() => handleMouseEnter(day, timeSlot)}
                  >
                    {meeting && (
                      <div
                        className="text-xs font-semibold truncate"
                        style={{ color: "var(--background)" }}
                      >
                        {meetingType}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="border border-current rounded p-4">
        <h2
          className="text-sm font-semibold mb-4"
          style={{ color: "var(--accent)" }}
        >
          Simulation Results
        </h2>
        {simulationResults.length > 0 ? (
          <div className="space-y-4">
            {/* Key Metrics */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3
                  className="text-sm font-semibold"
                  style={{ color: "var(--accent)" }}
                >
                  Current Results
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={saveAsBaseline}
                    className="px-3 py-1 border border-current rounded text-sm hover:opacity-80"
                    style={{
                      backgroundColor: "var(--secondary)",
                      color: "var(--background)",
                    }}
                  >
                    Save as Baseline
                  </button>
                  {baselineResults && (
                    <button
                      onClick={clearBaseline}
                      className="px-3 py-1 border border-current rounded text-sm hover:opacity-80"
                      style={{
                        backgroundColor: "var(--error)",
                        color: "var(--background)",
                      }}
                    >
                      Clear Baseline
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(() => {
                  const currentSummary =
                    getSimulationSummary(simulationResults);
                  const baselineSummary = getSimulationSummary(baselineResults);

                  return (
                    <>
                      <div
                        className="border border-current rounded p-3 text-center"
                        style={{
                          backgroundColor: "var(--background)",
                          borderLeftColor: "var(--accent)",
                          borderLeftWidth: "4px",
                        }}
                      >
                        <div
                          className="text-2xl font-bold font-mono"
                          style={{ color: "var(--accent)" }}
                        >
                          {currentSummary?.totalFeatures || 0}
                        </div>
                        <div
                          className="text-xs mb-1"
                          style={{ color: "var(--foreground)", opacity: 0.7 }}
                        >
                          Completed Features
                        </div>
                        <div
                          className="text-xs font-mono"
                          style={{ color: "var(--accent)", opacity: 0.8 }}
                        >
                          {currentSummary?.averageFeaturesPerWeek || 0}/week avg
                        </div>
                        {showComparison && baselineSummary && (
                          <div
                            className="text-xs font-mono mt-1"
                            style={{
                              color:
                                currentSummary.totalFeatures >=
                                baselineSummary.totalFeatures
                                  ? "var(--tertiary)"
                                  : "var(--error)",
                              opacity: 0.8,
                            }}
                          >
                            {currentSummary.totalFeatures >=
                            baselineSummary.totalFeatures
                              ? "+"
                              : ""}
                            {currentSummary.totalFeatures -
                              baselineSummary.totalFeatures}{" "}
                            vs baseline
                          </div>
                        )}
                      </div>

                      <div
                        className="border border-current rounded p-3 text-center"
                        style={{
                          backgroundColor: "var(--background)",
                          borderLeftColor: "var(--secondary)",
                          borderLeftWidth: "4px",
                        }}
                      >
                        <div
                          className="text-2xl font-bold font-mono"
                          style={{ color: "var(--secondary)" }}
                        >
                          {Math.round(currentSummary?.totalProductivity || 0)}
                        </div>
                        <div
                          className="text-xs mb-1"
                          style={{ color: "var(--foreground)", opacity: 0.7 }}
                        >
                          Total Productivity
                        </div>
                        <div
                          className="text-xs font-mono"
                          style={{ color: "var(--secondary)", opacity: 0.8 }}
                        >
                          {Math.round(
                            currentSummary?.averageProductivityPerWeek || 0,
                          )}
                          /week avg
                        </div>
                        {showComparison && baselineSummary && (
                          <div
                            className="text-xs font-mono mt-1"
                            style={{
                              color:
                                currentSummary.totalProductivity >=
                                baselineSummary.totalProductivity
                                  ? "var(--tertiary)"
                                  : "var(--error)",
                              opacity: 0.8,
                            }}
                          >
                            {currentSummary.totalProductivity >=
                            baselineSummary.totalProductivity
                              ? "+"
                              : ""}
                            {Math.round(
                              currentSummary.totalProductivity -
                                baselineSummary.totalProductivity,
                            )}{" "}
                            vs baseline
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Hourly Heat Maps */}
            <div
              className="border border-current rounded p-4"
              style={{ backgroundColor: "var(--background)" }}
            >
              <h3
                className="text-sm font-semibold mb-3"
                style={{ color: "var(--accent)" }}
              >
                Hourly Patterns
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(() => {
                  const heatmapData = getHeatmapData();
                  return (
                    <>
                      {renderHeatmap(
                        "Average Focus",
                        heatmapData.focus.data,
                        heatmapData.focus.min,
                        heatmapData.focus.max,
                        "var(--accent)",
                      )}
                      {renderHeatmap(
                        "Average Fatigue",
                        heatmapData.fatigue.data,
                        heatmapData.fatigue.min,
                        heatmapData.fatigue.max,
                        "var(--error)",
                      )}
                      {renderHeatmap(
                        "Average Productivity",
                        heatmapData.productivity.data,
                        heatmapData.productivity.min,
                        heatmapData.productivity.max,
                        "var(--secondary)",
                      )}
                      {renderHeatmap(
                        "Completed Features",
                        heatmapData.features.data,
                        heatmapData.features.min,
                        heatmapData.features.max,
                        "var(--tertiary)",
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Week Summary Chart */}
            <div
              className="border border-current rounded p-4"
              style={{ backgroundColor: "var(--background)" }}
            >
              <h3
                className="text-sm font-semibold mb-3"
                style={{ color: "var(--accent)" }}
              >
                Weekly Productivity Summary
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={getWeekSummaryData()}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--foreground)"
                      opacity={0.3}
                    />
                    <XAxis
                      dataKey="day"
                      tick={{ fill: "var(--foreground)", fontSize: 12 }}
                      axisLine={{ stroke: "var(--foreground)" }}
                    />
                    <YAxis
                      yAxisId="left"
                      orientation="left"
                      tick={{ fill: "var(--foreground)", fontSize: 12 }}
                      axisLine={{ stroke: "var(--foreground)" }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fill: "var(--foreground)", fontSize: 12 }}
                      axisLine={{ stroke: "var(--foreground)" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--background)",
                        border: "1px solid var(--foreground)",
                        borderRadius: "4px",
                        color: "var(--foreground)",
                      }}
                      formatter={(value, name) => [
                        name === "productivity"
                          ? `${Math.round(value)} productivity`
                          : `${value} features`,
                        name === "productivity"
                          ? "Daily Productivity"
                          : "Features Completed",
                      ]}
                    />
                    <Bar
                      dataKey="productivity"
                      fill="var(--accent)"
                      name="productivity"
                      yAxisId="left"
                    />
                    <Bar
                      dataKey="features"
                      fill="var(--secondary)"
                      name="features"
                      yAxisId="right"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center space-x-6 mt-2 text-xs">
                <div className="flex items-center space-x-1">
                  <div
                    className="w-3 h-3"
                    style={{ backgroundColor: "var(--accent)" }}
                  ></div>
                  <span style={{ color: "var(--foreground)" }}>
                    Daily Productivity (Left Axis)
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <div
                    className="w-3 h-3"
                    style={{ backgroundColor: "var(--secondary)" }}
                  ></div>
                  <span style={{ color: "var(--foreground)" }}>
                    Features Completed (Right Axis)
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p style={{ color: "var(--foreground)", opacity: 0.7 }}>
            Running simulation...
          </p>
        )}
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid var(--background);
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid var(--background);
        }

        .focus-slider::-webkit-slider-thumb {
          background: var(--accent);
        }
        .focus-slider::-webkit-slider-thumb:hover {
          background: var(--accent);
          opacity: 0.8;
        }
        .focus-slider::-moz-range-thumb {
          background: var(--accent);
        }
        .focus-slider::-moz-range-thumb:hover {
          background: var(--accent);
          opacity: 0.8;
        }

        .fatigue-slider::-webkit-slider-thumb {
          background: var(--error);
        }
        .fatigue-slider::-webkit-slider-thumb:hover {
          background: var(--error);
          opacity: 0.8;
        }
        .fatigue-slider::-moz-range-thumb {
          background: var(--error);
        }
        .fatigue-slider::-moz-range-thumb:hover {
          background: var(--error);
          opacity: 0.8;
        }

        .productivity-slider::-webkit-slider-thumb {
          background: var(--secondary);
        }
        .productivity-slider::-webkit-slider-thumb:hover {
          background: var(--secondary);
          opacity: 0.8;
        }
        .productivity-slider::-moz-range-thumb {
          background: var(--secondary);
        }
        .productivity-slider::-moz-range-thumb:hover {
          background: var(--secondary);
          opacity: 0.8;
        }

        .features-slider::-webkit-slider-thumb {
          background: var(--tertiary);
        }
        .features-slider::-webkit-slider-thumb:hover {
          background: var(--tertiary);
          opacity: 0.8;
        }
        .features-slider::-moz-range-thumb {
          background: var(--tertiary);
        }
        .features-slider::-moz-range-thumb:hover {
          background: var(--tertiary);
          opacity: 0.8;
        }
      `}</style>
    </>
  );
};

export default DeveloperProductivitySimulator;
