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
  const [baseTime, setBaseTime] = useState(10); // days per feature
  const [shortcutFactor, setShortcutFactor] = useState(0.4); // 40% time saved initially
  const [interestRate, setInterestRate] = useState(0.08); // 8% compound interest per feature
  const [timeHorizon, setTimeHorizon] = useState(24); // months to simulate

  // Calculate simulation data with immediate updates
  const simulationData = useMemo(() => {
    const data = [];
    let cleanCumulative = 0;
    let debtCumulative = 0;
    let accumulatedDebt = 0;
    let breakEvenPoint = null;

    const monthsToSimulate = timeHorizon;
    const featuresPerMonth = 30 / baseTime; // assuming 30 working days per month

    for (let month = 0; month <= monthsToSimulate; month++) {
      // Clean development: consistent pace
      const cleanFeaturesThisMonth = month === 0 ? 0 : featuresPerMonth;
      cleanCumulative += cleanFeaturesThisMonth;

      // Debt-driven development
      let debtFeaturesThisMonth = 0;
      if (month > 0) {
        // Initial speed boost due to shortcuts
        const initialSpeedBoost = 1 / (1 - shortcutFactor);

        // Apply compound interest to slow down development
        const debtMultiplier = 1 + accumulatedDebt * interestRate;
        const effectiveTime = (baseTime * debtMultiplier) / initialSpeedBoost;
        debtFeaturesThisMonth = Math.max(0, 30 / effectiveTime);

        // Add to accumulated debt (shortcuts create debt)
        accumulatedDebt += debtFeaturesThisMonth * shortcutFactor;
      }
      debtCumulative += debtFeaturesThisMonth;

      // Check for break-even point
      if (
        cleanCumulative > debtCumulative &&
        breakEvenPoint === null &&
        month > 0
      ) {
        breakEvenPoint = month;
      }

      data.push({
        month,
        cleanCumulative: Number(cleanCumulative.toFixed(1)),
        debtCumulative: Number(debtCumulative.toFixed(1)),
        cleanMonthly: Number(cleanFeaturesThisMonth.toFixed(1)),
        debtMonthly: Number(debtFeaturesThisMonth.toFixed(1)),
        accumulatedDebt: Number(accumulatedDebt.toFixed(1)),
        debtInterest: Number((accumulatedDebt * interestRate).toFixed(2)),
      });
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
    <div className="w-full max-w-7xl mx-auto p-4 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          transition: all 0.1s ease;
        }
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          background: #2563eb;
        }
      `}</style>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h1 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
          <TrendingUp className="text-blue-600 w-6 h-6" />
          Technical Debt Simulator
        </h1>
        <p className="text-slate-600 text-sm">
          Explore how shortcuts create compound productivity losses over time
        </p>
      </div>

      {/* Compact Controls */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">
              Base Time: <span className="font-mono">{baseTime} days</span>
            </label>
            <input
              type="range"
              min="5"
              max="30"
              value={baseTime}
              onChange={(e) => setBaseTime(Number(e.target.value))}
              className="w-full h-1 bg-blue-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">
              Shortcuts:{" "}
              <span className="font-mono">
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
              className="w-full h-1 bg-orange-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">
              Interest:{" "}
              <span className="font-mono">
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
              className="w-full h-1 bg-red-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">
              Timeline: <span className="font-mono">{timeHorizon} months</span>
            </label>
            <input
              type="range"
              min="6"
              max="60"
              value={timeHorizon}
              onChange={(e) => setTimeHorizon(Number(e.target.value))}
              className="w-full h-1 bg-purple-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </div>
      </div>

      {/* Compact Metrics - Single Row */}
      <div className="flex gap-3 mb-4">
        <div className="bg-white rounded-lg shadow-sm p-3 border-l-4 border-green-500 flex-1">
          <div className="flex items-center gap-1 text-green-600 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-semibold">Clean</span>
          </div>
          <div className="text-xl font-bold text-slate-800">
            {finalCleanFeatures}
          </div>
          <div className="text-xs text-slate-500">features</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-3 border-l-4 border-red-500 flex-1">
          <div className="flex items-center gap-1 text-red-600 mb-1">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs font-semibold">Debt</span>
          </div>
          <div className="text-xl font-bold text-slate-800">
            {finalDebtFeatures}
          </div>
          <div className="text-xs text-slate-500">features</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-3 border-l-4 border-orange-500 flex-1">
          <div className="flex items-center gap-1 text-orange-600 mb-1">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs font-semibold">Break-Even</span>
          </div>
          <div className="text-xl font-bold text-slate-800">
            {simulationData.breakEvenPoint
              ? `${simulationData.breakEvenPoint}mo`
              : "Never"}
          </div>
          <div className="text-xs text-slate-500">crossover</div>
        </div>

        <div
          className={`bg-white rounded-lg shadow-sm p-3 border-l-4 ${isEven ? "border-gray-500" : isGain ? "border-blue-500" : "border-purple-500"} flex-1`}
        >
          <div
            className={`flex items-center gap-1 ${isEven ? "text-gray-600" : isGain ? "text-blue-600" : "text-purple-600"} mb-1`}
          >
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-semibold">{productivityLabel}</span>
          </div>
          <div className="text-xl font-bold text-slate-800">
            {isEven ? "≈0%" : `${productivityValue}%`}
          </div>
          <div className="text-xs text-slate-500">productivity</div>
        </div>
      </div>

      {/* Side-by-side Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Cumulative Features Chart */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">
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
                stroke="#10b981"
                strokeWidth={2}
                name="Clean"
                dot={{ fill: "#10b981", r: 2 }}
                animationDuration={200}
              />
              <Line
                type="monotone"
                dataKey="debtCumulative"
                stroke="#ef4444"
                strokeWidth={2}
                name="Debt-Driven"
                dot={{ fill: "#ef4444", r: 2 }}
                animationDuration={200}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Productivity Chart */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">
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
                fill="#10b981"
                name="Clean"
                animationDuration={200}
              />
              <Bar
                dataKey="debtMonthly"
                fill="#ef4444"
                name="Debt-Driven"
                animationDuration={200}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Compact Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md p-4">
        <h3 className="text-sm font-semibold text-slate-800 mb-2">
          Key Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5"></div>
              <div>
                <p className="font-medium text-slate-800">Compound Effect</p>
                <p className="text-xs text-slate-600">
                  {interestRate === 0
                    ? "No interest = no compound slowdown"
                    : `${(interestRate * 100).toFixed(0)}% interest compounds with each feature`}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5"></div>
              <div>
                <p className="font-medium text-slate-800">False Economy</p>
                <p className="text-xs text-slate-600">
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
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
              <div>
                <p className="font-medium text-slate-800">Break-Even</p>
                <p className="text-xs text-slate-600">
                  {simulationData.breakEvenPoint
                    ? `Clean overtakes debt at month ${simulationData.breakEvenPoint}`
                    : "Debt-driven never recovers in this timeline"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5"></div>
              <div>
                <p className="font-medium text-slate-800">Current Settings</p>
                <p className="text-xs text-slate-600 font-mono">
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
