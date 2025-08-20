import { useQueryStates, parseAsString } from 'nuqs';

export function useCalendarFilters() {
  return useQueryStates({
    view: parseAsString.withDefault('month'),
    date: parseAsString.withDefault(new Date().toISOString().split('T')[0]),
  });
}