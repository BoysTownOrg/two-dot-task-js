export const Choice = Object.freeze({
  first: 1,
  second: 2,
});

const State = Object.freeze({
  waitingForFirstChoiceToStart: 1,
  waitingForFirstChoiceToStop: 2,
  waitingForSecondChoiceToStart: 3,
  waitingForSecondChoiceToStop: 4,
  done: 5,
});

function observeAndAdvanceStateWhenAudioPlaybackReachesChoiceOnsetTime(
  model,
  choice,
  observe,
  nextState
) {
  if (
    model.audioPlayer.currentTimeSeconds() >=
    model.choiceTimesSeconds.get(choice).onset
  ) {
    observe(model.observer);
    model.state = nextState;
  }
}

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
        observeAndAdvanceStateWhenAudioPlaybackReachesChoiceOnsetTime(
          this,
          Choice.first,
          (observer) => {
            observer.notifyThatFirstChoiceHasStartedPlaying();
          },
          State.waitingForFirstChoiceToStop
        );
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
        observeAndAdvanceStateWhenAudioPlaybackReachesChoiceOnsetTime(
          this,
          Choice.second,
          (observer) => {
            observer.notifyThatSecondChoiceHasStartedPlaying();
          },
          State.waitingForSecondChoiceToStop
        );
      // Falls through
      case State.waitingForSecondChoiceToStop:
        if (
          this.audioPlayer.currentTimeSeconds() >=
          this.choiceTimesSeconds.get(Choice.second).offset
        ) {
          this.observer.notifyThatSecondChoiceHasStoppedPlaying();
          this.state = State.done;
        }
      // Falls through
      default:
    }
  }
}
