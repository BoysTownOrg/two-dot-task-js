export class TaskPresenter {
  constructor(view) {
    this.view = view;
  }

  notifyThatFirstChoiceHasStartedPlaying() {
    this.view.colorFirstDotRed();
  }

  notifyThatFirstChoiceHasStoppedPlaying() {}

  notifyThatSecondChoiceHasStartedPlaying() {}

  notifyThatSecondChoiceHasStoppedPlaying() {}
}
