// state
let isAutoConnecting = false
let intervalId

const autoConnectBtn = document.getElementById('auto-connect')
autoConnectBtn.onclick = async function () {
  isAutoConnecting = ! isAutoConnecting
  if (isAutoConnecting) {
    autoConnectBtn.textContent = 'Stop Auto-Connecting'
  } else {
    autoConnectBtn.textContent = 'Start Auto-Connecting'
  }
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

  if (! intervalId) {
    intervalId = window.setInterval(function () {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: autoConnect,
        args: [isAutoConnecting]
      })
    }, 5000)
  }
  if (intervalId && ! isAutoConnecting) {
    window.clearInterval(intervalId)
  }
}

function autoConnect(isAutoConnecting) {
  // not the best way to query the results on the page
  // but hopefully it's not too costly
  const peoples = document.getElementsByClassName('entity-result__item')
  for (const people of peoples) {
    // TODO: refactor below conditional into a function
    if (people.querySelector('.entity-result__actions button.artdeco-button .artdeco-button__text').textContent.trim() == 'Connect') {
      console.log('Clicking', people.querySelector('.entity-result__actions button.artdeco-button'))
      people.querySelector('.entity-result__actions button.artdeco-button').click()

      // TODO: handle modal
      /*
      console.log('Closing modal...')
      document.querySelector('#artdeco-modal-outlet .artdeco-modal-overlay').click()
      */

      // return so that on the next run, the first of Connectable entities
      // are sent a Connection request
      return
    }
  }
}

