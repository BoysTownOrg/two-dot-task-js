import {
  plugin as twoDotPlugin,
  imageAudioButtonResponse as imageAudioButtonResponsePlugin,
  stopwatch as stopwatchPlugin,
} from "./plugin.js";

function concatenatePaths(a, b) {
  return `${a}/${b}`;
}

const standardImageHeightPixels = 500;

function main() {
  const twoDotPluginId = "two-dot";
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

    fetch(
      concatenatePaths(
        wordLearningInNoiseResourcePath,
        `set-${setText === setAText ? "a" : "b"}.csv`
      )
    )
      .then((p) => p.text())
      .then((text) => {
        const trials = [];
        let preBreakTwoDotAudioFileName = "";
        let readyForSecondLineOfPreBreakTwoDotTrial = false;
        let postBreak = false;
        let lastTaskName = "";
        let taskCount = 0;
        let firstTrial = true;
        for (const line of text.split("\n").slice(1)) {
          if (line.length !== 0) {
            const entries = line.split(",");
            const taskName = entries[0].trim().toLowerCase();
            const fileOrder = entries[3];
            const audioFileEntry = entries[4];
            const audioFileName =
              conditionText === noiseText
                ? `${fileOrder}_${audioFileEntry.replace("Final", "2Talker")}`
                : audioFileEntry;
            const imageFileName = entries[6];
            if (taskName !== lastTaskName && lastTaskName !== "") {
              for (let i = 0; i < 2; i += 1) {
                trials.push({
                  type: "image-button-response",
                  stimulus: concatenatePaths(
                    wordLearningInNoiseResourcePath,
                    `game-${setText === setAText ? "a" : "b"}-${
                      taskCount + i + 1
                    }.jpg`
                  ),
                  stimulus_height: standardImageHeightPixels,
                  choices: ["Continue"],
                  prompt: "",
                });
              }
              taskCount += 1;
            }
            lastTaskName = taskName;
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
                    trials.push({
                      type: twoDotPluginId,
                      stimulusUrl: concatenatePaths(
                        wordLearningInNoiseResourcePath,
                        audioFileName
                      ),
                      feedbackUrl: concatenatePaths(
                        wordLearningInNoiseResourcePath,
                        "silence.wav"
                      ),
                      imageUrl: trials[trials.length - 6].imageUrl,
                      imageHeight: standardImageHeightPixels,
                      firstChoiceOnsetTimeSeconds: 2.5,
                      firstChoiceOffsetTimeSeconds: 3,
                      secondChoiceOnsetTimeSeconds: 4,
                      secondChoiceOffsetTimeSeconds: 4.5,
                    });
                  } else if (!readyForSecondLineOfPreBreakTwoDotTrial) {
                    preBreakTwoDotAudioFileName = audioFileName;
                    readyForSecondLineOfPreBreakTwoDotTrial = true;
                  } else {
                    trials.push({
                      type: twoDotPluginId,
                      stimulusUrl: concatenatePaths(
                        wordLearningInNoiseResourcePath,
                        preBreakTwoDotAudioFileName
                      ),
                      feedbackUrl: concatenatePaths(
                        wordLearningInNoiseResourcePath,
                        audioFileName
                      ),
                      imageUrl: concatenatePaths(
                        wordLearningInNoiseResourcePath,
                        imageFileName
                      ),
                      imageHeight: standardImageHeightPixels,
                      firstChoiceOnsetTimeSeconds: 2.5,
                      firstChoiceOffsetTimeSeconds: 3,
                      secondChoiceOnsetTimeSeconds: 4,
                      secondChoiceOffsetTimeSeconds: 4.5,
                    });
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
