import { parseAsString, parseAsBoolean } from 'nuqs/server';

export const calendarSearchParams = {
  date: parseAsString.withDefault(new Date().toISOString().split('T')[0]),
  showCompleted: parseAsBoolean.withDefault(false),
};

export function parseCalendarSearchParams(params: Record<string, string | string[] | undefined>) {
  return {
    date: (params.date as string) || new Date().toISOString().split('T')[0],
    showCompleted: params.showCompleted === 'true',
  };
}