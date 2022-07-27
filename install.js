import process from 'process';
import {getDirectories, getPackageJson, getPackageVersion, npmInstall} from "./functions.js";

const directories = getDirectories("../");

directories.forEach((dir, i) => {
    try{
        process.stdout.write(`${i + 1} from ${directories.length} | `);
        const packageJson = getPackageJson(dir);
        const projectName = packageJson.name;
        process.stdout.write(` ${projectName}\n`);
        npmInstall(dir);
    }catch(e){
        process.stdout.write(` | ${e.message}`);
    }
})