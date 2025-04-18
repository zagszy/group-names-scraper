import puppeteer from "puppeteer";
import { Matrix } from "./modules/matrix.js";

const convertMagmaToMatrices = function(groupInfo) { // TODO: need to fix w/ generators over Z, which is like the first 2 only? 
    if (groupInfo.generators.includes("Integers()")) {
        return {
            name: groupInfo.name,
            order: groupInfo.order,
            glforder: Number.MAX_SAFE_INTEGER, 
            generators: Matrix.identity(Number.MAX_SAFE_INTEGER, 1)
        }
    }
    
    const pattern = /-?\d+/g; 
    let matches = groupInfo.generators.match(pattern); 
    let data = matches ? matches.map(Number) : [] ;
    console.log(data); 
    
    const dim = data[0] ? data[0] : null; 
    const glf = data[1] ? data[1] : null;  
    const rawGenerators = []; 
    let k = 2; 
    while (k < data.length) { 
        let gen = []; 
        for (let i = 0; i < dim; i++) {
            let row = [];
            for (let j = 0; j < dim; j++) { 
                row.push(data[k]); 
                k++ 
            }
            gen.push(row); 
        }
        rawGenerators.push(gen);
    }
    // console.log(rawGenerators); 

    const generators = []; 

    rawGenerators.forEach((mtx) => {
        let temp = new Matrix(glf, dim); 
        temp.contents = mtx; 
        generators.push(temp);
    })

    console.log({
        name: groupInfo.name,
        glforder: glf, 
        generators: generators
    })

    return {
        name: groupInfo.name,
        order: groupInfo.order,
        glforder: glf, 
        generators: generators
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

    // console.log(groupLinks);

    const groupData = []; 
    const selector = ['#shs5', '.shs5', 'shs6', 'pre']; // site lists magma code under numerous classes/ids, odd. anyways not really any choice
    let code = null; 

    for (let data of groupLinks) {
        await page.goto(data.href);
        for (const filter of selector) { 
            const magma = await page.evaluate((filter) => {
                const temp = document.querySelector(filter);
                if (temp && temp.innerText.includes('sub<GL')) {
                    return temp.innerText.trim(); 
                } else {
                    return null; 
                }
            }, filter); // today i learnt!

            if (magma !== null ) {
                let magmaTrimmed = ""; 
                for (let i = magma.length-1; i >= 0; i--) {
                    if (magma.charAt(i) === ';') { 
                        magmaTrimmed = magma.substring(0,i); 
                    }
                }
                console.log(magmaTrimmed);
                let g = {
                    name: data.name, 
                    order: data.order, 
                    generators: magmaTrimmed
                }
                console.log(convertMagmaToMatrices(g));
                groupData.push(g);
                break; 
            }
        }
    }
    groupData.forEach((g) => {
        console.log(convertMagmaToMatrices(g));
    })
    await browser.close();
    }




// convertMagmaToMatrices("G:=sub<GL(4,GF(5))| [0,0,1,0,4,4,4,1,0,0,0,1,0,1,0,0],[1,0,0,0,2,1,3,0,4,4,3,3,0,1,0,0] >;");
getGroupLinks();