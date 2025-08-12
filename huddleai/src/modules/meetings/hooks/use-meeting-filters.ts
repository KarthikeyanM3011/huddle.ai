import { useQueryStates, parseAsInteger, parseAsString } from 'nuqs';

export function useMeetingFilters() {
  return useQueryStates({
    page: parseAsInteger.withDefault(1),
    pageSize: parseAsInteger.withDefault(10),
    search: parseAsString.withDefault(''),
    status: parseAsString.withDefault(''),
    agentId: parseAsString.withDefault(''),
  });
}