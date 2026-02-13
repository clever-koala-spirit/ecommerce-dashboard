// Core forecasting library - pure JavaScript, no external dependencies
// Implements multiple time series forecasting methods

/**
 * Simple moving average
 * @param {number[]} data - Array of values
 * @param {number} window - Window size for averaging
 * @returns {number[]} Moving averages
 */
export function movingAverage(data, window) {
  if (!data || data.length === 0 || window <= 0) return [];
  if (window > data.length) window = data.length;

  const result = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - window + 1);
    const slice = data.slice(start, i + 1);
    const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
    result.push(avg);
  }
  return result;
}

/**
 * Single exponential smoothing with auto-optimized alpha
 * @param {number[]} data - Array of values
 * @param {number} alpha - Smoothing factor (0-1). If null, optimizes automatically
 * @returns {object} Smoothed values and alpha
 */
export function exponentialSmoothing(data, alpha = null) {
  if (!data || data.length === 0) return { result: [], alpha: 0.2 };

  // Auto-optimize alpha if not provided
  if (alpha === null) {
    alpha = 0.2; // Default reasonable alpha
    // Test a few values and pick the one with lowest MSE on last 20% of data
    const testSize = Math.max(5, Math.ceil(data.length * 0.2));
    let bestAlpha = 0.2;
    let bestMSE = Infinity;

    for (let testAlpha of [0.1, 0.2, 0.3, 0.4, 0.5]) {
      const smoothed = exponentialSmoothing(data, testAlpha).result;
      const testData = data.slice(-testSize);
      const testSmoothed = smoothed.slice(-testSize);
      const mse =
        testData.reduce((sum, val, i) => sum + Math.pow(val - testSmoothed[i], 2), 0) / testSize;
      if (mse < bestMSE) {
        bestMSE = mse;
        bestAlpha = testAlpha;
      }
    }
    alpha = bestAlpha;
  }

  const result = [];
  let s = data[0];
  result.push(s);

  for (let i = 1; i < data.length; i++) {
    s = alpha * data[i] + (1 - alpha) * s;
    result.push(s);
  }

  return { result, alpha };
}

/**
 * Double exponential smoothing (Holt's method)
 * Captures trend in addition to level
 * @param {number[]} data - Array of values
 * @param {number} alpha - Level smoothing factor
 * @param {number} beta - Trend smoothing factor
 * @returns {object} Smoothed values and trend
 */
export function doubleExponentialSmoothing(data, alpha = 0.2, beta = 0.1) {
  if (!data || data.length < 2) return { result: data || [], trend: 0 };

  const result = [];
  let level = data[0];
  let trend = data[1] - data[0];

  result.push(level);

  for (let i = 1; i < data.length; i++) {
    const prevLevel = level;
    level = alpha * data[i] + (1 - alpha) * (prevLevel + trend);
    trend = beta * (level - prevLevel) + (1 - beta) * trend;
    result.push(level);
  }

  return { result, trend };
}

/**
 * Triple exponential smoothing (Holt-Winters)
 * Captures level, trend, and seasonality
 * @param {number[]} data - Array of values
 * @param {number} seasonLength - Length of seasonal cycle
 * @param {number} alpha - Level smoothing
 * @param {number} beta - Trend smoothing
 * @param {number} gamma - Seasonal smoothing
 * @returns {object} Smoothed values and components
 */
export function holtWinters(data, seasonLength, alpha = 0.2, beta = 0.1, gamma = 0.1) {
  if (!data || data.length < seasonLength * 2) {
    return doubleExponentialSmoothing(data, alpha, beta);
  }

  const result = [];
  const seasonals = [];

  // Initialize level and trend
  let level = data.slice(0, seasonLength).reduce((a, b) => a + b, 0) / seasonLength;
  let trend = (data.slice(seasonLength, 2 * seasonLength).reduce((a, b) => a + b, 0) / seasonLength - level) / seasonLength;

  // Initialize seasonals
  for (let i = 0; i < seasonLength; i++) {
    seasonals.push(data[i] / level);
  }

  result.push(level);

  for (let i = 1; i < data.length; i++) {
    const prevLevel = level;
    const seasonalIndex = i % seasonLength;
    const seasonal = seasonals[seasonalIndex];

    level = alpha * (data[i] / seasonal) + (1 - alpha) * (prevLevel + trend);
    trend = beta * (level - prevLevel) + (1 - beta) * trend;
    seasonals[seasonalIndex] = gamma * (data[i] / level) + (1 - gamma) * seasonal;

    result.push(level * seasonal);
  }

  return { result, trend, seasonals, level };
}

/**
 * Linear regression
 * @param {number[]} data - Array of values
 * @returns {object} Slope, intercept, and R-squared
 */
export function linearRegression(data) {
  if (!data || data.length < 2) return { slope: 0, intercept: 0, rSquared: 0 };

  const n = data.length;
  const xMean = (n - 1) / 2;
  const yMean = data.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denominator = 0;
  let ssRes = 0;
  let ssTot = 0;

  for (let i = 0; i < n; i++) {
    const x = i;
    const y = data[i];
    numerator += (x - xMean) * (y - yMean);
    denominator += Math.pow(x - xMean, 2);
    ssTot += Math.pow(y - yMean, 2);
  }

  const slope = denominator !== 0 ? numerator / denominator : 0;
  const intercept = yMean - slope * xMean;

  // Calculate fitted values for R-squared
  for (let i = 0; i < n; i++) {
    const fitted = intercept + slope * i;
    ssRes += Math.pow(data[i] - fitted, 2);
  }

  const rSquared = ssTot !== 0 ? 1 - ssRes / ssTot : 0;

  return { slope, intercept, rSquared };
}

/**
 * Detect seasonality via autocorrelation
 * Looks for weekly (7) or monthly (30) patterns
 * @param {number[]} data - Array of values
 * @returns {number|null} Seasonality period or null
 */
export function detectSeasonality(data) {
  if (!data || data.length < 30) return null;

  const lags = [7, 14, 30];
  let bestLag = null;
  let bestCorr = 0;

  for (const lag of lags) {
    if (data.length <= lag) continue;

    let sum = 0;
    let count = 0;
    for (let i = lag; i < data.length; i++) {
      sum += data[i] * data[i - lag];
      count++;
    }
    const lagMean = sum / count;

    // Normalize
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    const corr = variance !== 0 ? lagMean / variance : 0;

    if (corr > bestCorr && corr > 0.5) {
      bestCorr = corr;
      bestLag = lag;
    }
  }

  return bestLag;
}

/**
 * Detect anomalies using z-score
 * @param {number[]} data - Array of values
 * @param {number} threshold - Z-score threshold (typically 2-3)
 * @returns {number[]} Indices of anomalous values
 */
export function detectAnomalies(data, threshold = 2) {
  if (!data || data.length < 2) return [];

  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return [];

  const anomalies = [];
  for (let i = 0; i < data.length; i++) {
    const zScore = Math.abs((data[i] - mean) / stdDev);
    if (zScore > threshold) {
      anomalies.push(i);
    }
  }

  return anomalies;
}

/**
 * Calculate Mean Absolute Percentage Error
 */
function calculateMAPE(actual, predicted) {
  if (!actual || !predicted || actual.length === 0) return 0;

  let sum = 0;
  let count = 0;
  for (let i = 0; i < Math.min(actual.length, predicted.length); i++) {
    if (actual[i] !== 0) {
      sum += Math.abs((actual[i] - predicted[i]) / actual[i]);
      count++;
    }
  }
  return count > 0 ? (sum / count) * 100 : 0;
}

/**
 * Calculate Root Mean Squared Error
 */
function calculateRMSE(actual, predicted) {
  if (!actual || !predicted || actual.length === 0) return 0;

  let sum = 0;
  const length = Math.min(actual.length, predicted.length);
  for (let i = 0; i < length; i++) {
    sum += Math.pow(actual[i] - predicted[i], 2);
  }
  return Math.sqrt(sum / length);
}

/**
 * Calculate Mean Absolute Error
 */
function calculateMAE(actual, predicted) {
  if (!actual || !predicted || actual.length === 0) return 0;

  let sum = 0;
  const length = Math.min(actual.length, predicted.length);
  for (let i = 0; i < length; i++) {
    sum += Math.abs(actual[i] - predicted[i]);
  }
  return sum / length;
}

/**
 * Main forecast function
 * @param {object[]} historicalData - Array of {date, value} objects
 * @param {number} horizon - Number of periods to forecast
 * @param {object} options - Forecast options
 * @returns {object} Forecast result with predictions, metrics, and metadata
 */
export function forecast(historicalData, horizon, options = {}) {
  const {
    method = 'auto',
    confidence = 0.95,
    seasonality = 'auto',
  } = options;

  if (!historicalData || historicalData.length === 0) {
    return {
      values: [],
      method: 'none',
      confidence,
      metrics: { mape: 0, rmse: 0, mae: 0 },
      seasonality: null,
      trend: 'flat',
      dataPoints: 0,
      error: 'No historical data provided',
    };
  }

  // Extract values and dates
  const values = historicalData.map((d) => d.value || 0);
  const dates = historicalData.map((d) => d.date);

  if (values.length < 2) {
    return {
      values: [],
      method: 'insufficient_data',
      confidence,
      metrics: { mape: 0, rmse: 0, mae: 0 },
      seasonality: null,
      trend: 'flat',
      dataPoints: values.length,
      error: 'Insufficient data for forecasting',
    };
  }

  // Detect seasonality
  let detectedSeasonality = null;
  if (seasonality === 'auto') {
    detectedSeasonality = detectSeasonality(values);
  } else if (typeof seasonality === 'number') {
    detectedSeasonality = seasonality;
  }

  // Choose method
  let selectedMethod = method;
  if (method === 'auto') {
    if (values.length >= 60 && detectedSeasonality) {
      selectedMethod = 'holt_winters';
    } else if (values.length >= 14) {
      selectedMethod = 'double_exponential';
    } else if (values.length >= 7) {
      selectedMethod = 'exponential';
    } else {
      selectedMethod = 'linear';
    }
  }

  // Fit model
  let fitted = [];
  let forecastedValues = [];
  let trend = 0;

  switch (selectedMethod) {
    case 'holt_winters':
      if (detectedSeasonality && values.length >= detectedSeasonality * 2) {
        const hw = holtWinters(values, detectedSeasonality, 0.2, 0.1, 0.1);
        fitted = hw.result;
        trend = hw.trend;

        // Forecast
        let level = hw.level;
        let trendVal = hw.trend;
        for (let i = 0; i < horizon; i++) {
          const seasonalIndex = (values.length + i) % detectedSeasonality;
          const seasonal = hw.seasonals[seasonalIndex] || 1;
          level += trendVal;
          forecastedValues.push(Math.max(0, level * seasonal));
        }
      } else {
        selectedMethod = 'double_exponential';
        const des = doubleExponentialSmoothing(values, 0.2, 0.1);
        fitted = des.result;
        trend = des.trend;

        let level = fitted[fitted.length - 1];
        for (let i = 0; i < horizon; i++) {
          level += trend;
          forecastedValues.push(Math.max(0, level));
        }
      }
      break;

    case 'double_exponential':
      const des = doubleExponentialSmoothing(values, 0.2, 0.1);
      fitted = des.result;
      trend = des.trend;

      let level = fitted[fitted.length - 1];
      for (let i = 0; i < horizon; i++) {
        level += trend;
        forecastedValues.push(Math.max(0, level));
      }
      break;

    case 'exponential':
      const es = exponentialSmoothing(values, 0.2);
      fitted = es.result;

      const lastValue = fitted[fitted.length - 1];
      const prevValue = fitted[fitted.length - 2];
      trend = lastValue - prevValue;

      for (let i = 0; i < horizon; i++) {
        forecastedValues.push(Math.max(0, lastValue));
      }
      break;

    case 'linear':
    default:
      const lr = linearRegression(values);
      trend = lr.slope;

      for (let i = 0; i < horizon; i++) {
        const forecastIdx = values.length + i;
        const pred = Math.max(0, lr.intercept + lr.slope * forecastIdx);
        forecastedValues.push(pred);
      }

      // Fit line to data
      for (let i = 0; i < values.length; i++) {
        fitted.push(lr.intercept + lr.slope * i);
      }
      break;
  }

  // Calculate accuracy metrics on last 20% of data as holdout
  const holdoutSize = Math.max(1, Math.ceil(values.length * 0.2));
  const trainData = values.slice(0, values.length - holdoutSize);
  const testData = values.slice(-holdoutSize);
  const fittedTest = fitted.slice(-holdoutSize);

  const mape = calculateMAPE(testData, fittedTest);
  const rmse = calculateRMSE(testData, fittedTest);
  const mae = calculateMAE(testData, fittedTest);

  // Calculate residual std dev for confidence intervals
  let residualSum = 0;
  for (let i = 0; i < Math.min(fitted.length, values.length); i++) {
    residualSum += Math.pow(values[i] - fitted[i], 2);
  }
  const residualStdDev = Math.sqrt(residualSum / Math.max(1, values.length - 1));

  // Z-score for confidence level
  const zScores = {
    0.8: 1.28,
    0.9: 1.645,
    0.95: 1.96,
    0.99: 2.576,
  };
  const zScore = zScores[confidence] || 1.96;

  // Build forecast output
  const forecastValues = [];
  let forecastDate = new Date(dates[dates.length - 1]);

  for (let i = 0; i < forecastedValues.length; i++) {
    forecastDate = new Date(forecastDate);
    forecastDate.setDate(forecastDate.getDate() + 1);

    const predicted = forecastedValues[i];
    const marginOfError = zScore * residualStdDev * Math.sqrt(i + 1);
    const lower = Math.max(0, predicted - marginOfError);
    const upper = predicted + marginOfError;

    forecastValues.push({
      date: forecastDate.toISOString().split('T')[0],
      predicted: Math.round(predicted * 100) / 100,
      lower: Math.round(lower * 100) / 100,
      upper: Math.round(upper * 100) / 100,
    });
  }

  // Determine trend direction
  let trendDirection = 'flat';
  if (trend > 0.1) trendDirection = 'up';
  else if (trend < -0.1) trendDirection = 'down';

  return {
    values: forecastValues,
    method: selectedMethod,
    confidence,
    metrics: {
      mape: Math.round(mape * 100) / 100,
      rmse: Math.round(rmse * 100) / 100,
      mae: Math.round(mae * 100) / 100,
    },
    seasonality: detectedSeasonality,
    trend: trendDirection,
    trendValue: Math.round(trend * 100) / 100,
    dataPoints: values.length,
    fitted: fitted.map((v, i) => ({
      date: dates[i],
      value: Math.round(v * 100) / 100,
    })),
  };
}

/**
 * Forecast multiple metrics at once
 */
export function forecastMultiple(metricsData, horizon, options = {}) {
  const results = {};

  for (const [metric, data] of Object.entries(metricsData)) {
    results[metric] = forecast(data, horizon, options);
  }

  return results;
}
