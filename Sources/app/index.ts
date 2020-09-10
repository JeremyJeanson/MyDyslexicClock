import document from "document";
import * as util from "./simple/utils";

// import clock from "clock";
import * as simpleMinutes from "./simple/clock-strings";

// Device form screen detection
import { me as device } from "device";

// Elements for style
const _container = document.getElementById("container") as GraphicsElement;
const _background = document.getElementById("background") as RectElement;
const _batteryBackground = document.getElementById("battery-bar-background") as GradientArcElement;

// Date
const _datesContainer = document.getElementById("date-container") as GraphicsElement
const _dates1Container = document.getElementById("date1-container") as GraphicsElement;
const _dates1 = _dates1Container.getElementsByTagName("image") as ImageElement[];
const _dates2Container = document.getElementById("date2-container") as GraphicsElement;
const _dates2 = _dates2Container.getElementsByTagName("image") as ImageElement[];

// Hours
const _clockContainer = document.getElementById("clock-container") as GraphicsElement;
const _cloks = _clockContainer.getElementsByTagName("image") as ImageElement[];

// Battery
const _batteryValueContainer = document.getElementById("battery-bar-container") as GraphicsElement;
const _batteryBar = document.getElementById("battery-bar-value") as GradientRectElement;
const _batteryTextContainer = document.getElementById("battery-container") as GraphicsElement;
const _batteries = _batteryTextContainer.getElementsByTagName("image") as ImageElement[];

// Heart rate management
const _hrmContainer = document.getElementById("hrm-container") as GroupElement;
const _iconHRM = document.getElementById("hrm-symbol") as GraphicsElement;
const _imgHRM = document.getElementById("hrm-image") as ImageElement;
const _hrmTexts = document.getElementById("hrm-text-container").getElementsByTagName("image") as ImageElement[];

// Current settings
import { Settings } from "../common";
const _settings = new Settings();
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
    _cloks[0].href = util.getImageFromLeft(clock.Hours, 0);
    _cloks[1].href = util.getImageFromLeft(clock.Hours, 1);
  }

  // Minutes
  if (clock.Minutes !== undefined) {
    _cloks[3].href = util.getImageFromLeft(clock.Minutes, 0);
    _cloks[4].href = util.getImageFromLeft(clock.Minutes, 1);
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
    _dates1Container.x = (device.screen.width / 2) - (date1.length * 10);
    util.display(date1, _dates1);
    // Position
    _dates2Container.x = (device.screen.width / 2) - (date2.length * 10);
    util.display(date2, _dates2);
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
    if (settingsNew.clockDisplay24 !== undefined) {
      simpleMinutes.updateClockDisplay24(settingsNew.clockDisplay24);
    }
  });

// --------------------------------------------------------------------------------
// Heart rate manager
// --------------------------------------------------------------------------------
import * as simpleHRM from "./simple/hrm";
let lastBpm: number;

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
      let bpmString = bpm.toString();
      _hrmTexts[0].href = util.getImageFromLeft(bpmString, 0);
      _hrmTexts[1].href = util.getImageFromLeft(bpmString, 1);
      _hrmTexts[2].href = util.getImageFromLeft(bpmString, 2);
    } else {
      _hrmContainer.style.display = "none";
    }
  }
});

// --------------------------------------------------------------------------------
// Allways On Display
// --------------------------------------------------------------------------------
import { me } from "appbit";
import { display } from "display";
import clock from "clock"

// does the device support AOD, and can I use it?
if (display.aodAvailable && me.permissions.granted("access_aod")) {
  // tell the system we support AOD
  display.aodAllowed = true;

  // respond to display change events
  display.addEventListener("change", () => {

    // console.info(`${display.aodAvailable} ${display.aodEnabled} ${me.permissions.granted("access_aod")} ${display.aodAllowed} ${display.aodActive}`);

    // Is AOD inactive and the display is on?
    if (!display.aodActive && display.on) {
      clock.granularity = "seconds";

      // Show elements & start sensors
      _background.style.display = "inline";
      if (_settings.showBatteryPourcentage) _batteryTextContainer.style.display = "inline";
      if (_settings.showBatteryBar) _batteryValueContainer.style.display = "inline";
      _datesContainer.style.display = "inline";
      _hrmContainer.style.display = "inline";

      // hours position
      _clockContainer.height = 100;
      _clockContainer.width = 300;
      _clockContainer.x = (device.screen.width - 300) / 2;
      _clockContainer.y = device.screen.height * 12 / 100;

      // Start sensors
      simpleHRM.start();
    } else {
      clock.granularity = "minutes";

      // Stop sensors
      simpleHRM.stop();

      // hours position
      _clockContainer.height = 50;
      _clockContainer.width = 150;
      _clockContainer.x = (device.screen.width - 150) / 2;
      _clockContainer.y = (device.screen.height - 50) / 2;

      // Hide elements
      _background.style.display = "none";
      _datesContainer.style.display = "none";
      _batteryTextContainer.style.display = "none";
      _batteryValueContainer.style.display = "none";
      _hrmContainer.style.display = "none";
    }
  });
}