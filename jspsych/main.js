import {
  plugin as twoDotPlugin,
  imageAudioButtonResponse as imageAudioButtonResponsePlugin,
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
  const confirmButton = document.createElement("button");
  confirmButton.textContent = "Confirm";
  confirmButton.addEventListener("click", () => {
    const trialsFileName =
      setSelect.options.item(setSelect.selectedIndex).textContent === setAText
        ? "set-a.csv"
        : "set-b.csv";
    document.body.removeChild(page);

    fetch(concatenatePaths(wordLearningInNoiseResourcePath, trialsFileName))
      .then((p) => p.text())
      .then((text) => {
        const trials = [];
        let stimulusFileNameOnDeck = "";
        let stimulusHasBeenRead = false;
        let pastFiveMinuteBreak = false;
        let lastTaskName = "";
        let taskCount = 0;
        for (const line of text.split("\n").slice(1)) {
          const entries = line.split(",");
          const taskName = entries[0].trim().toLowerCase();
          const audioFileName = entries[4];
          const imageFileName = entries[6];
          if (taskName !== lastTaskName && lastTaskName !== "") {
            for (let i = 0; i < 2; i += 1) {
              trials.push({
                type: "image-button-response",
                stimulus: concatenatePaths(
                  wordLearningInNoiseResourcePath,
                  `Slide${taskCount + i + 1}.jpg`
                ),
                stimulus_height: standardImageHeightPixels,
                choices: ["Continue"],
                prompt: "",
              });
            }
            taskCount += 1;
          }
          lastTaskName = taskName;
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
              if (pastFiveMinuteBreak) {
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
              } else if (!stimulusHasBeenRead) {
                stimulusFileNameOnDeck = audioFileName;
                stimulusHasBeenRead = true;
              } else {
                trials.push({
                  type: twoDotPluginId,
                  stimulusUrl: concatenatePaths(
                    wordLearningInNoiseResourcePath,
                    stimulusFileNameOnDeck
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
                stimulusHasBeenRead = false;
              }
              break;
            case "5-minute break":
              trials.push({
                type: "html-button-response",
                stimulus:
                  'Take a 5 minute break. Press "Continue" when finished.',
                choices: ["Continue"],
              });
              pastFiveMinuteBreak = true;
              taskCount += 1;
              lastTaskName = "";
              break;
            default:
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
      });
  });
  page.append(set);
  page.append(confirmButton);
  document.body.append(page);
}

main();
