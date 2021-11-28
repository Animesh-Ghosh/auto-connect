// state
let isAutoConnecting = false
let intervalId

const connectionRequestsCountSpan = document.getElementById('connection-count')
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
      const connectionRequestsCount = Number(connectionRequestsCountSpan.textContent)
      connectionRequestsCountSpan.textContent = connectionRequestsCount + 1
    }, 5000)
  }
  if (intervalId && ! isAutoConnecting) {
    window.clearInterval(intervalId)
  }
}

async function autoConnect(isAutoConnecting) {
  // since we cannot pass args to the injected files,
  // we make do with closures to simplify the injected code
  const isConnectable = people => {
    return people
      .querySelector('.entity-result__actions button.artdeco-button .artdeco-button__text')
      .textContent
      .trim() == 'Connect'
  }
  const awaitModal = async function (ms) {
    return new Promise((resolve) => {
      window.setTimeout(function () {
        resolve(document.querySelector('#artdeco-modal-outlet .artdeco-modal-overlay'))
      }, ms)
    })
  }

  // not the best way to query the results on the page
  // but hopefully it's not too costly
  const peoples = document.getElementsByClassName('entity-result__item')
  for (const people of peoples) {
    if (isConnectable(people)) {
      // console.log('Clicking', people.querySelector('.entity-result__actions button.artdeco-button'))
      people.querySelector('.entity-result__actions button.artdeco-button').click()

      // console.log('Closing modal...')
      /**
       * we wait for some time for the modal to render on the DOM
       * and then click on the Send now button
       * removing the modal from the DOM was something that I could not figure out
       */
      const modal = await awaitModal(500)
      modal.querySelector('button[aria-label="Send now"].artdeco-button').click()

      // return so that on the next run, the first of Connectable entities
      // are sent a Connection request
      return
    }
  }
}

