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
    //joinData();
}
function createDetroitMap(div){
    var map = L.map(div).setView([42.331, -83.045], 11);

    L.tileLayer(
        'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
        }).addTo(map);
    getDetroitData(map)
}
//get topodata
//function getData(map){
//    L.Topojson = L.GeoJSON.extend({
//        addData: function(data){
//            var geojson, key;
//            if(data.type === "Topology"){
//                for (key in data.objects){
//                    if (data.objects.hasOwnProperty(key)){
//                        geojson = topojson.feature(data, data.objects[key]);
//                        L.GeoJSON.prototype.addData.call(this, geojson)
//                    }
//                }
//                return this;
//            }
//            L.geoJSON.prototype.addData.call(this, data);
//            return this;
//        }
//    });
//    L.Topojson = function(data,options){
//        return new L.Topojson(data, options);
//    };
//
//    var geojson = L.Topojson(null,{
//        style: function(feature){
//            return{
//                color: "#000",
//                opacity: 1,
//                weight: 1,
//                fillColor: '#35495d',
//                fillOpacity: 0.8
//            }
//        },
//        onEachFeature: function(feature, layer){
//            layer.bindPopup("test popup")
//        }
//
//    }).addTo(map);
//
//
//    function getGeoData(url){
//        response = fetch(url)
//        data = response.json();
//        console.log(data)
//        return data
//    }
//
//    getGeoData('data/miTracts')
//}
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
    L.geoJSON(data, {style: myStyle}).addTo(map);
    console.log(data);
  }).fail(function() { alert("There has been a problem loading the US Counties geojson")})
};
$(document).ready(loadPage)
