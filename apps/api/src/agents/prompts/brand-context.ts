export const CENDIEN_CONTEXT = [
  "Brand: Cendien.",
  "Profile: B2B technology and consulting company focused on enterprise operations and digital transformation.",
  "Core areas: IT service management (ITSM), Microsoft ecosystem services, and Infor consulting/implementation services.",
  "Partnerships: Microsoft Partner and Infor Partner.",
  "Location: Dallas, Texas.",
  "Target audience: CIOs, IT directors, VP of operations, and enterprise decision-makers at mid-market and enterprise companies."
].join(" ");

export const CENDIEN_CONTENT_GOAL =
  "Goal: create high-quality, credible, useful content that strengthens Cendien thought leadership and demand generation. Content must connect to real buyer pain points and use language that mirrors how prospects describe their own problems.";

/**
 * Managed Services (MSP) pain points — why businesses hire providers like Cendien.
 * Each entry captures the buyer's internal language (the struggle) and the MSP value prop (the relief).
 */
export const MSP_PAIN_POINTS = [
  {
    name: "Workforce Continuity",
    buyerVoice: "We have key staff going on maternity/medical leave, or sudden turnover.",
    struggle: "When a sole IT administrator or key staff member goes on leave, the business is one server crash away from disaster. If that person quits, all institutional knowledge is lost and recruiting takes months.",
    mspValue: "An MSP provides a team, not a person. Documented systems and SLA-backed coverage mean if one engineer is out, others step in immediately."
  },
  {
    name: "Scalability & Economy",
    buyerVoice: "We need to downsize — or we are growing too fast to hire.",
    struggle: "Hiring FTEs is expensive and rigid. Downsizing means severance and morale damage. Rapid growth means massive upfront capital expense for recruiting, benefits, and equipment.",
    mspValue: "MSPs convert IT into an Operating Expense. Scale seat count up or down month-to-month — no layoffs, no recruiting drag."
  },
  {
    name: "Skills Gap",
    buyerVoice: "We don't have the specific skills in-house and can't afford them.",
    struggle: "A generalist IT person who can fix printers has no idea how to configure a firewall, manage cloud migration, or handle a cybersecurity breach. Hiring a dedicated specialist costs $150k+ — overkill for a small business but necessary.",
    mspValue: "Fractional access to a deep bench: Tier 1 helpdesk, Tier 3 cloud architect, and CISSP-certified security officer for a flat monthly fee. $500k worth of talent for a fraction of the cost."
  },
  {
    name: "Strategic Distraction",
    buyerVoice: "Our leadership is fixing computers instead of running the business.",
    struggle: "When the Office Manager or CEO spends 5 hours a week rebooting routers, managing licenses, or troubleshooting email, they are not generating revenue. Shadow IT duties are a massive productivity killer.",
    mspValue: "The MSP takes over keeping the lights on, liberating internal staff to focus on revenue-generating activities and strategic growth."
  },
  {
    name: "Risk & Compliance",
    buyerVoice: "We are terrified of ransomware or failing an audit.",
    struggle: "Cyber insurance requirements are stricter, compliance (HIPAA, SOC2, CMMC) is complex, and an internal generalist rarely has time or tools to monitor the network 24/7/365.",
    mspValue: "Enterprise-grade RMM, EDR/MDR tools that are too expensive independently. 24/7 monitoring and shared responsibility for compliance, drastically reducing risk profile."
  }
] as const;

/**
 * ERP Managed Services pain points — why businesses hire ERP MSPs like Cendien.
 * Higher stakes because the ERP is the financial heart of the business.
 */
export const ERP_PAIN_POINTS = [
  {
    name: "Niche Expertise Gap",
    buyerVoice: "We need a specific skill like SAP FICO or Oracle Supply Chain, but can't justify a full-time salary for it.",
    struggle: "ERPs are modular. You need deep Finance expertise today but Warehouse Management tomorrow. Hiring one person expert in every module is impossible.",
    erpValue: "Fractional functional expertise — access a library of experts. Use 10 hours of a Finance expert and 20 hours of a Supply Chain expert without hiring two people."
  },
  {
    name: "Key Person Dependency",
    buyerVoice: "Our sole ERP administrator is going on leave or just quit, and she is the only one who knows how our billing workflow works.",
    struggle: "In ERP, institutional knowledge is often trapped in one person's head. If they leave, you can't bill customers or close the books.",
    erpValue: "Knowledge continuity through documented configurations and customizations. If the primary consultant is out, the firm has documentation and backups ready."
  },
  {
    name: "Feast or Famine Workloads",
    buyerVoice: "We have a massive backlog of reports this month, but next month we'll have nothing. We can't hire for peaks.",
    struggle: "ERP work is cyclical — you need 5 people during implementation or year-end close, but only 1 for maintenance. Carrying full staff for peak times wastes budget.",
    erpValue: "Resource elasticity. Ramp up hours during busy seasons (year-end, acquisitions) and scale down to bare-bones maintenance during quiet periods."
  },
  {
    name: "Upgrade Fatigue",
    buyerVoice: "Every time our Cloud ERP pushes a bi-annual update, our customizations break and we spend weeks testing.",
    struggle: "SaaS ERPs (Dynamics 365, Workday) force updates. Internal teams lack time to regression test every workflow, leading to broken processes in production.",
    erpValue: "Managed release management — the MSP handles testing new releases against your specific environment before they go live, ensuring business continuity."
  },
  {
    name: "Tactical Trap",
    buyerVoice: "Our expensive ERP developers spend all day resetting passwords instead of building new features.",
    struggle: "High-value internal staff get bogged down in Tier 1 support tickets, so strategic projects like automating purchasing never get done.",
    erpValue: "Tiered support structuring — MSP takes over Level 1/2 support at low cost, freeing internal architects for high-value business improvements."
  },
  {
    name: "Complex Integrations",
    buyerVoice: "Our ERP isn't talking to our CRM or e-commerce store correctly, and we don't have an integration architect.",
    struggle: "An ERP in a silo is useless. Maintaining connections between Salesforce, Shopify, and the ERP requires specialized API/middleware coding skills generalist IT staff rarely have.",
    erpValue: "Dedicated technical architects monitor data flows and fix integration sync errors so orders don't get lost."
  },
  {
    name: "Global 24/7 Requirements",
    buyerVoice: "We have a factory in Asia that works while our US IT team is sleeping. If the ERP goes down, production stops.",
    struggle: "A 9-to-5 internal team cannot support a global 24-hour operation without burning out.",
    erpValue: "Follow-the-sun support with teams in multiple time zones. When your US team logs off, the offshore team logs on — no overtime required."
  },
  {
    name: "Audit & Compliance Anxiety",
    buyerVoice: "We are preparing for an audit (SOX, IPO readiness) and our user permissions are a mess.",
    struggle: "Segregation of Duties is critical in ERP (the person who creates a vendor should not be able to pay that vendor). Internal teams often get sloppy with permissions.",
    erpValue: "Governance and security management — regular health checks on user roles and permissions to ensure audit readiness and protection against internal fraud."
  },
  {
    name: "Lack of Training & Adoption",
    buyerVoice: "We bought this expensive software, but our staff is still using Excel because they don't know how to use the ERP.",
    struggle: "Technical support fixes bugs but doesn't fix people. If users don't know how to use the system, the ROI is zero.",
    erpValue: "Change management and training — ongoing lunch-and-learn sessions and documentation updates to ensure staff actually adopts the software features."
  },
  {
    name: "Predictable Budgeting",
    buyerVoice: "We cannot get approval for a $150k headcount, but we have budget for monthly services.",
    struggle: "Getting approval for a permanent salary + benefits (CapEx/Headcount) is harder than a monthly service fee (OpEx).",
    erpValue: "Flat-fee predictability converts volatile variable costs (recruiting fees, overtime, emergency contractors) into a predictable monthly line item that keeps the CFO happy."
  }
] as const;

/**
 * Builds a compact pain-point reference string for injection into agent prompts.
 * Keeps it concise enough for system instructions while preserving buyer voice.
 */
export const buildPainPointContext = (): string => {
  const mspLines = MSP_PAIN_POINTS.map(
    (p) => `- ${p.name}: "${p.buyerVoice}" → ${p.mspValue}`
  ).join("\n");

  const erpLines = ERP_PAIN_POINTS.map(
    (p) => `- ${p.name}: "${p.buyerVoice}" → ${p.erpValue}`
  ).join("\n");

  return [
    "=== Managed Services (MSP) Pain Points ===",
    mspLines,
    "",
    "=== ERP Managed Services Pain Points ===",
    erpLines
  ].join("\n");
};
