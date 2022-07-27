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
    setBuilt, deploy, setDeployed
} from "./functions.js";


const directories = getDirectories("../");
let failedProjects = [];

directories.forEach((dir, i) => {
    try{
        process.stdout.write(`${i + 1} from ${directories.length} | `);
        const packageJson = getPackageJson(dir);
        const projectName = packageJson.name;
        process.stdout.write(` ${projectName} `);
        if(packageJson.scripts.build){
            const buildStatus = isBuilt(dir);
            const buildStatusString = buildStatus ? "Built" : "Unbuilt";
            process.stdout.write(` | ${buildStatusString}\n`);

            if(!buildStatus){
                const result = npmBuild(dir, projectName);
                setBuilt(dir, result);
                if(!result){
                    failedProjects.push(projectName);
                }
            }
            return;
        }
        process.stdout.write(` | Build script not found\n`);
    }catch(e){
        process.stdout.write(` | ${e.message}`);
    }
})


console.log("-- Results --");
console.log(`${failedProjects.length}/${directories.length} projects failed`);
if(failedProjects.length > 0){
    console.log("Failed projects:");
    console.log(failedProjects.join('\n'));
}
