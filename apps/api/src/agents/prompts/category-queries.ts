import type { Category } from "@marketing/shared";

export function defaultGroundedQueryByCategory(category: Category): string {
  switch (category) {
    case "customer_pain_point":
      return "What are the biggest IT and ERP challenges enterprise clients face when managing operations without a managed services partner?";
    case "company_update":
      return "What recent projects, client wins, or delivery milestones has Cendien completed in ITSM, Microsoft, or Infor?";
    case "hiring":
      return "What roles is Cendien hiring for and what skills are needed for ITSM, Microsoft, and Infor consulting?";
    case "product_education":
      return "How do enterprises improve ITSM workflows, Microsoft ecosystem adoption, or Infor ERP configuration?";
    case "infor":
      return "How are enterprises modernizing Infor ERP systems and what integration challenges do they face?";
    case "team":
      return "Who are the key consultants and experts at Cendien and what delivery capabilities do they bring?";
    case "industry_news":
      return "What recent enterprise technology developments affect ITSM, Microsoft, and Infor markets?";
    default: {
      const exhaustive: never = category;
      return exhaustive;
    }
  }
}
