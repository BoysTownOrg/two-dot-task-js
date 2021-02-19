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
  it("should play feedback after choice is submitted and stimulus has finished", function () {
    const audioPlayer = new AudioPlayerStub();
    const model = new TaskModel(audioPlayer);
    audioPlayer.endStimulusPlayback();
    model.submit({ choice: Choice.first });
    expect(audioPlayer.feedbackPlayed()).toBeTrue();
  });

  it("should not play feedback after choice is submitted when stimulus has not finished", function () {
    const audioPlayer = new AudioPlayerStub();
    const model = new TaskModel(audioPlayer);
    model.submit({ choice: Choice.first });
    expect(audioPlayer.feedbackPlayed()).toBeFalse();
  });
});
