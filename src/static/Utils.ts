import { ActionType } from "../core/ActionType";
import { IEnumData } from "../core/IEnumData";
import { SessionState } from "../core/Sessions/SessionState";

/**
 * Helps convert string to time in ms
 * @param value - Time in format "00:00:00"
 * @returns time in ms
 */
export function convertStringToTime(value: string): number {
  if (value[0] === "-") {
    throw Error("Cannot convert negative time string!");
  }
  const data = value.split(":");
  const h = Number(data[0]) * 60 * 60 * 1000;
  const m = Number(data[1]) * 60 * 1000;
  const s = Number(data[2]) * 1000;

  return h + m + s;
}

/**
 * Helps convert ms to time string
 * @param value - Time to convert.
 * @returns time in "00:00:00" format
 */
export function convertTimeToString(value: number): string {
  if (value < 0) {
    throw Error("Cannot convert negative time to string!");
  }
  let seconds = Math.floor(value / 1000);
  let minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  seconds = seconds % 60;
  minutes = minutes % 60;

  return (
    padTo2Digits(hours) +
    ":" +
    padTo2Digits(minutes) +
    ":" +
    padTo2Digits(seconds)
  );
}

export function getActionTypeConfig(): IEnumData {
  return {
    name: "ActionType",
    values: [
      ActionType.Building,
      ActionType.Codding,
      ActionType.Debugging,
      ActionType.Documenting,
      ActionType.Idle,
      ActionType.Testing,
    ],
  };
}

export function getSessionStateConfig(): IEnumData {
  return {
    name: "SessionState",
    values: [SessionState.Ongoing, SessionState.Idle, SessionState.Ended],
  };
}

function padTo2Digits(num: number): string {
  return num.toString().padStart(2, "0");
}
