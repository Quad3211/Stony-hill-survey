import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format, subDays, isSameDay } from "date-fns";
import { Sparkles, AlertTriangle, Lightbulb, Loader2 } from "lucide-react";
import { useAiSummary } from "../../hooks/useAiSummary";
import { Button } from "../../components/ui/Button";

interface Submission {
  id: string;
  type: string;
  timestamp: any;
  generalExperienceRating?: string;
  safetyRating?: string;
  satisfactionRating?: string;
  [key: string]: any;
}

interface AnalyticsDashboardProps {
  submissions: Submission[];
}

const COLORS = ["#4F46E5", "#7C3AED", "#2563EB", "#DB2777", "#EA580C"];

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  submissions,
}) => {
  const { generateSummary, result, loading, error } = useAiSummary();

  // 1. Valid Submissions (exclude deleted if not already filtered)
  const validSubmissions = useMemo(() => {
    return submissions.filter((s) => !s.deleted);
  }, [submissions]);

  const handleGenerateSummary = () => {
    const texts = validSubmissions
      .map(
        (s) =>
          s.openFeedback ||
          s.complaints ||
          s.suggestions ||
          s.review ||
          s.description,
      )
      .filter((t): t is string => typeof t === "string" && t.length > 10); // Filter out short/empty strings

    if (texts.length === 0) {
      alert("Not enough textual feedback to analyze.");
      return;
    }
    generateSummary(texts);
  };

  // 2. Submission Volume Trend (Last 30 Days)
  const submissionTrend = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i);
      return {
        date: format(date, "MMM dd"),
        fullDate: date,
        count: 0,
      };
    });

    validSubmissions.forEach((sub) => {
      const subDate = sub.timestamp?.toDate
        ? sub.timestamp.toDate()
        : new Date(sub.timestamp);
      const dayStat = last30Days.find((d) => isSameDay(d.fullDate, subDate));
      if (dayStat) {
        dayStat.count++;
      }
    });

    return last30Days;
  }, [validSubmissions]);

  // 3. Ratings Distribution (General Experience & Safety)
  const ratingsDistribution = useMemo(() => {
    const distribution = [
      { name: "General Experience", "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 },
      { name: "Safety", "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 },
      { name: "Dorm Satisfaction", "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 },
    ];

    validSubmissions.forEach((sub) => {
      if (sub.generalExperienceRating) {
        const rating =
          sub.generalExperienceRating as keyof (typeof distribution)[0];
        if (distribution[0][rating] !== undefined) distribution[0][rating]++;
      }
      if (sub.safetyRating) {
        const rating = sub.safetyRating as keyof (typeof distribution)[1];
        if (distribution[1][rating] !== undefined) distribution[1][rating]++;
      }
      if (sub.satisfactionRating) {
        const rating = sub.satisfactionRating as keyof (typeof distribution)[2];
        if (distribution[2][rating] !== undefined) distribution[2][rating]++;
      }
    });

    return distribution;
  }, [validSubmissions]);

  // 4. Submission Types Breakdown
  const typeBreakdown = useMemo(() => {
    const types: Record<string, number> = {};
    validSubmissions.forEach((sub) => {
      types[sub.type] = (types[sub.type] || 0) + 1;
    });
    return Object.entries(types).map(([name, value]) => ({ name, value }));
  }, [validSubmissions]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 sm:pb-0">
      {/* AI Summary Card */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 sm:p-6 rounded-xl border border-indigo-100 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-white p-2 rounded-full shadow-sm text-indigo-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Smart Summary</h3>
              <p className="text-sm text-gray-600">
                AI-powered analysis of student feedback
              </p>
            </div>
          </div>
          <Button
            onClick={handleGenerateSummary}
            disabled={loading}
            className="bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 w-full sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Insights
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm mb-4">
            {error} (Make sure your API key is in .env.local)
          </div>
        )}

        {result && (
          <div className="space-y-4 animate-in slide-in-from-top-4 duration-500">
            <div className="bg-white/80 p-4 rounded-lg border border-indigo-100">
              <p className="text-gray-800 leading-relaxed font-medium">
                {result.summary}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/60 p-4 rounded-lg border border-purple-100">
                <h4 className="text-sm font-bold text-purple-900 mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" /> Key Themes
                </h4>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {result.keyThemes?.map((theme, i) => (
                    <li key={i}>{theme}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-white/60 p-4 rounded-lg border border-red-100">
                <h4 className="text-sm font-bold text-red-900 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Critical Alerts
                </h4>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {result.criticalAlerts?.length > 0 ? (
                    result.criticalAlerts.map((alert, i) => (
                      <li key={i}>{alert}</li>
                    ))
                  ) : (
                    <li className="text-green-600 italic">
                      No critical alerts detected.
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submission Trend */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Submission Trend (30 Days)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={submissionTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  tickMargin={10}
                  interval={4} // Show every 5th date to avoid clutter
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#4F46E5"
                  strokeWidth={3}
                  dot={{ r: 3, fill: "#4F46E5" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Type Breakdown */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Submission Types
          </h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {typeBreakdown.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ratings Distribution (Stacked Bar) */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Ratings Distribution (1-5 Stars)
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Shows the distribution of ratings for key metrics.
          </p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={ratingsDistribution}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={true}
                  vertical={false}
                />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={120}
                  tick={{ fontSize: 11, fontWeight: 500 }}
                />
                <Tooltip cursor={{ fill: "transparent" }} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="1" stackId="a" fill="#EF4444" name="1 Star" />
                <Bar dataKey="2" stackId="a" fill="#F97316" name="2 Stars" />
                <Bar dataKey="3" stackId="a" fill="#EAB308" name="3 Stars" />
                <Bar dataKey="4" stackId="a" fill="#84CC16" name="4 Stars" />
                <Bar
                  dataKey="5"
                  stackId="a"
                  fill="#22C55E"
                  name="5 Stars"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
