import { useQueryStates, parseAsString, parseAsBoolean } from 'nuqs';

export function useCalendarFilters() {
  return useQueryStates({
    date: parseAsString.withDefault(new Date().toISOString().split('T')[0]),
    showCompleted: parseAsBoolean.withDefault(false),
  });
}