import document from "document";
import * as utils from "./simple/utils";

// import clock from "clock";
import * as simpleMinutes from "./simple/clock-strings";

// Device form screen detection
import { me as device } from "device";

// Elements for style
const _container = document.getElementById("container") as GraphicsElement;
const _background = document.getElementById("background") as RectElement;
const _batteryBackground = document.getElementById("battery-bar-background") as GradientArcElement;

// Date
const _dates1Container = document.getElementById("date1-container") as GraphicsElement;
const _dates1 = _dates1Container.getElementsByTagName("image") as ImageElement[];
const _dates2Container = document.getElementById("date2-container") as GraphicsElement;
const _dates2 = _dates2Container.getElementsByTagName("image") as ImageElement[];

// Hours
const _clockContainer = document.getElementById("clock-container") as GraphicsElement;
const _clocks = _clockContainer.getElementsByTagName("image") as ImageElement[];
const _cloksHours = _clocks.slice(0, 2);
const _cloksMinutes = _clocks.slice(3, 5);

// Battery
const _batteryValueContainer = document.getElementById("battery-bar-container") as GraphicsElement;
const _batteryBar = document.getElementById("battery-bar-value") as GradientRectElement;
const _batterySymbol = document.getElementById("battery-symbol") as GraphicsElement;
const _batteryTextContainer = document.getElementById("battery-container") as GraphicsElement;
const _batteries = document.getElementById("battery-text-container").getElementsByTagName("image") as ImageElement[];

// Heart rate management
const _hrmContainer = document.getElementById("hrm-container") as GroupElement;
const _iconHRM = document.getElementById("hrm-symbol") as GraphicsElement;
const _imgHRM = document.getElementById("hrm-image") as ImageElement;
const _hrmTexts = document.getElementById("hrm-text-container").getElementsByTagName("image") as ImageElement[];

// Current settings
import { Settings } from "../common";
const _settings = new Settings();

// Fonts
import * as font from "./simple/font";

// Display & AOD
import * as simpleDisplay from "./simple/display";

let lastBpm: number;
// --------------------------------------------------------------------------------
// Clock
// --------------------------------------------------------------------------------
// Update the clock every minute
simpleMinutes.initialize("user", (clock) => {
  const folder: font.folder = simpleDisplay.isInAodMode()
    ? "chars-aod"
    : "chars";

  // Hours
  if (clock.Hours !== undefined) {
    font.print(clock.Hours, _cloksHours, folder);
  }

  // Minutes
  if (clock.Minutes !== undefined) {
    font.print(clock.Minutes, _cloksMinutes, folder);
  }

  // Date changes
  if (clock.Date1 !== undefined
    || clock.Date2 !== undefined
    || clock.AmOrPm !== undefined) {

    // Format request all the data of the last date
    const lastDate: simpleMinutes.FormatedDate = simpleMinutes.last;
    const date1: string = lastDate.AmOrPm === "  "
      ? lastDate.Date1
      : `${lastDate.Date1} ${lastDate.AmOrPm}`;

    const date2: string = lastDate.AmOrPm === "  "
      ? lastDate.Date2
      : `${lastDate.Date2} ${lastDate.AmOrPm}`;

    // Position
    _dates1Container.x = (device.screen.width / 2) - (date1.length * 10);
    font.print(date1, _dates1);
    // Position
    _dates2Container.x = (device.screen.width / 2) - (date2.length * 10);
    font.print(date2, _dates2);
  }
});

function setHoursMinutes(folder: font.folder) {
  // Hours
  font.print(simpleMinutes.last.Hours + ":" + simpleMinutes.last.Minutes, _clocks, folder);
}

// --------------------------------------------------------------------------------
// Battery power
// --------------------------------------------------------------------------------
import * as simpleBattery from "./simple/battery";

// Method to update battery level informations
simpleBattery.initialize((battery) => {
  // Battery bar
  _batteryBar.width = Math.floor(battery) * device.screen.width / 100;

  // Battery text
  font.print(battery.toString() + "%", _batteries);
});
// --------------------------------------------------------------------------------
// Settings
// --------------------------------------------------------------------------------
import * as simpleSettings from "simple-fitbit-settings/app";

simpleSettings.initialize(
  _settings,
  (settingsNew: Settings) => {
    if (!settingsNew) {
      return;
    }

    if (settingsNew.showBatteryPourcentage !== undefined) {
      _batteryTextContainer.style.display = settingsNew.showBatteryPourcentage === true
        ? "inline"
        : "none";
    }

    if (settingsNew.showBatteryBar !== undefined) {
      _batteryValueContainer.style.display = settingsNew.showBatteryBar === true
        ? "inline"
        : "none";
    }

    if (settingsNew.colorBackground !== undefined) {
      _background.style.fill = settingsNew.colorBackground;
      _batteryBackground.gradient.colors.c1 = settingsNew.colorBackground;
    }

    if (settingsNew.colorForeground !== undefined) {
      _container.style.fill = settingsNew.colorForeground;
    }

    // Display based on 12H or 24H format
    if (settingsNew.clockFormat !== undefined) {
      simpleMinutes.updateHoursFormat(settingsNew.clockFormat.values[0].value as simpleMinutes.HoursFormat);
    }
  });

// --------------------------------------------------------------------------------
// Heart rate manager
// --------------------------------------------------------------------------------
import * as simpleHRM from "./simple/hrm";

simpleHRM.initialize((newValue, bpm, zone, restingHeartRate) => {
  if (zone === "out-of-range") {
    _imgHRM.href = "images/stat_hr_open_48px.png";
  } else {
    _imgHRM.href = "images/stat_hr_solid_48px.png";
  }
  // Animation
  if (newValue) {
    _iconHRM.animate("highlight");
  }

  // BPM value display
  if (bpm !== lastBpm) {
    if (bpm > 0) {
      _hrmContainer.style.display = "inline";
      font.print(bpm.toString(), _hrmTexts);
    } else {
      _hrmContainer.style.display = "none";
    }
  }
});

// --------------------------------------------------------------------------------
// Allways On Display
// --------------------------------------------------------------------------------
simpleDisplay.initialize(onEnteredAOD, onLeavedAOD, onDisplayGoOn);

// Display change (animation for all clocks)
function onDisplayGoOn() {
  if (simpleBattery.isLow()) utils.highlight(_batterySymbol);
}

/**
 * Leaved AOD
 */
function onEnteredAOD() {
  // Stop sensors
  simpleHRM.stop();

  // Hours style update
  setHoursMinutes("chars-aod");

  // Hide elements
  _background.style.display = "none";
  //_datesContainer.style.display = "none";
  _batteryTextContainer.style.display = "none";
  _batteryValueContainer.style.display = "none";
  _hrmContainer.style.display = "none";
}

/**
 * Enterd in AOD
 */
function onLeavedAOD() {
  // Show elements & start sensors
  _background.style.display = "inline";
  if (_settings.showBatteryPourcentage) _batteryTextContainer.style.display = "inline";
  if (_settings.showBatteryBar) _batteryValueContainer.style.display = "inline";
  //_datesContainer.style.display = "inline";
  _hrmContainer.style.display = "inline";

  // Hours style update
  setHoursMinutes("chars");
  // Start sensors
  simpleHRM.start();
}