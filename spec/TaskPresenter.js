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
  beforeEach(function () {
    this.view = new TaskViewStub();
    this.presenter = new TaskPresenter(this.view);
  });

  it("should color first dot red when first choice starts playing", function () {
    this.presenter.notifyThatFirstChoiceHasStartedPlaying();
    expect(this.view.firstDotColoredRed()).toBeTrue();
  });

  it("should color first dot black when first choice stops playing", function () {
    this.presenter.notifyThatFirstChoiceHasStoppedPlaying();
    expect(this.view.firstDotColoredBlack()).toBeTrue();
  });
});
