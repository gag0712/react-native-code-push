const path = require('path');
const fs = require('fs');
const xcode = require('xcode');

async function initIos() {
    console.log('Running iOS setup...');
    const projectDir = path.join(process.cwd(), 'ios');
    const files = fs.readdirSync(projectDir);
    const xcodeprojFile = files.find(file => file.endsWith('.xcodeproj'));
    if (!xcodeprojFile) {
        console.log('Could not find .xcodeproj file in ios directory');
        return;
    }
    const projectName = xcodeprojFile.replace('.xcodeproj', '');
    const appDelegatePath = findAppDelegate(path.join(projectDir, projectName));

    if (!appDelegatePath) {
        console.log('Could not find AppDelegate file');
        return;
    }

    if (appDelegatePath.endsWith('.swift')) {
        await setupSwift(appDelegatePath, projectDir, projectName);
    } else {
        await setupObjectiveC(appDelegatePath);
    }

    console.log('Please run `cd ios && pod install` to complete the setup.');
}

function findAppDelegate(searchPath) {
    if (!fs.existsSync(searchPath)) return null;
    const files = fs.readdirSync(searchPath);
    const appDelegateFile = files.find(file => file.startsWith('AppDelegate') && (file.endsWith('.m') || file.endsWith('.mm') || file.endsWith('.swift')));
    return appDelegateFile ? path.join(searchPath, appDelegateFile) : null;
}

function modifyObjectiveCAppDelegate(appDelegateContent) {
    const IMPORT_STATEMENT = '#import <CodePush/CodePush.h>';
    if (appDelegateContent.includes(IMPORT_STATEMENT)) {
        console.log('AppDelegate already has CodePush imported.');
        return appDelegateContent;
    }

    return appDelegateContent
        .replace('#import "AppDelegate.h"\n', `#import "AppDelegate.h"\n${IMPORT_STATEMENT}\n`)
        .replace('[[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];', '[CodePush bundleURL];');
}

function modifySwiftAppDelegate(appDelegateContent) {
    const CODEPUSH_CALL_STATEMENT = 'CodePush.bundleURL()';
    if (appDelegateContent.includes(CODEPUSH_CALL_STATEMENT)) {
        console.log('AppDelegate.swift already configured for CodePush.');
        return appDelegateContent;
    }

    return appDelegateContent
        .replace('Bundle.main.url(forResource: "main", withExtension: "jsbundle")', CODEPUSH_CALL_STATEMENT);
}

async function setupObjectiveC(appDelegatePath) {
    const appDelegateContent = fs.readFileSync(appDelegatePath, 'utf-8');
    const newContent = modifyObjectiveCAppDelegate(appDelegateContent);
    fs.writeFileSync(appDelegatePath, newContent);
    console.log('Successfully updated AppDelegate.m/mm.');
}

async function setupSwift(appDelegatePath, projectDir, projectName) {
    const bridgingHeaderPath = await ensureBridgingHeader(projectDir, projectName);
    if (!bridgingHeaderPath) {
        console.log('Failed to create or find bridging header.');
        return;
    }

    const appDelegateContent = fs.readFileSync(appDelegatePath, 'utf-8');
    const newContent = modifySwiftAppDelegate(appDelegateContent);
    fs.writeFileSync(appDelegatePath, newContent);
    console.log('Successfully updated AppDelegate.swift.');
}

async function ensureBridgingHeader(projectDir, projectName) {
    const projectPath = path.join(projectDir, `${projectName}.xcodeproj`, 'project.pbxproj');
    const myProj = xcode.project(projectPath);

    return new Promise((resolve, reject) => {
        myProj.parse(function (err) {
            if (err) {
                console.error(`Error parsing Xcode project: ${err}`);
                return reject(err);
            }

            const bridgingHeaderRelativePath = `${projectName}/${projectName}-Bridging-Header.h`;
            const bridgingHeaderAbsolutePath = path.join(projectDir, bridgingHeaderRelativePath);

            const configurations = myProj.pbxXCBuildConfigurationSection();
            for (const name in configurations) {
                const config = configurations[name];
                if (config.buildSettings) {
                    config.buildSettings.SWIFT_OBJC_BRIDGING_HEADER = `"${bridgingHeaderRelativePath}"`;
                }
            }

            if (!fs.existsSync(bridgingHeaderAbsolutePath)) {
                fs.mkdirSync(path.dirname(bridgingHeaderAbsolutePath), { recursive: true });
                fs.writeFileSync(bridgingHeaderAbsolutePath, '#import <CodePush/CodePush.h>\n');
                console.log(`Created bridging header at ${bridgingHeaderAbsolutePath}`);
                const groupKey = myProj.findPBXGroupKey({ name: projectName });
                myProj.addHeaderFile(bridgingHeaderRelativePath, { public: true }, groupKey);
            } else {
                const headerContent = fs.readFileSync(bridgingHeaderAbsolutePath, 'utf-8');
                if (!headerContent.includes('#import <CodePush/CodePush.h>')) {
                    fs.appendFileSync(bridgingHeaderAbsolutePath, '\n#import <CodePush/CodePush.h>\n');
                    console.log(`Updated bridging header at ${bridgingHeaderAbsolutePath}`);
                }
            }

            fs.writeFileSync(projectPath, myProj.writeSync());
            console.log('Updated Xcode project with bridging header path.');
            resolve(bridgingHeaderAbsolutePath);
        });
    });
}

module.exports = {
    initIos: initIos,
    modifyObjectiveCAppDelegate: modifyObjectiveCAppDelegate,
    modifySwiftAppDelegate: modifySwiftAppDelegate,
}
