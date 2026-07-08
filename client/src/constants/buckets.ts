import type { Bucket } from "../types";

export const BUCKET_INFO: Record<Bucket, { label: string; description: string }> = {
  full_control: {
    label: "Fully in my control",
    description: "My actions, effort, and how I respond.",
  },
  partial_control: {
    label: "Partially in my control",
    description: "Outcomes I can influence but not guarantee.",
  },
  no_control: {
    label: "Not in my control",
    description: "Other people, the past, external events.",
  },
};

export const BUCKET_ORDER: Bucket[] = ["full_control", "partial_control", "no_control"];
