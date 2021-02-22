import { TaskModel, Choice } from "../lib/TaskModel.js";

class AudioPlayerStub {
  constructor() {
    this.feedbackPlayed_ = false;
    this.timesFeedbackPlayed_ = 0;
  }

  feedbackPlayed() {
    return this.feedbackPlayed_;
  }

  playFeedback() {
    this.feedbackPlayed_ = true;
    this.timesFeedbackPlayed_ += 1;
  }

  endStimulusPlayback() {
    this.observer.notifyThatPlaybackHasEnded();
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
}

class TaskModelObserverStub {
  constructor() {
    this.notifiedThatFirstChoiceHasStartedPlaying_ = false;
    this.notifiedThatFirstChoiceHasStoppedPlaying_ = false;
    this.notifiedThatSecondChoiceHasStartedPlaying_ = false;
    this.notifiedThatSecondChoiceHasStoppedPlaying_ = false;
    this.timesNotifiedThatFirstChoiceHasStartedPlaying_ = 0;
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
}

describe("TaskModel", () => {
  beforeEach(function () {
    this.audioPlayer = new AudioPlayerStub();
    this.observer = new TaskModelObserverStub();
    this.model = new TaskModel(
      this.audioPlayer,
      this.observer,
      new Map([
        [Choice.first, { onset: 0.12, offset: 0.34 }],
        [Choice.second, { onset: 0.56, offset: 0.78 }],
      ])
    );
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
});
