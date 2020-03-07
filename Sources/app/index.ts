import document from "document";
import * as util from "./simple/utils";

// import clock from "clock";
import * as simpleMinutes from "./simple/clock-strings";

// Device form screen detection
import { me as device } from "device";

// Elements for style
const container = document.getElementById("container") as GraphicsElement;
const background = document.getElementById("background") as RectElement;
const batteryBackground = document.getElementById("battery-bar-background") as GradientArcElement;

// Date
const dates1Container = document.getElementById("date1-container") as GraphicsElement;
const dates1 = dates1Container.getElementsByTagName("image") as ImageElement[];
const dates2Container = document.getElementById("date2-container") as GraphicsElement;
const dates2 = dates2Container.getElementsByTagName("image") as ImageElement[];

// Hours
const cloks = document.getElementById("clock-container").getElementsByTagName("image") as ImageElement[];

// Battery
const _batteryBarContainer = document.getElementById("battery-bar-container") as GraphicsElement;
const _batteryBar = document.getElementById("battery-bar-value") as GradientRectElement;
const _batteriesContainer = document.getElementById("battery-container") as GraphicsElement;
const _batteries = _batteriesContainer.getElementsByTagName("image") as ImageElement[];

// Heart rate management
const iconHRM = document.getElementById("hrm-symbol") as GraphicsElement;
const imgHRM = document.getElementById("hrm-image") as ImageElement;
const hrmTexts = document.getElementById("hrm-text-container").getElementsByTagName("image") as ImageElement[];
// --------------------------------------------------------------------------------
// Clock
// --------------------------------------------------------------------------------
// Update the clock every minute
simpleMinutes.initialize("minutes", (clock) => {
  // hours="88";
  // mins="88";
  // date = "january 20";
  // Hours
  if (clock.Hours !== undefined) {
    cloks[0].href = util.getImageFromLeft(clock.Hours, 0);
    cloks[1].href = util.getImageFromLeft(clock.Hours, 1);
  }

  // Minutes
  if (clock.Minutes !== undefined) {
    cloks[3].href = util.getImageFromLeft(clock.Minutes, 0);
    cloks[4].href = util.getImageFromLeft(clock.Minutes, 1);
  }

  // Date changes
  if (clock.Date1 !== undefined
    || clock.Date2 !== undefined
    || clock.AmOrPm !== undefined) {

    // Format request all the data of the last date
    const lastDate: simpleMinutes.FormatedDate = simpleMinutes.getLast();
    const date1: string = lastDate.AmOrPm === ""
      ? lastDate.Date1
      : `${lastDate.Date1}, ${lastDate.AmOrPm}`;

    const date2: string = lastDate.AmOrPm === ""
      ? lastDate.Date2
      : `${lastDate.Date2}, ${lastDate.AmOrPm}`;

    // Position
    dates1Container.x = (device.screen.width / 2) - (date1.length * 10);
    util.display(date1, dates1);
    // Position
    dates2Container.x = (device.screen.width / 2) - (date2.length * 10);
    util.display(date2, dates2);
  }
});

// --------------------------------------------------------------------------------
// Power
// --------------------------------------------------------------------------------
import * as batterySimple from "./simple/power-battery";

// Method to update battery level informations
batterySimple.initialize((battery) => {
  let batteryString = battery.toString() + "%";
  // Battery bar
  _batteryBar.width = Math.floor(battery) * device.screen.width / 100;

  // Battery text
  let max = _batteries.length - 1;
  for (let i = 0; i < max; i++) {
    _batteries[i + 1].href = util.getImageFromLeft(batteryString, i);
  }
});
// --------------------------------------------------------------------------------
// Settings
// --------------------------------------------------------------------------------
import * as simpleSettings from "./simple/device-settings";

simpleSettings.initialize((settings: any) => {
  if (!settings) {
    return;
  }

  if (settings.showBatteryPourcentage !== undefined) {
    _batteriesContainer.style.display = settings.showBatteryPourcentage === true
      ? "inline"
      : "none";
  }

  if (settings.showBatteryBar !== undefined) {
    _batteryBarContainer.style.display = settings.showBatteryBar === true
      ? "inline"
      : "none";
  }

  if (settings.colorBackground) {
    background.style.fill = settings.colorBackground;
    batteryBackground.gradient.colors.c1 = settings.colorBackground;
  }

  if (settings.colorForeground) {
    container.style.fill = settings.colorForeground;
  }

  // Display based on 12H or 24H format
  if (settings.clockDisplay24 !== undefined) {
    simpleMinutes.updateClockDisplay24(settings.clockDisplay24 as boolean);
  }
});
// --------------------------------------------------------------------------------
// Heart rate manager
// --------------------------------------------------------------------------------
import * as simpleHRM from "./simple/hrm";

simpleHRM.initialize((bpm, zone, restingHeartRate) => {
  if (zone === "out-of-range") {
    imgHRM.href = "images/stat_hr_open_48px.png";
  } else {
    imgHRM.href = "images/stat_hr_solid_48px.png";
  }
  if (bpm !== "--") {
    iconHRM.animate("highlight");
    let bpmString = `${bpm}`;
    hrmTexts[0].href = util.getImageFromLeft(bpmString, 0);
    hrmTexts[1].href = util.getImageFromLeft(bpmString, 1);
    hrmTexts[2].href = util.getImageFromLeft(bpmString, 2);
  }
});