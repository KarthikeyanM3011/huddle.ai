import { parseAsInteger, parseAsString } from 'nuqs/server';

export const agentsSearchParams = {
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(10),
  search: parseAsString.withDefault(''),
};

// Helper function to parse search params manually
export function parseAgentsSearchParams(params: Record<string, string | string[] | undefined>) {
  return {
    page: params.page ? parseInt(params.page as string) || 1 : 1,
    pageSize: params.pageSize ? parseInt(params.pageSize as string) || 10 : 10,
    search: (params.search as string) || '',
  };
}