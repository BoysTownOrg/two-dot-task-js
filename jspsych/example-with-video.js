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
  stimulusExtension,
  stimulusCue,
  imageFileName
) {
  return {
    timeline: [
      blankScreen(),
      imageVideoButtonResponseTrial(
        stimuliDirectory,
        `CuedRecall_${stimulusCue.toUpperCase()}.${stimulusExtension}`,
        imageFileName
      ),
    ],
  };
}

function freeRecallTrial(stimuliDirectory, stimulusExtension, imageFileName) {
  return {
    timeline: [
      blankScreen(),
      imageVideoButtonResponseTrial(
        stimuliDirectory,
        `What is this one called-.${stimulusExtension}`,
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

function twoDotStimulusFileName(stimulusExtension, firstWord, secondWord) {
  return `TwoDot_${firstWord.toUpperCase()}_${secondWord.toUpperCase()}.${stimulusExtension}`;
}

function imageFileNameFromWord(word) {
  return `${word}.png`;
}

function twoDotTrialCommonPropertiesAssumingCommonFileNames(
  stimuliDirectory,
  stimulusExtension,
  firstWord,
  secondWord,
  correctWord
) {
  return {
    ...twoDotTrialCommonProperties(
      stimuliDirectory,
      twoDotStimulusFileName(stimulusExtension, firstWord, secondWord),
      `TwoDotResponse_${correctWord.toUpperCase()}.${stimulusExtension}`,
      imageFileNameFromWord(correctWord)
    ),
    firstWord,
    secondWord,
    correctWord,
  };
}

function twoDotWithoutFeedbackTrialCommonPropertiesAssumingCommonFileNames(
  stimuliDirectory,
  stimulusExtension,
  firstWord,
  secondWord,
  correctWord
) {
  return {
    type: twoDotWithVideoWithoutFeedbackPluginClass,
    stimulusUrl: resourcePathInDirectory(
      stimuliDirectory,
      twoDotStimulusFileName(stimulusExtension, firstWord, secondWord)
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
  stimulusExtension,
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
          stimulusExtension,
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

function repetitionTrialAssumingCommonFileNames(
  stimuliDirectory,
  stimulusExtension,
  word
) {
  return repetitionTrial(
    stimuliDirectory,
    `Repetition_${word.toUpperCase()}.${stimulusExtension}`,
    imageFileNameFromWord(word)
  );
}

const clearMaskConditionText = "Clear Mask AV";
const disposableMaskConditionText = "Disposable Mask AV";
const noMaskAuditoryOnlyConditionText = "No Mask AO";
const clearMaskAuditoryOnlyConditionText = "Clear Mask AO";

function notifyThatConfirmButtonHasBeenClicked(page, conditionSelect) {
  document.body.removeChild(page);
  const condition = conditionSelect.options.item(
    conditionSelect.selectedIndex
  ).textContent;
  const videoExtension = "mp4";
  const audioExtension = "wav";
  let stimuliDirectory = "";
  let stimulusExtension = "";
  switch (condition) {
    case noMaskAuditoryOnlyConditionText:
      stimuliDirectory = "No Mask AO";
      stimulusExtension = audioExtension;
      break;
    case clearMaskAuditoryOnlyConditionText:
      stimuliDirectory = "Clear Mask AO";
      stimulusExtension = audioExtension;
      break;
    case disposableMaskConditionText:
      stimuliDirectory = "Disposable Mask Stimuli";
      stimulusExtension = videoExtension;
      break;
    case clearMaskConditionText:
    default:
      stimuliDirectory = "Clear Mask Stimuli";
      stimulusExtension = videoExtension;
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
    {
      type: jsPsychImageButtonResponse,
      stimulus: resourcePath("Button.png"),
      stimulus_height: standardImageHeightPixels,
      choices: ["Continue"],
      prompt: "",
      button_html: bottomRightButtonHTML,
    },
    repetitionTrialAssumingCommonFileNames(
      stimuliDirectory,
      stimulusExtension,
      "Baby"
    ),
    repetitionTrialAssumingCommonFileNames(
      stimuliDirectory,
      stimulusExtension,
      "Rooster"
    ),
    repetitionTrialAssumingCommonFileNames(
      stimuliDirectory,
      stimulusExtension,
      "Topin"
    ),
    repetitionTrialAssumingCommonFileNames(
      stimuliDirectory,
      stimulusExtension,
      "Nedig"
    ),
    repetitionTrialAssumingCommonFileNames(
      stimuliDirectory,
      stimulusExtension,
      "Kinit"
    ),
    repetitionTrialAssumingCommonFileNames(
      stimuliDirectory,
      stimulusExtension,
      "Daevl"
    ),
    repetitionTrialAssumingCommonFileNames(
      stimuliDirectory,
      stimulusExtension,
      "Binip"
    ),
    gameTransition(0),
    // Training Block 2
    twoDotTrial(
      stimuliDirectory,
      stimulusExtension,
      "Baby",
      "Cheetah",
      "Baby",
      3.1,
      4.43
    ),
    twoDotTrial(
      stimuliDirectory,
      stimulusExtension,
      "Pizza",
      "Rooster",
      "Rooster",
      3.01,
      4.37
    ),
    twoDotTrial(
      stimuliDirectory,
      stimulusExtension,
      "Binip",
      "Topin",
      "Topin",
      3,
      4.36
    ),
    twoDotTrial(
      stimuliDirectory,
      stimulusExtension,
      "Daevl",
      "Nedig",
      "Nedig",
      3.21,
      4.71
    ),
    twoDotTrial(
      stimuliDirectory,
      stimulusExtension,
      "Kinit",
      "Topin",
      "Kinit",
      3.14,
      4.46
    ),
    twoDotTrial(
      stimuliDirectory,
      stimulusExtension,
      "Daevl",
      "Kinit",
      "Daevl",
      3.19,
      4.72
    ),
    twoDotTrial(
      stimuliDirectory,
      stimulusExtension,
      "Nedig",
      "Binip",
      "Binip",
      2.93,
      4.33
    ),
    gameTransition(1),
    // Training Block 3
    twoDotTrial(
      stimuliDirectory,
      stimulusExtension,
      "Topin",
      "Daevl",
      "Topin",
      3.14,
      4.62
    ),
    twoDotTrial(
      stimuliDirectory,
      stimulusExtension,
      "Nedig",
      "Kinit",
      "Nedig",
      2.96,
      4.36
    ),
    twoDotTrial(
      stimuliDirectory,
      stimulusExtension,
      "Binip",
      "Kinit",
      "Kinit",
      3.09,
      4.58
    ),
    twoDotTrial(
      stimuliDirectory,
      stimulusExtension,
      "Daevl",
      "Nedig",
      "Daevl",
      3.21,
      4.71
    ),
    twoDotTrial(
      stimuliDirectory,
      stimulusExtension,
      "Topin",
      "Binip",
      "Binip",
      3.02,
      4.41
    ),
    gameTransition(2),
    // Training Block 4
    // ...
    // Free Recall Test
    freeRecallTrial(
      stimuliDirectory,
      stimulusExtension,
      imageFileNameFromWord("Baby")
    ),
    freeRecallTrial(
      stimuliDirectory,
      stimulusExtension,
      imageFileNameFromWord("Rooster")
    ),
    freeRecallTrial(
      stimuliDirectory,
      stimulusExtension,
      imageFileNameFromWord("Topin")
    ),
    freeRecallTrial(
      stimuliDirectory,
      stimulusExtension,
      imageFileNameFromWord("Nedig")
    ),
    freeRecallTrial(
      stimuliDirectory,
      stimulusExtension,
      imageFileNameFromWord("Kinit")
    ),
    freeRecallTrial(
      stimuliDirectory,
      stimulusExtension,
      imageFileNameFromWord("Daevl")
    ),
    freeRecallTrial(
      stimuliDirectory,
      stimulusExtension,
      imageFileNameFromWord("Binip")
    ),
    gameTransition(3),
    // Cued Recall Test
    cuedRecallTrialAssumingCommonFilenames(
      stimuliDirectory,
      stimulusExtension,
      "SEE",
      imageFileNameFromWord("Seesaw")
    ),
    cuedRecallTrialAssumingCommonFilenames(
      stimuliDirectory,
      stimulusExtension,
      "BAY",
      imageFileNameFromWord("Baby")
    ),
    cuedRecallTrialAssumingCommonFilenames(
      stimuliDirectory,
      stimulusExtension,
      "ROO",
      imageFileNameFromWord("Rooster")
    ),
    cuedRecallTrialAssumingCommonFilenames(
      stimuliDirectory,
      stimulusExtension,
      "TO",
      imageFileNameFromWord("Topin")
    ),
    cuedRecallTrialAssumingCommonFilenames(
      stimuliDirectory,
      stimulusExtension,
      "NE",
      imageFileNameFromWord("Nedig")
    ),
    cuedRecallTrialAssumingCommonFilenames(
      stimuliDirectory,
      stimulusExtension,
      "KI",
      imageFileNameFromWord("Kinit")
    ),
    cuedRecallTrialAssumingCommonFilenames(
      stimuliDirectory,
      stimulusExtension,
      "DAE",
      imageFileNameFromWord("Daevl")
    ),
    cuedRecallTrialAssumingCommonFilenames(
      stimuliDirectory,
      stimulusExtension,
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
    freeRecallTrial(
      stimuliDirectory,
      stimulusExtension,
      imageFileNameFromWord("Topin")
    ),
    freeRecallTrial(
      stimuliDirectory,
      stimulusExtension,
      imageFileNameFromWord("Nedig")
    ),
    freeRecallTrial(
      stimuliDirectory,
      stimulusExtension,
      imageFileNameFromWord("Kinit")
    ),
    freeRecallTrial(
      stimuliDirectory,
      stimulusExtension,
      imageFileNameFromWord("Daevl")
    ),
    freeRecallTrial(
      stimuliDirectory,
      stimulusExtension,
      imageFileNameFromWord("Binip")
    ),
    gameTransition(6),
    // Cued Recall Test (Re-test)
    cuedRecallTrialAssumingCommonFilenames(
      stimuliDirectory,
      stimulusExtension,
      "TO",
      imageFileNameFromWord("Topin")
    ),
    cuedRecallTrialAssumingCommonFilenames(
      stimuliDirectory,
      stimulusExtension,
      "NE",
      imageFileNameFromWord("Nedig")
    ),
    cuedRecallTrialAssumingCommonFilenames(
      stimuliDirectory,
      stimulusExtension,
      "KI",
      imageFileNameFromWord("Kinit")
    ),
    cuedRecallTrialAssumingCommonFilenames(
      stimuliDirectory,
      stimulusExtension,
      "DAE",
      imageFileNameFromWord("Daevl")
    ),
    cuedRecallTrialAssumingCommonFilenames(
      stimuliDirectory,
      stimulusExtension,
      "BI",
      imageFileNameFromWord("Binip")
    ),
    gameTransition(7),
    // 2-Dot Test (Re-test)
    {
      ...twoDotWithoutFeedbackTrialCommonPropertiesAssumingCommonFileNames(
        stimuliDirectory,
        stimulusExtension,
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
  createChildElement(conditionSelect, "option").textContent =
    noMaskAuditoryOnlyConditionText;
  createChildElement(conditionSelect, "option").textContent =
    clearMaskAuditoryOnlyConditionText;
  const confirmButton = createChildElement(page, "button");
  confirmButton.textContent = "Confirm";
  confirmButton.addEventListener("click", () => {
    notifyThatConfirmButtonHasBeenClicked(page, conditionSelect);
  });
}

main();
