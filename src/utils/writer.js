import fs from 'fs'; 
let rowsWritten = 0;
let MAX_ROWS = 1000; 

export function writeToJson(path = './output/output.json') {
    const file = fs.createWriteStream(path); 

    file.on('error', err => { // error listener - avoid infinite write 
        console.error('stream error: ', err); 
    })

    file.write('[\n'); 
    let first = true; 

    async function writeFile(g) { // stringify cant handle the large nature of generators
        if (rowsWritten++ > MAX_ROWS) throw new Error(`refusing to write - ${MAX_ROWS} limit reached`); 
        let data;
        return new Promise((resolve) => { // weird stack exchange magic... at least im learning about resolving backpressure 
            try {
                data = JSON.stringify(g);
                if (data === undefined) throw new error (`Could not serialize object (circular reference?) ${g}`); 

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
                console.error(err);
                resolve(); 
            }  
        })
    }

    function close() {
        file.write('\n]\n'); 
        file.end();
        return new Promise(res => file.on('finish', res)); 

    }

    return {writeFile, close};
    
}