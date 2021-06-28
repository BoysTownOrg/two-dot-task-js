import {
  plugin as twoDotPlugin,
  imageAudioButtonResponse as imageAudioButtonResponsePlugin,
  imageAudioWithFeedback as imageAudioWithFeedbackPlugin,
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

  const imageAudioWithFeedbackPluginId =
    "image-audio-with-feedback-button-response";
  jsPsych.plugins[imageAudioWithFeedbackPluginId] =
    imageAudioWithFeedbackPlugin(imageAudioWithFeedbackPluginId);

  const page = document.createElement("div");
  const condition = document.createElement("div");
  const conditionLabel = document.createElement("label");
  conditionLabel.textContent = "Condition: ";
  const conditionSelect = document.createElement("select");
  const conditionA = document.createElement("option");
  conditionA.textContent = "A";
  const conditionB = document.createElement("option");
  conditionB.textContent = "B";
  conditionSelect.append(conditionA);
  conditionSelect.append(conditionB);
  condition.append(conditionLabel);
  condition.append(conditionSelect);
  const startButton = document.createElement("button");
  startButton.textContent = "Start";
  startButton.addEventListener("click", () => {
    const trialsFileName =
      conditionSelect.options.item(conditionSelect.selectedIndex)
        .textContent === "A"
        ? "set-a.csv"
        : "set-b.csv";
    document.body.removeChild(page);

    const trials = [];
    fetch(trialsFileName)
      .then((p) => p.text())
      .then((text) => {
        let stimulusFileNameOnDeck = "";
        let stimulusHasBeenRead = false;
        let pastFiveMinuteBreak = false;
        let lastTaskName = "";
        let taskCount = 0;
        for (const line of text.split("\n").slice(2)) {
          const entries = line.split(",");
          const taskName = entries[0].trim().toLowerCase();
          const audioFileName = entries[4];
          const targetImage = entries[5];
          const imageFileName = entries[6];
          if (taskName !== lastTaskName && lastTaskName !== "") {
            trials.push({
              type: "image-button-response",
              stimulus: concatenatePaths(
                wordLearningInNoiseResourcePath,
                `Slide${taskCount + 1}.PNG`
              ),
              stimulus_height: standardImageHeightPixels,
              choices: ["Continue"],
              prompt: "",
            });
            trials.push({
              type: "image-button-response",
              stimulus: concatenatePaths(
                wordLearningInNoiseResourcePath,
                `Slide${taskCount + 2}.PNG`
              ),
              stimulus_height: standardImageHeightPixels,
              choices: ["Continue"],
              prompt: "",
            });
            taskCount += 1;
          }
          lastTaskName = taskName;
          switch (taskName) {
            case "repetition":
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
              if (!stimulusHasBeenRead) {
                stimulusFileNameOnDeck = audioFileName;
                stimulusHasBeenRead = true;
              } else if (pastFiveMinuteBreak) {
                trials.push({
                  type: twoDotPluginId,
                  stimulusUrl: concatenatePaths(
                    wordLearningInNoiseResourcePath,
                    audioFileName
                  ),
                  feedbackUrl: trials[trials.length - 5].feedbackUrl,
                  imageUrl: trials[trials.length - 5].imageUrl,
                  imageHeight: standardImageHeightPixels,
                  firstChoiceOnsetTimeSeconds: 2.5,
                  firstChoiceOffsetTimeSeconds: 3,
                  secondChoiceOnsetTimeSeconds: 4,
                  secondChoiceOffsetTimeSeconds: 4.5,
                });
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
            case "free recall test":
              trials.push({
                type: imageAudioWithFeedbackPluginId,
                stimulusUrl: concatenatePaths(
                  wordLearningInNoiseResourcePath,
                  audioFileName
                ),
                feedbackUrl: concatenatePaths(
                  wordLearningInNoiseResourcePath,
                  `Feedback_${targetImage.toUpperCase()}_Final.wav`
                ),
                imageUrl: concatenatePaths(
                  wordLearningInNoiseResourcePath,
                  imageFileName
                ),
                imageHeight: standardImageHeightPixels,
              });
              break;
            case "cued recall test":
              trials.push({
                type: imageAudioWithFeedbackPluginId,
                stimulusUrl: concatenatePaths(
                  wordLearningInNoiseResourcePath,
                  audioFileName
                ),
                feedbackUrl: concatenatePaths(
                  wordLearningInNoiseResourcePath,
                  `Feedback_${targetImage.toUpperCase()}_Final.wav`
                ),
                imageUrl: concatenatePaths(
                  wordLearningInNoiseResourcePath,
                  imageFileName
                ),
                imageHeight: standardImageHeightPixels,
              });
              break;
            case "5-minute break":
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
            ...trials,
          ],
        });
      });
  });
  page.append(condition);
  page.append(startButton);
  document.body.append(page);
}

main();
