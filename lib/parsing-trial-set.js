export const TrialType = Object.freeze({
  initialGame: "initialGame",
  blank: "blank",
  image: "image",
  imageWithAudio: "imageWithAudio",
  gameTransition: "gameTransition",
  greenCircle: "greenCircle",
  twoDot: "twoDot",
  twoDotWithoutFeedback: "twoDotWithoutFeedback",
  break: "break",
});

function audioFileName(csvEntries) {
  return csvEntries[4];
}

function imageFileName(csvEntries) {
  return csvEntries[6];
}

function parseCsvEntries(csvEntries, state, trials) {
  const taskName = csvEntries[0];
  if (state.lastTaskName !== taskName && taskName !== "Task") {
    if (
      state.lastTaskName === "Task" ||
      state.lastTaskName === "5-Minute Break"
    )
      trials.push({
        type: TrialType.initialGame,
      });
    else if (taskName !== "Repetition")
      trials.push({ type: TrialType.gameTransition });
    if (state.lastTaskName === "Repetition")
      state.firstRepetitionBlockComplete = true;
  }
  switch (taskName) {
    case "Repetition": {
      if (state.firstRepetitionBlockComplete === false) {
        if (state.firstTrial) {
          trials.push({
            type: TrialType.blank,
          });
          trials.push({
            type: TrialType.image,
            imageFileName: imageFileName(csvEntries),
          });
          state.firstTrial = false;
        } else {
          trials.push({ type: TrialType.blank });
          trials.push({
            type: TrialType.imageWithAudio,
            imageFileName: imageFileName(csvEntries),
            audioFileName: audioFileName(csvEntries),
          });
        }
      }
      break;
    }
    case "Free Recall Test": {
      trials.push({ type: TrialType.blank });
      trials.push({
        type: TrialType.imageWithAudio,
        imageFileName: imageFileName(csvEntries),
        audioFileName: audioFileName(csvEntries),
      });
      break;
    }
    case "Cued Recall Test": {
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
      break;
    }
    case "5-Minute Break": {
      trials.push({ type: TrialType.break });
      state.postBreak = true;
      break;
    }
    case "2 dot test": {
      if (state.postBreak) {
        trials.push({ type: TrialType.greenCircle });
        const [firstTargetWord, , secondTargetWord] = csvEntries[2].split(" ");
        trials.push({
          type: TrialType.twoDotWithoutFeedback,
          stimulusFileName: audioFileName(csvEntries),
          firstTargetWord,
          secondTargetWord,
          correctTargetWord: csvEntries[5],
          imageFileName: imageFileName(csvEntries),
        });
      } else if (state.readyForSecondLineOfPreBreakTwoDotTrial) {
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
      break;
    }
    default:
  }
  state.lastTaskName = taskName;
}

function parseLine(line, state, trials) {
  const csvEntries = line.split(",");
  if (csvEntries.length >= 7) parseCsvEntries(csvEntries, state, trials);
}

function removeByteOrderMark(contents) {
  if (contents.charCodeAt(0) === 65279) return contents.slice(1);
  return contents;
}

export function parse(contents) {
  const trials = [];
  const state = {
    firstTrial: true,
    firstCuedRecallTrial: true,
    readyForSecondLineOfPreBreakTwoDotTrial: false,
    firstRepetitionBlockComplete: false,
    postBreak: false,
    lastTaskName: "",
    preBreakTwoDotStimulusFileName: "",
    preBreakTwoDotFirstTargetWord: "",
    preBreakTwoDotSecondTargetWord: "",
  };
  for (const line of removeByteOrderMark(contents).split("\n"))
    parseLine(line, state, trials);
  trials.push({ type: TrialType.gameTransition });
  return trials;
}
