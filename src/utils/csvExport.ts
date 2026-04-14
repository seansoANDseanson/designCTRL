export interface EquipRow {
  tag: string;
  category: string;
  desc: string;
  mfr: string;
  model: string;
  specs: string;
  notes: string;
}

function esc(val: string): string {
  return `"${(val ?? '').replace(/"/g, '""')}"`;
}

export function exportEquipmentCSV(rows: EquipRow[], projectName = 'UNTITLED'): void {
  const headers = ['TAG', 'CATEGORY', 'DESCRIPTION', 'MANUFACTURER', 'MODEL', 'SPECS', 'NOTES'];
  const lines = [
    `# designCTRL Equipment Schedule — ${projectName} — ${new Date().toLocaleDateString()}`,
    headers.join(','),
    ...rows.map(r =>
      [r.tag, r.category, r.desc, r.mfr, r.model, r.specs, r.notes].map(esc).join(',')
    ),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `equipment-schedule-${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
