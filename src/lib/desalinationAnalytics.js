import rawDataset from '../data/desalinationDataset.json';
import predictionsCsvRaw from '../data/predictions.csv?raw';

export const MODEL_METRICS = {
  mae: 0.0972,
  mse: 0.0184,
  r2: 0.9817,
};

export const DATASET_COLUMNS = [
  'hour',
  'day',
  'month',
  'temp',
  'energy_price',
  'water_demand',
  'salinity',
  'input_water',
  'demand_ratio',
  'salinity_impact',
  'clean_water',
];

const FEATURE_KEYS = [
  'hour',
  'day',
  'month',
  'temp',
  'energy_price',
  'water_demand',
  'salinity',
  'input_water',
  'demand_ratio',
  'salinity_impact',
];

const round = (value, digits = 2) => Number(value.toFixed(digits));

const average = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;

const padHour = (hour) => `${String(hour).padStart(2, '0')}:00`;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const deriveFeatures = (input) => {
  const demandRatio = input.input_water ? input.water_demand / input.input_water : 0;
  const salinityImpact = input.salinity * input.input_water;

  return {
    ...input,
    demand_ratio: round(demandRatio, 4),
    salinity_impact: round(salinityImpact, 2),
  };
};

const enrichRows = (rows) =>
  rows.map((row, index) => ({
    id: index + 1,
    ...row,
    efficiency: round((row.clean_water / row.input_water) * 100, 2),
    timestamp: `Day ${row.day} • ${padHour(row.hour)}`,
  }));

const normalizedRanges = (rows, keys) =>
  keys.reduce((accumulator, key) => {
    const values = rows.map((row) => row[key]);
    const min = Math.min(...values);
    const max = Math.max(...values);

    accumulator[key] = {
      min,
      max,
      span: max - min || 1,
    };

    return accumulator;
  }, {});

const buildKnnModel = (rows, keys, neighborCount = 5) => {
  const ranges = normalizedRanges(rows, keys);
  const minTarget = Math.min(...rows.map((row) => row.clean_water));
  const maxTarget = Math.max(...rows.map((row) => row.clean_water));

  const distance = (left, right) =>
    Math.sqrt(
      keys.reduce((sum, key) => {
        const range = ranges[key];
        const leftValue = (left[key] - range.min) / range.span;
        const rightValue = (right[key] - range.min) / range.span;
        const delta = leftValue - rightValue;

        return sum + delta * delta;
      }, 0),
    );

  const predict = (input, options = {}) => {
    const features = deriveFeatures(input);
    const neighbors = rows
      .map((row, index) => ({
        row,
        index,
        distance: distance(features, row),
      }))
      .filter((item) => item.index !== options.excludeIndex)
      .sort((left, right) => left.distance - right.distance)
      .slice(0, neighborCount);

    if (!neighbors.length) {
      return {
        prediction: round(average(rows.map((row) => row.clean_water))),
        confidence: 0.5,
      };
    }

    if (neighbors[0].distance === 0) {
      return {
        prediction: round(neighbors[0].row.clean_water),
        confidence: 0.99,
      };
    }

    const weightedTotal = neighbors.reduce((sum, neighbor) => {
      const weight = 1 / (neighbor.distance * neighbor.distance + 1e-6);
      return sum + neighbor.row.clean_water * weight;
    }, 0);

    const weightSum = neighbors.reduce((sum, neighbor) => {
      const weight = 1 / (neighbor.distance * neighbor.distance + 1e-6);
      return sum + weight;
    }, 0);

    const averageDistance = average(neighbors.map((neighbor) => neighbor.distance));
    const prediction = clamp(weightedTotal / weightSum, minTarget, maxTarget);
    const confidence = clamp(1 - averageDistance * 0.75, 0.58, 0.98);

    return {
      prediction: round(prediction),
      confidence: round(confidence, 2),
    };
  };

  return {
    predict,
  };
};

const correlation = (rows, xKey, yKey) => {
  const xValues = rows.map((row) => row[xKey]);
  const yValues = rows.map((row) => row[yKey]);
  const xMean = average(xValues);
  const yMean = average(yValues);

  const numerator = rows.reduce(
    (sum, row) => sum + (row[xKey] - xMean) * (row[yKey] - yMean),
    0,
  );

  const denominatorX = Math.sqrt(
    rows.reduce((sum, row) => sum + (row[xKey] - xMean) ** 2, 0),
  );

  const denominatorY = Math.sqrt(
    rows.reduce((sum, row) => sum + (row[yKey] - yMean) ** 2, 0),
  );

  return denominatorX && denominatorY ? numerator / (denominatorX * denominatorY) : 0;
};

const bucketSeries = (rows, xKey, yKey, bucketCount = 7) => {
  const sortedRows = [...rows].sort((left, right) => left[xKey] - right[xKey]);
  const bucketSize = Math.max(1, Math.ceil(sortedRows.length / bucketCount));
  const buckets = [];

  for (let index = 0; index < sortedRows.length; index += bucketSize) {
    const slice = sortedRows.slice(index, index + bucketSize);

    buckets.push({
      [xKey]: round(average(slice.map((row) => row[xKey]))),
      [yKey]: round(average(slice.map((row) => row[yKey]))),
    });
  }

  return buckets;
};

const buildHistogram = (values, binCount = 7) => {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const size = span / binCount;
  const bins = Array.from({ length: binCount }, (_, index) => ({
    range: `${round(min + size * index)} to ${round(min + size * (index + 1))}`,
    count: 0,
  }));

  values.forEach((value) => {
    const rawIndex = Math.floor((value - min) / size);
    const index = clamp(rawIndex, 0, binCount - 1);
    bins[index].count += 1;
  });

  return bins;
};

const parsePredictionsCsv = (raw) => {
  const [headerLine, ...rows] = raw.trim().split(/\r?\n/);
  const headers = headerLine.split(',').map((header) => header.trim());

  return rows
    .filter(Boolean)
    .map((line, index) => {
      const values = line.split(',').map((value) => Number(value.trim()));
      const row = {
        id: index + 1,
        label: `Sample ${String(index + 1).padStart(3, '0')}`,
      };

      headers.forEach((header, headerIndex) => {
        row[header] = values[headerIndex];
      });

      row.residual = round(row.actual - row.predicted);
      row.absolute_error = round(Math.abs(row.residual));

      return row;
    })
    .filter((row) => Number.isFinite(row.actual) && Number.isFinite(row.predicted));
};

const dataset = enrichRows(rawDataset);
const model = buildKnnModel(dataset, FEATURE_KEYS, 5);
const predictionRows = parsePredictionsCsv(predictionsCsvRaw);

const modeledRows = dataset.map((row, index) => {
  const { prediction, confidence } = model.predict(row, { excludeIndex: index });
  const residual = round(row.clean_water - prediction);
  const absoluteError = round(Math.abs(residual));

  return {
    ...row,
    predicted_clean_water: prediction,
    residual,
    absolute_error: absoluteError,
    confidence,
  };
});

const totalCleanWater = modeledRows.reduce((sum, row) => sum + row.clean_water, 0);
const averageEfficiency = average(modeledRows.map((row) => row.efficiency));
const averageEnergyPrice = average(modeledRows.map((row) => row.energy_price));
const averageSalinity = average(modeledRows.map((row) => row.salinity));
const averageProduction = average(predictionRows.map((row) => row.actual));
const averageResidual = average(predictionRows.map((row) => row.absolute_error));
const targetMean = average(predictionRows.map((row) => row.actual));
const ssTotal = predictionRows.reduce((sum, row) => sum + (row.actual - targetMean) ** 2, 0);
const ssResidual = predictionRows.reduce((sum, row) => sum + row.residual ** 2, 0);
const liveR2 = ssTotal ? 1 - ssResidual / ssTotal : 0;

const correlations = FEATURE_KEYS.map((key) => ({
  feature: key,
  importance: Math.abs(correlation(modeledRows, key, 'clean_water')),
}))
  .sort((left, right) => right.importance - left.importance);

const maxImportance = correlations[0]?.importance || 1;

const featureImportance = correlations.map((item) => ({
  feature: item.feature.replace('_', ' '),
  importance: round((item.importance / maxImportance) * 100, 1),
}));

const accuracyBands = [
  { band: '<= 1 m³', count: predictionRows.filter((row) => row.absolute_error <= 1).length },
  { band: '1 - 3 m³', count: predictionRows.filter((row) => row.absolute_error > 1 && row.absolute_error <= 3).length },
  { band: '3 - 5 m³', count: predictionRows.filter((row) => row.absolute_error > 3 && row.absolute_error <= 5).length },
  { band: '> 5 m³', count: predictionRows.filter((row) => row.absolute_error > 5).length },
];

export const desalinationDataset = modeledRows;

export const dashboardAnalytics = {
  summaryCards: [
    {
      id: 'total-clean-water',
      label: 'Total clean water produced',
      value: round(totalCleanWater, 1),
      suffix: 'm³',
      description: 'Cumulative output captured in the monitoring dataset.',
    },
    {
      id: 'average-efficiency',
      label: 'Average efficiency',
      value: round(averageEfficiency, 1),
      suffix: '%',
      description: 'Recovery efficiency across all observed desalination runs.',
    },
    {
      id: 'average-energy-price',
      label: 'Average energy price',
      value: round(averageEnergyPrice, 1),
      suffix: 'UZS/kWh',
      description: 'Mean grid price impacting operating cost and throughput.',
    },
    {
      id: 'average-salinity',
      label: 'Average salinity',
      value: round(averageSalinity, 2),
      suffix: 'ppt',
      description: 'Average feedwater salinity entering the treatment train.',
    },
  ],
  benchmarkMetrics: [
    { label: 'MAE', value: MODEL_METRICS.mae, description: 'Average absolute prediction error on the validated model.' },
    { label: 'R² Score', value: MODEL_METRICS.r2, description: 'Variance explained by the production-ready model.' },
    { label: 'MSE', value: MODEL_METRICS.mse, description: 'Squared error benchmark used for regression tuning.' },
  ],
  operationalKPIs: [
    { label: 'Average production', value: round(averageProduction, 1), suffix: 'm³' },
    { label: 'Live residual mean', value: round(averageResidual, 2), suffix: 'm³' },
    { label: 'Live sample R²', value: round(liveR2, 3), suffix: '' },
  ],
  actualVsPredicted: predictionRows.map((row) => ({
    label: row.label,
    actual: row.actual,
    predicted: row.predicted,
  })),
  scatterData: predictionRows.map((row) => ({
    actual: row.actual,
    predicted: row.predicted,
  })),
  featureImportance,
  residualSeries: predictionRows.map((row) => ({
    label: row.label,
    residual: row.residual,
  })),
  errorDistribution: buildHistogram(predictionRows.map((row) => row.residual)),
  accuracyBands,
  insights: {
    salinityVsCleanWater: bucketSeries(modeledRows, 'salinity', 'clean_water'),
    temperatureVsEfficiency: bucketSeries(modeledRows, 'temp', 'efficiency'),
    energyPriceVsProduction: bucketSeries(modeledRows, 'energy_price', 'clean_water'),
  },
  narrativeInsights: [
    {
      title: 'Salinity suppresses yield',
      text: 'Higher salinity raises membrane stress and usually lowers recoverable clean water unless input volume also rises.',
    },
    {
      title: 'Temperature improves efficiency',
      text: 'Milder feedwater temperatures correlate with better recovery efficiency and smoother hourly output.',
    },
    {
      title: 'Energy price shapes dispatch',
      text: 'Production remains strongest when input water is high, but rising energy price still trims the most cost-sensitive operating windows.',
    },
  ],
  latestSnapshot: modeledRows[modeledRows.length - 1],
};

export const initialPredictionInput = {
  hour: 14,
  day: 2,
  month: 1,
  temp: -3.1,
  energy_price: 1200,
  water_demand: 216.6,
  salinity: 15.6,
  input_water: 324.7,
};

export const predictCleanWater = (input) => {
  const derived = deriveFeatures(
    Object.fromEntries(
      Object.entries(input).map(([key, value]) => [key, Number(value)]),
    ),
  );
  const result = model.predict(derived);

  return {
    prediction: result.prediction,
    confidence: result.confidence,
    efficiency: round((result.prediction / derived.input_water) * 100, 2),
    demand_ratio: derived.demand_ratio,
    salinity_impact: derived.salinity_impact,
  };
};
