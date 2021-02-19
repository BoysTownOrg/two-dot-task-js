export const Choice = Object.freeze({
  first: 1,
  second: 2,
});

export class TaskModel {
  constructor(audioPlayer, observer, firstChoiceOnsetTimeSeconds) {
    this.audioPlayer = audioPlayer;
    this.observer = observer;
    this.audioPlayer.attach(this);
    this.stimulusPlaybackHasEnded_ = false;
  }

  submit(submission) {
    if (this.stimulusPlaybackHasEnded_) this.audioPlayer.playFeedback();
  }

  notifyThatStimulusPlaybackHasEnded() {
    this.stimulusPlaybackHasEnded_ = true;
  }

  notifyThatPlaybackTimeHasUpdated() {
    this.observer.notifyThatFirstChoiceHasStartedPlaying();
  }
}
