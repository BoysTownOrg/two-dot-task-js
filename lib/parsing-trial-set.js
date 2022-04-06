export const TrialType = Object.freeze({
  initialGame: "initialGame",
  blank: "blank",
  image: "image",
  imageWithAudio: "imageWithAudio",
  gameTransition: "gameTransition",
  greenCircle: "greenCircle",
  twoDot: "twoDot",
});

export function parse(contents) {
  const trials = [];
  let firstTrial = true;
  let readyForSecondLineOfPreBreakTwoDotTrial = false;
  let lastTaskName = "";
  const lines = contents.split("\n");
  for (const line of lines) {
    const csvEntries = line.split(",");
    if (csvEntries.length >= 7) {
      const taskName = csvEntries[0];
      if (taskName === "Task") {
      } else if (firstTrial) {
        trials.push({
          type: TrialType.initialGame,
        });
        trials.push({
          type: TrialType.blank,
        });
        trials.push({
          type: TrialType.image,
          imageFileName: csvEntries[6],
        });
        firstTrial = false;
      } else {
        if (lastTaskName !== taskName)
          trials.push({ type: TrialType.gameTransition });
        if (taskName === "Repetition") {
          trials.push({ type: TrialType.blank });
          trials.push({
            type: TrialType.imageWithAudio,
            imageFileName: csvEntries[6],
            audioFileName: csvEntries[4],
          });
        } else if (taskName === "2 dot test") {
          if (readyForSecondLineOfPreBreakTwoDotTrial) {
            trials.push({
              type: TrialType.twoDot,
              feedbackAudioFileName: csvEntries[4],
            });
            readyForSecondLineOfPreBreakTwoDotTrial = false;
          } else {
            trials.push({ type: TrialType.greenCircle });
            readyForSecondLineOfPreBreakTwoDotTrial = true;
          }
        }
      }
      lastTaskName = taskName;
    }
  }
  return trials;
}
