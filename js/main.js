//javascript
function loadPage(){
    createMap('map1')
    createDetroitMap('map2')
    //second case study map will go here
    createMap('map3')
}
function createMap(div){
    var map = L.map(div).setView([39.8283, -98.5795], 4);

    L.tileLayer(
        'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
        }).addTo(map);
    getCountryData(map);
    createSequenceControls(map)
}
function createDetroitMap(div){
    var map = L.map(div).setView([42.331, -83.045], 11);

    L.tileLayer(
        'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
        }).addTo(map);
    getDetroitData(map)
    createSequenceControls(map)
}

//get geojson data
function getCountryData(map){
  //load the data
  $.ajax("data/usCounties_Contig.json", {
    dataType: "json",
    success: function(response){
    }
  }).done(function(data){
    //setup functions that will run upon success
    var myStyle = { "color": "red", "weight": .5}
    L.geoJSON(data, {style: myStyle}).addTo(map);
    console.log(data);
  }).fail(function() { alert("There has been a problem loading the US Counties geojson")})
}
function getDetroitData(map){
  //load the data
  $.ajax("data/miTracts.json", {
    dataType: "json",
    success: function(response){
    }
  }).done(function(data){
    //setup functions that will run upon success
    var myStyle = { "color": "green", "weight": .5}
    L.geoJSON(data, {style: myStyle, onEachFeature: makePopup}).addTo(map);
    console.log(data);
  }).fail(function() { alert("There has been a problem loading the US Counties geojson")})
};

//https://stackoverflow.com/questions/36555409/need-help-adding-popup-info-windows-to-polygons-on-leaflet-map
function makePopup(feature, layer){
    //this will be dynamic further down the line, getting the value from the dropdown box and replacing ALAND with that value to make it dynamic
    content = "Testattribute:" + feature.properties.ALAND
    layer.bindPopup(content)
    //This is optional if we want people to manually click
    layer.on({
        mouseover: function(){
            this.openPopup()
        },
        mouseout: function(){
            this.closePopup()
        }
    })
     
}

function createSequenceControls(map){
    //make dropdown with attributes we want to show(or hardcode into index.html?), call process data function to get the attributes in the geojson
    console.log("test")
    
}

//function processData(data){
//    //taken from Module examples 1-2 lesson 3
//    var attributes = []
//    
//    var properties = data.features[0].properties
//    
//    for (var attribute in properties){
//        attributes.push(attribute)
//        
//    }
//    console.log(attributes)
//    
//    return attributes
//}
$(document).ready(loadPage)
