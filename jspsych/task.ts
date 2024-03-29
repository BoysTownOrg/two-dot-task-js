import * as pluginClasses from "./plugin";

import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychImageButtonResponse from "@jspsych/plugin-image-button-response";
import jsPsychPreload from "@jspsych/plugin-preload";

import "jspsych/css/jspsych.css";

const twoDotPluginClass = pluginClasses.twoDot();
const twoDotWithoutFeedbackPluginClass = pluginClasses.twoDotWithoutFeedback();
const imageAudioButtonResponsePluginClass =
  pluginClasses.imageAudioButtonResponse();
const stopwatchPluginClass = pluginClasses.stopwatch();

function concatenatePaths(a, b) {
  return `${a}/${b}`;
}

const standardImageHeightPixels = 400;
const noiseText = "Noise";
const bottomRightButtonHTML =
  '<button class="jspsych-btn" style="position: absolute; bottom: 5%; right: 5%">%choice%</button>';

declare const wordLearningInNoiseResourcePath: string;

function resourcePath(fileName) {
  return concatenatePaths(wordLearningInNoiseResourcePath, fileName);
}

function pushGameTrial(trials, n) {
  trials.push({
    type: jsPsychImageButtonResponse,
    stimulus: resourcePath(`game${n + 1}.jpg`),
    stimulus_height: standardImageHeightPixels,
    choices: ["Continue"],
    prompt: "",
    button_html: bottomRightButtonHTML,
  });
}

function pushBlankTrial(trials) {
  trials.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: "",
    choices: ["Continue"],
    button_html: bottomRightButtonHTML,
  });
}

function pushGreenCircleTrial(trials) {
  trials.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: "",
    choices: [""],
    button_html:
      '<div style="height: 200px; width: 200px; border-radius: 100px; background-color: green"></div>',
  });
}

function pushTwoConsecutiveGameTrials(trials, taskCount) {
  pushGameTrial(trials, taskCount);
  pushGameTrial(trials, taskCount + 1);
}

function twoDotTrialProperties(
  type,
  stimulusFileName,
  imageUrl,
  firstWord,
  secondWord,
  correctWord,
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
  correctWord,
) {
  trials.push({
    timeline: [
      {
        feedbackUrl: resourcePath(feedbackAudioFileName),
        ...twoDotTrialProperties(
          twoDotPluginClass,
          stimulusFileName,
          imageUrl,
          firstWord,
          secondWord,
          correctWord,
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
  correctWord,
) {
  trials.push({
    timeline: [
      twoDotTrialProperties(
        twoDotWithoutFeedbackPluginClass,
        stimulusFileName,
        imageUrl,
        firstWord,
        secondWord,
        correctWord,
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
  selectedConditionText,
) {
  const csvEntries = line.split(",");
  const taskName = trimmedEntry(csvEntries, 0).toLowerCase();
  if (
    taskName !== parsingState.lastTaskName &&
    parsingState.lastTaskName !== "" &&
    !(taskName === "repetition" && parsingState.taskCount === 1)
  ) {
    pushTwoConsecutiveGameTrials(trials, parsingState.taskCount);
    parsingState.taskCount += 1;
  }
  parsingState.lastTaskName = taskName;
  if (taskName === "cued recall test" && parsingState.firstCuedRecall) {
    pushBlankTrial(trials);
    trials.push({
      type: jsPsychImageButtonResponse,
      stimulus: resourcePath("Seesaw.png"),
      stimulus_height: standardImageHeightPixels,
      choices: ["Continue"],
      prompt: "",
      button_html: bottomRightButtonHTML,
    });
    parsingState.firstCuedRecall = false;
  }
  const imageFileName = trimmedEntry(csvEntries, 6);
  if (parsingState.firstTrial) {
    pushGameTrial(trials, parsingState.taskCount);
    pushBlankTrial(trials);
    trials.push({
      type: jsPsychImageButtonResponse,
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
        if (parsingState.taskCount > 0) break;
      // falls through
      case "free recall test":
      case "cued recall test":
        pushBlankTrial(trials);
        trials.push({
          timeline: [
            {
              type: imageAudioButtonResponsePluginClass,
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
            trimmedEntry(csvEntries, 2),
          );
          pushGreenCircleTrial(trials);
          pushTwoDotWithoutFeedbackTrial(
            trials,
            audioFileName,
            resourcePath(imageFileName),
            firstTargetWord,
            secondTargetWord,
            trimmedEntry(csvEntries, 5),
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
            trimmedEntry(csvEntries, 2),
          );
          parsingState.readyForSecondLineOfPreBreakTwoDotTrial = false;
        }
        break;
      case "5-minute break": {
        trials.push({
          type: stopwatchPluginClass,
          text: 'Take a 5 minute break. Press "Continue" when finished.',
          alarmTimeSeconds: 300,
        });
        parsingState.postBreak = true;
        parsingState.taskCount += 1;
        parsingState.lastTaskName = "";
        pushGameTrial(trials, parsingState.taskCount);
        break;
      }
      default:
    }
  }
}

function notifyThatConfirmButtonHasBeenClicked(page, conditionSelect, jsPsych) {
  document.body.removeChild(page);

  fetch(resourcePath("set-a.csv"))
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
            conditionSelect.options.item(conditionSelect.selectedIndex)
              .textContent,
          );
      pushTwoConsecutiveGameTrials(trials, parsingState.taskCount);
      jsPsych.run([
        {
          type: jsPsychPreload,
          auto_preload: true,
        },
        {
          type: jsPsychHtmlButtonResponse,
          stimulus: 'Press "Start" when ready.',
          choices: ["Start"],
          button_html: bottomRightButtonHTML,
        },
        ...trials,
        {
          type: jsPsychHtmlButtonResponse,
          stimulus: 'The test is done. Press "Finish" to complete. Thank you.',
          choices: ["Finish"],
          button_html: bottomRightButtonHTML,
        },
      ]);
    });
}

export function selectConditionBeforeRunning(jsPsych) {
  const page = createChildElement(document.body, "div");
  const conditionLabel = createChildElement(
    createChildElement(page, "div"),
    "label",
  );
  conditionLabel.textContent = "Condition";
  const conditionSelect = createChildElement(conditionLabel, "select");
  createChildElement(conditionSelect, "option").textContent = "Quiet";
  createChildElement(conditionSelect, "option").textContent = noiseText;
  const confirmButton = createChildElement(page, "button");
  confirmButton.textContent = "Confirm";
  confirmButton.addEventListener("click", () => {
    notifyThatConfirmButtonHasBeenClicked(page, conditionSelect, jsPsych);
  });
}
