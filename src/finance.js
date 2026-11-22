export function number(value, { max = Infinity, positive = false } = {}) {
  if (
    !["string", "number"].includes(typeof value) ||
    (typeof value === "string" && value.trim() === "")
  )
    return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 && n <= max && (!positive || n > 0)
    ? n
    : null;
}
export function propertyFinancials(p) {
  const rent = number(p.rent),
    vacancy = number(p.vacancy, { max: 100 }),
    cap = number(p.cap, { positive: true, max: 100 });
  const expenses = Object.values(p.expenses).map((v) => number(v));
  const operating =
    expenses.length && expenses.every((v) => v !== null)
      ? expenses.reduce((a, b) => a + b, 0)
      : null;
  const potential = rent === null ? null : rent * 12;
  const effective =
    potential !== null && vacancy !== null
      ? potential * (1 - vacancy / 100)
      : null;
  const noi =
    effective !== null && operating !== null ? effective - operating : null;
  return {
    potential,
    effective,
    operating,
    noi,
    value: noi !== null && cap !== null ? noi / (cap / 100) : null,
    cap,
  };
}
export function upgradeFinancials(u, p) {
  const kwh = number(u.kwh),
    rate = number(u.rate),
    cost = number(u.cost),
    maintenance = number(u.maintenance);
  const insurance =
    u.insuranceVerified && u.insuranceEvidence?.trim()
      ? number(u.insurance)
      : 0;
  const incentive =
    u.incentiveVerified && u.incentiveEvidence?.trim()
      ? number(u.incentive)
      : 0;
  const share =
    u.payer === "owner"
      ? 1
      : u.payer === "tenant"
        ? 0
        : u.payer === "shared"
          ? number(u.share, { max: 100 })
          : null;
  const fraction = u.payer === "shared" && share !== null ? share / 100 : share;
  const gross = kwh !== null && rate !== null ? kwh * rate : null;
  const owner =
    gross !== null &&
    fraction !== null &&
    maintenance !== null &&
    insurance !== null
      ? gross * fraction + insurance - maintenance
      : null;
  const tenant =
    gross !== null && fraction !== null ? gross * (1 - fraction) : null;
  const netCost =
    cost !== null && incentive !== null && incentive <= cost
      ? cost - incentive
      : null;
  const payback =
    owner !== null && owner > 0 && netCost !== null ? netCost / owner : null;
  const f = propertyFinancials(p);
  return {
    gross,
    owner,
    tenant,
    netCost,
    payback,
    net: owner !== null && tenant !== null ? owner + tenant : null,
    projected: f.noi !== null && owner !== null ? f.noi + owner : null,
    valueChange:
      owner !== null && f.cap !== null ? owner / (f.cap / 100) : null,
  };
}
export function rankUpgrades(items, metric) {
  return [...items]
    .filter(
      (x) =>
        x.result[metric] !== null &&
        (metric !== "payback" || x.result.owner > 0),
    )
    .sort((a, b) =>
      ["netCost", "payback"].includes(metric)
        ? a.result[metric] - b.result[metric]
        : b.result[metric] - a.result[metric],
    );
}
export const expenseLabels = {
  tax: "Property taxes",
  insurance: "Property insurance",
  maintenance: "Repairs & maintenance",
  management: "Property management",
  utilities: "Owner-paid utilities",
  other: "Other operating expenses",
};
export const caseProperty = () => ({
  name: "5529 6th Avenue",
  location: "Fort Myers, FL 33907",
  rent: "3500",
  vacancy: "",
  cap: "",
  expenses: {
    tax: "3417.07",
    insurance: "",
    maintenance: "",
    management: "",
    utilities: "",
    other: "",
  },
  caseStudy: true,
});
export const customProperty = () => ({
  name: "My rental property",
  location: "Custom property",
  rent: "",
  vacancy: "",
  cap: "",
  expenses: Object.fromEntries(Object.keys(expenseLabels).map((k) => [k, ""])),
  caseStudy: false,
});
export const initialUpgrades = () =>
  ["Solar panels", "Efficient HVAC", "Efficient windows"].map((name, id) => ({
    id,
    name,
    cost: "",
    kwh: "",
    rate: "0.1524",
    maintenance: "",
    insurance: "",
    incentive: "",
    insuranceVerified: false,
    incentiveVerified: false,
    insuranceEvidence: "",
    incentiveEvidence: "",
    payer: "tenant",
    share: "",
    evidence: "",
  }));
