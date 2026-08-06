import { api } from "@/lib/api";

export interface SearchResult {
  id: string;
  type: 'PROJECT' | 'TASK' | 'POST' | 'USER';
  title: string;
  subtitle?: string;
  link: string;
}

export const globalSearch = async (query: string): Promise<SearchResult[]> => {
  if (!query || query.trim().length < 2) return [];
  const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
  return response.data.results;
};
