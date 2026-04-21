import React from 'react';
import SurfaceCard from '../components/SurfaceCard';
import StatCard from '../components/StatCard';
import {
  Activity,
  BarChart3,
  LineChart as LineChartIcon,
  Target,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { dashboardAnalytics, MODEL_METRICS } from '../lib/desalinationAnalytics';

const palette = ['#2563eb', '#06b6d4', '#38bdf8', '#0f172a', '#60a5fa', '#818cf8'];

const Analytics = () => {
  const metricCards = [
    {
      title: 'MAE',
      value: MODEL_METRICS.mae.toFixed(4),
      icon: <Target size={18} />,
      color: 'blue',
      trend: 'Prediction error',
      up: true,
    },
    {
      title: 'MSE',
      value: MODEL_METRICS.mse.toFixed(4),
      icon: <Activity size={18} />,
      color: 'purple',
      trend: 'Squared loss',
      up: true,
    },
    {
      title: 'R² Score',
      value: MODEL_METRICS.r2.toFixed(4),
      icon: <LineChartIcon size={18} />,
      color: 'green',
      trend: 'Model fit',
      up: true,
    },
  ];

  const insightCharts = [
    {
      title: 'Salinity vs clean water',
      subtitle: 'Salinity rise generally reduces recoverable production.',
      data: dashboardAnalytics.insights.salinityVsCleanWater,
      xKey: 'salinity',
      yKey: 'clean_water',
      color: '#2563eb',
    },
    {
      title: 'Temperature vs efficiency',
      subtitle: 'Temperature changes influence membrane efficiency.',
      data: dashboardAnalytics.insights.temperatureVsEfficiency,
      xKey: 'temp',
      yKey: 'efficiency',
      color: '#06b6d4',
    },
    {
      title: 'Energy price vs production',
      subtitle: 'High energy prices affect production windows and profitability.',
      data: dashboardAnalytics.insights.energyPriceVsProduction,
      xKey: 'energy_price',
      yKey: 'clean_water',
      color: '#0f172a',
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white md:text-4xl">
          Desalination analytics
        </h1>
        <p className="max-w-3xl text-sm text-slate-500 dark:text-slate-400">
          Visual performance, feature influence, residual behavior va asosiy operational
          relationshiplar eski admin dizayn ichida ko&apos;rsatilmoqda.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {metricCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SurfaceCard
          title="Actual vs Predicted"
          subtitle="Line chart built from the actual and predicted values in predictions.csv."
        >
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardAnalytics.actualVsPredicted}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="label" hide />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="actual" stroke="#2563eb" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="predicted" stroke="#06b6d4" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SurfaceCard>

        <SurfaceCard
          title="Scatter plot"
          subtitle="Actual vs predicted production distribution."
        >
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" dataKey="actual" name="Actual" stroke="#94a3b8" />
                <YAxis type="number" dataKey="predicted" name="Predicted" stroke="#94a3b8" />
                <Tooltip />
                <Scatter data={dashboardAnalytics.scatterData} fill="#2563eb" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </SurfaceCard>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SurfaceCard title="Feature importance" subtitle="Relative influence on clean water output.">
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardAnalytics.featureImportance}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="feature" angle={-18} textAnchor="end" interval={0} height={72} />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="importance" radius={[10, 10, 0, 0]}>
                  {dashboardAnalytics.featureImportance.map((entry, index) => (
                    <Cell key={entry.feature} fill={palette[index % palette.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SurfaceCard>

        <SurfaceCard title="Error distribution" subtitle="Residual spread across the dataset.">
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardAnalytics.errorDistribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="range" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="count" fill="#38bdf8" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SurfaceCard>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SurfaceCard title="Residual plot" subtitle="Residuals around zero indicate stable regression behavior.">
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardAnalytics.residualSeries}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="label" hide />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <ReferenceLine y={0} stroke="#0f172a" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="residual" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SurfaceCard>

        <SurfaceCard
          title="Confusion-style evaluation"
          subtitle="Grouped absolute error bands for easier operational interpretation."
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {dashboardAnalytics.accuracyBands.map((band, index) => (
              <div
                key={band.band}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/60"
              >
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                  {band.band}
                </p>
                <div className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  {band.count}
                </div>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {index === 0 ? 'Best accuracy zone' : 'Observed prediction count'}
                </p>
              </div>
            ))}
          </div>
        </SurfaceCard>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {insightCharts.map((chart) => (
          <SurfaceCard key={chart.title} title={chart.title} subtitle={chart.subtitle}>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chart.data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey={chart.xKey} stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Line type="monotone" dataKey={chart.yKey} stroke={chart.color} strokeWidth={3} dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </SurfaceCard>
        ))}
      </div>
    </div>
  );
};

export default Analytics;
