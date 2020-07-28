import {
  Component,
  ComponentInterface,
  h,
  Element,
  State,
  Prop,
  Watch,
  Host,
  Event,
  EventEmitter,
} from "@stencil/core";
import * as d3 from "d3";
import _ from "underscore";
import { main } from "../../js/main";
import { setting } from "../../js/setting";
import { myServicee } from "../../services/my-service";
@Component({
  tag: "parallel-coordinates",
  styleUrl: "parallel-coordinates.css",
  shadow: true,
})
export class ParallelCoordinates implements ComponentInterface {
  @Prop()
  singleData: string;
  @Prop()
  completeData: Array<Object>;
  @Element() element: HTMLElement;
  @State() isSearchExpanded: boolean = false;
  @State() isSettingExpanded: boolean = true;
  yscale: any = {};
  mains = main();
  settings = setting();

  @Event() brushCompleted: EventEmitter<Array<Object>>;
  brushCompletedHandler(todo) {
    this.brushCompleted.emit(todo);
  }

  @Watch("completeData")
  watchCompleteData() {
    let elementsObj = myServicee.setCanvusElements(this.element);
    d3.selectAll(
      elementsObj.element.shadowRoot.querySelectorAll("svg g")
    ).remove();

    if (this.completeData != undefined) {
      let serviceFullList_withExtra = this.settings.getServiceFLE();
      this.mains.initFunc(
        this.completeData,
        serviceFullList_withExtra,
        elementsObj,
        this.brushCompleted
      );
      // this.brushCompletedHandler("Amith");
    }
  }

  componentDidLoad() {
    debugger;
    console.log(this.completeData);
    let elementsObj = myServicee.setCanvusElements(this.element);
    if (this.completeData != undefined) {
      let serviceFullList_withExtra = this.settings.getServiceFLE();
      this.mains.initFunc(
        this.completeData,
        serviceFullList_withExtra,
        elementsObj
      );
    }
    // let fulldata = this;
    // d3.csv("./data/sampleData.csv").then(function (data) {
    //   data = data.slice(0, 66);
    //   data.forEach((d) => {
    //     d.Time = new Date(
    //       d3.timeFormat("%a %b %d %X CDT %Y")(
    //         new Date(+d.Time ? +d.Time : d.Time.replace("Z", ""))
    //       )
    //     );
    //     for (const property in d) {
    //       if (
    //         property != "Time" &&
    //         property != "compute" &&
    //         property != "group" &&
    //         property != "id" &&
    //         property != "name" &&
    //         property != "rack"
    //       )
    //         d[property] = JSON.parse(d[property]);
    //     }
    //   });
    //   fulldata.completedata = data;
    // });
  }
  // componentWillLoad() {
  //   debugger;
  //   this.watchCompleteData();
  // }
  render() {
    return (
      <Host>
        <div class="main-body">
        <div class="w-100 top-bar text-right header">
          <button title="Remove selected data" id="exclude-data" disabled class="header-exclude-btn">
            Exclude
          </button>
          <strong id="rendered-count"></strong>/
          <strong id="selected-count"></strong>
          <div class="fillbar">
            <div id="selected-bar">
              <div id="rendered-bar">&nbsp;</div>
            </div>
          </div>
          Lines at <strong id="opacity"></strong> opacity.
          <label> Show: </label>
          <select id="overlayPlot">
            <option value="none">None</option>
            <option value="tick" selected>
              ticks
            </option>
            <option value="violin">Violin plots</option>
            <option value="violin+tick">Violin plots + ticks</option>
          </select>
        </div>
        <div class="w-100 main">
        <div class='main-left-panel' id='main-left-panel'>
        <ul id="leftpanel" class="collapsible">
        <li class="searchPanel">
          <div class="w-100">
            <div class="collapsible-header search-wrapper focused">
                <input type="text" id="search" placeholder="Search host e.g compute-1-1"  onClick={() =>
                    (this.isSearchExpanded = !this.isSearchExpanded)
                  }></input>
                <i class="material-icons" >search</i>
            </div>
            <div class="collapsible-body" style={{ display: this.isSearchExpanded ? "block" : "none" }}>
                    <ul id="compute-list">
                    </ul>
            </div>
          </div>
        </li>
          <li class="active">
          <div
                class="collapsible-header"
                onClick={() => {
                  this.isSettingExpanded = !this.isSettingExpanded;
                }}
              >
                <i class="material-icons">settings</i> Setting
              </div>
              <div
                class="collapsible-body"
                style={{ display: this.isSettingExpanded ? "block" : "none" }}
              >
          
              <table
                class="table table-striped table-hover row s12"
                id="axisSetting"
              >
                <thead class="thead-dark">
                  <tr>
                    <th></th>
                    <th>Color by</th>
                    <th>Metric</th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            </div>
          </li>
          
            
            
          
          </ul>
          </div>

          <div class="main-right-panel" id="main-right-panel" >
          <div class="w-70" id="Maincontent">
            <div id="chart">
              <canvas id="background"></canvas>
              <canvas id="foreground"></canvas>
              <canvas id="highlight"></canvas>
              <svg width="900" height="300"></svg>
            </div>
          </div>
          </div>
        </div>
        </div>
      </Host>
    );
  }
}
