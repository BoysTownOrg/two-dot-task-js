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

function twoDotTrialCommonProperties(
  stimulusFileName,
  feedbackFileName,
  imageFileName
) {
  return {
    type: twoDotWithVideoPluginClass,
    stimulusUrl: resourcePath(
      concatenatePaths("Clear Mask Stimuli", stimulusFileName)
    ),
    feedbackUrl: resourcePath(
      concatenatePaths("Clear Mask Stimuli", feedbackFileName)
    ),
    imageUrl: resourcePath(imageFileName),
    imageHeight: standardImageHeightPixels,
    videoHeight: standardImageHeightPixels,
  };
}

function twoDotTrialCommonPropertiesAssumingCommonFileNames(
  firstWord,
  secondWord,
  correctWord
) {
  return {
    ...twoDotTrialCommonProperties(
      `TwoDot_${firstWord.toUpperCase()}_${secondWord.toUpperCase()}.mp4`,
      `TwoDotResponse_${correctWord.toUpperCase()}.mp4`,
      `${correctWord}.png`
    ),
    firstWord,
    secondWord,
    correctWord,
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
      ...twoDotTrialCommonPropertiesAssumingCommonFileNames(
        "Baby",
        "Cheetah",
        "Baby"
      ),
      firstChoiceOnsetTimeSeconds: 3.1,
      firstChoiceOffsetTimeSeconds: 3.6,
      secondChoiceOnsetTimeSeconds: 4.43,
      secondChoiceOffsetTimeSeconds: 4.93,
    },
    {
      ...twoDotTrialCommonPropertiesAssumingCommonFileNames(
        "Pizza",
        "Rooster",
        "Rooster"
      ),
      firstChoiceOnsetTimeSeconds: 3.01,
      firstChoiceOffsetTimeSeconds: 3.51,
      secondChoiceOnsetTimeSeconds: 4.37,
      secondChoiceOffsetTimeSeconds: 4.87,
    },
    {
      ...twoDotTrialCommonPropertiesAssumingCommonFileNames(
        "Binip",
        "Topin",
        "Topin"
      ),
      firstChoiceOnsetTimeSeconds: 3,
      firstChoiceOffsetTimeSeconds: 3.5,
      secondChoiceOnsetTimeSeconds: 4.36,
      secondChoiceOffsetTimeSeconds: 4.86,
    },
    {
      ...twoDotTrialCommonPropertiesAssumingCommonFileNames(
        "Daevl",
        "Nedig",
        "Nedig"
      ),
      firstChoiceOnsetTimeSeconds: 3.21,
      firstChoiceOffsetTimeSeconds: 3.71,
      secondChoiceOnsetTimeSeconds: 4.71,
      secondChoiceOffsetTimeSeconds: 5.21,
    },
    {
      ...twoDotTrialCommonPropertiesAssumingCommonFileNames(
        "Kinit",
        "Topin",
        "Kinit"
      ),
      firstChoiceOnsetTimeSeconds: 3.14,
      firstChoiceOffsetTimeSeconds: 3.64,
      secondChoiceOnsetTimeSeconds: 4.46,
      secondChoiceOffsetTimeSeconds: 4.96,
    },
    {
      ...twoDotTrialCommonPropertiesAssumingCommonFileNames(
        "Daevl",
        "Kinit",
        "Daevl"
      ),
      firstChoiceOnsetTimeSeconds: 3.19,
      firstChoiceOffsetTimeSeconds: 3.69,
      secondChoiceOnsetTimeSeconds: 4.72,
      secondChoiceOffsetTimeSeconds: 5.22,
    },
    {
      ...twoDotTrialCommonPropertiesAssumingCommonFileNames(
        "Nedig",
        "Binip",
        "Binip"
      ),
      firstChoiceOnsetTimeSeconds: 2.93,
      firstChoiceOffsetTimeSeconds: 3.43,
      secondChoiceOnsetTimeSeconds: 4.33,
      secondChoiceOffsetTimeSeconds: 4.83,
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
