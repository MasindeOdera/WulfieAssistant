import {debounce, updateIcon, removeClass} from './helperFunctions.js';

const urlContainer = document.querySelector(".url-container");
const inputUrl = document.querySelector(".input.url");
const inputWarning = document.querySelector(".message.is-warning");
const fileInputContainer = document.querySelector("#file-js-example #file-input-container");
const fileInput = document.querySelector("#file-input-container input[type=file]");
const fileName = document.querySelector("#file-input-container .file-name");
const chooseFileButton = document.querySelector("#file-input-container .file-label .file-cta");
const urlRight = document.querySelector(".url-right");
const urlWrong = document.querySelector(".url-wrong");
const captureScreenshot = document.querySelector("#capture");
const captureWarning = document.querySelector("#file-js-example .message.is-danger");
const captureThumbnailHeader = document.querySelector(".capture-thumbnail-container .title");

fileInput.onchange = (event) => {
  if (event.target.files.length > 0) {
    fileName.textContent = event.target.files[0].name;
    console.log("fileName: ", fileName);

    // Display header.
    // removeClass(captureThumbnailHeader, "hide", false); //Not sure what I wanted to do here...?

    // Have extra fields to add urls
    // Have a save icon(?), only save when there is at least one url.
    // Access the file object
    const file = event.target.files[0];

    // Save the file to localStorage.
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function () {
        // Get the file data (base64 encoded)
        const fileData = reader.result;
        // Store the file data in Chrome Storage.
        chrome.storage.local.set({ uploadedFile: fileData }, function() {
          console.log('Data saved to Chrome Storage: ', fileData);
        });
      };
    }
    // Generate a thumbnail for the saved image.
    generateThumbnail(file);
    
    // Example: Log the file object to the console
    console.log(file);

    // Scroll down, and also need to only reveal h5 when there is a thumbnail.
    setTimeout(() => window.scrollTo({top: document.documentElement.scrollHeight, behavior: 'smooth'}), 500);

    // Clear the selected image from the span & replace with placeholder.
    setTimeout(() => fileName.textContent = "Add another?", 2000);
  }
};

function removeImage() {
  this.parentElement.remove();
}

function generateThumbnail(file) {
  const reader = new FileReader();
  reader.onload = function(event) {
    const img = new Image();

    img.onload = function() {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const thumbnailWidth = 100;
      const thumbnailHeight = 100;
      canvas.width = thumbnailWidth;
      canvas.height = thumbnailHeight;

      ctx.drawImage(img, 0, 0, thumbnailWidth, thumbnailHeight);

      const thumbnailDataUrl = canvas.toDataURL();

      const thumbnailImg = new Image();
      thumbnailImg.src = thumbnailDataUrl;

      // Create delete icon for thumbnail.
      const deleteButton = document.createElement("button");
      deleteButton.classList = "delete";
      deleteButton.style.background = "red";
      deleteButton.style.right = "10%";
      deleteButton.style.bottom = "4%";

      // Remove thumbnail when delete icon is clicked.
      deleteButton.addEventListener("click", removeImage);
      
      // Create a div with class block to contain the individual thumbnail.
      const block = document.createElement("div");
      block.classList = "block";
      block.style.marginRight = "4px";
      block.appendChild(thumbnailImg);
      block.appendChild(deleteButton);

      const thumbnailContainer = document.getElementById('thumbnailContainer');
      thumbnailContainer.style.display = "flex";
      thumbnailContainer.appendChild(block);
    };

    img.src = event.target.result;
  };

  reader.readAsDataURL(file);
  // Scroll down so that the Thumbnails are in view.
  window.scrollTo({top: document.documentElement.scrollHeight, behavior: 'smooth'});
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
        canvas.width = 640;
        canvas.height = 520;
        console.log("canvas width: ", canvas.width);
        console.log("canvas height: ", canvas.height);
        let context = canvas.getContext("2d");
        // Calculate the new dimensions of the image
        const scaleFactor = 0.4; // Check to see if this looks different with monitors attached.
        const newWidth = bitmap.width * scaleFactor;
        const newHeight = bitmap.height * scaleFactor;
        // Calculate the position to center the image on the canvas
        const x = (canvas.width - newWidth) / 2;
        const y = (canvas.height - newHeight) / 2;
        // Draw the image on the canvas with the new dimensions and position
        context.drawImage(bitmap, x, y, newWidth, newHeight);
        // context.drawImage(bitmap, 0, 0, bitmap.width * 0.5, bitmap.height * 0.5);
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

// If no URL submitted, then prevent upload & display warning message.
function checkForUrlFirst() {
  if (urlRight.classList.contains("show")) {
    fileInputContainer.removeAttribute('disabled', 'disabled');
  } else {
    fileInputContainer.setAttribute('disabled', 'disabled');
    removeClass(captureWarning, "hide", false);
    updateIcon(captureWarning, "hide", true);
  }
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
    // Allow users to add image.
    fileInputContainer.removeAttribute('disabled', 'disabled');
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
chooseFileButton.addEventListener("click", checkForUrlFirst);
