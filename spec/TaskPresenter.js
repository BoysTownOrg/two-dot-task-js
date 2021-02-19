import { TaskPresenter } from "../lib/TaskPresenter.js";

class TaskViewStub {
  constructor() {
    this.firstDotColoredRed_ = false;
  }

  firstDotColoredRed() {
    return this.firstDotColoredRed_;
  }

  colorFirstDotRed() {
    this.firstDotColoredRed_ = true;
  }
}

describe("TaskPresenter", () => {
  it("should color first dot red with first choice starts playing", function () {
    const view = new TaskViewStub();
    const presenter = new TaskPresenter(view);
    presenter.notifyThatFirstChoiceHasStartedPlaying();
    expect(view.firstDotColoredRed()).toBeTrue();
  });
});
