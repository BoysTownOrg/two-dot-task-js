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
  beforeEach(function () {
    this.control = new TaskControlStub();
    this.model = new TaskModel();
    this.controller = new TaskController(this.control, this.model);
  });

  it("should submit first choice when first dot is touched", function () {
    this.control.touchFirstDot();
    expect(this.model.submission().choice).toBe(Choice.first);
  });

  it("should submit second choice when second dot is touched", function () {
    this.control.touchSecondDot();
    expect(this.model.submission().choice).toBe(Choice.second);
  });
});
