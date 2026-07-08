import { apiClient } from "./client";
import type { Bucket, BucketReframe, SortedThought } from "../types";

export interface ThoughtSearchParams {
  query?: string;
  bucket?: Bucket;
  from?: string;
  to?: string;
}

export const thoughtsApi = {
  create: (entryDate: string, worryText: string, bucket: Bucket, customReframe?: BucketReframe) =>
    apiClient.post<SortedThought>("/thoughts", {
      entry_date: entryDate,
      worry_text: worryText,
      bucket,
      custom_reframe: customReframe,
    }),
  search: (params: ThoughtSearchParams = {}) => {
    const search = new URLSearchParams();
    if (params.query) search.set("query", params.query);
    if (params.bucket) search.set("bucket", params.bucket);
    if (params.from) search.set("from", params.from);
    if (params.to) search.set("to", params.to);
    const suffix = search.toString() ? `?${search.toString()}` : "";
    return apiClient.get<SortedThought[]>(`/thoughts${suffix}`);
  },
  recordOutcome: (id: number, outcomeNote: string) =>
    apiClient.put<SortedThought>(`/thoughts/${id}/outcome`, { outcome_note: outcomeNote }),
};
