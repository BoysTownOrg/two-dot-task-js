import * as plugin from "./plugin.js";

function concatenatePaths(a, b) {
  return `${a}/${b}`;
}

const standardImageHeightPixels = 500;
const twoDotPluginId = "two-dot";
const imageAudioButtonResponsePluginId = "image-audio-button-response";
const stopwatchPluginId = "stopwatch";
const setAText = "A";
const noiseText = "Noise";

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
  });
}

function pushTwoConsecutiveGameTrials(trials, setText, taskCount) {
  pushGameTrial(trials, setText, taskCount);
  pushGameTrial(trials, setText, taskCount + 1);
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
    type: twoDotPluginId,
    stimulusUrl: resourcePath(stimulusFileName),
    feedbackUrl: resourcePath(feedbackAudioFileName),
    imageUrl,
    imageHeight: standardImageHeightPixels,
    firstChoiceOnsetTimeSeconds: 2.5,
    firstChoiceOffsetTimeSeconds: 3.25,
    secondChoiceOnsetTimeSeconds: 4.75,
    secondChoiceOffsetTimeSeconds: 5.5,
    firstWord,
    secondWord,
    correctWord,
  });
}

function createChildElement(parent, tag) {
  const child = document.createElement(tag);
  parent.append(child);
  return child;
}

function notifyThatConfirmButtonHasBeenClicked(
  page,
  setSelect,
  conditionSelect
) {
  document.body.removeChild(page);

  const setText =
    setSelect.options.item(setSelect.selectedIndex).textContent === setAText
      ? "a"
      : "b";
  fetch(resourcePath(`set-${setText}.csv`))
    .then((p) => p.text())
    .then((text) => {
      const trials = [];
      let preBreakTwoDotStimulusFileName = "";
      let preBreakTwoDotFirstTargetWord = "";
      let preBreakTwoDotSecondTargetWord = "";
      let readyForSecondLineOfPreBreakTwoDotTrial = false;
      let postBreak = false;
      let lastTaskName = "";
      let taskCount = 0;
      let firstTrial = true;
      for (const line of text.split("\n").slice(1)) {
        if (line.length !== 0) {
          const csvEntries = line.split(",");
          const taskName = csvEntries[0].trim().toLowerCase();
          if (taskName !== lastTaskName && lastTaskName !== "") {
            pushTwoConsecutiveGameTrials(trials, setText, taskCount);
            taskCount += 1;
          }
          lastTaskName = taskName;
          const imageFileName = csvEntries[6];
          if (firstTrial) {
            pushGameTrial(trials, setText, taskCount);
            trials.push({
              type: "image-button-response",
              stimulus: resourcePath(imageFileName),
              stimulus_height: standardImageHeightPixels,
              choices: ["Continue"],
              prompt: "",
            });
            firstTrial = false;
          } else {
            const fileOrder = csvEntries[3];
            const audioFileEntry = csvEntries[4];
            const audioFileName =
              conditionSelect.options.item(conditionSelect.selectedIndex)
                .textContent === noiseText
                ? `${fileOrder}_${audioFileEntry.replace("Final", "2Talker")}`
                : audioFileEntry;
            switch (taskName) {
              case "repetition":
              case "free recall test":
              case "cued recall test":
                trials.push({
                  type: imageAudioButtonResponsePluginId,
                  stimulusUrl: resourcePath(audioFileName),
                  imageUrl: resourcePath(imageFileName),
                  imageHeight: standardImageHeightPixels,
                });
                break;
              case "2 dot test":
                if (postBreak) {
                  const [firstTargetWord, , secondTargetWord] =
                    csvEntries[2].split(" ");
                  pushTwoDotTrial(
                    trials,
                    audioFileName,
                    "silence.wav",
                    trials[trials.length - 6].imageUrl,
                    firstTargetWord,
                    secondTargetWord,
                    csvEntries[5]
                  );
                } else if (!readyForSecondLineOfPreBreakTwoDotTrial) {
                  [
                    preBreakTwoDotFirstTargetWord,
                    ,
                    preBreakTwoDotSecondTargetWord,
                  ] = csvEntries[2].split(" ");
                  preBreakTwoDotStimulusFileName = audioFileName;
                  readyForSecondLineOfPreBreakTwoDotTrial = true;
                } else {
                  pushTwoDotTrial(
                    trials,
                    preBreakTwoDotStimulusFileName,
                    audioFileName,
                    resourcePath(imageFileName),
                    preBreakTwoDotFirstTargetWord,
                    preBreakTwoDotSecondTargetWord,
                    csvEntries[2]
                  );
                  readyForSecondLineOfPreBreakTwoDotTrial = false;
                }
                break;
              case "5-minute break": {
                trials.push({
                  type: stopwatchPluginId,
                  text: 'Take a 5 minute break. Press "Continue" when finished.',
                });
                postBreak = true;
                taskCount += 1;
                lastTaskName = "";
                pushGameTrial(trials, setText, taskCount);
                break;
              }
              default:
            }
          }
        }
      }
      pushTwoConsecutiveGameTrials(trials, setText, taskCount);
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
          },
          ...trials,
          {
            type: "html-button-response",
            stimulus:
              'The test is done. Press "Finish" to complete. Thank you.',
            choices: ["Finish"],
          },
        ],
      });
    });
}

function main() {
  jsPsych.plugins[twoDotPluginId] = plugin.twoDot(twoDotPluginId);
  jsPsych.plugins[imageAudioButtonResponsePluginId] =
    plugin.imageAudioButtonResponse(imageAudioButtonResponsePluginId);
  jsPsych.plugins[stopwatchPluginId] = plugin.stopwatch(stopwatchPluginId);
  const page = createChildElement(document.body, "div");
  const setLabel = createChildElement(createChildElement(page, "div"), "label");
  setLabel.textContent = "Set";
  const setSelect = createChildElement(setLabel, "select");
  createChildElement(setSelect, "option").textContent = setAText;
  createChildElement(setSelect, "option").textContent = "B";
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
    notifyThatConfirmButtonHasBeenClicked(page, setSelect, conditionSelect);
  });
}

main();
