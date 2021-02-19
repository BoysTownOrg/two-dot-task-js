export class TaskPresenter {
  constructor(view) {
    this.view = view;
  }

  notifyThatFirstChoiceHasStartedPlaying() {
    this.view.colorFirstDotRed();
  }

  notifyThatFirstChoiceHasStoppedPlaying() {
    this.view.colorFirstDotBlack();
  }

  notifyThatSecondChoiceHasStartedPlaying() {}

  notifyThatSecondChoiceHasStoppedPlaying() {}
}
