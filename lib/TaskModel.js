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
  nextState,
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
  nextState,
) {
  if (
    model.audioPlayer.currentTimeSeconds() >=
    model.choiceTimesSeconds.get(choice).offset
  ) {
    observe(model.observer);
    model.state = nextState;
  }
}

function onPlaybackTimeUpdate(model) {
  switch (model.state) {
    case State.waitingForFirstChoiceToStart:
      observeAndAdvanceStateWhenAudioPlaybackReachesChoiceOnsetTime(
        model,
        Choice.first,
        (observer) => {
          observer.notifyThatFirstChoiceHasStartedPlaying();
        },
        State.waitingForFirstChoiceToStop,
      );
    // Falls through
    case State.waitingForFirstChoiceToStop:
      observeAndAdvanceStateWhenAudioPlaybackReachesChoiceOffsetTime(
        model,
        Choice.first,
        (observer) => {
          observer.notifyThatFirstChoiceHasStoppedPlaying();
        },
        State.waitingForSecondChoiceToStart,
      );
    // Falls through
    case State.waitingForSecondChoiceToStart:
      observeAndAdvanceStateWhenAudioPlaybackReachesChoiceOnsetTime(
        model,
        Choice.second,
        (observer) => {
          observer.notifyThatSecondChoiceHasStartedPlaying();
        },
        State.waitingForSecondChoiceToStop,
      );
    // Falls through
    case State.waitingForSecondChoiceToStop:
      observeAndAdvanceStateWhenAudioPlaybackReachesChoiceOffsetTime(
        model,
        Choice.second,
        (observer) => {
          observer.notifyThatSecondChoiceHasStoppedPlaying();
        },
        State.done,
      );
    // Falls through
    default:
  }
}

function onSubmit(model, submission, onAccept) {
  if (model.stimulusPlaybackHasEnded && !model.submissionAccepted) {
    model.result.choice = choiceName(submission.choice);
    model.result.word = model.words.get(submission.choice);
    model.result.correct =
      model.words.get(submission.choice) === model.correctWord ? "yes" : "no";
    if (submission.choice === Choice.first)
      model.observer.notifyThatFirstChoiceIsSelected();
    else if (submission.choice === Choice.second)
      model.observer.notifyThatSecondChoiceIsSelected();
    model.submissionAccepted = true;
    onAccept(model);
  }
}

class TaskModel {
  constructor(
    audioPlayer,
    observer,
    choiceTimesSeconds,
    words,
    correctWord,
    onAccept,
    afterFeedback,
  ) {
    this.audioPlayer = audioPlayer;
    this.observer = observer;
    this.choiceTimesSeconds = choiceTimesSeconds;
    this.audioPlayer.attach(this);
    this.stimulusPlaybackHasEnded = false;
    this.submissionAccepted = false;
    this.state = State.waitingForFirstChoiceToStart;
    this.result = {};
    this.words = words;
    this.correctWord = correctWord;
    this.onAccept = onAccept;
    this.afterFeedback = afterFeedback;
  }

  start() {
    this.audioPlayer.playStimulus();
  }

  submit(submission) {
    onSubmit(this, submission, this.onAccept);
  }

  finish() {
    this.afterFeedback(this);
  }

  notifyThatPlaybackHasEnded() {
    this.stimulusPlaybackHasEnded = true;
    this.observer.notifyThatStimulusPlaybackHasEnded();
  }

  notifyThatFeedbackHasEnded() {
    this.observer.notifyThatTaskIsFinished(this.result);
  }

  notifyThatPlaybackTimeHasUpdated() {
    onPlaybackTimeUpdate(this);
  }
}

export function createTaskModel(
  audioPlayer,
  observer,
  choiceTimesSeconds,
  words,
  correctWord,
) {
  return new TaskModel(
    audioPlayer,
    observer,
    choiceTimesSeconds,
    words,
    correctWord,
    (model) => model.audioPlayer.playFeedback(),
    (model) => model.observer.notifyThatTaskIsFinished(model.result),
  );
}

export function createTaskModelWithoutFeedback(
  audioPlayer,
  observer,
  choiceTimesSeconds,
  words,
  correctWord,
) {
  return new TaskModel(
    audioPlayer,
    observer,
    choiceTimesSeconds,
    words,
    correctWord,
    (model) => model.observer.notifyThatTaskIsFinished(model.result),
    (model) => {},
  );
}

export function createTaskModelWithDelayedFeedback(
  audioPlayer,
  observer,
  choiceTimesSeconds,
  words,
  correctWord,
  delaySeconds,
) {
  return new TaskModel(
    audioPlayer,
    observer,
    choiceTimesSeconds,
    words,
    correctWord,
    (model) => model.audioPlayer.playFeedbackAfterSeconds(delaySeconds),
    (model) => model.observer.notifyThatTaskIsFinished(model.result),
  );
}
