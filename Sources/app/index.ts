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
const dateContainer = document.getElementById("date-container") as GraphicsElement;
const dates = dateContainer.getElementsByTagName("image") as ImageElement[];

// Hours
const cloks = document.getElementById("clock-container").getElementsByTagName("image") as ImageElement[];

// Battery
const batteryValue = document.getElementById("battery-bar-value") as GradientRectElement;
const batteries = document.getElementById("battery-container").getElementsByTagName("image") as ImageElement[];

// Heart rate management
const iconHRM = document.getElementById("hrm-symbol") as GraphicsElement;
const imgHRM = document.getElementById("hrm-image") as ImageElement;
const hrmTexts = document.getElementById("hrm-text-container") .getElementsByTagName("image") as ImageElement[];
// --------------------------------------------------------------------------------
// Clock
// --------------------------------------------------------------------------------
// Update the clock every minute
simpleMinutes.initialize("minutes", (hours, mins, date) => {
  // hours="88";
  // mins="88";
  // date = "january 20";
  // Hours
  if(hours) {
    cloks[0].href = util.getImageFromLeft(hours,0);
    cloks[1].href = util.getImageFromLeft(hours,1);
  }

  // Minutes
  if(mins) {    
    cloks[3].href = util.getImageFromLeft(mins,0);
    cloks[4].href = util.getImageFromLeft(mins,1);  
  }

  // Date
  if(date) {
    // Position
    dateContainer.x = (device.screen.width / 2) - (date.length * 10);

    // Values
    for(let i=0; i<dates.length; i++){
      dates[i].href = util.getImageFromLeft(date, i);
    }
  }
});

// --------------------------------------------------------------------------------
// Power
// --------------------------------------------------------------------------------
import * as batterySimple from "./simple/power-battery";

// Method to update battery level informations
batterySimple.initialize((battery)=>{
  let batteryString = battery.toString() + "%";
  // Battery bar
  batteryValue.width = Math.floor(battery) * device.screen.width / 100;

  // Battery text
  let max = batteries.length - 1;
  for(let i=0; i<max; i++){
    batteries[i+1].href = util.getImageFromLeft(batteryString,i);  
  }
});
// --------------------------------------------------------------------------------
// Settings
// --------------------------------------------------------------------------------
import * as simpleSettings from "./simple/device-settings";

simpleSettings.initialize((settings:any) => {
  if (!settings) {
    return;
  }

  if (settings.colorBackground) {
    background.style.fill = settings.colorBackground;
    batteryBackground.gradient.colors.c1 = settings.colorBackground;
  }

  if (settings.colorForeground) {
    container.style.fill = settings.colorForeground;
  }
});
// --------------------------------------------------------------------------------
// Heart rate manager
// --------------------------------------------------------------------------------
import * as simpleHRM from "./simple/hrm";

simpleHRM.initialize((bpm, zone, restingHeartRate)=> {
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