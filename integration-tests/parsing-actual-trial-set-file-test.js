import { parse, TrialType } from "../lib/parsing-trial-set.js";

import * as fs from "fs";

describe("parsing-actual-trial-set-file", () => {
  it("tbd", () => {
    const trialSet = parse(
      fs.readFileSync("integration-tests/set-a.csv", "utf8")
    );
    expect(trialSet[0].type).toBe(TrialType.initialGame);
    expect(trialSet[1].type).toBe(TrialType.blank);
    expect(trialSet[2].type).toBe(TrialType.image);
    expect(trialSet[2].imageFileName).toBe("Button.png");
    expect(trialSet[3].type).toBe(TrialType.blank);
    expect(trialSet[4].type).toBe(TrialType.imageWithAudio);
    expect(trialSet[4].imageFileName).toBe("Baby.png");
    expect(trialSet[4].audioFileName).toBe("Repetition_BABY_Final.wav");
    expect(trialSet[5].type).toBe(TrialType.blank);
    expect(trialSet[6].type).toBe(TrialType.imageWithAudio);
    expect(trialSet[6].imageFileName).toBe("Rooster.png");
    expect(trialSet[6].audioFileName).toBe("Repetition_ROOSTER_Final.wav");
    expect(trialSet[7].type).toBe(TrialType.blank);
    expect(trialSet[8].type).toBe(TrialType.imageWithAudio);
    expect(trialSet[8].imageFileName).toBe("Topin.png");
    expect(trialSet[8].audioFileName).toBe("Repetition_TOPIN_Final.wav");
    expect(trialSet[9].type).toBe(TrialType.blank);
    expect(trialSet[10].type).toBe(TrialType.imageWithAudio);
    expect(trialSet[10].imageFileName).toBe("Nedig.png");
    expect(trialSet[10].audioFileName).toBe("Repetition_NEDIG_Final.wav");
    // ...
    expect(trialSet[15].type).toBe(TrialType.gameTransition);
    expect(trialSet[16].type).toBe(TrialType.greenCircle);
    expect(trialSet[17].type).toBe(TrialType.twoDot);
    expect(trialSet[17].firstTargetWord).toBe("Baby");
    expect(trialSet[17].secondTargetWord).toBe("Cheetah");
    expect(trialSet[17].correctTargetWord).toBe("Baby");
    expect(trialSet[17].stimulusFileName).toBe("TwoDot_BABY_CHEETAH_Final.wav");
    expect(trialSet[17].feedbackAudioFileName).toBe("Feedback_BABY_Final.wav");
    expect(trialSet[17].imageFileName).toBe("Baby.png");
    expect(trialSet[18].type).toBe(TrialType.greenCircle);
    expect(trialSet[19].type).toBe(TrialType.twoDot);
    expect(trialSet[19].firstTargetWord).toBe("Pizza");
    expect(trialSet[19].secondTargetWord).toBe("Rooster");
    expect(trialSet[19].correctTargetWord).toBe("Rooster");
    expect(trialSet[19].stimulusFileName).toBe(
      "TwoDot_PIZZA_ROOSTER_Final.wav"
    );
    expect(trialSet[19].feedbackAudioFileName).toBe(
      "Feedback_ROOSTER_Final.wav"
    );
    expect(trialSet[19].imageFileName).toBe("Rooster.png");
    // ...
    expect(trialSet[28].type).toBe(TrialType.gameTransition);
    expect(trialSet[29].type).toBe(TrialType.greenCircle);
    expect(trialSet[30].type).toBe(TrialType.twoDot);
    expect(trialSet[30].firstTargetWord).toBe("Topin");
    expect(trialSet[30].secondTargetWord).toBe("Nedig");
    expect(trialSet[30].correctTargetWord).toBe("Topin");
    expect(trialSet[30].stimulusFileName).toBe("TwoDot_TOPIN_NEDIG_Final.wav");
    expect(trialSet[30].feedbackAudioFileName).toBe("Feedback_TOPIN_Final.wav");
    expect(trialSet[30].imageFileName).toBe("Topin.png");
    expect(trialSet[31].type).toBe(TrialType.greenCircle);
    expect(trialSet[32].type).toBe(TrialType.twoDot);
    expect(trialSet[32].firstTargetWord).toBe("Nedig");
    expect(trialSet[32].secondTargetWord).toBe("Kinit");
    expect(trialSet[32].correctTargetWord).toBe("Nedig");
    expect(trialSet[32].stimulusFileName).toBe("TwoDot_NEDIG_KINIT_Final.wav");
    expect(trialSet[32].feedbackAudioFileName).toBe("Feedback_NEDIG_Final.wav");
    expect(trialSet[32].imageFileName).toBe("Nedig.png");
    // ...
    expect(trialSet[37].type).toBe(TrialType.gameTransition);
    expect(trialSet[38].type).toBe(TrialType.blank);
    expect(trialSet[39].type).toBe(TrialType.imageWithAudio);
    expect(trialSet[39].imageFileName).toBe("Baby.png");
    expect(trialSet[39].audioFileName).toBe("FreeRecall_WHAT_Final.wav");
    expect(trialSet[40].type).toBe(TrialType.blank);
    expect(trialSet[41].type).toBe(TrialType.imageWithAudio);
    expect(trialSet[41].imageFileName).toBe("Rooster.png");
    expect(trialSet[41].audioFileName).toBe("FreeRecall_WHAT_Final.wav");
    // ...
    expect(trialSet[50].type).toBe(TrialType.gameTransition);
    expect(trialSet[51].type).toBe(TrialType.blank);
    expect(trialSet[52].type).toBe(TrialType.image);
    expect(trialSet[52].imageFileName).toBe("Seesaw.png");
    expect(trialSet[53].type).toBe(TrialType.blank);
    expect(trialSet[54].type).toBe(TrialType.imageWithAudio);
    expect(trialSet[54].imageFileName).toBe("Baby.png");
    expect(trialSet[54].audioFileName).toBe("CuedRecall_BAY_Final.wav");
    expect(trialSet[55].type).toBe(TrialType.blank);
    expect(trialSet[56].type).toBe(TrialType.imageWithAudio);
    expect(trialSet[56].imageFileName).toBe("Rooster.png");
    expect(trialSet[56].audioFileName).toBe("CuedRecall_ROO_Final.wav");
    // ...
    expect(trialSet[65].type).toBe(TrialType.gameTransition);
    expect(trialSet[66].type).toBe(TrialType.break);
    expect(trialSet[67].type).toBe(TrialType.initialGame);
    expect(trialSet[68].type).toBe(TrialType.blank);
    expect(trialSet[69].type).toBe(TrialType.imageWithAudio);
    expect(trialSet[69].imageFileName).toBe("Topin.png");
    expect(trialSet[69].audioFileName).toBe("FreeRecall_WHAT_Final.wav");
    expect(trialSet[70].type).toBe(TrialType.blank);
    expect(trialSet[71].type).toBe(TrialType.imageWithAudio);
    expect(trialSet[71].imageFileName).toBe("Nedig.png");
    expect(trialSet[71].audioFileName).toBe("FreeRecall_WHAT_Final.wav");
    // ...
    expect(trialSet[76].type).toBe(TrialType.gameTransition);
    expect(trialSet[77].type).toBe(TrialType.blank);
    expect(trialSet[78].type).toBe(TrialType.imageWithAudio);
    expect(trialSet[78].imageFileName).toBe("Topin.png");
    expect(trialSet[78].audioFileName).toBe("CuedRecall_TO_Final.wav");
    // expect(trialSet[27].type).toBe(TrialType.gameTransition);
    // expect(trialSet[28].type).toBe(TrialType.greenCircle);
    // expect(trialSet[29].type).toBe(TrialType.twoDotWithoutFeedback);
    // expect(trialSet[29].firstTargetWord).toBe("Daevl");
    // expect(trialSet[29].secondTargetWord).toBe("Topin");
    // expect(trialSet[29].correctTargetWord).toBe("Topin");
    // expect(trialSet[29].stimulusFileName).toBe("TwoDot_DAEVL_TOPIN_Final.wav");
    // expect(trialSet[29].imageFileName).toBe("Topin.png");
    // expect(trialSet[30].type).toBe(TrialType.gameTransition);
    // expect(trialSet.length).toBe(31);
  });
});
