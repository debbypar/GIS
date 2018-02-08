//Create a single global variable
//var queryResult = require('queryResult');

//exports.start = startFn;

var MAPAPP = {};
MAPAPP.markers = [];
MAPAPP.currentInfoWindow;
MAPAPP.pathName = window.location.pathname;
//MAPAPP.resultQuery = queryResult;

//$(document).ready(function(req, res) {
function startFn() {
    initialize();
    populateMarkers(MAPAPP.pathName);
    console.log("Readyyyyyy\n");
    alert("Ciaoooo"+document.getElementsByTagName('p')[6].innerHTML);
};

startFn();

//Initialize our Google Map
function initialize() {
  //  alert(document.getElementsByName('x').length);


    var center = new google.maps.LatLng(41.887784,12.5434775);
    var mapOptions = {
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        center: center,
    };
    this.map = new google.maps.Map(document.getElementById('map_canvas'),
        mapOptions);
};

// Fill map with markers
function populateMarkers(dataType) {
    console.log("Dentro populate markers\n");
 //   apiLoc = typeof apiLoc !== 'undefined' ? apiLoc : '/data/address.json';
    // jQuery AJAX call for JSON
//    $.getJSON(apiLoc, function(data) {
        //For each item in our JSON, add a new map marker
 //       $.each(data, function(i, ob) {
            var marker = new google.maps.Marker({
                map: map,
                position: new google.maps.LatLng(document.getElementsByTagName('p')[3].innerHTML, document.getElementsByTagName('p')[2].innerHTML),
                city: document.getElementsByTagName('p')[4].innerHTML,
                street: document.getElementsByTagName('p')[5].innerHTML,
                housenumber: document.getElementsByTagName('p')[6].innerHTML,
                icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
            });
    	//Build the content for InfoWindow
            var content = '<h1 class="mt0"><a href="www.google.it">' + marker.street + '</a></h1><p>' + marker.housenumber + '</p>';
        	marker.infowindow = new google.maps.InfoWindow({
            	content: content,
            	maxWidth: 400
            });
    	//Add InfoWindow
            google.maps.event.addListener(marker, 'click', function() {
                if (MAPAPP.currentInfoWindow) MAPAPP.currentInfoWindow.close();
                marker.infowindow.open(map, marker);
                MAPAPP.currentInfoWindow = marker.infowindow;
            });
            MAPAPP.markers.push(marker);
//        });
//    });
};
