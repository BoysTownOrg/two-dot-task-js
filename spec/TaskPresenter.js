import { TaskPresenter } from "../lib/TaskPresenter.js";

class TaskViewStub {
  constructor() {
    this.firstDotColoredRed_ = false;
    this.firstDotColoredBlack_ = false;
    this.secondDotColoredRed_ = false;
    this.secondDotColoredBlack_ = false;
    this.continueButtonShown_ = false;
  }

  firstDotColoredRed() {
    return this.firstDotColoredRed_;
  }

  firstDotColoredBlack() {
    return this.firstDotColoredBlack_;
  }

  secondDotColoredRed() {
    return this.secondDotColoredRed_;
  }

  secondDotColoredBlack() {
    return this.secondDotColoredBlack_;
  }

  colorFirstDotRed() {
    this.firstDotColoredRed_ = true;
  }

  colorFirstDotBlack() {
    this.firstDotColoredBlack_ = true;
  }

  colorSecondDotRed() {
    this.secondDotColoredRed_ = true;
  }

  colorSecondDotBlack() {
    this.secondDotColoredBlack_ = true;
  }

  continueButtonShown() {
    return this.continueButtonShown_;
  }

  showContinueButton() {
    this.continueButtonShown_ = true;
  }

  finishedResult() {
    return this.finishedResult_;
  }

  finish(result) {
    this.finishedResult_ = result;
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

  it("should color second dot red when second choice starts playing", function () {
    this.presenter.notifyThatSecondChoiceHasStartedPlaying();
    expect(this.view.secondDotColoredRed()).toBeTrue();
  });

  it("should color second dot black when second choice stops playing", function () {
    this.presenter.notifyThatSecondChoiceHasStoppedPlaying();
    expect(this.view.secondDotColoredBlack()).toBeTrue();
  });

  it("should show continue button when task is ready to end", function () {
    this.presenter.notifyThatTaskIsReadyToEnd();
    expect(this.view.continueButtonShown()).toBeTrue();
  });

  it("should submit result when task finishes", function () {
    this.presenter.notifyThatTaskIsFinished({ choice: "second" });
    expect(this.view.finishedResult()).toEqual({ choice: "second" });
  });

  it("should color both dots black when stimulus playback ends", function () {
    this.presenter.notifyThatStimulusPlaybackHasEnded();
    expect(this.view.firstDotColoredBlack()).toBeTrue();
    expect(this.view.secondDotColoredBlack()).toBeTrue();
  });
});
