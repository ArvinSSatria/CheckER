export async function scrapeInstagram(username: string): Promise<any> {
    return new Promise((resolve) => {
        const { exec } = require('child_process') as typeof import('child_process');
        const path = require('path') as typeof import('path');
        const scriptPath = path.join(process.cwd(), 'scripts', 'scrapeInstagram.js');

        exec(`node "${scriptPath}" "${username}"`, { maxBuffer: 1024 * 1024 * 5 }, (error: any, stdout: string, stderr: string) => {
            if (error) {
                console.error("Instagram Scrape Exec Error:", error);

                try {
                    if (stdout) {
                        const parts = stdout.split('\n').filter((p: string) => p.trim() !== '');
                        const lastPart = parts[parts.length - 1];
                        const parsed = JSON.parse(lastPart);
                        if (parsed.error) {
                            return resolve(parsed);
                        }
                    }
                } catch (e) {}

                return resolve({ error: "Instagram's anti-bot system blocked access. Please use the manual entry form below." });
            }

            try {
                const lines = stdout.split('\n').filter((line: string) => line.trim() !== '');
                const lastLine = lines[lines.length - 1];
                const data = JSON.parse(lastLine);
                resolve(data);
            } catch (err) {
                console.error("Instagram Scrape Parse Error:", err);
                resolve({ error: "Failed to parse profile data. Instagram may be rate-limiting the request." });
            }
        });
    });
}
