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

