var margin = {top: 20, right: 30, bottom: 40, left: 165},
    dim = Math.min(parseInt(d3.select("#chart").style("width")), parseInt(d3.select("#chart").style("height"))),
    width = dim - margin.left - margin.right,
    mapRatio = .5,
    height = (width / .80) * mapRatio,
    centered;

var projection = d3.geoAlbersUsa()
    .scale(width / 0.75)
    .translate([width / 2, height / 2]);

var path = d3.geoPath(projection)
    //.projection();

/*var zoom = d3.behavior.zoom()
    .translate(projection.translate())
    .scale(projection.scale())
    .scaleExtent([2.14 * height, 12 * height])
    .on("zoom", zoomed);*/

d3.select(window).on('resize', responsive);

function responsive() {
    // adjust things when the window size changes
    width = parseInt(d3.select('#main').style('width'));
    width = width - margin.left - margin.right;
    height = width * mapRatio;
    // update projection
    projection.translate([width / 2, height / 2])
        .scale(width);
    // resize the map container
    main.style('width', width + 'px')
        .style('height', height + 'px');
    // resize the map
    main.select('.land').attr('d', path);
    main.selectAll('.state').attr('d', path);
}

var svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    //.call(zoom);

var g = svg.append("g");
                
queue()
    .defer(d3.json, "data/us-counties.json")
    .defer(d3.csv, "data/acprural.csv")
    .await(ready);


function ready(error, us, rural) {
  if (error) throw error;

  const countynameId = {},
        typeId = {},
        typenameId = {},
        colorId = {},

        healthId = {},
        hhIncomeId = {},
        houseBuiltId = {},
        medHomeId = {},
        milesId = {},
        nhWhiteId = {},
        popCngId = {},
        someCollId = {},
        uninsuredId = {};


  rural.forEach(function(d) {
    //fipsId[d.id] = +d.fips;
    countynameId[d.id] = d.countyname;
    typeId[d.id] = +d.type;
    typenameId[d.id] = d.typename;
    colorId[d.id] = d.color;

    healthId[d.id] = +d.health;
    hhIncomeId[d.id] = +d.hhIncome;
    houseBuiltId[d.id] = +d.houseBuilt;
    medHomeId[d.id] = +d.medHome;
    milesId[d.id] = +d.miles;
    nhWhiteId[d.id] = +d.nhWhite;
    popCngId[d.id] = +d.popCng;
    someCollId[d.id] = +d.someColl;
    uninsuredId[d.id] = +d.uninsured;
  
  });

  g.append("g")
    .attr("class", "counties")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.counties).features)
    .enter()
    .append("path")
    .attr("id", function(d) {
        return d.id;
    })
    .attr("d", path)
    .attr("fill", function(d) {
        if (colorId[d.id] === undefined ) {return "#aaa"}  
        else { return '#'+ colorId[d.id]; }
    })

  g.append("path")
    .datum(topojson.mesh(us, us.objects.states, function(a, b) {
        return a.id !== b.id;
    }))
    .attr("class", "states")
    .attr("d", path);




};
