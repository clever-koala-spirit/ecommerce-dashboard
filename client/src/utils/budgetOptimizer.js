// Budget allocation and scenario simulator

/**
 * Simulate revenue and metrics for a given budget allocation
 * @param {object} channelBudgets - {meta: number, google: number, tiktok: number, ...}
 * @param {object[]} historicalData - Historical data by channel
 * @returns {object} Projected metrics
 */
export function simulateScenario(channelBudgets, historicalData) {
  if (!channelBudgets || !historicalData) {
    return {
      totalSpend: 0,
      totalRevenue: 0,
      roas: 0,
      cpa: 0,
      profit: 0,
      margin: 0,
      byChannel: {},
    };
  }

  const result = {
    totalSpend: 0,
    totalRevenue: 0,
    totalCPA: 0,
    conversions: 0,
    byChannel: {},
  };

  // Calculate current metrics by channel
  const channelMetrics = {};

  // Meta
  if (historicalData.meta && historicalData.meta.length > 0) {
    const metaSum = historicalData.meta.reduce(
      (acc, d) => ({
        spend: acc.spend + (d.spend || 0),
        revenue: acc.revenue + (d.revenue || 0),
        purchases: acc.purchases + (d.purchases || 0),
      }),
      { spend: 0, revenue: 0, purchases: 0 }
    );

    const metaRoas = metaSum.spend > 0 ? metaSum.revenue / metaSum.spend : 0;
    const metaCpa = metaSum.purchases > 0 ? metaSum.spend / metaSum.purchases : 0;

    channelMetrics.meta = {
      roas: metaRoas,
      cpa: metaCpa,
      conversionRate: metaSum.purchases / (metaSum.spend > 0 ? metaSum.spend * 0.001 : 1),
    };
  }

  // Google
  if (historicalData.google && historicalData.google.length > 0) {
    const googleSum = historicalData.google.reduce(
      (acc, d) => ({
        spend: acc.spend + (d.spend || 0),
        conversionValue: acc.conversionValue + (d.conversionValue || 0),
        conversions: acc.conversions + (d.conversions || 0),
      }),
      { spend: 0, conversionValue: 0, conversions: 0 }
    );

    const googleRoas = googleSum.spend > 0 ? googleSum.conversionValue / googleSum.spend : 0;
    const googleCpa = googleSum.conversions > 0 ? googleSum.spend / googleSum.conversions : 0;

    channelMetrics.google = {
      roas: googleRoas,
      cpa: googleCpa,
      conversionRate: googleSum.conversions / (googleSum.spend > 0 ? googleSum.spend * 0.001 : 1),
    };
  }

  // TikTok (estimate based on typical performance)
  channelMetrics.tiktok = {
    roas: 2.8, // Typically performs well
    cpa: 35,
    conversionRate: 0.08,
  };

  // Simulate with new budgets
  for (const [channel, budget] of Object.entries(channelBudgets)) {
    if (!budget || budget <= 0) continue;

    const metrics = channelMetrics[channel] || channelMetrics.google || { roas: 2.5, cpa: 45 };

    const revenue = budget * metrics.roas;
    const purchases = metrics.cpa > 0 ? budget / metrics.cpa : 0;

    result.byChannel[channel] = {
      budget,
      revenue,
      roas: metrics.roas,
      cpa: metrics.cpa,
      purchases: Math.round(purchases),
    };

    result.totalSpend += budget;
    result.totalRevenue += revenue;
    result.conversions += purchases;
  }

  // Calculate blended metrics
  result.roas = result.totalSpend > 0 ? result.totalRevenue / result.totalSpend : 0;
  result.totalCPA = result.conversions > 0 ? result.totalSpend / result.conversions : 0;

  // Estimate profit (assumes ~40% COGS, 8% platform fees)
  const cogs = result.totalRevenue * 0.4;
  const platformFees = result.totalRevenue * 0.08;
  const adSpend = result.totalSpend;

  result.profit = result.totalRevenue - cogs - platformFees - adSpend;
  result.margin = result.totalRevenue > 0 ? (result.profit / result.totalRevenue) * 100 : 0;

  return result;
}

/**
 * Find optimal budget allocation using gradient-based optimization
 * @param {number} totalBudget - Total budget to allocate
 * @param {object[]} historicalData - Historical data
 * @param {object} constraints - Allocation constraints (min/max per channel)
 * @returns {object} Optimized allocation
 */
export function findOptimalAllocation(totalBudget, historicalData, constraints = {}) {
  if (!totalBudget || totalBudget <= 0) {
    return {
      allocation: {},
      profit: 0,
      iterations: 0,
    };
  }

  const channels = ['meta', 'google', 'tiktok'];
  const maxIterations = 100;
  const stepSize = 500;

  // Initialize allocation (equal split)
  let currentAllocation = {};
  const budgetPerChannel = totalBudget / channels.length;
  for (const channel of channels) {
    currentAllocation[channel] = budgetPerChannel;
  }

  let bestAllocation = { ...currentAllocation };
  let bestProfit = simulateScenario(bestAllocation, historicalData).profit;

  // Gradient-based optimization
  for (let iteration = 0; iteration < maxIterations; iteration++) {
    let improved = false;

    for (let i = 0; i < channels.length; i++) {
      for (let j = i + 1; j < channels.length; j++) {
        const channel1 = channels[i];
        const channel2 = channels[j];

        // Try shifting budget from channel1 to channel2
        const testAllocation = { ...currentAllocation };
        testAllocation[channel1] -= stepSize;
        testAllocation[channel2] += stepSize;

        // Check constraints
        if (
          testAllocation[channel1] < (constraints[channel1]?.min || 0) ||
          testAllocation[channel2] > (constraints[channel2]?.max || totalBudget)
        ) {
          continue;
        }

        const testProfit = simulateScenario(testAllocation, historicalData).profit;

        if (testProfit > bestProfit) {
          bestProfit = testProfit;
          bestAllocation = testAllocation;
          currentAllocation = testAllocation;
          improved = true;
        }
      }
    }

    if (!improved || iteration > 50) break;
  }

  return {
    allocation: bestAllocation,
    scenario: simulateScenario(bestAllocation, historicalData),
    iterations: maxIterations,
  };
}

/**
 * Model diminishing returns for a channel
 * Fits power or log curve to spend vs revenue
 * @param {number[]} spendData - Historical spend amounts
 * @param {number[]} revenueData - Corresponding revenue
 * @returns {object} Model parameters
 */
export function diminishingReturnsModel(spendData, revenueData) {
  if (
    !spendData ||
    !revenueData ||
    spendData.length < 2 ||
    spendData.length !== revenueData.length
  ) {
    return {
      type: 'linear',
      a: 1,
      b: 0,
      r2: 0,
    };
  }

  // Try power model: revenue = a * spend^b
  let bestType = 'linear';
  let bestParams = { a: 1, b: 0 };
  let bestR2 = 0;

  // Calculate means for linear baseline
  const spendMean = spendData.reduce((a, b) => a + b, 0) / spendData.length;
  const revenueMean = revenueData.reduce((a, b) => a + b, 0) / revenueData.length;

  // Linear regression
  let linearSumXY = 0;
  let linearSumX2 = 0;
  for (let i = 0; i < spendData.length; i++) {
    const x = spendData[i] - spendMean;
    const y = revenueData[i] - revenueMean;
    linearSumXY += x * y;
    linearSumX2 += x * x;
  }

  if (linearSumX2 > 0) {
    const linearSlope = linearSumXY / linearSumX2;
    const linearIntercept = revenueMean - linearSlope * spendMean;

    // Calculate R2 for linear
    let linearSSRes = 0;
    let linearSSTot = 0;
    for (let i = 0; i < spendData.length; i++) {
      const actual = revenueData[i];
      const predicted = linearIntercept + linearSlope * spendData[i];
      linearSSRes += Math.pow(actual - predicted, 2);
      linearSSTot += Math.pow(actual - revenueMean, 2);
    }

    const linearR2 = linearSSTot > 0 ? 1 - linearSSRes / linearSSTot : 0;

    if (linearR2 > bestR2) {
      bestR2 = linearR2;
      bestType = 'linear';
      bestParams = { slope: linearSlope, intercept: linearIntercept };
    }
  }

  // Log model: revenue = a * log(spend) + b
  try {
    let logSumX = 0;
    let logSumY = 0;
    let logSumXY = 0;
    let logSumX2 = 0;
    let validCount = 0;

    for (let i = 0; i < spendData.length; i++) {
      if (spendData[i] > 0) {
        const x = Math.log(spendData[i]);
        const y = revenueData[i];
        logSumX += x;
        logSumY += y;
        logSumXY += x * y;
        logSumX2 += x * x;
        validCount++;
      }
    }

    if (validCount > 1) {
      const logXMean = logSumX / validCount;
      const logYMean = logSumY / validCount;

      let logNumerator = 0;
      let logDenominator = 0;
      for (let i = 0; i < spendData.length; i++) {
        if (spendData[i] > 0) {
          const x = Math.log(spendData[i]);
          const y = revenueData[i];
          logNumerator += (x - logXMean) * (y - logYMean);
          logDenominator += Math.pow(x - logXMean, 2);
        }
      }

      if (logDenominator > 0) {
        const logSlope = logNumerator / logDenominator;
        const logIntercept = logYMean - logSlope * logXMean;

        // Calculate R2 for log
        let logSSRes = 0;
        let logSSTot = 0;
        for (let i = 0; i < spendData.length; i++) {
          if (spendData[i] > 0) {
            const actual = revenueData[i];
            const predicted = logIntercept + logSlope * Math.log(spendData[i]);
            logSSRes += Math.pow(actual - predicted, 2);
            logSSTot += Math.pow(actual - logYMean, 2);
          }
        }

        const logR2 = logSSTot > 0 ? 1 - logSSRes / logSSTot : 0;

        if (logR2 > bestR2) {
          bestR2 = logR2;
          bestType = 'log';
          bestParams = { slope: logSlope, intercept: logIntercept };
        }
      }
    }
  } catch (e) {
    // Log model failed, stick with linear
  }

  return {
    type: bestType,
    ...bestParams,
    r2: Math.round(bestR2 * 10000) / 10000,
  };
}

/**
 * Calculate break-even point
 * @param {number} fixedCosts - Monthly fixed costs
 * @param {number} variableCostRate - Variable cost as % of revenue (0-1)
 * @param {number} aov - Average order value
 * @returns {object} Break-even metrics
 */
export function calculateBreakeven(fixedCosts, variableCostRate, aov) {
  if (!aov || aov <= 0) {
    return {
      breakEvenRevenue: 0,
      breakEvenOrders: 0,
      breakEvenDailyRevenue: 0,
      margin: 0,
    };
  }

  const contributionMargin = 1 - variableCostRate;

  if (contributionMargin <= 0) {
    return {
      breakEvenRevenue: Infinity,
      breakEvenOrders: Infinity,
      breakEvenDailyRevenue: Infinity,
      margin: 0,
    };
  }

  const breakEvenRevenue = fixedCosts / contributionMargin;
  const breakEvenOrders = breakEvenRevenue / aov;
  const breakEvenDailyRevenue = breakEvenRevenue / 30; // Assuming 30 day month

  return {
    breakEvenRevenue: Math.round(breakEvenRevenue * 100) / 100,
    breakEvenOrders: Math.ceil(breakEvenOrders),
    breakEvenDailyRevenue: Math.round(breakEvenDailyRevenue * 100) / 100,
    margin: Math.round(contributionMargin * 10000) / 100,
  };
}

/**
 * Calculate impact of shifting budget between channels
 * @param {object} currentAllocation - Current budget allocation
 * @param {string} fromChannel - Channel to shift from
 * @param {string} toChannel - Channel to shift to
 * @param {number} shiftAmount - Amount to shift
 * @param {object[]} historicalData - Historical data
 * @returns {object} Impact analysis
 */
export function calculateBudgetShiftImpact(
  currentAllocation,
  fromChannel,
  toChannel,
  shiftAmount,
  historicalData
) {
  const currentScenario = simulateScenario(currentAllocation, historicalData);

  const newAllocation = {
    ...currentAllocation,
    [fromChannel]: (currentAllocation[fromChannel] || 0) - shiftAmount,
    [toChannel]: (currentAllocation[toChannel] || 0) + shiftAmount,
  };

  const newScenario = simulateScenario(newAllocation, historicalData);

  return {
    currentProfit: currentScenario.profit,
    newProfit: newScenario.profit,
    profitDelta: newScenario.profit - currentScenario.profit,
    currentROAS: currentScenario.roas,
    newROAS: newScenario.roas,
    recommendation:
      newScenario.profit > currentScenario.profit
        ? `Shift $${Math.round(shiftAmount)} from ${fromChannel} to ${toChannel}`
        : `Keep current allocation`,
  };
}
