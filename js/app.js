var map;
var placeMarkers = [];
// NEMO Science Museum location
var nemo = {lat: 52.373809, lng: 4.912185};
// Stores places found by PlacesServices - Google Places API
var nemoPlaces = [];
// a boolean vector that represents which items meet the filter criteria
var indexArray = [];

window.addEventListener('error', function(event) {
    console.log(event);
});

//Google Maps code - initMap
function initMap() {
  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: nemo,
    zoom: 20
  });
  searchPlaces();
}

// Use the Google Places API to find 20 restaurants,
// within 500 meters of the NEMO Science Museum.
function searchPlaces() {
  var bounds = map.getBounds();
  var placesService = new google.maps.places.PlacesService(map);
  placesService.nearbySearch({
    location: nemo,
    radius: 500,
    type: ['restaurant']
  }, function(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        // store search results in Model
        nemoPlaces = results;
        // initialize the ViewModel Knockout
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

    /*jshint -W083 */
    // If a marker is clicked, do a place details search on it in the next function.
    marker.addListener('click', function() {
        // Animation Marker - jumps after it has been clicked
        jumpMarker(this);
        // Checks whether the current marker is selected and calls the getPlacesDetails()
        if (placeInfoWindow.marker == this) {
            console.log("This infowindow already is on this marker!");
        } else {
            getPlacesDetails(this, placeInfoWindow);
        }
    });
    /*jshint +W083 */

    // Add each marker to array placeMarkers
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

//  jumps after it has been clicked
function jumpMarker(marker) {
    console.log('jump');
  marker.setAnimation(google.maps.Animation.BOUNCE);
  window.setTimeout(function() {
      marker.setAnimation(null);
  }, 800);
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

      if (place.photos) {
        innerHTML += '<br><br><img src="' + place.photos[0].getUrl(
            {maxHeight: 100, maxWidth: 200}) + '">';
      }
      // Call function to get place details from EET API
      var lat = place.geometry.location.lat();
      var lng = place.geometry.location.lng();
      var placeName = place.name;
      innerHTML += '</div>';

      eetDetails(lat,lng,placeName,innerHTML,map, marker,infowindow);

      // Make sure the marker property is cleared if the infowindow is closed.
      infowindow.addListener('closeclick', function() {
        infowindow.marker = null;
      });
    }
  });
}

// Get place details from eet.nu API
function eetDetails(lat,lng,placeName,innerHTML,map,marker,infowindow) {
    var eetUrl = "https://api.eet.nu/venues?query="+placeName+"&max_distance=0.3&geolocation="+lat+","+lng;
    $.ajax({
        type: 'GET',
        url: eetUrl,
        headers: {
            "Accept":"application/json, application/vnd.eet-nu;ver=1"
        },
    	dataType: "jsonp",
        jsonp: "callback"
    }).done(function(data) {
        console.log("success" );
        if (data.results[0]) {
            var strLength = data.results[0].name.length;
            var strStart = data.results[0].name.substring(0,3);
            var strEnd = data.results[0].name.substring(strLength-3);
            var regexStart = new RegExp(strStart, "i");
            var regexEnd = new RegExp(strEnd, "i");
            // check if eet.nu place is the same place from Google Places API
            if (regexStart.test(placeName) || regexEnd.test(placeName)) {
                // Add colected information from EET in innerHTML
                innerHTML += "<div>Info provided by ";
                innerHTML += "<img width='36' height='15' src='css/logo-purple.svg' alt='eet-logo'></div>";

                if(data.results[0].website_url){
                    innerHTML += "<div>more details - eet.nu <a href="+data.results[0].url+" target='_blank'>";
                    innerHTML += "link</a></div>";
                }

                innerHTML += "<div><strong>"+data.results[0].name+"</strong></div>";

                if(data.results[0].telephone){
                    innerHTML += "<div>"+data.results[0].telephone+"</div>";
                }

                if(data.results[0].website_url){
                    innerHTML += "<div><a href="+data.results[0].website_url+" target='_blank'>";
                    innerHTML +=data.results[0].website_url+"</a></div>";
                }
            }
        } else {
            innerHTML += "<div>eet.nu info <br>unavailable</div>";
        }
        infowindow.setContent(innerHTML);
        infowindow.open(map, marker);

    })
    .fail(function(jqXHR, textStatus) {
        console.log(jqXHR);
        console.log("text status: "+textStatus);
        // message that eet.nu did not load
        errorEet();
        // If the eet.nu API is not available then Infowindow
        // is only displayed with Google Places API information.
        innerHTML += "<div>eet.nu info <br>unavailable</div>";
        infowindow.setContent(innerHTML);
        infowindow.open(map, marker);
    })
    .always(function(jqXHR, textStatus, errorThrown) {
        console.log("text status: "+textStatus);
    });
}

// If any item in the list of places is clicked,
// the corresponding Infowindow is displayed.
function openInfowindow(index){
    var marker = placeMarkers[index];
    jumpMarker(marker);
    var placeInfoWindow = new google.maps.InfoWindow();
    getPlacesDetails(marker, placeInfoWindow);
}

// Displays only the places in the list that meet the filter criteria.
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

// If an error occurs in the script that loads the Google Maps API,
// the function is called and an alert message is displayed to the user.
function errorMaps() {
    alert("Google Maps API is currently unavailable, please try again later");
}

// Displays error message if the eet.nu API does not load.
function errorEet() {
    alert("eet.nu API doesn’t load");
}

// Knockout ViewModel code
var ViewModel = function() {
    var self = this;

    this.placesList = ko.observableArray([]);
    this.input = ko.observable("");
    self.input.subscribe(function() {
        self.resetIndexArray();
    });
    this.menuPosition = ko.observable(false);

    // Function to show / hide the menu
    this.changeMenu = function() {
        if (self.menuPosition()) {
            self.menuPosition(false);
        }
        else {
            self.menuPosition(true);
        }
    };

    // populate the observableArray placesList
    nemoPlaces.forEach(function(place) {
        self.placesList.push(place.name);
    });
    //console.log(self.placesList());

    // populate the indexArray
    this.populateArray = function(){
        for (var i=0; i < self.placesList().length; i++){
            indexArray.push(false);
        }
    };
    self.populateArray();

    // after a place list item is clicked,
    // the index is stored and sent to the function openInfowindow
    this.clickedPlace = function(item){
        console.log(item);
        var indexPlace = self.placesList.indexOf(item);
        console.log("i: "+indexPlace);
        openInfowindow(indexPlace);
    };

    // Filters the list of places and
    // displays only those that match what was typed by the user
    this.search = function(data){
        var inputSearch = this.input();

        if (this.input() === ""){
            showAllMarkers();
            return true;
        }
        else {
            var regex = new RegExp(inputSearch, "i");
            if (regex.test(data)) {
                var index = self.placesList.indexOf(data);
                indexArray[index] = true;
                filteredMarkers(indexArray);
                return true;
            }
            else {
                return false;
            }
        }
    };

    // reset the indexArray
    this.resetIndexArray = function (){
        indexArray = indexArray.map(function(item){
    	       return false;
        });
        hideAllMarkers();
    };
};

function initKO(){
    ko.applyBindings(new ViewModel());
}
