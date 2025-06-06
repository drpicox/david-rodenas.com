import { AlertCircle, Clock, DollarSign, TrendingUp } from "lucide-react";
import React, { useState, useMemo } from "react";
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

const TechnicalDebtSimulator = () => {
  const [baseTime, setBaseTime] = useState(20); // days per feature
  const [shortcutFactor, setShortcutFactor] = useState(0.25); // 25% time saved initially
  const [interestRate, setInterestRate] = useState(0.1); // 10% compound interest per feature
  const [timeHorizon, setTimeHorizon] = useState(24); // months to simulate

  // Calculate simulation data with immediate updates
  const simulationData = useMemo(() => {
    const data = [];

    let cleanCumulative = 0;
    let debtCumulative = 0;

    let cleanMonthly = 0;
    let debtMonthly = 0;

    const cleanFeatureCost = baseTime;
    let debtFeatureCost = baseTime * (1 - shortcutFactor);

    let breakEvenPoint = null;

    let nextCleanFeatureDay = 0; // Next day to deliver a clean feature
    let nextDebtFeatureDay = 0; // Next day to deliver a debt-driven feature

    let today = 0;
    const daysPerMonth = 20; // Assuming 20 days per month for simplicity
    const daysToSimulate = timeHorizon * daysPerMonth; // Total days to simulate
    while (today < daysToSimulate) {
      while (nextCleanFeatureDay <= today) {
        // Deliver a clean feature
        cleanCumulative += 1;
        cleanMonthly += 1;
        nextCleanFeatureDay += cleanFeatureCost; // Move to the next clean feature delivery day
      }

      while (nextDebtFeatureDay <= today) {
        // Deliver a debt-driven feature
        debtCumulative += 1;
        debtMonthly += 1;
        nextDebtFeatureDay += debtFeatureCost; // Move to the next debt-driven feature delivery day

        // Increase the cost for the next debt-driven feature
        debtFeatureCost *= 1 + interestRate;
      }

      today += 1; // Move to the next day

      if (today % daysPerMonth === 0) {
        // End of the month, reset monthly counters
        data.push({
          month: Math.floor(today / daysPerMonth),
          cleanCumulative: Number(cleanCumulative.toFixed(1)),
          debtCumulative: Number(debtCumulative.toFixed(1)),
          cleanMonthly: Number(cleanMonthly.toFixed(1)),
          debtMonthly: Number(debtMonthly.toFixed(1)),
          currentFeatureCost: Number(debtFeatureCost.toFixed(2)),
          debtInterest: Number(
            (debtFeatureCost - baseTime * (1 - shortcutFactor)).toFixed(2),
          ),
        });

        // Reset monthly counters
        cleanMonthly = 0;
        debtMonthly = 0;

        if (breakEvenPoint === null && cleanCumulative > debtCumulative) {
          breakEvenPoint = Math.floor(today / daysPerMonth);
        }
      }
    }

    return { data, breakEvenPoint };
  }, [baseTime, shortcutFactor, interestRate, timeHorizon]);

  const finalCleanFeatures =
    simulationData.data[simulationData.data.length - 1]?.cleanCumulative || 0;
  const finalDebtFeatures =
    simulationData.data[simulationData.data.length - 1]?.debtCumulative || 0;

  const productivityDiff =
    finalCleanFeatures > 0
      ? ((finalCleanFeatures - finalDebtFeatures) / finalCleanFeatures) * 100
      : 0;
  const isEven = Math.abs(productivityDiff) < 0.1; // Within 0.1% is considered "even"
  const isGain = productivityDiff < -0.1;
  const productivityValue = isEven ? "" : Math.abs(productivityDiff).toFixed(1);
  const productivityLabel = isEven ? "Even" : isGain ? "Gain" : "Loss";

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

      {/* Header
      <div
        className="border border-current rounded p-4 mb-4"
        style={{ backgroundColor: "var(--background)" }}
      >
        <h1
          className="text-2xl font-bold mb-2 flex items-center gap-2"
          style={{ color: "var(--accent)" }}
        >
          <TrendingUp className="w-6 h-6" style={{ color: "var(--accent)" }} />
          Technical Debt Simulator
        </h1>
        <p className="text-sm" style={{ color: "var(--foreground)" }}>
          Explore how shortcuts create compound productivity losses over time
        </p>
      </div>
      */}

      {/* Compact Controls */}
      <div
        className="border border-current rounded p-4 mb-4"
        style={{ backgroundColor: "var(--background)" }}
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label
              className="block text-xs font-medium"
              style={{ color: "var(--foreground)" }}
            >
              Base Time:{" "}
              <span className="font-mono" style={{ color: "var(--accent)" }}>
                {baseTime} days
              </span>
            </label>
            <input
              type="range"
              min="1"
              max="30"
              value={baseTime}
              onChange={(e) => setBaseTime(Number(e.target.value))}
              className="w-full h-1 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          <div className="space-y-1">
            <label
              className="block text-xs font-medium"
              style={{ color: "var(--foreground)" }}
            >
              Shortcuts:{" "}
              <span className="font-mono" style={{ color: "var(--secondary)" }}>
                {(shortcutFactor * 100).toFixed(0)}%
              </span>
            </label>
            <input
              type="range"
              min="0"
              max="0.9"
              step="0.05"
              value={shortcutFactor}
              onChange={(e) => setShortcutFactor(Number(e.target.value))}
              className="w-full h-1 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          <div className="space-y-1">
            <label
              className="block text-xs font-medium"
              style={{ color: "var(--foreground)" }}
            >
              Interest:{" "}
              <span className="font-mono" style={{ color: "var(--error)" }}>
                {(interestRate * 100).toFixed(0)}%
              </span>
            </label>
            <input
              type="range"
              min="0"
              max="1.0"
              step="0.01"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full h-1 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          <div className="space-y-1">
            <label
              className="block text-xs font-medium"
              style={{ color: "var(--foreground)" }}
            >
              Timeline:{" "}
              <span className="font-mono" style={{ color: "var(--tertiary)" }}>
                {timeHorizon} months
              </span>
            </label>
            <input
              type="range"
              min="6"
              max="60"
              value={timeHorizon}
              onChange={(e) => setTimeHorizon(Number(e.target.value))}
              className="w-full h-1 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </div>
      </div>

      {/* Compact Metrics - Single Row */}
      <div className="flex gap-3 mb-4">
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
            <Clock className="w-4 h-4" />
            <span className="text-xs font-semibold">Clean</span>
          </div>
          <div
            className="text-xl font-bold"
            style={{ color: "var(--foreground)" }}
          >
            {finalCleanFeatures}
          </div>
          <div
            className="text-xs"
            style={{ color: "var(--foreground)", opacity: 0.7 }}
          >
            features
          </div>
        </div>

        <div
          className="border border-current rounded p-3 flex-1"
          style={{
            backgroundColor: "var(--background)",
            borderLeftColor: "var(--error)",
            borderLeftWidth: "4px",
          }}
        >
          <div
            className="flex items-center gap-1 mb-1"
            style={{ color: "var(--error)" }}
          >
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs font-semibold">Debt</span>
          </div>
          <div
            className="text-xl font-bold"
            style={{ color: "var(--foreground)" }}
          >
            {finalDebtFeatures}
          </div>
          <div
            className="text-xs"
            style={{ color: "var(--foreground)", opacity: 0.7 }}
          >
            features
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
            <DollarSign className="w-4 h-4" />
            <span className="text-xs font-semibold">Break-Even</span>
          </div>
          <div
            className="text-xl font-bold"
            style={{ color: "var(--foreground)" }}
          >
            {simulationData.breakEvenPoint
              ? `${simulationData.breakEvenPoint}mo`
              : "Never"}
          </div>
          <div
            className="text-xs"
            style={{ color: "var(--foreground)", opacity: 0.7 }}
          >
            crossover
          </div>
        </div>

        <div
          className="border border-current rounded p-3 flex-1"
          style={{
            backgroundColor: "var(--background)",
            borderLeftColor: isEven
              ? "var(--foreground)"
              : isGain
                ? "var(--secondary)"
                : "var(--tertiary)",
            borderLeftWidth: "4px",
          }}
        >
          <div
            className="flex items-center gap-1 mb-1"
            style={{
              color: isEven
                ? "var(--foreground)"
                : isGain
                  ? "var(--secondary)"
                  : "var(--tertiary)",
            }}
          >
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-semibold">{productivityLabel}</span>
          </div>
          <div
            className="text-xl font-bold"
            style={{ color: "var(--foreground)" }}
          >
            {isEven ? "≈0%" : `${productivityValue}%`}
          </div>
          <div
            className="text-xs"
            style={{ color: "var(--foreground)", opacity: 0.7 }}
          >
            productivity
          </div>
        </div>
      </div>

      {/* Side-by-side Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Cumulative Features Chart */}
        <div
          className="border border-current rounded p-4"
          style={{ backgroundColor: "var(--background)" }}
        >
          <h3
            className="text-sm font-semibold mb-3"
            style={{ color: "var(--accent)" }}
          >
            Cumulative Features
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart
              data={simulationData.data}
              margin={{ top: 5, right: 5, left: 5, bottom: 35 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10 }}
                label={{
                  value: "Months",
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
                formatter={(value, name) => [
                  `${value} features`,
                  name === "cleanCumulative" ? "Clean" : "Debt-Driven",
                ]}
                labelFormatter={(month) => `Month ${month}`}
                contentStyle={{ fontSize: 12 }}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: "15px" }}
                verticalAlign="bottom"
                height={30}
              />
              <Line
                type="monotone"
                dataKey="cleanCumulative"
                stroke="var(--accent)"
                strokeWidth={2}
                name="Clean"
                dot={{ fill: "var(--accent)", r: 2 }}
                animationDuration={200}
              />
              <Line
                type="monotone"
                dataKey="debtCumulative"
                stroke="var(--error)"
                strokeWidth={2}
                name="Debt-Driven"
                dot={{ fill: "var(--error)", r: 2 }}
                animationDuration={200}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Productivity Chart */}
        <div
          className="border border-current rounded p-4"
          style={{ backgroundColor: "var(--background)" }}
        >
          <h3
            className="text-sm font-semibold mb-3"
            style={{ color: "var(--accent)" }}
          >
            Monthly Delivery Rate
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={simulationData.data.slice(1)}
              margin={{ top: 5, right: 5, left: 5, bottom: 35 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10 }}
                label={{
                  value: "Months",
                  position: "insideBottom",
                  offset: -5,
                  style: { fontSize: 10 },
                }}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                label={{
                  value: "Features/Month",
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: 10 },
                }}
              />
              <Tooltip
                formatter={(value, name) => [
                  `${value} features/month`,
                  name === "cleanMonthly" ? "Clean" : "Debt-Driven",
                ]}
                contentStyle={{ fontSize: 12 }}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: "15px" }}
                verticalAlign="bottom"
                height={30}
              />
              <Bar
                dataKey="cleanMonthly"
                fill="var(--accent)"
                name="Clean"
                animationDuration={200}
              />
              <Bar
                dataKey="debtMonthly"
                fill="var(--error)"
                name="Debt-Driven"
                animationDuration={200}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Compact Insights */}
      <div
        className="border border-current rounded p-4"
        style={{ backgroundColor: "var(--background)" }}
      >
        <h3
          className="text-sm font-semibold mb-2"
          style={{ color: "var(--accent)" }}
        >
          Key Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <div
                className="w-1.5 h-1.5 rounded-full mt-4.5"
                style={{ backgroundColor: "var(--accent)" }}
              ></div>
              <div>
                <p
                  className="font-medium"
                  style={{ color: "var(--foreground)" }}
                >
                  Compound Effect
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--foreground)", opacity: 0.8 }}
                >
                  {interestRate === 0
                    ? "No interest = no compound slowdown"
                    : `${(interestRate * 100).toFixed(0)}% interest compounds with each feature`}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div
                className="w-1.5 h-1.5 rounded-full mt-4.5"
                style={{ backgroundColor: "var(--highlight)" }}
              ></div>
              <div>
                <p
                  className="font-medium"
                  style={{ color: "var(--foreground)" }}
                >
                  False Economy
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--foreground)", opacity: 0.8 }}
                >
                  {(shortcutFactor * 100).toFixed(0)}% initial savings →{" "}
                  {isEven
                    ? "break even"
                    : `${productivityValue}% final ${productivityLabel.toLowerCase()}`}
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <div
                className="w-1.5 h-1.5 rounded-full mt-4.5"
                style={{ backgroundColor: "var(--secondary)" }}
              ></div>
              <div>
                <p
                  className="font-medium"
                  style={{ color: "var(--foreground)" }}
                >
                  Break-Even
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--foreground)", opacity: 0.8 }}
                >
                  {simulationData.breakEvenPoint
                    ? `Clean overtakes debt at month ${simulationData.breakEvenPoint}`
                    : "Debt-driven never recovers in this timeline"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div
                className="w-1.5 h-1.5 rounded-full mt-4.5"
                style={{ backgroundColor: "var(--tertiary)" }}
              ></div>
              <div>
                <p
                  className="font-medium"
                  style={{ color: "var(--foreground)" }}
                >
                  Current Settings
                </p>
                <p
                  className="text-xs font-mono"
                  style={{ color: "var(--foreground)", opacity: 0.8 }}
                >
                  {baseTime}d base × {(shortcutFactor * 100).toFixed(0)}% cuts ×{" "}
                  {(interestRate * 100).toFixed(0)}% interest
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicalDebtSimulator;
