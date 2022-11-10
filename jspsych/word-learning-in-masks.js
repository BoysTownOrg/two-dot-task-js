import * as pluginClasses from "./plugin.js";

const imageVideoButtonResponsePluginClass = pluginClasses
  .imageVideoButtonResponse(jsPsychModule);
const visualRepetitionTrialPluginClass = pluginClasses.visualRepetitionTrial(
  jsPsychModule,
);
const twoDotWithVideoPluginClass = pluginClasses.twoDotWithVideo(jsPsychModule);
const twoDotWithVideoWithoutFeedbackPluginClass = pluginClasses
  .twoDotWithVideoWithoutFeedback(jsPsychModule);
const stopwatchPluginClass = pluginClasses.stopwatch(jsPsychModule);
const imageVideoPlaceholderButtonResponsePluginClass = pluginClasses
  .imageVideoPlaceholderButtonResponse(jsPsychModule);

function concatenatePaths(a, b) {
  return `${a}/${b}`;
}

const bottomRightButtonHTML =
  '<button class="jspsych-btn" style="position: absolute; bottom: 5%; right: 5%">%choice%</button>';

function resourcePath(fileName) {
  return concatenatePaths(wordLearningInNoiseResourcePath, fileName);
}

function resourcePathInDirectory(directory, fileName) {
  return resourcePath(concatenatePaths(directory, fileName));
}

function repeatableStimulusWithImageTrial(
  pluginClass,
  stimuliDirectory,
  stimulusFileName,
  imageFileName,
) {
  return {
    timeline: [
      {
        type: pluginClass,
        stimulusUrl: resourcePathInDirectory(
          stimuliDirectory,
          stimulusFileName,
        ),
        imageUrl: resourcePath(imageFileName),
      },
    ],
    loop_function(data) {
      return data.values()[0].repeat;
    },
  };
}

function imageVideoButtonResponseTrial(
  stimuliDirectory,
  stimulusFileName,
  imageFileName,
) {
  return repeatableStimulusWithImageTrial(
    imageVideoButtonResponsePluginClass,
    stimuliDirectory,
    stimulusFileName,
    imageFileName,
  );
}

function visualRepetitionTrial(
  stimuliDirectory,
  stimulusFileName,
  imageFileName,
) {
  return repeatableStimulusWithImageTrial(
    visualRepetitionTrialPluginClass,
    stimuliDirectory,
    stimulusFileName,
    imageFileName,
  );
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
      visualRepetitionTrial(stimuliDirectory, stimulusFileName, imageFileName),
    ],
  };
}

function cuedRecallTrialAssumingCommonFilenames(
  stimuliDirectory,
  stimulusExtension,
  stimulusCue,
  imageFileName,
) {
  return {
    timeline: [
      blankScreen(),
      imageVideoButtonResponseTrial(
        stimuliDirectory,
        `CuedRecall_${stimulusCue.toUpperCase()}.${stimulusExtension}`,
        imageFileName,
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
        imageFileName,
      ),
    ],
  };
}

function twoDotTrialCommonProperties(
  stimuliDirectory,
  stimulusFileName,
  feedbackFileName,
  imageFileName,
) {
  return {
    type: twoDotWithVideoPluginClass,
    stimulusUrl: resourcePathInDirectory(stimuliDirectory, stimulusFileName),
    feedbackUrl: resourcePathInDirectory(stimuliDirectory, feedbackFileName),
    imageUrl: resourcePath(imageFileName),
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
  correctWord,
) {
  return {
    ...twoDotTrialCommonProperties(
      stimuliDirectory,
      twoDotStimulusFileName(stimulusExtension, firstWord, secondWord),
      `TwoDotResponse_${correctWord.toUpperCase()}.${stimulusExtension}`,
      imageFileNameFromWord(correctWord),
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
  correctWord,
) {
  const imageFileName = imageFileNameFromWord(correctWord);
  return {
    type: twoDotWithVideoWithoutFeedbackPluginClass,
    stimulusUrl: resourcePathInDirectory(
      stimuliDirectory,
      twoDotStimulusFileName(stimulusExtension, firstWord, secondWord),
    ),
    imageUrl: resourcePath(imageFileName),
    firstWord,
    secondWord,
    correctWord,
  };
}

function twoDotTimingPropertiesAssumingSameLengthWords(
  firstOnset,
  secondOnset,
) {
  const length = 0.5;
  return {
    firstChoiceOnsetTimeSeconds: firstOnset,
    firstChoiceOffsetTimeSeconds: firstOnset + length,
    secondChoiceOnsetTimeSeconds: secondOnset,
    secondChoiceOffsetTimeSeconds: secondOnset + length,
  };
}

function greenCircleTrial() {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: "",
    choices: [""],
    button_html:
      '<div style="height: 200px; width: 200px; border-radius: 100px; background-color: green"></div>',
  };
}

function twoAlternativeForcedChoiceTrial(
  stimuliDirectory,
  stimulusExtension,
  firstWord,
  secondWord,
  correctWord,
  firstOnset,
  secondOnset,
) {
  return {
    timeline: [
      blankScreen(),
      imageVideoButtonResponseTrial(
        stimuliDirectory,
        twoDotStimulusFileName(stimulusExtension, firstWord, secondWord),
        imageFileNameFromWord(correctWord),
      ),
    ],
  };
}

function twoDotWithoutFeedbackTrial(
  stimuliDirectory,
  stimulusExtension,
  firstWord,
  secondWord,
  correctWord,
  firstOnset,
  secondOnset,
) {
  return {
    timeline: [
      greenCircleTrial(),
      {
        ...twoDotWithoutFeedbackTrialCommonPropertiesAssumingCommonFileNames(
          stimuliDirectory,
          stimulusExtension,
          firstWord,
          secondWord,
          correctWord,
        ),
        ...twoDotTimingPropertiesAssumingSameLengthWords(
          firstOnset,
          secondOnset,
        ),
      },
    ],
  };
}

function gameTrial(n) {
  return {
    type: jsPsychImageButtonResponse,
    stimulus: resourcePath(`game${n + 1}.jpg`),
    stimulus_height: 540,
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
  word,
) {
  return repetitionTrial(
    stimuliDirectory,
    `Repetition_${word.toUpperCase()}.${stimulusExtension}`,
    imageFileNameFromWord(word),
  );
}

function imageWithoutAudioTrial(word) {
  const imageFileName = imageFileNameFromWord(word);
  return {
    type: imageVideoPlaceholderButtonResponsePluginClass,
    imageUrl: resourcePath(imageFileName),
  };
}

function repetitionTrialWithoutAudio(word) {
  return imageWithoutAudioTrial(word);
}

function cuedRecallTrialWithoutAudio(word) {
  return imageWithoutAudioTrial(word);
}

function repetitionBlock(stimuliDirectory, stimulusExtension, words) {
  return {
    timeline: words.map((word) =>
      repetitionTrialAssumingCommonFileNames(
        stimuliDirectory,
        stimulusExtension,
        word,
      )
    ),
  };
}

function freeRecallBlock(stimuliDirectory, stimulusExtension, words) {
  return {
    timeline: words.map((word) =>
      freeRecallTrial(
        stimuliDirectory,
        stimulusExtension,
        imageFileNameFromWord(word),
      )
    ),
  };
}

function cuedRecallBlock(stimuliDirectory, stimulusExtension, wordsWithCue) {
  return {
    timeline: wordsWithCue.map((wordWithCue) =>
      cuedRecallTrialAssumingCommonFilenames(
        stimuliDirectory,
        stimulusExtension,
        wordWithCue.cue,
        imageFileNameFromWord(wordWithCue.word),
      )
    ),
  };
}

function twoAlternativeForcedChoiceBlock(
  stimuliDirectory,
  stimulusExtension,
  twoDotParameters,
) {
  return {
    timeline: twoDotParameters.map((parameters) =>
      twoAlternativeForcedChoiceTrial(
        stimuliDirectory,
        stimulusExtension,
        parameters.firstWord,
        parameters.secondWord,
        parameters.correctWord,
        parameters.firstOnset,
        parameters.secondOnset,
      )
    ),
  };
}

const clearMaskConditionText = "Clear Mask AV";
const disposableMaskConditionText = "Disposable Mask AV";
const noMaskAuditoryOnlyConditionText = "No Mask AO";
const clearMaskAuditoryOnlyConditionText = "Clear Mask AO";

const noMaskAuditoryOnlyDirectory = "No Mask AO";
const clearMaskAuditoryOnlyDirectory = "Clear Mask AO";

function auditoryOnlyStimuliDirectory(condition) {
  switch (condition) {
    case clearMaskAuditoryOnlyConditionText:
    case clearMaskConditionText:
      return clearMaskAuditoryOnlyDirectory;
    case noMaskAuditoryOnlyConditionText:
      return noMaskAuditoryOnlyDirectory;
    case disposableMaskConditionText:
    default:
      return "Disposable Mask AO";
  }
}

function notifyThatConfirmButtonHasBeenClicked(page, conditionSelect, jsPsych) {
  document.body.removeChild(page);
  const condition = conditionSelect.options.item(
    conditionSelect.selectedIndex,
  ).textContent;
  const videoExtension = "mp4";
  const audioExtension = "wav";
  let stimuliDirectory = "";
  let stimulusExtension = "";
  switch (condition) {
    case noMaskAuditoryOnlyConditionText:
      stimuliDirectory = noMaskAuditoryOnlyDirectory;
      stimulusExtension = audioExtension;
      break;
    case clearMaskAuditoryOnlyConditionText:
      stimuliDirectory = clearMaskAuditoryOnlyDirectory;
      stimulusExtension = audioExtension;
      break;
    case disposableMaskConditionText:
      stimuliDirectory = "Disposable Mask AV";
      stimulusExtension = videoExtension;
      break;
    case clearMaskConditionText:
    default:
      stimuliDirectory = "Clear Mask AV";
      stimulusExtension = videoExtension;
  }
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
    blankScreen(),
    repetitionTrialWithoutAudio("Button"),
    repetitionBlock(stimuliDirectory, stimulusExtension, [
      "Baby",
      "Rooster",
      "Topin",
      "Nedig",
      "Kinit",
      "Daevl",
      "Binip",
    ]),
    gameTransition(0),
    // Training Block 2
    twoAlternativeForcedChoiceTrial(
      noMaskAuditoryOnlyDirectory,
      "wav",
      "Baby",
      "Cheetah",
      "Baby",
      3.1,
      4.43,
    ),
    twoAlternativeForcedChoiceTrial(
      auditoryOnlyStimuliDirectory(condition),
      "wav",
      "Pizza",
      "Rooster",
      "Rooster",
      3.01,
      4.37,
    ),
    twoAlternativeForcedChoiceBlock(stimuliDirectory, stimulusExtension, [
      {
        firstWord: "Pizza",
        secondWord: "Rooster",
        correctWord: "Rooster",
        firstOnset: 3.01,
        secondOnset: 4.37,
      },
      {
        firstWord: "Baby",
        secondWord: "Cheetah",
        correctWord: "Baby",
        firstOnset: 3.1,
        secondOnset: 4.43,
      },
      {
        firstWord: "Binip",
        secondWord: "Topin",
        correctWord: "Topin",
        firstOnset: 3,
        secondOnset: 4.36,
      },
      {
        firstWord: "Daevl",
        secondWord: "Nedig",
        correctWord: "Nedig",
        firstOnset: 3.21,
        secondOnset: 4.71,
      },
      {
        firstWord: "Kinit",
        secondWord: "Topin",
        correctWord: "Kinit",
        firstOnset: 3.14,
        secondOnset: 4.46,
      },
      {
        firstWord: "Daevl",
        secondWord: "Kinit",
        correctWord: "Daevl",
        firstOnset: 3.19,
        secondOnset: 4.72,
      },
      {
        firstWord: "Nedig",
        secondWord: "Binip",
        correctWord: "Binip",
        firstOnset: 2.93,
        secondOnset: 4.33,
      },
    ]),
    gameTransition(1),
    // Repeat Block 1 without button, baby and rooster
    repetitionBlock(stimuliDirectory, stimulusExtension, [
      "Topin",
      "Nedig",
      "Kinit",
      "Daevl",
      "Binip",
    ]),
    gameTransition(2),
    // Training Block 3
    twoAlternativeForcedChoiceBlock(stimuliDirectory, stimulusExtension, [
      {
        firstWord: "Topin",
        secondWord: "Daevl",
        correctWord: "Topin",
        firstOnset: 3.14,
        secondOnset: 4.62,
      },
      {
        firstWord: "Nedig",
        secondWord: "Kinit",
        correctWord: "Nedig",
        firstOnset: 2.96,
        secondOnset: 4.36,
      },
      {
        firstWord: "Binip",
        secondWord: "Kinit",
        correctWord: "Kinit",
        firstOnset: 3.09,
        secondOnset: 4.58,
      },
      {
        firstWord: "Daevl",
        secondWord: "Nedig",
        correctWord: "Daevl",
        firstOnset: 3.21,
        secondOnset: 4.71,
      },
      {
        firstWord: "Topin",
        secondWord: "Binip",
        correctWord: "Binip",
        firstOnset: 3.02,
        secondOnset: 4.41,
      },
    ]),
    gameTransition(3),
    // Free Recall Test
    freeRecallBlock(stimuliDirectory, stimulusExtension, [
      "Baby",
      "Rooster",
      "Topin",
      "Nedig",
      "Kinit",
      "Daevl",
      "Binip",
    ]),
    gameTransition(4),
    // Cued Recall Test
    blankScreen(),
    cuedRecallTrialWithoutAudio("Seesaw"),
    cuedRecallBlock(stimuliDirectory, stimulusExtension, [
      { word: "Baby", cue: "BAY" },
      { word: "Rooster", cue: "ROO" },
      { word: "Topin", cue: "TO" },
      { word: "Nedig", cue: "NE" },
      { word: "Kinit", cue: "KI" },
      { word: "Daevl", cue: "DAE" },
      { word: "Binip", cue: "BI" },
    ]),
    gameTransition(5),
    // 5-Minute Break
    {
      type: stopwatchPluginClass,
      text: 'Take a 5 minute break. Press "Continue" when finished.',
      alarmTimeSeconds: 300,
    },
    gameTrial(7),
    // Free Recall Test (Re-test)
    freeRecallBlock(stimuliDirectory, stimulusExtension, [
      "Topin",
      "Nedig",
      "Kinit",
      "Daevl",
      "Binip",
    ]),
    gameTransition(7),
    // Cued Recall Test (Re-test)
    cuedRecallBlock(stimuliDirectory, stimulusExtension, [
      { word: "Topin", cue: "TO" },
      { word: "Nedig", cue: "NE" },
      { word: "Kinit", cue: "KI" },
      { word: "Daevl", cue: "DAE" },
      { word: "Binip", cue: "BI" },
    ]),
    gameTransition(8),
    // 2-Dot Test (Re-test)
    twoDotWithoutFeedbackTrial(
      stimuliDirectory,
      stimulusExtension,
      "Topin",
      "Nedig",
      "Topin",
      2.78,
      4.14,
    ),
    twoDotWithoutFeedbackTrial(
      stimuliDirectory,
      stimulusExtension,
      "Binip",
      "Nedig",
      "Nedig",
      3.07,
      4.49,
    ),
    twoDotWithoutFeedbackTrial(
      stimuliDirectory,
      stimulusExtension,
      "Daevl",
      "Kinit",
      "Kinit",
      2.95,
      4.42,
    ),
    twoDotWithoutFeedbackTrial(
      stimuliDirectory,
      stimulusExtension,
      "Daevl",
      "Topin",
      "Daevl",
      3.07,
      4.46,
    ),
    twoDotWithoutFeedbackTrial(
      stimuliDirectory,
      stimulusExtension,
      "Kinit",
      "Binip",
      "Binip",
      3.13,
      4.54,
    ),
    gameTransition(9),
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

export function selectConditionBeforeRunning(jsPsych) {
  const page = createChildElement(document.body, "div");
  const conditionLabel = createChildElement(
    createChildElement(page, "div"),
    "label",
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
    notifyThatConfirmButtonHasBeenClicked(page, conditionSelect, jsPsych);
  });
}
