var map;

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
		}
];

function initMap() {
	map = new google.maps.Map(document.getElementById('map-wrapper'), {
	  center: new google.maps.LatLng(41.860710, -87.628266),
	  zoom: 11
	});

	var newStation;
	for(var i=0;i<stationsList.length;i++){
		newStation = new viewModel.Station(stationsList[i].name, stationsList[i].intersection, stationsList[i].lat, stationsList[i].long);
		stationListener(newStation);
		viewModel.stations.push(newStation);

	}
	ko.applyBindings(viewModel);
}

function stationListener(station) {
	station.marker.addListener('click', function() {
		toggleStation(station);
	})

	station.infoWindow.addListener('closeclick', function() {
		station.active(false);
		station.marker.setAnimation(null);
	})
}

function toggleStation(station) {
	if(station.active())
	{
		station.active(false);
		station.infoWindow.close();
		station.marker.setAnimation(null);
	} else {
		station.active(true);
		station.infoWindow.open(map, station.marker);
		station.marker.setAnimation(google.maps.Animation.BOUNCE);
	}
}
function populateInfoWindow(name, intersection) {
	//TO-DO hit chicago api for types of fuel
	return new google.maps.InfoWindow({
		content: '<b>' + name + ' </b> located at ' + intersection + ' serves: '
	});
}

var viewModel =  {
	stations: ko.observableArray([]),
	Station: function(name, intersection, lat, long) {
		var self = this;

		var latlng = new google.maps.LatLng(lat, long);
		var stationMarker = new google.maps.Marker({
			position: latlng,
			map: map,
			animation: google.maps.Animation.DROP
		});

		var stationInfoWindow = populateInfoWindow(name, intersection);

		var station = {
			active: ko.observable(false),
			name: name,
			intersection, intersection,
			marker: stationMarker,
			infoWindow: stationInfoWindow
		}

		return station;
	},
	selectStation: function(item) {
		toggleStation(item);
	}
}