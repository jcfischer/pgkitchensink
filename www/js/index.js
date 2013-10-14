var PGDemo = {};

////////////////////////////////////////////////////////////////////////////////
// Accelerometer demo

$(document).on('pageshow', '#accelerometer', function (event) {
    console.log("started watching accelerometer");
    PGDemo.accelerometer.callback = function (accel) {
        $('#accel_x').text(accel.x);
        $('#accel_y').text(accel.y);
        $('#accel_z').text(accel.z);
        $('#accel_timestamp').text(accel.timestamp);
    };
    PGDemo.accelerometer.startWatch();
});

$(document).on('pagehide', '#accelerometer', function (event) {
    console.log("stop watching accelerometer");
    PGDemo.compass.stopWatch();
    PGDemo.compass.callback = null;
});

PGDemo.accelerometer = function () {
    var x = null;
    var y = null;
    var z = null;
    var timestamp = null;

    var watchID = null;

    function startWatch() {
        var options = { 
            frequency:100 
        };
        watchID = navigator.accelerometer.watchAcceleration(accelerationChanged, accelerationError, options);
    }

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
            obj.callback({
                x: x, 
                y: y, 
                z: z, 
                timestamp: timestamp
            });
        }
    }

    function accelerationError(error) {
        console.log('Acceleration error: ' + error.code);
    }

    var obj = {
        callback: function (accel) {
            // To be provided by clients
        },
        startWatch: function () {
            startWatch();
        },
        stopWatch: function () {
            stopWatch();
        }
    };
    return obj;
}();

////////////////////////////////////////////////////////////////////////////////
// Camera demo

$(document).on('pageshow', '#camera', function (event) {
    console.log("started camera");
    PGDemo.camera.callback = function (imageUri) {
        $('#camera_img').attr('src', imageUri);
    };

    $('#camera_button_normal').tap(function () {
        PGDemo.camera.getPicture({ 
            quality: 50, 
            sourceType: Camera.PictureSourceType.CAMERA,
            destinationType: Camera.DestinationType.FILE_URI,
            cameraDirection: Camera.Direction.BACK,
            saveToPhotoAlbum: false
        });
    });

    $('#camera_button_edit').tap(function () {
        PGDemo.camera.getPicture({ 
            quality: 50, 
            allowEdit: true, 
            sourceType: Camera.PictureSourceType.CAMERA,
            destinationType: Camera.DestinationType.FILE_URI,
            cameraDirection: Camera.Direction.BACK,
            saveToPhotoAlbum: false
        });
    });

    $('#camera_button_library').tap(function () {
        PGDemo.camera.getPicture({ 
            quality: 50, 
            allowEdit: true, 
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            mediaType: Camera.MediaType.PICTURE,
            cameraDirection: Camera.Direction.BACK,
            saveToPhotoAlbum: false
        });
    });
});

$(document).on('pagehide', '#camera', function (event) {
    console.log("stop camera");
});

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
        console.log("Camera failed: " + message);
    }

    var obj = {
        callback: function (imageData) {
            // to be provided by client
            // $('#img').attr('src', "data:image/jpeg;base64," + imageData);
        },
        getPicture: function (options) {
            getPicture(options);
        }
    };
    return obj;
}();


////////////////////////////////////////////////////////////////////////////////
// Compass demo

$(document).on('pageshow', '#compass', function (event) {
    console.log("started watching compass");
    PGDemo.compass.startWatch();
});

$(document).on('pagehide', '#compass', function (event) {
    console.log("stop watching compass");
    PGDemo.compass.stopWatch();
});

PGDemo.compass = function () {
    // The watch id references the current `watchHeading`
    var watchID = null;

    // Start watching the compass
    function startWatch() {
        // Update compass every 1 seconds
        var options = { 
            frequency: 200 
        };
        watchID = navigator.compass.watchHeading(headingChanged, headingError, options);
    }

    // Stop watching the compass
    function stopWatch() {
        if (watchID) {
            navigator.compass.clearWatch(watchID);
            watchID = null;
        }
    }

    // onSuccess: Get the current heading
    function headingChanged(heading) {
        $('#compass #heading').html(Math.floor(heading.magneticHeading));
        // rotate(45deg)
        $('#compass #compass_img').css('-webkit-transform', "rotate(" + (360 - heading.magneticHeading) + "deg)");
    }

    // onError: Failed to get the heading
    function headingError(compassError) {
        console.log('Compass error: ' + compassError.code);
    }

    return {
        startWatch: function () {
            startWatch();
        },
        stopWatch: function () {
            stopWatch();
        }
    };
}();

////////////////////////////////////////////////////////////////////////////////
// Contacts demo

$(document).on('pageinit', '#contacts', function (event) {
    console.log('started contacts');
    var options = new ContactFindOptions();
    options.multiple = true;
    options.filter = "";
    var fields = ["id", "displayName", "name"];
    navigator.contacts.find(fields, function(contacts) {
        // This callback is executed when the contacts have been retrieved!
        // The contacts parameter is simply an array of objects
        // with the specified fields

        // The contacts array is not ordered... so we have to do that!
        contacts.sort(function (a, b) {
            // This is adapted from
            // http://stackoverflow.com/questions/4041762/iterating-over-a-javascript-object-in-sort-order-based-on-particular-key-value-o
            var an = a.name.formatted;
            var bn = b.name.formatted; 

            return an == bn ? 0 : (an > bn ? 1 : -1); 
        });

        var createTapHandler = function(contact) {
            return function () {
                console.log('looking for ' + contact.name.formatted);
                var opts = new ContactFindOptions();
                opts.multiple = false;
                opts.filter = contact.id.toString();
                var fields = ["id", "displayName", "name", "emails", "phoneNumbers"];
                navigator.contacts.find(fields, function(contacts) {
                    console.log('found ' + contacts.length + ' contacts');
                    var person = contacts[0];
                    console.log('found ' + person.name.formatted);
                    $.mobile.changePage('#contactdetail');

                    var data = [];
                    data.push(person.name.formatted);

                    var index = 0;
                    var len = 0;

                    if (person.emails) {
                        for (index = 0, len = person.emails.length; index < len; ++index) {
                            console.log(person.emails[index]);
                            data.push(person.emails[index].value);
                        }
                    }

                    if (person.phoneNumbers) {
                        for (index = 0, len = person.phoneNumbers.length; index < len; ++index) {
                            console.log(person.phoneNumbers[index]);
                            data.push(person.phoneNumbers[index].value);
                        }
                    }

                    index = 0;
                    len = 0;
                    var list = $('#contactdata');
                    list.empty();
                    for (index = 0, len = data.length; index < len; ++index) {
                        var datum = data[index];
                        var newLi = $('<li>');
                        var newA = $('<a>');
                        newA.append(datum);
                        newLi.append(newA);
                        list.append(newLi);
                    }
                    list.listview('refresh');
                }, null, opts);
            };
        };

        var index = 0;
        var len = 0;
        var list = $('#contactslist');
        list.empty();
        console.log("number of items: " + contacts.length);
        for (index = 0, len = contacts.length; index < len; ++index) {
            var contact = contacts[index];
            var newLi = $('<li>');
            var newA = $('<a>');
            newA.append(contact.name.formatted);
            newLi.append(newA);
            newLi.on('tap', createTapHandler(contact));
            list.append(newLi);
        }
        list.listview('refresh');

    }, null, options);
});


////////////////////////////////////////////////////////////////////////////////
// Connection demo

$(document).on('pageinit', '#connection', function (event) {
    console.log("started connection");
    var status = PGDemo.connection.checkConnection();
    $('#connection_status').text(status);
});

$(document).on('pagehide', '#connection', function (event) {
    console.log("stop connection");
});

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

////////////////////////////////////////////////////////////////////////////////
// Device demo

$(document).on('pageinit', '#device', function (event) {
    console.log("started device");

    $('#device_name').text(device.name);
    $('#device_phonegap').text(device.phonegap);
    $('#device_platform').text(device.platform);
    $('#device_uuid').text(device.uuid);
    $('#device_version').text(device.version);
});

$(document).on('pagehide', '#device', function (event) {
    console.log("stop device");
});

////////////////////////////////////////////////////////////////////////////////
// File demo

$(document).on('pageinit', '#file', function () {

    function failure(error) {
        console.log('error: ' + error.code + ', message: ' + error.message);    
    }

    $('#createFileButton').hide();
    $('#readFileButton').hide();
    $('#fileInfoButton').hide();
    $('#deleteFileButton').hide();

    var fileSystem = null;
    var path = 'file.txt'; 
    var texts = [
        "abcdefghijklmnopqrstuvwxyz\nABCDEFGHIJKLMNOPQRSTUVWXYZ\n1234567890\n!@#$%^&*()_-+={}[];'\\:\"|<>?,./",
        "The quick brown fox jumps over a lazy dog.", 
        "Zwei Boxkämpfer jagen Eva quer durch Sylt.",
        "Pchnąć w tę łódź jeża lub osiem skrzyń fig. Żywioł, jaźń, Świerk.", 
        "Flygande bäckasiner söka strax hwila på mjuka tuvor.",
        "Lorem ipsum dolor sit er elit lamet, consectetaur cillium adipisicing pecu, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        "PhoneGap rocks!",
        "Mobile web apps rock!",
        "This code generates random files",
        "This application is brought to you by http://mobile-training.ch/"
    ];

    // This better number generator comes from
    // http://davidbau.com/archives/2010/01/30/random_seeds_coded_hints_and_quintillions.html
    Math.seedrandom();

    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) { 
        console.log('file system ready');
        fileSystem = fs;
        $('#createFileButton').show();
    }, failure);

    $('#createFileButton').on('tap', function () {
        if (fileSystem) {
            fileSystem.root.getFile(path, {create: true}, function (fileEntry) { 
                console.log('file got');
                fileEntry.createWriter(function (writer) {

                    var index = Math.floor(Math.random() * 10);
                    var selectedText = texts[index];

                    writer.onwriteend = function (evt) {
                        console.log('file written!');
                        $('#fileOutput').empty();
                        $('#fileOutput').append('File ready to be read!');
                        $('#createFileButton').hide();
                        $('#readFileButton').show();
                        $('#fileInfoButton').show();
                        $('#deleteFileButton').show();
                    };
                    writer.write(selectedText);

                }, failure);
            }, failure);
        }
    });

    $('#readFileButton').on('tap', function () {
        if (fileSystem) {
            fileSystem.root.getFile(path, {create: true}, function (fileEntry) {
                console.log('file got, ready to be read');
                fileEntry.file(function (file) {
                    var reader = new FileReader();
                    reader.onloadend = function(evt) {
                        console.log("Read as text");
                        var text = reader.result;
                        $('#fileOutput').empty();
                        $('#fileOutput').append(text);
                    };
                    reader.readAsText(file);
                }, failure);
            }, failure);
        }
    });

    $('#fileInfoButton').on('tap', function () {
        if (fileSystem) {
            fileSystem.root.getFile(path, {create: true}, function (fileEntry) {
                console.log('file got, ready to get info');
                fileEntry.file(function (file) {
                    var data = [
                        'Full path: ' + file.fullPath,
                        'MIME type: ' + file.type,
                        'Modified on: ' + file.lastModifiedDate,
                        'Size: ' + file.size
                    ];
                    var info = data.join('<br>');
                    $('#fileOutput').empty();
                    $('#fileOutput').append(info);
                }, failure);
            }, failure);
        }
    });

    $('#deleteFileButton').on('tap', function () {
        if (fileSystem) {
            fileSystem.root.getFile(path, { create: true }, function (fileEntry) {
                console.log('file got, ready to be removed');
                fileEntry.remove(function() {
                    console.log('file removed!');
                    $('#fileOutput').empty();
                    $('#fileOutput').append('File deleted');
                    $('#createFileButton').show();
                    $('#readFileButton').hide();
                    $('#fileInfoButton').hide();
                    $('#deleteFileButton').hide();
                }, failure);
            }, failure);
        }
    });
});

////////////////////////////////////////////////////////////////////////////////
// Geolocation demo

$(document).on('pageinit', '#geolocation', function (event) {
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
});

$(document).on('pagehide', '#geolocation', function (event) {
    console.log("stop watching geolocation");
    PGDemo.geolocation.stopWatch();
    PGDemo.geolocation.callback = null;
});

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
            obj.callback({
                lat: lat, 
                lon: lon, 
                alt: alt,
                accuracy: accuracy, 
                alt_accuracy: alt_accuracy,
                heading: heading, 
                speed: speed,
                timestamp: timestamp
            });
        }
    }

    function positionError(locationError) {
        console.log('Geolocation error: ' + locationError.code);
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

////////////////////////////////////////////////////////////////////////////////
// Media demo

$(document).on('pageinit', "#media", function (event) {
    PGDemo.media.init();

    $("#recordButton").on('click', function (event) {
        PGDemo.media.record();
    });

    $('#stopButton').on('click', function (event) {
        PGDemo.media.stop();
    });

    $('#playButton').on('click', function (event) {
        PGDemo.media.play();
    });

});

$(document).on('pageshow', '#media', function () {
    PGDemo.media.show();
});

$(document).on('pagehide', '#media', function () {
    PGDemo.media.hide();
});

PGDemo.media = function() {
    var recording = false;
    var soundFile = null;
    var path = 'recording.wav'; 

    function failure(error) {
        console.log('error: ' + error.code + ', message: ' + error.message);    
    }

    function success() {
        console.log('media ready - success');
        $('#recordButton').show();
        $('#stopButton').hide();
        $('#playButton').show();
    }

    return {
        init: function() {
            $('#recordButton').hide();
            $('#stopButton').hide();
            $('#playButton').hide();
        },

        show: function () {
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSystem) { 
                console.log('file system requested');
                fileSystem.root.getFile(path, {create: true}, function (fileEntry) { 
                    console.log('file got');
                    soundFile = new Media(fileEntry.fullPath, success, failure); 
                    $('#recordButton').show();
                }, failure);
            }, failure);
        },

        record: function () {
            if (soundFile) {
                $('#recordButton').hide();
                $('#stopButton').show();
                $('#playButton').hide();
                recording = true;
                soundFile.startRecord();
                console.log('recording started');
            }
        },

        play: function () {
            if (soundFile) {
                $('#recordButton').hide();
                $('#stopButton').show();
                $('#playButton').hide();
                recording = false;
                soundFile.play();
                console.log('file playing');
            }
        },

        stop: function () {
            if (soundFile) {
                $('#recordButton').show();
                $('#stopButton').hide();
                $('#playButton').show();
                if (recording) {
                    soundFile.stopRecord();
                    console.log('recording stopped');
                    recording = false;
                }
                else {
                    soundFile.stop();
                    console.log('playback stopped');
                }
            }
        },

        hide: function () {
            if (soundFile) {
                soundFile.release();
                soundFile = null;
            }
        }
    };
}();


////////////////////////////////////////////////////////////////////////////////
// Notification demo

$(document).on('pageinit', '#notification', function (event) {
    console.log("started notifications");

    $('#notification_alert').tap(function () {
        navigator.notification.alert("I'm an alert", function () {
            console.log('The alert has been dismissed');
        }, "PhoneGap Alert", "Done");
    });
    $('#notification_confirm').tap(function () {
        navigator.notification.confirm("Please Confirm", function (button) {
            console.log('The confirmation was dismissed, ' + button + ' was pressed');
        }, "PhoneGap Confirm", "Yes, No");
    });
    $('#notification_beep').tap(function () {
        navigator.notification.beep(3);
    });
    $('#notification_vibrate').tap(function () {
        navigator.notification.vibrate(1000);
    });

});

$(document).on('pagehide', '#notification', function (event) {
    console.log("stop notification");
});

////////////////////////////////////////////////////////////////////////////////
// Storage demo

$(document).on('pageinit', '#storage', function () {
    PGDemo.storage.init();

    $('#storeButton').on('tap', function () {
        PGDemo.storage.store();
    });

    $('#readButton').on('tap', function () {
        PGDemo.storage.read();
    });
});

PGDemo.storage = function () {
    var texts = [
        "abcdefghijklmnopqrstuvwxyz\nABCDEFGHIJKLMNOPQRSTUVWXYZ\n1234567890\n!@#$%^&*()_-+={}[]",
        "The quick brown fox jumps over a lazy dog.", 
        "Zwei Boxkämpfer jagen Eva quer durch Sylt.",
        "Pchnąć w tę łódź jeża lub osiem skrzyń fig. Żywioł, jaźń, Świerk.", 
        "Flygande bäckasiner söka strax hwila på mjuka tuvor.",
        "Lorem ipsum dolor sit er elit lamet, consectetaur cillium adipisicing pecu, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        "PhoneGap rocks!",
        "Mobile web apps rock!",
        "This code generates random files",
        "This application is brought to you by http://mobile-training.ch/"
    ];

    return {
        init: function() {
            console.log('in the pageinit of the storage');

            // This better number generator comes from
            // http://davidbau.com/archives/2010/01/30/random_seeds_coded_hints_and_quintillions.html
            Math.seedrandom();

            // By default, the read button is hidden; it is shown as soon as
            // all the data is written in the DB
            $('#readButton').hide();
        },

        store: function () {
            // Use the localStorage  & sessionStorage to store some strings
            var index = Math.floor(Math.random() * 10);
            var selectedText = texts[index];
            window.localStorage['someString'] = selectedText;
            window.sessionStorage['someString'] = selectedText;
            console.log('after storing, now go for the sql');

            // Now store the same data in a SQL database
            var db = window.openDatabase('database', '1.0', 'PGKitchenSink', 200000);
            db.transaction(function(tx) {
                console.log('populating database');
                tx.executeSql('DROP TABLE IF EXISTS RANDOMTEXT');
                tx.executeSql('CREATE TABLE IF NOT EXISTS RANDOMTEXT (id unique, data)');
                tx.executeSql('INSERT INTO RANDOMTEXT (id, data) VALUES (1, \"' + selectedText + '\")');
            }, function(err) {
                console.log('error: ' + err.code + ', message: ' + err.message);    
            }, function() {
                console.log('database OK');

                $('#readButton').show();
                $('#localDataOutput').empty();
                $('#sessionDataOutput').empty();
                $('#dbDataOutput').empty();
                $('#localDataOutput').append('localStorage has new data');
                $('#sessionDataOutput').append('sessionStorage has new data');
                $('#dbDataOutput').append('db has new data');
            });
        },

        read: function() {
            console.log('ready to read');
            var localText = window.localStorage.someString;
            var sessionText = window.sessionStorage.someString;
            var dbText = '';

            // To get the data from the database it's a little more
            // complicated

            function error(err) {
                console.log('error: ' + err.code + ', message: ' + err.message);    
            }

            var db = window.openDatabase('database', '1.0', 'PGKitchenSink', 200000);
            db.transaction(function(tx) {
                console.log('ready to select *');
                tx.executeSql('SELECT * FROM RANDOMTEXT', [], function(tx, results) {
                    console.log('success! reading data');
                    var length = results.rows.length;
                    console.log('numbers of rows: ' + length);
                    if (length > 0) {
                        dbText = results.rows.item(0).data;
                        console.log('text: ' + dbText);

                        $('#localDataOutput').empty();
                        $('#sessionDataOutput').empty();
                        $('#dbDataOutput').empty();
                        $('#localDataOutput').append('localStorage: ' + localText);
                        $('#sessionDataOutput').append('sessionStorage: ' + sessionText);
                        $('#dbDataOutput').append('db: ' + dbText);
                    }
                }, error);
            }, error);
        }
    };
}();

