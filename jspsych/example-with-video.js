import * as pluginClasses from "./plugin.js";

const imageVideoButtonResponsePluginClass =
  pluginClasses.imageVideoButtonResponse(jsPsychModule);
const twoDotWithVideoPluginClass = pluginClasses.twoDotWithVideo(jsPsychModule);

function concatenatePaths(a, b) {
  return `${a}/${b}`;
}

const standardImageHeightPixels = 400;
const bottomRightButtonHTML =
  '<button class="jspsych-btn" style="position: absolute; bottom: 5%; right: 5%">%choice%</button>';

function resourcePath(fileName) {
  return concatenatePaths(wordLearningInNoiseResourcePath, fileName);
}

function main() {
  const jsPsych = initJsPsych();
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
    {
      timeline: [
        {
          type: imageVideoButtonResponsePluginClass,
          stimulusUrl: resourcePath(
            concatenatePaths("Clear Mask Stimuli", "Repetition_BUTTON.mp4")
          ),
          imageUrl: resourcePath("Button.png"),
          imageHeight: standardImageHeightPixels,
          videoHeight: standardImageHeightPixels,
        },
      ],
      loop_function(data) {
        return data.values()[0].repeat;
      },
    },
    {
      timeline: [
        {
          type: imageVideoButtonResponsePluginClass,
          stimulusUrl: resourcePath(
            concatenatePaths("Clear Mask Stimuli", "Repetition_BABY.mp4")
          ),
          imageUrl: resourcePath("Baby.png"),
          imageHeight: standardImageHeightPixels,
          videoHeight: standardImageHeightPixels,
        },
      ],
      loop_function(data) {
        return data.values()[0].repeat;
      },
    },
    {
      type: twoDotWithVideoPluginClass,
      stimulusUrl: resourcePath(
        concatenatePaths("Clear Mask Stimuli", "TwoDot_BABY_CHEETAH.mp4")
      ),
      feedbackUrl: resourcePath(
        concatenatePaths("Clear Mask Stimuli", "TwoDotResponse_BABY.mp4")
      ),
      imageUrl: resourcePath("Baby.png"),
      imageHeight: standardImageHeightPixels,
      videoHeight: standardImageHeightPixels,
      firstChoiceOnsetTimeSeconds: 3.1,
      firstChoiceOffsetTimeSeconds: 3.6,
      secondChoiceOnsetTimeSeconds: 4.43,
      secondChoiceOffsetTimeSeconds: 4.93,
      firstWord: "Baby",
      secondWord: "Cheetah",
      correctWord: "Baby",
    },
    {
      type: jsPsychHtmlButtonResponse,
      stimulus: 'The test is done. Press "Finish" to complete. Thank you.',
      choices: ["Finish"],
      button_html: bottomRightButtonHTML,
    },
  ]);
}

main();
