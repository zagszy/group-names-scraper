import puppeteer from "puppeteer";
import { Matrix } from "./modules/matrix.js";
import * as fs from "fs"; 

// TODO: Order values are grabbed wrong -> grab on GROUP INFORMATION PAGE ITSELF rather than homepage
// TODO: running into issues writing 2 specific groups: c2xdic6, c11:c5. Need to investigate. 
// TODO: LETS ACTUALLY SPLIT UP THE CODE INTO THEIR OWN FILES! Modularize

let first = true; 
const file = fs.createWriteStream('output.json'); 
file.write('[\n'); 


function writeFile(g) { // stringify cant handle the large nature of generators... write sequentially. 
    return new Promise((resolve) => { // weird stack exchange magic... at least im learning about resolving backpressure 
        try {
            const data = JSON.stringify(g);
        const chunk = (first ? '' : ',\n') + data; 
        first = false;

        if (!file.write(chunk)) {
            file.once('drain', resolve);
        } else {
            resolve(); 
        }

        console.log("writing: " + data + " to file");
        } catch(err) {
            console.log("ran into error with: " + data);
        }  
    })
}

const convertMagmaToMatrices = function(groupInfo) { 
    const pattern = /-?\d+/g; 
    const matches = groupInfo.generators.match(pattern); 
    const rawGenerators = []; 
    // const generators = []; 
    const data = matches ? matches.map(Number) : [] ;

    if (groupInfo.generators.includes("Integers()")) {
        let k = 1; 
        while (k < data.length) { 
            rawGenerators.push([[data[k]]]);
            k++;
        }
        return {
            name: groupInfo.name,
            order: groupInfo.order,
            glforder: Number.MAX_SAFE_INTEGER, 
            generators: rawGenerators
        }
    }
        
    const dim = data[0] ? data[0] : null; // data[0] = generator dimensions
    const glf = data[1] ? data[1] : null; // data[1] = order of glf of generators
    let k = 2; 

    while (k < data.length) { 
        let gen = []; 
        for (let i = 0; i < dim; i++) {
            let row = [];
            for (let j = 0; j < dim; j++) { 
                row.push(data[k]); 
                k++;                       // <- TERMINATION CONDITION!!! DONT NEED TO SUS OUT THIS CODE
            }
            gen.push(row); 
        }
        rawGenerators.push(gen);
    }

    return {
        name: groupInfo.name,
        order: groupInfo.order,
        glforder: glf, 
        generators: rawGenerators
    }
} 


const getGroupLinks = async() => {
    const browser = await puppeteer.launch();
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

    console.log(groupLinks);

    const selector = ['#shs5', '.shs5', '.shs6', 'pre', "#textmat", "#shs6"]; // site lists magma code under numerous classes/ids, odd. anyways not really any choice
    let code = null; 
    let duplicate = new Set(); 

    while (groupLinks.length > 0) {
        const data = groupLinks.shift();
        await page.goto(data.href); 
        // console.log("working: " + data.name + ", "+ data.href);
        for (const filter of selector) { 
            const magma = await page.evaluate((filter) => {
                const temp = document.querySelector(filter);
                if (temp && temp.innerText.includes('sub<GL')) {
                    return temp.innerText.trim(); 
                } else {
                    return null; 
                }
            }, filter); // today i learnt!
            // console.log(magma);
            if (magma !== null && !duplicate.has(data.name)) {
                duplicate.add(data.name);
                let magmaTrimmed = ""; 
                for (let i = magma.length-1; i >= 0; i--) { // cleaning non-necessary info  
                    if (magma.charAt(i) === ';') { 
                        magmaTrimmed = magma.substring(0,i); 
                        break; 
                    }
                }

            // console.log(magmaTrimmed);
            try {
                await writeFile(convertMagmaToMatrices({
                    name: data.name, 
                    order: data.order, 
                    generators: magmaTrimmed
                }))
            } catch {
                console.log("ran into problem writing: " + data.name);
            }
            break;
            }
        }
    }

    await browser.close();

    }

// convertMagmaToMatrices("G:=sub<GL(4,GF(5))| [0,0,1,0,4,4,4,1,0,0,0,1,0,1,0,0],[1,0,0,0,2,1,3,0,4,4,3,3,0,1,0,0] >;");
await getGroupLinks();
file.write('\n]\n');
file.end();
file.on('finish', () => console.log('✅ Done writing all groups.'));
