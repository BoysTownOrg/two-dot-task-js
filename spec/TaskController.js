import { TaskController } from "../lib/TaskController.js";
import { Choice } from "../lib/TaskModel.js";

class TaskControlStub {
  touchFirstDot() {
    this.observer.notifyThatFirstDotHasBeenTouched();
  }

  touchSecondDot() {
    this.observer.notifyThatSecondDotHasBeenTouched();
  }

  touchContinueButton() {
    this.observer.notifyThatContinueButtonHasBeenTouched();
  }

  attach(observer) {
    this.observer = observer;
  }
}

class TaskModelStub {
  constructor() {
    this.finished_ = false;
  }

  submission() {
    return this.submission_;
  }

  submit(submission_) {
    this.submission_ = submission_;
  }

  finished() {
    return this.finished_;
  }

  finish() {
    this.finished_ = true;
  }
}

describe("TaskController", () => {
  beforeEach(function () {
    this.control = new TaskControlStub();
    this.model = new TaskModelStub();
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

  it("should finish task when continue button is touched", function () {
    this.control.touchContinueButton();
    expect(this.model.finished()).toBe(true);
  });
});
