import type { ChartOptions } from 'chart.js';

interface LegendOptions {
  position: 'top' | 'bottom' | 'left' | 'right';
  labels: {
    boxWidth: number;
    padding: number;
    font: { size: number };
    usePointStyle: boolean;
  };
}

interface TooltipOptions {
  enabled: boolean;
  bodyFont: { size: number };
  titleFont: { size: number };
  padding: number;
  caretSize: number;
}

interface BaseChartOptions {
  responsive: boolean;
  maintainAspectRatio: boolean;
  interaction: {
    mode: 'index' | 'point';
    intersect: boolean;
  };
  plugins: {
    legend: LegendOptions;
    tooltip: TooltipOptions;
  };
}

export function createBaseChartOptions(
  interactionMode: 'index' | 'point' = 'index'
): BaseChartOptions {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: interactionMode,
      intersect: interactionMode === 'point',
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 12,
          padding: 8,
          font: { size: 11 },
          usePointStyle: true,
        },
      },
      tooltip: {
        enabled: true,
        bodyFont: { size: 12 },
        titleFont: { size: 13 },
        padding: 10,
        caretSize: 8,
      },
    },
  };
}

interface TitleConfig {
  text: string;
  fontSize?: number;
}

interface AxisConfig {
  title?: string;
  maxTicksLimit?: number;
}

export function createBarChartOptions(
  title: TitleConfig,
  yAxis: AxisConfig = {}
): ChartOptions<'bar'> {
  const base = createBaseChartOptions('index');
  return {
    ...base,
    plugins: {
      ...base.plugins,
      title: {
        display: true,
        text: title.text,
        font: { size: title.fontSize ?? 14 },
        padding: { top: 10, bottom: 10 },
      },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 0,
          autoSkip: true,
          maxTicksLimit: yAxis.maxTicksLimit ?? 8,
          font: { size: 10 },
        },
      },
      y: {
        beginAtZero: true,
        title: yAxis.title
          ? { display: true, text: yAxis.title, font: { size: 11 } }
          : undefined,
        ticks: { font: { size: 10 } },
      },
    },
  };
}

export function createLineChartOptions(
  title: TitleConfig,
  yAxis: AxisConfig = {}
): ChartOptions<'line'> {
  const base = createBaseChartOptions('index');
  return {
    ...base,
    plugins: {
      ...base.plugins,
      title: {
        display: true,
        text: title.text,
        font: { size: title.fontSize ?? 14 },
        padding: { top: 10, bottom: 10 },
      },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 0,
          autoSkip: true,
          maxTicksLimit: yAxis.maxTicksLimit ?? 8,
          font: { size: 10 },
        },
      },
      y: {
        beginAtZero: true,
        title: yAxis.title
          ? { display: true, text: yAxis.title, font: { size: 11 } }
          : undefined,
        ticks: { font: { size: 10 } },
      },
    },
  };
}
