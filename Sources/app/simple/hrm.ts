import { me } from "appbit";
import { display } from "display";
import { HeartRateSensor } from "heart-rate";
import { user } from "user-profile";

type DefaultZone = 'out-of-range' | 'fat-burn' | 'cardio' | 'peak';
type UserDefinedZone = 'below-custom' | 'custom' | 'above-custom';

let hrm:HeartRateSensor;
let watchID:number;
let hrmCallback:(bpm:string, zone:DefaultZone|UserDefinedZone, restingHeartRate:number)=>void;
let lastReading = 0;

export function initialize(callback:(bpm:string, zone:DefaultZone|UserDefinedZone, restingHeartRate:number)=>void) : void {
  if (me.permissions.granted("access_heart_rate") && me.permissions.granted("access_user_profile")) {
    hrmCallback = callback;
    hrm = new HeartRateSensor();
    setupEvents();
    start();
    lastReading = hrm.timestamp;
  } else {
    console.log("Denied Heart Rate or User Profile permissions");
    callback("?", null, null);
  }
}

function getReading() {
  let heartRate:string;
  if (hrm.timestamp === lastReading) {
    heartRate = "--";
  } else {
    heartRate = (hrm.heartRate|0).toString();
  }
  lastReading = hrm.timestamp;
  hrmCallback(
    heartRate,
    user.heartRateZone(hrm.heartRate || 0),
    user.restingHeartRate);
}

function setupEvents() : void {
  display.addEventListener("change", function() {
    if (display.on) {
      start();
    } else {
      stop();
    }
  });
}

function start() : void {
  if (!watchID) {
    hrm.start();
    getReading();
    watchID = setInterval(getReading, 1000);
  }
}

function stop() : void {
  hrm.stop();
  clearInterval(watchID);
  watchID = null;
}
