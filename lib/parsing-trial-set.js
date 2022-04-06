export const TrialType = Object.freeze({
  initialGame: "initialGame",
  blank: "blank",
  image: "image",
  imageWithAudio: "imageWithAudio",
  gameTransition: "gameTransition",
  greenCircle: "greenCircle",
  twoDot: "twoDot",
});

function audioFileName(csvEntries) {
  return csvEntries[4];
}

function imageFileName(csvEntries) {
  return csvEntries[6];
}

export function parse(contents) {
  const trials = [];
  let firstTrial = true;
  let readyForSecondLineOfPreBreakTwoDotTrial = false;
  let firstRepetitionBlockComplete = false;
  let lastTaskName = "";
  let preBreakTwoDotStimulusFileName = "";
  let preBreakTwoDotFirstTargetWord = "";
  let preBreakTwoDotSecondTargetWord = "";
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
          imageFileName: imageFileName(csvEntries),
        });
        firstTrial = false;
      } else {
        if (lastTaskName !== taskName) {
          if (taskName !== "Repetition")
            trials.push({ type: TrialType.gameTransition });
          else firstRepetitionBlockComplete = true;
        }
        if (
          taskName === "Repetition" &&
          firstRepetitionBlockComplete === false
        ) {
          trials.push({ type: TrialType.blank });
          trials.push({
            type: TrialType.imageWithAudio,
            imageFileName: imageFileName(csvEntries),
            audioFileName: audioFileName(csvEntries),
          });
        } else if (taskName === "2 dot test") {
          if (readyForSecondLineOfPreBreakTwoDotTrial) {
            trials.push({
              type: TrialType.twoDot,
              feedbackAudioFileName: audioFileName(csvEntries),
              stimulusFileName: preBreakTwoDotStimulusFileName,
              firstTargetWord: preBreakTwoDotFirstTargetWord,
              secondTargetWord: preBreakTwoDotSecondTargetWord,
              correctTargetWord: csvEntries[2],
              imageFileName: imageFileName(csvEntries),
            });
            readyForSecondLineOfPreBreakTwoDotTrial = false;
          } else {
            trials.push({ type: TrialType.greenCircle });
            preBreakTwoDotStimulusFileName = audioFileName(csvEntries);
            [preBreakTwoDotFirstTargetWord, , preBreakTwoDotSecondTargetWord] =
              csvEntries[2].split(" ");
            readyForSecondLineOfPreBreakTwoDotTrial = true;
          }
        }
      }
      lastTaskName = taskName;
    }
  }
  return trials;
}
