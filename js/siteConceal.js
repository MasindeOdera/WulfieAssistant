import {refreshTab, updateIcon, removeClass} from './helperFunctions.js';

const concealBtn = document.querySelector(".button.content.conceal");
const conceal = document.querySelector(".conceal.layout");

// Dynamic Site Conceal input fields.
const addBtn = document.querySelector(".add.button.is-success");
const input = document.querySelector(".sites-to-block");
const siteInput = document.getElementById("input");
const site = document.querySelector(".site");

// Arrays used for maintaining inputs.
let selection = [];
let sitesToBlock = [];

// Save Popup state button.
const save = document.querySelector(".save-selected-sites");

export function removeInput(){
  // Clear Chrome storage if last input has been removed.
  const allRestrictions = document.querySelectorAll(".restriction");
  if (allRestrictions.length === 1){
    // Empty array for updated strings
    sitesToBlock.length = 0;
    chrome.storage.local.set({ site: sitesToBlock }).then(() => {
      localStorage.setItem("textMatchedInSites", sitesToBlock, sitesToBlock.length);
    });
    chrome.runtime.sendMessage({type: "inputValue", value: sitesToBlock});
    refreshTab();
  }

  // Delete input row after 2 seconds.
  setTimeout(() => this.parentElement.remove(), 2000);
}

// Keep array updated with input text.
export function updateInput(){
  const createdInputs = input.children;
  selection = Array.from(createdInputs);
}

// Add a new input field.
export function addInput(siteBlocked = ""){
  // Create input element.
  const site = document.createElement("input");
  site.className = "site";
  site.id = "input";
  site.type = "text";
  site.placeholder = "Enter site to be blocked";

  // Create delete button.
  const btn = document.createElement("span");
  btn.className = "mdi mdi-trash-can-outline";
  const trashIcon = document.createElement("i");
  trashIcon.className = "fa-solid fa-trash-can";
  // Attach trash icon to button.
  btn.appendChild(trashIcon);
  btn.className = "remove";

  // Animate Trash icon when clicked.
  trashIcon.addEventListener("click", () => { updateIcon(trashIcon, "fa-beat-fade", false) });
  
  // When delete button is clicked, remove input.
  btn.addEventListener("click", removeInput);

  // Create div to contain retricted site inputs.
  const restriction = document.createElement("div");
  restriction.className = "restriction";

  // Put it all together.
  input.appendChild(restriction);
  restriction.appendChild(site);

  // If siteBocked is a string, replace the defaut placeholder value.
  // Otherwise, give the newly created input focus.
  typeof siteBlocked === 'string' ? site.value = siteBlocked : site.focus();
  restriction.appendChild(btn);

  // Scroll to bottom if the input is focused.
  if (typeof siteBlocked !== 'string') window.scrollTo({top: document.documentElement.scrollHeight, behavior: 'smooth'});
  
  // Create hidden error message.
  const errorMessage = document.createElement("article");
  errorMessage.className = "message is-danger hide";
  const messageBody = document.createElement("div");
  messageBody.className = "message-body";
  messageBody.innerHTML = "<strong>Selection not saved!</strong> Please <em>delete</em> empty inputs before saving.";
  errorMessage.appendChild(messageBody);
  // Add hidden error message.
  restriction.appendChild(errorMessage);
}

// Save array of text to be shared with Backend.
export function saveSelection(){
  const createdInputs = input.children;
  const dataArr = Array.from(createdInputs);

  // Toggle Save button with loading status.
  updateIcon(save, "is-loading", false);
  removeClass(save, "is-loading", true);
  
  const allRestrictions = document.querySelectorAll(".restriction");
  const values = allRestrictions.forEach(function(word) {word.firstChild.value});
  console.log("allRestrictions values on Save: ", values);

  // Display Error Message on empty inputs.
  const sites = document.querySelectorAll(".site");
  const allInputs = sites.forEach(function callback(word, index) {
    console.log(`${index}: ${word.value}`);
    if(word.value === "") {
      console.log(`${index} has no value!`,  allRestrictions[index]);
      let trashIcon = allRestrictions[index].children[1];
      updateIcon(trashIcon, "fa-beat-fade", false);
      removeClass(trashIcon, "fa-beat-fade", true);
      let errorMessage = allRestrictions[index].children[2];
      // Display error message.
      removeClass(errorMessage, "hide", false);
    }
  });

  // Empty array for updated strings
  sitesToBlock.length = 0;

  // Check all input values and filter out the empty ones.
  dataArr.forEach(function(item) {
    if(input.children.value !== "") sitesToBlock.push(item.children[0].value);
  });

  chrome.storage.local.set({ site: sitesToBlock }).then(() => {
    localStorage.setItem("textMatchedInSites", sitesToBlock, sitesToBlock.length);
  });
  chrome.runtime.sendMessage({type: "inputValue", value: sitesToBlock});

  refreshTab();
}

// Events on Site Conceal.
addBtn.addEventListener("click", addInput);
input.addEventListener("input", updateInput);
save.addEventListener("click", saveSelection);

export default {updateInput, removeInput, addInput, saveSelection};