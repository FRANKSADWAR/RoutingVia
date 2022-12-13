var arr_one = [636134,624796,110776,23121,65349,96868];
var arr_main = new Array();

function updateArrays(){
    for (var i = 0; i < arr_one.length; i ++){
        arr_main.push(arr_one.slice(i,i+2));
    }
    
    if (arr_main.length % 2 !==0){
        arr_main.pop(arr_main[arr_main.length]);
    }
    else if (arr_main.length % 2 == 0){
        arr_main.pop(arr_main[arr_main.length]);
    }
    console.log(arr_main);
}
updateArrays();


/**
 *  Testing the routing funvtionality for the multiple routes scenario; this is what will be used for the routing instead
 *  of the point routing, because it can support both the multi-route and the one on one routing
 */

var mapObj = new MapObject('map',[6.225098,64.76543],32,5);
mapObj.addDrawingTools();

// A utility function to add the GeoJSON data into the layers and add them to the map
function addGeojsonLayer(url, geojson_layer) {
    $.ajax({
        beforeSend: function (xhr) {
            if (xhr.overrideMimeType()) {
                xhr.overrideMimeType("application/json");
            }
        },
        url: url,
        async: true,
        success: function (data) {
            geojson_layer.addData(data);
            mapObj.map.addLayer(geojson_layer);
        }
    });
}

function highlightPath(e) {
    var layer = e.target;
    layer.setStyle({
        weight: 4,
        color: '#fcfcfc',
        dashArray: '0.4',
        fillOpacity: 1
    });
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
}



function zoomToFeature(e) {
    mapObj.map.fitBounds(e.target.getBounds())
}


function onEachFeature(feature,layer){
    layer.on({
        mouseover: highlightPath,
        click: zoomToFeature
    });
}

// clicking on the map will add a marker to the map
mapObj.map.on('click',)

// get the function to get the nearest node of each marker
function getNearestNode(){

}

/**
 * We have three arrays so far: 1 for the latlngs, 1 for the id's and one for the pairs
 * Changing a single point should update all of them and then the pairs will be used by the shortest route function to compute the
 * routes and add it to the map
 */
function getShortestPaths(){

}


/**
 * The shortest route function will first check for the length of the id's array, or the length of the first element of the pairs 
 * array; if its > 1, then a route will be computed, otherwise; no route wil be computed
 */
function getShortest(){

}


// ** we will have a delete button using a leaflet div element, clicking the div will clear all the arrays and delete route from map

