function markerSize(mag) {
  return mag * 5;
};

// make function to determine color based on magnitude (see day 2 activity 1 NY boroughs) with if else
// https://www.w3schools.com/colors/colors_picker.asp
function markerColor(mag) {
  if (mag > 5) {
    return '#B41823'
  } else if (mag > 4) {
    return '#E52431'
  } else if (mag > 3) {
    return '#F65F0E'
  } else if (mag > 2) {
    return '#F6C823'
  } else if (mag > 1) {
    return '#7EBA36'
  } else {
    return '#E7F6D5'
  }
};

function opacity(depth) {
  if (depth > 8) {
    return .8
  } else if (depth > 5) {
    return .6
  } else if (depth > 2) {
    return .4
  } else {
    return .3
  }
};

// day 1 activity 10
// Store our API endpoint inside url (Chose all earthquakes in last 7 days)
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Perform a GET request to the query URL
d3.json(url, function (data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time and magnitude of the earthquake
    // circleMarker: https://leafletjs.com/examples/geojson/
    onEachFeature: function (feature, layer) {

      layer.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p><br><p> Magnitude: " + feature.properties.mag + "</p>")
    }, pointToLayer: function (feature, latlong) {
      return new L.circleMarker(latlong,
        {
          radius: markerSize(feature.properties.mag),
          fillColor: markerColor(feature.properties.mag),
          fillOpacity: opacity(feature.geometry.coordinates[2]),
          // stroke false prevents the blue line from appearing around circles
          stroke: false,
        })
    }
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}


// day 1 activity 8/10
// Adding tile layer
function createMap(earthquakes, platesLayer) {
  var lightLayer = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/light-v10",
    accessToken: API_KEY
  });

  var satelliteLayer = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/satellite-streets-v11",
    accessToken: API_KEY
  });

  var darkLayer = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/dark-v10",
    accessToken: API_KEY
  })

  var baseMaps = {
    Light: lightLayer,
    Dark: darkLayer,
    Satellite: satelliteLayer,
  };

  var overlayMap = {
    Earthquakes: earthquakes,
    "Tectonic Plates": platesLayer
  };

  var myMap = L.map("mapid", {
    center: [39.8283, -98.5795],
    zoom: 5,
    layers: [lightLayer, earthquakes]
  })

  // L.control.layers(baseMaps, overlayMaps).addTo(myMap)
  L.control.layers(baseMaps, overlayMap, {
    collapsed: false
  }).addTo(myMap)

  // add tectonic plate information
  // day 2 activity 1
  var platesLink = "static/data/PB2002_plates.json"

  d3.json(boundLink, function (platesData) {

    // console.log (platesData)
    L.geoJson(platesData, {
      style: function () {
        return {
          color: "#db4dff",
          fillOpacity: 1
        }
      }
    })
  });

  d3.json(boundLink, function(platesData) {
    // console.log(platesData)
    L.geoJson(platesData, {
      style: function () {
        return{
          color: "#db4dff",
          fillOpacity: 1
        }
      }
    }).addTo(platesLayer)
  })

  // Day 2 activity 4
  // https://leafletjs.com/examples/choropleth/
  // Set up the legend
  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function (map) {

    var div = L.DomUtil.create("div", "info legend"),
      // https://stackoverflow.com/questions/21307647/leaflet-adding-a-legend-title
      labels = ['<strong> Earthquake Magnitude </strong>'],
      from, to;
    var mag = [0, 1, 2, 3, 4, 5];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < mag.length; i++) {
      from = mag[i];
      to = mag[i + 1] - 1;
      labels.push(
        '<i style="background:' + markerColor(from + 1) + '"></i> ' +
        from + (to ? '&ndash;' + to : '+'));
    }
    div.innerHTML = labels.join('<br>');
    return div;
  };

  // Adding legend to the map
  legend.addTo(myMap);
}