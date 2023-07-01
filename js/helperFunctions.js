// Refresh currently viewed tab.
export function refreshTab(){
  // Refresh the tab.
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    chrome.tabs.reload(activeTab.id);
  });
}

// Remove class.
export function removeClass(element, style, timeout){
  timeout === true ? setTimeout(() => element.classList.remove(style), 2000) : element.classList.remove(style);
}

// Update icon with animation class.
export function updateIcon(element, style, timeout){
  timeout === true ? setTimeout(() => element.classList.add(style), 2000) : element.classList.add(style);
}

export function observeSectionHeight(element){
  // Create a MutationObserver instance
  var observer = new MutationObserver(function (mutationsList) {
    // Iterate over the mutations
    for (var mutation of mutationsList) {
      // Check if the mutation is a change in the attributes or child elements
      if (
        mutation.type === "attributes" ||
        mutation.type === "childList" ||
        mutation.type === "subtree"
      ) {
        // Check the height of the container div
        if (element.clientHeight > 440) {
          // Create the anchor tag if it doesn't already exist
          if (!document.getElementById("anchorTag")) {
            var anchorTag = document.createElement("a");
            anchorTag.id = "anchorTag";
            anchorTag.href = "#";
            anchorTag.style.display = "block";
            anchorTag.style.paddingTop = "10px";
            anchorTag.style.textDecoration = "underline";
            anchorTag.innerText = "Back to top";

            anchorTag.addEventListener("click", () => {
              document.body.scrollTop = 0; // For Safari
              document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
            });

            // Append the anchor tag to the container div
            element.appendChild(anchorTag);
          }
        } else {
          // Remove the anchor tag if it exists
          var anchorTag = document.getElementById("anchorTag");
          if (anchorTag) {
            anchorTag.parentNode.removeChild(anchorTag);
          }
        }
      }
    }
  });

  // Configure the MutationObserver to observe attribute changes and child list changes
  var observerConfig = { attributes: true, childList: true, subtree: true };

  // Start observing the container div
  observer.observe(element, observerConfig);
}

export function debounce(func, timeout = 1000){
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
};

export default {refreshTab, updateIcon, removeClass, observeSectionHeight, debounce};