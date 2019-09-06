function bringToFront(evt) {
  var element = evt.target; //get node reference
  element.parentNode.appendChild(element); //appendChild after the last child
}  


var margin = {top: 10, right: 10, bottom: 10, left: 10},
    dim = parseInt(d3.select("#chart").style("width")),
    width = dim - margin.left - margin.right,
    mapRatio = .5,
    height = (width / .80) * mapRatio,
    centered;

var projection = d3.geoAlbersUsa()
    .scale(width / 0.75)
    .translate([width / 2, height / 2]);

var path = d3.geoPath(projection)

var svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)

var g = svg.append("g");
                
queue()
    .defer(d3.json, "data/us-counties.json")
    .defer(d3.csv, "data/acprural.csv")
    .await(ready);


function ready(error, us, rural) {
  if (error) throw error;

  const countynameId = {},
        statenameId = {},
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
    countynameId[d.id] = d.countyname;
    statenameId[d.id] = d.statename;
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

  //create search box
  d3.select('#combobox').selectAll('.option')
    .data(rural).enter()
    .append("option")
    .attr('value', function(d) {return  d.id })
    .text(function(d) {return countynameId[d.id] + ', ' + statenameId[d.id]; })
    .sort(function(a,b) {return d3.ascending(a.statename, b.statename) || d3.ascending(a.countyname, b.countyname); }) 

  g.append("g")
    .attr("class", "counties")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.counties).features)
    .enter()
    .append("path")
    .attr("id", function(d) { return "county" + d.id; }) 
    .attr("fip", function(d) { return d.id; })
    .attr('class', function(d) { return "ctyPath" })
    .attr('ctyType', function(d) {return typeId[d.id] })
    .attr("d", path)
    .attr("fill", function(d) {
        if (colorId[d.id] === undefined ) {return "#ccc"}  
        else { return '#'+ colorId[d.id]; }
    })
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseout", mouseout)
    .on("click", click);

  g.append("path")
    .datum(topojson.mesh(us, us.objects.states, function(a, b) {
        return a.id !== b.id;
    }))
    .attr("class", "states")
    .attr("d", path);

  
  //---tooltip begin---
  var tooltip = d3.select("#chart")
    .append("div")
    .attr("id", "tooltip")
    .attr("class", "tooltip");

  function updatePosition(event) {
    var ttid = "#tooltip";
    var xOffset = 10;
    var yOffset = 10 //if tooltip is off a tad make sure the div is postition: static

    var ttw = $(ttid).width();
    var tth = $(ttid).height();
    var wscrY = $(window).scrollTop();
    var wscrX = $(window).scrollLeft();
    var curX = (document.all) ? event.clientX + wscrX : event.pageX;
    var curY = (document.all) ? event.clientY + wscrY : event.pageY;
    var ttleft = ((curX - wscrX + xOffset * 2 + ttw) > $(window).width()) ? curX - ttw - xOffset * 2 : curX + xOffset;
    if (ttleft < wscrX + xOffset) {
        ttleft = wscrX + xOffset;
    }
    var tttop = ((curY - wscrY + yOffset * 2 + tth) > $(window).height()) ? curY - tth - yOffset * 2 : curY + yOffset;
    if (tttop < wscrY + yOffset) {
        tttop = curY + yOffset;
    }
    $(ttid).css('top', tttop + 'px').css('left', ttleft + 'px');
  }

  function mouseover(d) {

    d3.selectAll('.ctyPath').attr('opacity', function(d) { return '0.15' })

    d3.select(this).classed("selected", true);

    d3.selectAll('.ctyPath[ctyType="' + this.getAttribute('ctyType') + '"]')
        .attr('fill', function(d) { return '#'+ colorId[d.id];})
        .attr('opacity', function(d) { return '1' }) 

    tooltip.style("visibility", "visible")
  };

  function mousemove(d, i) {

    tooltip.style("visibility", "visible")
        .style("top", d3.event.pageY + "20px")
        .style("left", d3.event.pageX + "px")
        .html(function() {
      
            if (countynameId[d.id] === undefined) 
                { return "Nonrural county" }
                                        
            else { return "<span class='tipHed'>" + countynameId[d.id] + ', ' + statenameId[d.id] + 
                "</span> <br> " + typenameId[d.id] + "<hr/><i>click for more information</i>"};

        });

    updatePosition(event);
  };

  function mouseout(d) {

    d3.selectAll('.ctyPath')
        .attr('opacity', function(d) { return '1' })

    d3.select(this).classed("selected", false);
    tooltip.style("visibility", "hidden")
  };

  function click(d) { 

    d3.selectAll('.ctyRect').style('visibility', 'hidden');

    d3.selectAll('.ctyRect[ctyType="' + this.getAttribute('ctyType') + '"]')
        .style('visibility', 'visible')
        .style('fill', function(d) { return '#'+ colorId[d.id];})
        .attr('opacity', function(d) { return '1' }) 

  }


  //search
  $('.combobox').combobox()

  function removeSelectedCounty() { 
    d3.selectAll('.ctyPath')
      .classed("selected", false)
      .attr('opacity', function(d) { return 0.15 })
  };

  function clearSelectedCounty() { 
    d3.selectAll('.ctyPath')
      .classed("selected", false)
      .attr('opacity', function(d) { return 1 })
  };

  $('input[type="hidden"]').change(function(){
    var ctyFip = $(this).val();
    var ctyType = d3.selectAll('.ctyPath[fip="' + ctyFip + '"]').attr('ctyType');
    removeSelectedCounty();

    d3.selectAll('.ctyPath[fip="' + ctyFip + '"]')
        .classed("selected", true)
        .attr('opacity', 1 )


    d3.selectAll('.ctyPath[ctyType="' + ctyType + '"]')
        .attr('fill', function(d) { return '#'+ colorId[d.id];})
        .attr('opacity', function(d) { return '1' }) 

    tooltip.style("visibility", "hidden")
  });             

  d3.select('.combobox-clear').on('click', clearSelectedCounty)

};
