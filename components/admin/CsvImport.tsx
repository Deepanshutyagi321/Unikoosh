"use client";

import { useState } from "react";
import Papa from "papaparse";

type CsvRow = Record<string, string>;

interface BulkResult {
  saved: string[];
  skipped: { row: number; reason: string }[];
}

export default function CsvImport({ onImported }: { onImported: () => void }) {
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [parseError, setParseError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<BulkResult | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setResult(null);
    setParseError("");

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setParseError(results.errors[0].message);
        }
        setRows(results.data);
      },
      error: (err) => setParseError(err.message),
    });
  }

  async function handleImport() {
    setSubmitting(true);
    setResult(null);

    const res = await fetch("/api/universities/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows }),
    });

    setSubmitting(false);

    if (res.ok) {
      const data = (await res.json()) as BulkResult;
      setResult(data);
      onImported();
    } else {
      setParseError("Import failed — check the console for details.");
    }
  }

  const previewRows = rows.slice(0, 5);

  return (
    <div className="border border-border bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display font-medium text-ink">
          Bulk import from CSV
        </h2>
        <a
          href="/sample-universities.csv"
          download
          className="focus-ring font-mono text-xs uppercase text-navy underline underline-offset-2"
        >
          Download sample CSV
        </a>
      </div>

      <p className="mt-1 font-body text-sm text-ink-soft">
        Columns must match the sample exactly (slug and name are required;
        courses use <code>;</code> to separate multiple values). The
        seo* columns are optional — leave them blank and the site
        auto-generates title/description from the About text instead.
      </p>

      <input
        type="file"
        accept=".csv"
        onChange={handleFile}
        className="focus-ring mt-4 w-full border border-border bg-paper-alt px-3 py-2 text-sm"
      />

      {parseError && (
        <p className="mt-2 font-mono text-sm text-maroon">{parseError}</p>
      )}

      {rows.length > 0 && (
        <div className="mt-4">
          <p className="font-mono text-xs uppercase tracking-wide text-ink-soft">
            {fileName} — {rows.length} row{rows.length === 1 ? "" : "s"}{" "}
            parsed, showing first {previewRows.length}
          </p>
          <div className="mt-2 overflow-x-auto border border-border">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-paper-alt">
                  <th className="px-3 py-2 font-mono">slug</th>
                  <th className="px-3 py-2 font-mono">name</th>
                  <th className="px-3 py-2 font-mono">state</th>
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 font-mono">{row.slug || "—"}</td>
                    <td className="px-3 py-2">{row.name || "—"}</td>
                    <td className="px-3 py-2">{row.state || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleImport}
            disabled={submitting}
            className="focus-ring mt-4 rounded-sm bg-verified px-5 py-2.5 font-display font-medium text-white disabled:opacity-60"
          >
            {submitting ? "Importing…" : `Import ${rows.length} universities`}
          </button>
        </div>
      )}

      {result && (
        <div className="mt-4 border-t border-border pt-4">
          <p className="font-mono text-sm text-verified">
            Saved {result.saved.length} universit
            {result.saved.length === 1 ? "y" : "ies"}.
          </p>
          {result.skipped.length > 0 && (
            <div className="mt-2">
              <p className="font-mono text-sm text-maroon-soft">
                Skipped {result.skipped.length}:
              </p>
              <ul className="mt-1 space-y-0.5">
                {result.skipped.map((s) => (
                  <li key={s.row} className="font-mono text-xs text-ink-soft">
                    Row {s.row}: {s.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
