import * as d3 from "d3";
import _ from "underscore";
import { main } from "../js/main";
import { ss } from "../js/simple-statistics";
export function setting() {
  // read variable

  const TIMEKEY = "Time";
  const TIMEFORMAT = d3.timeFormat("%B %d %Y %H:%M");
  let scaleService;
  let sampleS, tsnedata;
  let stickKey = TIMEKEY;
  let stickKeyFormat = TIMEFORMAT;
  // system variable
  let application_name = "HiperView";
  let jobList = [];
  let hostList;
  let hosts = [];
  let conf = {};
  let serviceList = [
    "Temperature",
    "Job_load",
    "Memory_usage",
    "Fans_speed",
    "Power_consum",
    "Job_scheduling",
  ];
  let serviceList_selected = [
    { text: "Temperature", index: 0 },
    { text: "Job_load", index: 1 },
    { text: "Memory_usage", index: 2 },
    { text: "Fans_speed", index: 3 },
    { text: "Power_consum", index: 4 },
  ];

  let serviceListattr = [
    "arrTemperature",
    "arrCPU_load",
    "arrMemory_usage",
    "arrFans_health",
    "arrPower_usage",
    "arrJob_scheduling",
  ];
  let serviceFullList_withExtra;
  let serviceLists = [
    {
      text: "Temperature",
      id: 0,
      enable: true,
      sub: [
        {
          text: "CPU1 Temp",
          id: 0,
          enable: true,
          idroot: 0,
          angle: 5.834386356666759,
          range: [3, 98],
        },
        {
          text: "CPU2 Temp",
          id: 1,
          enable: true,
          idroot: 0,
          angle: 0,
          range: [3, 98],
        },
        {
          text: "Inlet Temp",
          id: 2,
          enable: true,
          idroot: 0,
          angle: 0.4487989505128276,
          range: [3, 98],
        },
      ],
    },
    {
      text: "Job_load",
      id: 1,
      enable: true,
      sub: [
        {
          text: "Job load",
          id: 0,
          enable: true,
          idroot: 1,
          angle: 1.2566370614359172,
          range: [0, 10],
        },
      ],
    },
    {
      text: "Memory_usage",
      id: 2,
      enable: true,
      sub: [
        {
          text: "Memory usage",
          id: 0,
          enable: true,
          idroot: 2,
          angle: 1.8849555921538759,
          range: [0, 99],
        },
      ],
    },
    {
      text: "Fans_speed",
      id: 3,
      enable: true,
      sub: [
        {
          text: "Fan1 speed",
          id: 0,
          enable: true,
          idroot: 3,
          angle: 2.4751942119192307,
          range: [1050, 17850],
        },
        {
          text: "Fan2 speed",
          id: 1,
          enable: true,
          idroot: 3,
          angle: 2.9239931624320583,
          range: [1050, 17850],
        },
        {
          text: "Fan3 speed",
          id: 2,
          enable: true,
          idroot: 3,
          angle: 3.372792112944886,
          range: [1050, 17850],
        },
        {
          text: "Fan4 speed",
          id: 3,
          enable: true,
          idroot: 3,
          angle: 3.8215910634577135,
          range: [1050, 17850],
        },
      ],
    },
    {
      text: "Power_consum",
      id: 4,
      enable: true,
      sub: [
        {
          text: "Power consumption",
          id: 0,
          enable: true,
          idroot: 4,
          angle: 4.71238898038469,
          range: [0, 200],
        },
      ],
    },
  ];
  let serviceLists_or = [
    {
      text: "Temperature",
      id: 0,
      enable: true,
      sub: [
        {
          text: "CPU1 Temp",
          id: 0,
          enable: true,
          idroot: 0,
          angle: 5.834386356666759,
          range: [3, 98],
        },
        {
          text: "CPU2 Temp",
          id: 1,
          enable: true,
          idroot: 0,
          angle: 0,
          range: [3, 98],
        },
        {
          text: "Inlet Temp",
          id: 2,
          enable: true,
          idroot: 0,
          angle: 0.4487989505128276,
          range: [3, 98],
        },
      ],
    },
    {
      text: "Job_load",
      id: 1,
      enable: true,
      sub: [
        {
          text: "Job load",
          id: 0,
          enable: true,
          idroot: 1,
          angle: 1.2566370614359172,
          range: [0, 10],
        },
      ],
    },
    {
      text: "Memory_usage",
      id: 2,
      enable: true,
      sub: [
        {
          text: "Memory usage",
          id: 0,
          enable: true,
          idroot: 2,
          angle: 1.8849555921538759,
          range: [0, 99],
        },
      ],
    },
    {
      text: "Fans_speed",
      id: 3,
      enable: true,
      sub: [
        {
          text: "Fan1 speed",
          id: 0,
          enable: true,
          idroot: 3,
          angle: 2.4751942119192307,
          range: [1050, 17850],
        },
        {
          text: "Fan2 speed",
          id: 1,
          enable: true,
          idroot: 3,
          angle: 2.9239931624320583,
          range: [1050, 17850],
        },
        {
          text: "Fan3 speed",
          id: 2,
          enable: true,
          idroot: 3,
          angle: 3.372792112944886,
          range: [1050, 17850],
        },
        {
          text: "Fan4 speed",
          id: 3,
          enable: true,
          idroot: 3,
          angle: 3.8215910634577135,
          range: [1050, 17850],
        },
      ],
    },
    {
      text: "Power_consum",
      id: 4,
      enable: true,
      sub: [
        {
          text: "Power consumption",
          id: 0,
          enable: true,
          idroot: 4,
          angle: 4.71238898038469,
          range: [0, 200],
        },
      ],
    },
  ];
  let serviceFullList = serviceLists2serviceFullList(serviceLists);
  let singleDataAxis = [];
  function serviceLists2serviceFullList(serviceLists) {
    let temp = [];
    serviceLists.forEach((s) =>
      s.sub.forEach((sub) => {
        sub.idroot = s.id;
        sub.enable = s.enable && (sub.enable === undefined ? true : sub.enable);
        temp.push(sub);
      })
    );
    return temp;
  }
  let serviceListattrnest = [
    { key: "arrTemperature", sub: ["CPU1 Temp", "CPU2 Temp", "Inlet Temp"] },
    { key: "arrCPU_load", sub: ["Job load"] },
    { key: "arrMemory_usage", sub: ["Memory usage"] },
    {
      key: "arrFans_health",
      sub: ["Fan1 speed", "Fan2 speed", "Fan3 speed", "Fan4 speed"],
    },
    { key: "arrPower_usage", sub: ["Power consumption"] },
  ];
  let FIELD_MACHINE_ID = "name";
  let VARIABLES = [];
  /**Configuration**/
  const oneWay = true;
  const smooth = false;
  const stepPenalty = false;

  let serviceAttr = {
    arrTemperature: {
      key: "Temperature",
      val: ["arrTemperatureCPU1", "arrTemperatureCPU2"],
    },
    arrCPU_load: { key: "CPU_load", val: ["arrCPU_load"] },
    arrMemory_usage: { key: "Memory_usage", val: ["arrMemory_usage"] },
    arrFans_health: {
      key: "Fans_speed",
      val: ["arrFans_speed1", "arrFans_speed2"],
    },
    arrPower_usage: { key: "Power_consumption", val: ["arrPower_usage"] },
  };
  let thresholds = [
    [3, 98],
    [0, 10],
    [0, 99],
    [1050, 17850],
    [0, 200],
  ];
  var serviceQuery ={
    nagios_old: ["temperature","cpu+load" ,"memory+usage" ,"fans+health" ,"power+usage"],
    nagios: {
        "Temperature":{
            format: (d)=> `CPU${d} Temp`,
            "numberOfEntries":2,
            "type":"json",
            "query":"CPU_Temperature"
        },
        "Job_load":{
            format: ()=> "cpuusage",
            "numberOfEntries":1,
            "type":"json",
            "query":"CPU_Usage"
        },
        "Memory_usage":{
            "format":()=>"memoryusage",
            "numberOfEntries":1,
            "type":"json",
            "query":"Memory_Usage",
            "rescale": 1/191.908,
        },
        "Fans_speed":{
            format: (d)=> `FAN_${d}`,
            "numberOfEntries":4,
            "type":"json",
            "query":"Fan_Speed"
        },
        "Power_consum":{
            "format": ()=>"powerusage_watts",
            "numberOfEntries":1,
            "type":"json",
            "query":"Node_Power_Usage",
            "rescale": 1/3.2,
        }
    },
    influxdb: {
        "Temperature":{
            "CPU_Temperature" : {
                format: (d) => `CPU${d} Temp`,
                "numberOfEntries": 2,
            },
            "Inlet_Temperature" : {
                format: () => `Inlet Temp`,
                "numberOfEntries": 1,
            }
        },
        "Job_load":{
            "CPU_Usage": {
                format: () => "cpuusage(load)",
                format2: () => "cpuusage",
                "numberOfEntries": 1,
            }
        },
        "Memory_usage":{
            "Memory_Usage": {
                format: () => "memoryusage",
                "numberOfEntries": 1,
                "rescale": 100 / 191.908,
            }
        },
        "Fans_speed":{
            "Fan_Speed" : {
                format: (d) => `FAN_${d}`,
                "numberOfEntries": 4,
            }
        },
        "Power_consum":{
            "Node_Power_Usage" : {
                "format": () => "powerusage_watts",
                "numberOfEntries": 1,
                "rescale": 1 / 3.2,
            }
        },
        "Job_scheduling":{
            "Job_Info" : {
                "format": () => "job_data",
                'mainkey': 'jobID',
                "numberOfEntries": 1,
                "type": 'object',
            }
        }
    },
};
  function systemFormat() {
    jobList = [];
    serviceList = [
      "Temperature",
      "Job_load",
      "Memory_usage",
      "Fans_speed",
      "Power_consum",
      "Job_scheduling",
    ];
    serviceList_selected = [
      { text: "Temperature", index: 0 },
      { text: "Job_load", index: 1 },
      { text: "Memory_usage", index: 2 },
      { text: "Fans_speed", index: 3 },
      { text: "Power_consum", index: 4 },
    ];

    serviceListattr = [
      "arrTemperature",
      "arrCPU_load",
      "arrMemory_usage",
      "arrFans_health",
      "arrPower_usage",
      "arrJob_scheduling",
    ];
    serviceLists = [
      {
        text: "Temperature",
        id: 0,
        enable: true,
        sub: [
          {
            text: "CPU1 Temp",
            id: 0,
            enable: true,
            idroot: 0,
            angle: 5.834386356666759,
            range: [3, 98],
          },
          {
            text: "CPU2 Temp",
            id: 1,
            enable: true,
            idroot: 0,
            angle: 0,
            range: [3, 98],
          },
          {
            text: "Inlet Temp",
            id: 2,
            enable: true,
            idroot: 0,
            angle: 0.4487989505128276,
            range: [3, 98],
          },
        ],
      },
      {
        text: "Job_load",
        id: 1,
        enable: true,
        sub: [
          {
            text: "Job load",
            id: 0,
            enable: true,
            idroot: 1,
            angle: 1.2566370614359172,
            range: [0, 10],
          },
        ],
      },
      {
        text: "Memory_usage",
        id: 2,
        enable: true,
        sub: [
          {
            text: "Memory usage",
            id: 0,
            enable: true,
            idroot: 2,
            angle: 1.8849555921538759,
            range: [0, 99],
          },
        ],
      },
      {
        text: "Fans_speed",
        id: 3,
        enable: true,
        sub: [
          {
            text: "Fan1 speed",
            id: 0,
            enable: true,
            idroot: 3,
            angle: 2.4751942119192307,
            range: [1050, 17850],
          },
          {
            text: "Fan2 speed",
            id: 1,
            enable: true,
            idroot: 3,
            angle: 2.9239931624320583,
            range: [1050, 17850],
          },
          {
            text: "Fan3 speed",
            id: 2,
            enable: true,
            idroot: 3,
            angle: 3.372792112944886,
            range: [1050, 17850],
          },
          {
            text: "Fan4 speed",
            id: 3,
            enable: true,
            idroot: 3,
            angle: 3.8215910634577135,
            range: [1050, 17850],
          },
        ],
      },
      {
        text: "Power_consum",
        id: 4,
        enable: true,
        sub: [
          {
            text: "Power consumption",
            id: 0,
            enable: true,
            idroot: 4,
            angle: 4.71238898038469,
            range: [0, 200],
          },
        ],
      },
    ];
    serviceFullList = serviceLists2serviceFullList(serviceLists);
    serviceListattrnest = [
      { key: "arrTemperature", sub: ["CPU1 Temp", "CPU2 Temp", "Inlet Temp"] },
      { key: "arrCPU_load", sub: ["Job load"] },
      { key: "arrMemory_usage", sub: ["Memory usage"] },
      {
        key: "arrFans_health",
        sub: ["Fan1 speed", "Fan2 speed", "Fan3 speed", "Fan4 speed"],
      },
      { key: "arrPower_usage", sub: ["Power consumption"] },
    ];
    serviceAttr = {
      arrTemperature: {
        key: "Temperature",
        val: ["arrTemperatureCPU1", "arrTemperatureCPU2"],
      },
      arrCPU_load: { key: "CPU_load", val: ["arrCPU_load"] },
      arrMemory_usage: { key: "Memory_usage", val: ["arrMemory_usage"] },
      arrFans_health: {
        key: "Fans_speed",
        val: ["arrFans_speed1", "arrFans_speed2"],
      },
      arrPower_usage: { key: "Power_consumption", val: ["arrPower_usage"] },
    };
    thresholds = [
      [3, 98],
      [0, 10],
      [0, 99],
      [1050, 17850],
      [0, 200],
    ];
  }
  function inithostResults(worker, hostList) {
    const hostdata = hostList.data.hostlist;
    let hostResults = {};
    for (let att in hostdata) {
      let h = {};
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
      let rackx = a.hpcc_rack;
      let racky = b.hpcc_rack;
      let x = a.hpcc_node;
      let y = b.hpcc_node;
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
    // debugger;
    let mains = main();
    serviceLists.forEach((s) => {
      if (s.text.split("vs.").length > 1) {
        s.enable = false;
        s.sub[0].enable = false;
      }
    });
    let colorCluster = d3.scaleOrdinal().range(d3.schemeCategory10);
    let serviceFullList_Fullrange = _.clone(serviceFullList);
    conf.serviceList = serviceList;
    conf.serviceLists = serviceLists;
    conf.serviceListattr = serviceListattr;
    conf.serviceListattrnest = serviceListattrnest;
    let service_custom_added = [
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
    mains.drawFiltertable(serviceFullList_withExtra);
    return serviceFullList_withExtra;
  }

  function getServiceFLE() {
    let colorCluster = d3.scaleOrdinal().range(d3.schemeCategory10);
    let service_custom_added = [
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
    return serviceFullList_withExtra;
  }

  function processResult_csv(r,serviceName){

    return processData_csv(r,serviceName);
}
  function processData_csv(result, serviceName) {
    const serviceAttribute = serviceQuery[db][serviceName];
    const query_return = d3.keys(serviceAttribute);
    if (result!==undefined) {
        let val = result;
        return d3.merge(query_return.map((s, i) => {
            if ((val!=null&&val[i]!=undefined)||(val!=undefined&&i===0)) // no error
            {
                const subob = val;
                if(serviceAttribute[s].type==='number')
                    return [+subob];
                else if (subob.error === "None" || subob.error === null || serviceAttribute[s].type==='object')
                    return d3.range(serviceAttribute[s].numberOfEntries).map(d => {
                        const localVal = subob[serviceAttribute[s].format(d + 1)]||(serviceAttribute[s].format2&&subob[serviceAttribute[s].format2(d + 1)]);
                        if (localVal != null && localVal != undefined) {
                            if (serviceAttribute[s].type==='object')
                                return string2JSON(localVal);
                            return localVal * (serviceAttribute[s].rescale || 1);
                        }
                        else return undefined;
                    });
               else
                    return d3.range(serviceAttribute[s].numberOfEntries).map(d => undefined);
            } else {
                return d3.range(serviceAttribute[s].numberOfEntries).map(d => undefined);
            }
        }));
    }
    return d3.merge(query_return.map((s, i) => {
            return d3.range(serviceAttribute[s].numberOfEntries).map(d => undefined);
    }));
}
  var newdatatoFormat_noSuggestion = function (data,separate){
    separate = separate||"-";
    serviceList = [];
    serviceLists = [];
    serviceListattr = [];
    serviceAttr={};
    hostList ={data:{hostlist:{}}};
    // FIXME detect format
    const variables = _.without(Object.keys(data[0]),'timestamp','time');
//    data.forEach(d=>variables.forEach(k=>d[k] = d[k]===""?null:(+d[k]))) // format number
    // test sepatate

    if (variables.find(k=>k.split(separate).length>1)===undefined)
        separate = "-";


    let keys ={};
    variables.forEach((k,ki)=>{
        let split_string = k.split(separate);
        const nameh = split_string.shift();
        hostList.data.hostlist [nameh] = {
            rack: 1,//nameh.split('.')[2],
            node: 1,//.split('.')[3],
            id : nameh,
        };
        let currentkey = split_string.join(separate);
        // const keys_replace =Object.keys(basic_service).map(k=>extractWordsCollection(getTermsArrayCollection(k),currentkey,k)).filter(d=>Object.keys(d).length);
        if(!keys[currentkey])
            keys[currentkey] = {r:undefined,vi:[]};
        // if (keys_replace.length)
        //     keys[currentkey].r = Object.keys(keys_replace[0])[0]||0;
        keys[currentkey].vi.push(ki)
    });
    // check unionkeys
    d3.keys(hostList.data.hostlist).forEach(hname=>{
        Object.keys(keys).forEach((k,i)=>{
            if (data.columns.find(c=>c===hname+separate+k)===undefined)
                delete keys[k];
        })
    });

    serviceQuery["csv"]= serviceQuery["csv"]||{};

    let validAxis = 0;
    Object.keys(keys).forEach((k,i)=>{
        serviceQuery["csv"][k]={};
        serviceQuery["csv"][k][k]={
            type : 'number',
            format : () =>k,
            numberOfEntries: 1};
        serviceAttr[k] = {
            key: k,
            val:[k]
        };
        serviceList.push(k);
        serviceListattr.push(k);
        let range =[+Infinity,-Infinity];
        keys[k].vi.forEach(vi=>{
            let temprange = d3.extent(data,d=>d[variables[vi]]);
            if (temprange[0]<range[0])
                range[0] = temprange[0];
            if (temprange[1]>range[1])
                range[1] = temprange[1];
        });
        // let range = d3.extent(data,d=>d[variables[i]]);
        if (keys[k].r) {
            let suggest_range = serviceLists_or.find(d => d.text === keys[k].r).sub[0].range;
            if (suggest_range[0]<=range[0]&&suggest_range[1]>=range[1])
                range = suggest_range;
        }
        if (range[0]!==range[1]){
            validAxis++;
        }else{
            singleDataAxis.push(i);
        }
        const temp = {"text":k,"id":i,"enable":range[0]!==range[1],"sub":[{"text":k,"id":0,"enable":true,"idroot":i,"angle":i*2*Math.PI/(Object.keys(keys).length),"range":range}]};
        thresholds.push(range);
        serviceLists.push(temp);
    });
    serviceList_selected = serviceList.map((d,i)=>{return{text:d,index:i}});
    serviceFullList = serviceLists2serviceFullList(serviceLists);
    scaleService = serviceFullList.map(d=>d3.scaleLinear().domain(d.range));
    let currentValidAxis = 0;
    serviceFullList.forEach(d=>{
        d.enable = d.range[0]!==d.range[1];
        if (d.enable) {
            d.angle = currentValidAxis * 2 * Math.PI / validAxis;
            currentValidAxis++;
        }else
            d.angle = 0;
    });
    const host_name = Object.keys(hostList.data.hostlist);
    sampleS = {};
    tsnedata = {};
    sampleS['timespan'] = data.map(d=>new Date(d.time||d.timestamp))
    data.forEach(d=>{
        host_name.forEach(h=> {
            serviceListattr.forEach((attr,i) => {
                if (sampleS[h]===undefined) {
                    sampleS[h] = {};
                    tsnedata[h] = [];
                }
                sampleS[h][attr] = sampleS[h][attr]||[];
                let currentIndex = sampleS[h][attr].length;
                if (tsnedata[h][currentIndex]===undefined){
                    tsnedata[h][currentIndex] = [];
                    tsnedata[h][currentIndex].name = h;
                    tsnedata[h][currentIndex].timestep =currentIndex;
                }
                let retievedData = processResult_csv(d[h+separate+attr],attr);
                // let retievedData = d[h+separate+attr];
                sampleS[h][attr].push(retievedData);
                tsnedata[h][currentIndex].push(retievedData[0]===null?0:scaleService[i](retievedData[0])||0);
            });
        })
    });
}
  function processResult_influxdb(r, hostname, index, servicename) {
    let temp = {};
    if (index !== undefined) {
      temp = {
        results: r.results.map((d) => {
          let temp = {};
          temp.statement_id = d.statement_id;
          temp.series = [];
          let tempsub = {};
          if (d.series) {
            const series = d.series[0];
            tempsub.name = series.name;
            tempsub.columns = series.columns;
            if (servicename === "Job_scheduling") {
              tempsub.values = [
                [
                  hostResults.timespan[index].toISOString(),
                  series.values
                    .filter(
                      (f) =>
                        new Date(f[0]).toISOString() ===
                          hostResults.timespan[index].toISOString() &&
                        f[1] !== "idle"
                    )
                    .map((e) => e[1])
                    .join(";"),
                ],
              ];
            } else tempsub.values = [series.values[index]];
          }
          temp.series.push(tempsub);
          return temp;
        }),
      };
    } else temp = r;
    let results_ob = processData_influxdb(temp, servicename);
    if (servicename !== "Job_scheduling") {
      return results_ob;
    } else {
      let newestdata =
        hostResults[hostname].arrJob_scheduling[
          hostResults[hostname].arrJob_scheduling.length - 1
        ];
      return results_ob;
    }
  }
  function axisHistogram(text, range, d) {
    d = d.filter((e) => e);
    if (d.length) {
      let outlierMultiply = 3;
      let scale = d3.scaleLinear().domain(range);
      let histogram = d3
        .histogram()
        .domain(scale.domain())
        // .thresholds(d3.range(0,20).map(d=>scale(d)))    // Important: how many bins approx are going to be made? It is the 'resolution' of the violin plot
        .thresholds(scale.ticks(100)) // Important: how many bins approx are going to be made? It is the 'resolution' of the violin plot
        .value((d) => d);
      let hisdata = histogram(d);

      let start = -1,
        startcheck = true,
        end = hisdata.length - 1;
      let sumstat = hisdata.map((d, i) => {
        let temp = [d.x0 + (d.x1 - d.x0) / 2, (d || []).length];
        if (startcheck && temp[1] === 0) start = i;
        else {
          startcheck = false;
          if (temp[1] !== 0) end = i;
        }
        return temp;
      });
      if (start === end) sumstat = [];
      else sumstat = sumstat.filter((d, i) => i > start && i <= end);
      let r = {
        axis: text,
        q1: ss().quantile(d, 0.25),
        q3: ss().quantile(d, 0.75),
        median: ss().median(d),
        // outlier: ,
        arr: sumstat,
      };
      // if (d.length>4)
      // {
      //     const iqr = r.q3-r.q1;
      //     console.log('Outliers: ',d.filter(e=>e>(r.q3+outlierMultiply*iqr)||e<(r.q1-outlierMultiply*iqr)).length);
      //     r.outlier = _.unique(d.filter(e=>e>(r.q3+outlierMultiply*iqr)||e<(r.q1-outlierMultiply*iqr)));
      //     console.log('Unquie points: ',r.outlier.length);
      // }else{
      //     r.outlier =  _.unique(d);
      // }
      r.outlier = [];
      return r;
    } else {
      return {
        axis: text,
        q1: null,
        q3: null,
        median: null,
        // outlier: ,
        arr: [],
      };
    }
  }
  let setting = {
    stickKey,
    stickKeyFormat,
    TIMEKEY,
    systemFormat,
    serviceAttr,
    thresholds,
    serviceList,
    serviceList_selected,
    serviceListattr,
    serviceLists,
    serviceFullList,
    hostList,
    inithostResults,
    formatService,
    hosts,
    processResult_influxdb,
    serviceListattrnest,
    serviceFullList_withExtra,
    getServiceFLE,
    axisHistogram,
    newdatatoFormat_noSuggestion
    
  };
  return setting;
}
