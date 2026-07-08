export type Bucket = "full_control" | "partial_control" | "no_control";

export interface BucketReframe {
  stoic_reframe: string;
  stoic_concept_ref: string;
  gita_reframe: string;
  gita_concept_ref: string;
}

/**
 * Static baseline reframe per bucket, always available with no API key.
 * AI-assist (step 7) supplies per-worry variety on top of this.
 */
export const bucketReframes: Record<Bucket, BucketReframe> = {
  full_control: {
    stoic_reframe:
      "This is squarely in the territory Epictetus called 'up to us' — your effort, honesty, and response. The Stoic move here is to give it your full attention precisely because it's yours to shape.",
    stoic_concept_ref: "Dichotomy of Control — Epictetus, Enchiridion 1",
    gita_reframe:
      "Bhagavad Gita 2.47 puts you in the same position Krishna described to Arjuna: this action is genuinely yours to perform well. Do it fully, without needing to know in advance how it lands.",
    gita_concept_ref: "Nishkama Karma — Bhagavad Gita 2.47",
  },
  partial_control: {
    stoic_reframe:
      "The Stoics compared this to an archer: you can aim carefully and release a good shot, but a gust of wind after that is no longer yours to control. Do the aiming well; let the wind be the wind.",
    stoic_concept_ref: "The Archer's Analogy — Stoic doctrine, preserved in Cicero's De Finibus",
    gita_reframe:
      "Bhagavad Gita 18.9 describes real renunciation not as giving up action, but as giving up your grip on the outcome while still doing the action as your duty. Put in the effort; hold the result loosely.",
    gita_concept_ref: "Tyaga (Letting Go of Attachment to Results) — Bhagavad Gita 18.9",
  },
  no_control: {
    stoic_reframe:
      "Epictetus would place this squarely outside your power — other people's choices, the past, external events. Spending your energy resisting it is spending energy you don't get back, on a battle that was never yours to fight.",
    stoic_concept_ref: "Dichotomy of Control — Epictetus, Enchiridion 1",
    gita_reframe:
      "Bhagavad Gita 2.14 describes exactly this kind of thing — passing contact with heat and cold, pleasure and pain — asking you to endure it steadily rather than be ruled by it, since it was never going to last anyway.",
    gita_concept_ref: "Enduring the Dualities — Bhagavad Gita 2.14",
  },
};
