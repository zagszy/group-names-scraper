import { launchBrowser } from "./scraper/browser.js";
import { getGroupLinks } from "./scraper/groupLinks.js";
import { extractMagmaCode, extractOrder } from "./scraper/magmaExtractor.js";
import { convertMagmaToMatrices } from "./parsers/magmaParsers.js";
import { writeToJson } from "./utils/writer.js";


// TODO: grab order from the group page itself. 
//


let processed = new Set();  
async function main() {
    const browser = await launchBrowser(); 
    const page = await browser.newPage(); 
    const {writeFile, close} = writeToJson(); 

    const groupLinks = await getGroupLinks(browser); 
    console.log(groupLinks);

    let group; 
    for (const groupInfo of groupLinks) {
        if (!processed.has(groupInfo.name)) {                        // checks for duplicate
            processed.add(groupInfo.name);
            await page.goto(groupInfo.href);                         // navigates page to link 
            const magmaCode = await extractMagmaCode(page);          // extracts magma code 

            if (magmaCode) {                                         // if magmaCode exists
                const order = await extractOrder(page)               // extracts correct order from page
                group = convertMagmaToMatrices({                     // converts magma code into matrices
                    name: groupInfo.name, 
                    order: order, 
                    generators: magmaCode
                })

                await writeFile(group);
            }
        }
    }
    close(); 
    await browser.close();

}

main(); 