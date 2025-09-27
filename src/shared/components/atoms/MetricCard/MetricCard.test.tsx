import React from 'react';
import { render, screen } from '@testing-library/react';
import { MetricCard } from './MetricCard';
import type { DashboardMetric } from '../../../features/dashboard/types';

const mockMetric: DashboardMetric = {
  id: 'test-metric',
  title: 'Teste Métrica',
  value: 42,
  icon: 'Calendar',
  color: 'primary',
  permissions: ['dashboard_view'],
};

describe('MetricCard', () => {
  it('deve renderizar a métrica corretamente', () => {
    render(<MetricCard metric={mockMetric} />);
    
    expect(screen.getByText('Teste Métrica')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('deve renderizar trend quando fornecido', () => {
    const metricWithTrend: DashboardMetric = {
      ...mockMetric,
      trend: {
        value: 10,
        label: '+10% este mês',
        isPositive: true,
      },
    };

    render(<MetricCard metric={metricWithTrend} />);
    
    expect(screen.getByText('+10% este mês')).toBeInTheDocument();
  });
});