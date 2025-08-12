import { useQueryStates, parseAsInteger, parseAsString } from 'nuqs';

export function useAgentFilters() {
  return useQueryStates({
    page: parseAsInteger.withDefault(1),
    pageSize: parseAsInteger.withDefault(10),
    search: parseAsString.withDefault(''),
  });
}