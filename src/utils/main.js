import $ from "jquery";
import * as d3 from "d3";
import { serviceList, serviceLists, serviceListattr, serviceListattrnest } from "../js/menu-setting";
import * as _ from "underscore";

var width, height;

var m = [40, 60, 10, 10],
    w,
    h,
    xscale,
    yscale = {},
    dragging = {},
    line = d3.line(),
    axis,
    // data = data,
    foreground,
    foreground_opacity = 1,
    background,
    highlighted,
    dimensions,
    legend,
    render_speed = 50,
    brush_count = 0,
    excluded_groups = [],
    svg, g, listMetric;


//legend prt
var levelStep = 4;
var arrThresholds;
var selectedService = "CPU1 Temp";
var orderLegend;
var svgLengend;
//read file
var thresholds = [[3, 98], [0, 10], [0, 99], [1050, 17850], [0, 200]];
var chosenService = 0;
var conf = {};
conf.serviceList = serviceList;
conf.serviceLists = serviceLists;
conf.serviceListattr = serviceListattr;
conf.serviceListattrnest = serviceListattrnest;
let dataInformation = { filename: '', size: 0, timerange: [], interval: '', totalstep: 0, hostsnum: 0, datanum: 0 };
var sampleS
var tsnedata
function Loadtostore() {
    // checkConf('serviceList');
    // checkConf('serviceLists');
    // checkConf('serviceListattr');
    // checkConf('serviceListattrnest');
}

//var arrColor = ['#00c', '#1a9850','#fee08b', '#d73027'];
// var arrColor = ['#110066','#4400ff', '#00cccc', '#00dd00','#ffcc44', '#ff0000', '#660000'];
// let arrColor = colorScaleList.customFunc('rainbow');
// let arrColor = colorScaleList.d3colorChosefunc('Greys');
var arrColor = ['#000066', '#0000ff', '#1a9850', '#ddee00', '#ffcc44', '#ff0000', '#660000'];
let colorCluster = d3.scaleOrdinal().range(d3.schemeCategory10);

var service_custom_added = [];
var serviceFullList_withExtra = [];
// let processData = processData_old;

//***********************
// Loadtostore();
//***********************
// START: loader spinner settings ****************************
var opts = {
    lines: 25, // The number of lines to draw
    length: 15, // The length of each line
    width: 5, // The line thickness
    radius: 25, // The radius of the inner circle
    color: '#f00', // #rgb or #rrggbb or array of colors
    speed: 2, // Rounds per second
    trail: 50, // Afterglow percentage
    className: 'spinner', // The CSS class to assign to the spinner
};
var target = document.getElementById('loadingSpinner');
// END: loader spinner settings ****************************

var colors = d3.scaleOrdinal();
var color, opa;
/// drawLegend *****************************************************************
let legendw = 80;
let legendh = 20;
let barw = 300;
let barScale = d3.scaleLinear();
let db = 'nagios';
// let animationtime = false ;
export const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
Array.prototype.naturalSort = function (_) {
    if (arguments.length) {
        return this.sort(function (as, bs) {
            return collator.compare(as[_], bs[_]);
        });
    } else {
        return this.sort(collator.compare);
    }
};

export function initial(data) {
    console.log('initialdata ', data);
    $(document).ready(function () {
        $('#leftpanel.collapsible').on('click', 'li', (evt) => {
            // onOpenStart: function (evt) {
            if (d3.select(evt.currentTarget).classed('searchPanel')) {
                complex_data_table(data, true)
            }
            // }
        });
        // $('#leftpanel.collapsible').accordion({
        //     activate: function (evt) {
        //         if (d3.select(evt.currentTarget).classed('searchPanel')) {
        //             complex_data_table(data, true)
        //         }
        //     }
        //     // }
        // });
    });
}

let complex_data_table_render = true;
export function complex_data_table(sample, render) {
    if (complex_data_table_render && (render || !d3.select('.searchPanel.active').empty())) {
        var samplenest = d3.nest()
            .key(d => d.rack).sortKeys(collator.compare)
            .key(d => d.compute).sortKeys(collator.compare)
            .sortValues((a, b) => a.Time - b.Time)
            .entries(sample);
        let instance = M.Collapsible.getInstance('#compute-list');
        if (instance)
            instance.destroy();
        d3.select("#compute-list").html('');
        var table = d3.select("#compute-list")
            .attr('class', 'collapsible rack')
            .selectAll("li")
            .data(samplenest, d => d.values);
        var ulAll = table.join(
            enter => {
                let lir = enter.append("li").attr('class', 'rack');
                lir.append('div')
                    .attr('class', 'collapsible-header')
                    .text(d => d.key);
                const lic = lir.append('div')
                    .attr('class', 'collapsible-body')
                    .append('div')
                    .attr('class', 'row marginBottom0')
                    .append('div')
                    .attr('class', 'col s12 m12')
                    .append('ul')
                    .attr('class', 'collapsible compute')
                    .datum(d => d.values)
                    .selectAll('li').data(d => d)
                    .enter()
                    .append('li').attr('class', 'compute');
                lic.append('div')
                    .attr('class', 'collapsible-header')
                    .text(d => d.key);
                const lit = lic
                    .append('div')
                    .attr('class', 'collapsible-body')
                    .append('div')
                    .attr('class', 'row marginBottom0')
                    .append('div')
                    .attr('class', 'col s12 m12')
                    .style('overflow-y', 'auto').style('max-height', '400px')
                    .append('ul')
                    .datum(d => d.values);
                return lir;
            }
        );
        function updateComtime(p) {
            let lit = p.select('ul')
                .datum(d => d.values)
                .selectAll('li')
                .data(d => d)
                .enter()
                .append('li').attr('class', 'comtime')
            // .on("mouseover", highlight)
            // .on("mouseout", unhighlight);

            lit.append("span")
                .attr("class", "color-block")
                .style("background", function (d) {
                    return color(selectedService == null ? d.group : d[selectedService])
                })
                .style("opacity", 0.85);
            lit.append("span")
                .text(function (d) {
                    return stickKeyFormat(d[stickKey]);
                });
            console.log('p ', lit);
            return p;
        }
        $('#compute-list.collapsible,#compute-list .collapsible').on('click', 'li', (evt) => {
            console.log(evt.target);
            if (d3.select(evt.target).classed('compute')) {
                d3.select(evt.target).call(updateComtime);
            }
        })
        // .collapsible({
        //     onOpenStart: function (evt) {
        //         console.log(evt)
        //         if (d3.select(evt).classed('compute'))
        //             d3.select(evt).call(updateComtime);
        //     }
        // });
        // complex_data_table_render = false;s
    }
}


