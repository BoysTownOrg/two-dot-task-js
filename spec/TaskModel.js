import {
  Choice,
  createTaskModel,
  createTaskModelWithDelayedFeedback,
  createTaskModelWithoutFeedback,
} from "../lib/TaskModel.js";

class AudioPlayerStub {
  constructor() {
    this.feedbackPlayed_ = false;
    this.stimulusPlayed_ = false;
    this.timesFeedbackPlayed_ = 0;
  }

  feedbackPlayed() {
    return this.feedbackPlayed_;
  }

  playFeedback() {
    this.feedbackPlayed_ = true;
    this.timesFeedbackPlayed_ += 1;
  }

  playFeedbackAfterSeconds(t) {
    this.feedbackPlayedAfterSeconds_ = t;
  }

  feedbackPlayedAfterSeconds() {
    return this.feedbackPlayedAfterSeconds_;
  }

  playStimulus() {
    this.stimulusPlayed_ = true;
  }

  endStimulusPlayback() {
    this.observer.notifyThatPlaybackHasEnded();
  }

  endFeedback() {
    this.observer.notifyThatFeedbackHasEnded();
  }

  attach(observer) {
    this.observer = observer;
  }

  setCurrentTimeSeconds(x) {
    this.currentTimeSeconds_ = x;
  }

  currentTimeSeconds() {
    return this.currentTimeSeconds_;
  }

  updateTime() {
    this.observer.notifyThatPlaybackTimeHasUpdated();
  }

  timesFeedbackPlayed() {
    return this.timesFeedbackPlayed_;
  }

  stimulusPlayed() {
    return this.stimulusPlayed_;
  }
}

class TaskModelObserverStub {
  constructor() {
    this.notifiedThatFirstChoiceHasStartedPlaying_ = false;
    this.notifiedThatFirstChoiceHasStoppedPlaying_ = false;
    this.notifiedThatSecondChoiceHasStartedPlaying_ = false;
    this.notifiedThatSecondChoiceHasStoppedPlaying_ = false;
    this.notifiedThatTaskIsReadyToEnd_ = false;
    this.notifiedThatStimulusPlaybackHasEnded_ = false;
    this.notifiedThatFirstChoiceIsSelected_ = false;
    this.notifiedThatSecondChoiceIsSelected_ = false;
    this.timesNotifiedThatFirstChoiceHasStartedPlaying_ = 0;
    this.timesNotifiedThatTaskIsReadyToEnd_ = 0;
  }

  notifiedThatFirstChoiceIsSelected() {
    return this.notifiedThatFirstChoiceIsSelected_;
  }

  notifyThatFirstChoiceIsSelected() {
    this.notifiedThatFirstChoiceIsSelected_ = true;
  }

  notifiedThatSecondChoiceIsSelected() {
    return this.notifiedThatSecondChoiceIsSelected_;
  }

  notifyThatSecondChoiceIsSelected() {
    this.notifiedThatSecondChoiceIsSelected_ = true;
  }

  notifyThatStimulusPlaybackHasEnded() {
    this.notifiedThatStimulusPlaybackHasEnded_ = true;
  }

  notifiedThatStimulusPlaybackHasEnded() {
    return this.notifiedThatStimulusPlaybackHasEnded_;
  }

  notifiedThatFirstChoiceHasStartedPlaying() {
    return this.notifiedThatFirstChoiceHasStartedPlaying_;
  }

  notifyThatFirstChoiceHasStartedPlaying() {
    this.notifiedThatFirstChoiceHasStartedPlaying_ = true;
    this.timesNotifiedThatFirstChoiceHasStartedPlaying_ += 1;
  }

  notifiedThatFirstChoiceHasStoppedPlaying() {
    return this.notifiedThatFirstChoiceHasStoppedPlaying_;
  }

  notifyThatFirstChoiceHasStoppedPlaying() {
    this.notifiedThatFirstChoiceHasStoppedPlaying_ = true;
  }

  timesNotifiedThatFirstChoiceHasStartedPlaying() {
    return this.timesNotifiedThatFirstChoiceHasStartedPlaying_;
  }

  notifiedThatSecondChoiceHasStartedPlaying() {
    return this.notifiedThatSecondChoiceHasStartedPlaying_;
  }

  notifyThatSecondChoiceHasStartedPlaying() {
    this.notifiedThatSecondChoiceHasStartedPlaying_ = true;
  }

  notifiedThatSecondChoiceHasStoppedPlaying() {
    return this.notifiedThatSecondChoiceHasStoppedPlaying_;
  }

  notifyThatSecondChoiceHasStoppedPlaying() {
    this.notifiedThatSecondChoiceHasStoppedPlaying_ = true;
  }

  notifyThatTaskIsFinished(result) {
    this.result_ = result;
  }

  notifiedThatTaskIsReadyToEnd() {
    return this.notifiedThatTaskIsReadyToEnd_;
  }

  timesNotifiedThatTaskIsReadyToEnd() {
    return this.timesNotifiedThatTaskIsReadyToEnd_;
  }

  notifyThatTaskIsReadyToEnd() {
    this.timesNotifiedThatTaskIsReadyToEnd_ += 1;
    this.notifiedThatTaskIsReadyToEnd_ = true;
  }

  result() {
    return this.result_;
  }
}

describe("TaskModel", () => {
  beforeEach(function () {
    this.audioPlayer = new AudioPlayerStub();
    this.observer = new TaskModelObserverStub();
    this.model = createTaskModel(
      this.audioPlayer,
      this.observer,
      new Map([
        [Choice.first, { onset: 0.12, offset: 0.34 }],
        [Choice.second, { onset: 0.56, offset: 0.78 }],
      ]),
      new Map([
        [Choice.first, "foo"],
        [Choice.second, "bar"],
      ]),
      "bar"
    );
  });

  it("should play stimulus on start", function () {
    this.model.start();
    expect(this.audioPlayer.stimulusPlayed()).toBeTrue();
  });

  it("should play feedback after choice is submitted and stimulus has finished", function () {
    this.audioPlayer.endStimulusPlayback();
    this.model.submit({ choice: Choice.first });
    expect(this.audioPlayer.feedbackPlayed()).toBeTrue();
  });

  it("should not play feedback after choice is submitted when stimulus has not finished", function () {
    this.model.submit({ choice: Choice.first });
    expect(this.audioPlayer.feedbackPlayed()).toBeFalse();
  });

  it("should not play feedback twice after choice is submitted when stimulus has finished", function () {
    this.audioPlayer.endStimulusPlayback();
    this.model.submit({ choice: Choice.first });
    this.model.submit({ choice: Choice.first });
    expect(this.audioPlayer.timesFeedbackPlayed()).toBe(1);
  });

  it("should notify that first choice has started playing when time", function () {
    this.audioPlayer.setCurrentTimeSeconds(0.13);
    this.audioPlayer.updateTime();
    expect(this.observer.notifiedThatFirstChoiceHasStartedPlaying()).toBeTrue();
  });

  it("should not notify that first choice has started playing when not time", function () {
    this.audioPlayer.setCurrentTimeSeconds(0.11);
    this.audioPlayer.updateTime();
    expect(
      this.observer.notifiedThatFirstChoiceHasStartedPlaying()
    ).toBeFalse();
  });

  it("should notify that first choice has stopped playing when time", function () {
    this.audioPlayer.setCurrentTimeSeconds(0.34);
    this.audioPlayer.updateTime();
    expect(this.observer.notifiedThatFirstChoiceHasStoppedPlaying()).toBeTrue();
  });

  it("should not notify that first choice has stopped playing when not time", function () {
    this.audioPlayer.setCurrentTimeSeconds(0.33);
    this.audioPlayer.updateTime();
    expect(
      this.observer.notifiedThatFirstChoiceHasStoppedPlaying()
    ).toBeFalse();
  });

  it("should not notify that first choice has started playing twice", function () {
    this.audioPlayer.setCurrentTimeSeconds(0.13);
    this.audioPlayer.updateTime();
    this.audioPlayer.updateTime();
    expect(
      this.observer.timesNotifiedThatFirstChoiceHasStartedPlaying()
    ).toEqual(1);
  });

  it("should notify that second choice has started playing when time", function () {
    this.audioPlayer.setCurrentTimeSeconds(0.57);
    this.audioPlayer.updateTime();
    expect(
      this.observer.notifiedThatSecondChoiceHasStartedPlaying()
    ).toBeTrue();
  });

  it("should not notify that second choice has started playing when not time", function () {
    this.audioPlayer.setCurrentTimeSeconds(0.55);
    this.audioPlayer.updateTime();
    expect(
      this.observer.notifiedThatSecondChoiceHasStartedPlaying()
    ).toBeFalse();
  });

  it("should notify that second choice has stopped playing when time", function () {
    this.audioPlayer.setCurrentTimeSeconds(0.78);
    this.audioPlayer.updateTime();
    expect(
      this.observer.notifiedThatSecondChoiceHasStoppedPlaying()
    ).toBeTrue();
  });

  it("should not notify that second choice has stopped playing when not time", function () {
    this.audioPlayer.setCurrentTimeSeconds(0.77);
    this.audioPlayer.updateTime();
    expect(
      this.observer.notifiedThatSecondChoiceHasStoppedPlaying()
    ).toBeFalse();
  });

  it("should notify task correct result after feedback ends", function () {
    this.audioPlayer.endStimulusPlayback();
    this.model.submit({ choice: Choice.second });
    this.audioPlayer.endFeedback();
    expect(this.observer.result()).toEqual({
      choice: "second",
      word: "bar",
      correct: "yes",
    });
  });

  it("should notify task result when finished", function () {
    this.audioPlayer.endStimulusPlayback();
    this.model.submit({ choice: Choice.first });
    this.model.finish();
    expect(this.observer.result()).toEqual({
      choice: "first",
      word: "foo",
      correct: "no",
    });
  });

  it("should notify task correct result when finished", function () {
    this.audioPlayer.endStimulusPlayback();
    this.model.submit({ choice: Choice.second });
    this.model.finish();
    expect(this.observer.result()).toEqual({
      choice: "second",
      word: "bar",
      correct: "yes",
    });
  });

  it("should notify that stimulus playback has ended", function () {
    this.audioPlayer.endStimulusPlayback();
    expect(this.observer.notifiedThatStimulusPlaybackHasEnded()).toBeTrue();
  });

  it("should notify first choice selected", function () {
    this.audioPlayer.endStimulusPlayback();
    this.model.submit({ choice: Choice.first });
    expect(this.observer.notifiedThatFirstChoiceIsSelected()).toBeTrue();
  });

  it("should notify second choice selected", function () {
    this.audioPlayer.endStimulusPlayback();
    this.model.submit({ choice: Choice.second });
    expect(this.observer.notifiedThatSecondChoiceIsSelected()).toBeTrue();
  });
});

describe("TaskModelWithoutFeedback", () => {
  beforeEach(function () {
    this.audioPlayer = new AudioPlayerStub();
    this.observer = new TaskModelObserverStub();
    this.model = createTaskModelWithoutFeedback(
      this.audioPlayer,
      this.observer,
      new Map([
        [Choice.first, { onset: 0.12, offset: 0.34 }],
        [Choice.second, { onset: 0.56, offset: 0.78 }],
      ]),
      new Map([
        [Choice.first, "foo"],
        [Choice.second, "bar"],
      ]),
      "bar"
    );
  });

  it("should notify task result on submit", function () {
    this.audioPlayer.endStimulusPlayback();
    this.model.submit({ choice: Choice.first });
    expect(this.observer.result()).toEqual({
      choice: "first",
      word: "foo",
      correct: "no",
    });
  });
});

describe("TaskModelWithDelayedFeedback", () => {
  it("should delay feedback after choice is submitted", () => {
    const audioPlayer = new AudioPlayerStub();
    const observer = new TaskModelObserverStub();
    const feedbackDelaySeconds = 1;
    const model = createTaskModelWithDelayedFeedback(
      audioPlayer,
      observer,
      new Map([
        [Choice.first, { onset: 0.12, offset: 0.34 }],
        [Choice.second, { onset: 0.56, offset: 0.78 }],
      ]),
      new Map([
        [Choice.first, "foo"],
        [Choice.second, "bar"],
      ]),
      "bar",
      feedbackDelaySeconds
    );
    audioPlayer.endStimulusPlayback();
    model.submit({ choice: Choice.first });
    expect(audioPlayer.feedbackPlayedAfterSeconds()).toEqual(1);
  });
});
