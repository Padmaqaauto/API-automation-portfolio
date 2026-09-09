import { exec } from 'child_process';

const cucumberCommand =
    'npx cucumber-js --require "step-definitions/**/*.js"';

exec(
    cucumberCommand,
    { shell: true },
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
        } catch (reportError) {
            console.error(
                'Failed to generate/open Cucumber report:',
                reportError
            );
        }

        // Preserve Cucumber's real result
        process.exitCode = cucumberExitCode;
    }
);