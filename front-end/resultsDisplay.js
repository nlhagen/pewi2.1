//RadarChart Object,
// Code modified, animation tweens, mouseover interaction, and some logic
//     interfacing are original to us

//  Our Code based on Bremer's Code based on Graves's code
//          Bremer:  see post at https://bl.ocks.org/nbremer/6506614
//          Graves:  see alangrafu on gitHub

//Radar prototype with construction function
var RadarChart = {
  draw: function(id, d, options, mouseoverClass, radarClassElementsString) {
    var cfg = {
      radius: 5,
      w: 600,
      h: 600,
      factor: 1,
      factorLegend: 0.85,
      levels: 3,
      maxValue: 0,
      radians: 2 * Math.PI,
      opacityArea: 0.2,
      ToRight: 5,
      TranslateX: 70, //95
      TranslateY: 30, //25
      ExtraWidthX: 100,
      ExtraWidthY: 100,
      color: d3.scaleOrdinal(d3.schemeCategory10)
    };
    if ('undefined' !== typeof options) {
      for (var i in options) {
        if ('undefined' !== typeof options[i]) {
          cfg[i] = options[i];
        }
      }
    }
    cfg.maxValue = Math.max(cfg.maxValue, d3.max(d, function(i) {
      return d3.max(i.map(function(o) {
        return o.value;
      }));
    }));
    var allAxis = (d[0].map(function(i, j) {
      return i.axis;
    }));
    var total = allAxis.length;
    var radius = cfg.factor * Math.min(cfg.w / 2, cfg.h / 2);
    var Format = d3.format('%');
    d3.select(id).select("svg").remove();

    var g = d3.select(id)
      .append("svg")
      .attr("width", cfg.w * 1.97) //384
      .attr("height", cfg.h * 1.23) //239
      .append("g")
      .attr("transform", "translate(" + cfg.TranslateX + "," + cfg.TranslateY + ")");

    var mouseoverInfo = d3.select(id)
      .append('g')
      .attr('class', mouseoverClass);

    mouseoverInfo.append('div')
      .attr('class', 'label');

    mouseoverInfo.append('div')
      .attr('class', 'count');

    mouseoverInfo.append('div')
      .attr('class', 'score');

    //Circular segments
    for (var j = 0; j < cfg.levels - 1; j++) {
      var levelFactor = cfg.factor * radius * ((j + 1) / cfg.levels);
      g.selectAll(".levels")
        .data(allAxis)
        .enter()
        .append("svg:line")
        .attr("x1", function(d, i) {
          return levelFactor * (1 - cfg.factor * Math.sin(i * cfg.radians / total));
        })
        .attr("y1", function(d, i) {
          return levelFactor * (1 - cfg.factor * Math.cos(i * cfg.radians / total));
        })
        .attr("x2", function(d, i) {
          return levelFactor * (1 - cfg.factor * Math.sin((i + 1) * cfg.radians / total));
        })
        .attr("y2", function(d, i) {
          return levelFactor * (1 - cfg.factor * Math.cos((i + 1) * cfg.radians / total));
        })
        .attr("class", "line")
        .style("stroke", "grey")
        .style("stroke-opacity", "0.75")
        .style("stroke-width", "0.3px")
        .attr("transform", "translate(" + (cfg.w / 2 - levelFactor) + ", " + (cfg.h / 2 - levelFactor) + ")");
    }

    //Text indicating at what % each level is
    for (var j = 0; j < cfg.levels; j++) {
      var levelFactor = cfg.factor * radius * ((j + 1) / cfg.levels);
      g.selectAll(".levels")
        .data([1]) //dummy data
        .enter()
        .append("svg:text")
        .attr("x", function(d) {
          return levelFactor * (1 - cfg.factor * Math.sin(0));
        })
        .attr("y", function(d) {
          return levelFactor * (1 - cfg.factor * Math.cos(0));
        })
        .attr("class", "legend")
        .style("font-family", "sans-serif")
        .style("font-size", "10px")
        .attr("transform", "translate(" + (cfg.w / 2 - levelFactor + cfg.ToRight) + ", " + (cfg.h / 2 - levelFactor) + ")")
        .attr("fill", "#737373")
        .text(((j + 1) * cfg.maxValue / cfg.levels).toFixed(2) * 100);
    }

    series = 0;

    var axis = g.selectAll(".axis")
      .data(allAxis)
      .enter()
      .append("g")
      .attr("class", "axis");

    axis.append("line")
      .attr("x1", cfg.w / 2)
      .attr("y1", cfg.h / 2)
      .attr("x2", function(d, i) {
        return cfg.w / 2 * (1 - cfg.factor * Math.sin(i * cfg.radians / total));
      })
      .attr("y2", function(d, i) {
        return cfg.h / 2 * (1 - cfg.factor * Math.cos(i * cfg.radians / total));
      })
      .attr("class", "line")
      .style("stroke", "grey")
      .style("stroke-width", "1px");

    axis.append("text")
      .attr("class", "legend")
      .text(function(d) {
        return d;
      })
      .style("font-family", "sans-serif")
      .style("font-size", "11px")
      .attr("text-anchor", "middle")
      .attr("dy", "3.3em")
      .attr("transform", function(d, i) {
        return "translate(0, -40.7)";
      })
      .attr("x", function(d, i) {
        return cfg.w / 2 * (1 - cfg.factorLegend * Math.sin(i * cfg.radians / total)) - 60 * Math.sin(i * cfg.radians / total);
      })
      .attr("y", function(d, i) {
        return cfg.h / 2 * (1 - Math.cos(i * cfg.radians / total)) - 20 * Math.cos(i * cfg.radians / total);
      });


    d.forEach(function(y, x) {
      dataValues = [];
      g.selectAll(".nodes")
        .data(y, function(j, i) {
          dataValues.push([
            cfg.w / 2 * (1 - (parseFloat(Math.max(j.value, 0)) / cfg.maxValue) * cfg.factor * Math.sin(i * cfg.radians / total)),
            cfg.h / 2 * (1 - (parseFloat(Math.max(j.value, 0)) / cfg.maxValue) * cfg.factor * Math.cos(i * cfg.radians / total))
          ]);
        });
      dataValues.push(dataValues[0]);
      g.selectAll(".area")
        .data([dataValues])
        .enter()
        .append("polygon")
        .attr("id", function(d, i) {
          return radarClassElementsString + "polygon-serie" + series + "num" + i;
        })
        .attr("class", radarClassElementsString + series)
        .style("stroke-width", "2px")
        .style("stroke", cfg.color(series))
        .attr("points", function(d) {
          var str = "";
          for (var pti = 0; pti < d.length; pti++) {
            str = str + d[pti][0] + "," + d[pti][1] + " ";
          }
          return str;
        })
        .style("fill", function(j, i) {
          return cfg.color(series);
        })
        .style("fill-opacity", cfg.opacityArea)
        .on('mouseover', function(d) {

        })
        .on('mouseout', function() {})
        .transition()
        .duration(900)
        .styleTween("fill-opacity", function() {
          //animate the change of the color gradient from black to bright blue
          return d3.interpolate(0, cfg.opacityArea);
        });
      series++;
    });
    series = 0;


    d.forEach(function(y, x) {
      g.selectAll(".nodes")
        .data(y).enter()
        .append("svg:circle")
        .attr("id", function(d, i) {
          return radarClassElementsString + "circle-serie" + series + "num" + i;
        })
        .attr("class", radarClassElementsString + series)
        .attr('r', cfg.radius)
        .attr("alt", function(j) {
          return Math.max(j.value, 0);
        })
        .attr("cx", function(j, i) {
          dataValues.push([
            cfg.w / 2 * (1 - (parseFloat(Math.max(j.value, 0)) / cfg.maxValue) * cfg.factor * Math.sin(i * cfg.radians / total)),
            cfg.h / 2 * (1 - (parseFloat(Math.max(j.value, 0)) / cfg.maxValue) * cfg.factor * Math.cos(i * cfg.radians / total))
          ]);
          return cfg.w / 2 * (1 - (Math.max(j.value, 0) / cfg.maxValue) * cfg.factor * Math.sin(i * cfg.radians / total));
        })
        .attr("cy", function(j, i) {
          return cfg.h / 2 * (1 - (Math.max(j.value, 0) / cfg.maxValue) * cfg.factor * Math.cos(i * cfg.radians / total));
        })
        .attr("data-id", function(j) {
          return j.axis;
        })
        .style("fill", function(d, i) {
          return cfg.color(series);
        })
        .style("fill-opacity", 0.9)
        .on('mouseover', function(d) {
          newX = parseFloat(d3.select(this).attr('cx')) - 10;
          newY = parseFloat(d3.select(this).attr('cy')) - 5;

          z = "polygon." + d3.select(this).attr("class");
          g.selectAll("polygon")
            .transition(200)
            .style("fill-opacity", 0.1);
          g.selectAll(z)
            .transition(200)
            .style("fill-opacity", 0.7);

          d3.select(this).attr("r", 15);

          mouseoverInfo.select('.label').html(d.label);
          mouseoverInfo.select('.count').html(d.raw);
          mouseoverInfo.select('.score').html(Math.round(d.value * 1000) / 10 + "/100");
          mouseoverInfo.style('border-color', d3.select(this).style("fill"));
          mouseoverInfo.style('display', 'block');

        })
        .on('mouseout', function() {
          d3.select(this).attr("r", cfg.radius);
          mouseoverInfo.style('display', 'none');

          g.selectAll("polygon")
            .transition(200)
            .style("fill-opacity", cfg.opacityArea);

        })
        .text(function(j) {
          return Math.max(j.value, 0);
        })
        .transition()
        .duration(900)
        .attrTween("cy", function() {
          //animate the change of the color gradient from black to bright blue
          return d3.interpolate(150, this.getAttribute("cy"));
        })
        .attrTween("cx", function() {
          //animate the change of the color gradient from black to bright blue
          return d3.interpolate(150, this.getAttribute("cx"));
        });

      series++;
    });

  }
}; //End Radar Object

var tempResult;

//displayResults writes the html for the results iframe with updates results from Totals
function displayResults() {

  //Create results table and append it to the proper tab of the results frame
  var numericalTableString = generateResultsTable();

  generateEconomicsTables();

  document.getElementById('resultsFrame').contentWindow.document.getElementById('contentsN').innerHTML = numericalTableString;

  //refresh frame properties
  document.getElementById('resultsFrame').contentWindow.refreshPie();

  //create land Pie Chart
  drawD3LandPieChart(currentYear, false);

  //create econ Pie Chart
  drawD3EconPieChart(currentYear, false);

  //create precipitation Bar Graph
  drawPrecipitationInformationChart();

  //DEPRECATED, (create ecosystem indicators aster plot
  //drawEcosystemIndicatorsDisplay(currentYear);
  //============= END DEPRECATED

  //create the radar plots
  var tempObj = []; //get an array of years to display
  for (var y = 1; y <= boardData[currentBoard].calculatedToYear; y++) {
    tempObj.push(y);
  } //end for

  //create our top Radar plot, of the ecosystem indicators
  drawEcosystemRadar(tempObj);
  //create our bottom Radar plot, of the yield scores
  // drawYieldRadar(tempObj);

  // toggle the legend checkboxes for both of the radar plots on the page
  // document.getElementById('resultsFrame').contentWindow.toggleYearCheckboxes(); //XXX

  //toggle the arrows on the results page
  document.getElementById('resultsFrame').contentWindow.toggleYearForLandPlotBy(0);
  document.getElementById('resultsFrame').contentWindow.toggleYearForEconPlotBy(0);

  //=======DEPRECATED
  //document.getElementById('resultsFrame').contentWindow.toggleYearForESIAsterBy(0);
  //=======END DEPRECATED

} //end displayResults

// this function creates the pie chart at the top of the graphics in the results page
//it uses d3 and has the option to be displayed by categories or by a complete listing
function drawD3LandPieChart(year, isTheChartInCategoryMode) {
  // RESETTING THE TEMPORARY COLOR AND LEGEND ELEMENT nameArray
  tempLegendItems = [];
  tempLegendColors = [];
  //remove the html that's already there, ie clear the chart
  document.getElementById('resultsFrame').contentWindow.document.getElementById('landusePieChart').innerHTML = " ";
  //pass data to the page that it needs, we do this by putting it in hidden divs
  document.getElementById('resultsFrame').contentWindow.document.getElementById('landYear').innerHTML = year;
  document.getElementById('resultsFrame').contentWindow.document.getElementById('upTo').innerHTML = boardData[currentBoard].calculatedToYear;

  var inMultiplayer = localStorage.getItem('LSinMultiplayer');
  /*
  * The variable multiplayerColorPack is used to hold the colors that represent each player in the the multiplayer set up mode.
  * For more information refer to Issue 386.
  */
  var multiplayerColorPack = ["#87ceee","#e6bb00","#cc6578","#127731","#c97b08","#302485"];
  var dataset;
  // console.log("Before, inMultiplayer is: "+inMultiplayer);
  //if in multiplayer mode, looking at different players and size of land each owns
  if(inMultiplayer === "true"){
    // console.log("inMultiplayer is: "+inMultiplayer);
    var dataset = [{
      label: 'Player 1',
      count: (Math.round(Totals.landUseResults[year].conventionalCornLandUse / Totals.totalArea * 100 * 10) / 10),
      number: (Math.round(Totals.landUseResults[year].conventionalCornLandUse * 10) / 10)
    }, {
      label: 'Player 2',
      count: (Math.round(Totals.landUseResults[year].conservationCornLandUse / Totals.totalArea * 100 * 10) / 10),
      number: (Math.round(Totals.landUseResults[year].conservationCornLandUse * 10) / 10)
    }, {
      label: 'Player 3',
      count: (Math.round(Totals.landUseResults[year].conventionalSoybeanLandUse / Totals.totalArea * 100 * 10) / 10),
      number: (Math.round(Totals.landUseResults[year].conventionalSoybeanLandUse * 10) / 10)
    }, {
      label: 'Player 4',
      count: (Math.round(Totals.landUseResults[year].conservationSoybeanLandUse / Totals.totalArea * 100 * 10) / 10),
      number: (Math.round(Totals.landUseResults[year].conservationSoybeanLandUse * 10) / 10)
    }, {
      label: 'Player 5',
      count: (Math.round(Totals.landUseResults[year].alfalfaLandUse / Totals.totalArea * 100 * 10) / 10),
      number: (Math.round(Totals.landUseResults[year].alfalfaLandUse * 10) / 10)
    }, {
      label: 'Player 6',
      count: (Math.round(Totals.landUseResults[year].permanentPastureLandUse / Totals.totalArea * 100 * 10) / 10),
      number: (Math.round(Totals.landUseResults[year].permanentPastureLandUse * 10) / 10)
    }];
  }
  //assign dataset based on whether or not categories are toggeled on, if so, then combine the dataset into one large heap
  else if (isTheChartInCategoryMode) {
    // console.log("inMultiplayer is: "+inMultiplayer);
    //data groupings, dummy labels are there to increase color contrast
    dataset = [{
      label: "Annual Grain",
      count: (Math.round(Totals.landUseResults[year].conventionalCornLandUse / Totals.totalArea * 100 * 10) / 10) + (Math.round(Totals.landUseResults[year].conservationCornLandUse / Totals.totalArea * 100 * 10) / 10),
      number: (Math.round(Totals.landUseResults[year].conventionalCornLandUse * 10) / 10) + (Math.round(Totals.landUseResults[year].conservationCornLandUse * 10) / 10)
    }, {
      label: "dummy1",
      count: 0,
      number: 0
    }, {
      label: "Annual Legume",
      count: (Math.round(Totals.landUseResults[year].conventionalSoybeanLandUse / Totals.totalArea * 100 * 10) / 10) + (Math.round(Totals.landUseResults[year].conservationSoybeanLandUse / Totals.totalArea * 100 * 10) / 10),
      number: (Math.round(Totals.landUseResults[year].conventionalSoybeanLandUse * 10) / 10) + (Math.round(Totals.landUseResults[year].conservationSoybeanLandUse * 10) / 10)
    }, {
      label: "dummy2",
      count: 0,
      number: 0
    }, {
      label: 'Mixed Fruits/Vegetables',
      count: (Math.round(Totals.landUseResults[year].mixedFruitsVegetablesLandUse / Totals.totalArea * 100 * 10) / 10),
      number: (Math.round(Totals.landUseResults[year].mixedFruitsVegetablesLandUse * 10) / 10)
    }, {
      label: "dummy3",
      count: 0,
      number: 0
    }, {
      label: "Pasture",
      count: (Math.round(Totals.landUseResults[year].permanentPastureLandUse / Totals.totalArea * 100 * 10) / 10) + (Math.round(Totals.landUseResults[year].rotationalGrazingLandUse / Totals.totalArea * 100 * 10) / 10),
      number: (Math.round(Totals.landUseResults[year].permanentPastureLandUse * 10) / 10) + (Math.round(Totals.landUseResults[year].rotationalGrazingLandUse * 10) / 10)
    }, {
      label: "dummy4",
      count: 0,
      number: 0
    }, {
      label: "Non-pasture Perennial Herbs",
      count: (Math.round(Totals.landUseResults[year].grassHayLandUse / Totals.totalArea * 100 * 10) / 10) + (Math.round(Totals.landUseResults[year].switchgrassLandUse / Totals.totalArea * 100 * 10) / 10) + (Math.round(Totals.landUseResults[year].prairieLandUse / Totals.totalArea * 100 * 10) / 10) + (Math.round(Totals.landUseResults[year].wetlandLandUse / Totals.totalArea * 100 * 10) / 10),
      number: (Math.round(Totals.landUseResults[year].grassHayLandUse * 10) / 10) + (Math.round(Totals.landUseResults[year].switchgrassLandUse * 10) / 10) + (Math.round(Totals.landUseResults[year].prairieLandUse * 10) / 10) + (Math.round(Totals.landUseResults[year].wetlandLandUse * 10) / 10)
    }, {
      label: "dummy5",
      count: 0,
      number: 0
    }, {
      label: 'Perennial Legume',
      count: (Math.round(Totals.landUseResults[year].alfalfaLandUse / Totals.totalArea * 100 * 10) / 10),
      number: (Math.round(Totals.landUseResults[year].alfalfaLandUse * 10) / 10)
    }, {
      label: "dummy6",
      count: 0,
      number: 0
    }, {
      label: "Perennial Woodland",
      count: (Math.round(Totals.landUseResults[year].conventionalForestLandUse / Totals.totalArea * 100 * 10) / 10) + (Math.round(Totals.landUseResults[year].conservationForestLandUse / Totals.totalArea * 100 * 10) / 10) + (Math.round(Totals.landUseResults[year].shortRotationWoodyBioenergyLandUse / Totals.totalArea * 100 * 10) / 10),
      number: (Math.round(Totals.landUseResults[year].conventionalForestLandUse * 10) / 10) + (Math.round(Totals.landUseResults[year].conservationForestLandUse * 10) / 10) + (Math.round(Totals.landUseResults[year].shortRotationWoodyBioenergyLandUse * 10) / 10)
    }];
  }
  //else we'll set it up for listing all of the land types
  else {

    var dataset = [{
      label: 'Conventional Corn',
      count: (Math.round(Totals.landUseResults[year].conventionalCornLandUse / Totals.totalArea * 100 * 10) / 10),
      number: (Math.round(Totals.landUseResults[year].conventionalCornLandUse * 10) / 10)
    }, {
      label: 'Conservation Corn',
      count: (Math.round(Totals.landUseResults[year].conservationCornLandUse / Totals.totalArea * 100 * 10) / 10),
      number: (Math.round(Totals.landUseResults[year].conservationCornLandUse * 10) / 10)
    }, {
      label: 'Conventional Soybean',
      count: (Math.round(Totals.landUseResults[year].conventionalSoybeanLandUse / Totals.totalArea * 100 * 10) / 10),
      number: (Math.round(Totals.landUseResults[year].conventionalSoybeanLandUse * 10) / 10)
    }, {
      label: 'Conservation Soybean',
      count: (Math.round(Totals.landUseResults[year].conservationSoybeanLandUse / Totals.totalArea * 100 * 10) / 10),
      number: (Math.round(Totals.landUseResults[year].conservationSoybeanLandUse * 10) / 10)
    }, {
      label: 'Mixed Fruits/Vegetables',
      count: (Math.round(Totals.landUseResults[year].mixedFruitsVegetablesLandUse / Totals.totalArea * 100 * 10) / 10),
      number: (Math.round(Totals.landUseResults[year].mixedFruitsVegetablesLandUse * 10) / 10)
    }, {
      label: 'Permanent Pasture',
      count: (Math.round(Totals.landUseResults[year].permanentPastureLandUse / Totals.totalArea * 100 * 10) / 10),
      number: (Math.round(Totals.landUseResults[year].permanentPastureLandUse * 10) / 10)
    }, {
      label: 'Rotational Grazing',
      count: (Math.round(Totals.landUseResults[year].rotationalGrazingLandUse / Totals.totalArea * 100 * 10) / 10),
      number: (Math.round(Totals.landUseResults[year].rotationalGrazingLandUse * 10) / 10)
    }, {
      label: 'Grass Hay',
      count: (Math.round(Totals.landUseResults[year].grassHayLandUse / Totals.totalArea * 100 * 10) / 10),
      number: (Math.round(Totals.landUseResults[year].grassHayLandUse * 10) / 10)
    }, {
      label: 'Switchgrass',
      count: (Math.round(Totals.landUseResults[year].switchgrassLandUse / Totals.totalArea * 100 * 10) / 10),
      number: (Math.round(Totals.landUseResults[year].switchgrassLandUse * 10) / 10)
    }, {
      label: 'Prairie',
      count: (Math.round(Totals.landUseResults[year].prairieLandUse / Totals.totalArea * 100 * 10) / 10),
      number: (Math.round(Totals.landUseResults[year].prairieLandUse * 10) / 10)
    }, {
      label: 'Wetland',
      count: (Math.round(Totals.landUseResults[year].wetlandLandUse / Totals.totalArea * 100 * 10) / 10),
      number: (Math.round(Totals.landUseResults[year].wetlandLandUse * 10) / 10)
    }, {
      label: 'Alfalfa',
      count: (Math.round(Totals.landUseResults[year].alfalfaLandUse / Totals.totalArea * 100 * 10) / 10),
      number: (Math.round(Totals.landUseResults[year].alfalfaLandUse * 10) / 10)
    }, {
      label: 'Conventional Forest',
      count: (Math.round(Totals.landUseResults[year].conventionalForestLandUse / Totals.totalArea * 100 * 10) / 10),
      number: (Math.round(Totals.landUseResults[year].conventionalForestLandUse * 10) / 10)
    }, {
      label: 'Conservation Forest',
      count: (Math.round(Totals.landUseResults[year].conservationForestLandUse / Totals.totalArea * 100 * 10) / 10),
      number: (Math.round(Totals.landUseResults[year].conservationForestLandUse * 10) / 10)
    }, {
      label: 'Short Rotation Woody Bioenergy',
      count: (Math.round(Totals.landUseResults[year].shortRotationWoodyBioenergyLandUse / Totals.totalArea * 100 * 10) / 10),
      number: (Math.round(Totals.landUseResults[year].shortRotationWoodyBioenergyLandUse * 10) / 10)
    }];
  } //dataset is assigned now

  //variables for the display of the chart on the page
  // be careful about changing these values since they are tied closely to
  // css styling on results page
  // var width = 360;
  // var height = 360;
  // var radius = Math.min(width, height) / 2;
  var w = Math.round(window.innerWidth * 0.38);
  var h = Math.round(window.innerHeight * 0.382);

  // if the pie chart is being drawn to be printed on a pdf then set the fixed size
  if (printMode) {
    w = h = 200;
  }

  var pieChart_length = Math.min(w, h);
  var legendW = Math.round(pieChart_length * 1.06);

  var radius = pieChart_length / 2;

  //colors are assigned from one of the default scaling options
  //if in multiplayer mode the color options will change else it will use default d3 schemeCategory20 colors
  if(localStorage.getItem('LSinMultiplayer')==="true"){
    var color = d3.scaleOrdinal(multiplayerColorPack);
  }
  else{
    var color = d3.scaleOrdinal(d3.schemeCategory20);
  }

  //set up an object and array for referring back and forth to elements
  var nameArray = [];
  var colorLinker = {};

  //document.getElementById('resultsFrame').contentWindow.document.getElementById('chart').innerHTML = "" ;
  var chart = document.getElementById('resultsFrame').contentWindow.document.getElementById('landusePieChart');

  //d3 stuff here, I won't comment this section too heavily as it is mostly typical graphics
  var svg = d3.select(chart)
    .append('svg')
    .attr("class", "graph-svg-component")
    .attr("id", "pieSVG")
    // .attr('width', width + legendW) //leave room for legend so add 280
    // .attr('height', height)
    .attr('width', pieChart_length + legendW) //leave room for legend so add 280
    .attr('height', pieChart_length)
    .append('g')
    .attr('transform', 'translate(' + (pieChart_length / 2) + ',' + (pieChart_length / 2) + ')');

  var arc = d3.arc()
    .outerRadius(radius)
    .innerRadius(radius * 0.55)
    .padAngle(0.01);

  var pie = d3.pie()
    .value(function(d) {
      return d.count;
    })
    .sort(null);

  //animation for the pie graph
  function tweenPie(b) {
    b.innerRadius = 0;
    var i = d3.interpolate({
      startAngle: 0,
      endAngle: 0
    }, b);
    return function(t) {
      return arc(i(t));
    };
  }

  //create the elements for hover over information
  var mouseoverInfo = d3.select(chart)
    .append('g')
    .attr('class', 'mouseoverInfo');

  mouseoverInfo.append('div')
    .attr('class', 'label');

  mouseoverInfo.append('div')
    .attr('class', 'count');

  mouseoverInfo.append('div')
    .attr('class', 'percent');

  //let's add the arcs to the pie graph now
  var path = svg.selectAll('path')
    .data(pie(dataset))
    .enter()
    .append('path')
    .attr('class', 'dataArc')
    .attr('d', arc)
    .attr('count', function(d) {
      return d.data.number;
    })
    .attr('percent', function(d) {
      return d.data.count;
    })
    .attr('fill', function(d, i) {
      var hue = color(d.data.label);
      //use these structures to keep track of what actually has a count
      // for the legend
      if (d.data.count != 0) {
        nameArray.push(d.data.label);
        colorLinker[d.data.label] = hue;
      }
      return hue;
    })
    .attr("id", function(d) {
      return d.data.label;
    })
    .on('mouseover', function(d) {
      //update the mouseover box
      var percent = d.data.count;
      mouseoverInfo.select('.label').html(d.data.label);
      mouseoverInfo.select('.count').html(d.data.number + " acres");
      mouseoverInfo.select('.percent').html((Math.round(percent * 100) / 100) + '%');
      mouseoverInfo.style('border-color', color(d.data.label));
      mouseoverInfo.style('opacity', 1);
      mouseoverInfo.style('display', 'block');

      //highlight the pie slice
      d3.select(this).classed("arc", false);
      d3.select(this).classed("arcHighlight", true);
    })
    .on('mouseout', function() {
      //hide mouseover box
      mouseoverInfo.style('display', 'none');

      //unhighlight the pie slice
      d3.select(this).classed("arcHighlight", false);
      d3.select(this).classed("arc", true);
    })
    .transition()
    .duration(900)
    .attrTween("d", tweenPie);

  //that's it for the pie chart, now we just need to add its legend information

  //sizing for the colored squares and spaces
  // var legendRectSize = 18;
  // var legendSpacing = 4;
  var legendRectSize = Math.round(0.05 * pieChart_length);
  var legendSpacing = Math.round(0.22 * legendRectSize);

  //add all the elements that have a nonzero count
  var legend = svg.selectAll('.legend')
    .data(nameArray)
    .enter()
    .append('g')
    .attr('class', 'legend')
    .on('mouseover', function(d) {
      //highlight text
      d3.select(this).style("fill", "steelblue");

      //highlight arc
      var slice = document.getElementById('resultsFrame').contentWindow.document.getElementById(d);
      d3.select(slice).classed("arc", false)
        .classed("arcHighlight", true);

      //show appropriate mouseover info
      mouseoverInfo.select('.label').html(d);
      mouseoverInfo.select('.count').html(d3.select(slice).attr("count") + " acres");
      mouseoverInfo.select('.percent').html((Math.round(d3.select(slice).attr("percent") * 100) / 100) + '%');
      mouseoverInfo.style('border-color', color(d));
      mouseoverInfo.style('opacity', 1);
      mouseoverInfo.style('display', 'block');

    })
    .on('mouseout', function(d) {

      //set text back to black
      d3.select(this).style("fill", "black");

      //unhighlight the arc
      var slice = document.getElementById('resultsFrame').contentWindow.document.getElementById(d);
      d3.select(slice).classed("arcHighlight", false);
      d3.select(slice).classed("arc", true);

      //undisplay the mouseover information box
      mouseoverInfo.style('display', 'none');
    })
    .attr('transform', function(d, i) {
      var height = legendRectSize + legendSpacing;
      var offset = height * nameArray.length / 2;
      var horz = pieChart_length / 2 + 20;
      var vert = i * height - offset;
      // var horz = width / 2 + 20;
      return 'translate(' + horz + ',' + vert + ')';
    });

  //add legend color squares
  legend.append('rect')
    .attr('width', legendRectSize)
    .attr('height', legendRectSize)
    .style('fill', function(d) {
      tempLegendColors.push(colorLinker[d]); // adds the legend color to array (for print function)
      return colorLinker[d];
    })
    .style('stroke', function(d) {
      return colorLinker[d];
    });

  //add legend text info
  legend.append('text')
    .attr('x', legendRectSize + legendSpacing)
    .attr('y', legendRectSize - legendSpacing)
    .text(function(d) {
      tempLegendItems.push(d); // adds the legend element to the array (for print function)
      return d;
    });

  //lastly, now add the chart title in the center
  // main chart title
  svg.append("text")
    .attr("x", 0)
    .attr("y", 0)
    .attr("text-anchor", "middle")
    .style("font-size", "1.8vw")
    .style("font-weight", "bold")
    .text("Land Use");
  //also add the year below that
  svg.append("text")
    .attr("x", 0)
    .attr("y", 25)
    .attr("text-anchor", "middle")
    .style("font-size", "1.8vw")
    .style("font-weight", "bold")
    .text("Year " + year);

  multiplayerResults();
} //end drawD3LandPieChart()


function drawD3EconPieChart(year, isTheChartInCategoryMode) {
  // RESETTING THE TEMPORARY COLOR AND LEGEND ELEMENT nameArray
  tempLegendItems = [];
  tempLegendColors = [];
  //remove the html that's already there, ie clear the chart
  document.getElementById('resultsFrame').contentWindow.document.getElementById('econPieChart').innerHTML = " ";
  //pass data to the page that it needs, we do this by putting it in hidden divs
  document.getElementById('resultsFrame').contentWindow.document.getElementById('landYear').innerHTML = year;
  document.getElementById('resultsFrame').contentWindow.document.getElementById('upTo').innerHTML = boardData[currentBoard].calculatedToYear;

  var inMultiplayer = localStorage.getItem('LSinMultiplayer');
  /*
  * The variable multiplayerColorPack is used to hold the colors that represent each player in the the multiplayer set up mode.
  * For more information refer to Issue 386.
  */
  var multiplayerColorPack = ["#87ceee","#e6bb00","#cc6578","#127731","#c97b08","#302485"];
  var totalCost = getTotalCost(tempResult, year);

  var dataset = [{
      label: 'Conventional Corn',
      count: (tempResult[0].count*(Math.round(Totals.landUseResults[year].conventionalCornLandUse * 100) / 100)),
      number: ((tempResult[0].count*(Math.round(Totals.landUseResults[year].conventionalCornLandUse * 100) / 100))/totalCost)
    }, {
      label: 'Conservation Corn',
      count: (tempResult[1].count*(Math.round(Totals.landUseResults[year].conservationCornLandUse * 100) / 100)),
      number: ((tempResult[1].count*(Math.round(Totals.landUseResults[year].conservationCornLandUse * 100) / 100))/totalCost)
    }, {
      label: 'Conventional Soybean',
      count: (tempResult[2].count*(Math.round(Totals.landUseResults[year].conventionalSoybeanLandUse * 100) / 100)),
      number: ((tempResult[2].count*(Math.round(Totals.landUseResults[year].conventionalSoybeanLandUse * 100) / 100))/totalCost)
    }, {
      label: 'Conservation Soybean',
      count: (tempResult[3].count*(Math.round(Totals.landUseResults[year].conservationSoybeanLandUse * 100) / 100)),
      number: ((tempResult[3].count*(Math.round(Totals.landUseResults[year].conservationSoybeanLandUse * 100) / 100))/totalCost)
    }, {
      label: 'Mixed Fruits/Vegetables',
      count: (tempResult[14].count*(Math.round(Totals.landUseResults[year].mixedFruitsVegetablesLandUse * 100) / 100)),
      number: ((tempResult[14].count*(Math.round(Totals.landUseResults[year].mixedFruitsVegetablesLandUse * 100) / 100))/totalCost)
    }, {
      label: 'Permanent Pasture',
      count: (tempResult[5].count*(Math.round(Totals.landUseResults[year].permanentPastureLandUse * 100) / 100)),
      number: ((tempResult[5].count*(Math.round(Totals.landUseResults[year].permanentPastureLandUse * 100) / 100))/totalCost)
    }, {
      label: 'Rotational Grazing',
      count: (tempResult[6].count*(Math.round(Totals.landUseResults[year].rotationalGrazingLandUse * 100) / 100)),
      number: ((tempResult[6].count*(Math.round(Totals.landUseResults[year].rotationalGrazingLandUse * 100) / 100))/totalCost)
    }, {
      label: 'Grass Hay',
      count: (tempResult[7].count*(Math.round(Totals.landUseResults[year].grassHayLandUse * 100) / 100)),
      number: ((tempResult[7].count*(Math.round(Totals.landUseResults[year].grassHayLandUse * 100) / 100))/totalCost)
    }, {
      label: 'Switchgrass',
      count: (tempResult[11].count*(Math.round(Totals.landUseResults[year].switchgrassLandUse * 100) / 100)),
      number: ((tempResult[11].count*(Math.round(Totals.landUseResults[year].switchgrassLandUse * 100) / 100))/totalCost)
    }, {
      label: 'Prairie',
      count: (tempResult[8].count*(Math.round(Totals.landUseResults[year].prairieLandUse * 100) / 100)),
      number: ((tempResult[8].count*(Math.round(Totals.landUseResults[year].prairieLandUse * 100) / 100))/totalCost)
    }, {
      label: 'Wetland',
      count: (tempResult[13].count*(Math.round(Totals.landUseResults[year].wetlandLandUse * 100) / 100)),
      number: ((tempResult[13].count*(Math.round(Totals.landUseResults[year].wetlandLandUse * 100) / 100))/totalCost)
    }, {
      label: 'Alfalfa',
      count: (tempResult[4].count*(Math.round(Totals.landUseResults[year].alfalfaLandUse * 100) / 100)),
      number: ((tempResult[4].count*(Math.round(Totals.landUseResults[year].alfalfaLandUse * 100) / 100))/totalCost)
    }, {
      label: 'Conventional Forest',
      count: (tempResult[10].count*(Math.round(Totals.landUseResults[year].conventionalForestLandUse * 100) / 100)),
      number: ((tempResult[10].count*(Math.round(Totals.landUseResults[year].conventionalForestLandUse * 100) / 100))/totalCost)
    }, {
      label: 'Conservation Forest',
      count: (tempResult[9].count*(Math.round(Totals.landUseResults[year].conservationForestLandUse * 100) / 100)),
      number: ((tempResult[9].count*(Math.round(Totals.landUseResults[year].conservationForestLandUse * 100) / 100))/totalCost)
    }, {
      label: 'Short Rotation Woody Bioenergy',
      count: (tempResult[12].count*(Math.round(Totals.landUseResults[year].shortRotationWoodyBioenergyLandUse * 100) / 100)),
      number: ((tempResult[12].count*(Math.round(Totals.landUseResults[year].shortRotationWoodyBioenergyLandUse * 100) / 100))/totalCost)
    }];

  //variables for the display of the chart on the page
  // be careful about changing these values since they are tied closely to
  // css styling on results page
  // var width = 360;
  // var height = 360;
  // var radius = Math.min(width, height) / 2;
  var w = Math.round(window.innerWidth * 0.38);
  var h = Math.round(window.innerHeight * 0.382);

  // if the pie chart is being drawn to be printed on a pdf then set the fixed size
  if (printMode) {
    w = h = 200;
  }

  var pieChart_length = Math.min(w, h);
  var legendW = Math.round(pieChart_length * 1.06);

  var radius = pieChart_length / 2;

  //colors are assigned from one of the default scaling options
  //if in multiplayer mode the color options will change else it will use default d3 schemeCategory20 colors
  if(localStorage.getItem('LSinMultiplayer')==="true"){
    var color = d3.scaleOrdinal(multiplayerColorPack);
  }
  else{
    var color = d3.scaleOrdinal(d3.schemeCategory20);
  }

  //set up an object and array for referring back and forth to elements
  var nameArray = [];
  var colorLinker = {};

  //document.getElementById('resultsFrame').contentWindow.document.getElementById('chart').innerHTML = "" ;
  var chart = document.getElementById('resultsFrame').contentWindow.document.getElementById('econPieChart');

  //d3 stuff here, I won't comment this section too heavily as it is mostly typical graphics
  var svg = d3.select(chart)
    .append('svg')
    .attr("class", "graph-svg-component")
    .attr("id", "pieSVGE")
    // .attr('width', width + legendW) //leave room for legend so add 280
    // .attr('height', height)
    .attr('width', pieChart_length + legendW) //leave room for legend so add 280
    .attr('height', pieChart_length)
    .append('g')
    .attr('transform', 'translate(' + (pieChart_length / 2) + ',' + (pieChart_length / 2) + ')');

  var arc = d3.arc()
    .outerRadius(radius)
    .innerRadius(radius * 0.55)
    .padAngle(0.01);

  var pie = d3.pie()
    .value(function(d) {
      return d.count;
    })
    .sort(null);

  //animation for the pie graph
  function tweenPie(b) {
    b.innerRadius = 0;
    var i = d3.interpolate({
      startAngle: 0,
      endAngle: 0
    }, b);
    return function(t) {
      return arc(i(t));
    };
  }

  //create the elements for hover over information
  var mouseoverInfo = d3.select(chart)
    .append('g')
    .attr('class', 'mouseoverInfo');

  mouseoverInfo.append('div')
    .attr('class', 'label');

  mouseoverInfo.append('div')
    .attr('class', 'count');

  mouseoverInfo.append('div')
    .attr('class', 'percent');

  //let's add the arcs to the pie graph now
  var path = svg.selectAll('path')
    .data(pie(dataset))
    .enter()
    .append('path')
    .attr('class', 'dataArc')
    .attr('d', arc)
    .attr('count', function(d) {
      return d.data.number;
    })
    .attr('percent', function(d) {
      return d.data.count;
    })
    .attr('fill', function(d, i) {
      var hue = color(d.data.label);
      //use these structures to keep track of what actually has a count
      // for the legend
      if (d.data.count != 0) {
        nameArray.push(d.data.label);
        colorLinker[d.data.label] = hue;
      }
      return hue;
    })
    .attr("id", function(d) {
      return d.data.label;
    })
    .on('mouseover', function(d) {
      //update the mouseover box
      mouseoverInfo.select('.label').html(d.data.label);
      mouseoverInfo.select('.count').html(("$"+(Math.round(d.data.count*10)/10)));
      mouseoverInfo.select('.percent').html((Math.round(d.data.number*100)) + '%');
      mouseoverInfo.style('border-color', color(d.data.label));
      mouseoverInfo.style('opacity', 1);
      mouseoverInfo.style('display', 'block');

      //highlight the pie slice
      d3.select(this).classed("arc", false);
      d3.select(this).classed("arcHighlight", true);
    })
    .on('mouseout', function() {
      //hide mouseover box
      mouseoverInfo.style('display', 'none');

      //unhighlight the pie slice
      d3.select(this).classed("arcHighlight", false);
      d3.select(this).classed("arc", true);
    })
    .transition()
    .duration(900)
    .attrTween("d", tweenPie);

  //that's it for the pie chart, now we just need to add its legend information

  //sizing for the colored squares and spaces
  // var legendRectSize = 18;
  // var legendSpacing = 4;
  var legendRectSize = Math.round(0.05 * pieChart_length);
  var legendSpacing = Math.round(0.22 * legendRectSize);

  //add all the elements that have a nonzero count
  var legend = svg.selectAll('.legend')
    .data(nameArray)
    .enter()
    .append('g')
    .attr('class', 'legend')
    .on('mouseover', function(d) {
      var current = getData(d);
      //highlight text
      d3.select(this).style("fill", "steelblue");

      //highlight arc
      var slice = document.getElementById('resultsFrame').contentWindow.document.getElementById(d);
      d3.select(slice).classed("arc", false)
        .classed("arcHighlight", true);

      //show appropriate mouseover info
      mouseoverInfo.select('.label').html(d);
      mouseoverInfo.select('.count').html(("$"+(Math.round(current.count*10)/10)));
      mouseoverInfo.select('.percent').html((Math.round(current.number*100)) + '%');
      mouseoverInfo.style('border-color', color(d));
      mouseoverInfo.style('opacity', 1);
      mouseoverInfo.style('display', 'block');

    })
    .on('mouseout', function(d) {

      //set text back to black
      d3.select(this).style("fill", "black");

      //unhighlight the arc
      var slice = document.getElementById('resultsFrame').contentWindow.document.getElementById(d);
      d3.select(slice).classed("arcHighlight", false);
      d3.select(slice).classed("arc", true);

      //undisplay the mouseover information box
      mouseoverInfo.style('display', 'none');
    })
    .attr('transform', function(d, i) {
      var height = legendRectSize + legendSpacing;
      var offset = height * nameArray.length / 2;
      var horz = pieChart_length / 2 + 20;
      var vert = i * height - offset;
      // var horz = width / 2 + 20;
      return 'translate(' + horz + ',' + vert + ')';
    });

  //add legend color squares
  legend.append('rect')
    .attr('width', legendRectSize)
    .attr('height', legendRectSize)
    .style('fill', function(d) {
      tempLegendColors.push(colorLinker[d]); // adds the legend color to array (for print function)
      return colorLinker[d];
    })
    .style('stroke', function(d) {
      return colorLinker[d];
    });

  //add legend text info
  legend.append('text')
    .attr('x', legendRectSize + legendSpacing)
    .attr('y', legendRectSize - legendSpacing)
    .text(function(d) {
      tempLegendItems.push(d); // adds the legend element to the array (for print function)
      return d;
    });

  //lastly, now add the chart title in the center
  // main chart title
  svg.append("text")
    .attr("x", 0)
    .attr("y", 0)
    .attr("text-anchor", "middle")
    .style("font-size", "1.8vw")
    .style("font-weight", "bold")
    .text("Econ Numbers");
  //also add the year below that
  svg.append("text")
    .attr("x", 0)
    .attr("y", 25)
    .attr("text-anchor", "middle")
    .style("font-size", "1.8vw")
    .style("font-weight", "bold")
    .text(year);

  function getData(data) {
    for(var i = 0; i < dataset.length; ++i){
      if(data === dataset[i].label){
        return dataset[i];
      }
    }
    return "none";
  }

  multiplayerResults();
} //end drawD3LandPieChart()

function getTotalCost(data, givenYear) {
  var cost = 0;
  for(var i = 0; i < data.length; ++i){
    switch (data[i].label) {
      case "Conventional Corn":
        cost += Totals.landUseResults[givenYear].conventionalCornLandUse*data[i].count;
      break;
      case "Conservation Corn":
        cost += Totals.landUseResults[givenYear].conservationCornLandUse*data[i].count;
      break;
      case "Conventional Soybean":
        cost += Totals.landUseResults[givenYear].conventionalSoybeanLandUse*data[i].count;
      break;
      case "Conservation Soybean":
        cost += Totals.landUseResults[givenYear].conservationSoybeanLandUse*data[i].count;
      break;
      case "Alfalfa":
        cost += Totals.landUseResults[givenYear].alfalfaLandUse*data[i].count;
      break;
      case "Permanent Pasture":
        cost += Totals.landUseResults[givenYear].permanentPastureLandUse*data[i].count;
      break;
      case "Rotational Grazing":
        cost += Totals.landUseResults[givenYear].rotationalGrazingLandUse*data[i].count;
      break;
      case "Grass Hay":
        cost += Totals.landUseResults[givenYear].grassHayLandUse*data[i].count;
      break;
      case "Prairie":
        cost += Totals.landUseResults[givenYear].prairieLandUse*data[i].count;
      break;
      case "Conservation Forest":
        cost += Totals.landUseResults[givenYear].conservationForestLandUse*data[i].count;
      break;
      case "Conventional Forest":
        cost += Totals.landUseResults[givenYear].conventionalForestLandUse*data[i].count;
      break;
      case "Switchgrass":
        cost += Totals.landUseResults[givenYear].switchgrassLandUse*data[i].count;
      break;
      case "Short-rotation Woody Bioenergy":
        cost += Totals.landUseResults[givenYear].shortRotationWoodyBioenergyLandUse*data[i].count;
      break;
      case "Wetland":
        cost += Totals.landUseResults[givenYear].wetlandLandUse*data[i].count;
      break;
      case "Mixed Fruits & Vegetables":
        cost += Totals.landUseResults[givenYear].mixedFruitsVegetablesLandUse*data[i].count;
      break;
    }
  }

  return cost;
}

//this funtion creates and animates the Ecoscores aster plot
// it also creates the quality indicator gradients to the plot's right
//======= it's use is currently deprecated
function drawEcosystemIndicatorsDisplay(year) {
  // clear info
  document.getElementById('resultsFrame').contentWindow.document.getElementById('asterChart').innerHTML = " ";
  document.getElementById('resultsFrame').contentWindow.document.getElementById('asterContainer').innerHTML = " ";
  //pass parameters along to page via a hidden div
  document.getElementById('resultsFrame').contentWindow.document.getElementById('ecoYear').innerHTML = year;
  document.getElementById('resultsFrame').contentWindow.document.getElementById('upTo').innerHTML = boardData[currentBoard].calculatedToYear;

  //set up d3 dataset
  var dataset = [{
    name: "Nitrate Concentration",
    score: (Math.round(Totals.nitrateConcentrationScore[year] * 10) / 10),
    color: "#1f77b4",
    backColor: "navy",
    raw: (Math.round(Totals.nitrateConcentration[year] * 10) / 10) + " ppm"
  }, {
    name: "Phosphorus Load",
    score: (Math.round(Totals.phosphorusLoadScore[year] * 10) / 10),
    color: "#ff7f0e",
    backColor: "navy",
    raw: (Math.round(Totals.phosphorusLoad[year] * 10) / 10) + " tons"
  }, {
    name: "Sediment Delivery",
    score: (Math.round(Totals.sedimentDeliveryScore[year] * 10) / 10),
    color: "	#2ca02c",
    backColor: "navy",
    raw: (Math.round(Totals.sedimentDelivery[year] * 10) / 10) + " tons"
  }, {
    name: "Carbon Sequestration",
    score: (Math.round(Totals.carbonSequestrationScore[year] * 10) / 10),
    color: "#d62728",
    backColor: "maroon",
    raw: (Math.round(Totals.carbonSequestration[year] * 10) / 10) + " tons"
  }, {
    name: "Gross Erosion",
    score: (Math.round(Totals.grossErosionScore[year] * 10) / 10),
    color: "#9467bd",
    backColor: "maroon",
    raw: (Math.round(Totals.grossErosion[year] * 10) / 10) + " tons"
  }, {
    name: "Game Wildlife",
    score: (Math.round(Totals.gameWildlifePointsScore[year] * 10) / 10),
    color: "#8c564b",
    backColor: "tomato",
    raw: (Math.round(Totals.gameWildlifePoints[year] * 10) / 10) + " pts"
  }, {
    name: "Biodiversity",
    score: (Math.round(Totals.biodiversityPointsScore[year] * 10) / 10),
    color: "#e377c2",
    backColor: "tomato",
    raw: (Math.round(Totals.biodiversityPoints[year] * 10) / 10) + " pts"
  }, ];

  //chart parameters
  var width = 360;
  var height = 360;
  var radius = Math.min(width, height) / 2;
  var innerRadius = 75;

  //d3 stuff, once again, mostly standard, although a little less so
  //  not heavily commented for that reason

  var asterChart = document.getElementById('resultsFrame').contentWindow.document.getElementById('asterChart');

  var svg = d3.select(asterChart)
    .append('svg')
    .attr("class", "graph-svg-component")
    .attr('width', width + 280)
    .attr('height', height)
    .append('g')
    .attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')');

  var innerArc = d3.arc()
    .innerRadius(innerRadius)
    .padAngle(0)
    //determine outter radius based on score out of 100
    .outerRadius(function(d) {
      return (radius - innerRadius) * (d.data.score / 100.0) + innerRadius;
    });

  var outlineArc = d3.arc()
    .innerRadius(radius - 1)
    .outerRadius(radius);

  var coverArc = d3.arc()
    .innerRadius(0)
    .outerRadius(innerRadius);

  //a convoluted function for animating the aster plot
  // svg programming is obscure, but basically, we want to use this to graw our graphics
  function generateSVGArc(x, y, r, startAngle, endAngle) {

    var largeArc = 0;
    var sweepFlag = 1; // is arc to be drawn in +ve direction?

    return ['M', x, y, 'L', x + Math.sin(startAngle) * r, y - (Math.cos(startAngle) * r),
      'A', r, r, 0, largeArc, sweepFlag, x + Math.sin(endAngle) * r, y - (Math.cos(endAngle) * r), 'Z'
    ].join(' ');
  } //end nested function

  //function to create the tween animation moving the values from inner radius to their
  // correct positions
  function interpolateSVGArc(x, y, r, startAngle, endAngle) {
    return function(t) {
      return generateSVGArc(x, y, (r - innerRadius) * t + innerRadius, startAngle, endAngle);
    };
  } //end nested function

  //d3 programming for creating the aster plot
  // this is a very sneaky plot, as it is essentially a pie chart with variable outter radii
  //  among the pie slice sections

  var pie = d3.pie()
    .value(function(d) {
      return 1; //everything has equal value, split up the pie chart accordingly
    })
    .sort(null);

  //create mouseover information elements

  var mouseoverInfo = d3.select(asterChart)
    .append('g')
    .attr('class', 'mouseoverInfo');

  mouseoverInfo.append('div')
    .attr('class', 'label');

  mouseoverInfo.append('div')
    .attr('class', 'count');

  mouseoverInfo.append('div')
    .attr('class', 'score');

  //append data to plot

  var path = svg.selectAll('path')
    .data(pie(dataset))
    .enter()
    .append('path')
    .attr('d', innerArc)
    .attr('fill', function(d) {
      return d.data.color;
    })
    .attr('class', 'arc')
    .on('mouseover', function(d) {
      //setup mouseover text and style
      mouseoverInfo.select('.label').html(d.data.name);
      mouseoverInfo.select('.count').html(d.data.raw);
      mouseoverInfo.select('.score').html(d.data.score + "/100");
      mouseoverInfo.style('border-color', d.data.color);
      mouseoverInfo.style('display', 'block');

      //highlight hovered arc
      d3.select(this).classed("arc", false);
      d3.select(this).classed("arcHighlight", true);
    })
    .on('mouseout', function() {
      //hide mouseoverInfo
      mouseoverInfo.style('display', 'none');

      //unhighlight slice
      d3.select(this).classed("arcHighlight", false);
      d3.select(this).classed("arc", true);
    })
    .transition()
    .duration(700)
    .attrTween('d', function(d, i) {
      //check to see if the score is very low, if so, still give it a visible slab
      var endRadius = (d.data.score < 2) ? innerRadius + 6 : (radius - innerRadius) * (d.data.score / 100.0) + innerRadius;
      return interpolateSVGArc(0, 0, endRadius, d.startAngle, d.endAngle);
    });

  //setup the central cover
  var dummy = [{
    count: 1
  }];

  //since the svg draws from the center, cover this with a white circle to disguise what's happening
  var cover = svg.selectAll(".cover")
    .data(pie(dummy))
    .enter().append("path")
    .attr("fill", "white")
    .attr("d", coverArc);

  //add the outline for each of the containers
  //  i'm still not sure how I feel about these, but consider removing the outline
  var outerPath = svg.selectAll(".outlineArc")
    .data(pie(dataset))
    .enter().append("path")
    .attr("fill", "none")
    .attr("stroke", function(d) {
      return d.data.backColor;
    })
    .attr("class", "outlineArc")
    .attr("d", outlineArc);

  //add title and year in the center of the plot
  svg.append("text")
    .attr("x", 0)
    .attr("y", 0)
    .attr("text-anchor", "middle")
    .style("font-size", "1.8vw")
    .style("font-weight", "bold")
    .text("Eco-Scores");

  svg.append("text")
    .attr("x", 0)
    .attr("y", 25)
    .attr("text-anchor", "middle")
    .style("font-size", "1.8vw")
    .style("font-weight", "bold")
    .text("Year " + year);


  //end of the aster plot creation, now do the indicator gradients

  //this function keeps track of the gradients based on the score
  function getColor(number) {
    var tempColor;

    if (number > 90) return "#0d46f2";
    if (number > 70) return "#3359cc";
    if (number > 50) return "#4d66b3";
    if (number > 30) return "#60709f";
    if (number > 0) return "#808080";
    //else
    return "#333333";
  } //end nested function


  var nameArray = [];
  var colorLinker = {};
  var dataLinker = {};

  //setup the initial data for these indicators

  //water quality indicator

  nameArray.push("Water Quality");

  var sum = 0;
  //take into account the categories that affect water quality
  for (var i = 0; i <= 2; i++) {
    sum += dataset[i].score;
  }

  dataLinker[nameArray[0]] = sum / 3; //average them
  colorLinker[nameArray[0]] = getColor(sum / 3);

  //soil quality indicator

  nameArray.push("Soil Quality");

  var sum = 0;
  for (var i = 3; i <= 4; i++) {
    sum += dataset[i].score;
  }

  dataLinker[nameArray[1]] = sum / 2; //average them
  colorLinker[nameArray[1]] = getColor(sum / 2);

  //habitat quality indicator

  nameArray.push("Habitat Quality");

  var sum = 0;
  for (var i = 5; i <= 6; i++) {
    sum += dataset[i].score;
  }

  dataLinker[nameArray[2]] = sum / 2; //average them
  colorLinker[nameArray[2]] = getColor(sum / 2);

  //now that all of this is set up, now create the graphic, d3

  var container = document.getElementById('resultsFrame').contentWindow.document.getElementById('asterContainer');

  var svg2 = d3.select(container)
    .append('svg')
    .attr('height', 200)
    .attr("class", "graph-svg-component")
    .append('g');


  var legendRectSize = 18;
  var legendSpacing = 4;

  //set up the spacing of the elements
  var legend = svg2.selectAll('.legend')
    .data(nameArray)
    .enter()
    .append('g')
    .attr('class', 'ecoLegend')
    .attr('transform', function(d, i) {
      var height = legendRectSize + legendSpacing;
      var offset = 10;
      var horz = 10;
      var vert = i * height + offset;
      return 'translate(' + horz + ',' + vert + ')';
    });

  //add the text headings for the indicators
  legend.append('text')
    .attr('x', legendRectSize + legendSpacing)
    .attr('y', legendRectSize - legendSpacing)
    .text(function(d) {
      return d + " : " + Math.round(dataLinker[d]) + "/100";
    })
    .attr('transform', function(d, i) {
      var horz = 0;
      var vert = (i) * (legendRectSize + 7 + legendSpacing);
      return 'translate(' + horz + ',' + vert + ')';
    });

  //now add the bar of color
  legend.append('rect')
    .attr('width', legendRectSize * 15.2)
    .attr('height', legendRectSize)
    .attr('fill', function(d) {
      return colorLinker[d];
    })
    .style('stroke', function(d) {
      return colorLinker[d];
    })
    .attr('transform', function(d, i) {
      var horz = 0;
      var vert = (i + 1) * (legendRectSize + 5 + legendSpacing);
      return 'translate(' + horz + ',' + vert + ')';
    })
    .transition()
    .duration(1000)
    .attrTween("fill", function() {
      //animate the change of the color gradient from black to bright blue
      return d3.interpolateRgb("#000000", this.getAttribute("fill"));
    });

} //end drawEcosystemIndicatorsDisplay()

//drawEcosystemRadar() takes an array of years and draws a radar chart
// for each of the years
// the code here is original, but the Radar object prototype is credited following
function drawEcosystemRadar(yearArray) {
  // RESETTING THE TEMPORARY COLOR AND LEGEND ELEMENT nameArray
  radarLegendItems = [];
  radarLegendColors = [];
  //clear info already on page
  document.getElementById('resultsFrame').contentWindow.document.getElementById('radarChart').innerHTML = "";
  document.getElementById('resultsFrame').contentWindow.document.getElementById('radarLegend').innerHTML = "";

  var w = Math.round(window.innerWidth * 0.317);
  var h = Math.round(window.innerHeight * 0.319);
  // set a fixed size for radar for print mode
  if (printMode) {
    w = h = 250;
  }
  var graphLength = Math.min(w, h);

  var dataset = [];
  var legendOptions = [];
  var radarClassElementsString = "radar-chart-serie";
  var colorscale = d3.scaleOrdinal(d3.schemeCategory10);

  //assign the dataset for each year
  for (var i = 0; i < yearArray.length; i++) {

    var y = yearArray[i];
    var obj = [{
      label: "Nitrate Concentration",
      axis: "Nitrate",
      value: Totals.nitrateConcentrationScore[y] / 100,
      raw: (Math.round(Totals.nitrateConcentration[y] * 10) / 10) + " ppm"
    }, {
      label: "Total Sum Yields",
      axis: "Total Yields",
      value: Math.min((Totals.nitrateConcentrationScore[y] + Totals.phosphorusLoadScore[y] + Totals.sedimentDeliveryScore[y] + Totals.carbonSequestrationScore[y] + Totals.grossErosionScore[y] + Totals.gameWildlifePointsScore[y] + Totals.biodiversityPointsScore[y]) / 700, 100),
    }, {
      label: "Phosphorus Load",
      axis: "Phosphorus",
      value: Totals.phosphorusLoadScore[y] / 100,
      raw: (Math.round(Totals.phosphorusLoad[y] * 10) / 10) + " tons"
    }, {
      label: "Sediment Delivery",
      axis: "Sediment",
      value: Totals.sedimentDeliveryScore[y] / 100,
      raw: (Math.round(Totals.sedimentDelivery[y] * 10) / 10) + " tons"
    }, {
      label: "Carbon Sequestration",
      axis: "Carbon",
      value: Totals.carbonSequestrationScore[y] / 100,
      raw: (Math.round(Totals.carbonSequestration[y] * 10) / 10) + " tons"
    }, {
      label: "Gross Erosion",
      axis: "Erosion",
      value: Totals.grossErosionScore[y] / 100,
      raw: (Math.round(Totals.grossErosion[y] * 10) / 10) + " tons"
    }, {
      label: "Game Wildlife",
      axis: "Wildlife",
      value: Totals.gameWildlifePointsScore[y] / 100,
      raw: (Math.round(Totals.gameWildlifePoints[y] * 10) / 10) + " pts"
    }, {
      label: "Biodiversity",
      axis: "Biodiversity",
      value: Totals.biodiversityPointsScore[y] / 100,
      raw: (Math.round(Totals.biodiversityPoints[y] * 10) / 10) + " pts"
    }];

    dataset.push(obj);
    legendOptions.push("Year " + y);
  } //end for loop

  //Separate configuration options for the radar
  var overrideConfig = {
    // w: graphWidth,
    // h: graphHeight,
    // ExtraWidthX: 300
    w: graphLength,
    h: graphLength,
    maxValue: 1,
    levels: 5,
    ExtraWidthX: graphLength,
    TranslateX: graphLength * 0.487, //95
    TranslateY: graphLength * 0.154 //30
  };

  var radarId = document.getElementById('resultsFrame').contentWindow.document.getElementById('radarChart');
  var radarLegendId = document.getElementById('resultsFrame').contentWindow.document.getElementById('radarLegend');

  //Create the Radar chart on page
  RadarChart.draw(radarId, dataset, overrideConfig, 'mouseoverInfoRadarRight', radarClassElementsString);

  //Now let's create the legend, standard d3 stuff
  var legendWidth = Math.round(window.innerWidth * 0.376);
  var legendHeight = Math.round(window.innerHeight * 0.394);
  var legendLength = Math.round(Math.min(legendWidth, legendHeight));

  var svg = d3.select(radarLegendId)
    .append('svg')
    // .attr('width', legendWidth)
    // .attr('height', legendHeight)
    .attr('width', legendLength)
    .attr('height', legendLength)
    .append('g')
    .attr('transform', 'translate(' + (legendLength / 2) + ',' + (legendLength / 2) + ')');

  //add legend/chart title
  svg.append("text")
    .attr("x", 0)
    // .attr("y", -120)
    .attr("y", Math.round(-0.324 * legendHeight))
    .attr("text-anchor", "middle")
    .style("font-size", "1.8vw")
    .style("font-weight", "bold")
    .text("Ecosystem Services");

  //sizing for the colored squares and spaces
  // var legendRectSize = 18;
  // var legendSpacing = 4;
  var legendRectSize = Math.round(graphLength * 0.06);
  var legendSpacing = Math.round(legendRectSize * 0.22);

  //add all of the year series to the legend
  var legend = svg.selectAll('.legend')
    .data(legendOptions)
    .enter()
    .append('g')
    .on('mouseover', function(d) {

      //change text color
      d3.select(this).style("fill", "steelblue");

      //select the polygon area and highlight it
      var g = d3.select(radarId);
      z = d3.select(this).attr("childElement");
      z = "polygon." + z;

      g.selectAll("polygon")
        .transition(200)
        .style("fill-opacity", 0.1);
      g.selectAll(z)
        .transition(200)
        .style("fill-opacity", 0.7);
    })
    .on('mouseout', function(d) {

      //set legend text back to black
      d3.select(this).style("fill", "black");

      //reset all of the polygons in the chart
      var g = d3.select(radarId);
      g.selectAll("polygon")
        .transition(200)
        .style("fill-opacity", 0.2);
    })
    .attr("childElement", function(d, i) {
      return radarClassElementsString + i;
    })
    .attr('transform', function(d, i) {
      var height = legendRectSize + legendSpacing;
      // var offset = 80;
      // var horz = -117;
      var offset = Math.round(legendRectSize * 4.44);
      var horz = Math.round(legendRectSize * -6.5);
      var vert = i * height - offset;
      return 'translate(' + horz + ',' + vert + ')';
    });

  //add legend color squares
  legend.append('rect')
    .attr('width', legendRectSize)
    .attr('height', legendRectSize)
    .style('fill', function(d, i) {
      return colorscale(i);
    })
    .style('stroke', function(d, i) {
      radarLegendColors.push(colorscale(i)); // pushes the item names in the radar plot chart's legend to items array
      return colorscale(i);
    });

  //add legend text info
  legend.append('text')
    .attr('x', legendRectSize + legendSpacing)
    .attr('y', legendRectSize - legendSpacing)
    .text(function(d) {
      radarLegendItems.push(d); // pushes the item names in the radar plot chart's legend to items array
      return d;
    });
  // add checkbox
  legend.append('foreignObject')
    .attr('style', 'visibility: visible;')
    .attr('width', 20)
    .attr('height', 20)
    .attr('x', 70)
    .attr('y', 0)

    .append('xhtml:input')
    .attr('id', function(d) {
      return "checkboxYear" + d.slice(-1);
    })
    .attr('class', 'yearCheckbox')
    .attr('onclick', function(d) {
      return "radarPlotYearToggle(" + d.slice(-1) + ");";
    })
    .attr('width', legendRectSize)
    .attr('height', legendRectSize)
    .attr('checked', "")
    .attr('type', 'checkbox');

} //end  drawEcosystemRadar()

//this function mainly is responsible for setting up the precipitation bar graph
// as well as the left utility  which gives info on the year's precip and a nice image
function drawPrecipitationInformationChart() {

  //this nested function updates the text and images in the left container, mouseover info
  function setupPrecipInfo(year) {
    container.select('.yearLabel').html(parent.data[year].label);
    container.select('.precipValue').html(parent.data[year].value + " inches");
    container.select('.precipType').html(parent.data[year].adj);

    var img = " ";
    switch (parent.data[year].adj) {
      case "Dry":
        // "Clouds" by https://icons8.com with free commercial use / Inserted oval under cload
        img = "./imgs/dry.png";
        break;
      case "Normal":
        // "Partly Cloudy Rain" by https://icons8.com with free commercial use
        img = "./imgs/normal.png";
        break;
      case "Wet":
        // "Heavy Rain" by https://icons8.com with free commercial use
        img = "./imgs/wet.png";
        break;
      case "Flood":
        // "Torrential Rain" by https://icons8.com with free commercial use / Inserted curved black lines under rain/cloud
        img = "imgs/flood.png";
        break;
    } //end switch

    mouseoverInfo.select('.precipImg').attr('src', img);
  } //end nested function


  //reset precip chart on page
  var element = document.getElementById('resultsFrame').contentWindow.document.getElementById('precipChart');
  //pass information to the page by inserting it into a hidden div
  document.getElementById('resultsFrame').contentWindow.document.getElementById('precipChart').innerHTML = " ";
  document.getElementById('resultsFrame').contentWindow.document.getElementById('precipInfo').innerHTML = " ";

  //assign data
  for (var i = 0; i < boardData[currentBoard].precipitation.length - 2; i++) {
    boardData[currentBoard].precipitation[i] = Number(boardData[currentBoard].precipitation[i]);
  }

  // parent.data = [{
  //   label: "Year 0",
  //   value: boardData[currentBoard].precipitation[0],
  //   percent: 0,
  //   adj: "",
  //   year: 0
  // }, {
  //   label: "Year 1",
  //   value: boardData[currentBoard].precipitation[1],
  //   percent: 0,
  //   adj: "",
  //   year: 1
  // }, {
  //   label: "Year 2",
  //   value: boardData[currentBoard].precipitation[2],
  //   percent: 0,
  //   adj: "",
  //   year: 2
  // }, {
  //   label: "Year 3",
  //   value: boardData[currentBoard].precipitation[3],
  //   percent: 0,
  //   adj: "",
  //   year: 3
  // }];
  // console.log(parent.data);

  /*
     Assign precipitation value to "data" variable.
     Previous version: assigned 4-year precipitation data anyways no matter how many years there are.
     Current version: assigned precipitation data according to how many years we have
     In this way, in the "Result" page, we're able to show precipitation bars according to the number of years
  */
  parent.data = [];
  for(var j = 0; j <= boardData[currentBoard].calculatedToYear; j++) {
    var precipData = {
      label: "Year " + j,
      value: boardData[currentBoard].precipitation[j],
      adj: "",
      year: j
    };
    parent.data.push(precipData);
  }
  // console.log(parent.data);

  //set up data percentage and adjectives
  for (var y = 0; y < data.length; y++) {
  // for (var y = 0; y <= boardData[currentBoard].calculatedToYear; y++) {
    var tempPercent;
    var tempAdj;

    switch (parent.data[y].value) {
      case 24.58:
        tempPercent = 25;
        tempAdj = "Dry";
        break;
      case 28.18:
        tempPercent = 36;
        tempAdj = "Dry";
        break;
      case 30.39:
        tempPercent = 42;
        tempAdj = "Normal";
        break;
      case 32.16:
        tempPercent = 49;
        tempAdj = "Normal";
        break;
      case 34.34:
        tempPercent = 57;
        tempAdj = "Normal";
        break;
      case 36.47:
        tempPercent = 64;
        tempAdj = "Wet";

        if (y > 0 && parent.data[y - 1].adj == "Dry") {
          tempAdj = "Flood";
        }

        break;
      case 45.1:
        tempPercent = 89;
        tempAdj = "Wet";

        if (y > 0 && parent.data[y - 1].adj == "Dry") {
          tempAdj = "Flood";
        }

        break;
      default:
        tempPercent = 0;
        tempAdj = "";
        break;
    } //end switch

    //assign data values
    parent.data[y].percent = tempPercent;
    parent.data[y].adj = tempAdj;
  }

  //d3 stuff, again, I won't comment too heavily since much of this is standard practice

  //bar chart width and height
  // note that these are closely interrelated to css styling on results page
  // var width = 420;
  // var barHeight = 30;
  var width = Math.round(window.innerWidth * 0.3);
  var barHeight = Math.round(window.innerHeight * 0.045);

  //if the pie chart is being drawn to be prionted on a pdf then set a fixed size for graph
  if (printMode) {
    width = 500;
    barHeight = 45;
  }

  //create bar scale for percentages
  var x = d3.scaleLinear()
    .domain([0, 100])
    .range([0, width]);

  var chart = d3.select(element)
    .attr("width", width)
    .attr("height", barHeight * data.length);

  //set up hover over information in left container

  var element = document.getElementById('resultsFrame').contentWindow.document.getElementById('precipInfo');

  var mouseoverInfo = d3.select(element)
    .append('g');

  mouseoverInfo.append('div')
    .attr('class', 'leftPrecipContainer');
  // .attr('style', 'display: inline-block; float: left; position: relative; top: 18%; width: 60%');

  var container = mouseoverInfo.select('.leftPrecipContainer');

  container.append('div')
    .attr('class', 'yearLabel');

  container.append('div')
    .attr('class', 'precipValue');

  container.append('div')
    .attr('class', 'precipType');

  mouseoverInfo.append('img')
    .attr('class', 'precipImg');

  //setup precipitation bar chart
// console.log(chart.selectAll("g").data());
// console.log(chart.selectAll("g").data(data));
// console.log(chart.selectAll("g").data(data).enter());
// console.log(data);
// console.log(parent.data);
// console.log(data == parent.data);

  var bar = chart.selectAll("g")
    .data(data)
    .enter().append("g")
    .attr('class', 'barData')
    .attr("transform", function(d, i) {
      return "translate(0," + (i * barHeight + 2) + ")";
    });

  bar.append("rect")
    .attr("width", function(d) {
      return x(d.percent);
    })
    .attr("height", barHeight - boardData[currentBoard].calculatedToYear)
    .attr("class", "legendBars")
    .attr('fill', '#1f77b4')
    .on('mouseover', function(d) {

      setupPrecipInfo(d.year);

      mouseoverInfo.style('display', 'block');

      d3.select(this).attr('fill', 'lightskyblue');
    })
    .on('mouseout', function() {
      d3.select(this).attr('fill', '#1f77b4');

      setupPrecipInfo(currentYear);

    })
    .transition()
    .duration(1400)
    //animation of bars
    .attrTween("width", function() {
      return d3.interpolate(0, this.getAttribute("width"));
    });

  bar.append("text")
    .attr("x", function(d) {
      return x(d.percent) + 7;
    })
    .attr("y", barHeight / 2)
    .attr("dy", ".35em")
    .text(function(d) {
      // console.log(d);
      return d.label;
    })
    .attr('fill', 'black');

  //lastly, after all of the chart setup, just setup the default information in the
  //  precipitation graphic to the left
  setupPrecipInfo(currentYear);

} //end drawPrecipitationInformationChart()

// // This function is in some ways similar to the ecosystem radar function
// //  here we updata the dataset and legend accordingly
// function drawYieldRadar(yearArray) {
//
//   //clear info already on page
//   document.getElementById('resultsFrame').contentWindow.document.getElementById('yieldRadarChart').innerHTML = " ";
//   document.getElementById('resultsFrame').contentWindow.document.getElementById('yieldRadarLegend').innerHTML = " ";
//
//   var w = Math.round(window.innerWidth * 0.317);
//   var h = Math.round(window.innerHeight * 0.319);
//   var graphLength = Math.min(w, h);
//   // var graphWidth = 300,
//   //   graphHeight = 300;
//
//   var dataset = [];
//   var legendOptions = [];
//   var colorscale = d3.scaleOrdinal(d3.schemeCategory10);
//   var radarClassElementsString = "yield-radar-chart-serie"; //ironically missing an s
//
//   //for each year given, setup the data in that series
//   for (var i = 0; i < yearArray.length; i++) {
//
//     var y = yearArray[i];
//     //Totals.yieldResults[y][tempString]
//     var obj = [{
//         label: "Corn Grain",
//         axis: "Corn Grain",
//         value: Totals.cornGrainYieldScore[y] / 100,
//         raw: (Math.round(Totals.yieldResults[y].cornGrainYield * 10) / 10) + " bu"
//       },
//       {
//         label: "Soybean",
//         axis: "Soybean",
//         value: Totals.soybeanYieldScore[y] / 100,
//         raw: (Math.round(Totals.yieldResults[y].soybeanYield * 10) / 10) + " bu"
//       },
//       {
//         label: "Mixed Fruits and Vegetables",
//         axis: "Fruit/Veg",
//         value: Totals.mixedFruitsAndVegetablesYieldScore[y] / 100,
//         raw: (Math.round(Totals.yieldResults[y].mixedFruitsAndVegetablesYield * 10) / 10) + " tons"
//       },
//       {
//         label: "Cattle",
//         axis: "Cattle",
//         value: Totals.cattleYieldScore[y] / 100,
//         raw: (Math.round(Totals.yieldResults[y].cattleYield * 10) / 10) + " animals"
//       },
//       {
//         label: "Alfalfa Hay",
//         axis: "Alfalfa",
//         value: Totals.alfalfaHayYieldScore[y] / 100,
//         raw: (Math.round(Totals.yieldResults[y].alfalfaHayYield * 10) / 10) + " tons"
//       },
//       {
//         label: "Grass Hay",
//         axis: "Grass Hay",
//         value: Totals.grassHayYieldScore[y] / 100,
//         raw: (Math.round(Totals.yieldResults[y].grassHayYield * 10) / 10) + " tons"
//       },
//       {
//         label: "Switchgrass Biomass",
//         axis: "Switchgrass",
//         value: Totals.switchgrassYieldScore[y] / 100,
//         raw: (Math.round(Totals.yieldResults[y].switchgrassYield * 10) / 10) + " tons"
//       },
//       {
//         label: "Wood",
//         axis: "Wood",
//         value: Totals.woodYieldScore[y] / 100,
//         raw: (Math.round(Totals.yieldResults[y].woodYield * 10) / 10) + " board-ft"
//       },
//       {
//         label: "Short Rotation Woody Biomass",
//         axis: "Woody Biomass",
//         value: Totals.shortRotationWoodyBiomassYieldScore[y] / 100,
//         raw: (Math.round(Totals.yieldResults[y].shortRotationWoodyBiomassYield * 10) / 10) + " tons"
//       }
//     ];
//
//     dataset.push(obj);
//     legendOptions.push("Year " + y);
//   }
//
//   //not used, but is useful for scaling the radar plot
//   //  I decided against using the maximumOfData in config, as it is somewhat misleading
//   //  when the graphic changes scales between uses
//   var maximumOfData = 0;
//   for (var i = 0; i < dataset.length; i++) {
//     for (var j = 0; j < dataset[i].length; j++) {
//       if (dataset[i][j].value > maximumOfData) maximumOfData = dataset[i][j].value;
//     }
//   }
//
//   //option overrides for chart
//   var chartConfigOverride = {
//     // w: graphWidth,
//     // h: graphHeight,
//     w: graphLength,
//     h: graphLength,
//     maxValue: 1,
//     levels: 5,
//     ExtraWidthX: 300,
//     TranslateX: graphLength * 0.487, //95
//     TranslateY: graphLength * 0.154 //30
//   };
//
//   //get elements in the child frame
//   var radarId = document.getElementById('resultsFrame').contentWindow.document.getElementById('yieldRadarChart');
//   var radarLegendId = document.getElementById('resultsFrame').contentWindow.document.getElementById('yieldRadarLegend');
//   // var checkboxes = document.getElementById('resultsFrame').contentWindow.document.getElementById('yieldChecks');
//
//   //use Radar object to create a plot
//   RadarChart.draw(radarId, dataset, chartConfigOverride, 'mouseoverInfoRadarLeft', radarClassElementsString);
//
//   //now, time for the legend
//   // var legendWidth = 355;
//   // var legendHeight = 370;
//   var legendWidth = Math.round(window.innerWidth * 0.376);
//   var legendHeight = Math.round(window.innerHeight * 0.394);
//   var legendLength = Math.round(Math.min(legendWidth, legendHeight));
//
//   var svg = d3.select(radarLegendId)
//     .append('svg')
//     // .attr('width', legendWidth)
//     // .attr('height', legendHeight)
//     .attr('width', legendLength)
//     .attr('height', legendLength)
//     .append('g')
//     .attr('transform', 'translate(' + (legendLength / 2) + ',' + (legendLength / 2) + ')');
//
//   //add title for legend/chart
//   svg.append("text")
//     .attr("x", 0)
//     // .attr("y", -120)
//     .attr("y", Math.round(-0.324 * legendHeight))
//     .attr("text-anchor", "middle")
//     .style("font-size", "1.8vw")
//     .style("font-weight", "bold")
//     .text("Annual Yield Results");
//
//   //sizing for the colored squares and spaces
//   // var legendRectSize = 18;
//   // var legendSpacing = 4;
//   var legendRectSize = Math.round(graphLength * 0.06);
//   var legendSpacing = Math.round(legendRectSize * 0.22);
//
//   //add all the elements that have a nonzero count
//   var legend = svg.selectAll('.legend')
//     .data(legendOptions)
//     .enter()
//     .append('g')
//     .on('mouseover', function(d) {
//
//       //change text to blue on mouse over
//       d3.select(this).style("fill", "steelblue");
//
//       //highlight area for the series in plot
//       var g = d3.select(radarId);
//       z = d3.select(this).attr("childElement");
//       z = "polygon." + z;
//
//       g.selectAll("polygon")
//         .transition(200)
//         .style("fill-opacity", 0.1);
//       g.selectAll(z)
//         .transition(200)
//         .style("fill-opacity", 0.7);
//     })
//     .on('mouseout', function(d) {
//
//       //set text back to black
//       d3.select(this).style("fill", "black");
//
//       //reset polygon area highlight
//       var g = d3.select(radarId);
//       g.selectAll("polygon")
//         .transition(200)
//         .style("fill-opacity", 0.2);
//     })
//     .attr("childElement", function(d, i) {
//       return radarClassElementsString + i;
//     })
//     .attr('transform', function(d, i) {
//       var height = legendRectSize + legendSpacing;
//       // var offset = 80;
//       // var horz = -124;
//       var offset = Math.round(legendRectSize * 4.44);
//       var horz = Math.round(legendRectSize * -1.55);
//       var vert = i * height - offset;
//       return 'translate(' + horz + ',' + vert + ')';
//     });
//
//   //add legend color squares
//   legend.append('rect')
//     .attr('width', legendRectSize)
//     .attr('height', legendRectSize)
//     .style('fill', function(d, i) {
//       return colorscale(i);
//     })
//     .style('stroke', function(d, i) {
//       return colorscale(i);
//     });
//
//   //add legend text info
//   legend.append('text')
//     .attr('x', legendRectSize + legendSpacing)
//     .attr('y', legendRectSize - legendSpacing)
//     .text(function(d) {
//       return d;
//     });
//
//   // add checkbox
//   legend.append('foreignObject')
//     .attr('width', 20)
//     .attr('height', 20)
//     .attr('x', 70)
//     .attr('y', 0)
//
//     .append('xhtml:input')
//     .attr('id', function(d) {
//       return "yieldCheckboxYear" + d.slice(-1);
//     })
//     .attr('class', 'yearCheckbox')
//     .attr('onclick', function(d) {
//       return "yieldRadarPlotYearToggle(" + d.slice(-1) + ");";
//     })
//     .attr('width', legendRectSize)
//     .attr('height', legendRectSize)
//     .attr('checked', "")
//     .attr('type', 'checkbox');
// } //end drawYieldRadar()

function generateEconomicsTables() {
  //if the var has "E" close to the end of var name, it is for enterprise table
  var convCorn = ""; //convCorn = corn after soybean
  var convCorn2 = ""; // convCorn2 = corn after corn
  var consCorn = ""; //consCorn = corn after soybean
  var consCorn2 = ""; //consCorn = corn after corn
  var convSoy = "";
  var consSoy = "";
  var alf = "";
  var permPas = "";
  var rotGraz = "";
  var grassHay = "";
  var prairie = "";
  var consFor = "";
  var convFor = "";
  var switchG = "";
  var shortRWB = "";
  var wetland = "";
  var mixedFruitsV = "";


  //file used for data
  var file = "./Info_Trackers.csv";

  //results array that holds data objects
  var results = [];

  //resulting parse from file variable
  var res;

  var source = "../htmlFrames/imgs/text.png"

  //parsing the entire file and putting each cell into an the array res
  $.ajax({
    async: false,
    type: "GET",
    url: file,
    dataType: "text",
    contentType: "application/x-www-form-urlencoded;charset=UTF-8",
    success: function(data) {
      res = data.split(/\n/);
      res = res.split(/\r/);
    },
    error: function(data) {
      console.log(JSON.stringify(data));
    }
  });

  //iterating through all the cells and creating TIME objects out of data then data into results array
  for(var i = 0; i < res.length; ++i){
    var tempObj = getObj(res[i], "T");
    results.push(tempObj);
  }
  results.splice(0,1);



  //getting total for each land use and grand total by calling getEconomicsData
  getEconomicsData(results);

  //updates the tables by calling updateTables
  updateTables(results);
  setTables("T");
  clearTableVars();


  //iterating through all the cells and creating ACTION objects out of data then data into results array
  for(var i = 0; i < res.length; ++i){
    var tempObj = getObj(res[i], "A");
    results.push(tempObj);
  }
  results.splice(0,1);

  updateTables(results);
  setTables("A");
  clearTableVars();

  function clearTableVars() {
    convCorn, convCorn2, consCorn, consCorn2, convSoy, consSoy, alf, permPas, rotGraz, grassHay, prairie, consFor, convFor, switchG, shortRWB, wetland, mixedFruitsV = "";
    results = [];
  }

  function updateTables(values) {
    convCorn = "<table><tr><th>Cost Name</th><th>"+values[0].name+"</th><th>Value ($)</th><th>Frequency</th><th>Description</th></tr>";
    convCorn2 = "<table><tr><th>Cost Name</th><th>"+values[0].name+"</th><th>Value ($)</th><th>Frequency</th><th>Description</th></tr>";
    consCorn = "<table><tr><th>Cost Name</th><th>"+values[0].name+"</th><th>Value ($)</th><th>Frequency</th><th>Description</th></tr>";
    consCorn2 = "<table><tr><th>Cost Name</th><th>"+values[0].name+"</th><th>Value ($)</th><th>Frequency</th><th>Description</th></tr>";
    convSoy = "<table><tr><th>Cost Name</th><th>"+values[0].name+"</th><th>Value ($)</th><th>Frequency</th><th>Description</th></tr>";
    consSoy = "<table><tr><th>Cost Name</th><th>"+values[0].name+"</th><th>Value ($)</th><th>Frequency</th><th>Description</th></tr>";
    alf = "<table><tr><th>Cost Name</th><th>"+values[0].name+"</th><th>Value ($)</th><th>Frequency</th><th>Description</th></tr>";
    permPas = "<table><tr><th>Cost Name</th><th>"+values[0].name+"</th><th>Value ($)</th><th>Frequency</th><th>Description</th></tr>";
    rotGraz = "<table><tr><th>Cost Name</th><th>"+values[0].name+"</th><th>Value ($)</th><th>Frequency</th><th>Description</th></tr>";
    grassHay = "<table><tr><th>Cost Name</th><th>"+values[0].name+"</th><th>Value ($)</th><th>Frequency</th><th>Description</th></tr>";
    prairie = "<table><tr><th>Cost Name</th><th>"+values[0].name+"</th><th>Value ($)</th><th>Frequency</th><th>Description</th></tr>";
    consFor = "<table><tr><th>Cost Name</th><th>"+values[0].name+"</th><th>Value ($)</th><th>Frequency</th><th>Description</th></tr>";
    convFor = "<table><tr><th>Cost Name</th><th>"+values[0].name+"</th><th>Value ($)</th><th>Frequency</th><th>Description</th></tr>";
    switchG = "<table><tr><th>Cost Name</th><th>"+values[0].name+"</th><th>Value ($)</th><th>Frequency</th><th>Description</th></tr>";
    shortRWB = "<table><tr><th>Cost Name</th><th>"+values[0].name+"</th><th>Value ($)</th><th>Frequency</th><th>Description</th></tr>";
    wetland = "<table><tr><th>Cost Name</th><th>"+values[0].name+"</th><th>Value ($)</th><th>Frequency</th><th>Description</th></tr>";
    mixedFruitsV = "<table><tr><th>Cost Name</th><th>"+values[0].name+"</th><th>Value ($)</th><th>Frequency</th><th>Description</th></tr>";


    for(var i = 0; i < values.length; ++i){
      switch (values[i].landUse) {
        case "Conventional Corn":
          if(values[i].subCrop === "Corn after Soybean"){

            convCorn += "<tr><td>"+values[i].costName+"</td><td>"+values[i].TorA+"</td><td>"+values[i].value+"</td><td>"+values[i].timeOfYear+"</td><td>"+values[i].description+"</td></tr>";
          }
          else{
            convCorn2 += "<tr><td>"+values[i].costName+"</td><td>"+values[i].TorA+"</td><td>"+values[i].value+"</td><td>"+values[i].timeOfYear+"</td><td>"+values[i].description+"</td></tr>";
          }
        break;
        case "Conservation Corn":
          if(values[i].subCrop === "Corn after Soybean"){
            consCorn += "<tr><td>"+values[i].costName+"</td><td>"+values[i].TorA+"</td><td>"+values[i].value+"</td><td>"+values[i].timeOfYear+"</td><td>"+values[i].description+"</td></tr>";
          }
          else{
            consCorn2 += "<tr><td>"+values[i].costName+"</td><td>"+values[i].TorA+"</td><td>"+values[i].value+"</td><td>"+values[i].timeOfYear+"</td><td>"+values[i].description+"</td></tr>";
          }
        break;
        case "Conventional Soybean":
        convSoy += "<tr><td>"+values[i].costName+"</td><td>"+values[i].TorA+"</td><td>"+values[i].value+"</td><td>"+values[i].timeOfYear+"</td><td>"+values[i].description+"</td></tr>";
        break;
        case "Conservation Soybean":
        consSoy += "<tr><td>"+values[i].costName+"</td><td>"+values[i].TorA+"</td><td>"+values[i].value+"</td><td>"+values[i].timeOfYear+"</td><td>"+values[i].description+"</td></tr>";
        break;
        case "Alfalfa":
        alf += "<tr><td>"+values[i].costName+"</td><td>"+values[i].TorA+"</td><td>"+values[i].value+"</td><td>"+values[i].timeOfYear+"</td><td>"+values[i].description+"</td></tr>";
        break;
        case "Permanent Pasture":
        permPas += "<tr><td>"+values[i].costName+"</td><td>"+values[i].TorA+"</td><td>"+values[i].value+"</td><td>"+values[i].timeOfYear+"</td><td>"+values[i].description+"</td></tr>";
        break;
        case "Rotational Grazing":
        rotGraz += "<tr><td>"+values[i].costName+"</td><td>"+values[i].TorA+"</td><td>"+values[i].value+"</td><td>"+values[i].timeOfYear+"</td><td>"+values[i].description+"</td></tr>";
        break;
        case "Grass Hay":
        grassHay += "<tr><td>"+values[i].costName+"</td><td>"+values[i].TorA+"</td><td>"+values[i].value+"</td><td>"+values[i].timeOfYear+"</td><td>"+values[i].description+"</td></tr>";
        break;
        case "Prairie":
        prairie += "<tr><td>"+values[i].costName+"</td><td>"+values[i].TorA+"</td><td>"+values[i].value+"</td><td>"+values[i].timeOfYear+"</td><td>"+values[i].description+"</td></tr>";
        break;
        case "Conservation Forest":
        consFor += "<tr><td>"+values[i].costName+"</td><td>"+values[i].TorA+"</td><td>"+values[i].value+"</td><td>"+values[i].timeOfYear+"</td><td>"+values[i].description+"</td></tr>";
        break;
        case "Conventional Forest":
        convFor += "<tr><td>"+values[i].costName+"</td><td>"+values[i].TorA+"</td><td>"+values[i].value+"</td><td>"+values[i].timeOfYear+"</td><td>"+values[i].description+"</td></tr>";
        break;
        case "Switchgrass":
        switchG += "<tr><td>"+values[i].costName+"</td><td>"+values[i].TorA+"</td><td>"+values[i].value+"</td><td>"+values[i].timeOfYear+"</td><td>"+values[i].description+"</td></tr>";
        break;
        case "Short-rotation Woody Bioenergy":
        shortRWB += "<tr><td>"+values[i].costName+"</td><td>"+values[i].TorA+"</td><td>"+values[i].value+"</td><td>"+values[i].timeOfYear+"</td><td>"+values[i].description+"</td></tr>";
        break;
        case "Wetland":
        wetland += "<tr><td>"+values[i].costName+"</td><td>"+values[i].TorA+"</td><td>"+values[i].value+"</td><td>"+values[i].timeOfYear+"</td><td>"+values[i].description+"</td></tr>";
        break;
        case "Mixed Fruits & Vegetables":
        mixedFruitsV += "<tr><td>"+values[i].costName+"</td><td>"+values[i].TorA+"</td><td>"+values[i].value+"</td><td>"+values[i].timeOfYear+"</td><td>"+values[i].description+"</td></tr>";
        break;
      }
    }

    convCorn += "</table>";
    convCorn2 += "</table>";
    consCorn += "</table>";
    consCorn2 += "</table>";
    convSoy += "</table>";
    consSoy += "</table>";
    alf += "</table>";
    permPas += "</table>";
    rotGraz += "</table>";
    prairie += "</table>";
    consFor += "</table>";
    convFor += "</table>";
    switchG += "</table>";
    shortRWB += "</table>";
    wetland += "</table>";
    mixedFruitsV += "</table>";
  }

  function setTables(timeOrAction) {
    document.getElementById('resultsFrame').contentWindow.document.getElementById('convCorn'+timeOrAction).innerHTML = convCorn;
    document.getElementById('resultsFrame').contentWindow.document.getElementById('convCorn2'+timeOrAction).innerHTML = convCorn2;
    document.getElementById('resultsFrame').contentWindow.document.getElementById('consCorn'+timeOrAction).innerHTML = consCorn;
    document.getElementById('resultsFrame').contentWindow.document.getElementById('consCorn2'+timeOrAction).innerHTML = consCorn2;
    document.getElementById('resultsFrame').contentWindow.document.getElementById('convSoybean'+timeOrAction).innerHTML = convSoy;
    document.getElementById('resultsFrame').contentWindow.document.getElementById('consSoybean'+timeOrAction).innerHTML = consSoy;
    document.getElementById('resultsFrame').contentWindow.document.getElementById('alfalfa'+timeOrAction).innerHTML = alf;
    document.getElementById('resultsFrame').contentWindow.document.getElementById('permanentPasture'+timeOrAction).innerHTML = permPas;
    document.getElementById('resultsFrame').contentWindow.document.getElementById('rotationalGrazing'+timeOrAction).innerHTML = rotGraz;
    document.getElementById('resultsFrame').contentWindow.document.getElementById('grassHay'+timeOrAction).innerHTML = grassHay;
    document.getElementById('resultsFrame').contentWindow.document.getElementById('prairie'+timeOrAction).innerHTML = prairie;
    document.getElementById('resultsFrame').contentWindow.document.getElementById('consForest'+timeOrAction).innerHTML = consFor;
    document.getElementById('resultsFrame').contentWindow.document.getElementById('convForest'+timeOrAction).innerHTML = convFor;
    document.getElementById('resultsFrame').contentWindow.document.getElementById('switchgrass'+timeOrAction).innerHTML = switchG;
    document.getElementById('resultsFrame').contentWindow.document.getElementById('shortRWB'+timeOrAction).innerHTML = shortRWB;
    document.getElementById('resultsFrame').contentWindow.document.getElementById('wetland'+timeOrAction).innerHTML = wetland;
    document.getElementById('resultsFrame').contentWindow.document.getElementById('mixedFaV'+timeOrAction).innerHTML = mixedFruitsV;


    document.getElementById('resultsFrame').contentWindow.document.getElementById('convCornE'+timeOrAction).innerHTML = convCorn;
    document.getElementById('resultsFrame').contentWindow.document.getElementById('convCornE2'+timeOrAction).innerHTML = convCorn2;
    document.getElementById('resultsFrame').contentWindow.document.getElementById('consCornE'+timeOrAction).innerHTML = consCorn;
    document.getElementById('resultsFrame').contentWindow.document.getElementById('consCornE2'+timeOrAction).innerHTML = consCorn2;
    document.getElementById('resultsFrame').contentWindow.document.getElementById('convSoybeanE'+timeOrAction).innerHTML = convSoy;
    document.getElementById('resultsFrame').contentWindow.document.getElementById('consSoybeanE'+timeOrAction).innerHTML = consSoy;
    document.getElementById('resultsFrame').contentWindow.document.getElementById('alfalfaE'+timeOrAction).innerHTML = alf;
    document.getElementById('resultsFrame').contentWindow.document.getElementById('permanentPastureE'+timeOrAction).innerHTML = permPas;
    document.getElementById('resultsFrame').contentWindow.document.getElementById('rotationalGrazingE'+timeOrAction).innerHTML = rotGraz;
    document.getElementById('resultsFrame').contentWindow.document.getElementById('grassHayE'+timeOrAction).innerHTML = grassHay;
    document.getElementById('resultsFrame').contentWindow.document.getElementById('prairieE'+timeOrAction).innerHTML = prairie;
    document.getElementById('resultsFrame').contentWindow.document.getElementById('consForestE'+timeOrAction).innerHTML = consFor;
    document.getElementById('resultsFrame').contentWindow.document.getElementById('convForestE'+timeOrAction).innerHTML = convFor;
    document.getElementById('resultsFrame').contentWindow.document.getElementById('switchgrassE'+timeOrAction).innerHTML = switchG;
    document.getElementById('resultsFrame').contentWindow.document.getElementById('shortRWBE'+timeOrAction).innerHTML = shortRWB;
    document.getElementById('resultsFrame').contentWindow.document.getElementById('wetlandE'+timeOrAction).innerHTML = wetland;
    document.getElementById('resultsFrame').contentWindow.document.getElementById('mixedFaVE'+timeOrAction).innerHTML = mixedFruitsV;
  }

}

function getEconomicsData(data) {
  data.splice(-1,1);
  tempResult = data;
  var tempData = [];
  var convCorn = 0;
  var consCorn = 0;
  var convSoy = 0;
  var consSoy = 0;
  var alf = 0;
  var permPas = 0;
  var rotGraz = 0;
  var grassHay = 0;
  var prairie = 0;
  var consFor = 0;
  var convFor = 0;
  var switchG = 0;
  var shortRWB = 0;
  var wetland = 0;
  var mixedFruitsV = 0;
  var total = 0;
  var names = ["Conventional Corn","Conservation Corn", "Conventional Soybean", "Conservation Soybean", "Alfalfa",
              "Permanent Pasture", "Rotational Grazing", "Grass Hay", "Prairie", "Conservation Forest", "Conventional Forest",
              "Switchgrass", "Short-rotation Woody Bioenergy", "Wetland", "Mixed Fruits & Vegetables"];

  for(var i = 0; i < data.length; ++i){
    switch (data[i].landUse) {
      case "Conventional Corn":
      var temp = getValue(data[i].value);
      convCorn += temp;
      total += temp;
      break;
      case "Conservation Corn":
      var temp = getValue(data[i].value);
      consCorn += temp;
      total += temp;
      break;
      case "Conventional Soybean":
      var temp = getValue(data[i].value);
      convSoy += temp;
      total += temp;
      break;
      case "Conservation Soybean":
      var temp = getValue(data[i].value);
      consSoy += temp;
      total += temp;
      break;
      case "Alfalfa":
      var temp = getValue(data[i].value);
      alf += temp;
      total += temp;
      break;
      case "Permanent Pasture":
      var temp = getValue(data[i].value);
      permPas += temp;
      total += temp;
      break;
      case "Rotational Grazing":
      var temp = getValue(data[i].value);
      rotGraz += temp;
      total += temp;
      break;
      case "Grass Hay":
      var temp = getValue(data[i].value);
      grassHay += temp;
      total += temp;
      break;
      case "Prairie":
      var temp = getValue(data[i].value);
      prairie += temp;
      total += temp;
      break;
      case "Conservation Forest":
      var temp = getValue(data[i].value);
      consFor += temp;
      total += temp;
      break;
      case "Conventional Forest":
      var temp = getValue(data[i].value);
      convFor += temp;
      total += temp;
      break;
      case "Switchgrass":
      var temp = getValue(data[i].value);
      switchG += temp;
      total += temp;
      break;
      case "Short-rotation Woody Bioenergy":
      var temp = getValue(data[i].value);
      shortRWB += temp;
      total += temp;
      break;
      case "Wetland":
      var temp = getValue(data[i].value);
      wetland += temp;
      total += temp;
      break;
      case "Mixed Fruits & Vegetables":
      var temp = getValue(data[i].value);
      mixedFruitsV += temp;
      total += temp;
      break;
    }
  }

  var totals = [convCorn, consCorn, convSoy, consSoy, alf, permPas, rotGraz, grassHay, prairie, consFor, convFor, switchG, shortRWB, wetland, mixedFruitsV];

  localStorage.setItem("convCorn", convCorn.toFixed(2));
  localStorage.setItem("consCorn", consCorn.toFixed(2));
  localStorage.setItem("convSoy", convSoy.toFixed(2));
  localStorage.setItem("consSoy", consSoy.toFixed(2));
  localStorage.setItem("alf", alf.toFixed(2));
  localStorage.setItem("permPas", permPas.toFixed(2));
  localStorage.setItem("rotGraz", rotGraz.toFixed(2));
  localStorage.setItem("grassHay", grassHay.toFixed(2));
  localStorage.setItem("prairie", prairie.toFixed(2));
  localStorage.setItem("consFor", consFor.toFixed(2));
  localStorage.setItem("convFor", convFor.toFixed(2));
  localStorage.setItem("switchG", switchG.toFixed(2));
  localStorage.setItem("shortRWB", shortRWB.toFixed(2));
  localStorage.setItem("wetland", wetland.toFixed(2));
  localStorage.setItem("mixedFruitsV", mixedFruitsV.toFixed(2));



  for(var i = 0; i < names.length; ++i){
    var tempObj = {label: names[i], count: totals[i], number: (totals[i]/total)};
    tempData.push(tempObj);
  }
  tempResult = tempData;
}

function getValue(val) {
  if(val.charAt(0) === '$'){
    var temp = val.replace(/[^0-9\.-]+/g,"");
    return parseFloat(temp);
  }
  else if(val.charAt(0) === '('){
    var temp = val.substr(1);
    temp = temp.substr(1);
    temp = temp.substring(0, temp.length - 1);
    temp = (-1 * temp);
    return parseFloat(temp);
  }
  else {
    console.log(val);
    console.log("inside 0");
    return 0;
  }
}

function getObj(data, tOrA){
  var result = data.split(/;/)
  if(tOrA === "T"){
    var obj = {landUse: result[1], costName: result[7], name: "Time", TorA: result[5], value: result[8], timeOfYear: result[4], description: result[12], subCrop: result[2]};
  }
  else if(tOrA === "A"){
    var obj = {landUse: result[1], costName: result[7], name: "Action", TorA: result[6], value: result[8], timeOfYear: result[4], description: result[12], subCrop: result[2]};
  }

  return obj;
}

//generateResultsTable creates the string of html with all the numerical results
// the code here is a little dense, but entirely straightforward
// where possible, loops are created for years
function generateResultsTable() {

  var toMetricFactorArea = 2.471;
  var upToYear = boardData[currentBoard].calculatedToYear;

  /*
  * The variable 'dataset' is a variable that holds all the information of map land distribution for multiplayer mode.
  * The variable is used in this function as a reference to get size of parcel of each player.
  * For more information refer to Issue 386.
  */
  var dataset = [{
    label: 'Player 1',
    count: (Math.round(Totals.landUseResults[1].conventionalCornLandUse / Totals.totalArea * 100 * 10) / 10),
    number: (Math.round(Totals.landUseResults[1].conventionalCornLandUse * 10) / 10)
  }, {
    label: 'Player 2',
    count: (Math.round(Totals.landUseResults[1].conservationCornLandUse / Totals.totalArea * 100 * 10) / 10),
    number: (Math.round(Totals.landUseResults[1].conservationCornLandUse * 10) / 10)
  }, {
    label: 'Player 3',
    count: (Math.round(Totals.landUseResults[1].conventionalSoybeanLandUse / Totals.totalArea * 100 * 10) / 10),
    number: (Math.round(Totals.landUseResults[1].conventionalSoybeanLandUse * 10) / 10)
  }, {
    label: 'Player 4',
    count: (Math.round(Totals.landUseResults[1].conservationSoybeanLandUse / Totals.totalArea * 100 * 10) / 10),
    number: (Math.round(Totals.landUseResults[1].conservationSoybeanLandUse * 10) / 10)
  }, {
    label: 'Player 5',
    count: (Math.round(Totals.landUseResults[1].alfalfaLandUse / Totals.totalArea * 100 * 10) / 10),
    number: (Math.round(Totals.landUseResults[1].alfalfaLandUse * 10) / 10)
  }, {
    label: 'Player 6',
    count: (Math.round(Totals.landUseResults[1].permanentPastureLandUse / Totals.totalArea * 100 * 10) / 10),
    number: (Math.round(Totals.landUseResults[1].permanentPastureLandUse * 10) / 10)
  }];

  var listOfPlayerAv = [];

  var frontendNames = ["Conventional Corn Area", "Conservation Corn Area", "Conventional Soybean Area", "Conservation Soybean Area",
    "Mixed Fruits and Vegetables Area", "Permanent Pasture Area", "Rotational Grazing Area", "Grass Hay Area",
    "Switchgrass Area", "Prairie Area", "Wetland Area", "Alfalfa Area", "Conventional Forest Area",
    "Conservation Forest Area", "Short Rotation Woody Bioenergy Area"
  ];
  var backendDataIdentifiers = ["conventionalCorn", "conservationCorn", "conventionalSoybean",
    "conservationSoybean", "mixedFruitsVegetables", "permanentPasture", "rotationalGrazing", "grassHay",
    "switchgrass", "prairie", "wetland", "alfalfa", "conventionalForest",
    "conservationForest", "shortRotationWoodyBioenergy"
  ];

  /*
  * The htmlTableString variable is used to keep track of which players have a parcel size greater than 0.
  */
  var htmlTableString = "";

  //The code below is creating the first table
  htmlTableString += "<table id='table1' class='resultsTable'>";

  //The following coditional statement is to modify the results table depending on the mode.
  //If the condition is true then it means that the results will be modified to the multiplayer mode, else it will be the same results table per every other mode.
  if(localStorage.getItem('LSinMultiplayer')==="true"){
    console.log(boardData[currentBoard]);

    //add header
    //Players section of table START
    //The code below is to add the column titles for Players section of results table
    htmlTableString += "<tr class='tableHeading'> <th> Players </th>";
    for (var y = 1; y <= upToYear; y++) {
      htmlTableString += "<th>";
      htmlTableString += "Y" + y;
      htmlTableString += "</th>";
    }

    htmlTableString += "<th>Percentage</th>";

    for (var y = 1; y <= upToYear; y++) {
      htmlTableString += "<th>";
      htmlTableString += "Y" + y;
      htmlTableString += "</th>";
    }

    htmlTableString += "<th>Units (English) </th>";

    for (var y = 1; y <= upToYear; y++) {
      htmlTableString += "<th>";
      htmlTableString += "Y" + y;
      htmlTableString += "</th>";
    }

    htmlTableString += "<th>Units (Metric) </th>";

    htmlTableString += "</tr>";
    //The code above is to add the column titles for Players section of results table

    //The code below is to add players data to results table
    for(var i = 1; i < 7; ++i){
      var j = i;
      //the condition below is to make sure the parcel size is greater than 0, if not that player will not be included in the results table
      if(dataset[i-1].number <=  0){
        j = 0;
      }
      else{
        listOfPlayerAv.push(i);
      }
      //the switch case is to toggle between different "players" since players is assigned by different land types
      switch (j) {
        case 0:
          //default case does nothing, this is to only display players who own land
          break;
        case 1:
          htmlTableString += "<tr><td> Player "+i+" </td>";
          htmlTableString += "<td> " + dataset[i-1].count +" </td><td> percent </td>"
          htmlTableString += "<td> " + dataset[i-1].number +" </td><td> acres </td>";
          htmlTableString += "<td> " + (Math.round(Totals.landUseResults[1]["conventionalCornLandUse"] / toMetricFactorArea * 10) / 10) +" </td><td> hectares </td>";
          break;
        case 2:
          htmlTableString += "<tr><td> Player "+i+" </td>";
          htmlTableString += "<td> " + dataset[i-1].count +" </td><td> percent </td>"
          htmlTableString += "<td> " + dataset[i-1].number +" </td><td> acres </td>";
          htmlTableString += "<td> " + (Math.round(Totals.landUseResults[1]["conservationCornLandUse"] / toMetricFactorArea * 10) / 10) +" </td><td> hectares </td>";
          break;
        case 3:
          htmlTableString += "<tr><td> Player "+i+" </td>";
          htmlTableString += "<td> " + dataset[i-1].count +" </td><td> percent </td>"
          htmlTableString += "<td> " + dataset[i-1].number +" </td><td> acres </td>";
          htmlTableString += "<td> " + (Math.round(Totals.landUseResults[1]["conventionalSoybeanLandUse"] / toMetricFactorArea * 10) / 10) +" </td><td> hectares </td>";
          break;
        case 4:
          htmlTableString += "<tr><td> Player "+i+" </td>";
          htmlTableString += "<td> " + dataset[i-1].count +" </td><td> percent </td>"
          htmlTableString += "<td> " + dataset[i-1].number +" </td><td> acres </td>";
          htmlTableString += "<td> " + (Math.round(Totals.landUseResults[1]["conservationSoybeanLandUse"] / toMetricFactorArea * 10) / 10) +" </td><td> hectares </td>";
          break;
        case 5:
          htmlTableString += "<tr><td> Player "+i+" </td>";
          htmlTableString += "<td> " + dataset[i-1].count +" </td><td> percent </td>"
          htmlTableString += "<td> " + dataset[i-1].number +" </td><td> acres </td>";
          htmlTableString += "<td> " + (Math.round(Totals.landUseResults[1]["alfalfaLandUse"] / toMetricFactorArea * 10) / 10) +" </td><td> hectares </td>";
          break;
        case 6:
          htmlTableString += "<tr><td> Player "+i+" </td>";
          htmlTableString += "<td> " + dataset[i-1].count +" </td><td> percent </td>"
          htmlTableString += "<td> " + dataset[i-1].number +" </td><td> acres </td>";
          htmlTableString += "<td> " + (Math.round(Totals.landUseResults[1]["permanentPastureLandUse"] / toMetricFactorArea * 10) / 10) +" </td><td> hectares </td>";
          break;
      }
      htmlTableString += "</tr>";
    }

    htmlTableString += "</table><br>";
    //END of Table 1 (Players)==================================================

    //Start of Precipitation table
    htmlTableString += "<table id='table4' class='resultsTable'>";

    //add header
    htmlTableString += "<tr class='tableHeading'> <th style='width:220px;'> Precipitation </th>";
    //filling the column titles (code below)
    for (var y = 1; y <= upToYear; y++) {
      htmlTableString += "<th>";
      htmlTableString += "Y" + y;
      htmlTableString += "</th>";
    }

    htmlTableString += "<th> Units (English) </th>";

    for (var y = 1; y <= upToYear; y++) {
      htmlTableString += "<th>";
      htmlTableString += "Y" + y;
      htmlTableString += "</th>";
    }

    htmlTableString += "<th> Units(Metric) </th>";

    htmlTableString += "</tr>";

    //adding the data for precipitation table
    htmlTableString += "<tr><td>Precipitation</td>";

    for (var y = 1; y <= upToYear; y++) {
      htmlTableString += "<td>";
      htmlTableString += boardData[currentBoard].precipitation[y];
      htmlTableString += "</td>";
    }

    htmlTableString += "<td>inches</td>";

    for (var y = 1; y <= upToYear; y++) {
      htmlTableString += "<td>";
      htmlTableString += Math.round(boardData[currentBoard].precipitation[y] * 2.54 * 10) / 10;
      htmlTableString += "</td>";
    }

    htmlTableString += "<td>cm</td></tr>";

    htmlTableString += "</table><br>";
    //END of Table 2 (Precipitation)==================================================

    //Start of Strategic Wetland Use table
    htmlTableString += "<table id='table4' class='resultsTable'>";

    //The code below is to add the column titles for Players section of results table
    //add header
    htmlTableString += "<tr class='tableHeading'> <th style='width:220px;'> Strategic Wetland Use </th>";
    //filling the column titles (code below)
    for (var y = 1; y <= upToYear; y++) {
      htmlTableString += "<th>";
      htmlTableString += "Y" + y;
      htmlTableString += "</th>";
    }

    htmlTableString += "<th> </th>";

    for (var y = 1; y <= upToYear; y++) {
      htmlTableString += "<th>";
      htmlTableString += "Y" + y;
      htmlTableString += "</th>";
    }

    htmlTableString += "<th> </th>";

    htmlTableString += "</tr>";
    //The code above is to add the column titles for Players section of results table

    for(var j = 0; j < listOfPlayerAv.length; ++j){
      //The code below is to fill player data into the html page
      var i = listOfPlayerAv[j];
      htmlTableString += "<tr><td> Player "+i+" </td>";
      htmlTableString += "<td> "+((strategicWetlandFinder(i)/20)*100)+" </td><td> Percent </td><td> "+strategicWetlandFinder(i)+" </td><td> Cells </td>"
    }

    htmlTableString += "</table><br>";
    //END of Table 3 (Strategic Wetlands)==================================================


    //===========================END OF RESTULTS TABLE (if version)
  }//end of if
  else {
    htmlTableString += "<tr class='tableHeading'> <th> Land Use Category </th>";
    for (var y = 1; y <= upToYear; y++) {
      htmlTableString += "<th>";
      htmlTableString += "Y" + y;
      htmlTableString += "</th>";
    }

    htmlTableString += "<th>Percentage</th>";

    for (var y = 1; y <= upToYear; y++) {
      htmlTableString += "<th>";
      htmlTableString += "Y" + y;
      htmlTableString += "</th>";
    }

    htmlTableString += "<th>Units (English) </th>";

    for (var y = 1; y <= upToYear; y++) {
      htmlTableString += "<th>";
      htmlTableString += "Y" + y;
      htmlTableString += "</th>";
    }

    htmlTableString += "<th>Units (Metric) </th>";

    htmlTableString += "</tr>";

    //Add Data Rows

    for (var l = 0; l < backendDataIdentifiers.length; l++) {

      //check for the cases where a header needs to be added
      switch (l) {
        case 0:
          htmlTableString += "<tr class='tableHeading'><td><b>Annual Grain</b></td></tr>";
          break;
        case 2:
          htmlTableString += "<tr class='tableHeading'><td><b>Annual Legume</b></td></tr>";
          break;
        case 4:
          htmlTableString += "<tr class='tableHeading'><td><b>Mixed Fruits and Vegetables</b></td></tr>";
          break;
        case 5:
          htmlTableString += "<tr class='tableHeading'><td><b>Pasture</b></td></tr>";
          break;
        case 7:
          htmlTableString += "<tr class='tableHeading'><td><b>Perennial Herbaceous (non-pasture)</b></td></tr>";
          break;
        case 11:
          htmlTableString += "<tr class='tableHeading'><td><b>Perennial Legume</b></td></tr>";
          break;
        case 12:
          htmlTableString += "<tr class='tableHeading'><td><b>Perennial Wooded</b></td></tr>";
          break;

      } //end switch

      htmlTableString += "<tr>";

      htmlTableString += "<td>" + frontendNames[l] + "</td>";

      for (var y = 1; y <= upToYear; y++) {
        htmlTableString += "<td>";

        var tempString = backendDataIdentifiers[l] + "LandUse";
        htmlTableString += (Math.round(Totals.landUseResults[y][tempString] / Totals.totalArea * 100 * 10) / 10) + "<br>";

        htmlTableString += "</td>";
      } //for each year

      //units cell
      htmlTableString += "<td>percent</td>";

      for (var y = 1; y <= upToYear; y++) {
        htmlTableString += "<td>";

        var tempString = backendDataIdentifiers[l] + "LandUse";
        htmlTableString += (Math.round(Totals.landUseResults[y][tempString] * 10) / 10) + "<br>";

        htmlTableString += "</td>";
      } //for each year

      //units cell
      htmlTableString += "<td>acres</td>";

      for (var y = 1; y <= upToYear; y++) {
        htmlTableString += "<td>";

        var tempString = backendDataIdentifiers[l] + "LandUse";
        htmlTableString += (Math.round(Totals.landUseResults[y][tempString] / toMetricFactorArea * 10) / 10) + "<br>";

        htmlTableString += "</td>";

      } //for each year

      //units cell
      htmlTableString += "<td>hectares</td></tr>";
    }

    htmlTableString += "</table><br>";


    //===================================================
    //SECOND TABLE, ECOSYSTEM INDICATORS


    frontendNames = ["Game Wildlife", "Biodiversity", "Carbon Sequestration", "Erosion Control / Gross Erosion",
      "Nitrate Pollution Control <br> / In-Stream Concentration", "Phosphorus Pollution Control <br> / In-Stream Loading",
      "Sediment Control <br> / In-Stream Delivery"
    ];
    backendDataIdentifiers = ["gameWildlifePoints", "biodiversityPoints", "carbonSequestration", "grossErosion", "nitrateConcentration",
      "phosphorusLoad", "sedimentDelivery"
    ];

    //variables for english to metric
    // results are generally in english units as the original thesis
    // had all calculations done this way
    conversionArray = [1, 1, 0.90718474, 0.90718474, 1, 0.90718474, 0.90718474, 0.90718474];

    htmlTableString += "<table id='table2' class='resultsTable'>";

    //add header row

    htmlTableString += "<tr class='tableHeading'> <th> Ecosystem Service Indicator <br> / Measurement </th>";

    for (var y = 1; y <= upToYear; y++) {
      htmlTableString += "<th>";
      htmlTableString += "Y" + y;
      htmlTableString += "</th>";
    }

    htmlTableString += "<th>Score</th>";

    for (var y = 1; y <= upToYear; y++) {
      htmlTableString += "<th>";
      htmlTableString += "Y" + y;
      htmlTableString += "</th>";
    }

    htmlTableString += "<th>Units (English) </th>";

    for (var y = 1; y <= upToYear; y++) {
      htmlTableString += "<th>";
      htmlTableString += "Y" + y;
      htmlTableString += "</th>";
    }

    htmlTableString += "<th>Units (Metric) </th>";

    htmlTableString += "</tr>";

    //table data

    for (var l = 0; l < backendDataIdentifiers.length; l++) {

      //keep track if we need to add the appropriate subheading lines
      switch (l) {
        case 0:
          htmlTableString += "<tr class='tableHeading'><td><b>Habitat</b></td></tr>";
          break;
        case 2:
          htmlTableString += "<tr class='tableHeading'><td><b>Soil Quality</b></td></tr>";
          break;
        case 4:
          htmlTableString += "<tr class='tableHeading'><td><b>Water Quality</b></td></tr>";
          break;
      } //end switch

      htmlTableString += "<tr>";

      htmlTableString += "<td>" + frontendNames[l] + "</td>";

      for (var y = 1; y <= upToYear; y++) {
        htmlTableString += "<td>";

        var tempString = backendDataIdentifiers[l] + "Score";
        htmlTableString += (Math.round(Totals[tempString][y] * 10) / 10) + "<br>";

        htmlTableString += "</td>";
      } //for each year

      //units cell
      htmlTableString += "<td>(out of 100)</td>";

      for (var y = 1; y <= upToYear; y++) {
        htmlTableString += "<td>";

        var tempString = backendDataIdentifiers[l];
        //Correction for Carbon Sequestrations

        // if (l == 2) {
        //   Totals[tempString][y] = Totals[tempString][y] * (1 / conversionArray[l]);
        // }

        htmlTableString += (Math.round(Totals[tempString][y] * 10) / 10) + "<br>";

        htmlTableString += "</td>";
      } //for each year

      //units cell, keep track which type of units we'll need
      if (l < 2) htmlTableString += "<td>pts</td>";
      if (2 <= l && l < 4) htmlTableString += "<td>tons</td>";
      if (4 <= l && l < 5) htmlTableString += "<td>ppm</td>";
      if (5 <= l && l < 8) htmlTableString += "<td>tons</td>";

      for (var y = 1; y <= upToYear; y++) {
        htmlTableString += "<td>";

        var tempString = backendDataIdentifiers[l];
        htmlTableString += (Math.round(Totals[tempString][y] * conversionArray[l] * 10) / 10) + "<br>";

        htmlTableString += "</td>";

      } //for each year

      //units cell
      if (l < 2) htmlTableString += "<td>pts</td>";
      if (2 <= l && l < 4) htmlTableString += "<td>Mg</td>";
      if (4 <= l && l < 5) htmlTableString += "<td>mg/L</td>";
      if (5 <= l && l < 8) htmlTableString += "<td>Mg</td>";
    }

    //========================================
    //THIRD TABLE, YIELD RESULTS

    frontendNames = ["Corn Grain", "Soybeans", "Mixed Fruits and Vegetables", "Cattle", "Alfalfa Hay", "Grass Hay",
      "Switchgrass Biomass", "Wood", "Short Rotation Woody Biomass"
    ];

    backendDataIdentifiers = ["cornGrainYield", "soybeanYield", "mixedFruitsAndVegetablesYield", "cattleYield",
      "alfalfaHayYield", "grassHayYield", "switchgrassYield", "woodYield", "shortRotationWoodyBiomassYield"
    ];

    //conversion factors for the yeilds
    conversionArray = [0.0254, 0.0272, 0.90718474, 1, 0.90718474, 0.90718474, 0.90718474, 0.002359737, 0.90718474];

    //fill in table rows with data

    for (var l = 0; l < backendDataIdentifiers.length; l++) {

      //keep track of subheadings, just 1 this time
      switch (l) {
        case 0:
          htmlTableString += "<tr class='tableHeading'><td><b>Yield</b></td></tr>";
          break;
      } //end switch

      htmlTableString += "<tr>";

      htmlTableString += "<td>" + frontendNames[l] + "</td>";

      for (var y = 1; y <= upToYear; y++) {
        htmlTableString += "<td>";

        var tempString = backendDataIdentifiers[l] + "Score";
        htmlTableString += (Math.round(Totals[tempString][y] * 10) / 10) + "<br>";

        htmlTableString += "</td>";
      } //for each year
      //units cell
      htmlTableString += "<td>(out of 100)</td>";

      for (var y = 1; y <= upToYear; y++) {
        htmlTableString += "<td>";

        var tempString = backendDataIdentifiers[l];
        htmlTableString += (Math.round(Totals.yieldResults[y][tempString] * 10) / 10) + "<br>";

        htmlTableString += "</td>";
      } //for each year

      //units cell, lots of different ones to keep track of here
      if (l < 2) htmlTableString += "<td>bu</td>";
      if (l == 2) htmlTableString += "<td>tons</td>";
      if (l == 3) htmlTableString += "<td>animals</td>"; //what an odd unit
      if (4 <= l && l < 7) htmlTableString += "<td>tons</td>";
      if (l == 7) htmlTableString += "<td>board-ft</td>";
      if (l == 8) htmlTableString += "<td>tons</td>";

      for (var y = 1; y <= upToYear; y++) {
        htmlTableString += "<td>";

        var tempString = backendDataIdentifiers[l];
        htmlTableString += (Math.round(Totals.yieldResults[y][tempString] * conversionArray[l] * 10) / 10) + "<br>";

        htmlTableString += "</td>";


      } //for each year

      //units cell
      if (l < 2) htmlTableString += "<td>Mg</td>";
      if (l == 2) htmlTableString += "<td>Mg</td>";
      if (l == 3) htmlTableString += "<td>animals</td>";
      if (4 <= l && l < 7) htmlTableString += "<td>Mg</td>";
      if (l == 7) htmlTableString += "<td>m^3</td>";
      if (l == 8) htmlTableString += "<td>Mg</td>";
    }

    htmlTableString += "</table><br>";

    //============================
    //TABLE FOUR, SPECIAL INDICATORS

    htmlTableString += "<table id='table4' class='resultsTable'>";

    //add header row


    htmlTableString += "<tr class='tableHeading'> <th style='width:220px;'> Other Parameters </th>";

    for (var y = 1; y <= upToYear; y++) {
      htmlTableString += "<th>";
      htmlTableString += "Y" + y;
      htmlTableString += "</th>";
    }

    htmlTableString += "<th> </th>";

    for (var y = 1; y <= upToYear; y++) {
      htmlTableString += "<th>";
      htmlTableString += "Y" + y;
      htmlTableString += "</th>";
    }

    htmlTableString += "<th> </th>";

    htmlTableString += "</tr>";

    htmlTableString += "<tr><td>Precipitation</td>";

    for (var y = 1; y <= upToYear; y++) {
      htmlTableString += "<td>";
      htmlTableString += boardData[currentBoard].precipitation[y];
      htmlTableString += "</td>";
    }

    htmlTableString += "<td>inches</td>";

    for (var y = 1; y <= upToYear; y++) {
      htmlTableString += "<td>";
      htmlTableString += Math.round(boardData[currentBoard].precipitation[y] * 2.54 * 10) / 10;
      htmlTableString += "</td>";
    }

    htmlTableString += "<td>cm</td>";

    htmlTableString += "</tr>";

    htmlTableString += "<tr><td>Strategic Wetland Use</td>";

    for (var y = 1; y <= upToYear; y++) {
      htmlTableString += "<td>";
      htmlTableString += Totals.strategicWetlandPercent[y];
      htmlTableString += "</td>";
    }

    htmlTableString += "<td>percent</td>";

    for (var y = 1; y <= upToYear; y++) {
      htmlTableString += "<td>";
      htmlTableString += Totals.strategicWetlandCells[y];
      htmlTableString += "</td>";
    }

    htmlTableString += "<td>cells</td>";

    htmlTableString += "</tr>";

    htmlTableString += "</table><br>";


    //===========================END TABLE
  }//end of else

  //well, we did all this work, we should probably do something with it.
  //let's give pass it off to some other function...

  return htmlTableString;
} //end generateResultsTable()

// ---

function multiplayerResults() {
  var inMultiplayer = localStorage.getItem('LSinMultiplayer');
  // console.log("In function of results.html");
  if(localStorage.getItem('LSinMultiplayer') === "true"){
    // console.log("changing visibility of div tags");
    // console.log("multiplayer results is: " +inMultiplayer+", should be true");
    document.getElementById('resultsFrame').contentWindow.document.getElementById("yearHolder").style.display = "none";
    document.getElementById('resultsFrame').contentWindow.document.getElementById("radarContainer").style.display = "none";
  }
  else{
    // console.log("multiplayer results is: " +inMultiplayer+", should be false");
    // console.log("making visibility of div tags to true");
    document.getElementById('resultsFrame').contentWindow.document.getElementById("yearHolder").style.display = "block";
    document.getElementById('resultsFrame').contentWindow.document.getElementById("radarContainer").style.display = "block";
  }
}

//removeYearFromRadar hides all of the graph elements of that year on the ecosystem
//  indicators plot
function removeYearFromRadar(yearToRemove) {

  var elementsToTrash = document.getElementById('resultsFrame').contentWindow.document.getElementsByClassName('radar-chart-serie' + (yearToRemove - 1));

  for (var e = 0; e < elementsToTrash.length; e++) {
    document.getElementById('resultsFrame').contentWindow.document.getElementById(elementsToTrash[e].id).style.visibility = "hidden";
  }
} //end removeYearFromRadar()

//addBackYearToRadar unhides all of the associated elements of that year on the graph
function addBackYearToRadar(yearToAdd) {

  var elementsToRevive = document.getElementById('resultsFrame').contentWindow.document.getElementsByClassName('radar-chart-serie' + (yearToAdd - 1));

  for (var e = 0; e < elementsToRevive.length; e++) {
    document.getElementById('resultsFrame').contentWindow.document.getElementById(elementsToRevive[e].id).style.visibility = "visible";
  }
} //end addBackYearToRadar()

// ---

//here we remove all of the graph elements in the yield plot for the appropriate year
function removeYearFromYieldRadar(yearToRemove) {

  var elementsToTrash = document.getElementById('resultsFrame').contentWindow.document.getElementsByClassName('yield-radar-chart-serie' + (yearToRemove - 1));

  for (var e = 0; e < elementsToTrash.length; e++) {
    document.getElementById('resultsFrame').contentWindow.document.getElementById(elementsToTrash[e].id).style.visibility = "hidden";
  }
} //end removeYearFromYieldRadar

//or, do the opposite of the above function and unhide all of the elements on the
// yield graph that belong to the year passed to the function
function addBackYearToYieldRadar(yearToAdd) {

  var elementsToRevive = document.getElementById('resultsFrame').contentWindow.document.getElementsByClassName('yield-radar-chart-serie' + (yearToAdd - 1));

  for (var e = 0; e < elementsToRevive.length; e++) {
    document.getElementById('resultsFrame').contentWindow.document.getElementById(elementsToRevive[e].id).style.visibility = "visible";
  }
} //end addBackYearToYieldRadar

/*
* The function strategicWetlandFinder finds how many strategic wetland locations a player has for their share of land.
* The way this task is done is by using boardData's map and comparing each cell's land type (the 2nd index of this value indicates which player it belongs to),
* and checking if the wetland of that cell is a strategic wetland.
* For more information refer Issue 386.
*/
function strategicWetlandFinder(playerNumber) {
  var strategicWetlandCount = 0;
  for(var i = 0; i < boardData[currentBoard].map.length; ++i){
    if(boardData[currentBoard].map[i].landType[1] === playerNumber && boardData[currentBoard].map[i].strategicWetland === "1"){
      strategicWetlandCount++;
    }
  }
  return strategicWetlandCount;
}


function findBar(givenString){
  var aTags = document.getElementsByTagName("a");
  var found;

  for (var i = 0; i < aTags.length; i++) {
    if (aTags[i].textContent === givenString) {
      found = aTags[i];
      return found;
    }
  }
  return 0;
}

function placeTotalsOnBars(){
  var accordion = document.getElementById("accordionContainer");
  if(accordion.style.display === "none"){
    return;
  }


  var convCorn = findBar('Conventional Corn');
  var consCorn = findBar('Conservation Corn');
  var convSoy = findBar('Conventional Soybean');
  var consSoy = findBar('Conservation Soybean');
  var alfalfa = findBar('Alfalfa');
  var permPas = findBar('Permanent Pasture');
  var rotGraz = findBar('Rotational Grazing');
  var grassHay = findBar('Grass Hay');
  var prairie = findBar('Prairie');
  var consFor = findBar('Conservation Forest');
  var convFor = findBar('Conventional Forest');
  var switchgrass = findBar('Switchgrass');
  var shortRWB = findBar('Short-Rotation Woody Bioenergy');
  var wetland = findBar('Wetland');
  var mixedFaV = findBar ('Mixed Fruits & Vegetables');

  convCorn.firstChild.nodeValue += (" Total: $" + localStorage.getItem('convCorn'));
  consCorn.firstChild.nodeValue += (" Total: $" + localStorage.getItem('consCorn'));
  convSoy.firstChild.nodeValue += ("  Total: $" + localStorage.getItem('convSoy'));
  consSoy.firstChild.nodeValue += ("  Total: $" + localStorage.getItem('consSoy'));
  alfalfa.firstChild.nodeValue += ("  Total: $" + localStorage.getItem('alf'));
  permPas.firstChild.nodeValue += ("  Total: $" + localStorage.getItem('permPas'));
  rotGraz.firstChild.nodeValue += ("  Total: $" + localStorage.getItem('rotGraz'));
  grassHay.firstChild.nodeValue += (" Total: $" + localStorage.getItem('grassHay'));
  prairie.firstChild.nodeValue += ("  Total: $" + localStorage.getItem('prairie'));
  consFor.firstChild.nodeValue += ("  Total: $" + localStorage.getItem('consFor'));
  convFor.firstChild.nodeValue += ("  Total: $" + localStorage.getItem('convFor'));
  switchgrass.firstChild.nodeValue += ("  Total: $" + localStorage.getItem('switchG'));
  shortRWB.firstChild.nodeValue += ("  Total: $" + localStorage.getItem('shortRWB'));
  wetland.firstChild.nodeValue += ("  Total: $" + localStorage.getItem('wetland'));
  mixedFaV.firstChild.nodeValue += ("  Total: $" + localStorage.getItem('mixedFruitsV'));
}


function enterpriseBudgets() {
  var accordion = document.getElementById("accordionContainer");
  var enterpriseTable = document.getElementById("accordionContainer2");
  var graph = document.getElementById("graphContainer");
  var enterpriseButton = document.getElementById("enterpriseBudgetsButton");
  if(accordion.style.display === "none"){
    enterpriseTable.style.display = "none";

    accordion.style.display = "block";
    graph.style.display = "block";
    enterpriseButton.innerHTML = "View Enterprise Budgets";
  }
  else{
    enterpriseTable.style.display = "block";

    accordion.style.display = "none";
    graph.style.display = "none";
    enterpriseButton.innerHTML = "Return to Econ Module";
  }
}
