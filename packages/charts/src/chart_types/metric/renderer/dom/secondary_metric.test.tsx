/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import { SecondaryMetric } from './secondary_metric';
import { createChartStore } from '../../../../state/chart_state';

const label = 'Last week';
const value = '87.20';

const renderSecondaryMetric = (ui: React.ReactElement) => {
  const store = createChartStore('tooltip-test');
  return render(<Provider store={store}>{ui}</Provider>);
};

const getSecondaryMetric = (container: HTMLElement) => {
  const metric = container.querySelector('.echSecondaryMetric');
  if (!metric) {
    throw new Error('Expected .echSecondaryMetric');
  }
  return metric;
};

describe('SecondaryMetric', () => {
  it('renders the label and value by default', () => {
    const { container } = renderSecondaryMetric(
      <SecondaryMetric value={value} label={label} badgeBorderColor={undefined} />,
    );

    expect(container.querySelector('.echSecondaryMetric__label')).toHaveTextContent(label);
    expect(container.querySelector('.echSecondaryMetric__value')).toHaveTextContent(value);
  });

  it('hides the inline label and shows it in a tooltip on hover', () => {
    const { container } = renderSecondaryMetric(
      <SecondaryMetric value={value} label={label} labelPosition="tooltip" badgeBorderColor={undefined} />,
    );
    const metric = getSecondaryMetric(container);

    expect(container.querySelector('.echSecondaryMetric__label')).not.toBeInTheDocument();
    expect(container.querySelector('.echScreenReaderOnly')).toHaveTextContent(label);
    expect(container.querySelector('.echSecondaryMetric__value')).toHaveTextContent(value);
    expect(screen.queryByTestId('echTooltipHeader')).not.toBeInTheDocument();
    fireEvent.mouseEnter(metric);
    expect(screen.getByTestId('echTooltipHeader')).toHaveTextContent(label);

    fireEvent.mouseLeave(metric);
    expect(screen.queryByTestId('echTooltipHeader')).not.toBeInTheDocument();
  });
});
