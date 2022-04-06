export const TrialType = Object.freeze({
  initialGame: "initialGame",
  blank: "blank",
  image: "image",
  imageWithAudio: "imageWithAudio",
});

export function parse(contents) {
  const trials = [];
  let firstTrial = true;
  const lines = contents.split("\n");
  for (const line of lines) {
    const csvEntries = line.split(",");
    if (csvEntries.length >= 7) {
      if (csvEntries[0] === "Task") {
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
      } else if (csvEntries[0] === "Repetition") {
        trials.push({ type: TrialType.blank });
        trials.push({
          type: TrialType.imageWithAudio,
          imageFileName: csvEntries[6],
          audioFileName: csvEntries[4],
        });
      }
    }
  }

  return trials;
}
