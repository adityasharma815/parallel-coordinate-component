import { Component, Prop, h, Watch, Listen, Element } from "@stencil/core";
import * as d3 from "d3";
import { setting } from "../../js/setting";

@Component({
  tag: 'layout-component',
  styleUrl: 'my-component.css',
  shadow: true
})
export class LayoutComponent {
  /***
   * Data url to fetch the csv file from.
   * Should be relative to where the component is placed.
   */
  @Prop()
  dataUrl;


  @Prop() selectedRange: Array<Object>;

  allData: Array<Object>;

  @Element() element: HTMLElement;

  parallCoords: any = this.element.shadowRoot.querySelectorAll(
    "parallel-coordinates"
  )[0];

  setting = setting();
  /**
   * 
   * @param event Listen change in value from the parallel coordinate component
   */
  @Listen("brushCompleted")
  brushCompletedHandler(event: CustomEvent<Array<Object>>) {
    debugger;
    console.log("Received the custom todoCompleted event: ", event.detail);
  }

  @Watch("selectedRange")
  watchHandler(newValue) {
    console.log(newValue);
  }

  componentDidLoad() {
    let myComp: any = this;
    let separate = '|';
    
    d3.csv(this.dataUrl).then((data) => {
//      this.setting.newdatatoFormat_noSuggestion(data, separate);
      
      data = data.slice(0, 66);

      data.forEach((d) => {
        console.log("Data each element : ",d)
        d.Time = new Date(
          d3.timeFormat("%a %b %d %X CDT %Y")(
            new Date(+d.Time ? +d.Time : d.Time.replace("Z", ""))
          )
        );
        for (const property in d) {
          if (
            property != "Time" &&
            property != "compute" &&
            property != "group" &&
            property != "id" &&
            property != "name" &&
            property != "rack"
          )
            d[property] = JSON.parse(d[property]);
        }
        // let cmp = document.querySelector("parallel-coordinates");
        // cmp.completeData = data;
      });
      let cmp = myComp.element.shadowRoot.querySelectorAll(
        "parallel-coordinates"
      )[0];

      cmp.completeData = data;
    });
  }
  componentWillLoad() {
    this.watchHandler(this.selectedRange);
  }

  render() {

    return 	<div class="main-component">
		{/* <div class="header">
			Main Header
      <button class="theme-button"> Theme</button>
		</div>
		<div class="main">
			<div class='main-left-panel' id='main-left-panel'>
        <left-panel ></left-panel>
			</div>
			<div class="main-right-panel" id="main-right-panel" >
        <parallel-coordinates complete-data="[]"></parallel-coordinates>
			</div>
		</div> */}
    <parallel-coordinates complete-data="[]"></parallel-coordinates>
	</div>;
  }
}
