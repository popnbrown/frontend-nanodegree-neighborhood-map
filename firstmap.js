var map, bounds;

var stationsList = [
		{
			'name': 'City of Chicago FS#1',
			'intersection': 'Throop and Wabansia',
			'lat': '41.9138946',
			'long': '-87.6618722'
		},
		{
			'name': 'City of Chicago FS#2',
			'intersection': 'Devon and Ravenswood',
			'lat': '41.9992536',
			'long': '-87.6750237'
		},
		{
			'name': 'City of Chicago FS#202',
			'intersection': '63rd and Laramie',
			'lat': '41.9992536',
			'long': '-87.6750237'
		},
		{
			'name': 'City of Chicago FS#205',
			'intersection': 'Belmont & Western',
			'lat': '41.9408093',
			'long': '-87.6904015'
		},
		{
			'name': 'City of Chicago FS#3',
			'intersection': 'Ferdinand and Tripp',
			'lat': '41.8893383',
			'long': '-87.7303848'
		},
		{
			'name': 'City of Chicago FS#4',
			'intersection': 'Iron and 37th',
			'lat': '41.8257961',
			'long': '-87.6593772'
		},
		{
			'name': 'City of Chicago FS#5',
			'intersection': 'Sunnyside and Lamon',
			'lat': '41.9625133',
			'long': '-87.7490375'
		},
		{
			'name': 'City of Chicago FS#6',
			'intersection': '101st and Stony Island',
			'lat': '41.712605',
			'long': '-87.58196'
		},
		{
			'name': 'City of Chicago FS#7',
			'intersection': "O'Hare Airport",
			'lat': '41.9593847',
			'long': '-87.8394486999999'
		},
		{
			'name': 'City of Chicago FS#8',
			'intersection': '104th and Vincennes',
			'lat': '41.7040122',
			'long': '-87.6570639'
		},
		{
			'name': 'City of Chicago FS#9',
			'intersection': '65th and State',
			'lat': '41.776407',
			'long': '-87.6262225999999'
		},
		{
			'name': 'University of Illinois at Chicago',
			'intersection': 'Roosevelt and Morgan',
			'lat': '41.864057',
			'long': '-87.6506388'
		},
];

function initMap() {
	//map created, centered on Chicago
	map = new google.maps.Map(document.getElementById('map-wrapper'), {
	  center: new google.maps.LatLng(41.860710, -87.628266),
	  zoom: 11,
	  mapTypeControl: false
	});

	bounds = new google.maps.LatLngBounds();

	//create all stations, attach listeners, and attach to viewModel. Stations created using JSON above
	var newStation;
	for(var i=0;i<stationsList.length;i++){
		newStation = new viewModel.Station(stationsList[i].name, stationsList[i].intersection, stationsList[i].lat, stationsList[i].long);
		stationListener(newStation);
		viewModel.stations.push(newStation);

	}

	map.fitBounds(bounds);

	//handle any resizing and re-center the map
	google.maps.event.addDomListener(window, "resize", function() {
		var center = map.getCenter();
		google.maps.event.trigger(map, "resize");
		map.setCenter(center);
	});

	ko.applyBindings(viewModel);
}

/**
	Listenes to clicks for the marker or infowindow
**/
function stationListener(station) {
	station.marker.addListener('click', function() {
		toggleStation(station);
	})

	station.infoWindow.addListener('closeclick', function() {
		station.active(false);
		station.marker.setAnimation(null);
	})
}

/**
	Toggles the station list item, marker, and infowindow
**/
function toggleStation(station) {
	if(station.active()){
		station.active(false);
		station.infoWindow.close();
		station.marker.setAnimation(null);
	}
	else{
		station.active(true);
		station.infoWindow.open(map, station.marker);
		station.marker.setAnimation(google.maps.Animation.BOUNCE);
	}
}

/*
	Alternative Fuel Locations API - https://data.cityofchicago.org/developers/docs/alternative-fuel-locations
	Get what fuel type and what date that fuel type opened up at a station
*/
function populateInfoWindow(name, intersection) {
	var date;
	var contentString = '<b>' + name + ' </b>  located at ' + intersection;
	var infoWindow = new google.maps.InfoWindow({content: contentString}); //create infowindow and send to KO, ajax will fill later

	$.ajax({
		url: "https://data.cityofchicago.org/resource/alternative-fuel-locations.json?intersection_directions=" + encodeURIComponent(intersection)
	}).done(function(data) {

		contentString += ' serves: <ul>'

		//loop through all data, and append to contentString
		$.each(data, function(index) {
			date = new Date(data[index].open_date); //use Date object to convert to string properly
			contentString += '<li><b>' + data[index].fuel_type_code + '</b> - Installed ' + date.toDateString() + '</li>';
		})

		contentString += '</ul>';

		infoWindow.setContent(contentString); //set modified contenString with fuel type info

	}).fail(function() {
		alert("An error occurred, please try refreshing this application.");
	});

	return infoWindow;
}

// Alert user when Google Map fails to load
function googleMapError() {
	alert("Google Maps failed to load.  Please refresh the page to try again.");
}

var viewModel =  {
	stations: ko.observableArray([]),
	textFilter: ko.observable(""),
	showFilter: ko.observable(true),
	Station: function(name, intersection, lat, long) {
		var self = this;

		var latlng = new google.maps.LatLng(lat, long);

		var stationMarker = new google.maps.Marker({
			position: latlng,
			map: map,
			animation: google.maps.Animation.DROP
		});

		bounds.extend(stationMarker.position);

		var stationInfoWindow = populateInfoWindow(name, intersection);

		var station = {
			active: ko.observable(false),
			display: ko.observable(true),
			name: name,
			intersection, intersection,
			marker: stationMarker,
			infoWindow: stationInfoWindow
		}

		return station;
	},
	selectStation: function(item) {
		toggleStation(item);
	},
	filter: function() {
		var text = viewModel.textFilter().toLowerCase().split(" "); //split filter text by spaces to allow for more matches
		var intersectionList;

		for (var i=0;i<viewModel.stations().length;i++){
			//split up intersection by spaces to allow for more matches
			intersectionList = viewModel.stations()[i].intersection.toLowerCase().split(" ");

			for(var k=0;k<text.length;k++){

				matchLoop: for(var j=0;j<intersectionList.length;j++) {
					//if no match then remove station from list
					if(text[k] !== intersectionList[j])
						viewModel.stations()[i].display(false);
					else{
						viewModel.stations()[i].display(true);
						break matchLoop;
					}

				}
			}
		}
	},
	toggleList: function() {
		//this enables the hamburger to hide and show the list
		if(this.showFilter()){
			$('.list-wrapper').hide();
			$('.map-wrapper').removeClass('col-xs-10');
			this.showFilter(false);
		} else {
			$('.list-wrapper').show();
			$('.map-wrapper').addClass('col-xs-10');
			this.showFilter(true);
		}
	}
}
