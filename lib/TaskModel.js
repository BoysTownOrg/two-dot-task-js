export const Choice = Object.freeze({
  first: 1,
  second: 2,
});

export class TaskModel {
  constructor(audioPlayer, observer, choiceTimesSeconds) {
    this.audioPlayer = audioPlayer;
    this.observer = observer;
    this.choiceTimesSeconds = choiceTimesSeconds;
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
    if (
      this.audioPlayer.currentTimeSeconds() >=
      this.choiceTimesSeconds.get(Choice.first).onset
    )
      this.observer.notifyThatFirstChoiceHasStartedPlaying();
    if (
      this.audioPlayer.currentTimeSeconds() >=
      this.choiceTimesSeconds.get(Choice.first).offset
    )
      this.observer.notifyThatFirstChoiceHasStoppedPlaying();
  }
}
