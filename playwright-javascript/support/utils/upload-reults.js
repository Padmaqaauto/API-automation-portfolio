import fs from 'node:fs/promises';

const report = 'reports/cumber-report.json';
try {
    await fs.access(report);
    console.log('Report ready for CI artifact upload: ${report}');
} catch {
    console.error('Report not found: ${report}');
    process.exitCode = 1;
}