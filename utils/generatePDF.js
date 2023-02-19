const puppeteer = require("puppeteer");

exports.generatePDF = ({ html }) => {
    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch({
                headless: true,
                args: [
                    "--headless",
                    "--disable-gpu",
                    "--full-memory-crash-report",
                    "--unlimited-storage",
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                ],
            });

            const page = await browser.newPage();
            await page.setContent(html);
            const pdf = await page.pdf({
                format: "A4", margin: {
                    top: '70px',
                    right: '40px',
                    bottom: '70px',
                    left: '40px'
                },
            });

            await browser.close();

            resolve(pdf);
        } catch (error) {
            reject(error);
        }
    });
}