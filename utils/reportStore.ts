// Utility to store/read AI reports in localStorage so Reports page always has data

export interface LocalReport {
  id: string;
  type: "disease" | "fertilizer" | "yield";
  date: string;          // ISO string
  crop: string;
  finding: string;
  detail: string;
  status: string;
  statusColor: string;
  raw: any;
}

const KEY = "kisansathi_reports";
const MAX = 50;

export function saveReport(r: Omit<LocalReport, "id" | "date">): LocalReport {
  const report: LocalReport = {
    ...r,
    id: `${r.type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    date: new Date().toISOString(),
  };
  const existing = getReports();
  const updated = [report, ...existing].slice(0, MAX);
  try { localStorage.setItem(KEY, JSON.stringify(updated)); } catch {}
  return report;
}

export function getReports(): LocalReport[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function clearReports() {
  try { localStorage.removeItem(KEY); } catch {}
}
