export const Choice = Object.freeze({
  first: 1,
  second: 2,
});

const State = Object.freeze({
  waitingForFirstChoiceToStart: 1,
  waitingForFirstChoiceToStop: 2,
  waitingForSecondChoiceToStart: 3,
  waitingForSecondChoiceToStop: 4,
});

export class TaskModel {
  constructor(audioPlayer, observer, choiceTimesSeconds) {
    this.audioPlayer = audioPlayer;
    this.observer = observer;
    this.choiceTimesSeconds = choiceTimesSeconds;
    this.audioPlayer.attach(this);
    this.stimulusPlaybackHasEnded_ = false;
    this.state = State.waitingForFirstChoiceToStart;
  }

  submit(submission) {
    if (this.stimulusPlaybackHasEnded_) this.audioPlayer.playFeedback();
  }

  notifyThatStimulusPlaybackHasEnded() {
    this.stimulusPlaybackHasEnded_ = true;
  }

  notifyThatPlaybackTimeHasUpdated() {
    switch (this.state) {
      case State.waitingForFirstChoiceToStart:
        if (
          this.audioPlayer.currentTimeSeconds() >=
          this.choiceTimesSeconds.get(Choice.first).onset
        ) {
          this.observer.notifyThatFirstChoiceHasStartedPlaying();
          this.state = State.waitingForFirstChoiceToStop;
        }
      // Falls through
      case State.waitingForFirstChoiceToStop:
        if (
          this.audioPlayer.currentTimeSeconds() >=
          this.choiceTimesSeconds.get(Choice.first).offset
        ) {
          this.observer.notifyThatFirstChoiceHasStoppedPlaying();
          this.state = State.waitingForSecondChoiceToStart;
        }
      // Falls through
      case State.waitingForSecondChoiceToStart:
        if (
          this.audioPlayer.currentTimeSeconds() >=
          this.choiceTimesSeconds.get(Choice.second).onset
        ) {
          this.observer.notifyThatSecondChoiceHasStartedPlaying();
          this.state = State.waitingForSecondChoiceToStop;
        }
      // Falls through
      case State.waitingForSecondChoiceToStop:
      default:
        break;
    }
  }
}
