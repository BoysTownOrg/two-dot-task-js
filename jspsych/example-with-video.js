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

function resourcePath(fileName) {
  return concatenatePaths(wordLearningInNoiseResourcePath, fileName);
}

function resourcePathInDirectory(directory, fileName) {
  return resourcePath(concatenatePaths(directory, fileName));
}

function imageVideoButtonResponseTrial(
  stimuliDirectory,
  stimulusFileName,
  imageFileName
) {
  return {
    timeline: [
      {
        type: imageVideoButtonResponsePluginClass,
        stimulusUrl: resourcePathInDirectory(
          stimuliDirectory,
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

function repetitionTrial(stimuliDirectory, stimulusFileName, imageFileName) {
  return {
    timeline: [
      blankScreen(),
      imageVideoButtonResponseTrial(
        stimuliDirectory,
        stimulusFileName,
        imageFileName
      ),
    ],
  };
}

function cuedRecallTrialAssumingCommonFilenames(
  stimuliDirectory,
  stimulusCue,
  imageFileName
) {
  return {
    timeline: [
      blankScreen(),
      imageVideoButtonResponseTrial(
        stimuliDirectory,
        `CuedRecall_${stimulusCue.toUpperCase()}.mp4`,
        imageFileName
      ),
    ],
  };
}

function freeRecallTrial(stimuliDirectory, imageFileName) {
  return {
    timeline: [
      blankScreen(),
      imageVideoButtonResponseTrial(
        stimuliDirectory,
        "What is this one called-.mp4",
        imageFileName
      ),
    ],
  };
}

function twoDotTrialCommonProperties(
  stimuliDirectory,
  stimulusFileName,
  feedbackFileName,
  imageFileName
) {
  return {
    type: twoDotWithVideoPluginClass,
    stimulusUrl: resourcePathInDirectory(stimuliDirectory, stimulusFileName),
    feedbackUrl: resourcePathInDirectory(stimuliDirectory, feedbackFileName),
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
  stimuliDirectory,
  firstWord,
  secondWord,
  correctWord
) {
  return {
    ...twoDotTrialCommonProperties(
      stimuliDirectory,
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
  stimuliDirectory,
  firstWord,
  secondWord,
  correctWord
) {
  return {
    type: twoDotWithVideoWithoutFeedbackPluginClass,
    stimulusUrl: resourcePathInDirectory(
      stimuliDirectory,
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
  stimuliDirectory,
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
          stimuliDirectory,
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

function repetitionTrialAssumingCommonFileNames(stimuliDirectory, word) {
  return repetitionTrial(
    stimuliDirectory,
    `Repetition_${word.toUpperCase()}.mp4`,
    imageFileNameFromWord(word)
  );
}

const clearMaskConditionText = "Clear Mask AV";
const disposableMaskConditionText = "Disposable Mask AV";

function notifyThatConfirmButtonHasBeenClicked(page, conditionSelect) {
  document.body.removeChild(page);
  const condition = conditionSelect.options.item(
    conditionSelect.selectedIndex
  ).textContent;
  let stimuliDirectory = "";
  switch (condition) {
    case disposableMaskConditionText:
      stimuliDirectory = "Disposable Mask Stimuli";
      break;
    case clearMaskConditionText:
    default:
      stimuliDirectory = "Clear Mask Stimuli";
  }
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
    repetitionTrialAssumingCommonFileNames(stimuliDirectory, "Button"),
    repetitionTrialAssumingCommonFileNames(stimuliDirectory, "Baby"),
    repetitionTrialAssumingCommonFileNames(stimuliDirectory, "Rooster"),
    repetitionTrialAssumingCommonFileNames(stimuliDirectory, "Topin"),
    repetitionTrialAssumingCommonFileNames(stimuliDirectory, "Nedig"),
    repetitionTrialAssumingCommonFileNames(stimuliDirectory, "Kinit"),
    repetitionTrialAssumingCommonFileNames(stimuliDirectory, "Daevl"),
    repetitionTrialAssumingCommonFileNames(stimuliDirectory, "Binip"),
    gameTransition(0),
    // Training Block 2
    twoDotTrial(stimuliDirectory, "Baby", "Cheetah", "Baby", 3.1, 4.43),
    twoDotTrial(stimuliDirectory, "Pizza", "Rooster", "Rooster", 3.01, 4.37),
    twoDotTrial(stimuliDirectory, "Binip", "Topin", "Topin", 3, 4.36),
    twoDotTrial(stimuliDirectory, "Daevl", "Nedig", "Nedig", 3.21, 4.71),
    twoDotTrial(stimuliDirectory, "Kinit", "Topin", "Kinit", 3.14, 4.46),
    twoDotTrial(stimuliDirectory, "Daevl", "Kinit", "Daevl", 3.19, 4.72),
    twoDotTrial(stimuliDirectory, "Nedig", "Binip", "Binip", 2.93, 4.33),
    gameTransition(1),
    // Training Block 3
    twoDotTrial(stimuliDirectory, "Topin", "Daevl", "Topin", 3.14, 4.62),
    twoDotTrial(stimuliDirectory, "Nedig", "Kinit", "Nedig", 2.96, 4.36),
    twoDotTrial(stimuliDirectory, "Binip", "Kinit", "Kinit", 3.09, 4.58),
    twoDotTrial(stimuliDirectory, "Daevl", "Nedig", "Daevl", 3.21, 4.71),
    twoDotTrial(stimuliDirectory, "Topin", "Binip", "Binip", 3.02, 4.41),
    gameTransition(2),
    // Training Block 4
    // ...
    // Free Recall Test
    freeRecallTrial(stimuliDirectory, imageFileNameFromWord("Baby")),
    freeRecallTrial(stimuliDirectory, imageFileNameFromWord("Rooster")),
    freeRecallTrial(stimuliDirectory, imageFileNameFromWord("Topin")),
    freeRecallTrial(stimuliDirectory, imageFileNameFromWord("Nedig")),
    freeRecallTrial(stimuliDirectory, imageFileNameFromWord("Kinit")),
    freeRecallTrial(stimuliDirectory, imageFileNameFromWord("Daevl")),
    freeRecallTrial(stimuliDirectory, imageFileNameFromWord("Binip")),
    gameTransition(3),
    // Cued Recall Test
    cuedRecallTrialAssumingCommonFilenames(
      stimuliDirectory,
      "SEE",
      imageFileNameFromWord("Seesaw")
    ),
    cuedRecallTrialAssumingCommonFilenames(
      stimuliDirectory,
      "BAY",
      imageFileNameFromWord("Baby")
    ),
    cuedRecallTrialAssumingCommonFilenames(
      stimuliDirectory,
      "ROO",
      imageFileNameFromWord("Rooster")
    ),
    cuedRecallTrialAssumingCommonFilenames(
      stimuliDirectory,
      "TO",
      imageFileNameFromWord("Topin")
    ),
    cuedRecallTrialAssumingCommonFilenames(
      stimuliDirectory,
      "NE",
      imageFileNameFromWord("Nedig")
    ),
    cuedRecallTrialAssumingCommonFilenames(
      stimuliDirectory,
      "KI",
      imageFileNameFromWord("Kinit")
    ),
    cuedRecallTrialAssumingCommonFilenames(
      stimuliDirectory,
      "DAE",
      imageFileNameFromWord("Daevl")
    ),
    cuedRecallTrialAssumingCommonFilenames(
      stimuliDirectory,
      "BI",
      imageFileNameFromWord("Binip")
    ),
    gameTransition(4),
    // 5-Minute Break
    {
      type: stopwatchPluginClass,
      text: 'Take a 5 minute break. Press "Continue" when finished.',
      alarmTimeSeconds: 300,
    },
    gameTrial(6),
    // Free Recall Test (Re-test)
    freeRecallTrial(stimuliDirectory, imageFileNameFromWord("Topin")),
    freeRecallTrial(stimuliDirectory, imageFileNameFromWord("Nedig")),
    freeRecallTrial(stimuliDirectory, imageFileNameFromWord("Kinit")),
    freeRecallTrial(stimuliDirectory, imageFileNameFromWord("Daevl")),
    freeRecallTrial(stimuliDirectory, imageFileNameFromWord("Binip")),
    gameTransition(6),
    // Cued Recall Test (Re-test)
    cuedRecallTrialAssumingCommonFilenames(
      stimuliDirectory,
      "TO",
      imageFileNameFromWord("Topin")
    ),
    cuedRecallTrialAssumingCommonFilenames(
      stimuliDirectory,
      "NE",
      imageFileNameFromWord("Nedig")
    ),
    cuedRecallTrialAssumingCommonFilenames(
      stimuliDirectory,
      "KI",
      imageFileNameFromWord("Kinit")
    ),
    cuedRecallTrialAssumingCommonFilenames(
      stimuliDirectory,
      "DAE",
      imageFileNameFromWord("Daevl")
    ),
    cuedRecallTrialAssumingCommonFilenames(
      stimuliDirectory,
      "BI",
      imageFileNameFromWord("Binip")
    ),
    gameTransition(7),
    // 2-Dot Test (Re-test)
    {
      ...twoDotWithoutFeedbackTrialCommonPropertiesAssumingCommonFileNames(
        stimuliDirectory,
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

function createChildElement(parent, tag) {
  const child = document.createElement(tag);
  parent.append(child);
  return child;
}

function main() {
  const page = createChildElement(document.body, "div");
  const conditionLabel = createChildElement(
    createChildElement(page, "div"),
    "label"
  );
  conditionLabel.textContent = "Condition";
  const conditionSelect = createChildElement(conditionLabel, "select");
  createChildElement(conditionSelect, "option").textContent =
    clearMaskConditionText;
  createChildElement(conditionSelect, "option").textContent =
    disposableMaskConditionText;
  createChildElement(conditionSelect, "option").textContent = "No Mask AO";
  createChildElement(conditionSelect, "option").textContent = "Clear Mask AO";
  const confirmButton = createChildElement(page, "button");
  confirmButton.textContent = "Confirm";
  confirmButton.addEventListener("click", () => {
    notifyThatConfirmButtonHasBeenClicked(page, conditionSelect);
  });
}

main();
