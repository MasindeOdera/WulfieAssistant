import {debounce, updateIcon, removeClass} from './helperFunctions.js';

const urlContainer = document.querySelector(".url-container");
const inputUrl = document.querySelector(".input.url");
const inputWarning = document.querySelector(".message.is-warning");
const fileInput = document.querySelector("#file-js-example input[type=file]");
const fileName = document.querySelector("#file-js-example .file-name");
const urlRight = document.querySelector(".url-right");
const urlWrong = document.querySelector(".url-wrong");
const captureScreenshot = document.querySelector("#capture");

fileInput.onchange = (event) => {
  if (event.target.files.length > 0) {
    fileName.textContent = event.target.files[0].name;
    console.log("fileName: ", fileName);

    // Have extra fields to add urls
    // Have a save icon(?), only save when there is at least one url.
    
    // Access the file object
    const selectedFile = event.target.files[0];
    
    // Use the file for further processing, such as uploading
    
    // Example: Log the file object to the console
    console.log(selectedFile);
  }
};

function openScreenshotCanvas() {
  const urlLength = inputUrl.value.length;
  const url = inputUrl.value;

  // Add warning message if no url present.
  if(urlLength === 0 || isUrlValid(url) === false) {
    removeClass(inputWarning, "hide", false);
    setTimeout(() => updateIcon(inputWarning, "hide", false), 3000);
    return;
  };
  
  const sources = ["screen", "window", "tab"];
  chrome.tabs.getCurrent((tab) => {
    chrome.desktopCapture.chooseDesktopMedia(sources, tab, (streamId) => {
      let track, canvas;
      navigator.mediaDevices.getUserMedia({
        video: {
          mandatory: {
            chromeMediaSource: "desktop",
            chromeMediaSourceId: streamId
          },
        }
      }).then((stream) => {
        track = stream.getVideoTracks()[0];
        const imageCapture = new ImageCapture(track);
        return imageCapture.grabFrame();
      }).then((bitmap) => {
        track.stop();
        canvas = document.createElement("canvas");
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        let context = canvas.getContext("2d");
        context.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height);
        return canvas.toDataURL();
      }).then((url) => {
        chrome.downloads.download({
          filename: "screenshot.png",
          url: url,
        }, () => {
          canvas.remove();
        });
      }).catch((err) => {
        console.log(err);
      })
    });
  });
};

// const processUrlValidation = debounce(() => validateUrl(), 3000);
const processUrl = debounce(function validation(){
  removeClass(urlRight, "show", false);
  removeClass(urlWrong, "show", false);
  validateUrl();
}, 1000);

// Keep array updated with input text.
export function validateUrl() {
  const url = inputUrl.value;

  if (url.length > 0) {
    updateIcon(urlContainer, "is-loading", false);
    removeClass(urlContainer, "is-loading", true);
    // If the url input has a value, then it will need an icon for the appropriate validation.
    updateIcon(urlContainer, "has-icons-right", true);
  }

  if(isUrlValid(url)) {
    updateIcon(urlRight, "show", true);
  } else {
    // Remove "x" if there is no text.
    url === "" ? removeClass(urlWrong, "show", false) : updateIcon(urlWrong, "show", true);
  }
};

function isUrlValid(string) {
  try {
    const url = new URL(string);
    const domain = url.hostname;

    // Check if the domain is valid
    // The "i" at then end makes sure it is case insensitive, & currently only the domains below will be accepted.
    const domainRegex = /^(acc\-|tst\-)?(www\.)[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.(com|co|uk|net|org|io|xyz)$/i;
    if (!domainRegex.test(domain)) {
      return false;
    }

    return true;
  } catch (err) {
    return false;
  }
};

inputUrl.addEventListener("input", processUrl);
captureScreenshot.addEventListener("click", openScreenshotCanvas);
