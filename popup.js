// Import Helper Functions.
import {refreshTab, updateIcon, removeClass, observeSectionHeight} from './js/helperFunctions.js';
// Import Site Conceal tab functionalilty.
import {updateInput, removeInput, addInput, saveSelection} from './js/siteConceal.js';
//Import Screenshot tab.
import './js/screenshot.js';


// Popup container.
const container = document.querySelector(".container");

// Popup sections selections
const concealBtn = document.querySelector(".button.content.conceal");
const screenshotsBtn = document.querySelector(".button.content.screenshots");
const checklistBtn = document.querySelector(".button.content.checklist");
const reporterBtn = document.querySelector(".button.content.reporter");

// Popup sections
const conceal = document.querySelector(".conceal.layout");
const screenshots = document.querySelector(".screenshots.layout");
const checklist = document.querySelector(".checklist.layout");
const reporter = document.querySelector(".reporter.layout");

// Arrays used for maintaining inputs.
let selection = [];
let sitesToBlock = [];

// Check if there is any text to populate the inputs.
function checkStorage(){
  // chrome.storage.local.clear();
  chrome.storage.local.get(["site"]).then((result) => {
    let options = result.site;
    
    if(options?.length >= 1) {
      const savedOptions = options.map(element => {
        return element;
      });
      
      // Fill input fields with saved options.
      const insertSavedOptions = savedOptions.map(element => {
        return addInput(element);
      });
      // Filter out empty inputs.
      const filterOutEmptyInput = savedOptions.map((element) => element !== '');
      // Reset array with saved options.
      sitesToBlock.push(...filterOutEmptyInput);
    }
  });

  // Select Site Conceal tab.
  const navIcon = document.querySelectorAll(".icon.is-small > .fa-solid");
  const currentIcon = document.querySelector(`.button.content.conceal > .icon.is-small > .fa-solid`);

  // Remove any previously applied color to icons in navigation.
  navIcon.forEach(element => removeClass(element, "active", false));

  // Add color to selected icon in navigation.
  updateIcon(currentIcon, "active", false);

  // Use Mutation Observer to add link if section height is > 440px. 
  observeSectionHeight(conceal);
}

function displaySection() {
  // Hide all sections
  conceal.style.display = "none";
  screenshots.style.display = "none";
  checklist.style.display = "none";
  reporter.style.display = "none";

  // Filter selected class from clicked element. It shares a class with the associated section.
  const breakUpClass = this.classList[2];

  // Display desired section.
  const sectionInView = document.querySelector(`.${breakUpClass}.layout`);
  sectionInView.style.display = "block";
  
  // document.querySelector(`.${breakUpClass}.layout`).style.display = "block";

  const navIcon = document.querySelectorAll(".icon.is-small > .fa-solid");
  const currentIcon = document.querySelector(`.button.content.${breakUpClass} > .icon.is-small > .fa-solid`);

  // Remove any previously applied color to icons in navigation.
  navIcon.forEach(element => removeClass(element, "active", false));
  
  // Add color to selected icon in navigation.
  updateIcon(currentIcon, "active", false);

  observeSectionHeight(sectionInView);
}


// When popup opens, check to see if the Site Conceal has values to populate the inputs.
container.addEventListener("load", checkStorage());

// Display sections depending on tab clicked.
concealBtn.addEventListener("click", displaySection);
screenshotsBtn.addEventListener("click", displaySection);
checklistBtn.addEventListener("click", displaySection);
reporterBtn.addEventListener("click", displaySection);
