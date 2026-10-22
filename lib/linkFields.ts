import type { University } from "./types";

export const LINK_FIELD_LABELS: Record<keyof University["links"], string> = {
  officialSite: "Official site",
  erp: "ERP / student login",
  results: "Results",
  syllabus: "Syllabus",
  admitCard: "Admit card",
  feePayment: "Fee payment",
  admission: "Admission / counselling",
};

export function realLinkEntries(links: University["links"]) {
  return (
    Object.keys(LINK_FIELD_LABELS) as (keyof University["links"])[]
  )
    .map((key) => ({ key, label: LINK_FIELD_LABELS[key], url: links[key] }))
    .filter((entry) => Boolean(entry.url));
}
