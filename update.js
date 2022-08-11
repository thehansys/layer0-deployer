import process from 'process';
import {
    getDirectories,
    getPackageJson,
    getPackageVersion,
    npmInstall,
    getDependencies,
    getParamsFromDependencies
} from "./functions.js";



const directories = getDirectories("../");
const packagesToSkip = [
    "@layer0/rum"
];
const packageSearchterm = "@layer0";
const packageVersion = "4.18.0";

let failedProjects = [];

directories.forEach((dir, i) => {
    try{
        process.stdout.write(`${i + 1} from ${directories.length} | `);
        const packageJson = getPackageJson(dir);
        const projectName = packageJson.name;
        const dependencies = getDependencies(packageJson, packageSearchterm);
        let dependenciesForUpdate = dependencies.filter(dep => dep.version !== packageVersion && !packagesToSkip.includes(dep.name))
        let dependenciesForInstall = dependenciesForUpdate.map(dep => {
            return {
                ...dep,
                version : packageVersion
            }
        });

        process.stdout.write(` ${projectName}`);
        if(dependenciesForUpdate.length > 0){
            process.stdout.write(` | Needs update\n`);
            process.stdout.write(`Previous packages:  ${getParamsFromDependencies(dependenciesForUpdate).join(' ')}\n`);
            let result = npmInstall(dir, dependenciesForInstall, projectName);
            if(!result){
                failedProjects.push(projectName);
            }
            return;
        }
        process.stdout.write(` | Everything is up to date\n`);
    }catch(e){
        process.stdout.write(` | ${e.message}\n`);
    }
})

console.log("-- Results --");
console.log(`${failedProjects.length}/${directories.length} projects failed`);
if(failedProjects.length > 0){
    console.log("Failed projects:");
    console.log(failedProjects.join('\n'));
}
