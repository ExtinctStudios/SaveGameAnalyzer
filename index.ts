import fs from 'fs'; 
import path from 'path';
import promt from 'prompt-sync';

const promter = promt();
const int_size = 4;
const bool_size = 1;

(async () => {
    console.log('Enter the file path: ');
    const string = promter();
    const file_path = path.resolve(string);
    const data = fs.readFileSync(file_path);
    const buffer = Buffer.from(data);

    const save_system = {
        structures : [],
        money: 0
    }

    let counter = 0;
    const grid_count = buffer.readInt32LE(counter);
    counter += int_size;
    const structures_data = [];
    for(let i = 0; i < grid_count; i++){
        const react = loadReact(buffer, counter);
        counter += int_size*6;
        const key = buffer.readUInt32LE(counter);
        counter += int_size;
        const general_structure_data = loadGeneralData(buffer, counter);
        counter += int_size*13;
        const structure_data = loadStructureData(buffer, counter, key);
        counter = structure_data[1] as number;
        const structure = {
            react: react,
            key: key,
            general_structure_data: general_structure_data,
            structure_data: structure_data[0]
        }
        structures_data.push(structure);
    }
    save_system.structures = structures_data;
    save_system.money = buffer.readInt32LE(counter);
    counter += int_size;
    fs.writeFileSync('./output.json', JSON.stringify(save_system));

})();

function loadStructureData(buffer:Buffer, counter:number, key:number){
    switch(key){
        case 41231234: { // Input
            const items = [];
            const item_count = buffer.readInt32LE(counter);
            counter += int_size;
            for(let i = 0 ; i < item_count; i++){
                const item_key = buffer.readUInt32LE(counter + int_size);
                items.push(loadItem(item_key));
                counter += int_size;
            }
            return [{
                items: items
            }, counter];
        }
        case 128223386: { // Output
            return [{},counter];
        }
        case 1485802268:{ //converyor
            const has_item = Boolean(buffer.readInt8(counter));
            counter += bool_size;
            let item_key;
            if(has_item){
                item_key = buffer.readUInt32LE(counter);
                console.log(item_key)
                counter += int_size;
            }
            const item = loadItem(item_key);
            return [{
                has_item: has_item,
                item: item
            }, counter];
        }
        case 556367699: { //Limitor
            const has_item = Boolean(buffer.readInt8(counter));
            counter += bool_size;
            let item_key;
            if(has_item){
                item_key = buffer.readUInt32LE(counter);
                console.log(item_key)
                counter += int_size;
            }
            const item = loadItem(item_key);
            return [{
                has_item: has_item,
                item: item
            }, counter];
        }
        case 1546486843: { //Splitter
            const has_item = Boolean(buffer.readInt8(counter));
            counter += bool_size;
            const has_split = Boolean(buffer.readInt8(counter));
            counter += bool_size;
            let item_key;
            if(has_item){
                item_key = buffer.readUInt32LE(counter);
                console.log(item_key)
                counter += int_size;
            }
            const item = loadItem(item_key);
            return [{
                has_item: has_item,
                item: item,
                has_split: has_split
            }, counter];
        }
        case 2146318204: { // cleaner
            return [{}, counter];
        }
        case 1537064138: { //pellet maker
            return [{}, counter];
        }
        case 832871175: { // circuit maker
            return [{}, counter];
        }
        case 26791252: { // storage
            const item_count = buffer.readInt32LE(counter);
            counter += int_size;
            const items = [];
            for(let i = 0; i < item_count; i++){
                const item_key = buffer.readUInt32LE(counter);
                counter += int_size;
                const amount = buffer.readInt32LE(counter);
                counter += int_size;
                items.push({
                    item: loadItem(item_key),
                    amount: amount
                });
            }
            return [{
                items: items
            }, counter];
        }
    }
    return [{}, counter];
}

function loadGeneralData(buffer:Buffer, counter:number){
    const react = loadReact(buffer, counter);
    const cardinal = buffer.readInt32LE(counter + int_size*6);
    const vector = loadVector(buffer, counter + int_size*7);
    const euler_angles = loadVector(buffer, counter + int_size*10);
    return {
        react: react,
        cardinal: cardinal,
        vector: vector,
        euler_angles: euler_angles
    }
}

function loadItem(key:number){
    switch(key){
        case 1153216256: {//Contaminaded platic
            return "contaminated plastic";
        }
        case 177090048: { //plastic
            return "plastic";
        }
        case 345092096: { //plastic pellets
            return "plastic pellets";
        }
        case 1804464896: { //circuit
            return "circuit";
        }
    }
    return {};
}


function loadReact(buffer:Buffer, counter:number) {
    return {
        x: buffer.readInt32LE(counter),
        y: buffer.readInt32LE(counter + int_size),
        pivotX: buffer.readInt32LE(counter + int_size * 2),
        pivotY: buffer.readInt32LE(counter + int_size * 3),
        width: buffer.readInt32LE(counter + int_size * 4),
        height: buffer.readInt32LE(counter + int_size * 5),
    }
}
function loadVector(buffer:Buffer, counter:number){
    return {
        x: buffer.readFloatLE(counter),
        y: buffer.readFloatLE(counter + int_size),
        z: buffer.readFloatLE(counter + int_size*2)
    }
}