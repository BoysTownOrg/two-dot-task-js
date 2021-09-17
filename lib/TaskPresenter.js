function showCursorAfter(presenter, f) {
  f(presenter.view);
  presenter.view.showCursor();
}

export class TaskPresenter {
  constructor(view) {
    this.view = view;
    this.view.hideCursor();
  }

  notifyThatFirstChoiceHasStartedPlaying() {
    this.view.colorFirstDotRed();
  }

  notifyThatFirstChoiceHasStoppedPlaying() {
    this.view.colorFirstDotBlack();
  }

  notifyThatSecondChoiceHasStartedPlaying() {
    this.view.colorSecondDotRed();
  }

  notifyThatSecondChoiceHasStoppedPlaying() {
    this.view.colorSecondDotBlack();
  }

  notifyThatFirstChoiceIsSelected() {
    showCursorAfter(this, (view) => view.colorFirstDotBlue());
  }

  notifyThatSecondChoiceIsSelected() {
    showCursorAfter(this, (view) => view.colorSecondDotBlue());
  }

  notifyThatTaskIsReadyToEnd() {
    this.view.showContinueButton();
  }

  notifyThatTaskIsFinished(result) {
    this.view.finish(result);
  }

  notifyThatStimulusPlaybackHasEnded() {
    this.view.colorFirstDotBlack();
    this.view.colorSecondDotBlack();
  }
}
