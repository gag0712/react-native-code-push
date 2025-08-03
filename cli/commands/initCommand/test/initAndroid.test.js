
const { modifyMainApplicationKt } = require('../initAndroid');

// https://github.com/react-native-community/template/blob/0.80.2/template/android/app/src/main/java/com/helloworld/MainApplication.kt
const ktTemplate = `
package com.helloworld

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> =
            PackageList(this).packages.apply {
              // Packages that cannot be autolinked yet can be added manually here, for example:
              // add(MyReactNativePackage())
            }

        override fun getJSMainModuleName(): String = "index"

        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)
  }
}
`;

describe('Android init command - pure functions', () => {
  it('should correctly modify Kotlin MainApplication content', () => {
    const modifiedContent = modifyMainApplicationKt(ktTemplate);
    expect(modifiedContent).toContain('import com.microsoft.codepush.react.CodePush');
    expect(modifiedContent).toContain('override fun getJSBundleFile(): String = CodePush.getJSBundleFile()');
  });
});
