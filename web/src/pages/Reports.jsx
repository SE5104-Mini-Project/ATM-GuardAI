import { useMemo, useState } from "react";
import Header from "../components/Header";

export default function Reports() {
  const Icon = {
    bell: (
      <svg className="w-6 h-6 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2zm6-6V11a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2z" />
      </svg>
    ),
    download: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3v10m0 0l4-4m-4 4l-4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        <path d="M5 20h14v-4H5v4z" />
      </svg>
    ),
    play: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5h8a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3z" />
        <path d="M10 9l6 3-6 3V9z" fill="#fff" />
      </svg>
    ),
  };

  // Sample data
  const baseRows = useMemo(
    () => [
      { date: "Oct 28, 2023", location: "City Center",     mask: 3, helmet: 1, falsePos: 2, response: "2m 15s" },
      { date: "Oct 27, 2023", location: "Downtown",        mask: 2, helmet: 0, falsePos: 1, response: "1m 45s" },
      { date: "Oct 26, 2023", location: "Health District", mask: 5, helmet: 2, falsePos: 3, response: "3m 30s" },
      { date: "Oct 25, 2023", location: "Shopping Mall",   mask: 1, helmet: 1, falsePos: 0, response: "2m 10s" },
      { date: "Oct 24, 2023", location: "Main Street",     mask: 4, helmet: 2, falsePos: 1, response: "1m 55s" },
      { date: "Oct 23, 2023", location: "Riverside",       mask: 2, helmet: 1, falsePos: 1, response: "2m 05s" },
      { date: "Oct 22, 2023", location: "Metro Station",   mask: 6, helmet: 3, falsePos: 2, response: "3m 40s" },
    ],
    []
  );

  // Filters
  const [reportType, setReportType] = useState("Alert Summary");
  const [period, setPeriod] = useState("Last 24 Hours");
  const [atm, setAtm] = useState("All ATMs");
  const [alertType, setAlertType] = useState("All Alerts");

  // Generate button state
  const [generatedAt, setGeneratedAt] = useState(new Date());
  const [rowsVersion, setRowsVersion] = useState(0); // bump this when clicking "Generate"

  // Rows are recalculated ONLY when rowsVersion changes (i.e., when you click Generate)
  const rows = useMemo(() => {
    let r = [...baseRows];

    // Apply ATM filter
    if (atm !== "All ATMs") {
      r = r.filter((x) => x.location === atm);
    }

    // Apply alert type emphasis
    if (alertType !== "All Alerts") {
      r = r.map((x) => ({
        ...x,
        mask:   alertType === "Mask"   ? x.mask   : alertType === "Helmet" ? 0 : x.mask,
        helmet: alertType === "Helmet" ? x.helmet : alertType === "Mask"   ? 0 : x.helmet,
      }));
    }

    // (Period is just a UI label in this demo; wire a real date range on real data.)
    return r;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseRows, rowsVersion]); // <- NOT depending on atm/alertType so filters apply when you click Generate

  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, r) => ({ mask: acc.mask + r.mask, helmet: acc.helmet + r.helmet, falsePos: acc.falsePos + r.falsePos }),
        { mask: 0, helmet: 0, falsePos: 0 }
      ),
    [rows]
  );

  const onGenerate = () => {
    // Apply the current filters and update timestamp
    setRowsVersion((v) => v + 1);
    setGeneratedAt(new Date());
  };

  const exportCSV = () => {
    const header = ["Date", "ATM Location", "Mask Alerts", "Helmet Alerts", "False Positives", "Response Time"];
    const dataLines = rows.map((r) => [r.date, r.location, r.mask, r.helmet, r.falsePos, r.response].join(","));
    const csv = [header.join(","), ...dataLines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `alert-summary_${generatedAt.toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="px-3 sm:px-6 pt-6 pb-10 text-slate-900">
      {/* Header */}
      <Header title={"Reports"}/>

      {/* Reports & Analytics panel */}
      <h3 className="text-xl font-semibold mb-3">Reports &amp; Analytics</h3>

      <div className="rounded-2xl bg-white shadow-lg border border-slate-200 p-5 mb-6">
        {/* top-right export */}
        <div className="flex justify-end">
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-3 py-2 shadow"
          >
            <span className="grid place-items-center">{Icon.download}</span>
            Export Report
          </button>
        </div>

        {/* filters grid */}
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option>Alert Summary</option>
              <option>Response Time</option>
              <option>Camera Uptime</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Time Period</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option>Last 24 Hours</option>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ATM Location</label>
            <select
              value={atm}
              onChange={(e) => setAtm(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option>All ATMs</option>
              <option>City Center</option>
              <option>Downtown</option>
              <option>Health District</option>
              <option>Shopping Mall</option>
              <option>Main Street</option>
              <option>Riverside</option>
              <option>Metro Station</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Alert Type</label>
            <select
              value={alertType}
              onChange={(e) => setAlertType(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option>All Alerts</option>
              <option>Mask</option>
              <option>Helmet</option>
              <option>False Positive</option>
            </select>
          </div>
        </div>

        <div className="mt-5">
          <button
            onClick={onGenerate}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 shadow"
          >
            <span className="grid place-items-center">{Icon.play}</span>
            Generate Report
          </button>
        </div>
      </div>

      {/* Summary table */}
      <div className="rounded-2xl bg-white shadow-lg border border-slate-200">
        <div className="px-5 pt-4">
          <h4 className="text-lg font-semibold">Alert Summary - Last 7 Days</h4>
          <p className="text-sm text-slate-500 mt-1">
            Generated on:{" "}
            {generatedAt.toLocaleString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",   // show seconds so you can see it update instantly
            })}
          </p>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-600 bg-slate-50">
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 font-semibold">ATM Location</th>
                <th className="px-5 py-3 font-semibold">Mask Alerts</th>
                <th className="px-5 py-3 font-semibold">Helmet Alerts</th>
                <th className="px-5 py-3 font-semibold">False Positives</th>
                <th className="px-5 py-3 font-semibold">Response Time</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t border-slate-100">
                  <td className="px-5 py-3">{r.date}</td>
                  <td className="px-5 py-3">{r.location}</td>
                  <td className="px-5 py-3">{r.mask}</td>
                  <td className="px-5 py-3">{r.helmet}</td>
                  <td className="px-5 py-3">{r.falsePos}</td>
                  <td className="px-5 py-3">{r.response}</td>
                </tr>
              ))}
              <tr className="border-t border-slate-200 bg-slate-50 font-medium">
                <td className="px-5 py-3">Totals</td>
                <td className="px-5 py-3">—</td>
                <td className="px-5 py-3">{totals.mask}</td>
                <td className="px-5 py-3">{totals.helmet}</td>
                <td className="px-5 py-3">{totals.falsePos}</td>
                <td className="px-5 py-3">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
