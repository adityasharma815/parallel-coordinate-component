import { Component, Event, EventEmitter } from "@stencil/core";

// export const parallelCoords = new ParallelCoordinates();
@Component({
  tag: "sec-component",
  shadow: true,
})
export class SecComponent {
  @Event({
    eventName: "todoCompleted",
    composed: true,
    cancelable: true,
    bubbles: true,
  })
  todoCompleted: EventEmitter<Array<Object>>;

  todoCompletedHandler(name) {
    this.todoCompleted.emit(name);
  }
}
