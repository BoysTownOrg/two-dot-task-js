import { TaskController } from "../lib/TaskController.js";
import { Choice } from "../lib/TaskModel.js";

class TaskControlStub {
  touchFirstDot() {
    this.observer.notifyThatFirstDotHasBeenTouched();
  }

  touchSecondDot() {
    this.observer.notifyThatSecondDotHasBeenTouched();
  }

  attach(observer) {
    this.observer = observer;
  }
}

class TaskModel {
  submission() {
    return this.submission_;
  }

  submit(submission_) {
    this.submission_ = submission_;
  }
}

describe("Controller", () => {
  it("should submit first choice when first dot is touched", function () {
    const control = new TaskControlStub();
    const model = new TaskModel();
    const controller = new TaskController(control, model);
    control.touchFirstDot();
    expect(model.submission().choice).toBe(Choice.first);
  });

  it("should submit second choice when second dot is touched", function () {
    const control = new TaskControlStub();
    const model = new TaskModel();
    const controller = new TaskController(control, model);
    control.touchSecondDot();
    expect(model.submission().choice).toBe(Choice.second);
  });
});
