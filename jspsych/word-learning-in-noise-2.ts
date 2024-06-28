import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychImageButtonResponse from "@jspsych/plugin-image-button-response";
import jsPsychPreload from "@jspsych/plugin-preload";
import { JsPsych } from "jspsych";

import * as plugins from "./plugin";

// This is valid in bun, so ignore ts
// https://bun.sh/docs/bundler/loaders#text
//
// @ts-ignore
import activeTrialOrder from "../wln2/day1-active.txt";
// @ts-ignore
import passiveTrialOrder from "../wln2/day1-passive.txt";

declare const activeTrialOrder: string;
declare const passiveTrialOrder: string;

const standardImageHeightPixels = 400;
const bottomRightButtonHTML =
  '<button class="jspsych-btn" style="position: absolute; bottom: 5%; right: 5%">%choice%</button>';

enum Condition {
  Active,
  Passive,
}

enum Level {
  Quiet,
  fiveSNR,
}

async function run(
  jsPsych: JsPsych,
  opts: { condition: Condition; level: Level },
) {
  const trialOrder =
    opts.condition === Condition.Active ? activeTrialOrder : passiveTrialOrder;
  const trials = trialOrder
    .split("\n")
    .filter((s, i) => s.length > 0 && i > 0)
    .map((s) => s.split(",").map((s) => s.trim()))
    .map(
      ([
        task,
        ,
        ,
        ,
        quietAudioFileName,
        fiveSnrAudioFileName,
        ,
        imageFileName,
      ]) => {
        let audioFileName =
          opts.level === Level.Quiet
            ? quietAudioFileName
            : fiveSnrAudioFileName;
        let audioDir =
          opts.condition === Condition.Active ? "active" : "passive";
        if (task.startsWith("Block"))
          return {
            type: jsPsychImageButtonResponse,
            stimulus: "game/0.png",
            stimulus_height: standardImageHeightPixels,
            choices: ["Continue"],
            prompt: "",
            button_html: bottomRightButtonHTML,
          };
        if (quietAudioFileName.startsWith("No audio file"))
          return {
            type: jsPsychImageButtonResponse,
            stimulus: imageFileName,
            stimulus_height: standardImageHeightPixels,
            choices: ["Continue"],
            prompt: "",
            button_html: bottomRightButtonHTML,
          };
        return {
          timeline: [
            {
              type: plugins.imageAudioButtonResponse(),
              stimulusUrl: `${audioDir}/${audioFileName}`,
              imageUrl: imageFileName,
              imageHeight: standardImageHeightPixels,
            },
          ],
          loop_function(data) {
            return data.values()[0].repeat;
          },
        };
      },
    );
  for (let i = 0; i < trials.length; ++i)
    if (
      i > 0 &&
      trials[i].timeline !== undefined &&
      trials[i].timeline[0].imageUrl.length === 0
    )
      trials[i].timeline[0].imageUrl = trials[i - 1].timeline[0].imageUrl;
    else if (
      i > 0 &&
      trials[i].stimulus !== undefined &&
      trials[i].stimulus.length === 0
    )
      trials[i].stimulus = trials[i - 1].stimulus;

  jsPsych.run([
    {
      type: jsPsychPreload,
      auto_preload: true,
      show_detailed_errors: true,
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
  const conditionSelect = document.createElement("select");
  topOfPage.append(conditionSelect);
  conditionSelect.append(document.createElement("option"));
  const active = document.createElement("option");
  conditionSelect.append(active);
  active.textContent = "Active";
  const passive = document.createElement("option");
  conditionSelect.append(passive);
  passive.textContent = "Passive";
  const daySelect = document.createElement("select");
  topOfPage.append(daySelect);
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
  const levelSelect = document.createElement("select");
  topOfPage.append(levelSelect);
  levelSelect.append(document.createElement("option"));
  const quiet = document.createElement("option");
  levelSelect.append(quiet);
  quiet.textContent = "Quiet";
  const fiveSNR = document.createElement("option");
  levelSelect.append(fiveSNR);
  fiveSNR.textContent = "5SNR";
  const confirmButton = document.createElement("button");
  page.append(confirmButton);
  confirmButton.textContent = "Confirm";
  confirmButton.addEventListener("click", () => {
    const selectedCondition = conditionSelect.options.item(
      conditionSelect.selectedIndex,
    ).textContent;
    const selectedDay = daySelect.options.item(
      daySelect.selectedIndex,
    ).textContent;
    const selectedLevel = levelSelect.options.item(
      levelSelect.selectedIndex,
    ).textContent;
    if (
      selectedDay.length === 0 ||
      selectedCondition.length === 0 ||
      selectedLevel.length === 0
    )
      return;

    document.body.removeChild(page);
    run(jsPsych, {
      condition:
        selectedCondition === "Active" ? Condition.Active : Condition.Passive,
      level: selectedLevel === "Quiet" ? Level.Quiet : Level.fiveSNR,
    });
  });
}
