export function runVisualRepetitionTrial(player, presenter, imageOnsetSeconds) {
  let shown = false;
  player.attachTimeUpdateHandler(() => {
    if (player.currentTimeSeconds() >= imageOnsetSeconds && !shown) {
      presenter.showImage();
      shown = true;
    }
  });
}
