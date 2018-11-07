
// London Train station Class, I mean function :)
function TrainStation(data) {
    var self = this;

    self.name = ko.observable(data.name);
    self.zone = ko.observable(data.zone);
    self.position = { lat: data.latitude, lng: data.longitude }
    self.lat = ko.observable(data.latitude);
    self.lng = ko.observable(data.longitude);
    self.title = ko.observable(data.name + " - Zone: " + data.zone)

    // Define the Google Maps Markers for each station
    self.marker = new google.maps.Marker({
        map: map,
        position: self.position,
        title: self.title(),
        animation: google.maps.Animation.DROP,
    });

    // when clicked show user Station Name and Zone information
    self.marker.addListener('click', function () {
        populateInfoWindow(this, infowindow);
    } );

}


// Very similar function is defined in Udacity's Google Maps class.
// I pretty much adapted to my requirements
populateInfoWindow = function (marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
        infowindow.marker = marker;
        infowindow.setContent('<div>' + marker.title + '</div>');
        infowindow.open(map, marker);
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function () {
            infowindow.setMarker = null;
        });
    }
}

// Our Octopus, I mean ViewModel, the glue between View and Data
function TrainStationViewModel() {
    var self = this;
    self.stations = ko.observableArray([]);     // all available stations
    self.visibleStations = ko.observableArray([]);      // filtered stations
    self.filterQuery = ko.observable();     // this filter gets the input from user form

    // DATA COLLECTION

    // London stations data is located at Marquis de Geek api page for London Tube.
    // I used jQuery ajax moduel of getJSON to access the London Stations Data
    $.getJSON("http://marquisdegeek.com/api/tube/", function (allData) {
        var mappedStations = $.map(allData, function (item) { return new TrainStation(item) });
        self.stations(mappedStations);
        self.visibleStations(self.stations());  // when page first loads set all stations are visible
    });

    // OPERATIONS

    // Filter stations based on the input from user
    self.filterStations = function () {

        // Filter stations based on the filter
        self.visibleStations(self.stations().filter(station => station.name().toLowerCase().includes(self.filterQuery().toLowerCase())))

        // Remove all markers first or all stations and then only make
        // visible the ones filtered
        self.stations().forEach(element => {
            element.marker.setVisible(false)
        });

        // create a new LatLngBounds object, so we can focus on only filtered areas
        const bounds = new google.maps.LatLngBounds();
        self.visibleStations().forEach(element => {
            element.marker.setVisible(true)
            bounds.extend(element.marker.position)
        });
        // Ensure all stations are still visible after filtering
        map.fitBounds(bounds)
    };

    // Run when user clicks a station name
    self.filterOneStation = function (station) {
        self.filterQuery(station.name());
        self.filterStations();
    }

}

// initMap is required by GoogleMaps, it's a callback function,
function initMap() {
    const centralLondon = { lat: 51.521340, lng: -0.125527 }

    // Constructor creates a new map - only center and zoom are required
    map = new google.maps.Map(document.getElementById('map'), {
        center: centralLondon,
        zoom: 11
    });

    // Set the infowindow
    infowindow = new google.maps.InfoWindow();

    // Do the bindings for Knockout
    ko.applyBindings(new TrainStationViewModel());
}


