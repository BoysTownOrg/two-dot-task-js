import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychImageButtonResponse from "@jspsych/plugin-image-button-response";
import jsPsychPreload from "@jspsych/plugin-preload";
import { JsPsych } from "jspsych";

import * as plugins from "./plugin";

// This is valid in bun, so ignore ts
// https://bun.sh/docs/bundler/loaders#text
//
// @ts-ignore
import day1ActiveTrialOrder from "../wln2/day1-active.txt";
// @ts-ignore
import day1PassiveTrialOrder from "../wln2/day1-passive.txt";
// @ts-ignore
import day2ActiveTrialOrder from "../wln2/day2-active.txt";
// @ts-ignore
import day2PassiveTrialOrder from "../wln2/day2-passive.txt";
// @ts-ignore
import day3ActiveTrialOrder from "../wln2/day3-active.txt";
// @ts-ignore
import day3PassiveTrialOrder from "../wln2/day3-passive.txt";

declare const day1ActiveTrialOrder: string;
declare const day1PassiveTrialOrder: string;
declare const day2ActiveTrialOrder: string;
declare const day2PassiveTrialOrder: string;
declare const day3ActiveTrialOrder: string;
declare const day3PassiveTrialOrder: string;

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

enum Day {
  One,
  Two,
  Three,
}

async function run(
  jsPsych: JsPsych,
  opts: { condition: Condition; level: Level; day: Day },
) {
  const trialOrder = trialOrderFromDayAndCondition(opts.day, opts.condition);
  let gameIndex = 0;
  let lastImagePath = "";
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
            ? addWavExtensionIfMissing(quietAudioFileName)
            : addWavExtensionIfMissing(fiveSnrAudioFileName);
        let audioDir =
          opts.condition === Condition.Active ? "active" : "passive";
        if (task.startsWith("Block")) {
          gameIndex += 1;
          if (gameIndex === 1) return gameTrial(opts.day, 1);
          else
            return {
              timeline: [
                gameTrial(opts.day, gameIndex - 1),
                gameTrial(opts.day, gameIndex),
              ],
            };
        }
        if (task.startsWith("5-Minute")) {
          gameIndex += 1;
          return {
            timeline: [
              gameTrial(opts.day, gameIndex - 1),
              gameTrial(opts.day, gameIndex),
              {
                type: plugins.stopwatch(),
                text: 'Take a 5 minute break. Press "Continue" when finished.',
                alarmTimeSeconds: 300,
              },
            ],
          };
        }
        const timeline = [];
        let imagePath = "";
        if (task.startsWith("Feedback")) {
          imagePath = lastImagePath;
        } else {
          imagePath = imageFileName;
          lastImagePath = imagePath;
          timeline.push({
            type: jsPsychHtmlButtonResponse,
            stimulus: "",
            choices: ["Continue"],
            button_html: bottomRightButtonHTML,
          });
        }
        if (audioFileName.startsWith("No audio file")) {
          timeline.push({
            type: jsPsychImageButtonResponse,
            stimulus: imagePath,
            stimulus_height: standardImageHeightPixels,
            choices: ["Continue"],
            prompt: "",
            button_html: bottomRightButtonHTML,
          });
          return {
            timeline,
          };
        }
        timeline.push({
          timeline: [
            {
              type: plugins.imageAudioButtonResponse(),
              stimulusUrl: `${audioDir}/${audioFileName}`,
              imageUrl: imagePath,
              imageHeight: standardImageHeightPixels,
            },
          ],
          loop_function(data) {
            return data.values()[0].repeat;
          },
        });
        return {
          timeline,
        };
      },
    );
  trials.push(gameTrial(opts.day, gameIndex));
  trials.push(gameTrial(opts.day, gameIndex + 1));

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

function gameTrial(day: Day, n: number) {
  return {
    type: jsPsychImageButtonResponse,
    stimulus: `game/${gameSubfolderFromDay(day)}/${n - 1}.png`,
    stimulus_height: standardImageHeightPixels,
    choices: ["Continue"],
    prompt: "",
    button_html: bottomRightButtonHTML,
  };
}

function gameSubfolderFromDay(day: Day): string {
  switch (day) {
    case Day.One:
      return "day1";
    case Day.Two:
      return "day2";
    case Day.Three:
      return "day3";
  }
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
      day: dayFromName(selectedDay),
    });
  });
}

function dayFromName(name: string): Day {
  switch (name) {
    case "Day 1":
      return Day.One;
    case "Day 2":
      return Day.Two;
    default:
      return Day.Three;
  }
}

function trialOrderFromDayAndCondition(day: Day, condition: Condition): string {
  switch (day) {
    case Day.One:
      return condition === Condition.Active
        ? day1ActiveTrialOrder
        : day1PassiveTrialOrder;
    case Day.Two:
      return condition === Condition.Active
        ? day2ActiveTrialOrder
        : day2PassiveTrialOrder;
    case Day.Three:
      return condition === Condition.Active
        ? day3ActiveTrialOrder
        : day3PassiveTrialOrder;
  }
}

function addWavExtensionIfMissing(name: string): string {
  if (name.endsWith(".wav")) {
    return name;
  }
  return `${name}.wav`;
}
