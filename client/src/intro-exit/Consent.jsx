import React, { useState } from "react";
import { usePlayer } from "@empirica/core/player/classic/react";
import { Alert } from "../components/Alert";
import { Button } from "../components/Button";

// Style tokens aligned with DemoSurvey.jsx
const labelClassName = "block text-sm font-medium text-gray-700 my-2";
const inputClassName =
  "appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-empirica-500 focus:border-empirica-500 sm:text-sm";

// Toggle: true = online pay language, false = in-person SONA language
const ONLINE = false;

export function ConsentForm({ next }) {
  const player = usePlayer();
  const [videoConsent, setVideoConsent] = useState("");
  const [error, setError] = useState("");

  function handleAccept(e) {
    e.preventDefault();
    setError("");
    if (!videoConsent) {
      setError("Please indicate whether you consent to being videorecorded.");
      return;
    }
    try {
      player?.set("consentAccepted", true);
      player?.set("consentAcceptedAt", new Date().toISOString());
      player?.set("videoRecordingConsent", videoConsent === "yes");
    } catch {}
    next?.();
  }

  function handleDecline(e) {
    e.preventDefault();
    try {
      player?.set("consentAccepted", false);
      player?.set("consentDeclinedAt", new Date().toISOString());
    } catch {}
  }

  return (
    <div className="py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-md mb-6">
        <Alert
          title="Consent to Participate in a Research Study"
          className="text-red-800"
        >
          <p className="text-red-700">
            Please read this information carefully in order to make an informed decision about participating in this study.<br />
            If you are playing on your computer, you may save a digital copy of this form.<br />
            If you are playing in person, you may request a physical copy of this form.
          </p>
        </Alert>
      </div>

      <form className="mt-12 space-y-4" onSubmit={handleAccept}>
        <div className="space-y-6">
          <p className="text-lg text-center font-medium text-gray-900 whitespace-pre-line"> {
          `CONSENT TO PARTICIPATE IN A RESEARCH STUDY
          Study Title: Games and Strategic Reasoning`}</p>

          <Divider />

          {/* Key Information */}
          <div className="bg-blue-100 border-l-4 border-empirica-500 p-5 rounded-lg shadow-sm text-gray-700 text-base mb-10">

            <p className="font-medium">Key Information</p>
            <p>You are being invited to <b>participate in a research study.</b></p>
            <p>Participation in research is <b>completely voluntary.</b></p>
            <p>
              The purpose of the study is to <b>study different strategies regarding
              cooperation.</b>
            </p>
            <p>
              The study will take a total of <b>2 hours at max</b> and you will be
              asked to <b>make decisions in a game.</b>
            </p>
            <p>
              Risks and/or discomforts include <b>minor frustration</b> at the outcome
              of the game.
            </p>
            <p>
              There is <b>no direct benefit to you</b>, except any enjoyment you
              receive from the game. The results from the study may help us
              understand strategies people employ in the real world.
            </p>
          </div>

          <Divider />

          {/* Investigator */}
          <div className="space-y-2 text-sm text-gray-900">
            <p className="font-medium">
              Investigator’s Name, Department, Telephone Number:
            </p>
            <p>
              Leo Niehorster-Cook, Cognitive & Information Sciences,
              913-549-6501
            </p>
          </div>

          <Divider />

          {/* PURPOSE */}
          <div className="space-y-2 text-sm text-gray-900">
            <p className="font-medium">PURPOSE</p>
            <p>
              You are being asked to participate in a research study involving
              strategic interaction between people. <br></br>
              We hope to learn what strategies people use to make decisions
              in a social context, and how this results in group-level patterns.
            </p>
          </div>

          <Divider />

          {/* PROCEDURES */}
          <div className="space-y-2 text-sm text-gray-900">
            <p className="font-medium">PROCEDURES</p>
            <p>
              If you choose to be in the study, you will be asked to answer
              questions, play a game, and/or describe your reasoning. You will
              respond by writing, speaking, typing, and/or clicking on a
              computer screen. We may record your responses, including all
              interactions with the computer. These tasks allow us to better
              understand how people interact with others in strategic
              environments. This should take between 10 minutes and two hours. The
              study will be completed either in-person at the University of
              California, Merced, or online on your computer. You can stop the
              study at any time. Approximately 1,000 people will participate in
              this study.
            </p>
            <p>
              We may videorecord your responses. Please indicate whether you
              consent to being videorecorded:
            </p>
            <div className="space-y-2">
              <Radio
                name="videoConsent"
                selected={videoConsent}
                value="yes"
                label="I do consent to being videorecorded."
                onChange={(e) => setVideoConsent(e.target.value)}
              />
              <Radio
                name="videoConsent"
                selected={videoConsent}
                value="no"
                label="I do not consent to being videorecorded"
                onChange={(e) => setVideoConsent(e.target.value)}
              />
            </div>
          </div>

          <Divider />

          {/* RISKS */}
          <div className="space-y-2 text-sm text-gray-900">
            <p className="font-medium">RISKS</p>
            <p>
              Participants should generally not experience any risks beyond
              those of daily living and computer use. One potential risk is
              frustration when trying to solve more difficult reasoning
              problems. For participants who are videorecorded, breach of
              confidentiality is also a potential risk.
            </p>
          </div>

          <Divider />

          {/* BENEFITS */}
          <div className="space-y-2 text-sm text-gray-900">
            <p className="font-medium">BENEFITS</p>
            <p>
              It is possible that you will not benefit directly by participating in this study.
              However, the game is designed to be engaging and fun.
            </p>
          </div>

          <Divider />

          {/* CONFIDENTIALITY */}
          <div className="space-y-2 text-sm text-gray-900">
            <p className="font-medium">CONFIDENTIALITY</p>
            <p>
              Absolute confidentiality cannot be guaranteed, since research
              documents are not protected from subpoena. We will not ask for any
              identifiable information. If you are videorecorded, you may be
              identifiable from the video recording. <b>Video-recordings may be 
              used in presentations, academic publications, and for research
              purposes.</b> The data collected in this study could be used for
              future research studies or distributed to other investigators for
              future research studies without additional informed consent from
              the subject or legally authorized representative. The information
              collected during this study may be presented at conferences,
              published in scientific journals, and shared with other
              researchers. Identifiable information will be removed before the
              data is shared. Individual privacy will be maintained and identities will not be disclosed.
            </p>
          </div>

          <Divider />

          {/* COSTS/COMPENSATION */}
          <div className="space-y-2 text-sm text-gray-900">
            <p className="font-medium">COSTS/COMPENSATION</p>
            {ONLINE ? (
              <p>
                If you are participating in return for payment, you will be
                compensated approximately $7.25/hour for participating in this
                study. In addition to this, you may receive incentives such as
                cash prizes for performing well in the game. There is no cost to
                you beyond the time and effort required to complete the
                procedure(s) described above.
              </p>
            ) : (
              <p>
                If you are participating in return for course credit, you will be
                compensated through the SONA system with course credit. You will
                receive 0.5 credits for each half hour spent on the study, with a minimum
                of 0.5 credits, even if you do not complete the study. In addition to this,
                you may receive incentives such as cash prizes for performing well in the game.
                There is no cost to you beyond the time and effort required to complete the
                procedure(s) described above.
              </p>
            )}
          </div>

          <Divider />

          {/* ALTERNATIVES */}
          <div className="space-y-2 text-sm text-gray-900">
            <p className="font-medium">ALTERNATIVES </p>
            <p>
              If you are receiving extra credit in connection with or as part of
              a course, your instructor must offer you other options for
              obtaining credit, if you decline to participate.
            </p>
          </div>

          <Divider />

          {/* RIGHT TO REFUSE OR WITHDRAW */}
          <div className="space-y-2 text-sm text-gray-900">
            <p className="font-medium">RIGHT TO REFUSE OR WITHDRAW</p>
            <p>
              Participation is completely voluntary.  You may refuse to
              participate in this study.  You may change your mind about being
              in the study and quit after the study has started.
            </p>
          </div>

          <Divider />

          {/* QUESTIONS */}
          <div className="space-y-2 text-sm text-gray-900">
            <p className="font-medium">QUESTIONS</p>
            <p>
              If you have any questions about this research project please
              contact Leo Niehorster-Cook, who will answer them at
              LNiehorster-Cook@ucmerced.edu or (913) 549-6501.
            </p>
            <p>
              For questions about your rights while taking part in this study
              call the Office of Research at (209) 228-4613 or write to the
              Office of Research, 5200 North Lake Rd, UC Merced, Merced, CA
              95343. The Office of Research will inform the Institutional
              Review Board (IRB) which is a group of people who review the research to
              protect your rights. If you have any complaints or concerns about
              this study, you may address them to Rose Scott, Chair of the IRB
              at irbchair@ucmerced.edu or (209) 228-4362.
            </p>
            <p className="select-none">
              ___________________________________________________________________________________________
            </p>
          </div>

          <Divider />

          {/* CONSENT */}
          <div className="space-y-2 text-sm text-gray-900">
            <p className="font-medium">CONSENT</p>
            <p>
              By clicking accept, you indicate that you have decided to
              participate as a research subject and that you have read and
              understood the information provided above. <br />
              If you are playing on your computer, you may save a digital copy of this form.<br />
              If you are playing in person, you may request a physical copy of this form.

            </p>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800"
          >
            {error}
          </div>
        )}

        <div className="pt-6 mb-12 flex items-center gap-3">
          <Button type="button" onClick={handleDecline}>
            Decline
          </Button>
          <Button type="submit">Accept</Button>
        </div>
      </form>
    </div>
  );
}

function Divider() {
  return <hr className="my-8 border-gray-200" />;
}

function Radio({ selected, name, value, label, onChange }) {
  return (
    <label className="text-sm font-medium text-gray-700 flex items-center">
      <input
        className="mr-2 shadow-sm sm:text-sm"
        type="radio"
        name={name}
        value={value}
        checked={selected === value}
        onChange={onChange}
      />
      {label}
    </label>
  );
}
