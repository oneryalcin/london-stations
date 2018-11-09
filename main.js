//Bicycle Station Model
function BorisBikeStation(data) {
    let self = this
    this.name = data.commonName;
    // this.lat = data.lat;
    // this.lng = data.lon;
    this.position = { lat: data.lat, lng: data.lon }

    getAdditionalBikeStationData = function (self, data) {
        for (elem of data.additionalProperties) {
            if (elem.key == 'NbBikes') {
                self.avaliableBikesCount = parseInt(elem.value);
            } else if (elem.key == 'NbEmptyDocks') {
                self.emptyDocksCount = parseInt(elem.value);
            } else if (elem.key == 'NbDocks') {
                self.dockCount = parseInt(elem.value)
            }
        }
    }(self, data)
    // this.getAdditionalBikeStationData(data);
}


// London Train station Model
function TrainStation(data) {
    const self = this;

    // self.name = ko.observable(data.name);
    self.name = data.name;
    self.zone = data.zone;
    // self.lat = data.longitude;
    // self.lng = data.latitude;
    self.position = { lat: data.latitude, lng: data.longitude }
    self.title = data.name + " - Zone: " + data.zone

    // Define the Google Maps Markers for each station
    self.marker = new google.maps.Marker({
        map: map,
        position: self.position,
        title: self.title,
        animation: google.maps.Animation.DROP,
    });

    // when clicked show user Station Name and Zone information
    self.marker.addListener('click', function () {
        populateInfoWindow(this, infowindow);
    } );

}

const getNearbyBikeStations = function (marker) {
    let bikeStations = JSON.parse(localStorage.getItem('borisBikeStations'))
    let filteredStations = bikeStations.filter(function(station) {
        return (Math.abs(marker.position.lat() - station.position.lat) < 0.005) && (Math.abs(marker.position.lng() - station.position.lng) < 0.005)
    })
    return filteredStations

}

populateInfoWindowContent = function (marker, nearbyBikeStations) {
    let bikeInfo = ""
    let stationInfo = `<div> <h4 class="mb-2"> ${marker.title}</h4> </div >`
    if (nearbyBikeStations.length > 0) {
        for(const bikeStation of nearbyBikeStations) {
            let progress = (bikeStation.avaliableBikesCount / bikeStation.dockCount)* 100
            bikeInfo = bikeInfo + `<div class="row">
            <p class="col-6 mb-1 text-truncate">${bikeStation.name}</p>
            <div class="col-6 d-flex flex-row bd-highlight mb-1 justify-content-end">
                <div class="flex-row">
                    <i class="fas fa-bicycle"></i> <span>${bikeStation.avaliableBikesCount}</span>
                </div>
                <div class="ml-2">
                    <i class="fas fa-parking"></i> <span>${bikeStation.dockCount}</span>
                </div>
            </div>
        </div>
        <div class="progress">
            <div class="progress-bar" role="progressbar" style="width: ${progress}%" aria-valuenow="${progress}" aria-valuemin="0"
                aria-valuemax="100"></div>
        </div>`
        }
    } else {
        bikeInfo = `<p>There is no nearby Boris Bike</p>`
    }
    return stationInfo + bikeInfo
}
// Very similar function is defined in Udacity's Google Maps class.
// I pretty much adapted to my requirements
populateInfoWindow = function (marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
        infowindow.marker = marker;
        const nearbyBikeStations = getNearbyBikeStations(marker);
        const infoWindowContent = populateInfoWindowContent(marker, nearbyBikeStations);
        // infowindow.setContent('<div>' + marker.title + '</div>');
        infowindow.setContent(infoWindowContent);
        infowindow.open(map, marker);

        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function () {
            infowindow.setMarker = null;
        });
    }
}


// Our Octopus, I mean ViewModel, the glue between View and Data
function TrainStationViewModel() {
    const self = this;
    self.stations = ko.observableArray([]);     // all available stations
    self.borisBikeStations = queryBorisBikeData(self);
    self.visibleStations = ko.observableArray([]);      // filtered stations
    self.filterQuery = ko.observable();     // this filter gets the input from user form

    // DATA COLLECTION

    // London stations data is located at Marquis de Geek api page for London Tube.
    // I used jQuery ajax moduel of getJSON to access the London Stations Data
    $.getJSON("http://marquisdegeek.com/api/tube/")
        .done(function (allData) {
            const mappedStations = $.map(allData, function (item) { return new TrainStation(item) });
            self.stations(mappedStations);
            self.visibleStations(self.stations());  // when page first loads set all stations are visible
        })
        .fail(function (jqxhr, textStatus, error) {
            const err = "Error happened while retrieving data: " + textStatus + ", " + error;
            alert(err)
        });

    // OPERATIONS

    // Filter stations based on the input from user
    self.filterStations = function () {

        // Filter stations based on the filter
        self.visibleStations(self.stations().filter(station => station.name.toLowerCase().includes(self.filterQuery().toLowerCase())))

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
        if (self.visibleStations().length > 0) {
            // Ensure all stations are still visible after filtering
            map.fitBounds(bounds)
        } else {
            // filter returns no data points, set the map center to London city center
            map.setCenter({ lat: 51.521340, lng: -0.125527 });
            map.setZoom(11);
        }

    };

    // Run when user clicks a station name
    self.filterOneStation = function (station) {
        self.filterQuery(station.name);
        self.filterStations();
    }

}



// Get latest TFL Data for BorisBike Docking stations.
// When user clicks a station marker we'll display nearby bike stations together with availability.
queryBorisBikeData = function () {

    $.getJSON("https://api.tfl.gov.uk/bikepoint")
        .done(function (allBikeData) {
            const borisBikeStations = $.map(allBikeData, function (bikeData) { return new BorisBikeStation(bikeData) })
            localStorage.setItem('borisBikeStations', JSON.stringify(borisBikeStations));
        });
}

// queryTrainStationsData = function () {
//     $.getJSON("http://marquisdegeek.com/api/tube/")
//         .done(function (allData) {
//             const mappedStations = $.map(allData, function (item) { return new TrainStation(item) });
//             localStorage.setItem('mappedStations', JSON.stringify(mappedStations));
//         })
//         .fail(function (jqxhr, textStatus, error) {
//             const err = "Error happened while retrieving data: " + textStatus + ", " + error;
//             alert(err)
//         });
// }

// initMap is required by GoogleMaps, it's a callback function,
function initMap() {
    const centralLondon = { lat: 51.521340, lng: -0.125527 }

    // Constructor creates a new map - only center and zoom are required
    map = new google.maps.Map(document.getElementById('map'), {
        center: centralLondon,
        zoom: 11
    });

    // Get Bike data
    queryBorisBikeData();

    // Set the infowindow
    infowindow = new google.maps.InfoWindow();

    // Do the bindings for Knockout
    ko.applyBindings(new TrainStationViewModel());
}
