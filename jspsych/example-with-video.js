import * as pluginClasses from "./plugin.js";

const imageVideoButtonResponsePluginClass =
  pluginClasses.imageVideoButtonResponse(jsPsychModule);

function concatenatePaths(a, b) {
  return `${a}/${b}`;
}

const standardImageHeightPixels = 400;
const bottomRightButtonHTML =
  '<button class="jspsych-btn" style="position: absolute; bottom: 5%; right: 5%">%choice%</button>';

function resourcePath(fileName) {
  return concatenatePaths(wordLearningInNoiseResourcePath, fileName);
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
      timeline: [
        {
          type: imageVideoButtonResponsePluginClass,
          stimulusUrl: resourcePath(
            concatenatePaths("Clear Mask Stimuli", "CuedRecall_BAY.mp4")
          ),
          imageUrl: resourcePath("Baby.png"),
          imageHeight: standardImageHeightPixels,
          videoHeight: standardImageHeightPixels,
        },
      ],
      loop_function(data) {
        return data.values()[0].repeat;
      },
    },
    {
      type: jsPsychHtmlButtonResponse,
      stimulus: 'The test is done. Press "Finish" to complete. Thank you.',
      choices: ["Finish"],
      button_html: bottomRightButtonHTML,
    },
  ]);
}

main();
