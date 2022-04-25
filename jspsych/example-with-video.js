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

function imageFileNameFromWord(word) {
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
      imageFileNameFromWord(correctWord)
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
    imageUrl: resourcePath(imageFileNameFromWord(correctWord)),
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

function gameTrial(n) {
  return {
    type: jsPsychImageButtonResponse,
    stimulus: resourcePath(`game${n + 1}.jpg`),
    stimulus_height: standardImageHeightPixels,
    choices: ["Continue"],
    prompt: "",
    button_html: bottomRightButtonHTML,
  };
}

function gameTransition(n) {
  return { timeline: [gameTrial(n), gameTrial(n + 1)] };
}

function repetitionTrialAssumingCommonFileNames(word) {
  return repetitionTrial(
    `Repetition_${word.toUpperCase()}.mp4`,
    imageFileNameFromWord(word)
  );
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
    gameTrial(0),
    // Training Block 1
    repetitionTrialAssumingCommonFileNames("Button"),
    repetitionTrialAssumingCommonFileNames("Baby"),
    repetitionTrialAssumingCommonFileNames("Rooster"),
    repetitionTrialAssumingCommonFileNames("Topin"),
    repetitionTrialAssumingCommonFileNames("Nedig"),
    repetitionTrialAssumingCommonFileNames("Kinit"),
    repetitionTrialAssumingCommonFileNames("Daevl"),
    repetitionTrialAssumingCommonFileNames("Binip"),
    gameTransition(0),
    // Training Block 2
    twoDotTrial("Baby", "Cheetah", "Baby", 3.1, 4.43),
    twoDotTrial("Pizza", "Rooster", "Rooster", 3.01, 4.37),
    twoDotTrial("Binip", "Topin", "Topin", 3, 4.36),
    twoDotTrial("Daevl", "Nedig", "Nedig", 3.21, 4.71),
    twoDotTrial("Kinit", "Topin", "Kinit", 3.14, 4.46),
    twoDotTrial("Daevl", "Kinit", "Daevl", 3.19, 4.72),
    twoDotTrial("Nedig", "Binip", "Binip", 2.93, 4.33),
    gameTransition(1),
    // Training Block 3
    twoDotTrial("Topin", "Daevl", "Topin", 3.14, 4.62),
    twoDotTrial("Nedig", "Kinit", "Nedig", 2.96, 4.36),
    twoDotTrial("Binip", "Kinit", "Kinit", 3.09, 4.58),
    twoDotTrial("Daevl", "Nedig", "Daevl", 3.21, 4.71),
    twoDotTrial("Topin", "Binip", "Binip", 3.02, 4.41),
    gameTransition(2),
    // Training Block 4
    // ...
    // Free Recall Test
    freeRecallTrial(imageFileNameFromWord("Baby")),
    freeRecallTrial(imageFileNameFromWord("Rooster")),
    freeRecallTrial(imageFileNameFromWord("Topin")),
    freeRecallTrial(imageFileNameFromWord("Nedig")),
    freeRecallTrial(imageFileNameFromWord("Kinit")),
    freeRecallTrial(imageFileNameFromWord("Daevl")),
    freeRecallTrial(imageFileNameFromWord("Binip")),
    gameTransition(3),
    // Cued Recall Test
    cuedRecallTrial("CuedRecall_SEE.mp4", imageFileNameFromWord("Seesaw")),
    cuedRecallTrial("CuedRecall_BAY.mp4", imageFileNameFromWord("Baby")),
    cuedRecallTrial("CuedRecall_ROO.mp4", imageFileNameFromWord("Rooster")),
    cuedRecallTrial("CuedRecall_TO.mp4", imageFileNameFromWord("Topin")),
    cuedRecallTrial("CuedRecall_NE.mp4", imageFileNameFromWord("Nedig")),
    cuedRecallTrial("CuedRecall_KI.mp4", imageFileNameFromWord("Kinit")),
    cuedRecallTrial("CuedRecall_DAE.mp4", imageFileNameFromWord("Daevl")),
    cuedRecallTrial("CuedRecall_BI.mp4", imageFileNameFromWord("Binip")),
    gameTransition(4),
    // 5-Minute Break
    {
      type: stopwatchPluginClass,
      text: 'Take a 5 minute break. Press "Continue" when finished.',
      alarmTimeSeconds: 300,
    },
    gameTrial(6),
    // Free Recall Test (Re-test)
    freeRecallTrial(imageFileNameFromWord("Topin")),
    freeRecallTrial(imageFileNameFromWord("Nedig")),
    freeRecallTrial(imageFileNameFromWord("Kinit")),
    freeRecallTrial(imageFileNameFromWord("Daevl")),
    freeRecallTrial(imageFileNameFromWord("Binip")),
    gameTransition(6),
    // Cued Recall Test (Re-test)
    cuedRecallTrial("CuedRecall_TO.mp4", imageFileNameFromWord("Topin")),
    cuedRecallTrial("CuedRecall_NE.mp4", imageFileNameFromWord("Nedig")),
    cuedRecallTrial("CuedRecall_KI.mp4", imageFileNameFromWord("Kinit")),
    cuedRecallTrial("CuedRecall_DAE.mp4", imageFileNameFromWord("Daevl")),
    cuedRecallTrial("CuedRecall_BI.mp4", imageFileNameFromWord("Binip")),
    gameTransition(7),
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
    gameTransition(8),
    {
      type: jsPsychHtmlButtonResponse,
      stimulus: 'The test is done. Press "Finish" to complete. Thank you.',
      choices: ["Finish"],
      button_html: bottomRightButtonHTML,
    },
  ]);
}

main();
