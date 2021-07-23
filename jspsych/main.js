import {
  plugin as twoDotPlugin,
  imageAudioButtonResponse as imageAudioButtonResponsePlugin,
  stopwatch as stopwatchPlugin,
} from "./plugin.js";

function concatenatePaths(a, b) {
  return `${a}/${b}`;
}

const standardImageHeightPixels = 500;
const twoDotPluginId = "two-dot";

function pushGameTrial(trials, setText, n) {
  trials.push({
    type: "image-button-response",
    stimulus: concatenatePaths(
      wordLearningInNoiseResourcePath,
      `game-${setText}-${n}.jpg`
    ),
    stimulus_height: standardImageHeightPixels,
    choices: ["Continue"],
    prompt: "",
  });
}

function pushTwoDotTrial(
  trials,
  stimulusFileName,
  feedbackAudioFileName,
  imageUrl
) {
  trials.push({
    type: twoDotPluginId,
    stimulusUrl: concatenatePaths(
      wordLearningInNoiseResourcePath,
      stimulusFileName
    ),
    feedbackUrl: concatenatePaths(
      wordLearningInNoiseResourcePath,
      feedbackAudioFileName
    ),
    imageUrl,
    imageHeight: standardImageHeightPixels,
    firstChoiceOnsetTimeSeconds: 2.5,
    firstChoiceOffsetTimeSeconds: 3,
    secondChoiceOnsetTimeSeconds: 4,
    secondChoiceOffsetTimeSeconds: 4.5,
  });
}

function main() {
  jsPsych.plugins[twoDotPluginId] = twoDotPlugin(twoDotPluginId);

  const imageAudioButtonResponsePluginId = "image-audio-button-response";
  jsPsych.plugins[imageAudioButtonResponsePluginId] =
    imageAudioButtonResponsePlugin(imageAudioButtonResponsePluginId);

  const stopwatchPluginId = "stopwatch";
  jsPsych.plugins[stopwatchPluginId] = stopwatchPlugin(stopwatchPluginId);

  const page = document.createElement("div");
  const set = document.createElement("div");
  const setLabel = document.createElement("label");
  setLabel.textContent = "Set";
  const setSelect = document.createElement("select");
  const setA = document.createElement("option");
  const setAText = "A";
  setA.textContent = setAText;
  const setB = document.createElement("option");
  setB.textContent = "B";
  setSelect.append(setA);
  setSelect.append(setB);
  setLabel.appendChild(setSelect);
  set.append(setLabel);
  const condition = document.createElement("div");
  const conditionLabel = document.createElement("label");
  conditionLabel.textContent = "Condition";
  const conditionSelect = document.createElement("select");
  const quietCondition = document.createElement("option");
  const conditionAText = "Quiet";
  quietCondition.textContent = conditionAText;
  const noiseCondition = document.createElement("option");
  const noiseText = "Noise";
  noiseCondition.textContent = noiseText;
  conditionSelect.append(quietCondition);
  conditionSelect.append(noiseCondition);
  conditionLabel.appendChild(conditionSelect);
  condition.append(conditionLabel);
  const confirmButton = document.createElement("button");
  confirmButton.textContent = "Confirm";
  confirmButton.addEventListener("click", () => {
    const setText = setSelect.options.item(setSelect.selectedIndex).textContent;
    const conditionText = conditionSelect.options.item(
      conditionSelect.selectedIndex
    ).textContent;
    document.body.removeChild(page);

    const usingSetA = setText === setAText;
    fetch(
      concatenatePaths(
        wordLearningInNoiseResourcePath,
        `set-${usingSetA ? "a" : "b"}.csv`
      )
    )
      .then((p) => p.text())
      .then((text) => {
        const trials = [];
        let preBreakTwoDotStimulusFileName = "";
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
              trials.push({
                type: "image-button-response",
                stimulus: concatenatePaths(
                  wordLearningInNoiseResourcePath,
                  imageFileName
                ),
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
                    stimulusUrl: concatenatePaths(
                      wordLearningInNoiseResourcePath,
                      audioFileName
                    ),
                    imageUrl: concatenatePaths(
                      wordLearningInNoiseResourcePath,
                      imageFileName
                    ),
                    imageHeight: standardImageHeightPixels,
                  });
                  break;
                case "2 dot test":
                  if (postBreak) {
                    pushTwoDotTrial(
                      trials,
                      audioFileName,
                      "silence.wav",
                      trials[trials.length - 6].imageUrl
                    );
                  } else if (!readyForSecondLineOfPreBreakTwoDotTrial) {
                    preBreakTwoDotStimulusFileName = audioFileName;
                    readyForSecondLineOfPreBreakTwoDotTrial = true;
                  } else {
                    pushTwoDotTrial(
                      trials,
                      preBreakTwoDotStimulusFileName,
                      audioFileName,
                      concatenatePaths(
                        wordLearningInNoiseResourcePath,
                        imageFileName
                      )
                    );
                    readyForSecondLineOfPreBreakTwoDotTrial = false;
                  }
                  break;
                case "5-minute break":
                  trials.push({
                    type: stopwatchPluginId,
                    text: 'Take a 5 minute break. Press "Continue" when finished.',
                  });
                  postBreak = true;
                  taskCount += 1;
                  lastTaskName = "";
                  break;
                default:
              }
            }
          }
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
        }
      });
  });
  page.append(set);
  page.append(condition);
  page.append(confirmButton);
  document.body.append(page);
}

main();
