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
}

describe("TaskModel", () => {
  beforeEach(function () {
    this.audioPlayer = new AudioPlayerStub();
    this.model = new TaskModel(this.audioPlayer);
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
});
