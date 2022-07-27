import process from 'process';
import {
    getDirectories,
    getPackageJson,
    getPackageVersion,
    npmInstall,
    npmBuild,
    getDependencies,
    getParamsFromDependencies,
    isBuilt,
    setBuilt, deploy, setDeployed, isDeployed
} from "./functions.js";



const directories = getDirectories("../");
let failedProjects = [];

directories.forEach((dir, i) => {
    try{
        process.stdout.write(`${i + 1} from ${directories.length} | `);
        const packageJson = getPackageJson(dir);
        const projectName = packageJson.name;

        const deployStatus = isDeployed(dir);
        process.stdout.write(` ${projectName}`);

        if(deployStatus){
            process.stdout.write(` | Deployed`);

        }
        return;
        process.stdout.write(` | Not deployed\n`);
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
