//anonymous funcion
(function(){
	//array of integer csv fields
var attrIntArray = ["hascomputer","dialup","broadband","nointernet","nocomputer","totalpopover16","laborforceparticipationrate","unemploymentrate","popabove20underpovertylevel"];
//array of string csv fields
var attrStrArray = ["LABEL"];
//array of csv fields formatted for dropdown options
var chartTitleArray = ["Has Computer","Dialup","Broadband","No Internet","No Computer", "Total Population 16+","Labor Participation Rate","Unemployment Rate","Pop 20+ Below Poverty Level"];
//array of csv fields formatted for popups
var chartPopupArray = ["households have a computer","households have dialup","households have broadband","households have no internet","households have no computer", "= Total Population 16+","% Labor Participation","% Unemployment","Pop 20+ Below Poverty Level"];
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
//create a scale to size bar proportionally to fram and for axis
var yScale = d3.scaleLinear()
					.range([chartInnerHeight, 0])
					.domain([0, 50]);
//begin script when window loads
window.onload = drawMap();
window.onload = createFirstPara();
window.onload = drawDetroitMap();

//MAIN COUNTRYWIDE FUNCTION
async function drawMap(){
	//set up header div and title
	//map frame dimensions
	 var width = window.innerWidth * 0.7,
	 	height = 460;
	//create new svg container for the map
	var map = d3.select("body")
		.append("svg")
		.attr("class", "map")
		.attr("width", width)
		.attr("height", height);
	//create Albers equal area conic projection centered on Michigan
	var projection = d3.geoAlbers()
		.center([-98, 36])
		.rotate([-2, 0])
		.parallels([-40, 40])
		.scale(1000)
		.translate([width / 2, height / 2]);
		//create path
	var path = d3.geoPath().projection(projection);
	// pull in data
  d3.queue()
    .defer(d3.csv,"data/csvCountiesInternet.csv")
    .defer(d3.json,"data/usCounties_Contig.topojson")
    .await(callback);
	//callback function
	function callback(error, internetCounties, counties){
		//call graticule generator
		//setGraticule(map,path);
		//translate counties TopoJSON
		usCounties = topojson.feature(counties, counties.objects.usCounties_Contig).features;
		//use turf library to draw geometry in clockwise to correct data display issues
		// miCounties.forEach(function(feature){
		// 	feature.geometry = turf.rewind(feature.geometry, {reverse:true});
		// })
		//join csv data to geojson enumeration units
		usCounties = joinData(usCounties,internetCounties);
		//create color scale for enumeration units
		var colorScale = makeColorScale(internetCounties);
		//add enumeration units to the map
		setEnumerationUnits(usCounties,map,path,colorScale);
		//create dropdown
		createDropdown(internetCounties);
		//create side panel
		sidePanel();
		//create chart
		//setChart(internetCounties,colorScale);

        //create pie chart
        setPieChart();

		//create bottom div and sources
		setDataSources();
	};
};
//MAIN DETROIT function
async function drawDetroitMap(){
	//set up header div and title
	//map frame dimensions
	 var width = window.innerWidth * 0.7,
	 	height = 460;
	//create new svg container for the map
	var map = d3.select("body")
		.append("svg")
		.attr("class", "map")
		.attr("width", width)
		.attr("height", height);
	//create Albers equal area conic projection centered on Michigan
	var projection = d3.geoAlbers()
		.center([-85, 42.5])
		.rotate([-2, 0])
		.parallels([-40, 40])
		.scale(29000)
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
    .defer(d3.csv,"data/csvMiTractsInternet.csv")
    .defer(d3.json,"data/miTracts.topojson")
    .await(callback);
	//callback function
	function callback(error,internetMiTracts, miTracts){
		//translate counties TopoJSON
		miTracts = topojson.feature(miTracts, miTracts.objects.miTracts).features;
		//use turf library to draw geometry in clockwise to correct data display issues
		// miCounties.forEach(function(feature){
		// 	feature.geometry = turf.rewind(feature.geometry, {reverse:true});
		// })
		//join csv data to geojson enumeration units
		miTracts = joinDetroitData(miTracts,internetMiTracts);
		//create color scale for enumeration units
		var colorScale = makeColorScale(internetMiTracts);
		//add enumeration units to the map
		setDetroitEnumerationUnits(miTracts,map,path,colorScale);
		//create dropdown
		createDropdown(internetMiTracts);
		//create side panel
		//sidePanel();
		//create chart
		//setChart(internetCounties,colorScale);

        //create pie chart
        //setPieChart();

		//create bottom div and sources
		//setDataSources();
	};
};
function makeColorScale(csvData){
	//create color scale array
	var colorClasses = [
		"#52212C",
		"#9C7981",
		"#36454F",
		"#929C5A",
		"#465200"
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
	console.log("domain array: ",domainArray);
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
		var csvKey = csvCounty.geo_id.slice(-5); //csv county field
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
	console.log(geoJson);
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
	console.log(geoJson);
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
			highlight(d.properties)
		})
		.on("mouseout", function(d){
			dehighlight(d.properties);
		})
		.on("mousemove", moveLabel);
		var desc = tracts.append("desc")
			.text('{"stroke": "#000", "stroke-width": "0.5px"}');
};
function setGraticule(map,path){
	var graticule = d3.geoGraticule()
	 .step([2, 2]); //place graticule lines every 2 degrees of longitude and latitude
	//create graticule background
	var gratBackground = map.append("path")
	 .datum(graticule.outline()) //bind graticule background
	 .attr("class", "gratBackground") //assign class for styling
	 .attr("d", path); //project graticule
 //create graticule lines
 var gratLines = map.selectAll(".gratLines") //select graticule elements that will be created
	 .data(graticule.lines()) //bind graticule lines to each element to be created
		 .enter() //create an element for each datum
	 .append("path") //append each element to the svg as a path element
	 .attr("class", "gratLines") //assign class for styling
	 .attr("d", path); //project graticule lines
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

function setPieChart(){
    var data = [10,20,100];

    var radius = Math.min(chartWidth, chartHeight) /2;

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
        .outerRadius(radius-40)
        .innerRadius(radius-40);

    var pie = d3.pie()
        .sort(null)
        .value(function(d) {return d; });

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
        .style("fill", function(d) {return color(d.data); });

    g.append("text")
      .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
      .attr("dy", ".35em")
      .text(function(d) { return d.data; });


}
function createDropdown(csvData){
	//determine the census data level for to differentiate .attr("class")
	var censusLevel = csvData[0].geo_id.substring(0,2);
	console.log(censusLevel);
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
					changeAttribute(this.value, csvData)
				});
	//add initial option
	var titleOption = dropdown.append("option")
				.attr("class", "titleOption")
				.attr("disabled", "true")
				.text("Select Attribute");
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
	//get variable to determine census level - counties or tracts
	var censusLevel = csvData[0].geo_id.substring(0,2);
	//determine census level - counties or tracts
	var classType = classType(censusLevel);
	console.log(classType);
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
  var formatted = (props[expressed]);
  var titleFormatted = chartPopupArray[attrIntArray.indexOf(expressed)];
  //console.log(props[expressed]);
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
//not working
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
//create side panel
function sidePanel(){
	var panel = d3.select("body")
			.append("div")
			.attr("class","sidePanel")
			.text("TESTING");
}
//set bottom div and data sources
function setDataSources(){
	var dataSources = d3.select("body")
			.append("div")
			.attr("class","dataSources")
			.text("Data sources: Counties: US Census, Internet and Poverty statistics: ACS 2018 5-Year Estimates, United States Census. Created by Garrett Fuelling, Cassandra Verras, Danielle Wyenberg, December 2020.")
};
function createFirstPara(){
	var firstPara = d3.select("body")
		.append("div")
		.attr("class","firstPara")
		.text("The blah blah blah is blah blah blah imagine really enlightening text here testing testing when are we getting our lab 2 grades, when can we see other peoples lab two?? testing testing should we / can we write from a text file for this portion? How is that usually done? Should this actually be in a side scrolling panel?")
}
})(); //run anonymous function
