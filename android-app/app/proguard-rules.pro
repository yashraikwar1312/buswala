# Keep WebView bridge methods available to JavaScript in release builds.
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
