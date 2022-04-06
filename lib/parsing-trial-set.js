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

function parseLine(line, state, trials) {
  const csvEntries = line.split(",");
  if (csvEntries.length >= 7) {
    const taskName = csvEntries[0];
    if (taskName === "Task") {
    } else if (state.firstTrial) {
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
      state.firstTrial = false;
    } else {
      if (state.lastTaskName !== taskName) {
        if (taskName !== "Repetition")
          trials.push({ type: TrialType.gameTransition });
        else state.firstRepetitionBlockComplete = true;
      }
      if (taskName === "Repetition") {
        if (state.firstRepetitionBlockComplete === false) {
          trials.push({ type: TrialType.blank });
          trials.push({
            type: TrialType.imageWithAudio,
            imageFileName: imageFileName(csvEntries),
            audioFileName: audioFileName(csvEntries),
          });
        }
      } else if (taskName === "Free Recall Test") {
        trials.push({ type: TrialType.blank });
        trials.push({
          type: TrialType.imageWithAudio,
          imageFileName: imageFileName(csvEntries),
          audioFileName: audioFileName(csvEntries),
        });
      } else if (taskName === "Cued Recall Test") {
        if (state.firstCuedRecallTrial === true) {
          trials.push({ type: TrialType.blank });
          trials.push({
            type: TrialType.image,
            imageFileName: "Seesaw.png",
          });
          state.firstCuedRecallTrial = false;
        }
        trials.push({ type: TrialType.blank });
        trials.push({
          type: TrialType.imageWithAudio,
          imageFileName: imageFileName(csvEntries),
          audioFileName: audioFileName(csvEntries),
        });
      } else if (taskName === "2 dot test") {
        if (state.readyForSecondLineOfPreBreakTwoDotTrial) {
          trials.push({
            type: TrialType.twoDot,
            feedbackAudioFileName: audioFileName(csvEntries),
            stimulusFileName: state.preBreakTwoDotStimulusFileName,
            firstTargetWord: state.preBreakTwoDotFirstTargetWord,
            secondTargetWord: state.preBreakTwoDotSecondTargetWord,
            correctTargetWord: csvEntries[2],
            imageFileName: imageFileName(csvEntries),
          });
          state.readyForSecondLineOfPreBreakTwoDotTrial = false;
        } else {
          trials.push({ type: TrialType.greenCircle });
          state.preBreakTwoDotStimulusFileName = audioFileName(csvEntries);
          [
            state.preBreakTwoDotFirstTargetWord,
            ,
            state.preBreakTwoDotSecondTargetWord,
          ] = csvEntries[2].split(" ");
          state.readyForSecondLineOfPreBreakTwoDotTrial = true;
        }
      }
    }
    state.lastTaskName = taskName;
  }
}

export function parse(contents) {
  const trials = [];
  const state = {
    firstTrial: true,
    firstCuedRecallTrial: true,
    readyForSecondLineOfPreBreakTwoDotTrial: false,
    firstRepetitionBlockComplete: false,
    lastTaskName: "",
    preBreakTwoDotStimulusFileName: "",
    preBreakTwoDotFirstTargetWord: "",
    preBreakTwoDotSecondTargetWord: "",
  };
  for (const line of contents.split("\n")) {
    parseLine(line, state, trials);
  }
  return trials;
}
