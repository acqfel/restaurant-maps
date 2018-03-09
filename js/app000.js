//Google Maps code - initMap
var map;
var placeMarkers = [];
//var santos =  {lat: -23.986245, lng: -46.308371};
var nemo = {lat: 52.373809, lng: 4.912185};
var nemoPlaces = [];
var eetData = 0;
var indexArray = [];

function initMap() {
  // Constructor creates a new map - only center and zoom are required.
  console.log("init called");
  map = new google.maps.Map(document.getElementById('map'), {
    center: nemo,
    zoom: 20
  });
  console.log("maps ok");
  textSearchPlaces();
}

function textSearchPlaces() {
  var bounds = map.getBounds();
  var placesService = new google.maps.places.PlacesService(map);
  placesService.nearbySearch({
    location: nemo,
    radius: 800,
    type: ['restaurant']
  }, function(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        // store search results in Model
        nemoPlaces = results;
        // initialize the ViewModel
        initKO();
        createMarkersForPlaces(results);
    }
  });
}

function createMarkersForPlaces(places) {
  var bounds = new google.maps.LatLngBounds();
  for (var i = 0; i < places.length; i++) {
    var place = places[i];
    var icon = {
      url: place.icon,
      size: new google.maps.Size(35, 35),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(15, 34),
      scaledSize: new google.maps.Size(25, 25)
    };
    // Create a marker for each place.
    var marker = new google.maps.Marker({
      map: map,
      icon: icon,
      title: place.name,
      position: place.geometry.location,
      id: place.place_id
    });
    // Create a single infowindow to be used with the place details information
    // so that only one is open at once.
    var placeInfoWindow = new google.maps.InfoWindow();
    // If a marker is clicked, do a place details search on it in the next function.
    marker.addListener('click', function() {
      if (placeInfoWindow.marker == this) {
        console.log("This infowindow already is on this marker!");
      } else {
        getPlacesDetails(this, placeInfoWindow);
      }
    });
    placeMarkers.push(marker);
    if (place.geometry.viewport) {
      // Only geocodes have viewport.
      bounds.union(place.geometry.viewport);
    } else {
      bounds.extend(place.geometry.location);
    }
  }
  map.fitBounds(bounds);
}

function getPlacesDetails(marker, infowindow) {
  var service = new google.maps.places.PlacesService(map);
  service.getDetails({
    placeId: marker.id
  }, function(place, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      // Set the marker property on this infowindow so it isn't created again.
      infowindow.marker = marker;
      var innerHTML = '<div>';
      if (place.name) {
        innerHTML += '<strong>' + place.name + '</strong>';
      }
      if (place.formatted_address) {
        innerHTML += '<br>' + place.formatted_address;
      }
      // if (place.formatted_phone_number) {
      //   innerHTML += '<br>' + place.formatted_phone_number;
      // }
      // if (place.opening_hours) {
      //   innerHTML += '<br><br><strong>Hours:</strong><br>' +
      //       place.opening_hours.weekday_text[0] + '<br>' +
      //       place.opening_hours.weekday_text[1] + '<br>' +
      //       place.opening_hours.weekday_text[2] + '<br>' +
      //       place.opening_hours.weekday_text[3] + '<br>' +
      //       place.opening_hours.weekday_text[4] + '<br>' +
      //       place.opening_hours.weekday_text[5] + '<br>' +
      //       place.opening_hours.weekday_text[6];
      // }
      if (place.photos) {
        innerHTML += '<br><br><img src="' + place.photos[0].getUrl(
            {maxHeight: 100, maxWidth: 200}) + '">';
      }
      // Call function to get place details from EET API
      var lat = place.geometry.location.lat();
      var lng = place.geometry.location.lng();
      //eetDetails(lat,lng);
      //console.log(eetData);

      innerHTML += '</div>';
      infowindow.setContent(innerHTML);
      infowindow.open(map, marker);
      // Make sure the marker property is cleared if the infowindow is closed.
      infowindow.addListener('closeclick', function() {
        infowindow.marker = null;
      });
    }
  });
}

// Get place details from eet.nu API
function eetDetails(lat,lng) {
    // console.log(lat+" , "+lng);
    var eet = "";
    var eetUrl = "https://api.eet.nu/venues?max_distance=0.3&geolocation="+lat+","+lng;
    $.ajax({
        type: 'GET',
        url: eetUrl,
        headers: {
            "Accept":"application/json, application/vnd.eet-nu;ver=1"
        },
    	dataType: "jsonp",
        jsonp: "callback"
    }).done(function(data) {
        //console.log(data.results[0]);
        eet = data.results[0];
        //eet = "done";
        console.log(eet);
        //return eet;
        eetData = 555;
        alert( "success" );
    })
    .fail(function() {
        eetData = 0;
        alert( "error" );

    })
    .always(function() {
        eetData = 999;
        alert( "complete" );

    });
}

function openInfowindow(index){
    var marker = placeMarkers[index];
    var placeInfoWindow = new google.maps.InfoWindow();
    getPlacesDetails(marker, placeInfoWindow);
}

// function filteredMarkers(array) {
//   for (var i = 0; i < placeMarkers.length; i++) {
//     if (!array[i]) {
//       placeMarkers[i].setMap(map);
//     } else {
//       placeMarkers[i].setMap(null);
//     }
//   }
// }

function filteredMarkers(array) {
  for (var i = 0; i < placeMarkers.length; i++) {
    if (array[i]) {
      placeMarkers[i].setMap(map);
    } else {
      placeMarkers[i].setMap(null);
    }
  }
}

function showAllMarkers(){
    for (var i = 0; i < placeMarkers.length; i++) {
        placeMarkers[i].setMap(map);
    }
}

function hideAllMarkers(){
    for (var i = 0; i < placeMarkers.length; i++) {
        placeMarkers[i].setMap(null);
    }
}

// Knockout ViewModel code
var ViewModel = function() {
    var self = this;

    //console.log(nemoPlaces);
    this.placesList = ko.observableArray([]);
    this.input = ko.observable("");
    self.input.subscribe(function() {
        //alert("The person's new name is " + newValue);
        self.resetIndexArray();
    });

    // populate the observableArray placesList
    nemoPlaces.forEach(function(place) {
        //console.log(place.name);
        // self.placesList.push( {place:place.name, choice:true} );
        self.placesList.push(place.name);
    });
    console.log(self.placesList());

    // populate the indexArray
    this.populateArray = function(){
        for (var i=0; i < self.placesList().length; i++){
            indexArray.push(false);
        }
        console.log(indexArray);
    }
    self.populateArray();

    this.clickedPlace = function(item){
        console.log(item);
        var indexPlace = self.placesList.indexOf(item);
        console.log("i: "+indexPlace);
        openInfowindow(indexPlace);
    }

    this.search = function(data){
        var inputSearch = this.input();

        if (this.input() == ""){
            showAllMarkers();
            return true;
        }
        else {
            var regex = new RegExp(inputSearch, "i");
            if (regex.test(data)) {
                var index = self.placesList.indexOf(data);
                indexArray[index] = true;
                console.log(indexArray);
                filteredMarkers(indexArray);
                return true;
            }
            else {
                // for (var i = 0; i < indexArray.length; i++) {
                //     indexArray[i]=false;
                // }
                // console.log(indexArray);
                // filteredMarkers(indexArray);
                return false;
            }
        }
    }

    // reset the indexArray
    this.resetIndexArray = function (){
        indexArray = indexArray.map(function(item){
    	       return false;
        });
        //filteredMarkers(indexArray);
        hideAllMarkers();
        console.log("oi reset");
    }
};

function initKO(){
    ko.applyBindings(new ViewModel());
}
