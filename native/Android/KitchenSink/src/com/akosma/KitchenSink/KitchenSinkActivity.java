package com.akosma.KitchenSink;

import org.apache.cordova.*;
import android.os.Bundle;

public class KitchenSinkActivity extends DroidGap {
    /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        super.loadUrl("file:///android_asset/www/index.html");
    }
}