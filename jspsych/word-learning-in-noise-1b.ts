import * as XLSX from "xlsx";

import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychImageButtonResponse from "@jspsych/plugin-image-button-response";
import jsPsychPreload from "@jspsych/plugin-preload";
import { JsPsych } from "jspsych";

import * as plugins from "./plugin.js";

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

async function run(jsPsych: JsPsych, sheet: string, condition: string) {
  const imagePaths = importAll(
    require.context("../assets/images/", false, /\.png$/)
  );
  const audioPaths = importAll(
    require.context("../assets/audio/", false, /\.wav$/)
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
  pushGameTrial(trials, sheet, 1);

  let lastAudioFileName = "";
  let lastFirstWord = "";
  let lastSecondWord = "";
  let currentMotivationalGameIndex = 1;
  for (const trial of order.slice(0, beyondLastTrialIndex)) {
    console.log(trial);
    const task: string = trial["Task"];
    const audioFileName: string = trial[`WAV filename audio - ${condition}`];
    const imageFileName: string = trial["image files"];
    const targetWord: string = trial["TargetWord"];
    if (task === undefined) {
      pushGameTrial(trials, sheet, currentMotivationalGameIndex);
      currentMotivationalGameIndex += 1;
      pushGameTrial(trials, sheet, currentMotivationalGameIndex);
    } else if (
      (task.trim().startsWith("Cued") ||
        task.trim().startsWith("Repetition") ||
        task.trim().startsWith("Free")) &&
      !audioFileName.startsWith("No audio file")
    ) {
      trials.push({
        timeline: [
          {
            type: plugins.imageAudioButtonResponse(),
            stimulusUrl: audioPaths[assetKey(audioFileName)],
            imageUrl: imagePaths[assetKey(imageFileName)],
            imageHeight: standardImageHeightPixels,
          },
        ],
        loop_function(data) {
          return data.values()[0].repeat;
        },
      });
    } else if (task.trim().startsWith("2 dot")) {
      lastAudioFileName = audioFileName;
      [lastFirstWord, lastSecondWord] = firstAndThirdWord(targetWord);
    } else if (task.trim().startsWith("Feedback")) {
      trials.push({
        timeline: [
          {
            type: plugins.twoDot(),
            stimulusUrl: audioPaths[assetKey(lastAudioFileName)],
            feedbackUrl: audioPaths[assetKey(audioFileName)],
            imageUrl: imagePaths[assetKey(imageFileName)],
            imageHeight: standardImageHeightPixels,
            firstChoiceOnsetTimeSeconds: 2.5,
            firstChoiceOffsetTimeSeconds: 3.25,
            secondChoiceOnsetTimeSeconds: 4.75,
            secondChoiceOffsetTimeSeconds: 5.5,
            firstWord: lastFirstWord,
            secondWord: lastSecondWord,
            correctWord: targetWord,
          },
        ],
        loop_function(data) {
          return data.values()[0].repeat;
        },
      });
    } else {
      trials.push({
        type: jsPsychImageButtonResponse,
        stimulus: imagePaths[assetKey(imageFileName)],
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
      stimulus: imagePaths[assetKey(`Game_${sheet}-${index}.png`)],
      stimulus_height: standardImageHeightPixels,
      choices: ["Continue"],
      prompt: "",
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
  const zeroSNR = document.createElement("option");
  conditionSelect.append(zeroSNR);
  zeroSNR.textContent = "0SNR";
  const dayLabel = document.createElement("label");
  topOfPage.append(dayLabel);
  dayLabel.textContent = "Day";
  const daySelect = document.createElement("select");
  dayLabel.append(daySelect);
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
    document.body.removeChild(page);
    const selectedDay = daySelect.options.item(
      daySelect.selectedIndex
    ).textContent;
    const selectedCondition = conditionSelect.options.item(
      conditionSelect.selectedIndex
    ).textContent;

    run(jsPsych, selectedDay, selectedCondition);
  });
}
