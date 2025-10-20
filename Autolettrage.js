(function () {
    'use strict';

    // Constants
    const CODES = {
        FIRST: '442100,342100,511500,511100',
        SECOND: '442100,342100,511500,511100'
    };

    const KEY_INFO = {
        Enter: { key: 'Enter', code: 'Enter', keyCode: 13 },
        ArrowRight: { key: 'ArrowRight', code: 'ArrowRight', keyCode: 39 },
        Tab: { key: 'Tab', code: 'Tab', keyCode: 9 },
        '0': { key: '0', code: 'Digit0', keyCode: 48 },
        Space: { key: ' ', code: 'Space', keyCode: 32 }
    };

    const CONFIG = {
        SLEEP_DEFAULT_MS: 20,
        SLEEP_LONG_MS: 100,
        SLEEP_VERY_LONG_MS: 500,
        MAX_RETRIES: 10
    };

    // Utility Functions
    function sleep(ms) {
        if (typeof ms !== 'number' || ms < 0 || isNaN(ms)) {
            console.warn(`sleep: Invalid ms value (${ms}), using default ${CONFIG.SLEEP_DEFAULT_MS}ms`);
            ms = CONFIG.SLEEP_DEFAULT_MS;
        }
        console.debug(`Sleeping for ${ms}ms`);
        return new Promise(resolve => setTimeout(() => {
            console.debug(`Sleep complete: ${ms}ms`);
            resolve();
        }, ms));
    }

    function dispatchKey(el, type, key, code, keyCode, options = {}) {
        try {
            el.dispatchEvent(new KeyboardEvent(type, {
                key,
                code,
                keyCode,
                which: keyCode,
                bubbles: true,
                cancelable: true,
                ...options
            }));
        } catch (error) {
            console.error(`Failed to dispatch ${type} event for key ${key}:`, error);
        }
    }

    async function simulateKeyPress(keyName, target = document.activeElement, delay = CONFIG.SLEEP_DEFAULT_MS, modifiers = {}) {
        if (!target) {
            console.error('No target element for keypress');
            return;
        }
        if (!(keyName in KEY_INFO)) {
            console.error(`Invalid key: ${keyName}. Supported keys: ${Object.keys(KEY_INFO).join(', ')}`);
            return;
        }
        const info = KEY_INFO[keyName];
        console.debug(`Simulating ${keyName} on`, target);
        dispatchKey(target, 'keydown', info.key, info.code, info.keyCode, modifiers);
        await sleep(delay);
        dispatchKey(target, 'keypress', info.key, info.code, info.keyCode, modifiers);
        await sleep(delay);
        dispatchKey(target, 'keyup', info.key, info.code, info.keyCode, modifiers);
        await sleep(delay);
    }

    async function pasteText(text, target = document.activeElement) {
        if (!target) {
            console.error('No target element for paste');
            return;
        }
        if (['INPUT', 'TEXTAREA'].includes(target.tagName)) {
            try {
                target.value = text;
                target.dispatchEvent(new Event('input', { bubbles: true }));
                target.dispatchEvent(new Event('change', { bubbles: true }));
                console.debug(`Pasted text: ${text}`);
                await sleep(CONFIG.SLEEP_DEFAULT_MS);
            } catch (error) {
                console.error(`Failed to paste text: ${text}`, error);
            }
        } else {
            console.warn(`Cannot paste to non-input element: ${target.tagName}`);
        }
    }

    async function pressKey(key, times = 1) {
        for (let i = 0; i < times; i++) {
            await simulateKeyPress(key);
            await sleep(CONFIG.SLEEP_LONG_MS);
        }
    }

    async function pressEnter(times = 1) {
        await pressKey('Enter', times);
    }

    async function pressTab(times = 1) {
        await pressKey('Tab', times);
    }

    async function pressArrowRight(times = 1) {
        await pressKey('ArrowRight', times);
    }

    async function pressSpace(times = 1) {
        await pressKey('Space', times);
    }

    async function pressCtrl0() {
        const target = document.activeElement;
        console.debug('Pressing Ctrl+0');
        await simulateKeyPress('0', target, CONFIG.SLEEP_DEFAULT_MS, { ctrlKey: true });
        await sleep(CONFIG.SLEEP_VERY_LONG_MS);
    }

    async function findAndClickCollectionDeComptes() {
        let clicked = false;
        let retries = 0;
        
        while (!clicked && retries < CONFIG.MAX_RETRIES) {
            console.log(`Attempt ${retries + 1} to find 'Collection de comptes' element`);
            
            // Try multiple selectors to find the elements
            const links = document.querySelectorAll('a, button, .swt-check-button, [class*="button"], [role="button"]');
            console.log(`Found ${links.length} potential elements`);
            
            for (const link of Array.from(links)) {
                const textElement = link.querySelector('.swt-check-button-text');
                if (textElement && textElement.textContent.trim() === 'Collection de comptes :') {
                    try {
                        link.click();
                        console.log('✅ Clicked: Collection de comptes');
                        clicked = true;
                        await sleep(CONFIG.SLEEP_VERY_LONG_MS);
                        break;
                    } catch (error) {
                        console.error('Failed to click element:', error);
                    }
                }
            }
            
            if (!clicked) {
                // Alternative: try to find by text content directly
                const elements = document.querySelectorAll('*');
                for (const element of Array.from(elements)) {
                    if (element.textContent && element.textContent.trim() === 'Collection de comptes :') {
                        try {
                            element.click();
                            console.log('✅ Clicked: Collection de comptes (via text content)');
                            clicked = true;
                            await sleep(CONFIG.SLEEP_VERY_LONG_MS);
                            break;
                        } catch (error) {
                            console.error('Failed to click element (text content):', error);
                        }
                    }
                }
            }
            
            if (!clicked) {
                retries++;
                await sleep(CONFIG.SLEEP_VERY_LONG_MS * 2);
            }
        }
        
        if (!clicked) {
            console.error('❌ Failed to find and click "Collection de comptes" element after maximum retries');
            return false;
        }
        
        return true;
    }

    async function pressBackspace() {
        const active = document.activeElement;
        if (['INPUT', 'TEXTAREA'].includes(active.tagName)) {
            try {
                active.value = '';
                active.dispatchEvent(new Event('input', { bubbles: true }));
                active.dispatchEvent(new Event('change', { bubbles: true }));
                console.debug('Cleared input via backspace');
                await sleep(CONFIG.SLEEP_DEFAULT_MS * 2);
            } catch (error) {
                console.error('Failed to clear input:', error);
            }
        } else {
            console.warn('Cannot backspace on non-input element');
        }
    }

    // UI Functions
    function showLoadingOverlay() {
        if (document.getElementById('blurOverlay')) return;

        const blurOverlay = document.createElement('div');
        blurOverlay.id = 'blurOverlay';
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

        const progressContainer = document.createElement('div');
        progressContainer.id = 'progressContainer';
        Object.assign(progressContainer.style, {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: '10001',
            textAlign: 'center'
        });

        progressContainer.innerHTML = `
            <div class="loader" style="
                position: relative;
                width: 300px;
                height: 9px;
                background: #fff;
                border-radius: 6px;
                overflow: hidden;
                margin: 20px auto;">
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

        document.body.append(blurOverlay, progressContainer);
        console.debug('Loading overlay displayed');
    }

    function removeLoadingOverlay() {
        const blurOverlay = document.getElementById('blurOverlay');
        const progressContainer = document.getElementById('progressContainer');
        if (blurOverlay) blurOverlay.remove();
        if (progressContainer) progressContainer.remove();
        console.debug('Loading overlay removed');
    }

    // Main Logic
    async function runKeySequence() {
        try {
            showLoadingOverlay();
            let target = document.activeElement;

            if (!target || target === document.body) {
                target = document.querySelector('input, textarea, [contenteditable="true"], [tabindex]');
                if (!target) {
                    console.error('No focusable element found');
                    removeLoadingOverlay();
                    return;
                }
                target.focus();
                console.debug('Focused on new target:', target);
            }

            // Step 1: Press CTRL+0
            console.log('Step 1: Pressing CTRL+0');
            await pressCtrl0();
            
            // Step 2: Find and click "Collection de comptes :"
            console.log('Step 2: Finding and clicking "Collection de comptes :"');
            const clicked = await findAndClickCollectionDeComptes();
            
            if (!clicked) {
                console.error('Failed to click Collection de comptes, stopping sequence');
                removeLoadingOverlay();
                return;
            }
            
            // Step 3: Press Tab 6 times
            console.log('Step 3: Pressing Tab 6 times');
            await pressTab(6);
            
            // Step 4: Press ArrowRight
            console.log('Step 4: Pressing ArrowRight');
            await pressArrowRight();
            
            // Step 5: Paste the codes
            console.log('Step 5: Pasting codes: 442100,342100,511500,511100');
            await pasteText(CODES.FIRST);
            
            // Step 6: Press Enter
            console.log('Step 6: Pressing Enter');
            await pressEnter();
          
            await pressTab(9);
            await pressEnter();
            await pressEnter(3);
            await pressTab(2);
            await pressEnter();
            await sleep(2000);
            await pressTab(4);
            await pressEnter();          
          
          
          
            console.log('✅ Complete sequence finished successfully');
        } catch (error) {
            console.error('❌ Key sequence failed:', error);
        } finally {
            removeLoadingOverlay();
        }
    }

    function closeEditionTabs(callback) {
        console.warn('closeEditionTabs: TODO - Implement logic to close edition tabs');
        // Placeholder: Add actual logic to close tabs
        if (callback) callback();
    }

    function isActiveTabSaisie() {
        console.warn('isActiveTabSaisie: TODO - Implement logic to check if Saisie tab is active');
        // Placeholder: Add actual logic to check tab
        return true;
    }

    function addEditionButton() {
        if (document.querySelector('#letterButton')) {
            console.debug('Button already exists, skipping');
            return;
        }

        const toolbarUl = document.querySelector('div.sp-fstd-black.s_pa.sp-toolbar-ext ul.sp-toolbar');
        if (!toolbarUl) {
            console.warn('Toolbar not found, cannot add button');
            return;
        }

        const li = document.createElement('li');
        li.className = 's_pr s_di s_fe';

        const btn = document.createElement('button');
        btn.id = 'letterButton';
        btn.textContent = 'AutoLettrage';
        Object.assign(btn.style, {
            padding: '0 15px',
            margin: '0 15px 0 0',
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
            console.log('🔄 AutoLettrage button clicked');
            closeEditionTabs(() => {
                if (isActiveTabSaisie()) {
                    runKeySequence();
                } else {
                    console.warn('Saisie tab not active, skipping key sequence');
                }
            });
        });

        console.log('AutoLettrage button added successfully');
    }

    async function ensureButtonIsPresent() {
        let retries = 0;

        await sleep(CONFIG.SLEEP_VERY_LONG_MS);
        addEditionButton();

        const observer = new MutationObserver(async (mutations) => {
            if (retries >= CONFIG.MAX_RETRIES) {
                observer.disconnect();
                console.warn('Max retries reached for button addition');
                return;
            }

            const toolbarUl = document.querySelector('div.sp-fstd-black.s_pa.sp-toolbar-ext ul.sp-toolbar');
            if (toolbarUl && !document.querySelector('#letterButton')) {
                console.debug('Toolbar detected, adding button');
                await sleep(CONFIG.SLEEP_LONG_MS);
                addEditionButton();
                retries++;
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        const intervalId = setInterval(async () => {
            if (retries >= CONFIG.MAX_RETRIES || document.querySelector('#letterButton')) {
                clearInterval(intervalId);
                observer.disconnect();
                console.debug('Stopped button presence check');
                return;
            }

            await sleep(CONFIG.SLEEP_LONG_MS);
            addEditionButton();
            retries++;
        }, 2000);
    }

    // Initialize
    function init() {
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            ensureButtonIsPresent().catch(error => console.error('Initialization failed:', error));
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                ensureButtonIsPresent().catch(error => console.error('Initialization failed:', error));
            });
        }
    }

    init();
})();
