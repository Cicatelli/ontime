import { formatDelay, formatGap } from './EventBlock.utils';

import style from './RundownIndicators.module.scss';

interface RundownIndicatorProps {
  timeStart: number;
  isNextDay: boolean;
  delay: number;
  gap: number;
}

export default function RundownIndicators(props: RundownIndicatorProps) {
  const { timeStart, delay, gap, isNextDay } = props;

  const hasGap = formatGap(gap, isNextDay);
  const hasDelay = formatDelay(timeStart, delay);

  return (
    <div className={style.indicators}>
      {hasDelay && <div className={style.delay}>{hasDelay}</div>}
      {hasGap && <div className={style.gap}>{hasGap}</div>}
    </div>
  );
}
