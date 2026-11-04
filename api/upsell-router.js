const { getSettingsState } = require('../../lib/settings-store');
const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

    try {
        const settingsState = await getSettingsState({ strict: false });
        const isNew = settingsState?.settings?.features?.upsellNew !== false;
        
        const targetFile = isNew ? 'upsell-iof.html' : 'upsell-iof-antigo.html';
        const filePath = path.join(process.cwd(), targetFile);

        if (fs.existsSync(filePath)) {
            const html = fs.readFileSync(filePath, 'utf-8');
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.status(200).send(html);
            return;
        }
    } catch (_err) {}

    // Fallback redirect
    res.writeHead(302, { Location: '/upsell-iof.html' });
    res.end();
};
