function runVisualRepetitionTrial(player, presenter, imageOnsetSeconds) {
  let shown = false;
  player.attachTimeUpdateHandler(() => {
    if (player.currentTimeSeconds() >= imageOnsetSeconds && !shown) {
      presenter.showImage();
      shown = true;
    }
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
    this.imageShownCount_ = 0;
  }

  imageShown() {
    return this.imageShown_;
  }

  showImage() {
    this.imageShown_ = true;
    this.imageShownCount_ += 1;
  }

  attach(observer) {
    this.observer = observer;
  }

  imageShownCount() {
    return this.imageShownCount_;
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

  it("should only show image once", () => {
    const player = new AudioPlayerStub();
    const presenter = new ImagePresenterStub();
    const imageOnsetSeconds = 3;
    runVisualRepetitionTrial(player, presenter, imageOnsetSeconds);
    player.setCurrentTimeSeconds(2.9);
    player.updateTime();
    expect(presenter.imageShownCount()).toBe(0);
    player.setCurrentTimeSeconds(3.1);
    player.updateTime();
    expect(presenter.imageShownCount()).toBe(1);
    player.setCurrentTimeSeconds(3.2);
    player.updateTime();
    expect(presenter.imageShownCount()).toBe(1);
  });
});
