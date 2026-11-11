import { formatMoney } from '../lib/format';
import { useCountUp } from '../lib/useCountUp';

interface StatCounterProps {
  label: string;
  target: number;
  prefix?: string;
  suffix?: string;
}

export function StatCounter({ label, target, prefix = '', suffix = '' }: StatCounterProps) {
  const { value, ref } = useCountUp(target);
  return (
    <div ref={ref} className="text-center">
      <div className="count-pop font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
        {prefix}
        {formatMoney(value).replace('$0', '$0')}
        {suffix}
      </div>
      <p className="mt-2 text-sm font-medium uppercase tracking-wider text-primary-100">{label}</p>
    </div>
  );
}
