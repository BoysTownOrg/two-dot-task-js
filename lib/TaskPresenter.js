function showCursorAfter(presenter, f) {
  f(presenter.view);
  presenter.view.showCursor();
}

export class TaskPresenter {
  constructor(view, onFinished) {
    this.view = view;
    this.view.hideCursor();
    this.onFinished = onFinished;
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

  notifyThatTaskIsFinished(result) {
    this.onFinished(this, result);
  }

  notifyThatStimulusPlaybackHasEnded() {
    this.view.colorFirstDotBlack();
    this.view.colorSecondDotBlack();
  }
}

export function createTaskPresenter(view) {
  return new TaskPresenter(view, (presenter, result) =>
    presenter.view.finish(result),
  );
}

export function createTaskPresenterWithDelayedFinish(view, delaySeconds) {
  return new TaskPresenter(view, (presenter, result) =>
    presenter.view.finishWithDelaySeconds(result, delaySeconds),
  );
}

export function createTaskPresenterWithDeferredFinish(view) {
  return new TaskPresenter(view, (presenter, result) =>
    presenter.view.deferFinish(result),
  );
}
