//javascript
function loadPage(){
    createMap('map1')
    createDetroitMap('map2')
    //second case study map will go here
    createMap('map3')
    
    createPieChart()
}
function createMap(div){
    var map = L.map(div).setView([39.8283, -98.5795], 4);

    L.tileLayer(
        'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
        }).addTo(map);
    //getData(map)
}
function createDetroitMap(div){
    var map = L.map(div).setView([42.331, -83.045], 11);

    L.tileLayer(
        'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
        }).addTo(map);
    //getData(map)
}

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

function createPieChart(){
    var w = 300,                        //width
    h = 300,                            //height
    r = 100,                            //radius
    color = d3.scale.category20c();     //builtin range of colors


//data from csvCountiesInternet.csv - values are total for US
    data = [{"label":"Internet Access", "value":96675972}, //dial-up or broadband
            {"label":"No Internet Access", "value":10383777},
            {"label": "No Computer", "value":13875454}
           ];

    
    var vis = d3.select("body")
        .append("svg:svg")              //create the SVG element inside the <body>
        .data([data])                   //associate our data with the document
            .attr("width", w)           //set the width and height of our visualization (these will be attributes of the <svg> tag
            .attr("height", h)
        .append("svg:g")                //make a group to hold our pie chart
            .attr("transform", "translate(" + r + "," + r + ")")    //move the center of the pie chart from 0, 0 to radius, radius

    var arc = d3.svg.arc()              //this will create <path> elements for us using arc data
        .outerRadius(r);

    var pie = d3.layout.pie()           //this will create arc data for us given a list of values
        .value(function(d) { return d.value; });    //access the value of each element in our data array



    var arcs = vis.selectAll("g.slice")     //select all <g> elements with class slice (there aren't any yet)
        .data(pie)                          //associate the generated pie data (an array of arcs, each having startAngle, endAngle and value properties) 
        .enter()                            //create <g> elements for every "extra" data element that should be associated with a selection. The result is creating a <g> for every object in the data array
            .append("svg:g")                //create a group to hold each slice (we will have a <path> and a <text>                                     element associated with each slice)
            .attr("class", "slice");    //for styling

        arcs.append("svg:path")
                .attr("fill", function(d, i) { return color(i); } ) //set the color for each slice to be chosen from the color function defined above
                .attr("d", arc);                                    //this creates the actual SVG path using the associated data (pie) with the arc drawing function

        arcs.append("svg:text")                                     //add a label to each slice
                .attr("transform", function(d) {                    //set the label's origin to the center of the arc
                //we have to make sure to set these before calling arc.centroid
                d.innerRadius = 0;
                d.outerRadius = r;
                return "translate(" + arc.centroid(d) + ")";        //this gives us a pair of coordinates like [50, 50]
            })
            .attr("text-anchor", "right")                          //center the text on its origin
            .text(function(d, i) { return data[i].label; });        //get the label from our original data array
};

$(document).ready(loadPage)
