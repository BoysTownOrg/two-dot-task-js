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

function repetitionTrial(stimulusFileName, imageFileName) {
  return {
    timeline: [
      {
        type: imageVideoButtonResponsePluginClass,
        stimulusUrl: resourcePath(
          concatenatePaths("Clear Mask Stimuli", stimulusFileName)
        ),
        imageUrl: resourcePath(imageFileName),
        imageHeight: standardImageHeightPixels,
        videoHeight: standardImageHeightPixels,
      },
    ],
    loop_function(data) {
      return data.values()[0].repeat;
    },
  };
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
    repetitionTrial("Repetition_BUTTON.mp4", "Button.png"),
    repetitionTrial("Repetition_BABY.mp4", "Baby.png"),
    repetitionTrial("Repetition_ROOSTER.mp4", "Rooster.png"),
    repetitionTrial("Repetition_TOPIN.mp4", "Topin.png"),
    repetitionTrial("Repetition_NEDIG.mp4", "Nedig.png"),
    repetitionTrial("Repetition_KINIT.mp4", "Kinit.png"),
    repetitionTrial("Repetition_DAEVL.mp4", "Daevl.png"),
    repetitionTrial("Repetition_BINIP.mp4", "Binip.png"),
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
