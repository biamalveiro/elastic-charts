/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { Badge } from './badge';
import type { Color } from '../../../../common/colors';
import { Placement, TooltipPortal } from '../../../../components/portal';
import { TooltipContainer, TooltipHeader } from '../../../../components/tooltip';
import type { GlobalChartState } from '../../../../state/chart_state';
import type { MetricStyle } from '../../../../utils/themes/theme';
import type { SecondaryMetricProps } from '../../specs';

type SecondaryMetricInternalProps = Omit<SecondaryMetricProps, 'badgeBorderColor'> & {
  badgeBorderColor: Color | undefined;
  textAlign?: MetricStyle['extraTextAlign'];
};

/** @internal */
export const getTooltipPlacement = (textAlign: MetricStyle['extraTextAlign'] = 'center'): Placement => {
  if (textAlign === 'left') return Placement.Right;
  if (textAlign === 'right') return Placement.Left;
  return Placement.Top;
};

/** @internal */
export const LabelTooltip = ({
  label,
  anchorRef,
  placement,
}: {
  label: string;
  anchorRef: React.RefObject<HTMLSpanElement>;
  placement: Placement;
}) => {
  const chartId = useSelector((state: GlobalChartState) => state.chartId);
  const zIndex = useSelector((state: GlobalChartState) => state.zIndex);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const { current } = anchorRef;
    if (!current) return;

    const show = () => setShowTooltip(true);
    const hide = () => setShowTooltip(false);

    current.addEventListener('mouseenter', show);
    current.addEventListener('mouseleave', hide);

    return () => {
      current.removeEventListener('mouseenter', show);
      current.removeEventListener('mouseleave', hide);
    };
  }, [anchorRef]);

  if (!showTooltip) {
    return null;
  }

  return (
    <TooltipPortal
      scope="SecondaryMetricLabel"
      anchor={anchorRef}
      chartId={chartId}
      zIndex={zIndex + 100}
      visible
      settings={{ placement }}
    >
      <div aria-hidden="true">
        <TooltipContainer>
          <TooltipHeader>{label}</TooltipHeader>
        </TooltipContainer>
      </div>
    </TooltipPortal>
  );
};

/** @internal */
export const SecondaryMetric: React.FC<SecondaryMetricInternalProps> = ({
  value,
  label,
  badgeColor,
  badgeTextColor,
  labelPosition = 'before',
  style,
  ariaDescription,
  badgeBorderColor,
  icon,
  iconPosition,
  textAlign,
}) => {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const hasVisibleLabel = Boolean(label) && labelPosition !== 'tooltip';

  const labelNode = hasVisibleLabel ? (
    <span className="echSecondaryMetric__label echSecondaryMetric__truncate">{label}</span>
  ) : undefined;

  return (
    <span
      ref={anchorRef}
      className="echSecondaryMetric"
      {...(style ? { style } : {})}
      {...(ariaDescription ? { 'aria-describedby': ariaDescription } : {})}
    >
      {labelPosition === 'before' && labelNode}
      {label && labelPosition === 'tooltip' && <span className="echScreenReaderOnly">{label}</span>}
      {badgeColor ? (
        <Badge
          className={classNames('echSecondaryMetric__value', {
            'echSecondaryMetric__value--full': !hasVisibleLabel,
          })}
          value={value}
          backgroundColor={badgeColor}
          textColor={badgeTextColor}
          borderColor={badgeBorderColor}
          icon={icon}
          iconPosition={iconPosition}
        />
      ) : (
        <span
          className={classNames('echSecondaryMetric__value', 'echSecondaryMetric__truncate', {
            'echSecondaryMetric__value--full': !hasVisibleLabel,
          })}
        >
          {value}
        </span>
      )}
      {labelPosition === 'after' && labelNode}
      {label && labelPosition === 'tooltip' && (
        <LabelTooltip label={label} anchorRef={anchorRef} placement={getTooltipPlacement(textAlign)} />
      )}
    </span>
  );
};
