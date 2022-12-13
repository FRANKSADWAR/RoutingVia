/**
 * 
 * @param {*} container The map container from HTML div
 * @param {*} center The center coordinates of the map
 * @param {*} maxZoom Defining the maximum zoom levels of the map tiles
 * @param {*} initialZoom The inital zoom of the map tiles
 */

var MapObject = function (container, center, maxZoom, initialZoom) {
    this.container = container;
    this.center = center;
    this.intialZoom = initialZoom;
    this.maxZoom = maxZoom;
    this.map = null;
    this.baseLayers = null;
    this.groupedLayers = null;
    this.layerControl = null;
}


MapObject.prototype.initialize = function () {
    var osm, osmLink, cartoVoyager, cartoVoyagerUrl, openSeaMap;
    cartoVoyagerUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png';
    osmLink = '&copy;<a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>';
    
    osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: osmLink,
        maxZoom: this.maxZoom
    });

    cartoVoyager = L.tileLayer(cartoVoyagerUrl, {
        attribution: '<a href="https://carto.com/">Carto Voyager</a>',
        maxZoom: 30,
    });

    openSeaMap = L.tileLayer("https://server.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}",{
        attribution: 'Open Sea Map, ESRI',
        maxZoom: this.maxZoom,
    });

    this.mapLayers = [osm, openSeaMap, cartoVoyager];
    this.map = L.map(this.container, {
        layers: this.mapLayers,
        keyboard: true,
    }).setView(this.center, this.intialZoom);

    L.control.mousePosition({
        position: "bottomright",
    }).addTo(this.map);

    // group the base layers
    var baseLayers = {
        "Carto Voyager": cartoVoyager,
        "Open Street Map": osm,
        "ESRI Ocean Map": openSeaMap,
    };
    this.layerControl = L.control.layers(baseLayers).addTo(this.map);
    // GPS LOCATOR with leaflet locate ---> later development should adopt HTML5 geolocation API if needed
    var locateControl = L.control.locate({
        position: "bottomright",
        drawCircle: true,
        follow: true,
        setView: true,
        keepCurrentZoomLevel: true,
        markerStyle: {
            weight: 1,
            opacity: 0.8,
            fillOpacity: 0.8
        },
        circleStyle: {
            weight: 1,
            clickable: false
        },
        strings: {
            title: "Current location",
            popup: "You are within {distance} {unit} from this point",
            outsideMapBoundsMsg: "You seem located outside the boundaries of the map"
        },
        locateOptions: {
            maxZoom: 18,
            watch: true,
            enableHighAccuracy: true,
            maximumAge: 10000,
            timeout: 10000
        }
    });
    locateControl.addTo(this.map);
}

MapObject.prototype.addDrawingTools = function () {
    this.map.pm.addControls({
        position: 'topleft',
        drawMarker: true,
        drawCircleMarker: true,
        drawPolyline: true,
        drawRectangle: true,
        drawPolygon: true,
        drawCircle: true,
        editMode: true,
        dragMode: true,
        cutPolygon: false,
        removalMode: true,
        rotateMode: true,
        drawControls: true,
        editControls: true,
        customControls: true,
        optionsControls: true,
        pinningControls: true,
        snappingOption: true,
        splitMode: false,
        scaleMode: false,
        oneBlock: true
    });
}

MapObject.prototype.addGeocoder = function ( searchData, property) {
    var searchControl = new L.Control.Search({
        layer: searchData,
        propertyName: property,
        marker: true,
        moveToLocation: function(latlng, title,map ){
            map.setZoomAround(latlng, 15);
        }
    });
    searchControl.on('search:locationfound', (e)=>{
        if(e.layer._popup){
            e.layer.openPopup();
        }
    });
    searchControl.on('search:collapsed', (e)=>{
        searchData.eachLayer( (layer)=>{
            searchData.resetStyle(layer);
        });
    });
    this.map.addControl(searchControl);
}


