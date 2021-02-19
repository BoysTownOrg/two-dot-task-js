import { TaskModel, Choice } from "../lib/TaskModel.js";

class AudioPlayerStub {
  constructor() {
    this.feedbackPlayed_ = false;
  }

  feedbackPlayed() {
    return this.feedbackPlayed_;
  }

  playFeedback() {
    this.feedbackPlayed_ = true;
  }

  endStimulusPlayback() {
    this.observer.notifyThatStimulusPlaybackHasEnded();
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
}

class TaskModelObserverStub {
  constructor() {
    this.notifiedThatFirstChoiceHasStartedPlaying_ = false;
  }

  notifiedThatFirstChoiceHasStartedPlaying() {
    return this.notifiedThatFirstChoiceHasStartedPlaying_;
  }

  notifyThatFirstChoiceHasStartedPlaying() {
    this.notifiedThatFirstChoiceHasStartedPlaying_ = true;
  }
}

describe("TaskModel", () => {
  beforeEach(function () {
    this.audioPlayer = new AudioPlayerStub();
    this.observer = new TaskModelObserverStub();
    this.model = new TaskModel(this.audioPlayer, this.observer, 0.12);
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
});
