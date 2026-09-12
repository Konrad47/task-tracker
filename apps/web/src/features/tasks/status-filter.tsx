'use client';

import { Button } from '@/components/ui/button';
import { FILTERS, STATUS_LABELS, type StatusFilter } from './status';

export function StatusFilterBar({
  value,
  onChange,
}: {
  value: StatusFilter;
  onChange: (value: StatusFilter) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter tasks by status">
      {FILTERS.map((filter) => (
        <Button
          key={filter}
          variant={value === filter ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange(filter)}
        >
          {filter === 'all' ? 'All' : STATUS_LABELS[filter]}
        </Button>
      ))}
    </div>
  );
}
