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
      let csvObj = {
        id: "csvEmploymentRate",
        name: "US employment rate data - percentage",
        url: "./data/sampleData.csv",
        description: "",
        date: "1 Jan 1999",
        group: "sample",
        separate: "-",
        formatType: "csv",
      };
      this.mains.readFilecsv(
        this.completeData,
        "-",
        csvObj
      );
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
  }
    render() {
    return (
      <Host>
        <div class="main-body">
        <div class="w-100 top-bar text-right header">
          <div class="header-left">
            <button title="Remove selected data" id="exclude-data" disabled class="header-exclude-btn">
              Exclude
            </button>
          </div>
          <div class="header-right">
            <div>
              <strong id="rendered-count"></strong>/
              <strong id="selected-count"></strong>
            </div>
            <div class="fillbar">
              <div id="selected-bar">
                <div id="rendered-bar">&nbsp;</div>
              </div>
            </div>
            <div>
            Lines at <strong id="opacity"></strong> opacity.
            </div>
            <div class="overlayPlot">
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
          </div>
        </div>
        <div class="w-100 main">
        <div class='main-left-panel' id='main-left-panel'>
        <ul id="leftpanel" class="collapsible">
        <li class="searchPanel">
          
            <div class="collapsible-header"
                onClick={() => {
                  this.isSearchExpanded = !this.isSearchExpanded;
                }}>
              <i class="material-icons" >source</i> Sample Source
            </div>
            <div class="collapsible-body " style={{ display: this.isSearchExpanded ? "block" : "none" }}>
              
              <input type="text" id="search" placeholder="Search Sample Source" 
               ><span class="material-icons" >search</span></input>
                
                <ul id="compute-list">
                </ul>
            </div>
          
        </li>
          <li class="active">
          <div
                class="collapsible-header"
                onClick={() => {
                  this.isSettingExpanded = !this.isSettingExpanded;
                }}
              >
                <i class="material-icons">settings</i> Visual Controls
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
