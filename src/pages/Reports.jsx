import React, { useDeferredValue, useState } from 'react';
import SurfaceCard from '../components/SurfaceCard';
import {
  DATASET_COLUMNS,
  desalinationDataset,
  initialPredictionInput,
  predictCleanWater,
} from '../lib/desalinationAnalytics';

const decimalNumber = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
});

const requestPrediction = async (payload) => {
  try {
    const response = await fetch('/api/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Prediction API unavailable');
    }

    const data = await response.json();
    return { ...data, source: 'Flask model' };
  } catch {
    return { ...predictCleanWater(payload), source: 'Local fallback model' };
  }
};

const Reports = () => {
  const [search, setSearch] = useState('');
  const [month, setMonth] = useState('all');
  const [day, setDay] = useState('all');
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(initialPredictionInput);
  const [prediction, setPrediction] = useState({
    ...predictCleanWater(initialPredictionInput),
    source: 'Local fallback model',
  });
  const [isSubmitting, setSubmitting] = useState(false);
  const deferredSearch = useDeferredValue(search);
  const pageSize = 10;

  const months = [...new Set(desalinationDataset.map((row) => row.month))];
  const days = [...new Set(desalinationDataset.map((row) => row.day))];

  const filteredRows = desalinationDataset.filter((row) => {
    const searchMatch =
      deferredSearch.trim() === '' ||
      DATASET_COLUMNS.some((column) =>
        String(row[column]).toLowerCase().includes(deferredSearch.toLowerCase()),
      );
    const monthMatch = month === 'all' || String(row.month) === month;
    const dayMatch = day === 'all' || String(row.day) === day;

    return searchMatch && monthMatch && dayMatch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const currentRows = filteredRows.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handlePredict = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    const result = await requestPrediction(form);
    setPrediction(result);
    setSubmitting(false);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white md:text-4xl">
          Reports & prediction
        </h1>
        <p className="max-w-3xl text-sm text-slate-500 dark:text-slate-400">
          Dataset viewer, filtering, pagination va `clean_water` prediction moduli eski admin
          panel ko&apos;rinishida saqlab qo&apos;yildi.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <SurfaceCard
          title="Dataset viewer"
          subtitle="Search, filter and paginate the desalination dataset."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <label className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                Search
              </span>
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search columns..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </label>

            <label className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                Month
              </span>
              <select
                value={month}
                onChange={(event) => {
                  setMonth(event.target.value);
                  setPage(1);
                }}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="all">All</option>
                {months.map((item) => (
                  <option key={item} value={item}>
                    Month {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                Day
              </span>
              <select
                value={day}
                onChange={(event) => {
                  setDay(event.target.value);
                  setPage(1);
                }}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="all">All</option>
                {days.map((item) => (
                  <option key={item} value={item}>
                    Day {item}
                  </option>
                ))}
              </select>
            </label>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/60">
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                Rows
              </p>
              <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                {filteredRows.length}
              </div>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto rounded-3xl border border-slate-100 dark:border-slate-800">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/70">
                <tr>
                  {DATASET_COLUMNS.map((column) => (
                    <th
                      key={column}
                      className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-slate-500"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentRows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-slate-100 dark:border-slate-800"
                  >
                    {DATASET_COLUMNS.map((column) => (
                      <td key={`${row.id}-${column}`} className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {decimalNumber.format(row[column])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Page {safePage} / {totalPages}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={safePage === 1}
                className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-200"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                disabled={safePage === totalPages}
                className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard
          title="Prediction module"
          subtitle="Enter live operating values to predict clean water production."
        >
          <form onSubmit={handlePredict} className="grid grid-cols-1 gap-4">
            {Object.entries(form).map(([key, value]) => (
              <label key={key} className="space-y-2">
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                  {key.replace('_', ' ')}
                </span>
                <input
                  type="number"
                  step="any"
                  value={value}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      [key]: Number(event.target.value),
                    }))
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </label>
            ))}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 rounded-2xl bg-blue-600 px-5 py-3 font-black text-white shadow-lg shadow-blue-500/20 transition-colors hover:bg-blue-700 disabled:opacity-60"
            >
              {isSubmitting ? 'Predicting...' : 'Predict clean water'}
            </button>
          </form>

          <div className="mt-6 rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-white shadow-xl shadow-blue-500/20">
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-100">
              Predicted clean water
            </p>
            <div className="mt-3 text-4xl font-black tracking-tight">
              {prediction.prediction} <span className="text-lg font-bold">m³</span>
            </div>
            <p className="mt-2 text-sm text-blue-50">{prediction.source}</p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                Confidence
              </p>
              <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                {prediction.confidence * 100}%
              </div>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                Efficiency
              </p>
              <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                {prediction.efficiency}%
              </div>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                Demand ratio
              </p>
              <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                {prediction.demand_ratio}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                Salinity impact
              </p>
              <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                {prediction.salinity_impact}
              </div>
            </div>
          </div>
        </SurfaceCard>
      </div>
    </div>
  );
};

export default Reports;
