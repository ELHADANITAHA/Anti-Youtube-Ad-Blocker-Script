// Click on the "Raw" Button after Installing Tampermonkey Extension 
// ==UserScript== 
// @name         Youtube Anti Ad-Blocker By Taha
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Youtube Anti Ad-Blocker By Taha
// @author       ELHADANI Taha
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @updateURL    https://github.com/ELHADANITAHA/Anti-Youtube-Ad-Blocker-Script/blob/main/Youtube%20Anti%20Ad%20Blocker.user.js
// @downloadURL  https://github.com/ELHADANITAHA/Anti-Youtube-Ad-Blocker-Script/blob/main/Youtube%20Anti%20Ad%20Blocker.user.js
// @grant        none
// ==/UserScript==

(function () {
    // Config
    const adblocker = true;
    const removePopup = true;
    const debug = true;

    // CODE

    const domainsToRemove = ['*.youtube-nocookie.com/*'];
    const jsonPathsToRemove = [
        'playerResponse.adPlacements',
        'playerResponse.playerAds',
        'adPlacements',
        'playerAds',
        'playerConfig',
        'auxiliaryUi.messageRenderers.enforcementMessageViewModel'
    ];

    const observerConfig = {
        childList: true,
        subtree: true
    };

    const mouseEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
    });

    let unpausedAfterSkip = 0;
    let pageRefreshed = false;

    if (debug) console.log("Youtube Anti Ad-Blocker: Script started");

    setTimeout(() => {
        window.__ytplayer_adblockDetected = false;

        if (adblocker) addblocker();
        if (removePopup) popupRemover();
        if (removePopup) observer.observe(document.body, observerConfig);
    }, 4000); 

    function popupRemover() {
        removeJsonPaths(domainsToRemove, jsonPathsToRemove);
        setInterval(() => {
            const fullScreenButton = document.querySelector(".ytp-fullscreen-button");
            const modalOverlay = document.querySelector("tp-yt-iron-overlay-backdrop.style-scope");
            const popup = document.querySelector(".style-scope ytd-enforcement-message-view-model");
            const popupButton = document.getElementById("dismiss-button");

            const video1 = document.querySelector("#movie_player > video.html5-main-video");
            const video2 = document.querySelector("#movie_player > .html5-video-container > video");

            const bodyStyle = document.body.style;

            bodyStyle.setProperty('overflow-y', 'auto', 'important');

            if (modalOverlay) {
                modalOverlay.removeAttribute("opened");
                modalOverlay.remove();
            }

            if (popup) {
                if (debug) console.log("Youtube Anti Ad-Blocker: Popup detected, removing...");

                if (popupButton) popupButton.click();
                popup.remove();
                unpausedAfterSkip = 2;

                if (fullScreenButton) {
                    fullScreenButton.dispatchEvent(mouseEvent);
                    setTimeout(() => {
                        fullScreenButton.dispatchEvent(mouseEvent);
                    }, 500);
                }

                if (debug) console.log("Youtube Anti Ad-Blocker: Popup removed");
            }

            if (!unpausedAfterSkip > 0) return;

            unPauseVideo(video1);
            unPauseVideo(video2);


            if (!pageRefreshed) {
                location.reload();
                pageRefreshed = true; 
            }

        }, 1000);
    }

    function addblocker() {
        setInterval(() => {
            const skipBtn = document.querySelector('.videoAdUiSkipButton,.ytp-ad-skip-button');
            const ad = document.querySelector('.ad-showing');
            const video = document.querySelector('video');

            if (!skipBtn || !ad || !video) {
                return;
            }

            video.playbackRate = 10;
            video.volume = 0;
            video.currentTime = video.duration;
            skipBtn?.click();
        }, 50);
    }

    function unPauseVideo(video) {
        if (!video) return;
        if (video.paused) {
            document.dispatchEvent(new KeyboardEvent("keydown", {
                key: "k",
                code: "KeyK",
                keyCode: 75,
                which: 75,
                bubbles: true,
                cancelable: true,
                view: window
            }));
            unpausedAfterSkip = 0;
            if (debug) console.log("Youtube Anti Ad-Blocker: Unpaused video using 'k' key");
        } else if (unpausedAfterSkip > 0) unpausedAfterSkip--;
    }

    function removeJsonPaths(domains, jsonPaths) {
        const currentDomain = window.location.hostname;
        if (!domains.includes(currentDomain)) return;

        jsonPaths.forEach(jsonPath => {
            const pathParts = jsonPath.split('.');
            let obj = window;
            let previousObj = null;
            let partToSetUndefined = null;

            for (const part of pathParts) {
                if (obj.hasOwnProperty(part)) {
                    previousObj = obj;
                    partToSetUndefined = part;
                    obj = obj[part];
                } else {
                    break;
                }
            }

            if (previousObj && partToSetUndefined !== null) {
                previousObj[partToSetUndefined] = undefined;
            }
        });
    }

    const observer = new MutationObserver(() => {
        removeJsonPaths(domainsToRemove, jsonPathsToRemove);
    });
})();
