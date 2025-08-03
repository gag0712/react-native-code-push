const path = require('path');
const fs = require('fs');
const { EOL } = require('os');

function modifyMainApplicationKt(mainApplicationContent) {
    if (mainApplicationContent.includes('CodePush.getJSBundleFile()')) {
        console.log('MainApplication.kt already has CodePush initialized.');
        return mainApplicationContent;
    }
    return mainApplicationContent
        .replace('import com.facebook.react.ReactApplication', `import com.facebook.react.ReactApplication${EOL}import com.microsoft.codepush.react.CodePush`)
        .replace('override fun getJSMainModuleName(): String = "index"', `override fun getJSMainModuleName(): String = "index"${EOL}        override fun getJSBundleFile(): String = CodePush.getJSBundleFile()`)
}

async function initAndroid() {
    console.log('Running Android setup...');
    await applyMainApplication();
}

async function applyMainApplication() {
    const mainApplicationPath = await findMainApplication();
    if (!mainApplicationPath) {
        console.log('Could not find MainApplication.kt');
        return;
    }

    if (mainApplicationPath.endsWith('.java')) {
        console.log('MainApplication.java is not supported. Please migrate to MainApplication.kt.');
        return;
    }

    const mainApplicationContent = fs.readFileSync(mainApplicationPath, 'utf-8');
    const newContent = modifyMainApplicationKt(mainApplicationContent);
    fs.writeFileSync(mainApplicationPath, newContent);
    console.log('Successfully updated MainApplication.kt.');
}

async function findMainApplication() {
    const searchPath = path.join(process.cwd(), 'android', 'app', 'src', 'main', 'java');
    const files = fs.readdirSync(searchPath, { recursive: true });
    const mainApplicationFile = files.find(file => file.endsWith('MainApplication.java') || file.endsWith('MainApplication.kt'));
    return mainApplicationFile ? path.join(searchPath, mainApplicationFile) : null;
}

module.exports = {
    initAndroid: initAndroid,
    modifyMainApplicationKt: modifyMainApplicationKt,
};
