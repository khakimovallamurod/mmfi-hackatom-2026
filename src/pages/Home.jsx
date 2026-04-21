import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import data from '../data/data.json';
import heroImage from '../assets/hero.png';
import { ArrowRight, Bot, Database, ShieldCheck, Users, Waves } from 'lucide-react';

const features = [
  {
    title: 'AI Monitoring',
    desc: 'Realtime monitoring of desalination process with operational signals and instant alerts.',
    icon: <Bot size={20} />,
  },
  {
    title: 'Smart Reports',
    desc: 'Predictions, analytics and clean-water performance reports in one dashboard.',
    icon: <Database size={20} />,
  },
  {
    title: 'System Safety',
    desc: 'Stable security flow for admin access, control actions and auditing.',
    icon: <ShieldCheck size={20} />,
  },
];

const Home = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen overflow-hidden bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <div className="absolute left-1/2 top-[-200px] -z-10 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-cyan-400/20 blur-[130px]" />
      <div className="absolute bottom-[-180px] right-[-80px] -z-10 h-[420px] w-[420px] rounded-full bg-blue-500/10 blur-[100px]" />

      <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <div className="grid items-center gap-10 rounded-[2.5rem] border border-slate-200 bg-white/80 p-8 shadow-xl shadow-slate-300/30 backdrop-blur-2xl dark:border-slate-800 dark:bg-slate-900/70 md:grid-cols-2 md:p-12">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-cyan-700 dark:border-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300">
              <Waves size={14} /> AI Desalination Platform
            </p>
            <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-900 dark:text-white md:text-6xl">
              {t.title}
            </h1>
            <p className="mt-5 max-w-xl text-base text-slate-600 dark:text-slate-300 md:text-lg">
              Boshqaruv, tahlil va prognoz modullari bir joyda. Jamoa bilan birga industrial
              suv tozalashni aqlli va samarali boshqarish uchun tayyorlangan.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-7 py-3 text-sm font-black text-white shadow-lg shadow-blue-500/30 transition-colors hover:bg-blue-700"
                >
                  Open Admin Dashboard <ArrowRight size={18} />
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-7 py-3 text-sm font-black text-white shadow-lg shadow-slate-500/30 transition-colors hover:bg-slate-700 dark:bg-white dark:text-slate-900"
                >
                  Admin Login <ArrowRight size={18} />
                </Link>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-lg dark:border-slate-700 dark:bg-slate-800">
            <img
              src={heroImage}
              alt="AI desalination hero"
              className="h-full min-h-[320px] w-full object-cover"
            />
          </div>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
                {feature.icon}
              </div>
              <h3 className="mt-4 text-lg font-black text-slate-900 dark:text-white">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{feature.desc}</p>
            </div>
          ))}
        </div>

        <section className="mt-14 rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900 md:p-10">
          <div className="mb-6 flex items-center gap-3">
            <Users size={22} className="text-blue-500" />
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white md:text-3xl">
              {t.team_members}
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {data.team.map((member) => (
              <article
                key={member.id}
                className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:bg-white dark:border-slate-700 dark:bg-slate-800/70 dark:hover:bg-slate-800"
              >
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                  {member.photo ? (
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="h-36 w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-36 w-full items-center justify-center bg-slate-100 text-3xl font-black text-slate-700 dark:bg-slate-800 dark:text-slate-100">
                      {member.name[0]}
                    </div>
                  )}
                </div>
                <h3 className="mt-4 text-base font-black text-slate-900 dark:text-white">{member.name}</h3>
                <p className="mt-1 text-sm font-bold text-blue-600 dark:text-blue-300">{member.role}</p>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{member.specialization}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
