import { runVisualRepetitionTrial } from "../lib/visual-repetition-trial.js";

class AudioPlayerStub {
  setCurrentTimeSeconds(s) {
    this.currentTimeSeconds_ = s;
  }

  currentTimeSeconds() {
    return this.currentTimeSeconds_;
  }

  attachTimeUpdateHandler(handler) {
    this.timeUpdateHandler = handler;
  }

  updateTime() {
    this.timeUpdateHandler();
  }
}

class ImagePresenterStub {
  constructor() {
    this.imageShown_ = false;
    this.imageShownCount_ = 0;
  }

  imageShown() {
    return this.imageShown_;
  }

  showImage() {
    this.imageShown_ = true;
    this.imageShownCount_ += 1;
  }

  imageShownCount() {
    return this.imageShownCount_;
  }
}

function updatePlayerTimeSeconds(player, t) {
  player.setCurrentTimeSeconds(t);
  player.updateTime();
}

describe("visual repetition trial", () => {
  it("should show image when player advances to image onset time", () => {
    const player = new AudioPlayerStub();
    const presenter = new ImagePresenterStub();
    const imageOnsetSeconds = 3;
    runVisualRepetitionTrial(player, presenter, imageOnsetSeconds);
    updatePlayerTimeSeconds(player, 1);
    expect(presenter.imageShown()).toBeFalse();
    updatePlayerTimeSeconds(player, 2);
    expect(presenter.imageShown()).toBeFalse();
    updatePlayerTimeSeconds(player, 2.5);
    expect(presenter.imageShown()).toBeFalse();
    updatePlayerTimeSeconds(player, 2.9);
    expect(presenter.imageShown()).toBeFalse();
    updatePlayerTimeSeconds(player, 3);
    expect(presenter.imageShown()).toBeTrue();
  });

  it("should only show image once", () => {
    const player = new AudioPlayerStub();
    const presenter = new ImagePresenterStub();
    const imageOnsetSeconds = 3;
    runVisualRepetitionTrial(player, presenter, imageOnsetSeconds);
    updatePlayerTimeSeconds(player, 2.9);
    expect(presenter.imageShownCount()).toBe(0);
    updatePlayerTimeSeconds(player, 3.1);
    expect(presenter.imageShownCount()).toBe(1);
    updatePlayerTimeSeconds(player, 3.2);
    expect(presenter.imageShownCount()).toBe(1);
  });

  it("should be able to run multiple trials", () => {
    const player = new AudioPlayerStub();
    const presenter = new ImagePresenterStub();
    const imageOnsetSeconds = 3;
    runVisualRepetitionTrial(player, presenter, imageOnsetSeconds);
    updatePlayerTimeSeconds(player, 2.9);
    expect(presenter.imageShownCount()).toBe(0);
    updatePlayerTimeSeconds(player, 3.1);
    expect(presenter.imageShownCount()).toBe(1);

    const player2 = new AudioPlayerStub();
    const presenter2 = new ImagePresenterStub();
    runVisualRepetitionTrial(player2, presenter2, imageOnsetSeconds);
    updatePlayerTimeSeconds(player2, 2.9);
    expect(presenter2.imageShownCount()).toBe(0);
    updatePlayerTimeSeconds(player2, 3.1);
    expect(presenter2.imageShownCount()).toBe(1);
  });
});
