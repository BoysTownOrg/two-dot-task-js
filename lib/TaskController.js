import { Choice } from "./TaskModel.js";

export class TaskController {
  constructor(control, model) {
    control.attach(this);
    this.model = model;
  }

  notifyThatFirstDotHasBeenTouched() {
    this.model.submit({ choice: Choice.first });
  }
}
