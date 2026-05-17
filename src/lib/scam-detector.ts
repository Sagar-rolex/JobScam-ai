export interface JobInput {
  title: string;
  company: string;
  email: string;
  salary: string;
  description: string;
  website: string;
  workType: string;
}

export interface ScamResult {
  probability: number;
  risk: "Low" | "Medium" | "High";
  safe: boolean;
  reasons: string[];
  positives: string[];
  signals: { name: string; weight: number; triggered: boolean }[];
}

const SUSPICIOUS_KEYWORDS = [
  "registration fee", "pay to apply", "training fee", "security deposit",
  "earn $", "work from home easy", "no experience needed", "urgent hiring",
  "western union", "telegram", "whatsapp only", "100% guaranteed", "limited slots",
  "make money fast", "investment required", "processing fee",
];

const FREE_EMAIL_DOMAINS = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "rediffmail.com"];

export function analyzeJob(input: JobInput): ScamResult {
  const text = `${input.title} ${input.description}`.toLowerCase();
  const reasons: string[] = [];
  const positives: string[] = [];

  const matchedKeywords = SUSPICIOUS_KEYWORDS.filter((k) => text.includes(k));
  const suspiciousKw = matchedKeywords.length > 0;
  if (suspiciousKw) reasons.push(`Contains ${matchedKeywords.length} scam keyword(s): "${matchedKeywords.slice(0, 3).join(", ")}"`);

  const emailDomain = input.email.split("@")[1]?.toLowerCase() ?? "";
  const freeEmail = FREE_EMAIL_DOMAINS.includes(emailDomain);
  const emailMatchesCompany = emailDomain && input.company &&
    emailDomain.replace(/\.(com|in|io|org|net)$/, "").includes(input.company.toLowerCase().replace(/\s+/g, "").slice(0, 5));
  if (freeEmail) reasons.push(`Recruiter uses free email (${emailDomain}) instead of a company domain`);
  else if (emailMatchesCompany) positives.push("Email domain matches company name");

  const salaryNum = parseFloat(input.salary.replace(/[^0-9.]/g, ""));
  const unrealisticSalary = salaryNum > 200000 || (salaryNum > 0 && /lakh|lpa|month/i.test(input.salary) && salaryNum > 50);
  if (unrealisticSalary) reasons.push(`Salary "${input.salary}" appears unrealistically high for the role`);

  const noWebsite = !input.website || input.website.trim().length < 5;
  const httpOnly = input.website.startsWith("http://");
  if (noWebsite) reasons.push("No company website provided");
  else if (httpOnly) reasons.push("Website uses insecure HTTP instead of HTTPS");
  else positives.push("Company website provided with HTTPS");

  const vagueDesc = input.description.trim().length < 80;
  if (vagueDesc) reasons.push("Job description is too short / vague");
  else positives.push("Detailed job description provided");

  const noCompany = input.company.trim().length < 2;
  if (noCompany) reasons.push("Missing or incomplete company name");

  const signals = [
    { name: "Suspicious Keywords", weight: 25, triggered: suspiciousKw },
    { name: "Free Email Domain", weight: 18, triggered: freeEmail },
    { name: "Unrealistic Salary", weight: 22, triggered: unrealisticSalary },
    { name: "Missing/Insecure Website", weight: 15, triggered: noWebsite || httpOnly },
    { name: "Vague Description", weight: 12, triggered: vagueDesc },
    { name: "Missing Company Info", weight: 8, triggered: noCompany },
  ];

  let probability = signals.filter((s) => s.triggered).reduce((sum, s) => sum + s.weight, 0);
  probability = Math.min(98, probability + Math.floor(Math.random() * 6));

  const risk: ScamResult["risk"] = probability >= 60 ? "High" : probability >= 30 ? "Medium" : "Low";
  if (positives.length === 0) positives.push("Job posting submitted for analysis");

  return { probability, risk, safe: probability < 30, reasons, positives, signals };
}
