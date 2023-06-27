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

async function run(jsPsych: JsPsych) {
  const imagePaths = importAll(
    require.context("../assets/images/", false, /\.png$/)
  );
  const audioPaths = importAll(
    require.context("../assets/audio/", false, /\.wav$/)
  );
  const orderPath = importAll(require.context("../assets/", false, /\.xlsx$/));
  let response = await fetch(orderPath["./order.xlsx"]);
  let buffer = await response.arrayBuffer();
  const order = XLSX.utils.sheet_to_json(XLSX.read(buffer).Sheets["Day 1"]);
  const standardImageHeightPixels = 400;
  const bottomRightButtonHTML =
    '<button class="jspsych-btn" style="position: absolute; bottom: 5%; right: 5%">%choice%</button>';
  const trials = [];
  let lastAudioFileName = "";
  let lastFirstWord = "";
  let lastSecondWord = "";
  for (const trial of order) {
    console.log(trial);
    const task: string = trial["Task"];
    const audioFileName: string = trial["WAV filename audio - 0SNR"];
    const imageFileName: string = trial["image files"];
    const targetWord: string = trial["TargetWord"];
    if (
      (task.trim() == "Cued Recall" ||
        task.trim() == "Repetition" ||
        task.trim() == "Free Recall") &&
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
    } else if (task.trim() == "2 dot task") {
      lastAudioFileName = audioFileName;
      [lastFirstWord, lastSecondWord] = firstAndThirdWord(targetWord);
    } else if (task.trim() == "Feedback") {
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
  const confirmButton = document.createElement("button");
  page.append(confirmButton);
  confirmButton.textContent = "Confirm";
  confirmButton.addEventListener("click", () => {
    document.body.removeChild(page);
    run(jsPsych);
  });
}
