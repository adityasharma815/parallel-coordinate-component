class myService {
  elementsObject;
  setCanvusElements(element) {
    this.elementsObject = {
      foreground: element.shadowRoot.querySelectorAll("#foreground")[0],
      highlighted: element.shadowRoot.querySelectorAll("#highlight")[0],
      background: element.shadowRoot.querySelectorAll("#background")[0],
      chart: element.shadowRoot.querySelectorAll("#chart")[0],
      overlayPlot: element.shadowRoot.querySelectorAll("#overlayPlot")[0],
      dimPlotHold: element.shadowRoot.querySelectorAll(
        ".dimension .plotHolder"
      )[0],
      element: element,
    };
    return this.elementsObject;
  }
  getCanvusElements() {
    return this.elementsObject;
  }
}
export const myServicee = new myService();
