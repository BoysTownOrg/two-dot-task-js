import * as pluginClasses from "./plugin.js";

const imageVideoButtonResponsePluginClass =
  pluginClasses.imageVideoButtonResponse(jsPsychModule);
const twoDotWithVideoPluginClass = pluginClasses.twoDotWithVideo(jsPsychModule);
const twoDotWithVideoWithoutFeedbackPluginClass =
  pluginClasses.twoDotWithVideoWithoutFeedback(jsPsychModule);
const stopwatchPluginClass = pluginClasses.stopwatch(jsPsychModule);

function concatenatePaths(a, b) {
  return `${a}/${b}`;
}

const standardImageHeightPixels = 400;
const bottomRightButtonHTML =
  '<button class="jspsych-btn" style="position: absolute; bottom: 5%; right: 5%">%choice%</button>';
const clearMaskStimuliDirectory = "Clear Mask Stimuli";

function resourcePath(fileName) {
  return concatenatePaths(wordLearningInNoiseResourcePath, fileName);
}

function resourcePathInDirectory(directory, fileName) {
  return resourcePath(concatenatePaths(directory, fileName));
}

function imageVideoButtonResponseTrial(stimulusFileName, imageFileName) {
  return {
    timeline: [
      {
        type: imageVideoButtonResponsePluginClass,
        stimulusUrl: resourcePathInDirectory(
          clearMaskStimuliDirectory,
          stimulusFileName
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

function blankScreen() {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: "",
    choices: ["Continue"],
    button_html: bottomRightButtonHTML,
  };
}

function repetitionTrial(stimulusFileName, imageFileName) {
  return {
    timeline: [
      blankScreen(),
      imageVideoButtonResponseTrial(stimulusFileName, imageFileName),
    ],
  };
}

function cuedRecallTrial(stimulusFileName, imageFileName) {
  return {
    timeline: [
      blankScreen(),
      imageVideoButtonResponseTrial(stimulusFileName, imageFileName),
    ],
  };
}

function freeRecallTrial(imageFileName) {
  return {
    timeline: [
      blankScreen(),
      imageVideoButtonResponseTrial(
        "What is this one called-.mp4",
        imageFileName
      ),
    ],
  };
}

function twoDotTrialCommonProperties(
  stimulusFileName,
  feedbackFileName,
  imageFileName
) {
  return {
    type: twoDotWithVideoPluginClass,
    stimulusUrl: resourcePathInDirectory(
      clearMaskStimuliDirectory,
      stimulusFileName
    ),
    feedbackUrl: resourcePathInDirectory(
      clearMaskStimuliDirectory,
      feedbackFileName
    ),
    imageUrl: resourcePath(imageFileName),
    imageHeight: standardImageHeightPixels,
  };
}

function twoDotStimulusFileName(firstWord, secondWord) {
  return `TwoDot_${firstWord.toUpperCase()}_${secondWord.toUpperCase()}.mp4`;
}

function twoDotImageFileName(word) {
  return `${word}.png`;
}

function twoDotTrialCommonPropertiesAssumingCommonFileNames(
  firstWord,
  secondWord,
  correctWord
) {
  return {
    ...twoDotTrialCommonProperties(
      twoDotStimulusFileName(firstWord, secondWord),
      `TwoDotResponse_${correctWord.toUpperCase()}.mp4`,
      twoDotImageFileName(correctWord)
    ),
    firstWord,
    secondWord,
    correctWord,
  };
}

function twoDotWithoutFeedbackTrialCommonPropertiesAssumingCommonFileNames(
  firstWord,
  secondWord,
  correctWord
) {
  return {
    type: twoDotWithVideoWithoutFeedbackPluginClass,
    stimulusUrl: resourcePathInDirectory(
      clearMaskStimuliDirectory,
      twoDotStimulusFileName(firstWord, secondWord)
    ),
    imageUrl: resourcePath(twoDotImageFileName(correctWord)),
    imageHeight: standardImageHeightPixels,
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

function twoDotTrial(
  firstWord,
  secondWord,
  correctWord,
  firstOnset,
  secondOnset
) {
  return {
    timeline: [
      {
        type: jsPsychHtmlButtonResponse,
        stimulus: "",
        choices: [""],
        button_html:
          '<div style="height: 200px; width: 200px; border-radius: 100px; background-color: green"></div>',
      },
      {
        ...twoDotTrialCommonPropertiesAssumingCommonFileNames(
          firstWord,
          secondWord,
          correctWord
        ),
        ...twoDotTimingPropertiesAssumingSameLengthWords(
          firstOnset,
          secondOnset
        ),
      },
    ],
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
    {
      type: jsPsychImageButtonResponse,
      stimulus: resourcePath(`game${1}.jpg`),
      stimulus_height: standardImageHeightPixels,
      choices: ["Continue"],
      prompt: "",
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
    {
      type: jsPsychImageButtonResponse,
      stimulus: resourcePath(`game${1}.jpg`),
      stimulus_height: standardImageHeightPixels,
      choices: ["Continue"],
      prompt: "",
      button_html: bottomRightButtonHTML,
    },
    {
      type: jsPsychImageButtonResponse,
      stimulus: resourcePath(`game${2}.jpg`),
      stimulus_height: standardImageHeightPixels,
      choices: ["Continue"],
      prompt: "",
      button_html: bottomRightButtonHTML,
    },
    // Training Block 2
    twoDotTrial("Baby", "Cheetah", "Baby", 3.1, 4.43),
    twoDotTrial("Pizza", "Rooster", "Rooster", 3.01, 4.37),
    twoDotTrial("Binip", "Topin", "Topin", 3, 4.36),
    twoDotTrial("Daevl", "Nedig", "Nedig", 3.21, 4.71),
    twoDotTrial("Kinit", "Topin", "Kinit", 3.14, 4.46),
    twoDotTrial("Daevl", "Kinit", "Daevl", 3.19, 4.72),
    twoDotTrial("Nedig", "Binip", "Binip", 2.93, 4.33),
    // Training Block 3
    twoDotTrial("Topin", "Daevl", "Topin", 3.14, 4.62),
    twoDotTrial("Nedig", "Kinit", "Nedig", 2.96, 4.36),
    twoDotTrial("Binip", "Kinit", "Kinit", 3.09, 4.58),
    twoDotTrial("Daevl", "Nedig", "Daevl", 3.21, 4.71),
    twoDotTrial("Topin", "Binip", "Binip", 3.02, 4.41),
    // Training Block 4
    // ...
    // Free Recall Test
    freeRecallTrial("Baby.png"),
    freeRecallTrial("Rooster.png"),
    freeRecallTrial("Topin.png"),
    freeRecallTrial("Nedig.png"),
    freeRecallTrial("Kinit.png"),
    freeRecallTrial("Daevl.png"),
    freeRecallTrial("Binip.png"),
    // Cued Recall Test
    cuedRecallTrial("CuedRecall_SEE.mp4", "Seesaw.png"),
    cuedRecallTrial("CuedRecall_BAY.mp4", "Baby.png"),
    cuedRecallTrial("CuedRecall_ROO.mp4", "Rooster.png"),
    cuedRecallTrial("CuedRecall_TO.mp4", "Topin.png"),
    cuedRecallTrial("CuedRecall_NE.mp4", "Nedig.png"),
    cuedRecallTrial("CuedRecall_KI.mp4", "Kinit.png"),
    cuedRecallTrial("CuedRecall_DAE.mp4", "Daevl.png"),
    cuedRecallTrial("CuedRecall_BI.mp4", "Binip.png"),
    // 5-Minute Break
    {
      type: stopwatchPluginClass,
      text: 'Take a 5 minute break. Press "Continue" when finished.',
      alarmTimeSeconds: 300,
    },
    // Free Recall Test (Re-test)
    freeRecallTrial("Topin.png"),
    freeRecallTrial("Nedig.png"),
    freeRecallTrial("Kinit.png"),
    freeRecallTrial("Daevl.png"),
    freeRecallTrial("Binip.png"),
    // Cued Recall Test (Re-test)
    cuedRecallTrial("CuedRecall_TO.mp4", "Topin.png"),
    cuedRecallTrial("CuedRecall_NE.mp4", "Nedig.png"),
    cuedRecallTrial("CuedRecall_KI.mp4", "Kinit.png"),
    cuedRecallTrial("CuedRecall_DAE.mp4", "Daevl.png"),
    cuedRecallTrial("CuedRecall_BI.mp4", "Binip.png"),
    // 2-Dot Test (Re-test)
    {
      ...twoDotWithoutFeedbackTrialCommonPropertiesAssumingCommonFileNames(
        "Kinit",
        "Topin",
        "Topin"
      ),
      ...twoDotTimingPropertiesAssumingSameLengthWords(3.14, 4.46),
    },
    // ...
    {
      type: jsPsychHtmlButtonResponse,
      stimulus: 'The test is done. Press "Finish" to complete. Thank you.',
      choices: ["Finish"],
      button_html: bottomRightButtonHTML,
    },
  ]);
}

main();
