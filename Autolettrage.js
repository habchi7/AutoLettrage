(function() {
    'use strict';

    const FIRST_CODE = '442100,342100,511500,511100';
    const SECOND_CODE = '442100,342100,511500,511100';

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function dispatchKey(el, type, key, code, keyCode, options = {}) {
        const ev = new KeyboardEvent(type, {
            key,
            code,
            keyCode,
            which: keyCode,
            bubbles: true,
            cancelable: true,
            ...options
        });
        el.dispatchEvent(ev);
    }

    async function simulateKeyPress(keyName, target = document.activeElement, delay = 20, modifiers = {}) {
        const keyInfo = {
            'Enter': { key: 'Enter', code: 'Enter', keyCode: 13 },
            'ArrowRight': { key: 'ArrowRight', code: 'ArrowRight', keyCode: 39 },
            'Tab': { key: 'Tab', code: 'Tab', keyCode: 9 },
            '0': { key: '0', code: 'Digit0', keyCode: 48 },
            'Space': { key: ' ', code: 'Space', keyCode: 32 },
        }[keyName] || { key: keyName, code: keyName, keyCode: 0 };

        dispatchKey(target, 'keydown', keyInfo.key, keyInfo.code, keyInfo.keyCode, modifiers);
        await sleep(delay);
        dispatchKey(target, 'keypress', keyInfo.key, keyInfo.code, keyInfo.keyCode, modifiers);
        await sleep(delay);
        dispatchKey(target, 'keyup', keyInfo.key, keyInfo.code, keyInfo.keyCode, modifiers);
        await sleep(delay);
    }

    async function pasteText(text, target = document.activeElement) {
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
            target.value = text;
            target.dispatchEvent(new Event('input', { bubbles: true }));
            target.dispatchEvent(new Event('change', { bubbles: true }));
            await sleep(30);
        }
    }

    async function pressEnter(times = 1) {
        for (let i = 0; i < times; i++) {
            await simulateKeyPress('Enter');
            await sleep(100);
        }
    }

    async function pressTab(times = 1) {
        for (let i = 0; i < times; i++) {
            await simulateKeyPress('Tab');
            await sleep(100);
        }
    }

    async function pressSpace(times = 1) {
        for (let i = 0; i < times; i++) {
            await simulateKeyPress('Space');
            await sleep(100);
        }
    }

    async function pressBackspace() {
        const active = document.activeElement;
        if (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA') {
            active.value = '';
            active.dispatchEvent(new Event('input', { bubbles: true }));
            active.dispatchEvent(new Event('change', { bubbles: true }));
            await sleep(50);
        }
    }

    function showLoadingOverlay() {
        const blurOverlay = document.createElement("div");
        blurOverlay.id = "blurOverlay";
        Object.assign(blurOverlay.style, {
            position: "fixed",
            top: "0",
            left: "0",
            width: "100vw",
            height: "100vh",
            background: "rgba(0, 0, 0, 0.3)",
            backdropFilter: "blur(5px)",
            WebkitBackdropFilter: "blur(5px)",
            zIndex: "10000",
        });

        const progressContainer = document.createElement("div");
        progressContainer.id = "progressContainer";
        Object.assign(progressContainer.style, {
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: "10001",
            textAlign: "center"
        });

        progressContainer.innerHTML = `
            <div class="loader" style="
                position: relative;
                width: 300px;
                height: 9px;
                background: #fff;
                overflow: hidden;
                border-radius: 6px;">
                <style>
                    .loader::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: -50%;
                        width: 50%;
                        height: 100%;
                        background: #0a754c;
                        animation: moveRight 0.8s linear infinite;
                    }
                    @keyframes moveRight {
                        0% { left: -50%; }
                        100% { left: 100%; }
                    }
                </style>
            </div>
        `;

        document.body.appendChild(blurOverlay);
        document.body.appendChild(progressContainer);
    }

    function removeLoadingOverlay() {
        const blurOverlay = document.getElementById("blurOverlay");
        const progressContainer = document.getElementById("progressContainer");
        if (blurOverlay) blurOverlay.remove();
        if (progressContainer) progressContainer.remove();
    }

    async function runKeySequence() {
        showLoadingOverlay();

        let target = document.activeElement;
        if (!target || target === document.body) {
            const first = document.querySelector('input, textarea, [contenteditable="true"], [tabindex]');
            if (first) {
                first.focus();
                target = first;
            }
        }

        await simulateKeyPress('0', target, 20, { ctrlKey: true });
        await sleep(100);
        await pressTab(6);
        await simulateKeyPress('ArrowRight');
        await sleep(100);

        const links = document.querySelectorAll('a.swt-check.s_dib.s_f.s_pa.swt-check-button-left');
        for (let link of links) {
            const textElement = link.querySelector('.swt-check-button-text');
            if (textElement && textElement.textContent.trim() === 'Collection de comptes :') {
                link.click();
                console.log('Successfully clicked: Collection de comptes');
            }
        }

        const targetElement = document.querySelector('div.edit-delta-pad.s_edit.swtEditBorderTheme[title*="objet(s) Compte général"]');
        if (targetElement) {
            targetElement.click();
            console.log('Clicked the element successfully');
        } else {
            console.log('Element not found');
        }

        await pressEnter(2);
        await pasteText(FIRST_CODE);
        await pressEnter(2);
        await pressTab(1);
        await pressEnter(2);
        await pressBackspace();
        await pasteText(SECOND_CODE);
        await pressEnter(2);
        await pressTab(9);
        await pressEnter(4);
        await pressTab(2);
        await pressEnter(1);
        await sleep(2500);
        await pressTab(4);
        await pressEnter(1);

        removeLoadingOverlay();
    }

    function closeEditionTabs(callback) {
        console.log("Closing edition tabs...");
        // TODO: Implement logic to find and close edition tabs
        if (callback) callback();
    }

    function isActiveTabSaisie() {
        console.log("Checking if active tab is Saisie...");
        // TODO: Implement logic to check if the active tab is 'Saisie'
        return true;
    }

    function addEditionButton() {
        // Check if button already exists to avoid duplicates
        if (document.querySelector('button#letterButton')) {
            return;
        }

        const toolbarUl = document.querySelector('div.sp-fstd-black.s_pa.sp-toolbar-ext ul.sp-toolbar');
        if (!toolbarUl) {
            console.log('Toolbar not found, will retry...');
            return;
        }

        const li = document.createElement('li');
        li.className = 's_pr s_di s_fe';
        const btn = document.createElement('button');
        btn.id = 'letterButton'; // Add ID to prevent duplicates
        btn.innerText = 'AutoLettrage';
        Object.assign(btn.style, {
            padding: '0px 15px',
            margin: '0px 15px 0px 0px',
            background: 'transparent',
            color: '#e0e1dd',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '400',
            cursor: 'pointer',
            textAlign: 'center',
            marginTop: '5px',
            fontSize: '15px',
            fontFamily: 'sageUI, sans-serif'
        });
        li.appendChild(btn);
        toolbarUl.appendChild(li);
        btn.addEventListener('click', () => {
            console.log("🔄 Bouton cliqué - fermeture des tabs...");
            closeEditionTabs(() => {
                if (isActiveTabSaisie()) {
                    runKeySequence();
                }
            });
        });
        console.log('Letter button added successfully');
    }

    // Function to continuously monitor for toolbar and add button with 200ms delay
    async function ensureButtonIsPresent() {
        // Initial attempt to add button after 200ms delay
        await sleep(500);
        addEditionButton();

        // Set up MutationObserver to watch for DOM changes
        const observer = new MutationObserver(async (mutations, obs) => {
            const toolbarUl = document.querySelector('div.sp-fstd-black.s_pa.sp-toolbar-ext ul.sp-toolbar');
            if (toolbarUl && !document.querySelector('button#letterButton')) {
                console.log('Toolbar detected, adding button after 200ms...');
                await sleep(200);
                addEditionButton();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Fallback: Periodic check every 2 seconds
        setInterval(async () => {
            if (!document.querySelector('button#letterButton')) {
                await sleep(200);
                addEditionButton();
            }
        }, 2000);
    }

    // Run when DOM is ready
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        ensureButtonIsPresent();
    } else {
        document.addEventListener('DOMContentLoaded', ensureButtonIsPresent);
    }
})();
