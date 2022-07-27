import process from 'process';
import {getDirectories, deploy, getPackageJson, isDeployed, setDeployed } from "./functions.js";

const site = "test";
const directories = getDirectories("../");
//const directories = [ "/home/hans/projects/examples/layer0-docusaurus-example" ];

directories.forEach((dir, i) => {
    try{
        process.stdout.write(`${i + 1} from ${directories.length} | `);
        const packageJson = getPackageJson(dir);
        const projectName = packageJson.name;
        const environment = projectName;
        const deployStatus = isDeployed(dir);
        const deployStatusString = deployStatus ? "Deployed" : "Undeployed";
        process.stdout.write(` ${projectName} | ${deployStatusString}`);
        if(!deployStatus){
            const result = deploy(dir, site, environment);
            setDeployed(dir, result);
        }
    }catch(e){
        process.stdout.write(` | ${e.message}`);
    }
    process.stdout.write(`\n`);
})