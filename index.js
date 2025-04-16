import puppeteer from "puppeteer";

const getGroups = async() => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto('https://people.maths.bris.ac.uk/~matyd/GroupNames/');
    await page.waitForSelector('.gptable');

    const groups = await page.evaluate(() => {
        const tables = document.querySelectorAll('.gptable'); // selects all tables
        let allRows = [];

        tables.forEach(table => {
            const rows = Array.from(table.querySelectorAll('tr')).slice(1).map(row => {
                const cells = row.querySelectorAll('td');
                const nameLink = cells[0]?.querySelector('a'); 
                const orderText = cells[2]?.textContent.trim();
                const order = parseInt(orderText, 10);

                return nameLink ? { 
                    name: nameLink.textContent.trim(), 
                    href: nameLink.href, 
                    order: order 
                } : null;
            });

            allRows = allRows.concat(rows);
        });

        return allRows.filter(Boolean);
    });

    console.log(groups);
    await browser.close();
    }

getGroups();