import process from 'process';
import {getDirectories, getPackageJson, getPackageVersion, npmInstall} from "./functions.js";

const directories = getDirectories("../");

directories.forEach((dir) => {
    const packageJson = getPackageJson(dir);
    const projectName = packageJson.name;
    process.stdout.write(`${projectName}\n`);
})