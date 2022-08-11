import process from 'process';
import {__dirname, getDirectories, getPackageJson, getPackageVersion, gitClone, npmInstall} from "./functions.js";
import fs from 'fs';
import { readdirSync } from 'fs';

const repos = JSON.parse(fs.readFileSync(__dirname + 'repos.json', 'utf8'));

repos.forEach((repo, i) => {
    try{
        process.stdout.write(`Cloning ${i + 1} from ${repos.length} `);
        gitClone(repo);
    }catch(e){
        process.stdout.write(` | ${e.message}`);
    }
})