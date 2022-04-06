import { parse, TrialType } from "../lib/parsing-trial-set.js";

describe("parsing-trial-set", () => {
  it("tbd", () => {
    const trialSet = parse(`
Task,Known/Novel,TargetWord,File Order,audio (.wav) file,TargetImage,image files,
Repetition,Known ,Button,1,Repetition_BUTTON_Final.wav,Button,Button.png,
Repetition,Known,Baby,2,Repetition_BABY_Final.wav,Baby,Baby.png,
Repetition,Known,Rooster,3,Repetition_ROOSTER_Final.wav,Rooster,Rooster.png,
Repetition,Novel,Topin,4,Repetition_TOPIN_Final.wav,Topin,Topin.png,
Repetition,Novel,Nedig,5,Repetition_NEDIG_Final.wav,Nedig,Nedig.png,
Repetition,Novel,Kinit,6,Repetition_KINIT_Final.wav,Kinit,Kinit.png,
Repetition,Novel,Daevl,7,Repetition_DAEVL_Final.wav,Daevl,Daevl.png,
2 dot test,Known,Baby or Cheetah,8,TwoDot_BABY_CHEETAH_Final.wav,Baby,Baby.png,
2 dot test,Known,Baby,9,Feedback_BABY_Final.wav,Baby,Baby.png,
2 dot test,Known,Pizza or Rooster,10,TwoDot_PIZZA_ROOSTER_Final.wav,Rooster,Rooster.png,
2 dot test,Known,Rooster,11,Feedback_ROOSTER_Final.wav,Rooster,Rooster.png,
2 dot test,Novel,Topin or Kinit,12,TwoDot_TOPIN_KINIT_Final.wav,Topin,Topin.png,
2 dot test,Novel,Topin,13,Feedback_TOPIN_Final.wav,Topin,Topin.png,
2 dot test,Novel,Daevl or Nedig,14,TwoDot_DAEVL_NEDIG_Final.wav,Nedig,Nedig.png,
2 dot test,Novel,Nedig,15,Feedback_NEDIG_Final.wav,Nedig,Nedig.png,
2 dot test,Novel,Kinit or Nedig,16,TwoDot_KINIT_NEDIG_Final.wav,Kinit,Kinit.png,
2 dot test,Novel,Kinit,17,Feedback_KINIT_Final.wav,Kinit,Kinit.png,
2 dot test,Novel,Topin or Daevl,18,TwoDot_TOPIN_DAEVL_Final.wav,Daevl,Daevl.png,
2 dot test,Novel,Daevl,19,Feedback_DAEVL_Final.wav,Daevl,Daevl.png,
Repetition,Novel,Topin,20,Repetition_TOPIN_Final.wav,Topin,Topin.png,
Repetition,Novel,Nedig,21,Repetition_NEDIG_Final.wav,Nedig,Nedig.png,
Repetition,Novel,Kinit,22,Repetition_KINIT_Final.wav,Kinit,Kinit.png,
Repetition,Novel,Daevl,23,Repetition_DAEVL_Final.wav,Daevl,Daevl.png,
2 dot test,Novel,Topin or Nedig,24,TwoDot_TOPIN_NEDIG_Final.wav,Topin,Topin.png,
2 dot test,Novel,Topin,25,Feedback_TOPIN_Final.wav,Topin,Topin.png,
2 dot test,Novel,Nedig or Kinit,26,TwoDot_NEDIG_KINIT_Final.wav,Nedig,Nedig.png,
2 dot test,Novel,Nedig,27,Feedback_NEDIG_Final.wav,Nedig,Nedig.png,
2 dot test ,Novel,Daevl or Kinit,28,TwoDot_DAEVL_KINIT_Final.wav,Kinit,Kinit.png,
2 dot test,Novel,Kinit,29,Feedback_KINIT_Final.wav,Kinit,Kinit.png,
2 dot test,Novel,Topin or Daevl,30,TwoDot_TOPIN_DAEVL_Final.wav,Daevl,Daevl.png,
2 dot test ,Novel,Daevl,31,Feedback_DAEVL_Final.wav,Daevl,Daevl.png,
Free Recall Test,Known,Baby,32,FreeRecall_WHAT_Final.wav,Baby,Baby.png,
Free Recall Test,Known,Rooster,33,FreeRecall_WHAT_Final.wav,Rooster,Rooster.png,
Free Recall Test,Novel,Topin,34,FreeRecall_WHAT_Final.wav,Topin,Topin.png,
Free Recall Test,Novel,Nedig,35,FreeRecall_WHAT_Final.wav,Nedig,Nedig.png,
Free Recall Test,Novel,Kinit,36,FreeRecall_WHAT_Final.wav,Kinit,Kinit.png,
Free Recall Test,Novel,Daevl,37,FreeRecall_WHAT_Final.wav,Daevl,Daevl.png,
Cued Recall Test,Known,Bay,38,CuedRecall_BAY_Final.wav,Baby,Baby.png,
Cued Recall Test,Known,Roo ,39,CuedRecall_ROO_Final.wav,Rooster,Rooster.png,
Cued Recall Test,Novel,To,40,CuedRecall_TO_Final.wav,Topin,Topin.png,
Cued Recall Test,Novel,Ne,41,CuedRecall_NE_Final.wav,Nedig,Nedig.png,
Cued Recall Test,Novel,Ki,42,CuedRecall_KI_Final.wav,Kinit,Kinit.png,
Cued Recall Test,Novel,Dae ,43,CuedRecall_DAE_Final.wav,Daevl,Daevl.png,
5-Minute Break,,,,,,,
Free Recall Test,Novel,Topin,44,FreeRecall_WHAT_Final.wav,Topin,Topin.png,
Free Recall Test,Novel,Nedig,45,FreeRecall_WHAT_Final.wav,Nedig,Nedig.png,
Free Recall Test,Novel,Kinit,46,FreeRecall_WHAT_Final.wav,Kinit,Kinit.png,
Free Recall Test,Novel,Daevl,47,FreeRecall_WHAT_Final.wav,Daevl,Daevl.png,
Cued Recall Test,Novel,To,48,CuedRecall_TO_Final.wav,Topin,Topin.png,
Cued Recall Test,Novel,Ne,49,CuedRecall_NE_Final.wav,Nedig,Nedig.png,
Cued Recall Test,Novel,Ki,50,CuedRecall_KI_Final.wav,Kinit,Kinit.png,
Cued Recall Test,Novel,Dae ,51,CuedRecall_DAE_Final.wav,Daevl,Daevl.png,
2 dot test,Novel,Daevl or Topin,52,TwoDot_DAEVL_TOPIN_Final.wav,Topin,Topin.png,
2 dot test,Novel,Nedig or Kinit,53,TwoDot_NEDIG_KINIT_Final.wav,Nedig,Nedig.png,
2 dot test,Novel,Topin or Kinit,54,TwoDot_TOPIN_KINIT_Final.wav,Kinit,Kinit.png,
2 dot test,Novel,Daevl or Nedig,55,TwoDot_DAEVL_NEDIG_Final.wav,Daevl,Daevl.png,
`);
    // expect(true).toBe(false);
  });

  it("tbd2", () => {
    const trialSet = parse(`
Task,Known/Novel,TargetWord,File Order,audio (.wav) file,TargetImage,image files,
Repetition,Known ,Button,1,Repetition_BUTTON_Final.wav,Button,Button.png,
Repetition,Known,Baby,2,Repetition_BABY_Final.wav,Baby,Baby.png,
2 dot test,Known,Baby or Cheetah,8,TwoDot_BABY_CHEETAH_Final.wav,Baby,Baby.png,
Repetition,Novel,Topin,20,Repetition_TOPIN_Final.wav,Topin,Topin.png,
2 dot test,Novel,Topin or Nedig,24,TwoDot_TOPIN_NEDIG_Final.wav,Topin,Topin.png,
Free Recall Test,Known,Baby,32,FreeRecall_WHAT_Final.wav,Baby,Baby.png,
Cued Recall Test,Known,Bay,38,CuedRecall_BAY_Final.wav,Baby,Baby.png,
5-Minute Break,,,,,,,
Free Recall Test,Novel,Topin,44,FreeRecall_WHAT_Final.wav,Topin,Topin.png,
Cued Recall Test,Novel,To,48,CuedRecall_TO_Final.wav,Topin,Topin.png,
2 dot test,Novel,Daevl or Topin,52,TwoDot_DAEVL_TOPIN_Final.wav,Topin,Topin.png,
`);
    expect(trialSet[0].type).toBe(TrialType.initialGame);
    expect(trialSet[1].type).toBe(TrialType.blank);
    expect(trialSet[2].type).toBe(TrialType.image);
    expect(trialSet[2].imageFileName).toBe("Button.png");
    expect(trialSet[3].type).toBe(TrialType.blank);
    expect(trialSet[4].type).toBe(TrialType.imageWithAudio);
    expect(trialSet[4].imageFileName).toBe("Baby.png");
    expect(trialSet[4].audioFileName).toBe("Repetition_BABY_Final.wav");
    expect(trialSet[5].type).toBe(TrialType.gameTransition);
    expect(trialSet[6].type).toBe(TrialType.greenCircle);
  });
});
