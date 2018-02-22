var MAPAPP = {};
MAPAPP.markers = [];
MAPAPP.currentInfoWindow;
MAPAPP.pathName = window.location.pathname;

//$(document).ready(function(req, res) {
function startFn(){
    initialize();
    populateMarkers(MAPAPP.pathName);
    alert("Ciaoooo"+document.getElementsByTagName('p')[1].innerHTML);
};

startFn();

//Initialize our Google Map
function initialize() {
    var center = new google.maps.LatLng('42.0095246017907', '12.0217482173469');//document.getElementsByTagName('p')[2].innerHTML,document.getElementsByTagName('p')[1].innerHTML);//('41.3944400645477', '13.8975237757149');
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
            var marker = new google.maps.Marker({
                map: map,
                position: new google.maps.LatLng('42.0095246017907', '12.0217482173469'),//document.getElementsByTagName('p')[2].innerHTML, document.getElementsByTagName('p')[1].innerHTML),
                city: document.getElementsByTagName('p')[3].innerHTML,
                street: document.getElementsByTagName('p')[4].innerHTML,
                housenumber: document.getElementsByTagName('p')[5].innerHTML,
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