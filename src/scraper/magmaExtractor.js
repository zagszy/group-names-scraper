const selector = ['#shs5', '.shs5', '.shs6', 'pre', "#textmat", "#shs6"];


export async function extractMagmaCode(page) {
    for (const filter of selector) { 
        const magma = await page.evaluate((filter) => {
            const temp = document.querySelector(filter);
            if (!temp) {
                return null; 
            }
            
            if (temp.innerText.includes('sub<GL') ) {
                const idx = temp.innerText.indexOf('G:='); 
                if (idx === -1); // nothing useful 
                return temp.innerText.slice(idx).trim(); 
            } else {
                console.log(temp.innerText);
                return null; 
            }
        }, filter); // today i learnt!
        
        if (magma) {
            return magma.split(';')[0]; // removes everything after ';', unneeded. 
        }   
    }
    return null; 
}



export async function extractOrder(page) { 
    const orderText = await page.evaluate( () => {
        const temp = document.querySelector(".gpordstyle"); 
        if (temp) {
            return temp.textContent.trim();
        } else {
            return null; 
        }
    })

    console.log(orderText); 
    return parseInt(orderText.match(/\d+/)[0], 10);
}
