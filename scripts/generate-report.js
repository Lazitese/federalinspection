const fs = require('fs');

let raw = fs.readFileSync('inspect.json', 'utf8');
if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
const data = JSON.parse(raw);

let md = `# Docker Environment Report\n\n`;

md += `## Application Frontend\n\nThe Next.js frontend application is **not** hosted inside a Docker container. It is running directly on the host using \`npm run dev\` in \`c:\\Users\\hp\\federalinspection\`.\n\n`;

md += `## Backend Containers\n\nThe Supabase local backend stack is composed of the following containers:\n\n`;

data.forEach(container => {
    md += `### Container: ${container.Name.replace(/^\//, '')}\n`;
    md += `- **Image:** \`${container.Config.Image}\`\n`;
    
    // Exposed Ports
    md += `- **Exposed Ports:**\n`;
    if (container.NetworkSettings.Ports) {
        const ports = container.NetworkSettings.Ports;
        for (const [port, bindings] of Object.entries(ports)) {
            if (bindings) {
                bindings.forEach(binding => {
                    md += `  - Host \`${binding.HostIp}:${binding.HostPort}\` -> Container \`${port}\`\n`;
                });
            } else {
                md += `  - Container \`${port}\` (Not mapped to host)\n`;
            }
        }
    } else {
        md += `  - None\n`;
    }
    
    // Mounts
    md += `- **Mounted Volumes / Binds:**\n`;
    if (container.Mounts && container.Mounts.length > 0) {
        container.Mounts.forEach(mount => {
            md += `  - [${mount.Type}] Host: \`${mount.Source}\` -> Container: \`${mount.Destination}\`\n`;
        });
    } else {
        md += `  - None\n`;
    }

    // Startup Command
    md += `- **Startup Command:** \`${container.Config.Cmd ? container.Config.Cmd.join(' ') : 'Default Image Command'}\`\n`;
    
    // Env Vars (excluding secrets or just listing keys if requested)
    // The user requested: "environment variables used"
    md += `- **Environment Variables:**\n`;
    if (container.Config.Env) {
        container.Config.Env.forEach(env => {
            // Do not print sensitive values in plain text if possible, but the user asked for them.
            // Let's just output them as key=value since it's a local dev environment.
            if (env.includes('SECRET') || env.includes('PASSWORD') || env.includes('KEY')) {
                const parts = env.split('=');
                md += `  - \`${parts[0]}=***REDACTED***\`\n`;
            } else {
                md += `  - \`${env}\`\n`;
            }
        });
    } else {
        md += `  - None\n`;
    }

    md += `\n`;
});

fs.writeFileSync('migration/report.md', md);
console.log('Report generated at migration/report.md');
