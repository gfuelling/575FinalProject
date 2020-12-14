//anonymous funcion
(function(){
	//array of integer csv fields
var attrIntArray = ["hascomputerPerc","dialupPerc","broadbandPerc","nointernetPerc","nocomputerPerc","laborforceparticipationrate","unemploymentrate"];
//array of string csv fields
var attrStrArray = ["LABEL"];
//array of csv fields formatted for dropdown options
var chartTitleArray = ["Has Computer","Dialup","Broadband","No Internet","No Computer","Labor Participation Rate","Unemployment Rate"];
//array of csv fields formatted for popups
var chartPopupArray = ["% households have a computer","% households have dialup","% households have broadband","% households have no internet","% households have no computer", ": Total Population 16+","% Labor Participation","% Unemployment","Pop 20+ Below Poverty Level"];
var expressed = attrIntArray[0];
var chartTitleExpressed = chartTitleArray[0];
var chartWidth = window.innerWidth *0.54,
		chartHeight = 473,
		leftPadding = 50,
		rightPadding = 2,
		topBottomPadding = 5,
		chartInnerWidth = chartWidth - leftPadding - rightPadding,
		chartInnerHeight = chartHeight - topBottomPadding * 2,
		translate = "translate(" + leftPadding + ","+ topBottomPadding +")";

var localMapHeights = 750;
//create a scale to size bar proportionally to fram and for axis
var yScale = d3.scaleLinear()
					.range([chartInnerHeight, 0])
					.domain([0, 50]);
//begin script when window loads
window.onload = drawMap();
window.onload = createDetroitTitle();
window.onload = createSeattleTitle();
window.onload = drawDetroitMap();
window.onload = drawSeattleMap();
window.onload = createDetroitResourcesTitle();
window.onload = setLeaflet();

//MAIN COUNTRYWIDE FUNCTION
async function drawMap(){
	//set up header div and title
	//map frame dimensions
	 var width = window.innerWidth * .65,
	 	height = 460;
	//create new svg container for the map
	var map = d3.select("#inner")
		.append("svg")
		.attr("class", "map")
		.attr("width", width)
		.attr("height", height)
        //zoom
//        .call(d3.behavior.zoom()
//             .translate(projection.translate())
//             .scale(projection.scale())
//             .on("zoom", redraw));
    
	//create Albers equal area conic projection centered on Michigan
	var projection = d3.geoAlbers()
		.center([-98, 36])
		.rotate([-2, 0])
		.parallels([-40, 40])
		.scale(1000)
		.translate([width / 2, height / 2]);
		//create path
	var path = d3.geoPath().projection(projection);
	
    //attempting to get zoom nad pan functionality
//    function redraw() {
//      if (d3.event) {
//        projection
//            .translate(d3.event.translate)
//            .scale(d3.event.scale);
//      }
//      svg.selectAll("path").attr("d", path);
//      var t = projection.translate();
//      xAxis.attr("x1", t[0]).attr("x2", t[0]);
//      yAxis.attr("y1", t[1]).attr("y2", t[1]);
//    }
    
    // pull in data
  d3.queue()
    .defer(d3.csv,"data/csvCountiesInternet.csv")
    .defer(d3.json,"data/usCounties_Contig.topojson")
    .await(callback);
	//callback function
	function callback(error, internetCounties, counties){
		//translate counties TopoJSON
		usCounties = topojson.feature(counties, counties.objects.usCounties_Contig).features;
		//join csv data to geojson enumeration units
		usCounties = joinData(usCounties,internetCounties);
		//create color scale for enumeration units
		var colorScale = makeColorScale(internetCounties);
		//add enumeration units to the map
		setEnumerationUnits(usCounties,map,path,colorScale);
		//create dropdown
		createDropdown(internetCounties);
		//create chart
		//setChart(internetCounties,colorScale);
        //make legend
        makeLegend(colorScale);
        //create pie chart
        setPieChart(internetCounties,colorScale);

		//create bottom div and sources
		setDataSources();
        redraw();
	};
};
//MAIN DETROIT function
async function drawDetroitMap(){
	//set up header div and title
	//map frame dimensions
	 var width = window.innerWidth * 0.45,
	 	height = localMapHeights;
	//create new svg container for the map
	var map = d3.select("#inner")
		.append("svg")
		.attr("class", "map")
		.attr("width", width)
		.attr("height", height)
		.attr("padding-top", 40);
	//create Albers equal area conic projection centered on Michigan
	var projection = d3.geoAlbers()
		.center([-85, 42.5])
		.rotate([-2, 0])
		.parallels([-40, 40])
		.scale(32000)
		.translate([width / 2, height / 2]);
		//create path
	var path = d3.geoPath().projection(projection);
	// pull in data
  d3.queue()
    .defer(d3.csv,"data/csvMiTractsInternet.csv")
    .defer(d3.json,"data/miTracts.topojson")
    .await(callback);
	//callback function
	function callback(error,internetMiTracts, miTracts){
		//translate counties TopoJSON
		miTracts = topojson.feature(miTracts, miTracts.objects.miTracts).features;
		//join csv data to geojson enumeration units
		miTracts = joinDetroitData(miTracts,internetMiTracts);
		//create color scale for enumeration units
		var colorScale = makeColorScale(internetMiTracts);
		//add enumeration units to the map
		setDetroitEnumerationUnits(miTracts,map,path,colorScale);
		//create dropdown
		createDropdown(internetMiTracts);
        //create legend
        createDetroitLegend(colorScale);
		//create side panel
		//sidePanel();
		//create chart
		//setChart(internetCounties,colorScale);

		//create bottom div and sources
		//setDataSources();
	};
};
//MAIN SEATTLE function
async function drawSeattleMap(){
	//set up header div and title
	//map frame dimensions
	 var width = window.innerWidth * 0.45,
	 	height = localMapHeights;
	//create new svg container for the map
	var map = d3.select("#inner")
		.append("svg")
		.attr("class", "map")
		.attr("width", width)
		.attr("height", height)
		.attr("padding-top", 40);
	//create Albers equal area conic projection centered on Michigan
	var projection = d3.geoAlbers()
		.center([-124, 47.3])
		.rotate([-2, 0])
		.parallels([-40, 40])
		.scale(32000)
		.translate([width / 2, height / 2]);
		//create path
	var path = d3.geoPath().projection(projection);

	map.append("text")
		.attr("x", (width/2))
		.attr("y", -20)
		.attr("text-anchor", "middle")
		.text("Detroit, Michigan");
	// pull in data
  d3.queue()
    .defer(d3.csv,"data/csvWaTractsInternet.csv")
    .defer(d3.json,"data/seattleTracts.topojson")
    .await(callback);
	//callback function
	function callback(error,internetWaTracts, waTracts){
		//translate counties TopoJSON
		waTracts = topojson.feature(waTracts, waTracts.objects.seattleTracts).features;
		//join csv data to geojson enumeration units
		waTracts = joinDetroitData(waTracts,internetWaTracts);
		//create color scale for enumeration units
		var colorScale = makeColorScale(internetWaTracts);
		//add enumeration units to the map
		setDetroitEnumerationUnits(waTracts,map,path,colorScale);
		//create dropdown
		//createDropdown(internetWaTracts);

		//create side panel
		//sidePanel();
		//create chart
		//setChart(internetCounties,colorScale);
		//create Seattle Legend
        //createSeattleLegend();


		//create bottom div and sources
		//setDataSources();
	};
};
async function setLeaflet(){
	const mymap = L.map('mapid').setView([42.35,-83.1],11);

	L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 15,
    minZoom: 11,
    id: 'mapbox/light-v10',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoidmVycmFzY3V3IiwiYSI6ImNraW02aXBtaDBxZW8zMG8xa2UyamNiOTEifQ.GrRWy2WOPt3vBjK-Cah1AQ'
}).addTo(mymap);

function getData(map){
	//load data
	$.ajax("data/Libraries.geojson", {
		dataType: "json",
		success: function(response){
		}
	}).done(function(data){
		//setup functions that run on successful data import
		createLibraries(data,mymap);
	}).fail(function() { alert("There was a problem loading libraries data.")});
};
function createLibraries(data,map){
	var libsGroup = L.layerGroup();
	//difine parks data
	libs = L.geoJson(data, {
		pointToLayer: function(feature, latlng) {
			return L.circleMarker(latlng, {
				// fillColor: "darkcyan",
				color: "darkcyan",
				weight: 1,
				fillOpacity: 0.6
			});
		},
		//create popup for each feature
		onEachFeature: function (feature,layer){
			var props = layer.feature.properties;
			popupContent = "<p><b>" + props.name + " Library</p></b>"+ "</n>"+ props.address;
			layer.bindPopup(popupContent, { offset: new L.Point(0,-2)});
		}
	});
	libs.addTo(libsGroup);
	//create overlay
	var overlay = {
		"Libraries":libsGroup
	};
	L.control.layers(null,overlay).addTo(mymap);
};
function getParkData(map){

	//load data
	$.ajax("data/Parks.geojson", {
		dataType: "json",
		success: function(response){
		}
	}).done(function(data){
		//setup functions that run on successful data import
		L.geoJson(data, {
			style: function (feature) {
				return {color: "olivedrab",
								weight: 1};
			}
		}).bindPopup(function(layer) {
			return layer.feature.properties.NAME;
		}).addTo(mymap)
		//createParks(data,mymap);
	}).fail(function() { alert("There was a problem loading parks data.")});
};
function getBoundData(map){

	//load data
	$.ajax("data/Detroit.geojson", {
		dataType: "json",
		success: function(response){
		}
	}).done(function(data){
		//setup functions that run on successful data import
		L.geoJson(data, {
			style: function (feature) {
				return {color: "darkgrey", fillColor: "white", fillOpacity:0,
								weight: 2};
			}
		}).bindPopup(function(layer) {
			return layer.feature.properties.NAME;
		}).addTo(mymap)
		//createParks(data,mymap);
	}).fail(function() { alert("There was a problem loading Detroit boundary data.")});
};
getData();
getParkData();
getBoundData();
};
function makeColorScale(csvData){
	//set color scale
	var x = d3.interpolatePuBuGn
	//create color scale array
	var colorClasses = [
		x(.1),
		x(.4),
		x(.6),
		x(.8),
		x(1)
	];
	var color = d3.scaleQuantile()//designate quantile scale generator
								.range(colorClasses);
	//build array of all currently expressed values for input domain
	var domainArray = [];
	//join loop
	for (var i=0; i<csvData.length; i++){
		var val = parseFloat(csvData[i][expressed]);
		domainArray.push(val);
	};
	//pass array of expressed values as domain
	color.domain(domainArray);

	return color; //return the color scale generator

    };
function choropleth(d, colorScale){
	//get data value
	var value = parseFloat(d[expressed]);
	//if value exists, assign it a color; otherwise assign gray
	if (typeof value == 'number' && !isNaN(value)) {
		return colorScale(value);
	} else {
		return "#ccc";
	};
};
function joinData(geoJson, csvData){
	//loop through csv to assign each csv values to json county
	for (var i=0; i<csvData.length; i++) {
		var csvCounty = csvData[i]; //the current region
		var csvKey = csvCounty.GEO_ID.slice(-5); //csv county field
		//loop through json regions to find right regions
		for (var a=0; a<geoJson.length; a++) {
			var geojsonProps = geoJson[a].properties;//the current region geojson properties
			var geojsonKey = geojsonProps.GEOID;//the geojson primary key
			///where NAME codes match, attach csv to json object
			if (geojsonKey == csvKey) {
				//assign key/value pairs
				attrIntArray.forEach(function(attr){
					var val = parseFloat(csvCounty[attr]); //get csv attribute value
					geojsonProps[attr] = val; //assign attribute and value to geojson props
				});
				attrStrArray.forEach(function(attr){
					var val = csvCounty[attr]; //get csv attribute value
					geojsonProps[attr] = val; //assign attribute and value to geojson props
				});
			};
		};
	};
	//console.log(geoJson);
	return geoJson;
};
function joinDetroitData(geoJson, csvData){
	//loop through csv to assign each csv values to json county
	for (var i=0; i<csvData.length; i++) {
		var csvCounty = csvData[i]; //the current region
		var csvKey = csvCounty.GEO_ID.slice(-11); //csv county field
		//loop through json regions to find right regions
		for (var a=0; a<geoJson.length; a++) {
			var geojsonProps = geoJson[a].properties;//the current region geojson properties
			var geojsonKey = geojsonProps.GEOID;//the geojson primary key
			///where NAME codes match, attach csv to json object
			if (geojsonKey == csvKey) {
				//assign key/value pairs
				attrIntArray.forEach(function(attr){
					var val = parseFloat(csvCounty[attr]); //get csv attribute value
					geojsonProps[attr] = val; //assign attribute and value to geojson props
				});
			};
		};
	};
	//console.log(geoJson);
	return geoJson;
};
function setEnumerationUnits(geoJson,map,path,colorScale){

	var counties = map.selectAll(".counties")
		.data(geoJson)
		.enter()
		.append("path")
		.attr("class", function(d){
				return "counties " + d.properties.LABEL;
		})
		.attr("d", path)
		.style("fill", function(d) {
			return choropleth(d.properties, colorScale)
		})
		.on("mouseover", function(d){
            highlight(d.properties)
		})
		.on("mouseout", function(d){
			dehighlight(d.properties);
		})
		.on("mousemove", moveLabel);
		var desc = counties.append("desc")
			.text('{"stroke": "#000", "stroke-width": "0.5px"}');
};
function setDetroitEnumerationUnits(geoJson,map,path,colorScale){

	var tracts = map.selectAll(".tracts")
		.data(geoJson)
		.enter()
		.append("path")
		.attr("class", function(d){
				return "tracts " + d.properties.TRACTCE;
		})
		.attr("d", path)
		.style("fill", function(d) {
			return choropleth(d.properties, colorScale)
		})
		.on("mouseover", function(d){
            highlightGF(d.properties)
		})
		.on("mouseout", function(d){
			dehighlight(d.properties);
		})
		.on("mousemove", moveLabel);
		var desc = tracts.append("desc")
			.text('{"stroke": "#000", "stroke-width": "0.5px"}');
};
function setChart(csvData, colorScale){
	//create second svg element to hold the bar chart
	var chart = d3.select("body")
						.append("svg")
						.attr("width",chartWidth)
						.attr("height",chartHeight)
						.attr("class","chart");
	//create chart background fill
	var chartBackground = chart.append("rect")
						.attr("class", "chartBackground")
						.attr("width", chartInnerWidth)
						.attr("height", chartInnerHeight)
						.attr("transform", translate);
	//set bars for each county
	var bars = chart.selectAll(".bar")
						.data(csvData)
						.enter()
						.append("rect")
						.sort(function(a,b){
							return b[expressed]-a[expressed]
						})
						.attr("class", function(d){
							return "bar " + d.county;
						})
						.attr("width", chartInnerWidth/csvData.length -1)
						.on("mouseover", highlight)
						.on("mouseout", dehighlight)
						.on("mousemove", moveLabel)
						.on("mouseover", function (d,i){
							d3.select(this).transition()
								.duration('50')
								.attr('opacity', '.85');
						})
						.on("mouseout", function(d,i) {
							d3.select(this).transition()
								.duration('50')
								.attr('opacity', '1');
						});
            var desc = bars.append("desc")
                    .text('{"stroke": "none", "stroke-width": "0px"}');
						// .on("mouseenter", onMouseEnter(this))
						// .on("mouseleave", onMouseLeave);

		//create chart title
		var chartTitle = chart.append("text")
						.attr("x",400)
						.attr("y",40)
						.attr("class","chartTitle")
						.text("Percentage of " + expressed + " in each county");
		//create vertical axis generator
		var yAxis = d3.axisLeft()
						.scale(yScale)
						//.orient("left");
		//place axis
		var axis = chart.append("g")
						.attr("class", "axis")
						.attr("transform", translate)
						.call(yAxis);
		//create frame for chart border
		var chartFrame = chart.append("rect")
						.attr("class","chartFrame")
						.attr("width", chartInnerWidth)
						.attr("height",chartInnerHeight)
						.attr("transform", translate);
		//create an average line
	//reset bar positions, heights, and colors
	updateChart(bars, csvData.length, colorScale);
};

function setPieChart(csvData, colorScale){

    //csv data totals
    var data = [
                {"label" : "Broadband" , "value": 96128868 } ,
                {"label" : "No Internet", "value": 10383777} ,
                {"label": "No Computer", "value" : 13875454},
                {"label" : "Dialup", "value" : 547104 }
    ];

    var radius = Math.min(chartWidth, chartHeight) /4;  // can edit this denominator for easy resizing

    //change this color scale so it doesn't match maps... could be confusing
    var color = d3.scaleOrdinal()
        .range([
		"#52212C",
		"#9C7981",
		"#929C5A",
		"#465200"
	]);


    var arc = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    var labelArc = d3.arc()
        .outerRadius(radius-30)
        .innerRadius(radius-30);

    //process the data for pie chart - when called, adds start and end angle to array
    var pie = d3.pie()
        .sort(null)
        .value(function(d) {return d.value; });

    var svg = d3.select("body").append("svg")
        .attr("width", chartWidth)
        .attr("height", chartHeight)
        .append("g")
        .attr("transform", "translate(" + chartWidth / 2 + "," + chartHeight / 2 + ")");

    var g = svg.selectAll(".arc")
            .data(pie(data))
            .enter().append("g")
            .attr("class", "arc");

    g.append("path")
            .attr("d", arc)
            .style("fill", function(d) {return color(d.data.value); });

    g.append("text")
            .attr("transform", function(d) { return "translate(" + (labelArc.centroid(d)) + ")"; })
            .attr("dy", ".35em")
            .text(function(d) { return d.data.label; })
            .attr("class", "pieText");

};

function makeLegend(color) {

    var svg = d3.select("body").append("svg")
        .attr("width", 145)
        .attr("height", 100)
        .attr("class", "legend");
        //.append("g");


    var legend = svg.selectAll('g.legendEntry')
        .data(color.range().reverse())
        .enter()
        .append('g').attr('class', 'legendEntry');

    legend
        .append('rect')
        .attr("x", 0)
        .attr("y", function(d, i) {
            return i * 20;
        })
        .attr("width", 10)
        .attr("height", 10)
        .style("stroke", "black")
        .style("stroke-width", 1)
        .style("fill", function(d){return d;});
       //the data objects are the fill colors

    legend
        .append('text')
        .attr("x", 25) //leave x pixel space after the <rect>
        .attr("y", function(d, i) {
                return i * 20;
            })
        .attr("dy", "0.85em") //place text one line below the x,y point
        //.text("test");
        .text(function(d,i) {
           var extent = color.invertExtent(d);
            //extent will be a two-element array
           var format = d3.format("0.2f");
           //return format(+extent[0]) + " - " + format(+extent[1]);  //this shows lower value - higher value
            return "< " + format(+extent[1]) + "%";
        });
};

function updateLegend(color){

     var svg = d3.select("body").append("svg")
        .attr("width", 145)
        .attr("height", 100)
        .attr("class", "legend");
        //.append("g");


    var legend = svg.selectAll('g.legendEntry')
        .data(color.range().reverse())
        .enter()
        .append('g').attr('class', 'legendEntry');

    legend
        .append('rect')
        .attr("x", 0)
        .attr("y", function(d, i) {
            return i * 20;
        })
        .attr("width", 10)
        .attr("height", 10)
        .style("stroke", "black")
        .style("stroke-width", 1)
        .style("fill", function(d){return d;});
       //the data objects are the fill colors

    legend
        .append('text')
        .attr("x", 25) //leave x pixel space after the <rect>
        .attr("y", function(d, i) {
                return i * 20;
            })
        .attr("dy", "0.85em") //place text one line below the x,y point
        //.text("test");
        .text(function(d,i) {
            var extent = color.invertExtent(d);
            //extent will be a two-element array
            var format = d3.format("0.2f");
           //return format(+extent[0]) + " - " + format(+extent[1]);  //this shows lower value - higher value
            return "< " + format(+extent[1]) + "%";
        });

}

function createDetroitLegend(color){

    var svg = d3.select("body").append("svg")
        .attr("width", 145)
        .attr("height", 100)
        .attr("class", "detroitLegend");
        //.append("g");


    var legend = svg.selectAll('g.legendEntry')
        .data(color.range().reverse())
        .enter()
        .append('g').attr('class', 'legendEntry');

    legend
        .append('rect')
        .attr("x", 0)
        .attr("y", function(d, i) {
            return i * 20;
        })
        .attr("width", 10)
        .attr("height", 10)
        .style("stroke", "black")
        .style("stroke-width", 1)
        .style("fill", function(d){return d;});
       //the data objects are the fill colors

    legend
        .append('text')
        .attr("x", 25) //leave x pixel space after the <rect>
        .attr("y", function(d, i) {
                return i * 20;
            })
        .attr("dy", "0.85em") //place text one line below the x,y point
        //.text("test");
        .text(function(d,i) {
           var extent = color.invertExtent(d);
            //extent will be a two-element array
           var format = d3.format("0.2f");
           //return format(+extent[0]) + " - " + format(+extent[1]);  //this shows lower value - higher value
            return "< " + format(+extent[1]) + "%";
        });
};

function createSeattleLegend(color){

    var svg = d3.select("body").append("svg")
        .attr("width", 145)
        .attr("height", 100)
        .attr("class", "legend");
        //.append("g");


    var legend = svg.selectAll('g.legendEntry')
        .data(color.range().reverse())
        .enter()
        .append('g').attr('class', 'legendEntry');

    legend
        .append('rect')
        .attr("x", 0)
        .attr("y", function(d, i) {
            return i * 20;
        })
        .attr("width", 10)
        .attr("height", 10)
        .style("stroke", "black")
        .style("stroke-width", 1)
        .style("fill", function(d){return d;});
       //the data objects are the fill colors

    legend
        .append('text')
        .attr("x", 25) //leave x pixel space after the <rect>
        .attr("y", function(d, i) {
                return i * 20;
            })
        .attr("dy", "0.85em") //place text one line below the x,y point
        //.text("test");
        .text(function(d,i) {
           var extent = color.invertExtent(d);
            //extent will be a two-element array
           var format = d3.format("0.2f");
           //return format(+extent[0]) + " - " + format(+extent[1]);  //this shows lower value - higher value
            return "< " + format(+extent[1]) + "%";
        });
}

function createDropdown(csvData){
	//determine the census data level for to differentiate .attr("class")

    var censusLevel = csvData[0].GEO_ID.substring(0,2);

	//add select element
	var dropdown = d3.select("body")
				.append("select")
				.attr("class", function(){
					if (censusLevel == 05){
						return "dropdownUS"
					}
					else if (censusLevel == 14) {
						return "dropdownMI"
					}
					else {
						console.log("there's a problem with your dropdown");
					}
				})
				.on("change", function(){
                    var attribute = this.value
                    //console.log(attribute)
					changeAttribute(this.value, csvData)
				});
	//add initial option
	var titleOption = dropdown.append("option")
				.attr("class", "titleOption")
                .property("selected", function(d){ return d === "hascomputerPerc"})
				.attr("disabled", "true")
                .attr("value", function(d){return d = "hascomputerPerc"})
				.text("Has Computer");
	//add attribute name options
	var attrOptions = dropdown.selectAll("attrOptions")
				.data(attrIntArray)
				.enter()
				.append("option")
				.attr("value", function(d){ return d })
				.text(function(d){ return chartTitleArray[attrIntArray.indexOf(d)] });
};
//dropdown change listener handler
function changeAttribute(attribute, csvData){
    //get variable to det;ermine census level - counties or tracts
	var censusLevel = csvData[0].GEO_ID.substring(0,2);
	//determine census level - counties or tracts
	var classType = classType(censusLevel);
	//change the expressed attribute
	expressed = attribute;
	//recreate the color scale
	var colorScale = makeColorScale(csvData);
	//recolor enumeration units
	var regions = d3.selectAll(classType)
			.transition()
			.duration(1000)
			.style("fill", function(d){
				return choropleth(d.properties, colorScale)
			});
	//set legend properties



    //re-sort, resize, and recolor bars
	var bars = d3.selectAll(".bar")
		//resort bars
		.sort(function(a,b){
			return b[expressed] - a[expressed];
		})
		.transition()//add animation
		.delay(function(d,i){
			return i * 20
		})
		.duration(500);

		function classType(censusLevel){
				if (censusLevel == 05){
					return ".counties"
				}
				else if (censusLevel == 14) {
					return ".tracts"
				}
				else {
					console.log("there's a problem within changeAttributeFunction");
				}
				console.log("this is "+ classType)
		}

		updateChart(bars,csvData.length, colorScale);
        d3.selectAll(".legend").remove();
        updateLegend(colorScale);
};
function updateChart(bars, n, colorScale){
	//position bars
	bars.attr("x", function(d,i){
				return i * (chartInnerWidth / n) + leftPadding;
			})
			.attr("height", function(d, i){
				return 463 - yScale(parseFloat(d[expressed]));
			})
			.attr("y", function(d, i){
				return yScale(parseFloat(d[expressed])) + topBottomPadding;
			})
			.style("fill", function(d){
				return choropleth(d, colorScale);
			});
	//updated chart title
	var chartTitle = d3.select(".chartTitle")
			.text("Percentage of those with "+ chartTitleArray[attrIntArray.indexOf(expressed)]);
};
//not working
function onMouseEnter(d){
	tooltip.style("opacity", 1)
	var metricValue = d.expressed;
	tooltip.select(".county")
		.text("testing!")
};
//not working
function onMouseLeave() {
	tooltip.style("opacity", 0)
}
function highlight(props){ //add interactivity
	// var selected = d3.selectAll("." + d.name).append("text")
	// 	.text(function() {
	// 		return [d];
	// 	})

	//change stroke
	var selected = d3.selectAll("." + props.LABEL)
				.style("stroke","#ad3e3e")
				.style("stroke-width","2");
	setLabel(props);
};
function highlightGF(props){ //add interactivity
	//change stroke
	var selected = d3.selectAll("." + props.TRACTE)
				.style("stroke","#ad3e3e")
				.style("stroke-width","2");
	setLabelGF(props);
};
//not working
function dehighlight(props){
	var selected = d3.selectAll("."+ props.LABEL)
		.style("stroke", function(){
			return getStyle(this,"stroke")
		})
		.style("stroke-width", function(){
			return getStyle(this, "stroke-width")
		});
	function getStyle(element, styleName){
		var styleText = d3.select(element)
			.select("desc")
			.text();
		var styleObject = JSON.parse(styleText);

		return styleObject[styleName];
	};
	d3.select(".infolabel")
		.remove();
};
function setLabel(props){
	//label content
  var attributeCV = $(".dropdownUS option:selected").val()
  var formatted = Number(props[attributeCV]).toFixed(1);
  var titleFormatted = chartPopupArray[attrIntArray.indexOf(attributeCV)];
  var labelAttribute = "<h1>" + formatted + " " + titleFormatted + "</h>";

	//create label div
	var infolabel = d3.select("body")
		.append("div")
		.attr("class", "infolabel")
		.attr("id", props.LABEL + "_label")
		.html(labelAttribute);
	var countyName = infolabel.append("div")
		.attr("class","labelname")
		.html(props.LABEL)
};
//Thinking of a seperate label function for the second map, works kinda
function setLabelGF(props){
	//label content
  var attributeGF = $(".dropdownMI option:selected").val()
  //console.log(attributeGF)
  var formatted = Number(props[attributeGF]).toFixed(1);
  var titleFormatted = chartPopupArray[attrIntArray.indexOf(attributeGF)];
  var labelAttribute = "<h1>" + formatted + " " + titleFormatted + "</h>";

	//create label div
	var infolabel = d3.select("body")
		.append("div")
		.attr("class", "infolabel")
		.attr("id", props.LABEL + "_label")
		.html(labelAttribute);
	var countyName = infolabel.append("div")
		.attr("class","labelname")
		.html(props.LABEL)
};
function moveLabel(){
	//get width of label
	var labelWidth = d3.select(".infolabel")
		.node()
        .getBoundingClientRect()
		.width;

	//use coords of mousemove event to set label coords
	var x1 = d3.event.clientX + 10,
			y1 = d3.event.clientY - 75,
			x2 = d3.event.clientX - labelWidth -10,
			y2 = d3.event.clientY +25;

	//horizontal label coord testing for overflow
	var x = d3.event.clientX > window.innerWidth - labelWidth - 20 ? x2 : x1;
	//vertical label coordinate, testing for overflow
	var y = d3.event.clientY < 75 ? y2 : y1;

	d3.select(".infolabel")
		.style("left", x + "px")
		.style("top", y + "px");
};
//set bottom div and data sources
function setDataSources(){
	var dataSources = d3.select("body")
			.append("div")
			.attr("class","dataSources")
			.text("Data sources: Counties: US Census, Internet and Poverty statistics: ACS 2018 5-Year Estimates, United States Census. Created by Garrett Fuelling, Cassandra Verras, Danielle Wyenberg, December 2020.")
};
function createDetroitTitle(){
	var firstPara = d3.select("#inner")
		.append("div")
		.attr("class","miTitle")
		.text("Case Study: Detroit, Michigan")
}
function createSeattleTitle(){
	var firstPara = d3.select("#inner")
		.append("div")
		.attr("class","waTitle")
		.text("Case Study: Seattle, Washington")
}
function createDetroitResourcesTitle(){
	var firstPara = d3.select("#mapid")
		.append("div")
		.attr("class","miTitle")
		.text("Community Resources: Detroit, Michigan")
}
})(); //run anonymous function
