function runVisualRepetitionTrial(player, presenter, imageOnsetSeconds) {
  player.attachTimeUpdateHandler(() => {
    if (player.currentTimeSeconds() >= imageOnsetSeconds) presenter.showImage();
  });
}

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
  }

  imageShown() {
    return this.imageShown_;
  }

  showImage() {
    this.imageShown_ = true;
  }

  attach(observer) {
    this.observer = observer;
  }
}

describe("visual repetition trial", () => {
  it("should show image when player advances to image onset time", () => {
    const player = new AudioPlayerStub();
    const presenter = new ImagePresenterStub();
    const imageOnsetSeconds = 3;
    runVisualRepetitionTrial(player, presenter, imageOnsetSeconds);
    player.setCurrentTimeSeconds(1);
    player.updateTime();
    expect(presenter.imageShown()).toBeFalse();
    player.setCurrentTimeSeconds(2);
    player.updateTime();
    expect(presenter.imageShown()).toBeFalse();
    player.setCurrentTimeSeconds(2.5);
    player.updateTime();
    expect(presenter.imageShown()).toBeFalse();
    player.setCurrentTimeSeconds(2.9);
    player.updateTime();
    expect(presenter.imageShown()).toBeFalse();
    player.setCurrentTimeSeconds(3);
    player.updateTime();
    expect(presenter.imageShown()).toBeTrue();
  });
});
