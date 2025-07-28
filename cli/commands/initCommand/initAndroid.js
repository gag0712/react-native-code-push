const path = require('path');
const fs = require('fs');
const { EOL } = require('os');

async function initAndroid() {
    console.log('Running Android setup...');
    await applyMainApplication();
}

async function applyMainApplication() {
    const mainApplicationPath = await findMainApplication();
    if (!mainApplicationPath) {
        console.log('Could not find MainApplication.java or MainApplication.kt');
        return;
    }

    const mainApplicationContent = fs.readFileSync(mainApplicationPath, 'utf-8');

    if (mainApplicationPath.endsWith('.java')) {
        if (mainApplicationContent.includes('CodePush.getJSBundleFile()')) {
            console.log('MainApplication.java already has CodePush initialized.');
            return;
        }
        const newContent = mainApplicationContent
            .replace('import com.facebook.react.ReactApplication;', `import com.facebook.react.ReactApplication;${EOL}import com.microsoft.codepush.react.CodePush;`)
            .replace('new DefaultReactNativeHost(this) {', `new DefaultReactNativeHost(this) {${EOL}          @Override${EOL}          protected String getJSBundleFile() {${EOL}            return CodePush.getJSBundleFile();${EOL}          }${EOL}`)
        fs.writeFileSync(mainApplicationPath, newContent);
        console.log('Successfully updated MainApplication.java.');
    } else if (mainApplicationPath.endsWith('.kt')) {
        if (mainApplicationContent.includes('CodePush.getJSBundleFile()')) {
            console.log('MainApplication.kt already has CodePush initialized.');
            return;
        }
        const newContent = mainApplicationContent
            .replace('import com.facebook.react.ReactApplication', `import com.facebook.react.ReactApplication${EOL}import com.microsoft.codepush.react.CodePush`)
            .replace('override fun getJSMainModuleName(): String = "index"', `override fun getJSMainModuleName(): String = "index"${EOL}        override fun getJSBundleFile(): String = CodePush.getJSBundleFile()`)
        fs.writeFileSync(mainApplicationPath, newContent);
        console.log('Successfully updated MainApplication.kt.');
    }
}

async function findMainApplication() {
    const searchPath = path.join(process.cwd(), 'android', 'app', 'src', 'main', 'java');
    const files = fs.readdirSync(searchPath, { recursive: true });
    const mainApplicationFile = files.find(file => file.endsWith('MainApplication.java') || file.endsWith('MainApplication.kt'));
    return mainApplicationFile ? path.join(searchPath, mainApplicationFile) : null;
}

module.exports = {
    initAndroid: initAndroid
};
