import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Leaf,
  LayoutDashboard,
  Building2,
  Sun,
  ChartNoAxesCombined,
  BookOpen,
  FileText,
  ArrowUpRight,
  MapPin,
  Info,
  Download,
  Check,
  Menu,
} from "lucide-react";
import {
  propertyFinancials,
  upgradeFinancials,
  rankUpgrades,
  expenseLabels,
  caseProperty,
  customProperty,
  initialUpgrades,
  number,
} from "./finance";
import "./style.css";
const money = (n) =>
  n === null
    ? "Missing information"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(n);
const nav = [
  ["Overview", LayoutDashboard],
  ["Property Financials", Building2],
  ["Sustainability Upgrades", Sun],
  ["Investment Comparison", ChartNoAxesCombined],
  ["Case Study", BookOpen],
  ["Sources & Methodology", FileText],
];
const urls = {
  psc: "https://www.floridapsc.com/pscfiles/website-files/PDF/Publications/Reports/General/FactsAndFigures/May%202026.pdf",
  listing:
    "https://www.naplesarearealestate.com/property-search/detail/116/226033963/5529-6th-ave-fort-myers-fl-33907/",
  realtor:
    "https://www.realtor.com/realestateandhomes-detail/5529-6th-Ave_Fort-Myers_FL_33907_M96363-95329",
  county: "https://www.leepa.org/Search/PropertySearchSelection.aspx",
  solar: "https://pvwatts.nrel.gov/",
  windows:
    "https://www.energy.gov/energysaver/energy-efficient-window-coverings",
  hvac: "https://www.energystar.gov/products/central_air_conditioners",
};
function Field({ label, value, onChange, max, positive = false, help }) {
  const invalid = value !== "" && number(value, { max, positive }) === null;
  return (
    <label className="field">
      {label}
      <input
        type="number"
        min={positive ? "0.000001" : "0"}
        max={max}
        step="any"
        value={value}
        placeholder="Enter amount"
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalid}
      />
      {invalid ? (
        <small className="error">
          Enter a valid {positive ? "positive" : "nonnegative"} number
          {max ? ` up to ${max}` : ""}.
        </small>
      ) : (
        help && <small>{help}</small>
      )}
    </label>
  );
}
function Card({ label, value, note, accent }) {
  return (
    <div className={"metric " + (accent ? "accent" : "")}>
      <span>{label}</span>
      <strong className={value === "Missing information" ? "missing" : ""}>
        {value}
      </strong>
      <small>{note}</small>
    </div>
  );
}
function App() {
  const [page, setPage] = useState("Overview"),
    [p, setP] = useState(caseProperty),
    [upgrades, setUpgrades] = useState(initialUpgrades),
    [selected, setSelected] = useState(0),
    [sort, setSort] = useState("owner"),
    [chart, setChart] = useState("owner"),
    [menu, setMenu] = useState(false),
    [notice, setNotice] = useState("");
  const f = propertyFinancials(p),
    u = upgrades[selected],
    r = upgradeFinancials(u, p),
    items = upgrades.map((u) => ({ ...u, result: upgradeFinancials(u, p) }));
  const set = (key, val) => setP({ ...p, [key]: val });
  const update = (key, val) =>
    setUpgrades(
      upgrades.map((x) => (x.id === selected ? { ...x, [key]: val } : x)),
    );
  function load(custom = false) {
    setP(custom ? customProperty() : caseProperty());
    setUpgrades(
      initialUpgrades().map((x) => ({ ...x, payer: custom ? "" : "tenant" })),
    );
    setNotice(
      custom
        ? "Custom analysis started. Enter your property inputs."
        : "Fort Myers case study loaded. Unknown inputs remain blank.",
    );
    setPage(custom ? "Property Financials" : "Overview");
  }
  function download() {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            property: p,
            upgrades,
            financials: f,
            results: items.map((x) => ({ name: x.name, ...x.result })),
            note: "User assumptions; individual scenarios only. Not audited performance.",
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "greenvest-analysis.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }
  const missing = Object.entries(p.expenses)
    .filter(([, v]) => number(v) === null)
    .map(([k]) => expenseLabels[k]);
  const summary = (
    <div className="metrics">
      <Card
        label="Potential annual rental income"
        value={money(f.potential)}
        note="Scheduled monthly rent × 12"
      />
      <Card
        label="Baseline net operating income"
        value={money(f.noi)}
        note="Income after vacancy and operating expenses"
      />
      <Card
        label="Projected net operating income"
        value={money(r.projected)}
        note={`${u.name} · individual scenario`}
        accent
      />
      <Card
        label="Annual owner savings"
        value={money(r.owner)}
        note="Only the owner's operating benefit"
      />
    </div>
  );
  const comparison = (
    <>
      <div className="section-heading">
        <div>
          <h2>Who benefits from the upgrade?</h2>
          <p>Annual savings, separated by who pays the bills.</p>
        </div>
        <select
          aria-label="Chart metric"
          value={chart}
          onChange={(e) => setChart(e.target.value)}
        >
          <option value="owner">Owner savings</option>
          <option value="tenant">Tenant savings</option>
        </select>
      </div>
      <div className="bars">
        {items.map((x) => (
          <button
            className="bar-row"
            key={x.id}
            onClick={() => {
              setSelected(x.id);
              setPage("Sustainability Upgrades");
            }}
            title={`Edit ${x.name}: ${money(x.result[chart])}`}
          >
            <span>{x.name}</span>
            <div className="track">
              {x.result[chart] !== null && (
                <div
                  className={x.result[chart] < 0 ? "bar negative" : "bar"}
                  style={{
                    width: `${(Math.max(0, Math.abs(x.result[chart])) / Math.max(1, ...items.map((i) => Math.abs(i.result[chart] ?? 0)))) * 100}%`,
                  }}
                />
              )}
            </div>
            <b>{money(x.result[chart])}</b>
          </button>
        ))}
      </div>
      <div className="legend">
        <span className="swatch" />
        {chart === "owner" ? "Owner" : "Tenant"} annual benefit <span>•</span>{" "}
        Select a row to edit its assumptions
      </div>
    </>
  );
  return (
    <div className="app">
      <aside className={menu ? "open" : ""}>
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setPage("Overview");
          }}
        >
          <span className="brand-icon">
            <Leaf size={25} />
          </span>
          GreenVest<span className="brand-dot">.</span>
        </a>
        <div className="workspace">INVESTMENT WORKSPACE</div>
        <nav>
          {nav.map(([label, Icon]) => (
            <button
              key={label}
              className={page === label ? "active" : ""}
              onClick={() => {
                setPage(label);
                setMenu(false);
              }}
            >
              <Icon size={19} />
              {label}
            </button>
          ))}
        </nav>
        <div className="sidebar-note">
          <Leaf size={23} />
          <h3>
            Better buildings.
            <br />
            Smarter investments.
          </h3>
          <p>See where sustainability makes financial sense.</p>
          <span>REE 2610 · FGCU</span>
        </div>
        <div className="sidebar-footer">
          Rental Property Sustainability Simulator
        </div>
      </aside>
      <div className="main-wrap">
        <header>
          <button
            className="mobile-menu"
            aria-label="Toggle navigation"
            onClick={() => setMenu(!menu)}
          >
            <Menu />
          </button>
          <span>
            Workspace <span className="slash">/</span> <b>{page}</b>
          </span>
          <span className="academic">
            Academic research project <span className="avatar">GV</span>
          </span>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                SUSTAINABILITY, MEET YOUR BOTTOM LINE
              </div>
              <h1>
                {page === "Overview"
                  ? "A greener property. A clearer picture."
                  : page}
              </h1>
              <p>
                {page === "Overview"
                  ? "Understand the investment. See the savings. Know who benefits."
                  : "Transparent inputs. Traceable sources. Decisions grounded in numbers."}
              </p>
            </div>
            <button className="secondary" onClick={download}>
              <Download size={16} />
              Export analysis
            </button>
          </div>
          {notice && (
            <div role="status" className="notice">
              {notice}
              <button
                aria-label="Dismiss notification"
                onClick={() => setNotice("")}
              >
                ×
              </button>
            </div>
          )}
          {page === "Overview" && (
            <>
              <section className="property-banner">
                <div className="property-art">
                  <Building2 size={60} strokeWidth={1} />
                  <span>FORT MYERS, FLORIDA</span>
                </div>
                <div className="property-detail">
                  <span className="badge">
                    {p.caseStudy ? "FORT MYERS CASE STUDY" : "CUSTOM PROPERTY"}
                  </span>
                  <h2>{p.name}</h2>
                  <p>
                    <MapPin size={15} />
                    {p.location}
                  </p>
                  <div className="property-facts">
                    {p.caseStudy ? (
                      <>
                        <span>
                          <b>2</b> rental units
                        </span>
                        <span>
                          <b>1,344</b> sq ft
                        </span>
                        <span>
                          <b>1971</b> built
                        </span>
                        <span>
                          <b>$280,000</b> asking
                        </span>
                      </>
                    ) : (
                      <span>
                        Enter your property details in Property Financials
                      </span>
                    )}
                  </div>
                </div>
                <div className="property-actions">
                  <button className="primary" onClick={() => load()}>
                    Load Fort Myers case study
                  </button>
                  <button className="text-button" onClick={() => load(true)}>
                    Start a custom analysis <ArrowUpRight size={16} />
                  </button>
                </div>
              </section>
              {summary}<div className="metrics supplementary"><Card label="Effective gross income" value={money(f.effective)} note="After your vacancy assumption"/><Card label="Annual operating expenses" value={money(f.operating)} note="All expense categories required"/><Card label="Annual tenant savings" value={money(r.tenant)} note={`${u.name} · tenant energy benefit`}/><Card label="Simple owner payback" value={r.owner!==null&&r.owner<=0?'No positive payback':r.payback===null?'Missing information':`${r.payback.toFixed(1)} years`} note={`Estimated value change: ${money(r.valueChange)}`}/></div>
              <div className="two-col">
                <section className="panel">{comparison}</section>
                <section className="panel insight">
                  <div className="icon-tile">
                    <Leaf />
                  </div>
                  <span className="eyebrow">THE SPLIT INCENTIVE</span>
                  <h2>
                    Greener doesn’t always mean
                    <br />
                    more NOI.
                  </h2>
                  <p>
                    When tenants pay electricity, energy savings go to them.
                    GreenVest keeps those benefits separate from the owner’s
                    bottom line.
                  </p>
                  <button
                    className="text-button"
                    onClick={() => setPage("Sustainability Upgrades")}
                  >
                    Explore the upgrades <ArrowUpRight size={16} />
                  </button>
                </section>
              </div>
              <section className="missing-panel">
                <Info size={20} />
                <div>
                  <h3>Complete the picture</h3>
                  <p>
                    {missing.length
                      ? `Missing operating inputs: ${missing.join(", ")}.`
                      : "All operating expense categories entered."}{" "}
                    {number(p.vacancy, { max: 100 }) === null
                      ? "Add a vacancy assumption. "
                      : ""}
                    Add upgrade quotes and energy estimates to calculate
                    savings.
                  </p>
                </div>
                <button
                  className="secondary"
                  onClick={() => setPage("Property Financials")}
                >
                  Enter financials
                </button>
              </section>
              <div className="course-grid">
                {[
                  [
                    "01",
                    "The Physics Bill Comes Due",
                    "Model energy costs and separate utility responsibility.",
                  ],
                  [
                    "04",
                    "Gulfview Court",
                    "Build an income statement and calculate NOI.",
                  ],
                  [
                    "12",
                    "Sustainability Pays",
                    "Compare costs, payback and income-based value.",
                  ],
                ].map(([n, t, d], i) => (
                  <button
                    className="course"
                    key={n}
                    onClick={() =>
                      setPage(
                        [
                          "Sustainability Upgrades",
                          "Property Financials",
                          "Investment Comparison",
                        ][i],
                      )
                    }
                  >
                    <span>COURSE TOPIC {n}</span>
                    <h3>{t}</h3>
                    <p>{d}</p>
                  </button>
                ))}
              </div>
            </>
          )}
          {page === "Property Financials" && (
            <>
              {summary}
              <section className="panel">
                <div className="section-heading">
                  <div>
                    <h2>Build the property’s income statement</h2>
                    <p>
                      04 — Gulfview Court · All expenses are annual. Explicitly
                      enter 0 when a cost does not apply.
                    </p>
                  </div>
                  <button className="secondary" onClick={() => load(true)}>
                    New custom property
                  </button>
                </div>
                <div className="form-grid">
                  <label className="field">
                    Property name
                    <input
                      value={p.name}
                      onChange={(e) => set("name", e.target.value)}
                    />
                  </label>
                  <label className="field">
                    Location
                    <input
                      value={p.location}
                      onChange={(e) => set("location", e.target.value)}
                    />
                  </label>
                  <Field
                    label="Total scheduled rent ($ / month, all units)"
                    value={p.rent}
                    onChange={(v) => set("rent", v)}
                    help={
                      p.caseStudy
                        ? "$1,750 × 2 units; supplied preliminary rent scenario, not audited leases."
                        : "User-entered rent assumption"
                    }
                  />
                  <Field
                    label="Vacancy assumption (%)"
                    max={100}
                    value={p.vacancy}
                    onChange={(v) => set("vacancy", v)}
                  />
                  <Field
                    label="Market capitalization rate assumption (%)"
                    positive
                    max={100}
                    value={p.cap}
                    onChange={(v) => set("cap", v)}
                    help="User market assumption; required only for income-based value."
                  />
                  {Object.entries(expenseLabels).map(([k, label]) => (
                    <Field
                      key={k}
                      label={`${label} ($ / year)`}
                      value={p.expenses[k]}
                      onChange={(v) =>
                        set("expenses", { ...p.expenses, [k]: v })
                      }
                      help={
                        k === "tax" && p.caseStudy
                          ? "2025 listing-reported taxes; future reassessment not modeled."
                          : null
                      }
                    />
                  ))}
                </div>
                <div className="statement">
                  <span>
                    Effective gross income <b>{money(f.effective)}</b>
                  </span>
                  <span>
                    Annual operating expenses <b>{money(f.operating)}</b>
                  </span>
                  <span>
                    Baseline NOI <b>{money(f.noi)}</b>
                  </span>
                  <span>
                    Estimated income-based value <b>{money(f.value)}</b>
                  </span>
                </div>
                <p className="fine-print">
                  NOI excludes debt service, income tax, depreciation and
                  upfront capital improvements. Include recurring owner costs in
                  the expense categories. Value = NOI ÷ cap rate; this is a
                  scenario estimate, not an appraisal or asking price.
                </p>
              </section>
            </>
          )}
          {page === "Sustainability Upgrades" && (
            <>
              <div className="tabs">
                {upgrades.map((x) => (
                  <button
                    key={x.id}
                    className={selected === x.id ? "selected" : ""}
                    onClick={() => setSelected(x.id)}
                  >
                    {x.name}
                  </button>
                ))}
              </div>
              <div className="two-col upgrade-layout">
                <section className="panel">
                  <h2>{u.name}</h2>
                  <p>
                    01 — The Physics Bill Comes Due · Evaluate one upgrade at a
                    time.
                  </p>
                  {selected === 1 && (
                    <div className="callout">
                      The case study reports approximately two-year-old A/C
                      systems. Assess tune-ups and controls before assuming
                      replacement is justified.
                    </div>
                  )}
                  <div className="form-grid">
                    <Field
                      label="Owner installation cost ($)"
                      value={u.cost}
                      onChange={(v) => update("cost", v)}
                    />
                    <Field
                      label="Annual electricity reduction (kWh / year)"
                      value={u.kwh}
                      onChange={(v) => update("kwh", v)}
                      help="Use an audit, bill analysis, or property-specific model; do not add overlapping scenarios."
                    />
                    <Field
                      label="Avoided electricity rate ($ / kWh)"
                      value={u.rate}
                      onChange={(v) => update("rate", v)}
                      help="0.1524 = Florida 2025 statewide residential benchmark; replace with the marginal avoided tariff."
                    />
                    <Field
                      label="Additional owner maintenance ($ / year)"
                      value={u.maintenance}
                      onChange={(v) => update("maintenance", v)}
                    />
                    <label className="field">
                      Who pays the electricity bill?
                      <select
                        value={u.payer}
                        onChange={(e) => update("payer", e.target.value)}
                      >
                        <option value="">Select payer</option>
                        <option value="owner">Owner pays</option>
                        <option value="tenant">Tenant pays</option>
                        <option value="shared">Shared payment</option>
                      </select>
                    </label>
                    {u.payer === "shared" && (
                      <Field
                        label="Owner’s electricity share (%)"
                        value={u.share}
                        max={100}
                        onChange={(v) => update("share", v)}
                      />
                    )}
                    <label className="field wide">
                      Quote & energy estimate source
                      <textarea
                        value={u.evidence}
                        onChange={(e) => update("evidence", e.target.value)}
                        placeholder="Contractor, quote date, audit or PVWatts assumptions…"
                      />
                    </label>
                  </div>
                  <details>
                    <summary>Documented insurance savings & incentives</summary>
                    <p>
                      No benefit is applied without an explicit evidence
                      confirmation and a source. These inputs do not establish
                      eligibility.
                    </p>
                    {["insurance", "incentive"].map((k) => (
                      <div className="evidence" key={k}>
                        <label className="checkbox">
                          <input
                            type="checkbox"
                            checked={u[k + "Verified"]}
                            onChange={(e) =>
                              update(k + "Verified", e.target.checked)
                            }
                          />
                          I have documentation for{" "}
                          {k === "insurance"
                            ? "annual owner insurance savings"
                            : "an owner installation incentive"}
                        </label>
                        <Field
                          label={
                            k === "insurance"
                              ? "Verified insurance savings ($ / year)"
                              : "Documented incentive ($, one-time)"
                          }
                          value={u[k]}
                          onChange={(v) => update(k, v)}
                        />
                        <label className="field">
                          Evidence source and date
                          <input
                            value={u[k + "Evidence"]}
                            onChange={(e) =>
                              update(k + "Evidence", e.target.value)
                            }
                            placeholder="Document or program URL; date"
                          />
                        </label>
                        {u[k + "Verified"] &&
                          (!u[k + "Evidence"].trim() ||
                            number(u[k]) === null) && (
                            <small className="error">
                              Provide a valid amount and source. No undocumented
                              benefit is applied.
                            </small>
                          )}
                      </div>
                    ))}
                    {number(u.incentive) > number(u.cost) &&
                      u.incentiveVerified && (
                        <p className="error">
                          Incentive cannot exceed installation cost.
                        </p>
                      )}
                  </details>
                </section>
                <div>
                  <section className="panel results">
                    <span className="eyebrow">YOUR INDIVIDUAL SCENARIO</span>
                    <h2>The financial impact</h2>
                    <Card
                      label="Annual owner savings / NOI improvement"
                      value={money(r.owner)}
                      note="Owner energy benefit + verified insurance − maintenance"
                      accent
                    />
                    <Card
                      label="Annual tenant savings"
                      value={money(r.tenant)}
                      note="Energy benefit allocated to tenants"
                    />
                    <div className="statement">
                      <span>
                        Gross annual energy savings<b>{money(r.gross)}</b>
                      </span>
                      <span>
                        Net total annual savings<b>{money(r.net)}</b>
                      </span>
                      <span>
                        Net owner installation cost<b>{money(r.netCost)}</b>
                      </span>
                      <span>
                        Simple owner payback
                        <b>
                          {r.owner !== null && r.owner <= 0
                            ? "No positive payback"
                            : r.payback === null
                              ? "Missing information"
                              : `${r.payback.toFixed(1)} years`}
                        </b>
                      </span>
                      <span>
                        Projected NOI<b>{money(r.projected)}</b>
                      </span>
                      <span>
                        Estimated value change<b>{money(r.valueChange)}</b>
                      </span>
                    </div>
                    <p className="fine-print">
                      Value change assumes a constant cap rate and durable
                      annual NOI improvement. No rent increase, resale premium
                      or appreciation is assumed. Simple payback excludes
                      financing, discounting and equipment life.
                    </p>
                  </section>
                </div>
              </div>
            </>
          )}
          {page === "Investment Comparison" && (
            <>
              <section className="panel">
                <div className="section-heading">
                  <div>
                    <h2>Find the right investment</h2>
                    <p>
                      12 — Sustainability Pays · Independent alternatives, never
                      a combined package.
                    </p>
                  </div>
                  <label className="field">
                    Rank by
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                    >
                      <option value="owner">
                        Highest annual owner savings
                      </option>
                      <option value="tenant">
                        Highest annual tenant savings
                      </option>
                      <option value="netCost">
                        Lowest net installation cost
                      </option>
                      <option value="payback">
                        Shortest positive owner payback
                      </option>
                      <option value="noi">Largest NOI improvement</option>
                    </select>
                  </label>
                </div>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Upgrade / rank</th>
                        <th>Net cost</th>
                        <th>Owner / year</th>
                        <th>Tenant / year</th>
                        <th>NOI change / year</th>
                        <th>Owner payback</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ...rankUpgrades(items, sort === "noi" ? "owner" : sort),
                        ...items.filter(
                          (x) =>
                            !rankUpgrades(
                              items,
                              sort === "noi" ? "owner" : sort,
                            ).some((i) => i.id === x.id),
                        ),
                      ].map((x) => {
                        const ranked = rankUpgrades(
                            items,
                            sort === "noi" ? "owner" : sort,
                          ),
                          idx = ranked.findIndex((i) => i.id === x.id);
                        return (
                          <tr key={x.id}>
                            <td>
                              <button
                                className="text-button"
                                onClick={() => {
                                  setSelected(x.id);
                                  setPage("Sustainability Upgrades");
                                }}
                              >
                                {idx >= 0 ? `${idx + 1}. ` : "— "}
                                {x.name}
                              </button>
                              <small>
                                {x.result.owner === null
                                  ? "Incomplete assumptions"
                                  : x.result.owner <= 0
                                    ? "No positive owner operating benefit"
                                    : "Positive owner operating benefit"}
                                {!x.evidence && " · source not supplied"}
                              </small>
                            </td>
                            <td>{money(x.result.netCost)}</td>
                            <td>{money(x.result.owner)}</td>
                            <td>{money(x.result.tenant)}</td>
                            <td>{money(x.result.owner)}</td>
                            <td>
                              {x.result.owner !== null && x.result.owner <= 0
                                ? "No positive payback"
                                : x.result.payback === null
                                  ? "Missing information"
                                  : `${x.result.payback.toFixed(1)} years`}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="fine-print">
                  Rank reflects only the selected metric, not an investment
                  recommendation. Missing metrics are unranked. Zero and
                  negative owner savings have no positive payback. Lowest cost
                  and tenant benefit do not establish owner financial
                  attractiveness.
                </p>
              </section>
              <section className="panel">{comparison}</section>
            </>
          )}
          {page === "Case Study" && (
            <>
              <section className="panel">
                <span className="badge">PRELIMINARY · LISTING-REPORTED</span>
                <h2>5529 6th Avenue, Fort Myers</h2>
                <p>
                  MLS #226033963 · Duplex · $280,000 asking price · 1,344 sq ft
                  · built 1971.
                </p>
                <p>
                  The preliminary rent scenario supplied with this assignment is
                  $1,750 per unit per month: $3,500 total monthly and $42,000
                  potential annual rental income. Leases have not been audited.
                </p>
                <p>
                  The MLS-derived listing reports 2025 taxes of $3,417.07, a
                  2020 roof, approximately two-year-old A/C systems and
                  tenant-paid electricity. These are listing claims, not
                  independent inspections.
                </p>
                <div className="callout">
                  Conflicting financial data: the listing also reports $3,200
                  gross scheduled income, $38,400 NOI and $2,644 operating
                  expense, without a coherent annual statement. GreenVest
                  excludes these figures from calculations. Bedroom counts also
                  differ between summary fields and listing narrative.
                </div>
                <p>
                  Official verification remains incomplete: the Lee County
                  search could not be retrieved during research. Realtor.com
                  identifies parcel 11-45-24-04-00015.0220; this identifier is
                  also listing-reported. Confirm legal units, area,
                  improvements, taxes, flood exposure and insurance through
                  official records and documents.
                </p>
                <div className="button-row">
                  <button className="primary" onClick={() => load()}>
                    Load case study
                  </button>
                  <a href={urls.listing} target="_blank" rel="noreferrer">
                    View MLS-derived listing <ArrowUpRight size={16} />
                  </a>
                  <a href={urls.county} target="_blank" rel="noreferrer">
                    County records <ArrowUpRight size={16} />
                  </a>
                </div>
              </section>
              <section className="panel">
                <h2>Worked example: assumptions, not actual performance</h2>
                <p>
                  At $3,500 monthly rent, an illustrative 5% vacancy and $12,000
                  total annual expenses produce $42,000 potential income,
                  $39,900 effective income and $27,900 baseline NOI.
                </p>
                <p>
                  Assume a $10,000 upgrade, 3,000 kWh annual savings at
                  $0.1524/kWh, $100 annual maintenance and no incentives or
                  insurance savings. Gross energy savings are $457.20. With
                  tenants paying electricity, tenants save $457.20, the owner
                  loses $100 annually, projected NOI is $27,800 and there is no
                  positive owner payback. At an assumed 6% cap rate, estimated
                  value change is −$1,666.67.
                </p>
                <p>
                  If the owner instead pays all electricity, owner savings are
                  $357.20, projected NOI is $28,257.20, simple payback is 28.0
                  years and estimated value change is $5,953.33. This does not
                  establish that the upgrade is economically justified.
                </p>
                <a href="/design-brief.html" target="_blank">
                  Open printable one-page design brief{" "}
                  <ArrowUpRight size={16} />
                </a>
              </section>
            </>
          )}
          {page === "Sources & Methodology" && (
            <>
              <section className="panel">
                <h2>Evidence behind the numbers</h2>
                <p>
                  Research checked November 22, 2026. Editable entries are user
                  assumptions unless supported by documents.
                </p>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Figure / method</th>
                        <th>Source & year</th>
                        <th>Units / evidence status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        [
                          "$280,000; 1,344 sq ft; 1971; duplex",
                          "MLS-derived listing",
                          urls.listing,
                          "2026 listing; accessed, not independently verified",
                        ],
                        [
                          "$3,417.07 property taxes; tenant electricity; roof / A/C claims",
                          "MLS-derived listing",
                          urls.listing,
                          "2025 tax $ / year; listing-reported",
                        ],
                        [
                          "$1,750 per unit monthly rent",
                          "Assignment preliminary scenario",
                          null,
                          "$ / month; supplied, lease verification pending",
                        ],
                        [
                          "$0.1524 electricity benchmark",
                          "Florida PSC, May 2026",
                          urls.psc,
                          "2025 residential average, $ / kWh; PDF accessed, chart transcription needs visual confirmation",
                        ],
                        [
                          "Property characteristics",
                          "Lee County Property Appraiser",
                          urls.county,
                          "Official lookup unavailable during research; verification pending",
                        ],
                        [
                          "Solar generation estimates",
                          "NREL PVWatts",
                          urls.solar,
                          "kWh / year; tool unavailable during research; no estimate imported",
                        ],
                        [
                          "HVAC efficiency research",
                          "ENERGY STAR",
                          urls.hvac,
                          "Research reference; no numerical savings imported",
                        ],
                        [
                          "Window efficiency research",
                          "U.S. Department of Energy",
                          urls.windows,
                          "Research reference; no numerical savings imported",
                        ],
                        [
                          "Costs, kWh, vacancy, cap rate, expenses",
                          "User / contractor documentation",
                          null,
                          "Editable assumptions; unknown inputs blank",
                        ],
                        [
                          "Incentives / insurance savings",
                          "User-supplied eligibility / insurer evidence",
                          null,
                          "Applied only with confirmation, valid amount and evidence source",
                        ],
                      ].map(([a, b, url, c]) => (
                        <tr key={a}>
                          <td>{a}</td>
                          <td>
                            {url ? (
                              <a href={url} target="_blank" rel="noreferrer">
                                {b}
                              </a>
                            ) : (
                              b
                            )}
                          </td>
                          <td>{c}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
              <section className="panel">
                <h2>Transparent calculation rules</h2>
                <div className="method-grid">
                  {[
                    "Potential income = total monthly scheduled rent × 12",
                    "Effective income = potential income × (1 − vacancy rate)",
                    "Baseline NOI = effective income − annual operating expenses",
                    "Gross energy savings = annual avoided kWh × avoided $/kWh",
                    "Owner savings = owner energy share + verified insurance savings − additional owner maintenance",
                    "Tenant savings = gross energy savings × tenant share",
                    "Net installation cost = owner installation cost − documented incentive",
                    "Owner payback = net installation cost ÷ positive owner savings",
                    "Projected NOI = baseline NOI + annual owner savings",
                    "Income-based value = NOI ÷ positive cap rate",
                    "Value change = annual owner savings ÷ positive cap rate",
                  ].map((t) => (
                    <p key={t}>
                      <Check size={17} />
                      {t}
                    </p>
                  ))}
                </div>
                <p>
                  All upgrades are independent scenarios. Savings are never
                  summed, avoiding overlapping solar, HVAC and window energy
                  reductions. Enter avoided billed energy, accounting for solar
                  self-consumption and export compensation, rather than assuming
                  generation offsets retail purchases one-for-one.
                </p>
                <p>
                  No automatic insurance discounts or incentives are assumed.
                  Verify eligibility and applicable program dates. Savings do
                  not model degradation, equipment life, tariff changes, tax
                  treatment, financing, hurricane resilience or guaranteed rent
                  premiums. Total energy benefit is allocated using one payer
                  share; additional operating costs are assigned to the owner.
                </p>
              </section>
            </>
          )}
          <footer>
            <span>
              <Leaf size={14} /> GreenVest · Sustainable real estate, measured.
            </span>
            <span>REE 2610 · Florida Gulf Coast University</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
createRoot(document.getElementById("root")).render(<App />);
