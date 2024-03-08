const hour = document.querySelector(".hour");
const min = document.querySelector(".min");
const sec = document.querySelector(".sec");

let timetosec = 1 * 60 * 60;
setInterval(() => {
  timetosec = timetosec - 1;
  let hours = Math.floor(timetosec / 60 / 60);
  let mins = Math.floor((timetosec / 60) % 60);
  let secs = Math.floor(timetosec % 60);
  if (hours < 10) {
    hours = "0" + hours;
  }
  if (mins < 10) {
    mins = "0" + mins;
  }
  if (secs < 10) {
    secs = "0" + secs;
  }
  hour.textContent = hours;
  min.textContent = mins;
  sec.textContent = secs;
}, 1000);
