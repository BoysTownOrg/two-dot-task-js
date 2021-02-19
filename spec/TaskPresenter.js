import { TaskPresenter } from "../lib/TaskPresenter.js";

class TaskViewStub {
  constructor() {
    this.firstDotColoredRed_ = false;
    this.firstDotColoredBlack_ = false;
  }

  firstDotColoredRed() {
    return this.firstDotColoredRed_;
  }

  firstDotColoredBlack() {
    return this.firstDotColoredBlack_;
  }

  colorFirstDotRed() {
    this.firstDotColoredRed_ = true;
  }

  colorFirstDotBlack() {
    this.firstDotColoredBlack_ = true;
  }
}

describe("TaskPresenter", () => {
  it("should color first dot red when first choice starts playing", function () {
    const view = new TaskViewStub();
    const presenter = new TaskPresenter(view);
    presenter.notifyThatFirstChoiceHasStartedPlaying();
    expect(view.firstDotColoredRed()).toBeTrue();
  });

  it("should color first dot black when first choice stops playing", function () {
    const view = new TaskViewStub();
    const presenter = new TaskPresenter(view);
    presenter.notifyThatFirstChoiceHasStoppedPlaying();
    expect(view.firstDotColoredBlack()).toBeTrue();
  });
});
