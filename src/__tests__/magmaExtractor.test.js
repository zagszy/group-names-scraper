import { launchBrowser } from "../scraper/browser";
import {extractMagmaCode, extractOrder} from "../scraper/browser"; 


const c4 = "https://people.maths.bris.ac.uk/~matyd/GroupNames/1/C4.html"; 
const c5 = "https://people.maths.bris.ac.uk/~matyd/GroupNames/1/C5.html"; 

const browser = await puppeteer.launch();
const page = await browser.newPage(); 

test('extracting c4 should return order 4 and correct magma code', async() => { 
    const browser = launchBrowser();
    const page = await browser.newPage();
    await page.goto(c4); 
    
    const magma = await extractMagmaCode(page);
    const order = await extractOrder(page);
    
    expect(test.magma).toEqual("G:=sub<GL(1,GF(11))| [4] >")
    expect(test.order).toEqual(4);
    await browser.close(); 

})