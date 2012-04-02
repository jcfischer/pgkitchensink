// Wait for PhoneGap to load
//
document.addEventListener("deviceready", onDeviceReady, false);


var PGDemo = {};


PGDemo.accelerometer = function () {
  var x = null;
  var y = null;
  var z = null;
  var timestamp = null;

  var watchID = null;

  // Start watching the accelerometer
  //
  function startWatch() {
    // Update compass every 0.1 seconds
    var options = { frequency:100 };
    watchID = navigator.accelerometer.watchAcceleration(accelerationChanged, accelerationError, options);
  }

  // Stop watching the acceleromter
  //
  function stopWatch() {
    if (watchID) {
      navigator.accelerometer.clearWatch(watchID);
      watchID = null;
    }
  }

  function accelerationChanged(acceleration) {

    x = acceleration.x;
    y = acceleration.y;
    z = acceleration.z;
    timestamp = acceleration.timestamp;

    if (obj.callback) {
      obj.callback({x:x, y:y, z:z, timestamp:timestamp});
    }

  }

  function accelerationError(accelerationError) {
    alert('Acceleration error: ' + accelerationError.code);

  }

  var obj = {
    callback:function (accel) {
      // To be provided by clients
    },
    startWatch:function () {
      startWatch();
    },
    stopWatch:function () {
      stopWatch();
    }
  };

  return obj;

}();


PGDemo.camera = function () {

  function getPicture(options) {
    navigator.camera.getPicture(cameraSuccess, cameraFail, options);
  }

  function cameraSuccess(imageData) {
    if (obj.callback) {
      obj.callback(imageData);
    }
  }

  function cameraFail(message) {
    alert("Camera failed: " + message);
  }

  var obj = {
    callback:function (imageData) {
      // to be provided by client
      // $('#img').attr('src', "data:image/jpeg;base64," + imageData);
    },
    getPicture:function (options) {
      getPicture(options);
    }
  };
  return obj;
}();


// Compass Demos

PGDemo.compass = function () {
  // The watch id references the current `watchHeading`
  var watchID = null;

  // Start watching the compass
  //
  function startWatch() {
    // Update compass every 1 seconds
    var options = { frequency:200 };
    watchID = navigator.compass.watchHeading(headingChanged, headingError, options);
  }

  // Stop watching the compass
  //
  function stopWatch() {
    if (watchID) {
      navigator.compass.clearWatch(watchID);
      watchID = null;
    }
  }

  // onSuccess: Get the current heading
  //
  function headingChanged(heading) {
    $('#compass #heading').html(Math.floor(heading.magneticHeading));
    // rotate(45deg)
    $('#compass #compass_img').css('-webkit-transform', "rotate(" + (360 - heading.magneticHeading) + "deg)");
  }

  // onError: Failed to get the heading
  //
  function headingError(compassError) {
    alert('Compass error: ' + compassError.code);
  }

  return {
    startWatch:function () {
      startWatch();
    },
    stopWatch:function () {
      stopWatch();
    }
  };
}();


PGDemo.connection = function () {

  function checkConnection() {
    var networkState = navigator.network.connection.type;

    var states = {};
    states[Connection.UNKNOWN] = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI] = 'WiFi connection';
    states[Connection.CELL_2G] = 'Cell 2G connection';
    states[Connection.CELL_3G] = 'Cell 3G connection';
    states[Connection.CELL_4G] = 'Cell 4G connection';
    states[Connection.NONE] = 'No network connection';

    return states[networkState];
  }


  return {
    checkConnection:function () {
      return checkConnection();
    }
  };
}();


PGDemo.geolocation = function () {
  var lat = null;
  var lon = null;
  var alt = null;
  var accuracy = null;
  var alt_accuracy = null;
  var heading = null;
  var speed = null;
  var timestamp = null;

  var watchID = null;

  // Start watching the accelerometer
  //
  function startWatch() {
    // Update compass every 1 seconds
    var options = { maximumAge:3000, timeout:5000, enableHighAccuracy:true };
    watchID = navigator.geolocation.watchPosition(positionChanged, positionError, options);
  }

  // Stop watching the acceleromter
  //
  function stopWatch() {
    if (watchID) {
      navigator.geolocation.clearWatch(watchID);
      watchID = null;
    }
  }

  function positionChanged(position) {

    lat = position.coords.latitude;
    lon = position.coords.longitude;
    alt = position.coords.altitude;
    accuracy = position.coords.accuracy;
    alt_accuracy = position.coords.altitudeAccuracy;
    heading = position.coords.heading;
    speed = position.coords.speed;
    timestamp = position.timestamp;

    if (obj.callback) {
      obj.callback({lat:lat, lon:lon, alt:alt,
        accuracy:accuracy, alt_accuracy:alt_accuracy,
        heading:heading, speed:speed,
        timestamp:timestamp});
    }

  }

  function positionError(locationError) {
    alert('Geolocation error: ' + locationError.code);

  }

  var obj = {
    callback:function (location) {
      // To be provided by clients
    },
    startWatch:function () {
      startWatch();
    },
    stopWatch:function () {
      stopWatch();
    }
  };

  return obj;

}();
// PhoneGap is ready
//
function onDeviceReady() {
  $('#compass').live('pageinit',
      function (event) {
        console.log("started watching compass");
        PGDemo.compass.startWatch();
      }).live('pagehide', function (event) {
        console.log("stop watching compass");
        PGDemo.compass.stopWatch();
      }
  );

  $('#accelerometer').live('pageinit',
      function (event) {
        console.log("started watching accelerometer");
        PGDemo.accelerometer.callback = function (accel) {
          $('#accel_x').text(accel.x);
          $('#accel_y').text(accel.y);
          $('#accel_z').text(accel.z);
          $('#accel_timestamp').text(accel.timestamp);
        };
        PGDemo.accelerometer.startWatch();
      }).live('pagehide', function (event) {
        console.log("stop watching accelerometer");
        PGDemo.compass.stopWatch();
        PGDemo.compass.callback = null;
      }
  );

  $('#camera').live('pageinit',
      function (event) {
        console.log("started camera");
        PGDemo.camera.callback = function (imageUri) {
          $('#camera_img').attr('src', imageUri);
        };
        $('#camera_button_normal').tap(function () {
          PGDemo.camera.getPicture({ quality:50, destinationType:Camera.DestinationType.FILE_URI });
        });
        $('#camera_button_edit').tap(function () {
          PGDemo.camera.getPicture({ quality:50, allowEdit:true, destinationType:Camera.DestinationType.FILE_URI });
        });
        $('#camera_button_library').tap(function () {
          PGDemo.camera.getPicture({ quality:50, allowEdit:true, source:1, destinationType:Camera.DestinationType.FILE_URI  });
        });


      }).live('pagehide', function (event) {
        console.log("stop camera");

      }
  );

  $('#connection').live('pageinit',
      function (event) {
        console.log("started connection");
        var status = PGDemo.connection.checkConnection();
        $('#connection_status').text(status);

      }).live('pagehide', function (event) {
        console.log("stop connection");

      }
  );


  $('#device').live('pageinit',
      function (event) {
        console.log("started device");

        $('#device_name').text(device.name);
        $('#device_phonegap').text(device.phonegap);
        $('#device_platform').text(device.platform);
        $('#device_uuid').text(device.uuid);
        $('#device_version').text(device.version);

      }).live('pagehide', function (event) {
        console.log("stop device");

      }
  );
  $('#geolocation').live('pageinit',
      function (event) {
        console.log("started watching geolocation");
        PGDemo.geolocation.callback = function (location) {
          $('#geo_lat').text(location.lat);
          $('#geo_long').text(location.lon);
          $('#geo_alt').text(location.alt);
          $('#geo_acc').text(location.accuracy);
          $('#geo_altacc').text(location.alt_accuracy);
          $('#geo_heading').text(location.heading);
          $('#geo_speed').text(location.speed);
          $('#geo_timestamp').text(location.timestamp);
        };
        PGDemo.geolocation.startWatch();


      }).live('pagehide', function (event) {
        console.log("stop watching geolocation");
        PGDemo.geolocation.stopWatch();
        PGDemo.geolocation.callback = null;
      }
  );


  $('#notification').live('pageinit',
      function (event) {
        console.log("started notifications");

        $('#notification_alert').tap(function () {
          navigator.notification.alert("I'm an alert", null, "PhoneGap Alert", "Done");
        });
        $('#notification_confirm').tap(function () {
          navigator.notification.confirm("Please Confirm", null, "PhoneGap Confirm", "Yes, No");
        });
        $('#notification_beep').tap(function () {
          navigator.notification.beep(3);
        });
        $('#notification_vibrate').tap(function () {
          navigator.notification.vibrate(1000);
        });

      }).live('pagehide', function (event) {
        console.log("stop notification");

      }
  );
}



