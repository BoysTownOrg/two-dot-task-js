import { TaskModel, Choice } from "../lib/TaskModel.js";

class AudioPlayerStub {
  feedbackPlayed() {
    return this.feedbackPlayed_;
  }

  playFeedback() {
    this.feedbackPlayed_ = true;
  }
}

describe("TaskModel", () => {
  it("should play feedback after choice is submitted", function () {
    const audioPlayer = new AudioPlayerStub();
    const model = new TaskModel(audioPlayer);
    model.submit({ choice: Choice.first });
    expect(audioPlayer.feedbackPlayed()).toBeTrue();
  });
});
