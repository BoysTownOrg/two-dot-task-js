import * as XLSX from "xlsx";

import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychImageButtonResponse from "@jspsych/plugin-image-button-response";
import jsPsychPreload from "@jspsych/plugin-preload";
import { JsPsych } from "jspsych";

import * as plugins from "./plugin";

function importAll(r): { [id: string]: string } {
  const imports: { [id: string]: string } = {};
  r.keys().forEach((key: string) => (imports[key] = r(key)));
  return imports;
}

function assetKey(filename: string): string {
  return `./${filename}`;
}

function firstAndThirdWord(text: string): [string, string] {
  const [first, , third] = text.split(" ");
  return [first, third];
}

function pushGreenCircleTrial(trials: any[]) {
  trials.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: "",
    choices: [""],
    button_html:
      '<div style="height: 200px; width: 200px; border-radius: 100px; background-color: green"></div>',
  });
}

declare const jatos: any;

function checkedImportsAccess(
  imports: { [id: string]: string },
  key: string,
): string {
  if (!imports.hasOwnProperty(key)) {
    jatos.endStudy(false, `ERROR: key not found: ${key}`);
  }
  return imports[key];
}

function trimmedStringCell(row, key: string): string {
  return row[key].trim();
}

async function run(jsPsych: JsPsych, sheet: string, condition: string) {
  const imagePaths = importAll(
    require.context("../assets/images/", false, /\.png$/),
  );
  const audioPaths = importAll(
    require.context("../assets/audio/", false, /\.wav$/),
  );
  const orderPath = importAll(require.context("../assets/", false, /\.xlsx$/));

  let response = await fetch(orderPath["./order.xlsx"]);
  let buffer = await response.arrayBuffer();
  const order = XLSX.utils.sheet_to_json(XLSX.read(buffer).Sheets[sheet], {
    blankrows: true,
  });

  let beyondLastTrialIndex = order.length;
  for (; beyondLastTrialIndex > 0; beyondLastTrialIndex -= 1)
    if (order[beyondLastTrialIndex - 1]["Task"] !== undefined) break;

  const standardImageHeightPixels = 400;
  const bottomRightButtonHTML =
    '<button class="jspsych-btn" style="position: absolute; bottom: 5%; right: 5%">%choice%</button>';

  const trials = [];
  let currentMotivationalGameIndex = 1;
  pushGameTrial(trials, sheet, currentMotivationalGameIndex);

  for (let trialIndex = 0; trialIndex < beyondLastTrialIndex; trialIndex += 1) {
    const trial = order[trialIndex];
    if (!trial.hasOwnProperty("Task")) {
      pushGameTrial(trials, sheet, currentMotivationalGameIndex);
      currentMotivationalGameIndex += 1;
      pushGameTrial(trials, sheet, currentMotivationalGameIndex);
      continue;
    }
    const task = trimmedStringCell(trial, "Task");
    if (task.startsWith("5-Minute")) {
      trials.push({
        type: plugins.stopwatch(),
        text: 'Take a 5 minute break. Press "Continue" when finished.',
        alarmTimeSeconds: 300,
      });
      currentMotivationalGameIndex += 1;
      pushGameTrial(trials, sheet, currentMotivationalGameIndex);
      trialIndex += 1;
      continue;
    }
    const audioFileName = trimmedStringCell(
      trial,
      `WAV filename audio - ${condition}`,
    );
    const imageFileName = trimmedStringCell(trial, "image files");
    const targetWord = trimmedStringCell(trial, "TargetWord");
    if (
      (task.startsWith("Cued") ||
        task.startsWith("Repetition") ||
        task.startsWith("Free")) &&
      !audioFileName.startsWith("No audio file")
    ) {
      pushBlankTrial(trials);
      trials.push({
        timeline: [
          {
            type: plugins.imageAudioButtonResponse(),
            stimulusUrl: checkedImportsAccess(
              audioPaths,
              assetKey(audioFileName),
            ),
            imageUrl: checkedImportsAccess(imagePaths, assetKey(imageFileName)),
            imageHeight: standardImageHeightPixels,
          },
        ],
        loop_function(data) {
          return data.values()[0].repeat;
        },
      });
    } else if (
      task.startsWith("2 dot") &&
      !audioFileName.startsWith("No audio file")
    ) {
      pushGreenCircleTrial(trials);
      const [firstWord, secondWord] = firstAndThirdWord(targetWord);
      if (
        trialIndex + 1 < beyondLastTrialIndex &&
        trimmedStringCell(order[trialIndex + 1], "Task").startsWith("Feedback")
      ) {
        trials.push({
          timeline: [
            {
              type:
                trimmedStringCell(trial, "Known/Novel") == "Known"
                  ? plugins.twoDotPractice()
                  : plugins.twoDot(),
              stimulusUrl: checkedImportsAccess(
                audioPaths,
                assetKey(audioFileName),
              ),
              feedbackUrl:
                audioPaths[
                  assetKey(
                    order[trialIndex + 1][`WAV filename audio - ${condition}`],
                  )
                ],
              imageUrl: checkedImportsAccess(
                imagePaths,
                assetKey(imageFileName),
              ),
              imageHeight: standardImageHeightPixels,
              firstChoiceOnsetTimeSeconds: 2.5,
              firstChoiceOffsetTimeSeconds: 3.25,
              secondChoiceOnsetTimeSeconds: 4.75,
              secondChoiceOffsetTimeSeconds: 5.5,
              firstWord,
              secondWord,
              correctWord: targetWord,
            },
          ],
          loop_function(data) {
            return data.values()[0].repeat;
          },
        });
        trialIndex += 1;
      } else {
        trials.push({
          timeline: [
            {
              type: plugins.twoDotWithoutFeedbackButDelayed(),
              stimulusUrl: checkedImportsAccess(
                audioPaths,
                assetKey(audioFileName),
              ),
              imageUrl: checkedImportsAccess(
                imagePaths,
                assetKey(imageFileName),
              ),
              imageHeight: standardImageHeightPixels,
              firstChoiceOnsetTimeSeconds: 2.5,
              firstChoiceOffsetTimeSeconds: 3.25,
              secondChoiceOnsetTimeSeconds: 4.75,
              secondChoiceOffsetTimeSeconds: 5.5,
              firstWord,
              secondWord,
              correctWord: imageFileName.replace(".png", ""),
            },
          ],
          loop_function(data) {
            return data.values()[0].repeat;
          },
        });
      }
    } else if (task.startsWith("2 dot")) {
      // practice two dot
      pushGreenCircleTrial(trials);
      trials.push({
        type: plugins.twoDotLive(),
        imageUrl: checkedImportsAccess(imagePaths, assetKey(imageFileName)),
        imageHeight: standardImageHeightPixels,
      });
      trialIndex += 1;
    } else {
      pushBlankTrial(trials);
      trials.push({
        type: jsPsychImageButtonResponse,
        stimulus: checkedImportsAccess(imagePaths, assetKey(imageFileName)),
        stimulus_height: standardImageHeightPixels,
        choices: ["Continue"],
        prompt: "",
        button_html: bottomRightButtonHTML,
      });
    }
  }
  pushGameTrial(trials, sheet, currentMotivationalGameIndex);
  currentMotivationalGameIndex += 1;
  pushGameTrial(trials, sheet, currentMotivationalGameIndex);

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
    ...trials,
    {
      type: jsPsychHtmlButtonResponse,
      stimulus: 'The test is done. Press "Finish" to complete. Thank you.',
      choices: ["Finish"],
      button_html: bottomRightButtonHTML,
    },
  ]);

  function pushGameTrial(trials: any[], sheet: string, index: number) {
    trials.push({
      type: jsPsychImageButtonResponse,
      stimulus: checkedImportsAccess(
        imagePaths,
        assetKey(`Game_${sheet}-${index}.png`),
      ),
      stimulus_height: standardImageHeightPixels,
      choices: ["Continue"],
      prompt: "",
      button_html: bottomRightButtonHTML,
    });
  }

  function pushBlankTrial(trials: any[]) {
    trials.push({
      type: jsPsychHtmlButtonResponse,
      stimulus: "",
      choices: ["Continue"],
      button_html: bottomRightButtonHTML,
    });
  }
}

export function selectConditionBeforeRunning(jsPsych: JsPsych) {
  const page = document.createElement("div");
  document.body.append(page);
  const topOfPage = document.createElement("div");
  page.append(topOfPage);
  const conditionLabel = document.createElement("label");
  topOfPage.append(conditionLabel);
  conditionLabel.textContent = "Condition";
  const conditionSelect = document.createElement("select");
  conditionLabel.append(conditionSelect);
  conditionSelect.append(document.createElement("option"));
  const zeroSNR = document.createElement("option");
  conditionSelect.append(zeroSNR);
  zeroSNR.textContent = "0SNR";
  const fiveSNR = document.createElement("option");
  conditionSelect.append(fiveSNR);
  fiveSNR.textContent = "5SNR";
  const tenSNR = document.createElement("option");
  conditionSelect.append(tenSNR);
  tenSNR.textContent = "10SNR";
  const quiet = document.createElement("option");
  conditionSelect.append(quiet);
  quiet.textContent = "QUIET";
  const dayLabel = document.createElement("label");
  topOfPage.append(dayLabel);
  dayLabel.textContent = "Day";
  const daySelect = document.createElement("select");
  dayLabel.append(daySelect);
  daySelect.append(document.createElement("option"));
  const day1 = document.createElement("option");
  daySelect.append(day1);
  day1.textContent = "Day 1";
  const day2 = document.createElement("option");
  daySelect.append(day2);
  day2.textContent = "Day 2";
  const day3 = document.createElement("option");
  daySelect.append(day3);
  day3.textContent = "Day 3";
  const confirmButton = document.createElement("button");
  page.append(confirmButton);
  confirmButton.textContent = "Confirm";
  confirmButton.addEventListener("click", () => {
    const selectedDay = daySelect.options.item(
      daySelect.selectedIndex,
    ).textContent;
    const selectedCondition = conditionSelect.options.item(
      conditionSelect.selectedIndex,
    ).textContent;
    if (selectedDay.length == 0 || selectedCondition.length == 0) return;

    document.body.removeChild(page);
    run(jsPsych, selectedDay, selectedCondition);
  });
}
