import { parseAsInteger, parseAsString } from 'nuqs/server';

export const meetingsSearchParams = {
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(10),
  search: parseAsString.withDefault(''),
  status: parseAsString.withDefault(''),
  agentId: parseAsString.withDefault(''),
};

export function parseMeetingsSearchParams(params: Record<string, string | string[] | undefined>) {
  return {
    page: params.page ? parseInt(params.page as string) || 1 : 1,
    pageSize: params.pageSize ? parseInt(params.pageSize as string) || 10 : 10,
    search: (params.search as string) || '',
    status: (params.status as string) || '',
    agentId: (params.agentId as string) || '',
  };
}