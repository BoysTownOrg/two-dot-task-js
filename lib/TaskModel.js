export const Choice = Object.freeze({
  first: 1,
  second: 2,
});

function choiceName(choice) {
  switch (choice) {
    case Choice.first:
      return "first";
    case Choice.second:
      return "second";
    default:
      return "?";
  }
}

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

function observeAndAdvanceStateWhenAudioPlaybackReachesChoiceOffsetTime(
  model,
  choice,
  observe,
  nextState
) {
  if (
    model.audioPlayer.currentTimeSeconds() >=
    model.choiceTimesSeconds.get(choice).offset
  ) {
    observe(model.observer);
    model.state = nextState;
  }
}

export class TaskModel {
  constructor(audioPlayer, observer, choiceTimesSeconds, words, correctWord) {
    this.audioPlayer = audioPlayer;
    this.observer = observer;
    this.choiceTimesSeconds = choiceTimesSeconds;
    this.audioPlayer.attach(this);
    this.stimulusPlaybackHasEnded = false;
    this.feedbackHasBeenPlayed = false;
    this.state = State.waitingForFirstChoiceToStart;
    this.result = {};
    this.words = words;
    this.correctWord = correctWord;
  }

  start() {
    this.audioPlayer.playStimulus();
  }

  submit(submission) {
    if (this.stimulusPlaybackHasEnded && !this.feedbackHasBeenPlayed) {
      this.audioPlayer.playFeedback();
      this.feedbackHasBeenPlayed = true;
      this.result.choice = choiceName(submission.choice);
      this.result.word = this.words.get(submission.choice);
      this.result.correct =
        this.words.get(submission.choice) === this.correctWord ? "yes" : "no";
    }
  }

  finish() {
    this.observer.notifyThatTaskIsFinished(this.result);
  }

  notifyThatPlaybackHasEnded() {
    this.stimulusPlaybackHasEnded = true;
  }

  notifyThatFeedbackHasEnded() {
    this.observer.notifyThatTaskIsReadyToEnd();
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
        observeAndAdvanceStateWhenAudioPlaybackReachesChoiceOffsetTime(
          this,
          Choice.first,
          (observer) => {
            observer.notifyThatFirstChoiceHasStoppedPlaying();
          },
          State.waitingForSecondChoiceToStart
        );
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
        observeAndAdvanceStateWhenAudioPlaybackReachesChoiceOffsetTime(
          this,
          Choice.second,
          (observer) => {
            observer.notifyThatSecondChoiceHasStoppedPlaying();
          },
          State.done
        );
      // Falls through
      default:
    }
  }
}
