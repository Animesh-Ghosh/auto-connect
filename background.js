// Wrap in an onInstalled callback in order to avoid unnecessary work
// every time the background script is run
chrome.runtime.onInstalled.addListener(() => {
  // Page actions are disabled by default and enabled on select tabs
  chrome.action.disable()

  // Clear all rules to ensure only our expected rules are set
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    // Declare a rule to enable the action on
    let linkedInRule = {
      conditions: [
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {
            hostEquals: 'www.linkedin.com',
            schemes: ['https'],
            // only show the action on People search
            pathContains: 'search/results/people',
          },
        })
      ],
      actions: [new chrome.declarativeContent.ShowAction()],
    }

    // Finally, apply our new array of rules
    let rules = [linkedInRule]
    chrome.declarativeContent.onPageChanged.addRules(rules)
    console.log('Rules applied!')
  })
})