// Generated by CoffeeScript 1.6.3
(function() {
  var BackgroundTracking, Map, Ui, serverHost, serverPort,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  serverHost = "http://secondline-server.herokuapp.com";

  serverPort = 80;

  Map = (function() {
    function Map() {
      var center;
      center = new google.maps.LatLng(29.947877, -90.114755);
      this.marker = null;
      this.map = new google.maps.Map(document.getElementById("map-canvas"), {
        disableDefaultUI: true,
        draggable: false,
        zoom: 15,
        center: center,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      });
      this.route = new google.maps.KmlLayer({
        url: "http://mapsengine.google.com/map/u/0/kml?mid=zaIRRFV8XaRQ.k2GoQJ3ppZFs"
      });
      this.route.setMap(this.map);
    }

    Map.prototype.setPosition = function(lat, lng) {
      var position;
      if (this.marker != null) {
        this.marker.setMap(null);
        this.marker = null;
      }
      position = new google.maps.LatLng(lat, lng);
      this.marker = new google.maps.Marker({
        position: position,
        map: this.map,
        title: "position"
      });
      this.map.setCenter(position);
      return this.map.setZoom(15);
    };

    Map.prototype.clearPosition = function() {
      if (this.marker != null) {
        this.marker.setMap(null);
        return this.marker = null;
      }
    };

    return Map;

  })();

  Ui = (function() {
    function Ui() {
      this.onClear = __bind(this.onClear, this);
      this.onPosition = __bind(this.onPosition, this);
    }

    Ui.prototype.start = function() {
      this.map = new Map;
      this.socket = io.connect(serverHost, {
        transports: ["xhr-polling"],
        port: serverPort
      });
      this.socket.on("position", this.onPosition);
      this.socket.on("clear", this.onClear);
      return $("#position").text("Waiting for position..");
    };

    Ui.prototype.onPosition = function(position) {
      $("#position").html("Latitude: " + position.latitude + "<br/>\nLongitude: " + position.longitude);
      return this.map.setPosition(position.latitude, position.longitude);
    };

    Ui.prototype.onClear = function() {
      return this.map.clearPosition();
    };

    return Ui;

  })();

  BackgroundTracking = (function() {
    function BackgroundTracking() {
      this.onFailure = __bind(this.onFailure, this);
      this.onPosition = __bind(this.onPosition, this);
      var _ref;
      this.reportUrl = "" + serverHost + "/report";
      this.clearUrl = "" + serverHost + "/clear";
      window.navigator.geolocation.getCurrentPosition(function() {});
      this.bgGeo = ((_ref = window.plugins) != null ? _ref.backgroundGeoLocation : void 0) || {
        configure: function() {
          return console.log("geo configure");
        },
        start: function() {
          return console.log("geo start");
        },
        stop: function() {
          return console.log("geo stop");
        },
        finish: function() {
          return console.log("geo finish");
        }
      };
      this.bgGeo.configure(this.onPosition, this.onFailure, {
        url: this.reportUrl,
        desiredAccuracy: 0,
        stationaryRadius: 20,
        distanceFilter: 30
      });
    }

    BackgroundTracking.prototype.start = function() {
      var _this = this;
      $("#start").removeAttr("disabled");
      return $("#start").click(function() {
        if ($("#start").hasClass("btn-success")) {
          _this.bgGeo.start();
          return $("#start").removeClass("btn-success").addClass("btn-danger").text("Stop Tracking");
        } else {
          _this.bgGeo.stop();
          $("#position").text("Waiting for position..");
          $("#start").removeClass("btn-danger").addClass("btn-success").text("Start Tracking");
          return $.post(_this.clearUrl);
        }
      });
    };

    BackgroundTracking.prototype.onPosition = function(position) {
      $.post(this.reportUrl, {
        location: position
      }, null, "json");
      return this.bgGeo.finish();
    };

    BackgroundTracking.prototype.onFailure = function(error) {
      return console.log("error", error);
    };

    return BackgroundTracking;

  })();

  window.Tracker = (function() {
    function Tracker() {
      this.onReady = __bind(this.onReady, this);
      document.addEventListener("deviceready", this.onReady, false);
    }

    Tracker.prototype.onReady = function() {
      this.ui = new Ui;
      this.tracking = new BackgroundTracking;
      this.ui.start();
      return this.tracking.start();
    };

    return Tracker;

  })();

}).call(this);
