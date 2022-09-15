import { readdirSync } from 'fs';
import fs from 'fs';
import path from 'path';
import * as url from 'url';
import { spawnSync, spawn, exec } from 'child_process';
import process from 'process';

export const __filename = url.fileURLToPath(import.meta.url);
export const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
export const __parentDirname = path.resolve(__dirname, '..')
export const __deployedFilename = "deployed.txt";
export const __buildFilename = "built.txt";

export const getCurrentDirName = () => {
    let folders = __dirname.split("/");
    return folders.length >= 2 ? folders[folders.length - 2] : __dirname;
}

export const getDirectories = source => {
    const currentDirName = getCurrentDirName();
    return readdirSync(source, { withFileTypes: true })
        .filter(item => item.isDirectory() && item.name[0] !== '.' && item.name !== currentDirName)
        .map(item => path.resolve(source + item.name) + "/")
}

export const getPackageJson = (dir) => {
    let content = fs.readFileSync(dir + '/package.json', 'utf8');
    return JSON.parse(content)
}

export const getPackageVersion = (packageJson, pkg) => {
    try{
        let dependencies = "devDependencies" in packageJson ? packageJson.devDependencies : packageJson.dependencies;
        return dependencies[pkg].replace("^", "");
    }catch{}
    return null;
}

export const getDependencies = (packageJson, searchTerm = "") => {
    try{
        let dependencies = "devDependencies" in packageJson ? packageJson.devDependencies : packageJson.dependencies;
        let result = [];
        Object.keys(dependencies).forEach(key => {
            if(key.includes(searchTerm)){
                result.push({
                    "name" : key,
                    "version" : dependencies[key].replace("^", "")
                });
            }
        })
        return result;
    }catch(e){
        console.log(e.message);
    }
    return [];
}

export const getParamsFromDependencies = pkgs => {
    return pkgs.map(pkg => {
        return `${pkg.name}@${pkg.version}`;
    });
}

export const gitClone = (repo) => {
    const cmd = spawnSync( 'git', [ 'clone', repo ] );
    if(cmd.status === 1){
        process.stdout.write(" |Error\n")
        return false;
    }
    if(cmd.status === 0){
        process.stdout.write(" | Success\n");
    }
    return true;
}

export const npmInstall = (dir, pkgs = [], projectName = null) => {
    const errorFile = dir + "/install-error.log";
    const logFile = dir + "/install.log";
    let params = getParamsFromDependencies(pkgs);
    process.stdout.write(`Installing ${params.join(' ')} to ${projectName ?? dir}`);
    const cmd = spawn( 'npm', [ '--loglevel=error', '--no-update-notifier', '--legacy-peer-deps', 'install', '--prefix', dir, ...params ] );

    cmd.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });


    cmd.on('close', (code) => {
        console.log(`Process exited`);
    });
    return true;
}

export const npmBuild = (dir, projectName = null) => {
    const errorFile = dir + "/build-error.log";
    const logFile = dir + "/build.log";
    process.stdout.write(`Building ${projectName ?? dir}`);
    const cmd = spawnSync( 'npm', [ '--loglevel=error', '--no-update-notifier', 'run', 'build', '--prefix', dir] );
    if(cmd.status === 1){
        process.stdout.write(` | Error \nOutput saved to: ${errorFile}\n\n`);
        fs.writeFileSync(errorFile, cmd.stderr.toString())
        fs.writeFileSync(logFile, cmd.stdout.toString())
        return false;
    }
    if(cmd.status === 0){
        //process.stdout.write(cmd.stdout.toString());
        process.stdout.write(" | Success\n\n");
        fs.writeFileSync(logFile, cmd.stdout.toString())
    }
    return true;
}

export const deploy = (dir, site, environment) => {
    const errorFile = dir + "/deploy-error.log";
    const logFile = dir + "/deploy.log";
    process.stdout.write(`\nDeploying ${dir}`);
    const cmd = spawnSync( 'npx', [ '--loglevel=error', 'layer0', 'deploy', `--site=${site}`, `--environment=${environment}`], {
        cwd: dir
    });
    if(cmd.status === 1){
        process.stdout.write(` | Error \nOutput saved to: ${errorFile}\n\n`);
        fs.writeFileSync(errorFile, cmd.stderr.toString())
        fs.writeFileSync(logFile, cmd.stdout.toString())
        return false;
    }
    if(cmd.status === 0){
        //process.stdout.write(cmd.stdout.toString());
        process.stdout.write(" | Success\n\n");
        fs.writeFileSync(logFile, cmd.stdout.toString());
        return true;
    }
    fs.writeFileSync(logFile, cmd.stdout.toString());
    return false;
}

export const isDeployed = (dir) => {
    try {
        if (fs.existsSync(dir + "/" + __deployedFilename)) {
            return true;
        }
    } catch {}
    return false;
}

export const setDeployed = (dir, status) => {
    try {
        if (!status && fs.existsSync(dir + "/" + __deployedFilename)) {
            fs.unlinkSync(dir + "/" + __deployedFilename);
            return true;
        }
        if(status){
            fs.writeFileSync(dir + "/" + __deployedFilename, "")
        }
        return true;
    } catch(err) {}
    return false;
}


export const isBuilt = (dir) => {
    try {
        if (fs.existsSync(dir + "/" + __buildFilename)) {
            return true;
        }
    } catch {}
    return false;
}


export const setBuilt = (dir, status) => {
    try {
        if (!status && fs.existsSync(dir + "/" + __buildFilename)) {
            fs.unlinkSync(dir + "/" + __buildFilename);
            return true;
        }
        if(status){
            fs.writeFileSync(dir + "/" + __buildFilename, "")
        }
        return true;
    } catch(err) {}
    return false;
}
