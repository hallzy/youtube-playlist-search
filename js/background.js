// Runs when this extension is installed or updated, or if Chrome is updated.
chrome.runtime.onInstalled.addListener(function() {
    // Remove all rules
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        // Add new rules
        chrome.declarativeContent.onPageChanged.addRules(
            // Array of rules to add
            [
                {
                    // Conditions for this rule that triggers the actions
                    // We only have one condition which is that the URL must be
                    // a playlist URL
                    conditions: [
                        new chrome.declarativeContent.PageStateMatcher({
                            pageUrl: { urlMatches: 'youtube.com.*list=' },
                        })
                    ],
                    // If the above condition is met, we do this.
                    // This tells activates the extension to be actually used
                    actions: [ new chrome.declarativeContent.ShowAction() ]
                }
            ]
        );
    });
});
