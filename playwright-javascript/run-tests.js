import { exec } from 'child_process';

const cliArgs = process.argv.slice(2);

// Build the Cucumber command dynamically.
// This preserves the existing execution model while allowing
// tags and other Cucumber CLI arguments to be supplied at runtime.
const cucumberCommand = [
    'npx cucumber-js',
    '--require "step-definitions/**/*.js"',
    ...cliArgs
].join(' ');

console.log('\n========== CUCUMBER EXECUTION ==========');
console.log('Command:', cucumberCommand);
console.log('=========================================\n');

exec(
    cucumberCommand,
    {
        shell: true,
        maxBuffer: 10 * 1024 * 1024
    },
    async (error, stdout, stderr) => {

        if (stdout) {
            process.stdout.write(stdout);
        }

        if (stderr) {
            process.stderr.write(stderr);
        }

        const cucumberExitCode = error?.code ?? 0;

        console.log('\nCucumber execution completed.');

        try {
            await import('./generateReport.js');

            console.log('Cucumber report generation completed.');
        } catch (reportError) {
            console.error(
                'Failed to generate/open Cucumber report:',
                reportError
            );
        }

        // Preserve Cucumber's actual exit code.
        process.exitCode = cucumberExitCode;
    }
);