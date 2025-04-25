import { launchBrowser } from "./browser.js"; 

// TODO in cells = row.quertySelectoryAll('td'), write html -> latex converter to grab names instead of just labels for our groups

export async function getGroupLinks(browser) {
    const page = await browser.newPage();

    await page.goto('https://people.maths.bris.ac.uk/~matyd/GroupNames/');
    await page.waitForSelector('.gptable');

    const groupLinks = await page.evaluate(() => {
        const tables = document.querySelectorAll('.gptable'); // selects all tables and returns a node-list
        let allRows = [];                                     // we'll use this to keep 1st column of rows 

        tables.forEach(table => {   
            const rows = Array.from(table.querySelectorAll('tr')).slice(1).map(row => { // does a few things:
                const cells = row.querySelectorAll('td');                               // 1. table.querySelectorAll('tr) grabs row and subseq. cols
                const nameLink = cells[0]?.querySelector('a');                          // 2. slice(1) grabs the data in table, slice(0) grabs header, not useful
                const orderText = cells[2]?.textContent.trim();                         // 3. .map(row => ...) converts each 1st column into an array
                const order = parseInt(orderText, 10);                                  // anyways, cells grabs all cells in the row, each row 6 columns, 
                // we only want 0 for name + href, 2 order of group
                const name = "";
                const test = nameLink ? { 
                    name: cells[0]?.id ?? nameLink.textContent.trim(), 
                    href: nameLink.href, 
                    order: order 
                } : null;
                
                // console.log(test);
                return test 
            });

            allRows = allRows.concat(rows);
        });
        return allRows.filter(Boolean);
    });

    return groupLinks;
}