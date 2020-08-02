import $ from "jquery";
import * as d3 from "d3";
import { setting } from "../js/setting";
import { myServicee } from "../services/my-service";
import _ from "underscore";
import { viiolinplot } from "../js/violinChart";
import Sortable from "sortablejs";
export function main() {
  let width, height;
  let settings = setting();
  let m = [100, 60, 10, 10],
    w,
    h,
    xscale,
    yscale = {},
    dragging = {},
    line = d3.line(),
    axis,
    data,
    foreground,
    foreground_opacity = 1,
    background,
    highlighted,
    dimensions,
    legend,
    render_speed = 50,
    brush_count = 0,
    excluded_groups = [],
    svg,
    g,
    listMetric;

  //legend prt
  let violiin_chart;

  let isTick = true;
  let isChangeData = false;
  var levelStep = 4;
  let arrThresholds;
  var selectedService = "CPU1 Temp";
  var orderLegend;
  var svgLengend;
  let timel;
  let shuffled_data = [];
  let selected = [];
  //read file
  var thresholds = [
    [3, 98],
    [0, 10],
    [0, 99],
    [1050, 17850],
    [0, 200],
  ];
  var chosenService = 0;
  var conf = {};
  const TIMEKEY = "Time";
  const TIMEFORMAT = d3.timeFormat("%B %d %Y %H:%M");

  var stickKey = TIMEKEY;
  var stickKeyFormat = TIMEFORMAT;
  conf.serviceList = settings.serviceList;
  conf.serviceLists = settings.serviceLists;
  conf.serviceListattr = settings.serviceListattr;
  conf.serviceListattrnest = settings.serviceListattrnest;

  let separate;
  let serviceList = [];
  let serviceLists = [];
  let serviceListattr = [];
  let serviceAttr = {};
  let hostList = { data: { hostlist: {} } };
  var serviceQuery = {
    nagios_old: [
      "temperature",
      "cpu+load",
      "memory+usage",
      "fans+health",
      "power+usage",
    ],
    nagios: {
      Temperature: {
        format: (d) => `CPU${d} Temp`,
        numberOfEntries: 2,
        type: "json",
        query: "CPU_Temperature",
      },
      Job_load: {
        format: () => "cpuusage",
        numberOfEntries: 1,
        type: "json",
        query: "CPU_Usage",
      },
      Memory_usage: {
        format: () => "memoryusage",
        numberOfEntries: 1,
        type: "json",
        query: "Memory_Usage",
        rescale: 1 / 191.908,
      },
      Fans_speed: {
        format: (d) => `FAN_${d}`,
        numberOfEntries: 4,
        type: "json",
        query: "Fan_Speed",
      },
      Power_consum: {
        format: () => "powerusage_watts",
        numberOfEntries: 1,
        type: "json",
        query: "Node_Power_Usage",
        rescale: 1 / 3.2,
      },
    },
    influxdb: {
      Temperature: {
        CPU_Temperature: {
          format: (d) => `CPU${d} Temp`,
          numberOfEntries: 2,
        },
        Inlet_Temperature: {
          format: () => `Inlet Temp`,
          numberOfEntries: 1,
        },
      },
      Job_load: {
        CPU_Usage: {
          format: () => "cpuusage(load)",
          format2: () => "cpuusage",
          numberOfEntries: 1,
        },
      },
      Memory_usage: {
        Memory_Usage: {
          format: () => "memoryusage",
          numberOfEntries: 1,
          rescale: 100 / 191.908,
        },
      },
      Fans_speed: {
        Fan_Speed: {
          format: (d) => `FAN_${d}`,
          numberOfEntries: 4,
        },
      },
      Power_consum: {
        Node_Power_Usage: {
          format: () => "powerusage_watts",
          numberOfEntries: 1,
          rescale: 1 / 3.2,
        },
      },
      Job_scheduling: {
        Job_Info: {
          format: () => "job_data",
          mainkey: "jobID",
          numberOfEntries: 1,
          type: "object",
        },
      },
    },
  };
  var serviceList_selected = [
    { text: "Temperature", index: 0 },
    { text: "Job_load", index: 1 },
    { text: "Memory_usage", index: 2 },
    { text: "Fans_speed", index: 3 },
    { text: "Power_consum", index: 4 },
  ];
  var serviceListattrnest = [
    { key: "arrTemperature", sub: ["CPU1 Temp", "CPU2 Temp", "Inlet Temp"] },
    { key: "arrCPU_load", sub: ["Job load"] },
    { key: "arrMemory_usage", sub: ["Memory usage"] },
    {
      key: "arrFans_health",
      sub: ["Fan1 speed", "Fan2 speed", "Fan3 speed", "Fan4 speed"],
    },
    { key: "arrPower_usage", sub: ["Power consumption"] },
  ];
  var serviceFullList;
  var scaleService;
  var sampleS;
  var tsnedata;
  var hosts;
  var hostResults;
  var serviceFullList_Fullrange;
  var serviceFullList_withExtra;
  var processResult;
  var dataInformation = {
    filename: "",
    size: 0,
    timerange: [],
    interval: "",
    totalstep: 0,
    hostsnum: 0,
    datanum: 0,
  };
  var axisPlot;
  width = Math.round(Number(width));

  height = d3.max([document.body.clientHeight - 150, 300]);
  w = width - m[1] - m[3];
  h = height - m[0] - m[2];
  xscale = d3.scalePoint().range([0, w]).padding(0.3);
  // FIXME detect format
  //   let foreground = this.element.shadowRoot.querySelectorAll("#foreground")[0];
  //   let highlighted = this.element.shadowRoot.querySelectorAll("#highlight")[0];
  //   let background = this.element.shadowRoot.querySelectorAll("#background")[0];

  let undefinedValue = undefined;
  let undefinedColor = "#666";
  let colorscale = d3.scaleOrdinal(d3.schemeCategory10);
  let colors = d3.scaleOrdinal();
  let color, opa;
  /// drawLegend *****************************************************************
  let legendw = 80;
  let legendh = 20;
  let barw = 300;
  let barScale = d3.scaleLinear();
  let db = "nagios";

  //var arrColor = ['#00c', '#1a9850','#fee08b', '#d73027'];
  // var arrColor = ['#110066','#4400ff', '#00cccc', '#00dd00','#ffcc44', '#ff0000', '#660000'];
  // let arrColor = colorScaleList.customFunc('rainbow');
  // let arrColor = colorScaleList.d3colorChosefunc('Greys');
  let arrColor = [
    "#000066",
    "#0000ff",
    "#1a9850",
    "#ddee00",
    "#ffcc44",
    "#ff0000",
    "#660000",
  ];
  let colorCluster = d3.scaleOrdinal().range(d3.schemeCategory10);

  let service_custom_added = [];
  let serviceFullList_withExtraa = [];

  function object2Data(ob) {
    return d3.entries(ob).filter((d) => d.key !== "timespan");
  }

  function object2DataPrallel(ob) {
    let temp = object2Data(ob);
    let count = 0;
    let newdata = [];
    let comlength = ob.timespan.length;
    temp.forEach((com) => {
      let namet = com.key.split("-");
      let rack, host;
      let ishpcc = true;
      if (namet.length > 1) {
        rack = namet[1];
        host = namet[2];
      } else {
        namet = com.key.split("."); // IP?
        if (namet.length > 1) {
          rack = namet[2];
          host = namet[3];
        } else {
          rack = com.key;
          host = com.key;
          ishpcc = false;
        }
      }
      for (let i = 0; i < comlength; i++) {
        let eachIn = {};
        let validkey = true;
        serviceListattrnest.forEach((s) => {
          s.sub.forEach((sub, sj) => {
            eachIn[sub] = com.value[s.key][i][sj];
          });
        });
        if (validkey) {
          eachIn[stickKey] =
            stickKey === TIMEKEY ? ob.timespan[i] : ob.timespan.length - 1 - i;
          eachIn.rack = ishpcc ? "Rack " + rack : rack;
          eachIn.compute = com.key;
          eachIn.group = ishpcc ? "Rack " + rack : rack;
          eachIn.Cluster = com.value["arrcluster"]
            ? com.value["arrcluster"][i]
            : 0;
          eachIn.name =
            com.key + ", " + stickKeyFormat(eachIn[settings.stickKey]);
          eachIn.id = com.key + "-" + count;
          count++;
          newdata.push(eachIn);
        }
      }
    });
    return newdata;
  }

  window.onresize = function () {
    // animationtime = false;
    try {
      resetSize();
    } catch (e) {}
  };
  function resetSize() {
    debugger;
    let allElem = myServicee.getCanvusElements();
    width = d3
      .select(allElem.element.shadowRoot.querySelectorAll("#Maincontent")[0])
      .style("width")
      .slice(0, -2);
    height = d3.max([document.body.clientHeight - 150, 300]);
    w = width - m[1] - m[3];
    h = height - m[0] - m[2];
    let chart = d3
      .select(allElem.chart)
      .style("height", h + m[0] + m[2] + "px");

    chart
      .selectAll("canvas")
      .attr("width", w)
      .attr("height", h)
      .style("padding", m.join("px ") + "px");

    chart
      .select("svg")
      .attr("width", w + m[1] + m[3])
      .attr("height", h + m[0] + m[2])
      .select("g")
      .attr("transform", "translate(" + m[3] + "," + m[0] + ")");
    // Foreground canvas for primary view
    foreground.lineWidth = 1.7;
    // Highlight canvas for temporary interactions
    highlighted.lineWidth = 4;

    // Background canvas
    background.lineWidth = 1.7;

    xscale = d3.scalePoint().range([0, w]).padding(0.3).domain(dimensions);
    dimensions.forEach(function (d) {
      yscale[d].range([h, 0]);
    });

    d3.selectAll(
      allElem.element.shadowRoot.querySelectorAll(".dimension")
    ).attr("transform", function (d) {
      return "translate(" + xscale(d) + ")";
    });
    // update brush placement
    d3.selectAll(allElem.element.shadowRoot.querySelectorAll(".brush")).each(
      function (d) {
        d3.select(this).call(
          (yscale[d].brush = d3
            .brushY(yscale[d])
            .extent([
              [-10, 0],
              [10, h],
            ])
            .on("brush", function () {
              isChangeData = true;
              brush(true);
            })
            .on("end", function () {
              isChangeData = true;
              brush();
            }))
        );
      }
    );

    // update axis placement
    (axis = axis.ticks(1 + height / 50)),
      d3.selectAll(".dimension .axis").each(function (d) {
        d3.select(this).call(getScale(d));
      });

    // render data
    brush();
  }
  function getBrush(d) {
    return d3
      .brushY(yscale[d])
      .extent([
        [-10, 0],
        [10, h],
      ])
      .on("brush", () => {
        brush(true);
      })
      .on("end", () => {
        brush();
      });
  }
  function dragstart(d) {
    let allElem = myServicee.getCanvusElements();
    dragging[d] = this.__origin__ = xscale(d);
    this.__dragged__ = false;
    d3.select(allElem.foreground).style("opacity", "0.35");
  }

  function dragged(d) {
    dragging[d] = Math.min(w, Math.max(0, (this.__origin__ += d3.event.dx)));

    dimensions.sort(function (a, b) {
      return position(a) - position(b);
    });
    xscale.domain(dimensions);
    // reorderDimlist();
    svg.selectAll(".dimension").attr("transform", function (d) {
      return "translate(" + position(d) + ")";
    });
    this.__dragged__ = true;
    //brush();
    // Feedback for axis deletion if dropped
    if (dragging[d] < 12 || dragging[d] > w - 12) {
      d3.select(this).select(".background").style("fill", "#b00");
    } else {
      d3.select(this).select(".background").style("fill", null);
    }
  }
  function position(d) {
    var v = dragging[d];
    return v == null ? xscale(d) : v;
  }
  function dragend(d) {
    let allElem = myServicee.getCanvusElements();
    if (!this.__dragged__) {
      // no movement, invert axis
      var extent = invert_axis(d, this);
    } else {
      // reorder axes
      d3.select(this)
        .transition()
        .attr("transform", "translate(" + xscale(d) + ")");

      // var extent = yscale[d].brush.extent();
      var extent = d3.brushSelection(this);
      if (extent) extent = extent.map(yscale[d].invert).sort((a, b) => a - b);
    }

    // remove axis if dragged all the way left
    if (dragging[d] < 12 || dragging[d] > w - 12) {
      remove_axis(d, g);
    }

    // TODO required to avoid a bug
    xscale.domain(dimensions);
    update_ticks(d, extent);

    // reorderDimlist();
    // rerender
    d3.select(allElem.foreground).style("opacity", foreground_opacity);
    brush();
    delete this.__dragged__;
    delete this.__origin__;
    delete dragging[d];
  }
  function remove_axis(d, g) {
    const target = serviceFullList_withExtraa.find((e) => e.text === d);

    target.enable = false;
    dimensions = _.difference(dimensions, [d]);
    xscale.domain(dimensions);
    g = g.data(dimensions, (d) => d);
    g.attr("transform", function (p) {
      return "translate(" + position(p) + ")";
    });
    g.exit().remove();
    update_ticks();
  }
  function reorderDimlist() {
    // reorder list
    let pre = 0;
    let next = 0;
    dimensions.find((dim) => {
      const pos = _.indexOf(listMetric.toArray(), dim);
      next = pos != -1 ? pos : next;
      if (next < pre) return true;
      else pre = next;
      return false;
    });
    if (next < pre) {
      let order_list = listMetric.toArray();
      swap(order_list, pre, next);
      listMetric.sort(order_list);
    }
  }
  function invert_axis(d) {
    // save extent before inverting
    let allElem = myServicee.getCanvusElements();
    let extent;
    svg
      .selectAll(".brush")
      .filter((ds) => ds === d)
      .filter(function (ds) {
        yscale[ds].brushSelectionValue = d3.brushSelection(this);
        return d3.brushSelection(this);
      })
      .each(function (d) {
        // Get extents of brush along each active selection axis (the Y axes)
        extent = d3.brushSelection(this).map(yscale[d].invert);
      });

    if (yscale[d].inverted == true) {
      yscale[d].range([h, 0]);
      d3.selectAll(allElem.element.shadowRoot.querySelectorAll(".label"))
        .filter(function (p) {
          return p == d;
        })
        .style("text-decoration", null);
      yscale[d].inverted = false;
    } else {
      yscale[d].range([0, h]);
      d3.selectAll(allElem.element.shadowRoot.querySelectorAll(".label"))
        .filter(function (p) {
          return p == d;
        })
        .style("text-decoration", "underline");
      yscale[d].inverted = true;
    }
    return extent;
  }
  function getScale(d) {
    let axisrender = axis.scale(yscale[d]);
    if (yscale[d].axisCustom) {
      if (yscale[d].axisCustom.ticks)
        axisrender = axisrender.ticks(yscale[d].axisCustom.ticks);
      if (yscale[d].axisCustom.tickFormat)
        axisrender = axisrender.tickFormat(yscale[d].axisCustom.tickFormat);
    } else {
      axisrender = axisrender.ticks(1 + height / 50);
      axisrender = axisrender.tickFormat(undefined);
    }
    return axisrender;
  }
  function updateDimension() {
    g = svg
      .selectAll(".dimension")
      .data(dimensions, (d) => d)
      .join(
        (enter) => {
          const new_dim = enter
            .append("svg:g")
            .attr("class", "dimension")
            .attr("transform", function (d) {
              return "translate(" + xscale(d) + ")";
            })
            .call(
              d3
                .drag()
                .on("start", dragstart)
                .on("drag", dragged)
                .on("end", dragend)
            );
          // Add an axis and title.
          new_dim
            .append("svg:g")
            .attr("class", "axis")
            .attr("transform", "translate(0,0)")
            .each(function (d) {
              return d3.select(this).call(getScale(d));
            })
            .append("svg:text")
            .attr("text-anchor", "start")
            .style("transform", "rotate(-15deg) translate(-5px,-6px)")
            // .attr("y", function(d,i) { return i%2 == 0 ? -14 : -30 } )
            .attr("y", -14)
            .attr("x", 0)
            .attr("class", "label")
            .text(String)
            .append("title")
            .text("Click to invert. Drag to reorder");
          // Add violinplot holder
          new_dim
            .append("svg:g")
            .attr("class", "plotHolder")
            .attr("transform", "translate(0,0)");

          // .append('rect')
          // .attr('class','background')
          // .style('fill','rgba(255,255,255,0.38)')
          // .style('transform','translate(-50%,0)')
          // .attrs({width:violiin_chart.graphicopt().width,height:violiin_chart.graphicopt().height});
          // Add and store a brush for each axis.
          new_dim
            .append("svg:g")
            .attr("class", "brush")
            .each(function (d) {
              d3.select(this).call((yscale[d].brush = getBrush(d)));
            })
            .selectAll("rect")
            .style("visibility", null)
            .attr("x", -23)
            .attr("width", 36)
            .append("title")
            .text("Drag up or down to brush along this axis");

          new_dim
            .selectAll(".extent")
            .append("title")
            .text("Drag or resize this filter");
          return new_dim;
        },
        (update) => {
          isChangeData = true;
          // Add an axis and title.
          update
            .select(".axis")
            .attr("transform", "translate(0,0)")
            .each(function (d) {
              return d3.select(this).call(getScale(d));
            });
          // update.select().select('.background')
          return update.attr("transform", function (d) {
            return "translate(" + xscale(d) + ")";
          });
        },
        (exit) => exit.remove()
      );
  }
  function hide_ticks(allElementsObj) {
    d3.selectAll(
      allElementsObj.element.shadowRoot.querySelectorAll(".dimension .axis g")
    ).style("display", "none");
    //d3.selectAll(".axis path").style("display", "none");
    d3.selectAll(
      allElementsObj.element.shadowRoot.querySelectorAll(".background")
    ).style("visibility", "hidden");
    d3.selectAll("#hide-ticks").attr("disabled", "disabled");
    d3.selectAll("#show-ticks").attr("disabled", null);
    isTick = false;
  }
  function show_ticks(allElementsObj) {
    d3.selectAll(
      allElementsObj.element.shadowRoot.querySelectorAll(".dimension .axis g")
    ).style("display", null);
    //d3.selectAll(".axis path").style("display", null);
    d3.selectAll(
      allElementsObj.element.shadowRoot.querySelectorAll(".background")
    ).style("visibility", null);
    d3.selectAll("#show-ticks").attr("disabled", "disabled");
    d3.selectAll("#hide-ticks").attr("disabled", null);
    isTick = true;
  }
  function plotViolin(allElementsObj) {
    debugger;
    selected = shuffled_data;
    let cluster_info = [];
    let violin_w = Math.min(
      w / dimensions.length / (cluster_info.length || 1),
      50
    );
    violiin_chart.graphicopt({
      width: violin_w * (cluster_info.length || 1),
      height: h,
      single_w: Math.max(violin_w, 50),
    });
    setTimeout(() => {
      let dimGlobal = [0, 0];
      let dimensiondata = {};
      let vMax;
      dimensions.forEach((d) => {
        let s = serviceFullList.find((s) => s.text === d);
        let color = () => "#ffffff";
        if (s) {
          let value = [];
          if (cluster_info.length) {
            let cs = {};
            cluster_info.forEach((c, ci) => (cs[ci] = []));
            selected.forEach((e) => cs[e.Cluster].push(e[d]));
            value = cluster_info.map((c, ci) =>
              settings.axisHistogram(c.name, s.range, cs[ci])
            );
            vMax = d3.max(value, (d) => d[1]);
            dimGlobal[1] = Math.max(vMax, dimGlobal[1]);
            color = colorCluster;
          } else {
            value = [
              settings.axisHistogram(
                s.text,
                s.range,
                selected.map((e) => e[d])
              ),
            ];
            vMax = d3.max(value[0], (d) => d[1]);
            dimGlobal[1] = Math.max(vMax, dimGlobal[1]);
          }
          dimensiondata[d] = { key: s, value: value, color: color };
        }
      });
      let dims = d3
        .selectAll(
          allElementsObj.element.shadowRoot.querySelectorAll(
            ".dimension > .plotHolder"
          )
        )
        .each(function (d) {
          if (dimensiondata[d]) {
            let s = dimensiondata[d].key;
            violiin_chart
              .graphicopt({
                customrange: s.range,
                rangeY: dimGlobal,
                color: dimensiondata[d].color,
              })
              .data(dimensiondata[d].value)
              .draw(d3.select(this), allElementsObj);
          }
        });
    }, 0);
  }
  function onChangeOfShow(allElementsObj) {
    axisPlot = d3.select(allElementsObj.overlayPlot).on("change", function () {
      debugger;
      switch ($(this).val()) {
        case "none":
          d3.selectAll(
            allElementsObj.element.shadowRoot.querySelectorAll(
              ".dimension .plotHolder"
            )
          )
            .selectAll("*")
            .remove();
          d3.select(this).on("plot", () => {});
          hide_ticks(allElementsObj);
          foreground_opacity = 1;
          break;
        case "tick":
          d3.selectAll(
            allElementsObj.element.shadowRoot.querySelectorAll(
              ".dimension .plotHolder"
            )
          )
            .selectAll("*")
            .remove();
          d3.select(this).on("plot", () => {});
          show_ticks(allElementsObj);
          foreground_opacity = 1;
          break;
        case "violin":
          violiin_chart.graphicopt({ isStack: false });
          d3.select(this).on("plot", plotViolin(allElementsObj));
          hide_ticks(allElementsObj);
          foreground_opacity = 0.5;
          break;
        case "violin+tick":
          violiin_chart.graphicopt({ isStack: false });
          d3.select(this).on("plot", plotViolin(allElementsObj));
          show_ticks(allElementsObj);
          foreground_opacity = 0.5;
          break;
      }
      d3.select(this).dispatch("plot");
      d3.select(allElementsObj.foreground).style("opacity", foreground_opacity);
    });
  }

  function initializeD3Elements() {
    let allElem = myServicee.getCanvusElements();
    axisPlot = d3.select(allElem.overlayPlot);
    width = d3
      .select(allElem.element.shadowRoot.querySelectorAll(".main-right-panel")[0])
      // get the width of div element
      .style("width")
      // take of 'px'
      .slice(0, -2);
    // return as an integer
    width = Math.round(Number(width));

    height = d3.max([document.body.clientHeight - 150, 300]);
    w = width - m[1] - m[3];
    h = height - m[0] - m[2];
    xscale = d3.scalePoint().range([0, w]).padding(0.3);
    axis = d3.axisLeft().ticks(1 + height / 50); // vertical axis with the scale
    // Scale chart and canvas height
    let chart = d3
      .select(allElem.chart)
      .style("height", h + m[0] + m[2] + "px");

    chart
      .selectAll("canvas")
      .attr("width", w)
      .attr("height", h)
      .style("padding", m.join("px ") + "px");

    // Foreground canvas for primary view
    // let foreground = document.querySelector("#foreground").getContext("2d");
    foreground = allElem.foreground;
    foreground = foreground.getContext("2d");
    foreground.globalCompositeOperation = "destination-over";
    foreground.strokeStyle = "rgba(0,100,160,0.1)";
    foreground.lineWidth = 1.7;
    // foreground.fillText("Loading...",w/2,h/2);

    // Highlight canvas for temporary interactions
    highlighted = allElem.highlighted;
    highlighted = highlighted.getContext("2d");
    highlighted.strokeStyle = "rgba(0,100,160,1)";
    highlighted.lineWidth = 4;

    // Background canvas
    background = allElem.background;
    background = background.getContext("2d");
    background.strokeStyle = "rgba(0,100,160,0.1)";
    background.lineWidth = 1.7;

    svg = d3
      .select(allElem.chart)
      .select("svg")
      .attr("width", width)
      .attr("height", height)
      .append("svg:g")
      .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

    // d3.viiolinplot = viiolinplot;
    violiin_chart = viiolinplot().graphicopt({
      width: 160,
      height: 25,
      opt: { dataformated: true },
      stroke: "white",
      isStack: false,
      midleTick: false,
      tick: false,
      showOutlier: false,
      direction: "v",
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      middleAxis: { "stroke-width": 0 },
      ticks: { "stroke-width": 0.5 },
      tick: { visibile: false },
    });
    onChangeOfShow(allElem);
    d3.select(
      allElem.element.shadowRoot.querySelectorAll("#exclude-data")[0]
    ).on("click", exclude_data);
  }

  function initFunc(
    sampleS,
    serviceFullList_withExtra,
    allElementsObj,
    brushCompleted
  ) {
    debugger;

    serviceFullList_withExtraa = serviceFullList_withExtra;
    let allElem = myServicee.getCanvusElements();
    drawFiltertable(serviceFullList_withExtra, allElem);

    // setColorsAndThresholds("CPU1 Temp", serviceFullList_withExtra);
    dimensions = [];
    timel;
    if (timel) timel.stop();

    width = d3
      .select(allElem.element.shadowRoot.querySelectorAll("#Maincontent")[0])
      // get the width of div element
      .style("width")
      // take of 'px'
      .slice(0, -2);
    // return as an integer
    width = Math.round(Number(width));

    height = d3.max([document.body.clientHeight - 150, 300]);
    w = width - m[1] - m[3];
    h = height - m[0] - m[2];
    xscale = d3.scalePoint().range([0, w]).padding(0.3);
    axis = d3.axisLeft().ticks(1 + height / 50); // vertical axis with the scale
    // Scale chart and canvas height
    let chart = d3
      .select(allElem.chart)
      .style("height", h + m[0] + m[2] + "px");

    chart
      .selectAll("canvas")
      .attr("width", w)
      .attr("height", h)
      .style("padding", m.join("px ") + "px");

    // Foreground canvas for primary view
    // let foreground = document.querySelector("#foreground").getContext("2d");
    foreground = allElem.foreground;
    foreground = foreground.getContext("2d");
    foreground.globalCompositeOperation = "destination-over";
    foreground.strokeStyle = "rgba(0,100,160,0.1)";
    foreground.lineWidth = 1.7;
    // foreground.fillText("Loading...",w/2,h/2);

    // Highlight canvas for temporary interactions
    highlighted = allElem.highlighted;
    highlighted = highlighted.getContext("2d");
    highlighted.strokeStyle = "rgba(0,100,160,1)";
    highlighted.lineWidth = 4;

    // Background canvas
    background = allElem.background;
    background = background.getContext("2d");
    background.strokeStyle = "rgba(0,100,160,0.1)";
    background.lineWidth = 1.7;

    // svgLengend = d3.select('#colorContinuos').append('div').append('svg')
    //     .attr("class", "legendView")
    //     .attr("width", 0)
    //     .attr("height", 0)
    //     .style('display','none');
    // SVG for ticks, labels, and interactions
    svg = d3
      .select(allElem.chart)
      .select("svg")
      .attr("width", width)
      .attr("height", height)
      .append("svg:g")
      .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

    svg.selectAll("*").remove();
    // Load the data and visualization

    // Load the data and visualization

    // Convert quantitative scales to floats
    // data = object2DataPrallel(sampleS);
    data = sampleS;
    console.log("sampleS");
    console.log(sampleS);
    console.log(data);
    // Extract the list of numerical dimensions and create a scale for each.
    xscale.domain(
      (dimensions = serviceFullList_withExtra
        .filter(function (s) {
          let k = s.text;
          let xtempscale =
            (_.isDate(data[0][k]) &&
              (yscale[k] = d3
                .scaleTime()
                .domain(
                  d3.extent(data, function (d) {
                    return d[k];
                  })
                )
                .range([h, 0]))) ||
            (_.isNumber(data[0][k]) &&
              (yscale[k] = d3
                .scaleLinear()
                // .domain(d3.extent(data, function (d) {
                //     return +d[k];
                // }))
                .domain(
                  serviceFullList_withExtra.find((d) => d.text === k).range || [
                    0,
                    0,
                  ]
                )
                .range([h, 0])));
          if (s.axisCustom) xtempscale.axisCustom = s.axisCustom;
          return s.enable ? xtempscale : false;
        })
        .map((s) => s.text))
    );

    d3.select("#search").attr(
      "placeholder",
      `Search host e.g ${data[0].compute}`
    );
    // Add a group element for each dimension.
    updateDimension();

    // legend = create_legend(colors, brush);
    if (!settings.serviceFullList.find((d) => d.text === selectedService))
      selectedService = settings.serviceFullList[0].text;
    const selecteds = d3
      .select(allElem.element.shadowRoot.querySelectorAll("#axisSetting")[0])
      .select("tbody")
      .selectAll("tr")
      .filter((d) => d.arr === selectedService)
      .select('input[type="radio"]')
      .property("checked", true);
    _.bind(selecteds.on("change"), selecteds.node())();

    // changeVar(
    //   d3
    //     .select(allElem.element.shadowRoot.querySelectorAll("#axisSetting")[0])
    //     .selectAll("tr")
    //     .data()
    //     .find((d) => d.arr == selectedService),
    //   serviceFullList_withExtra
    // );
    // Render full foreground
    brushCompleted.emit([
      {
        name: "Amith",
        age: 24,
        case: "Upper",
        parents: { name: "Kumar", mother: "Saroja", age: 55 },
      },
      {
        name: "Nmae",
        age: 39,
        case: "Lower",
        parents: {
          name: "Kumar Gujjar",
          mother: "Saroja Gujjar",
          age: 85,
        },
      },
    ]);
    brush();
    console.log("---init---");
  }
  function exclude_data() {
    let new_data = _.difference(data, actives());
    if (new_data.length == 0) {
      alert(
        "I don't mean to be rude, but I can't let you remove all the data.\n\nTry selecting just a few data points then clicking 'Exclude'."
      );
      return false;
    }
    data = new_data;
    rescale();
    complex_data_table(data, true);
  }
  function actives() {
    let actives = [],
      extents = [];
    svg
      .selectAll(".brush")
      .filter(function (d) {
        yscale[d].brushSelectionValue = d3.brushSelection(this);
        return d3.brushSelection(this);
      })
      .each(function (d) {
        // Get extents of brush along each active selection axis (the Y axes)
        actives.push(d);
        extents.push(
          d3
            .brushSelection(this)
            .map(yscale[d].invert)
            .sort((a, b) => a - b)
        );
      });
    // filter extents and excluded groups
    var selected = [];
    data.forEach(function (d) {
      if (!excluded_groups.find((e) => e === d.group))
        !actives.find(function (p, dimension) {
          return extents[dimension][0] > d[p] || d[p] > extents[dimension][1];
        })
          ? selected.push(d)
          : null;
    });

    // free text search
    // var query = d3.select("#search").node().value;
    // if (query > 0) {
    //   selected = search(selected, query);
    // }

    return selected;
  }
  function rescale(skipRender) {
    // adjustRange(data);
    serviceFullList_withExtraa.forEach(function (s) {
      let k = s.text;
      let xtempscale =
        (s.isDate &&
          (yscale[k] = d3
            .scaleTime()
            .domain(
              d3.extent(data, function (d) {
                return d[k];
              })
            )
            .range([h, 0]))) ||
        (yscale[k] = d3
          .scaleLinear()
          // .domain(d3.extent(data, function (d) {
          //     return +d[k];
          // }))
          .domain(
            serviceFullList_withExtraa.find((d) => d.text === k).range || [0, 0]
          )
          .range([h, 0]));
      if (s.axisCustom) xtempscale.axisCustom = s.axisCustom;
    });
    update_ticks();
    // Render selected data
    if (!skipRender) paths(data, foreground, brush_count);
  }
  function brush(isreview) {
    var actives = [],
      extents = [];
    let allElem = myServicee.getCanvusElements();
    svg
      .selectAll(".brush")
      .filter(function (d) {
        yscale[d].brushSelectionValue = d3.brushSelection(this);
        return d3.brushSelection(this);
      })
      .each(function (d) {
        // Get extents of brush along each active selection axis (the Y axes)
        actives.push(d);
        extents.push(
          d3
            .brushSelection(this)
            .map(yscale[d].invert)
            .sort((a, b) => a - b)
        );
      });
    // hack to hide ticks beyond extent
    var b = d3
      .selectAll(allElem.element.shadowRoot.querySelectorAll(".dimension"))
      .nodes()
      .forEach(function (element, i) {
        var dimension = d3.select(element).data()[0];
        if (_.include(actives, dimension)) {
          var extent = extents[actives.indexOf(dimension)];
          d3.select(element)
            .selectAll("text")
            .style("font-weight", "bold")
            .style("font-size", "13px")
            .style("display", function () {
              var value = d3.select(this).data()[0];
              return extent[0] <= value && value <= extent[1] ? null : "none";
            });
        } else {
          d3.select(element)
            .selectAll("text")
            .style("font-size", null)
            .style("font-weight", null)
            .style("display", null);
        }
        d3.select(element).selectAll(".label").style("display", null);
      });
    // bold dimensions with label
    d3.selectAll(allElem.element.shadowRoot.querySelectorAll(".label")).style(
      "font-weight",
      function (dimension) {
        if (_.include(actives, dimension)) return "bold";
        return null;
      }
    );

    // Get lines within extents
    var selected = [];
    data.forEach(function (d) {
      if (!excluded_groups.find((e) => e === d.group))
        !actives.find(function (p, dimension) {
          return extents[dimension][0] > d[p] || d[p] > extents[dimension][1];
        })
          ? selected.push(d)
          : null;
    });
    // free text search
    // var query = d3.select("#search").node().value;
    // if (query.length > 0) {
    //   selected = search(selected, query);
    // }

    if (selected.length < data.length && selected.length > 0) {
      d3.select("#keep-data").attr("disabled", null);
      d3.select(
        allElem.element.shadowRoot.querySelectorAll("#exclude-data")[0]
      ).attr("disabled", null);
    } else {
      d3.select("#keep-data").attr("disabled", "disabled");
      d3.select(
        allElem.element.shadowRoot.querySelectorAll("#exclude-data")[0]
      ).attr("disabled", "disabled");
    }

    // total by food group
    var tallies = _(selected).groupBy(function (d) {
      return d.group;
    });

    // include empty groups
    _(colors.domain()).each(function (v, k) {
      tallies[v] = tallies[v] || [];
    });
    if (!isreview) {
      complex_data_table_render = true;
      complex_data_table(selected);
      // myComps.selectedRange = selected;
      // MyComponent.todoCompletedHandler(selected);
      // let pc = new ParallelCoordinates();
      // mySec.todoCompletedHandler(selected);
    }
    redraw(selected);
    // Loadtostore();
  }

  let complex_data_table_render = false;
  const collator = new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: "base",
  });
  Array.prototype.naturalSort = function (_) {
    if (arguments.length) {
      return this.sort(function (as, bs) {
        return collator.compare(as[_], bs[_]);
      });
    } else {
      return this.sort(collator.compare);
    }
  };
  function complex_data_table(sample, render) {
    debugger;
    let allElem = myServicee.getCanvusElements();
    if (
      complex_data_table_render
      // &&
      // (render || !d3.select(".searchPanel.active").empty())
    ) {
      var samplenest = d3
        .nest()
        .key((d) => d.rack)
        .sortKeys(collator.compare)
        .key((d) => d.compute)
        .sortKeys(collator.compare)
        .sortValues((a, b) => a.Time - b.Time)
        .entries(sample);
      // let instance = M.Collapsible.getInstance("#compute-list");
      // if (instance) instance.destroy();
      d3.select(
        allElem.element.shadowRoot.querySelectorAll("#compute-list")[0]
      ).html("");
      var table = d3
        .select(allElem.element.shadowRoot.querySelectorAll("#compute-list")[0])
        .attr("class", "collapsible rack")
        .selectAll("li")
        .data(samplenest, (d) => d.value);
      var ulAll = table.join((enter) => {
        let lir = enter.append("li").attr("class", "rack");
        lir
          .append("div")
          .attr("class", "collapsible-header")
          .text((d) => d.key);
        const lic = lir
          .append("div")
          .attr("class", "collapsible-body")
          .append("div")
          .attr("class", "row marginBottom0")
          .append("div")
          .attr("class", "col s12 m12")
          .append("ul")
          .attr("class", "collapsible compute")
          .datum((d) => d.values)
          .selectAll("li")
          .data((d) => d)
          .enter()
          .append("li")
          .attr("class", "compute");
        lic
          .append("div")
          .attr("class", "collapsible-header")
          .text((d) => d.key);
        const lit = lic
          .append("div")
          .attr("class", "collapsible-body")
          .append("div")
          .attr("class", "row marginBottom0")
          .append("div")
          .attr("class", "col s12 m12")
          .styles({ "overflow-y": "auto", "max-height": "400px" })
          .append("ul")
          .datum((d) => d.values);
        return lir;
      });
      function updateComtime(p) {
        debugger;
        let lit = p
          .select("ul")
          .datum((d) => d.values)
          .selectAll("li")
          .data((d) => d)
          .enter()
          .append("li")
          .attr("class", "comtime")
          .on("mouseover", highlight)
          .on("mouseout", unhighlight);

        lit
          .append("span")
          .attr("class", "color-block")
          .style("background", function (d) {
            return color(
              selectedService == null ? d.group : d[selectedService]
            );
          })
          .style("opacity", 0.85);
        lit.append("span").text(function (d) {
          return stickKeyFormat(d[stickKey]);
        });
        return p;
      }
      // $("#compute-list.collapsible,#compute-list .collapsible").click(function (
      //   evt
      // ) {
      //   debugger;
      //   if (d3.select(evt).classed("compute"))
      //     d3.select(evt).call(updateComtime);
      // });

      // d3.select(
      //   allElem.element.shadowRoot.querySelectorAll("li.compute")[0]
      // ).call(updateComtime);

      d3.selectAll(allElem.element.shadowRoot.querySelectorAll("li.compute"))
        // .filter((d) => {
        //   debugger;
        //   return d.classed("compute");
        // })
        .call(updateComtime);
        // document.querySelector('my-component').shadowRoot.querySelector('parallel-coordinates').shadowRoot.querySelector('#leftpanel li .collapsible.rack li').click(function(evt){
        //   console.log('SHow Ebt',evt.target)
        // })
        // document.querySelector('my-component').shadowRoot.querySelector('parallel-coordinates').shadowRoot.querySelector('#leftpanel li').click(function(evt){
        //   console.log('SHow Ebt',evt.target)
        // })
      complex_data_table_render = false;
    }
  }
  function highlight(d) {
    debugger;
    let allElem = myServicee.getCanvusElements();
    d3.select(
      allElem.element.shadowRoot.querySelectorAll("#foreground")[0]
    ).style("opacity", "0.25");
    if (selectedService) {
      const val = d[selectedService];
      const gourpBeloing = orderLegend.find(
        (dv) => val >= dv.minvalue && val < dv.value
      ) || { text: undefined };

      d3.select(
        allElem.element.shadowRoot.querySelectorAll("#colorContinuos")[0]
      )
        .selectAll(".row")
        .style("opacity", function (p) {
          return gourpBeloing.text === p ? null : "0.3";
        });
    } else {
      d3.select(allElem.element.shadowRoot.querySelectorAll("#legend")[0])
        .selectAll(".row")
        .style("opacity", function (p) {
          return d.group == p ? null : "0.3";
        });
    }
    path(
      d,
      highlighted,
      colorCanvas(selectedService == null ? d.group : d[selectedService], 1)
    );
  }

  // Remove highlight
  function unhighlight() {
    debugger;
    let allElem = myServicee.getCanvusElements();
    d3.select(
      allElem.element.shadowRoot.querySelectorAll("#foreground")[0]
    ).style("opacity", foreground_opacity);
    d3.select(allElem.element.shadowRoot.querySelectorAll("#legend")[0])
      .selectAll(".row")
      .style("opacity", null);
    if (selectedService) {
      d3.select(
        allElem.element.shadowRoot.querySelectorAll("#colorContinuos")[0]
      )
        .selectAll(".row")
        .style("opacity", null);
    } else {
      d3.select(allElem.element.shadowRoot.querySelectorAll("#legend")[0])
        .selectAll(".row")
        .style("opacity", null);
    }
    highlighted.clearRect(0, 0, w, h);
  }
  function redraw(selected) {
    let allElem = myServicee.getCanvusElements();
    if (selected.length < data.length && selected.length > 0) {
      d3.select("#keep-data").attr("disabled", null);
      d3.select(
        allElem.element.shadowRoot.querySelectorAll("#exclude-data")[0]
      ).attr("disabled", null);
    } else {
      d3.select("#keep-data").attr("disabled", "disabled");
      d3.select(
        allElem.element.shadowRoot.querySelectorAll("#exclude-data")[0]
      ).attr("disabled", "disabled");
    }

    // total by food group
    var tallies = _(selected).groupBy(function (d) {
      return d.group;
    });

    // include empty groups
    _(colors.domain()).each(function (v, k) {
      tallies[v] = tallies[v] || [];
    });

    // Render selected lines
    paths(selected, foreground, brush_count, true);
  }
  function paths(selected, ctx, count) {
    debugger;
    var n = selected.length,
      i = 0,
      opacity = d3.min([2 / Math.pow(n, 0.3), 1]),
      timer = new Date().getTime();

    selection_stats(opacity, n, data.length);

    //shuffled_data = _.shuffle(selected);

    // complex_data_table(shuffled_data.slice(0,20));
    shuffled_data = selected;
    complex_data_table_render = true;
    ctx.clearRect(0, 0, w + 1, h + 1);

    // render all lines until finished or a new brush event
    function animloop() {
      if (i >= n || count < brush_count) {
        timel.stop();
        return true;
      }
      var max = d3.min([i + render_speed, n]);
      render_range(shuffled_data, i, max, opacity);
      render_stats(max, n, render_speed);
      i = max;
      timer = optimize(timer); // adjusts render_speed
    }
    if (timel) timel.stop();
    timel = d3.timer(animloop, 100);
    if (isChangeData) axisPlot.dispatch("plot", selected);
  }
  function render_stats(i, n, render_speed) {
    let allElem = myServicee.getCanvusElements();

    d3.select(
      allElem.element.shadowRoot.querySelectorAll("#rendered-count")[0]
    ).text(i);
    d3.select(
      allElem.element.shadowRoot.querySelectorAll("#rendered-bar")[0]
    ).style("width", (100 * i) / n + "%");
    d3.select(
      allElem.element.shadowRoot.querySelectorAll("#render-speed")[0]
    ).text(render_speed);
  }
  function selection_stats(opacity, n, total) {
    let allElem = myServicee.getCanvusElements();
    d3.select(
      allElem.element.shadowRoot.querySelectorAll("#data-count")[0]
    ).text(total);
    d3.select(
      allElem.element.shadowRoot.querySelectorAll("#selected-count")[0]
    ).text(n);
    d3.select(
      allElem.element.shadowRoot.querySelectorAll("#selected-bar")[0]
    ).style("width", (100 * n) / total + "%");
    d3.select(allElem.element.shadowRoot.querySelectorAll("#opacity")[0]).text(
      ("" + opacity * 100).slice(0, 4) + "%"
    );
  }
  function optimize(timer) {
    var delta = new Date().getTime() - timer;
    render_speed = Math.max(Math.ceil((render_speed * 30) / delta), 8);
    render_speed = Math.min(render_speed, 300);
    return new Date().getTime();
  }

  function render_range(selection, i, max, opacity) {
    selection.slice(i, max).forEach(function (d) {
      path(
        d,
        foreground,
        colorCanvas(
          selectedService == null ? d.group : d[selectedService],
          opacity
        )
      );
      // if (animationtime){
      //     timel.stop();
      //     animationtime = false;
      //     return true
      // }
    });
  }
  function colorCanvas(d, a) {
    var c = d3.hsl(color(d));
    c.opacity = a;
    return c;
  }

  function path(d, ctx, color) {
    if (color) ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.setLineDash([]);
    var x0 = xscale(dimensions[0]) - 15,
      y0 = yscale[dimensions[0]](d[dimensions[0]]); // left edge
    ctx.moveTo(x0, y0);
    let valid = true;
    dimensions.map(function (p, i) {
      var x = xscale(p),
        y = yscale[p](d[p]);
      if (y === undefined) {
        if (valid) {
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.setLineDash([5, 15]);
        }
        valid = false;
      } else if (valid) {
        var cp1x = x - 0.5 * (x - x0);
        var cp1y = y0;
        var cp2x = x - 0.5 * (x - x0);
        var cp2y = y;
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
        x0 = x;
        y0 = y;
      } else {
        var cp1x = x - 0.5 * (x - x0);
        var cp1y = y0;
        var cp2x = x - 0.5 * (x - x0);
        var cp2y = y;
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.moveTo(x, y);
        valid = true;
        x0 = x;
        y0 = y;
      }
    });
    ctx.lineTo(x0 + 15, y0); // right edge
    ctx.stroke();
  }
  function add_axis(d, g, serviceFullList_withExtra) {
    const target = serviceFullList_withExtra.find((e) => e.text === d);
    if (target) {
      // dimensions.splice(dimensions.length-1, 0, d);
      target.enable = true;
      dimensions.push(d);
      dimensions = _.intersection(listMetric.toArray(), dimensions);
      xscale.domain(dimensions);
      // g.attr("transform", function(p) { return "translate(" + position(p) + ")"; });
      updateDimension();
      update_ticks();
    }
  }
  function filterAxisbyDom(d, serviceFullList_withExtra) {
    const pdata = d3.select(this.parentElement.parentElement).datum();
    if (d.value.enable !== this.checked) {
      d.value.enable = this.checked;
      if (this.checked) {
        add_axis(pdata.arr, g, serviceFullList_withExtra);
        d3.select(this.parentElement.parentElement).classed("disable", false);
      } else {
        remove_axis(pdata.arr, g);
        d3.select(this.parentElement.parentElement).classed("disable", true);
      }
      // TODO required to avoid a bug
      var extent = d3.brushSelection(
        svg.selectAll(".dimension").filter((d) => d == pdata.arr)
      );
      if (extent) extent = extent.map(yscale[d].invert).sort((a, b) => a - b);
      update_ticks(pdata.arr, extent);
    }
  }

  let listOption = [];
  function drawFiltertable(serviceFullList_withExtra, allElem) {
    debugger;
    listOption = serviceFullList_withExtra.map((e, ei) => {
      return {
        service: e.text,
        arr: e.text,
        order: ei,
        id: e.id,
        text: e.text,
        enable: e.enable,
        hide: e.hide,
      };
    });

    let table = d3
      .select(allElem.element.shadowRoot.querySelectorAll("#axisSetting")[0])
      .select("tbody");
    table
      .selectAll("tr")
      .data(listOption)
      .join(
        (enter) => {
          const tr = enter.append("tr");
          tr.attr("data-id", (d) => d.arr);
          tr.classed("hide", (d) => d.hide);
          tr.each(function (d) {
            d.tableObj = d3.select(this);
          });
          const alltr = tr
            .selectAll("td")
            .data((d) => [
              { key: "enable", value: d, type: "checkbox" },
              {
                key: "colorBy",
                value: false,
                type: "radio",
              },
              { key: "text", value: d.text },
            ])
            .enter()
            .append("td");
          let trCount = 0;
          alltr
            .filter((d) => d.type === "radio")
            .append("input")
            .attrs(function (d, i) {
              trCount = trCount + 1;
              const pdata = d3.select(this.parentElement.parentElement).datum();
              // if (trCount == 1)
              //   changeVar(
              //     d3.select(this.parentElement.parentElement).datum(),
              //     serviceFullList_withExtra
              //   );
              return {
                type: "radio",
                name: "colorby",
                value: pdata.service,
              };
            })
            .on("change", function (d) {
              debugger;
              d3.select(
                allElem.element.shadowRoot.querySelectorAll("tr.axisActive")[0]
              ).classed("axisActive", false);
              d3.select(this.parentElement.parentElement).classed(
                "axisActive",
                true
              );
              console.log("radio changed");
              changeVar(
                d3.select(this.parentElement.parentElement).datum(),
                serviceFullList_withExtra
              );
              brush();
            });
          alltr
            .filter((d) => d.key === "enable")
            .append("input")
            .attrs(function (d, i) {
              return {
                type: "checkbox",
                checked: serviceFullList_withExtra[d.value.order].enable
                  ? "checked"
                  : null,
              };
            })
            .on("adjustValue", function (d) {
              d3.select(this).attr(
                "checked",
                serviceFullList_withExtra[d.value.order].enable
                  ? "checked"
                  : null
              );
            })
            .on("change", function (d) {
              debugger;
              filterAxisbyDom.call(this, d, serviceFullList_withExtra);
              xscale.domain(dimensions);
              d3.select(
                allElem.element.shadowRoot.querySelectorAll("#foreground")[0]
              ).style("opacity", foreground_opacity);
              brush();
            });
          alltr.filter((d) => d.type === undefined).text((d) => d.value);
        },
        (update) => {
          const tr = update;
          tr.classed("hide", (d) => d.hide);
          tr.each(function (d) {
            d.tableObj = d3.select(this);
          });
          tr.attr("data-id", (d) => d.arr);
          const alltr = tr.selectAll("td").data((d) => [
            { key: "enable", value: d, type: "checkbox" },
            {
              key: "colorBy",
              value: false,
              type: "radio",
            },
            { key: "text", value: d.text },
          ]);
          alltr.filter((d) => d.type === undefined).text((d) => d.value);
          alltr
            .filter((d) => d.key === "enable")
            .select("input")
            .each(function (d) {
              this.checked = serviceFullList_withExtra[d.value.order].enable;
            });
        }
      );

    listMetric = Sortable.create(
      allElem.element.shadowRoot.querySelectorAll("tbody")[0],
      {
        animation: 150,
        sort: true,
        dataIdAttr: "data-id",
        filter: ".disable",
        onStart: function (/**Event*/ evt) {
          evt.oldIndex; // element index within parent
          const currentAxis = d3.select(evt.item).datum();
          const chosenAxis = svg
            .selectAll(".dimension")
            .filter((d) => d == currentAxis.arr);
          _.bind(dragstart, chosenAxis.node(), chosenAxis.datum())();
        },
        onEnd: function (/**Event*/ evt) {
          var itemEl = evt.item; // dragged HTMLElement
          evt.to; // target list
          evt.from; // previous list
          evt.oldIndex; // element's old index within old parent
          evt.newIndex; // element's new index within new parent
          evt.clone; // the clone element
          evt.pullMode; // when item is in another sortable: `"clone"` if cloning, `true` if moving
          const currentAxis = d3.select(itemEl).datum();
          const chosenAxis = svg
            .selectAll(".dimension")
            .filter((d) => d == currentAxis.arr);
          _.bind(dragend, chosenAxis.node(), chosenAxis.datum())();
        },
        onMove: function (/**Event*/ evt, /**Event*/ originalEvent) {
          // Example: https://jsbin.com/nawahef/edit?js,output
          evt.dragged; // dragged HTMLElement
          evt.draggedRect; // DOMRect {left, top, right, bottom}
          evt.related; // HTMLElement on which have guided
          evt.relatedRect; // DOMRect
          evt.willInsertAfter; // Boolean that is true if Sortable will insert drag element after target by default
          originalEvent.clientY; // mouse position
          // return false; — for cancel
          // return -1; — insert before target
          // return 1; — insert after target
          // console.log(originalEvent);
          // console.log(d3.event);
          const currentAxis = d3.select(evt.dragged).datum();
          const relatedtAxis = d3.select(evt.related).datum();
          const chosenAxis = svg
            .selectAll(".dimension")
            .filter((d) => d === currentAxis.arr);

          // d3.event = {};
          // // d3.event.dx = originalEvent.clientY - this.pre; // simulate the drag behavior
          // d3.event.dx = position(relatedtAxis.arr) - position(currentAxis.arr);
          // // simulate the drag behavior
          // d3.event.dx = d3.event.dx + (d3.event.dx > 0 ? 1 : -1);
          // if (!isNaN(d3.event.dx))
          //   _.bind(dragged, chosenAxis.node(), chosenAxis.datum())();
        },
      }
    );
  }
  function update_ticks(d, extent) {
    // update brushes
    let allElem = myServicee.getCanvusElements();
    if (d) {
      var brush_el = d3
        .selectAll(allElem.element.shadowRoot.querySelectorAll(".brush"))
        .filter(function (key) {
          return key == d;
        });
      // single tick
      if (extent) {
        // restore previous extent
        console.log(extent);
        brush_el.call((yscale[d].brush = getBrush(d))).call(
          yscale[d].brush.move,
          extent.map(yscale[d]).sort((a, b) => a - b)
        );
      } else {
        brush_el.call((yscale[d].brush = getBrush(d)));
      }
    } else {
      // all ticks
      d3.selectAll(allElem.element.shadowRoot.querySelectorAll(".brush")).each(
        function (d) {
          d3.select(this).call((yscale[d].brush = getBrush(d)));
        }
      );
    }
    if (isTick) show_ticks(allElem);

    // update axes
    d3.selectAll(
      allElem.element.shadowRoot.querySelectorAll(".dimension .axis")
    ).each(function (d, i) {
      // hide lines for better performance
      d3.select(this).selectAll("line").style("display", "none");

      // transition axis numbers
      d3.select(this).transition().duration(720).call(getScale(d));

      // bring lines back
      d3.select(this)
        .selectAll("line")
        .transition()
        .delay(800)
        .style("display", null);

      d3.select(this)
        .selectAll("text")
        .style("font-weight", null)
        .style("font-size", null)
        .style("display", null);
    });
  }

  function changeVar(d, serviceFullList_withExtra) {
    // $('#groupName').text(d.text);
    let allElem = myServicee.getCanvusElements();
    if (d.arr === "rack") {
      selectedService = null;
      // svgLengend.style('display','none');
      d3.selectAll(
        allElem.element.shadowRoot.querySelectorAll(".dimension.axisActive")
      ).classed("axisActive", false);
      changeGroupTarget(d.arr);
      //legend = create_legend(colors,brush);
    } else {
      try {
        legend.remove();
      } catch (e) {}
      selectedService = d.arr;
      setColorsAndThresholds(d.service, serviceFullList_withExtra);
      changeGroupTarget(d.arr);
      //legend = drawLegend(d.service, arrThresholds, arrColor, dif);
      // svgLengend.style('display',null);
      d3.selectAll(
        allElem.element.shadowRoot.querySelectorAll(".dimension.axisActive")
      ).classed("axisActive", false);
      d3.selectAll(allElem.element.shadowRoot.querySelectorAll(".dimension"))
        .filter((e) => e === selectedService)
        .classed("axisActive", true);
    }
  }
  function changeGroupTarget(key) {
    if (key === "rack") data.forEach((d) => (d.group = d.rack));
    else {
      var thresholdScale = function (scale, d) {
        if (d)
          return d3
            .bisector(function (d) {
              return d;
            })
            .right(scale, d);
        return undefined;
      };
      let nameLegend = rangeToString(arrThresholds);
      let arrmidle = arrThresholds.slice(1);
      orderLegend = d3.merge([
        nameLegend
          .map((d, i) => {
            return { text: d, value: arrmidle[i], minvalue: arrThresholds[i] };
          })
          .reverse(),
        [
          {
            text: undefined,
            value: arrThresholds[1] + arrmidle[0] - arrmidle[1],
            minvalue: -Infinity,
          },
        ],
      ]);
      data.forEach(
        (d) => (d.group = nameLegend[thresholdScale(arrmidle, d[key])])
      );
    }
  }
  function rangeToString(arr) {
    let midleRange = arr.slice(1, 0 - 1);
    let mapRangeName = ["(<" + midleRange[0] + ")"];
    midleRange
      .slice(1)
      .forEach((d, i) =>
        mapRangeName.push("(" + midleRange[i] + "-" + d + ")")
      );
    mapRangeName.push("(>" + midleRange[midleRange.length - 1] + ")");
    return mapRangeName;
  }
  function setColorsAndThresholds(sin, serviceFullList_withExtra) {
    let s = serviceFullList_withExtra.find((d) => d.text === sin);
    if (s.idroot === undefined) {
      s.range =
        stickKey !== TIMEKEY
          ? [yscale[stickKey].domain()[1], yscale[stickKey].domain()[0]]
          : yscale[stickKey].domain();
      const dif = (s.range[1] - s.range[0]) / levelStep;
      const mid = +s.range[0] + (s.range[1] - s.range[0]) / 2;
      let left = +s.range[0] - dif;
      if (stickKey === TIMEKEY) {
        arrThresholds = [
          new Date(left),
          s.range[0],
          new Date(+s.range[0] + dif),
          new Date(+s.range[0] + 2 * dif),
          new Date(+s.range[0] + 3 * dif),
          s.range[1],
          new Date(+s.range[1] + dif),
        ];
        opa = d3
          .scaleTime()
          .domain([
            new Date(left),
            s.range[0],
            new Date(mid),
            s.range[1],
            new Date(s.range[1] + dif),
          ])
          .range([1, 1, 0.1, 1, 1]);
      } else {
        arrThresholds = [
          left,
          s.range[0],
          s.range[0] + dif,
          s.range[0] + 2 * dif,
          s.range[0] + 3 * dif,
          s.range[1],
          s.range[1] + dif,
        ];
        opa = d3
          .scaleLinear()
          .domain([left, s.range[0], mid, s.range[1], s.range[1] + dif])
          .range([1, 1, 0.1, 1, 1]);
      }
    } else {
      const dif = (s.range[1] - s.range[0]) / levelStep;
      const mid = s.range[0] + (s.range[1] - s.range[0]) / 2;
      let left = s.range[0] - dif;
      arrThresholds = [
        left,
        s.range[0],
        s.range[0] + dif,
        s.range[0] + 2 * dif,
        s.range[0] + 3 * dif,
        s.range[1],
        s.range[1] + dif,
      ];
      opa = d3
        .scaleLinear()
        .domain([left, s.range[0], mid, s.range[1], s.range[1] + dif])
        .range([1, 1, 0.1, 1, 1]);
    }
    if (s.color) {
      color = s.color.copy();
      color.domain(s.color.domain().map((c) => s.axisCustom.tickInvert(c)));
    } else
      color = d3
        .scaleLinear()
        .domain(arrThresholds)
        .range(arrColor)
        .interpolate(d3.interpolateHcl); //interpolateHsl interpolateHcl interpolateRgb
  }
  let firstTime;
  function readFilecsv(data, separate, object) {
    debugger;
    separate = separate || "|";
    firstTime = true;

    function loadcsv(data) {
      db = "csv";
      newdatatoFormat_noSuggestion(data, separate);
      if (object.customTime) {
        stickKey = object.customTime.label;
        stickKeyFormat = object.customTime.format;
      } else {
        stickKey = TIMEKEY;
        stickKeyFormat = TIMEFORMAT;
      }
      serviceListattrnest = serviceLists.map((d) => ({
        key: d.text,
        sub: d.sub.map((e) => e.text),
      }));
//      selectedService = serviceLists[0].text;
      inithostResults();
      formatService(true);
      processResult = processResult_csv;

      // addDatasetsOptions()

      // MetricController.axisSchema(serviceFullList, true).update();
      firstTime = false;
      // realTimesetting(false, "csv", true, sampleS);
      updateDatainformation(sampleS["timespan"]);

      // preloader(true, 0, "File loaded: " + Math.round(evt.loaded/evt.total*100)+'%');

      if (!firstTime) {
        resetRequest();
      } else {
        initFunc();
      }
      initFunc = false;
    }
    loadcsv(data);
  }
  function newdatatoFormat_noSuggestion(data, separate) {
    debugger;
    separate = separate || "-";
    serviceList = [];
    serviceLists = [];
    serviceListattr = [];
    serviceAttr = {};
    hostList = { data: { hostlist: {} } };
    // FIXME detect format
    const variables = _.without(Object.keys(data[0]), "timestamp", "time");
    data.forEach((d) =>
      variables.forEach((k) => (d[k] = d[k] === "" ? null : +d[k]))
    ); // format number
    // test sepatate

    if (variables.find((k) => k.split(separate).length > 1) === undefined)
      separate = "-";

    let keys = {};
    variables.forEach((k, ki) => {
      let split_string = k.split(separate);
      const nameh = split_string.shift();
      hostList.data.hostlist[nameh] = {
        rack: 1, //nameh.split('.')[2],
        node: 1, //.split('.')[3],
        id: nameh,
      };
      let currentkey = split_string.join(separate);
      // const keys_replace =Object.keys(basic_service).map(k=>extractWordsCollection(getTermsArrayCollection(k),currentkey,k)).filter(d=>Object.keys(d).length);
      if (!keys[currentkey]) keys[currentkey] = { r: undefined, vi: [] };
      // if (keys_replace.length)
      //     keys[currentkey].r = Object.keys(keys_replace[0])[0]||0;
      keys[currentkey].vi.push(ki);
    });
    // check unionkeys
    d3.keys(hostList.data.hostlist).forEach((hname) => {
      Object.keys(keys).forEach((k, i) => {
        if (data.columns.find((c) => c === hname + separate + k) === undefined)
          delete keys[k];
      });
    });

    serviceQuery["csv"] = serviceQuery["csv"] || {};

    let validAxis = 0;
    Object.keys(keys).forEach((k, i) => {
      serviceQuery["csv"][k] = {};
      serviceQuery["csv"][k][k] = {
        type: "number",
        format: () => k,
        numberOfEntries: 1,
      };
      serviceAttr[k] = {
        key: k,
        val: [k],
      };
      serviceList.push(k);
      serviceListattr.push(k);
      let range = [+Infinity, -Infinity];
      keys[k].vi.forEach((vi) => {
        let temprange = d3.extent(data, (d) => d[variables[vi]]);
        if (temprange[0] < range[0]) range[0] = temprange[0];
        if (temprange[1] > range[1]) range[1] = temprange[1];
      });
      // let range = d3.extent(data,d=>d[variables[i]]);
      if (keys[k].r) {
        let suggest_range = serviceLists_or.find((d) => d.text === keys[k].r)
          .sub[0].range;
        if (suggest_range[0] <= range[0] && suggest_range[1] >= range[1])
          range = suggest_range;
      }
      if (range[0] !== range[1]) {
        validAxis++;
      } else {
        singleDataAxis.push(i);
      }
      const temp = {
        text: k,
        id: i,
        enable: range[0] !== range[1],
        sub: [
          {
            text: k,
            id: 0,
            enable: true,
            idroot: i,
            angle: (i * 2 * Math.PI) / Object.keys(keys).length,
            range: range,
          },
        ],
      };
      thresholds.push(range);
      serviceLists.push(temp);
    });
    serviceList_selected = serviceList.map((d, i) => {
      return { text: d, index: i };
    });
    serviceFullList = settings.serviceLists2serviceFullList(serviceLists);
    scaleService = serviceFullList.map((d) => d3.scaleLinear().domain(d.range));
    let currentValidAxis = 0;
    serviceFullList.forEach((d) => {
      d.enable = d.range[0] !== d.range[1];
      if (d.enable) {
        d.angle = (currentValidAxis * 2 * Math.PI) / validAxis;
        currentValidAxis++;
      } else d.angle = 0;
    });
    const host_name = Object.keys(hostList.data.hostlist);
    sampleS = {};
    tsnedata = {};
    sampleS["timespan"] = data.map((d) => new Date(d.time || d.timestamp));
    data.forEach((d) => {
      host_name.forEach((h) => {
        serviceListattr.forEach((attr, i) => {
          if (sampleS[h] === undefined) {
            sampleS[h] = {};
            tsnedata[h] = [];
          }
          sampleS[h][attr] = sampleS[h][attr] || [];
          let currentIndex = sampleS[h][attr].length;
          if (tsnedata[h][currentIndex] === undefined) {
            tsnedata[h][currentIndex] = [];
            tsnedata[h][currentIndex].name = h;
            tsnedata[h][currentIndex].timestep = currentIndex;
          }
          let retievedData = processResult_csv(d[h + separate + attr], attr);
          // let retievedData = d[h+separate+attr];
          sampleS[h][attr].push(retievedData);
          tsnedata[h][currentIndex].push(
            retievedData[0] === null ? 0 : scaleService[i](retievedData[0]) || 0
          );
        });
      });
    });
  }
  function processResult_csv(r, serviceName) {
    return processData_csv(r, serviceName);
  }
  function processData_csv(result, serviceName) {
    const serviceAttribute = serviceQuery[db][serviceName];
    const query_return = d3.keys(serviceAttribute);
    if (result !== undefined) {
      let val = result;
      return d3.merge(
        query_return.map((s, i) => {
          if (
            (val != null && val[i] != undefined) ||
            (val != undefined && i === 0)
          ) {
            // no error
            const subob = val;
            if (serviceAttribute[s].type === "number") return [+subob];
            else if (
              subob.error === "None" ||
              subob.error === null ||
              serviceAttribute[s].type === "object"
            )
              return d3.range(serviceAttribute[s].numberOfEntries).map((d) => {
                const localVal =
                  subob[serviceAttribute[s].format(d + 1)] ||
                  (serviceAttribute[s].format2 &&
                    subob[serviceAttribute[s].format2(d + 1)]);
                if (localVal != null && localVal != undefined) {
                  if (serviceAttribute[s].type === "object")
                    return string2JSON(localVal);
                  return localVal * (serviceAttribute[s].rescale || 1);
                } else return undefined;
              });
            else
              return d3
                .range(serviceAttribute[s].numberOfEntries)
                .map((d) => undefined);
          } else {
            return d3
              .range(serviceAttribute[s].numberOfEntries)
              .map((d) => undefined);
          }
        })
      );
    }
    return d3.merge(
      query_return.map((s, i) => {
        return d3
          .range(serviceAttribute[s].numberOfEntries)
          .map((d) => undefined);
      })
    );
  }

  function inithostResults(worker) {
    hosts = [];
    const hostdata = hostList.data.hostlist;
    hostResults = {};
    for (var att in hostdata) {
      var h = {};
      h.name = att;
      h.hpcc_rack = hostdata[att].rack
        ? hostdata[att].rack
        : +att.split("-")[1];
      h.hpcc_node = hostdata[att].node
        ? hostdata[att].node
        : +att.split("-")[2].split(".")[0];
      h.index = hosts.length;

      // to contain the historical query results
      if (!worker) {
        hostResults[h.name] = {};
        hostResults[h.name].index = h.index;
        hostResults[h.name].arr = [];
        serviceListattr.forEach((d) => (hostResults[att][d] = []));
      }
      hosts.push(h);
    }
    hostResults.timespan = [];
    hosts.sort((a, b) => {
      var rackx = a.hpcc_rack;
      var racky = b.hpcc_rack;
      var x = a.hpcc_node;
      var y = b.hpcc_node;
      if (rackx !== racky) {
        return rackx - racky;
      } else {
        if ((x % 2) - (y % 2)) {
          return (y % 2) - (x % 2);
        } else {
          return x - y;
        }
      }
    });
  }
  function formatService(init) {
    serviceLists.forEach((s) => {
      if (s.text.split("vs.").length > 1) {
        s.enable = false;
        s.sub[0].enable = false;
      }
    });
    serviceFullList_Fullrange = _.clone(serviceFullList);
    conf.serviceList = serviceList;
    conf.serviceLists = serviceLists;
    conf.serviceListattr = serviceListattr;
    conf.serviceListattrnest = serviceListattrnest;
    service_custom_added = [
      {
        text: "Time",
        id: -1,
        enable: true,
        isDate: true,
        class: "sorting_disabled",
      },
      {
        text: "Cluster",
        id: -2,
        enable: false,
        hide: true,
        color: colorCluster,
        axisCustom: {
          ticks: 0,
          tickFormat: (d) => `Group ${cluster_info[d].orderG + 1}`,
          tickInvert: (d) => cluster_info.find((c) => c.name === d).index,
        },
      },
    ];
    serviceFullList_withExtra = _.flatten([
      service_custom_added,
      serviceFullList,
    ]);
    let allElem = myServicee.getCanvusElements();
    drawFiltertable(serviceFullList_withExtra, allElem);
  }
  function resetRequest() {
    debugger;
    // Convert quantitative scales to floats
    // animationtime = false;
    // handle_clusterinfo();
    // unhighlight();
    initializeD3Elements();
    let allElem = myServicee.getCanvusElements();
    data = object2DataPrallel(sampleS);
    yscale = {};
    xscale.domain(
      (dimensions = serviceFullList_withExtra
        .filter(function (s) {
          let k = s.text;
          let xtempscale =
            (s.isDate &&
              (yscale[k] = d3
                .scaleTime()
                .domain(
                  d3.extent(data, function (d) {
                    return d[k];
                  })
                )
                .range([h, 0]))) ||
            (yscale[k] = d3
              .scaleLinear()
              // .domain(d3.extent(data, function (d) {
              //     return +d[k];
              // }))
              .domain(
                serviceFullList_withExtra.find((d) => d.text === k).range || [
                  0,
                  0,
                ]
              )
              .range([h, 0]));
          if (s.axisCustom) xtempscale.axisCustom = s.axisCustom;
          return s.enable ? xtempscale : false;
        })
        .map((s) => s.text))
    );
    if(data.length > 0){
      d3.select("#search").attr(
        "placeholder",
        `Search host e.g ${data[0].compute}`
      );
    }
    // Add a group element for each dimension.
    updateDimension();
    if (serviceFullList.length > 0  && !serviceFullList.find((d) => d.text === selectedService))
      selectedService = serviceFullList[0].text;
    const selecteds = d3
      .select(allElem.element.shadowRoot.querySelectorAll("#axisSetting")[0])
      .select("tbody")
      .selectAll("tr")
      .filter((d) => d.arr == selectedService)
      .select('input[type="radio"]')
      .property("checked", true);
      if(selecteds)
        _.bind(selecteds.on("change"), selecteds.node())();
    brush();
  }
  function updateDatainformation(timearray, filename) {
    dataInformation.size = bytesToString(dataInformation.size);
    dataInformation.hostsnum = hosts.length;
    dataInformation.timerange = millisecondsToStr(
      _.last(timearray) - timearray[0]
    );
    dataInformation.interval = millisecondsToStr(timearray[1] - timearray[0]);
    dataInformation.totalstep = timearray.length;
    dataInformation.datanum = d3.format(",.0f")(
      dataInformation.totalstep * dataInformation.hostsnum
    );
    // let dataholder = d3.select("#datainformation");
    // for (let key in dataInformation)
    //   dataholder.select(`.${key}`).text(dataInformation[key]);
    // if (sampleS)
    //   d3.select(".currentDate").text(
    //     "" + sampleS["timespan"][0].toDateString()
    //   );
  }
  function bytesToString(bytes) {
    // One way to write it, not the prettiest way to write it.

    var fmt = d3.format(".0f");
    if (bytes < 1024) {
      return fmt(bytes) + "B";
    } else if (bytes < 1024 * 1024) {
      return fmt(bytes / 1024) + "kB";
    } else if (bytes < 1024 * 1024 * 1024) {
      return fmt(bytes / 1024 / 1024) + "MB";
    } else {
      return fmt(bytes / 1024 / 1024 / 1024) + "GB";
    }
  }
  function millisecondsToStr(milliseconds) {
    // TIP: to find current time in milliseconds, use:
    // var  current_time_milliseconds = new Date().getTime();

    function numberEnding(number) {
      return number > 1 ? "s" : "";
    }

    var temp = Math.floor(milliseconds / 1000);
    var years = Math.floor(temp / 31536000);
    var str = "";
    if (years) {
      str += years + " year" + numberEnding(years);
    }
    //TODO: Months! Maybe weeks?
    var days = Math.floor((temp %= 31536000) / 86400);
    if (days) {
      str += days + " day" + numberEnding(days) + " ";
    }
    var hours = Math.floor((temp %= 86400) / 3600);
    if (hours) {
      str += hours + " hour" + numberEnding(hours) + " ";
    }
    var minutes = Math.floor((temp %= 3600) / 60);
    if (minutes) {
      str += minutes + " minute" + numberEnding(minutes) + " ";
    }
    var seconds = temp % 60;
    if (seconds) {
      str += seconds + " second" + numberEnding(seconds) + " ";
    }
    if (str === "") return Math.round(milliseconds) + " ms";
    //'just now' //or other string you like;
    else return str;
  }

  
  let main = {
    initFunc,
    drawFiltertable,
    readFilecsv,
  };
  return main;
}
