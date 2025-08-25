// client/src/intro-exit/DemoSurvey.jsx
import { usePlayer } from "@empirica/core/player/classic/react";
import React, { useState } from "react";
import { Alert } from "../components/Alert";
import { Button } from "../components/Button";

export function DemoSurvey({ next }) {
  const labelClassName = "block text-sm font-medium text-gray-700 my-2";
  const inputClassName =
    "appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-empirica-500 focus:border-empirica-500 sm:text-sm";

  const player = usePlayer();

  // Basics
  const [dob, setDob] = useState("");
  const [ageYears, setAgeYears] = useState("");

  // Ethnicity / race
  const [isHispanic, setIsHispanic] = useState("");
  const [races, setRaces] = useState([]);
  const [raceOtherChecked, setRaceOtherChecked] = useState(false);
  const [raceOtherText, setRaceOtherText] = useState("");

  // Sexual orientation
  const [orientation, setOrientation] = useState("");
  const [orientationOtherChecked, setOrientationOtherChecked] = useState(false);
  const [orientationOtherText, setOrientationOtherText] = useState("");

  // Gender identity
  const [genderIdentity, setGenderIdentity] = useState("");
  const [genderOtherChecked, setGenderOtherChecked] = useState(false);
  const [genderOtherText, setGenderOtherText] = useState("");

  // Marital status
  const [maritalStatus, setMaritalStatus] = useState("");

  // Military service
  const [militaryService, setMilitaryService] = useState("");

  // Employment
  const [employment, setEmployment] = useState("");

  // Civic / political
  const [votedLastElection, setVotedLastElection] = useState("");
  const [partyID, setPartyID] = useState("");
  const [ideology7pt, setIdeology7pt] = useState("");

  // Education
  const [education, setEducation] = useState("");

  // Religion
  const [religion, setReligion] = useState("");
  const [religionOtherChecked, setReligionOtherChecked] = useState(false);
  const [religionOtherText, setReligionOtherText] = useState("");

  function toggleRace(value) {
    setRaces((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      "What is your date of birth?": dob,
      "How old are you in years?": ageYears,
      "Are you Spanish, Hispanic, or Latino?": isHispanic,
      "What is your race? (choose all that apply)":
        raceOtherChecked
          ? [
              ...races,
              ...(raceOtherText.trim()
                ? [`Not listed (free response): ${raceOtherText.trim()}`]
                : ["Not listed (free response)"]),
            ]
          : races,
      "Which of the following best describes your sexual orientation?":
        orientationOtherChecked && orientationOtherText.trim()
          ? `not listed (free response): ${orientationOtherText.trim()}`
          : orientation || (orientationOtherChecked ? "not listed (free response)" : ""),
      "Which of the following best describes your gender identity?":
        genderOtherChecked && genderOtherText.trim()
          ? `not listed (free response): ${genderOtherText.trim()}`
          : genderIdentity || (genderOtherChecked ? "not listed (free response)" : ""),
      "Are you now married, widowed, divorced, separated, or never married?": maritalStatus,
      "Have you ever served on active duty in the US Armed Forces?": militaryService,
      "Which statement best describes your current employment status?": employment,
      "Did you vote in the last election?": votedLastElection,
      "Generally speaking, do you usually think of yourself as a Republican, a Democrat, an Independent, or something else?":
        partyID,
      "On 7-point scale on which the political views that people might hold are arranged from extremely liberal (left) to  extremely conservative (right), where would you place yourself?":
        ideology7pt,
      "What is the highest level of education that you have completed?": education,
      "What is your current religion, if any?":
        religionOtherChecked && religionOtherText.trim()
          ? `Something else (free response): ${religionOtherText.trim()}`
          : religion || (religionOtherChecked ? "Something else (free response)" : ""),
    };

    player.set("demoSurvey", payload);
    next();
  }

  return (
    <div className="py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <Alert title="Demographics Survey">
        <p>
          Please answer the following questions.<br />
          You may choose “prefer not to respond” where available. Your responses
          are confidential and used only for research purposes.
        </p>
      </Alert>

      <form className="mt-12 space-y-8" onSubmit={handleSubmit}>
        {/* Basics */}
        <div className="space-y-6">
          <div>
            <label htmlFor="dob" className={labelClassName}>
              What is your date of birth?
            </label>
            <input
              id="dob"
              name="dob"
              type="date"
              className={inputClassName}
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="ageYears" className={labelClassName}>
              How old are you in years?
            </label>
            <input
              id="ageYears"
              name="ageYears"
              type="number"
              min="0"
              inputMode="numeric"
              className={inputClassName}
              value={ageYears}
              onChange={(e) => setAgeYears(e.target.value)}
            />
          </div>
        </div>

        <Divider />

        {/* Ethnicity & Race */}
        <div className="space-y-6">
          <div>
            <label className={labelClassName}>
              Are you Spanish, Hispanic, or Latino?
            </label>
            <div className="space-y-2">
              {["Yes", "No"].map((lab) => (
                <Radio
                  key={lab}
                  name="isHispanic"
                  selected={isHispanic}
                  value={lab}
                  label={lab}
                  onChange={(e) => setIsHispanic(e.target.value)}
                />
              ))}
            </div>
          </div>

          <div>
            <label className={labelClassName}>
              What is your race? (choose all that apply)
            </label>
            <div className="space-y-2">
              {[
                "White",
                "Black or African American",
                "American Indian or Alaska Native",
                "Asian",
                "Native Hawaiian or Pacific Islander",
              ].map((lab) => (
                <Checkbox
                  key={lab}
                  name="race"
                  value={lab}
                  checked={races.includes(lab)}
                  label={lab}
                  onChange={() => toggleRace(lab)}
                />
              ))}

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  className="mt-1.5 h-4 w-4 border-gray-300 rounded"
                  checked={raceOtherChecked}
                  onChange={(e) => setRaceOtherChecked(e.target.checked)}
                  id="raceOther"
                />
                <div className="w-full">
                  <label
                    htmlFor="raceOther"
                    className="text-sm font-medium text-gray-700"
                  >
                    Not listed (free response)
                  </label>
                  <input
                    type="text"
                    className={`${inputClassName} mt-2`}
                    placeholder="Please specify"
                    value={raceOtherText}
                    onChange={(e) => setRaceOtherText(e.target.value)}
                    disabled={!raceOtherChecked}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <Divider />

        {/* Sexual Orientation */}
        <div className="space-y-6">
          <div>
            <label className={labelClassName}>
              Which of the following best describes your sexual orientation?
            </label>
            <div className="space-y-2">
              {[
                "straight (heterosexual)",
                "gay or lesbian (homosexual)",
                "bisexual",
                "queer",
                "asexual",
                "prefer not to respond",
              ].map((lab) => (
                <Radio
                  key={lab}
                  name="orientation"
                  selected={orientation}
                  value={lab}
                  label={lab}
                  onChange={(e) => {
                    setOrientationOtherChecked(false);
                    setOrientationOtherText("");
                    setOrientation(e.target.value);
                  }}
                />
              ))}
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  className="mt-1.5 h-4 w-4 border-gray-300 rounded"
                  checked={orientationOtherChecked}
                  onChange={(e) => {
                    setOrientationOtherChecked(e.target.checked);
                    if (e.target.checked) setOrientation("");
                  }}
                  id="orientationOther"
                />
                <div className="w-full">
                  <label
                    htmlFor="orientationOther"
                    className="text-sm font-medium text-gray-700"
                  >
                    not listed (free response)
                  </label>
                  <input
                    type="text"
                    className={`${inputClassName} mt-2`}
                    placeholder="Please specify"
                    value={orientationOtherText}
                    onChange={(e) => setOrientationOtherText(e.target.value)}
                    disabled={!orientationOtherChecked}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <Divider />

        {/* Gender Identity */}
        <div className="space-y-6">
          <div>
            <label className={labelClassName}>
              Which of the following best describes your gender identity?
            </label>
            <div className="space-y-2">
              {[
                "man",
                "woman",
                "non-binary",
                "transgender woman",
                "transgender man",
                "genderqueer",
                "not listed (free response)",
                "prefer not to respond",
              ].map((lab) =>
                lab === "not listed (free response)" ? (
                  <div className="flex items-start space-x-3" key={lab}>
                    <input
                      type="checkbox"
                      className="mt-1.5 h-4 w-4 border-gray-300 rounded"
                      checked={genderOtherChecked}
                      onChange={(e) => {
                        setGenderOtherChecked(e.target.checked);
                        if (e.target.checked) setGenderIdentity("");
                      }}
                      id="genderOther"
                    />
                    <div className="w-full">
                      <label
                        htmlFor="genderOther"
                        className="text-sm font-medium text-gray-700"
                      >
                        not listed (free response)
                      </label>
                      <input
                        type="text"
                        className={`${inputClassName} mt-2`}
                        placeholder="Please specify"
                        value={genderOtherText}
                        onChange={(e) => setGenderOtherText(e.target.value)}
                        disabled={!genderOtherChecked}
                      />
                    </div>
                  </div>
                ) : (
                  <Radio
                    key={lab}
                    name="genderIdentity"
                    selected={genderIdentity}
                    value={lab}
                    label={lab}
                    onChange={(e) => {
                      setGenderOtherChecked(false);
                      setGenderOtherText("");
                      setGenderIdentity(e.target.value);
                    }}
                  />
                )
              )}
            </div>
          </div>
        </div>

        <Divider />

        {/* Marital & Military */}
        <div className="space-y-6">
          <div>
            <label className={labelClassName}>
              Are you now married, widowed, divorced, separated, or never married?
            </label>
            <div className="space-y-2">
              {["married", "widowed", "divorced", "separated", "never married"].map(
                (lab) => (
                  <Radio
                    key={lab}
                    name="maritalStatus"
                    selected={maritalStatus}
                    value={lab}
                    label={lab}
                    onChange={(e) => setMaritalStatus(e.target.value)}
                  />
                )
              )}
            </div>
          </div>

          <div>
            <label className={labelClassName}>
              Have you ever served on active duty in the US Armed Forces?
            </label>
            <div className="space-y-2">
              {["Yes", "No"].map((lab) => (
                <Radio
                  key={lab}
                  name="militaryService"
                  selected={militaryService}
                  value={lab}
                  label={lab}
                  onChange={(e) => setMilitaryService(e.target.value)}
                />
              ))}
            </div>
          </div>
        </div>

        <Divider />

        {/* Employment */}
        <div className="space-y-6">
          <div>
            <label className={labelClassName}>
              Which statement best describes your current employment status?
            </label>
            <div className="space-y-2">
              {[
                "Working (paid employee)",
                "Working (self-employed)",
                "Not working (temporary layoff from a job)",
                "Not working (looking for work)",
                "Not working (retired)",
                "Not working (disabled)",
                "Not working (other)",
                "prefer not to respond",
              ].map((lab) => (
                <Radio
                  key={lab}
                  name="employment"
                  selected={employment}
                  value={lab}
                  label={lab}
                  onChange={(e) => setEmployment(e.target.value)}
                />
              ))}
            </div>
          </div>
        </div>

        <Divider />

        {/* Civic & Political */}
        <div className="space-y-6">
          <div>
            <label className={labelClassName}>
              Did you vote in the last election?
            </label>
            <div className="space-y-2">
              {["Yes", "No"].map((lab) => (
                <Radio
                  key={lab}
                  name="votedLastElection"
                  selected={votedLastElection}
                  value={lab}
                  label={lab}
                  onChange={(e) => setVotedLastElection(e.target.value)}
                />
              ))}
            </div>
          </div>

          <div>
            <label className={labelClassName}>
              Generally speaking, do you usually think of yourself as a Republican, a Democrat, an Independent, or something else?
            </label>
            <div className="space-y-2">
              {["Republican", "Democrat", "Independent", "Other", "No preference"].map(
                (lab) => (
                  <Radio
                    key={lab}
                    name="partyID"
                    selected={partyID}
                    value={lab}
                    label={lab}
                    onChange={(e) => setPartyID(e.target.value)}
                  />
                )
              )}
            </div>
          </div>

          <div>
            <label className={labelClassName}>
              On 7-point scale on which the political views that people might hold are arranged from extremely liberal (left) to  extremely conservative (right), where would you place yourself?
            </label>
            <div className="space-y-2">
              {["1", "2", "3", "4", "5", "6", "7"].map((lab) => (
                <Radio
                  key={lab}
                  name="ideology7pt"
                  selected={ideology7pt}
                  value={lab}
                  label={lab}
                  onChange={(e) => setIdeology7pt(e.target.value)}
                />
              ))}
            </div>
          </div>
        </div>

        <Divider />

        {/* Education */}
        <div className="space-y-6">
          <div>
            <label className={labelClassName}>
              What is the highest level of education that you have completed?
            </label>
            <div className="space-y-2">
              {[
                "Less than high school degree",
                "High school graduate (high school diploma or equivalent including GED)",
                "Some college but no degree",
                "Associate degree in college (2-year)",
                "Bachelor's degree in college (4-year)",
                "Master's degree",
                "Doctoral degree (e.g., PhD, MD, JD)",
              ].map((lab) => (
                <Radio
                  key={lab}
                  name="education"
                  selected={education}
                  value={lab}
                  label={lab}
                  onChange={(e) => setEducation(e.target.value)}
                />
              ))}
            </div>
          </div>
        </div>

        <Divider />

        {/* Religion */}
        <div className="space-y-6">
          <div>
            <label className={labelClassName}>
              What is your current religion, if any?
            </label>
            <div className="space-y-2">
              {[
                "Catholic (incl. Roman Catholic and Orthodox)",
                "Protestant (United Church of Canada, Anglican, Orthodox, Baptist, Lutheran)",
                "Christian Orthodox",
                "Jewish",
                "Muslim",
                "Sikh",
                "Hindu",
                "Buddhist",
                "Atheist (do not believe in God)",
                "Agnostic (not sure if there is a God)",
                "Something else (free response)",
                "Nothing in particular",
                "Just a Christian",
                "Don't know",
                "Prefer not to respond",
              ].map((lab) =>
                lab === "Something else (free response)" ? (
                  <div className="flex items-start space-x-3" key={lab}>
                    <input
                      type="checkbox"
                      className="mt-1.5 h-4 w-4 border-gray-300 rounded"
                      checked={religionOtherChecked}
                      onChange={(e) => {
                        setReligionOtherChecked(e.target.checked);
                        if (e.target.checked) setReligion("");
                      }}
                      id="religionOther"
                    />
                    <div className="w-full">
                      <label
                        htmlFor="religionOther"
                        className="text-sm font-medium text-gray-700"
                      >
                        Something else (free response)
                      </label>
                      <input
                        type="text"
                        className={`${inputClassName} mt-2`}
                        placeholder="Please specify"
                        value={religionOtherText}
                        onChange={(e) => setReligionOtherText(e.target.value)}
                        disabled={!religionOtherChecked}
                      />
                    </div>
                  </div>
                ) : (
                  <Radio
                    key={lab}
                    name="religion"
                    selected={religion}
                    value={lab}
                    label={lab}
                    onChange={(e) => {
                      setReligionOtherChecked(false);
                      setReligionOtherText("");
                      setReligion(e.target.value);
                    }}
                  />
                )
              )}
            </div>
          </div>
        </div>

        <div className="pt-6 mb-12">
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </div>
  );
}

function Divider() {
  return <hr className="my-8 border-gray-200" />;
}

export function Radio({ selected, name, value, label, onChange }) {
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

export function Checkbox({ name, value, checked, label, onChange }) {
  return (
    <label className="text-sm font-medium text-gray-700 flex items-center">
      <input
        className="mr-2 h-4 w-4 border-gray-300 rounded"
        type="checkbox"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
      />
      {label}
    </label>
  );
}
