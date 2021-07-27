import * as plugin from "./plugin.js";

function concatenatePaths(a, b) {
  return `${a}/${b}`;
}

const standardImageHeightPixels = 500;
const twoDotPluginId = "two-dot";

function resourcePath(fileName) {
  return concatenatePaths(wordLearningInNoiseResourcePath, fileName);
}

function pushGameTrial(trials, setText, n) {
  trials.push({
    type: "image-button-response",
    stimulus: resourcePath(`game-${setText}-${n}.jpg`),
    stimulus_height: standardImageHeightPixels,
    choices: ["Continue"],
    prompt: "",
  });
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

function main() {
  jsPsych.plugins[twoDotPluginId] = plugin.twoDot(twoDotPluginId);
  const imageAudioButtonResponsePluginId = "image-audio-button-response";
  jsPsych.plugins[imageAudioButtonResponsePluginId] =
    plugin.imageAudioButtonResponse(imageAudioButtonResponsePluginId);
  const stopwatchPluginId = "stopwatch";
  jsPsych.plugins[stopwatchPluginId] = plugin.stopwatch(stopwatchPluginId);
  const page = createChildElement(document.body, "div");
  const setLabel = createChildElement(createChildElement(page, "div"), "label");
  setLabel.textContent = "Set";
  const setSelect = createChildElement(setLabel, "select");
  const setAText = "A";
  createChildElement(setSelect, "option").textContent = setAText;
  createChildElement(setSelect, "option").textContent = "B";
  const conditionLabel = createChildElement(
    createChildElement(page, "div"),
    "label"
  );
  conditionLabel.textContent = "Condition";
  const conditionSelect = createChildElement(conditionLabel, "select");
  createChildElement(conditionSelect, "option").textContent = "Quiet";
  const noiseText = "Noise";
  createChildElement(conditionSelect, "option").textContent = noiseText;
  const confirmButton = createChildElement(page, "button");
  confirmButton.textContent = "Confirm";
  confirmButton.addEventListener("click", () => {
    const setText = setSelect.options.item(setSelect.selectedIndex).textContent;
    const conditionText = conditionSelect.options.item(
      conditionSelect.selectedIndex
    ).textContent;
    document.body.removeChild(page);

    const usingSetA = setText === setAText;
    fetch(resourcePath(`set-${usingSetA ? "a" : "b"}.csv`))
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
              const gameSetText = usingSetA ? "a" : "b";
              pushGameTrial(trials, gameSetText, taskCount + 1);
              pushGameTrial(trials, gameSetText, taskCount + 2);
              taskCount += 1;
            }
            lastTaskName = taskName;
            const imageFileName = csvEntries[6];
            if (firstTrial) {
              const gameSetText = usingSetA ? "a" : "b";
              pushGameTrial(trials, gameSetText, taskCount + 1);
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
                conditionText === noiseText
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
                  const gameSetText = usingSetA ? "a" : "b";
                  pushGameTrial(trials, gameSetText, taskCount + 1);
                  break;
                }
                default:
              }
            }
          }
        }
        const gameSetText = usingSetA ? "a" : "b";
        pushGameTrial(trials, gameSetText, taskCount + 1);
        pushGameTrial(trials, gameSetText, taskCount + 2);
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
  });
}

main();
