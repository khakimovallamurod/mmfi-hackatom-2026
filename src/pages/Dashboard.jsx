import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import SurfaceCard from '../components/SurfaceCard';
import StatCard from '../components/StatCard';
import AdminChatbot from '../components/AdminChatbot';
import {
  Waves,
  Droplets,
  Gauge,
  Zap,
  LineChart as LineChartIcon,
  Activity,
} from 'lucide-react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { dashboardAnalytics, MODEL_METRICS } from '../lib/desalinationAnalytics';

const Dashboard = () => {
  const { t } = useLanguage();

  const summaryCards = [
    {
      title: 'Total clean water produced',
      value: `${dashboardAnalytics.summaryCards[0].value} m³`,
      icon: <Droplets size={18} />,
      color: 'blue',
      trend: 'Plant output',
      up: true,
    },
    {
      title: 'Average efficiency',
      value: `${dashboardAnalytics.summaryCards[1].value}%`,
      icon: <Gauge size={18} />,
      color: 'green',
      trend: 'Recovery rate',
      up: true,
    },
    {
      title: 'Average energy price',
      value: `${dashboardAnalytics.summaryCards[2].value} UZS/kWh`,
      icon: <Zap size={18} />,
      color: 'purple',
      trend: 'Operating cost',
      up: true,
    },
    {
      title: 'Average salinity',
      value: `${dashboardAnalytics.summaryCards[3].value} ppt`,
      icon: <Waves size={18} />,
      color: 'red',
      trend: 'Feedwater',
      up: false,
    },
  ];

  const benchmarkCards = [
    {
      title: 'MAE',
      value: MODEL_METRICS.mae.toFixed(4),
      icon: <Activity size={18} />,
      color: 'blue',
      trend: 'Validated model',
      up: true,
    },
    {
      title: 'R² Score',
      value: MODEL_METRICS.r2.toFixed(4),
      icon: <LineChartIcon size={18} />,
      color: 'green',
      trend: 'Explained variance',
      up: true,
    },
    {
      title: 'MSE',
      value: MODEL_METRICS.mse.toFixed(4),
      icon: <Gauge size={18} />,
      color: 'purple',
      trend: 'Regression loss',
      up: true,
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="rounded-3xl bg-gradient-to-r from-blue-600 via-cyan-500 to-sky-400 p-8 text-white shadow-2xl shadow-blue-500/20">
        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-100">
          {t.dashboard}
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">
          Desalination AI Overview
        </h1>
        <p className="mt-4 max-w-3xl text-sm font-medium text-blue-50 md:text-base">
          Oldingi admin dizayn saqlangan holda, saline water treatment tizimining asosiy
          ko&apos;rsatkichlari, model sifati va clean water ishlab chiqarish prognozlari shu yerda
          jamlandi.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {benchmarkCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <SurfaceCard
          title="Actual vs Predicted clean water"
          subtitle="Comparison chart built from the real values in predictions.csv."
          className="xl:col-span-2"
        >
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardAnalytics.actualVsPredicted}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="label" hide />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Legend verticalAlign="top" height={32} />
                <Line
                  type="monotone"
                  dataKey="actual"
                  name="Actual clean water"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  name="Predicted clean water"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SurfaceCard>

        <SurfaceCard
          title="Operational pulse"
          subtitle="Quick system snapshot from the desalination sample."
        >
          <div className="space-y-4">
            {dashboardAnalytics.operationalKPIs.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-800/60"
              >
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                  {item.label}
                </p>
                <div className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  {item.value}
                  {item.suffix ? (
                    <span className="ml-1 text-sm font-bold text-slate-400">{item.suffix}</span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {dashboardAnalytics.narrativeInsights.map((item) => (
          <SurfaceCard key={item.title} title={item.title} subtitle={item.text}>
            <div className="rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50 p-4 text-sm font-medium text-slate-600 dark:from-slate-800 dark:to-slate-800 dark:text-slate-300">
              This insight is now embedded into the existing admin dashboard design instead of a
              separate new UI shell.
            </div>
          </SurfaceCard>
        ))}
      </div>

      <AdminChatbot />
    </div>
  );
};

export default Dashboard;
