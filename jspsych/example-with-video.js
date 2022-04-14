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

function twoDotTimingPropertiesAssumingSameLengthWords(
  firstOnset,
  secondOnset
) {
  const length = 0.5;
  return {
    firstChoiceOnsetTimeSeconds: firstOnset,
    firstChoiceOffsetTimeSeconds: firstOnset + length,
    secondChoiceOnsetTimeSeconds: secondOnset,
    secondChoiceOffsetTimeSeconds: secondOnset + length,
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
    // Training Block 1
    repetitionTrial("Repetition_BUTTON.mp4", "Button.png"),
    repetitionTrial("Repetition_BABY.mp4", "Baby.png"),
    repetitionTrial("Repetition_ROOSTER.mp4", "Rooster.png"),
    repetitionTrial("Repetition_TOPIN.mp4", "Topin.png"),
    repetitionTrial("Repetition_NEDIG.mp4", "Nedig.png"),
    repetitionTrial("Repetition_KINIT.mp4", "Kinit.png"),
    repetitionTrial("Repetition_DAEVL.mp4", "Daevl.png"),
    repetitionTrial("Repetition_BINIP.mp4", "Binip.png"),
    // Training Block 2
    {
      ...twoDotTrialCommonPropertiesAssumingCommonFileNames(
        "Baby",
        "Cheetah",
        "Baby"
      ),
      ...twoDotTimingPropertiesAssumingSameLengthWords(3.1, 4.43),
    },
    {
      ...twoDotTrialCommonPropertiesAssumingCommonFileNames(
        "Pizza",
        "Rooster",
        "Rooster"
      ),
      ...twoDotTimingPropertiesAssumingSameLengthWords(3.01, 4.37),
    },
    {
      ...twoDotTrialCommonPropertiesAssumingCommonFileNames(
        "Binip",
        "Topin",
        "Topin"
      ),
      ...twoDotTimingPropertiesAssumingSameLengthWords(3, 4.36),
    },
    {
      ...twoDotTrialCommonPropertiesAssumingCommonFileNames(
        "Daevl",
        "Nedig",
        "Nedig"
      ),
      ...twoDotTimingPropertiesAssumingSameLengthWords(3.21, 4.71),
    },
    {
      ...twoDotTrialCommonPropertiesAssumingCommonFileNames(
        "Kinit",
        "Topin",
        "Kinit"
      ),
      ...twoDotTimingPropertiesAssumingSameLengthWords(3.14, 4.46),
    },
    {
      ...twoDotTrialCommonPropertiesAssumingCommonFileNames(
        "Daevl",
        "Kinit",
        "Daevl"
      ),
      ...twoDotTimingPropertiesAssumingSameLengthWords(3.19, 4.72),
    },
    {
      ...twoDotTrialCommonPropertiesAssumingCommonFileNames(
        "Nedig",
        "Binip",
        "Binip"
      ),
      ...twoDotTimingPropertiesAssumingSameLengthWords(2.93, 4.33),
    },
    // Training Block 3
    {
      ...twoDotTrialCommonPropertiesAssumingCommonFileNames(
        "Topin",
        "Daevl",
        "Topin"
      ),
      ...twoDotTimingPropertiesAssumingSameLengthWords(3.14, 4.62),
    },
    {
      ...twoDotTrialCommonPropertiesAssumingCommonFileNames(
        "Nedig",
        "Kinit",
        "Nedig"
      ),
      ...twoDotTimingPropertiesAssumingSameLengthWords(2.96, 4.36),
    },
    {
      ...twoDotTrialCommonPropertiesAssumingCommonFileNames(
        "Binip",
        "Kinit",
        "Binip"
      ),
      ...twoDotTimingPropertiesAssumingSameLengthWords(3.09, 4.58),
    },
    {
      ...twoDotTrialCommonPropertiesAssumingCommonFileNames(
        "Daevl",
        "Nedig",
        "Daevl"
      ),
      ...twoDotTimingPropertiesAssumingSameLengthWords(3.21, 4.71),
    },
    {
      ...twoDotTrialCommonPropertiesAssumingCommonFileNames(
        "Topin",
        "Binip",
        "Binip"
      ),
      ...twoDotTimingPropertiesAssumingSameLengthWords(3.02, 4.41),
    },
    // Training Block 4
    {
      ...twoDotTrialCommonPropertiesAssumingCommonFileNames(
        "Topin",
        "Nedig",
        "Topin"
      ),
      ...twoDotTimingPropertiesAssumingSameLengthWords(2.78, 4.14),
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
