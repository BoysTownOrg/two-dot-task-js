import * as plugin from "./plugin.js";

function concatenatePaths(a, b) {
  return `${a}/${b}`;
}

const standardImageHeightPixels = 400;
const twoDotPluginId = "two-dot";
const twoDotWithoutFeedbackPluginId = "two-dot-without-feedback";
const imageAudioButtonResponsePluginId = "image-audio-button-response";
const stopwatchPluginId = "stopwatch";
const noiseText = "Noise";
const bottomRightButtonHTML =
  '<button class="jspsych-btn" style="position: absolute; bottom: 5%; right: 5%">%choice%</button>';

function resourcePath(fileName) {
  return concatenatePaths(wordLearningInNoiseResourcePath, fileName);
}

function pushGameTrial(trials, setText, n) {
  trials.push({
    type: "image-button-response",
    stimulus: resourcePath(`game-${setText}-${n + 1}.jpg`),
    stimulus_height: standardImageHeightPixels,
    choices: ["Continue"],
    prompt: "",
    button_html: bottomRightButtonHTML,
  });
}

function pushBlankTrial(trials) {
  trials.push({
    type: "html-button-response",
    stimulus: "",
    choices: ["Continue"],
    button_html: bottomRightButtonHTML,
  });
}

function pushGreenCircleTrial(trials) {
  trials.push({
    type: "html-button-response",
    stimulus: "",
    choices: [""],
    button_html:
      '<div style="height: 200px; width: 200px; border-radius: 100px; background-color: green"></div>',
  });
}

function pushTwoConsecutiveGameTrials(trials, setText, taskCount) {
  pushGameTrial(trials, setText, taskCount);
  pushGameTrial(trials, setText, taskCount + 1);
}

function twoDotTrialProperties(
  type,
  stimulusFileName,
  imageUrl,
  firstWord,
  secondWord,
  correctWord
) {
  return {
    type,
    stimulusUrl: resourcePath(stimulusFileName),
    imageUrl,
    imageHeight: standardImageHeightPixels,
    firstChoiceOnsetTimeSeconds: 2.5,
    firstChoiceOffsetTimeSeconds: 3.25,
    secondChoiceOnsetTimeSeconds: 4.75,
    secondChoiceOffsetTimeSeconds: 5.5,
    firstWord,
    secondWord,
    correctWord,
  };
}

function pushTwoDotTrial(
  trials,
  stimulusFileName,
  feedbackAudioFileName,
  imageUrl,
  firstWord,
  secondWord,
  correctWord
) {
  trials.push({
    timeline: [
      {
        feedbackUrl: resourcePath(feedbackAudioFileName),
        ...twoDotTrialProperties(
          twoDotPluginId,
          stimulusFileName,
          imageUrl,
          firstWord,
          secondWord,
          correctWord
        ),
      },
    ],
    loop_function(data) {
      return data.values()[0].repeat;
    },
  });
}

function pushTwoDotWithoutFeedbackTrial(
  trials,
  stimulusFileName,
  imageUrl,
  firstWord,
  secondWord,
  correctWord
) {
  trials.push({
    timeline: [
      twoDotTrialProperties(
        twoDotWithoutFeedbackPluginId,
        stimulusFileName,
        imageUrl,
        firstWord,
        secondWord,
        correctWord
      ),
    ],
    loop_function(data) {
      return data.values()[0].repeat;
    },
  });
}

function firstAndThirdWord(text) {
  const [first, , third] = text.split(" ");
  return [first, third];
}

function createChildElement(parent, tag) {
  const child = document.createElement(tag);
  parent.append(child);
  return child;
}

function trimmedEntry(entries, n) {
  return entries[n].trim();
}

function parseTrialOrderFileLine(
  trials,
  line,
  parsingState,
  setText,
  selectedConditionText
) {
  const csvEntries = line.split(",");
  const taskName = trimmedEntry(csvEntries, 0).toLowerCase();
  if (
    taskName !== parsingState.lastTaskName &&
    parsingState.lastTaskName !== ""
  ) {
    pushTwoConsecutiveGameTrials(trials, setText, parsingState.taskCount);
    parsingState.taskCount += 1;
  }
  parsingState.lastTaskName = taskName;
  if (taskName === "cued recall test" && parsingState.firstCuedRecall) {
    pushBlankTrial(trials);
    trials.push({
      type: "image-button-response",
      stimulus: resourcePath(setText === "a" ? "Seesaw.png" : "Airplane.png"),
      stimulus_height: standardImageHeightPixels,
      choices: ["Continue"],
      prompt: "",
      button_html: bottomRightButtonHTML,
    });
    parsingState.firstCuedRecall = false;
  }
  const imageFileName = trimmedEntry(csvEntries, 6);
  if (parsingState.firstTrial) {
    pushGameTrial(trials, setText, parsingState.taskCount);
    pushBlankTrial(trials);
    trials.push({
      type: "image-button-response",
      stimulus: resourcePath(imageFileName),
      stimulus_height: standardImageHeightPixels,
      choices: ["Continue"],
      prompt: "",
      button_html: bottomRightButtonHTML,
    });
    parsingState.firstTrial = false;
  } else {
    const fileOrder = trimmedEntry(csvEntries, 3);
    const audioFileEntry = trimmedEntry(csvEntries, 4);
    const audioFileName =
      selectedConditionText === noiseText
        ? `${fileOrder}_${audioFileEntry.replace("Final", "2Talker")}`
        : audioFileEntry;
    switch (taskName) {
      case "repetition":
      case "free recall test":
      case "cued recall test":
        pushBlankTrial(trials);
        trials.push({
          timeline: [
            {
              type: imageAudioButtonResponsePluginId,
              stimulusUrl: resourcePath(audioFileName),
              imageUrl: resourcePath(imageFileName),
              imageHeight: standardImageHeightPixels,
            },
          ],
          loop_function(data) {
            return data.values()[0].repeat;
          },
        });
        break;
      case "2 dot test":
        if (parsingState.postBreak) {
          const [firstTargetWord, secondTargetWord] = firstAndThirdWord(
            trimmedEntry(csvEntries, 2)
          );
          pushGreenCircleTrial(trials);
          pushTwoDotWithoutFeedbackTrial(
            trials,
            audioFileName,
            resourcePath(imageFileName),
            firstTargetWord,
            secondTargetWord,
            trimmedEntry(csvEntries, 5)
          );
        } else if (!parsingState.readyForSecondLineOfPreBreakTwoDotTrial) {
          [
            parsingState.preBreakTwoDotFirstTargetWord,
            parsingState.preBreakTwoDotSecondTargetWord,
          ] = firstAndThirdWord(trimmedEntry(csvEntries, 2));
          parsingState.preBreakTwoDotStimulusFileName = audioFileName;
          parsingState.readyForSecondLineOfPreBreakTwoDotTrial = true;
        } else {
          pushGreenCircleTrial(trials);
          pushTwoDotTrial(
            trials,
            parsingState.preBreakTwoDotStimulusFileName,
            audioFileName,
            resourcePath(imageFileName),
            parsingState.preBreakTwoDotFirstTargetWord,
            parsingState.preBreakTwoDotSecondTargetWord,
            trimmedEntry(csvEntries, 2)
          );
          parsingState.readyForSecondLineOfPreBreakTwoDotTrial = false;
        }
        break;
      case "5-minute break": {
        trials.push({
          type: stopwatchPluginId,
          text: 'Take a 5 minute break. Press "Continue" when finished.',
          alarmTimeSeconds: 300,
        });
        parsingState.postBreak = true;
        parsingState.taskCount += 1;
        parsingState.lastTaskName = "";
        pushGameTrial(trials, setText, parsingState.taskCount);
        break;
      }
      default:
    }
  }
}

function notifyThatConfirmButtonHasBeenClicked(page, conditionSelect) {
  document.body.removeChild(page);

  const setText = "a";
  fetch(resourcePath(`set-${setText}.csv`))
    .then((p) => p.text())
    .then((text) => {
      const trials = [];
      const parsingState = {
        preBreakTwoDotStimulusFileName: "",
        preBreakTwoDotFirstTargetWord: "",
        preBreakTwoDotSecondTargetWord: "",
        lastTaskName: "",
        taskCount: 0,
        readyForSecondLineOfPreBreakTwoDotTrial: false,
        postBreak: false,
        firstTrial: true,
        firstCuedRecall: true,
      };
      for (const line of text.split("\n").slice(1))
        if (line.length !== 0)
          parseTrialOrderFileLine(
            trials,
            line,
            parsingState,
            setText,
            conditionSelect.options.item(conditionSelect.selectedIndex)
              .textContent
          );
      pushTwoConsecutiveGameTrials(trials, setText, parsingState.taskCount);
      jsPsych.init({
        timeline: [
          {
            type: "preload",
            auto_preload: true,
          },
          {
            type: "html-button-response",
            stimulus: 'Press "Start" when ready.',
            choices: ["Start"],
            button_html: bottomRightButtonHTML,
          },
          ...trials,
          {
            type: "html-button-response",
            stimulus:
              'The test is done. Press "Finish" to complete. Thank you.',
            choices: ["Finish"],
            button_html: bottomRightButtonHTML,
          },
        ],
      });
    });
}

function main() {
  jsPsych.plugins[twoDotPluginId] = plugin.twoDot(twoDotPluginId);
  jsPsych.plugins[twoDotWithoutFeedbackPluginId] = plugin.twoDotWithoutFeedback(
    twoDotWithoutFeedbackPluginId
  );
  jsPsych.plugins[imageAudioButtonResponsePluginId] =
    plugin.imageAudioButtonResponse(imageAudioButtonResponsePluginId);
  jsPsych.plugins[stopwatchPluginId] = plugin.stopwatch(stopwatchPluginId);
  const page = createChildElement(document.body, "div");
  const conditionLabel = createChildElement(
    createChildElement(page, "div"),
    "label"
  );
  conditionLabel.textContent = "Condition";
  const conditionSelect = createChildElement(conditionLabel, "select");
  createChildElement(conditionSelect, "option").textContent = "Quiet";
  createChildElement(conditionSelect, "option").textContent = noiseText;
  const confirmButton = createChildElement(page, "button");
  confirmButton.textContent = "Confirm";
  confirmButton.addEventListener("click", () => {
    notifyThatConfirmButtonHasBeenClicked(page, conditionSelect);
  });
}

main();
