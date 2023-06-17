/* Copyright © 2023-present TheeCalculator (TheeCal), All rights reserved.
    @preserve */

"use-strict"

const
    /** TheeCalculator initiation */
    start = () => {

        let
            /** Equation done */
            equalDone = false,
            /** History record array */
            history = [],
            /** History display entries */
            resultsItems;

        const
            /** Select element */
            s = c => document.querySelector(c),
            /** Select element array */
            sA = c => document.querySelectorAll(c),
            /** Flex display */
            flex = e => e.style.display = `flex`,
            /** Block display */
            block = e => e.style.display = `block`,
            /** Hide elements */
            hide = e => e.style.display = `none`,
            /** Check elements class list */
            classCheck = (/** Element */ e, /** Class */ c) => e.classList.contains(c) ? false : true,
            /** Disable button */
            disableBu = e => e.parentElement.classList.add(`shadow_inside`),
            /** Disable buttons array */
            disableAll = a => a.forEach(e => disableBu(e)),
            /** Enable button */
            enableBu = e => e.parentElement.classList.remove(`shadow_inside`),
            /** Enable buttons array */
            enableAll = a => a.forEach(e => enableBu(e)),
            /** Check button enable status */
            enabledCheck = e => classCheck(e.parentElement, `shadow_inside`),
            /** Expression buttons */
            expressions = [`÷`, `×`, `-`, `+`],
            /** History list */
            hContent = s(`.history_content`),
            /** App info */
            appInfo = s(`.app_info`),
            /** Calculator input section */
            calcSec = s(`.calc_section`),
            /** Main input display */
            calcEqu = s(`.calc_equation`),
            /** Results display */
            calcResult = s(`.calc_result`),
            /** Button elements */
            bu = {
                /** App info button */
                info: s(`.info_wrap`),
                /** Clear history button */
                corner: s(`.history_clear`),
                /** Toggle history save status */
                save: s(`.save_wrap`),
                /** Copy button */
                copy: s(`.copy_wrap`),
                /** Backspace button */
                back: s(`#bu_back`),
                /** Clear all button */
                clear: s(`#bu_clear`),
                /** Brackets button */
                brackets: s(`#bu_brackets`),
                /** Dot button */
                dot: s(`#bu_dot`),
                /** Numpad buttons */
                numpad: sA(`.num_bu`),
                /** Numpad icons */
                icons: sA(`.img_icon`),
                /** Numbers buttons object */
                numbers: {
                    /** Number button 9 */
                    bu9: s(`#bu_9`),
                    /** Number button 8 */
                    bu8: s(`#bu_8`),
                    /** Number button 7 */
                    bu7: s(`#bu_7`),
                    /** Number button 6 */
                    bu6: s(`#bu_6`),
                    /** Number button 5 */
                    bu5: s(`#bu_5`),
                    /** Number button 4 */
                    bu4: s(`#bu_4`),
                    /** Number button 3 */
                    bu3: s(`#bu_3`),
                    /** Number button 2 */
                    bu2: s(`#bu_2`),
                    /** Number button 1 */
                    bu1: s(`#bu_1`),
                    /** Number button 0 */
                    bu0: s(`#bu_0`),
                    /** Percentage Button */
                    buPer: s(`#bu_percentage`),
                },
                /** Expression buttons */
                exp: {
                    /** Divide button */
                    buDivide: s(`#bu_divide`),
                    /** Multiply button */
                    buMultiply: s(`#bu_multiply`),
                    /** Minus button */
                    buMinus: s(`#bu_minus`),
                    /** Plus button */
                    buPlus: s(`#bu_plus`),
                },
                /** Equal button */
                equal: s(`#bu_equal`)
            },
            /** Save mode toggle */
            saveToggle = () => {
                const h = localStorage.history;
                bu.save.children[1].title = `History save: ` + (h ? `on` : `off`);
                bu.save.children[0].src = `./img/` + (h ? `save_on` : `save_off`) + `.svg`;
            },
            /** Content shadows update */
            hShadow = () => {
                const
                    h = hContent.scrollTop,
                    l = hContent.classList;
                !h || h > (hContent.scrollHeight - hContent.clientHeight) ?
                    l.remove(`shadow_top_bottom`) : l.add(`shadow_top_bottom`)
            },
            /** History general update */
            hUpdate = () => {
                const
                    l = resultsItems.length,
                    t = history.length;
                if (t > l) for (let i = l; i < t; i++)
                    hContent.appendChild(resultsItems[0].cloneNode(1));
                else if (t < l) for (let i = (t || 1); i < l; i++)
                    resultsItems[i].remove();
                resultsItems = sA(`.history_result`);
                for (let i = 0; i < history.length; i++)
                    resultsItems[i].innerText = history[i];
                history.length ? (
                    resultsItems.forEach(i => i.onclick = () => {
                        calcResult.innerText = ``;
                        calcEqu.innerText = i.innerText.split(` = `)[0];
                        updateUI();
                    }),
                    flex(bu.corner),
                    flex(bu.save)
                ) : (
                    resultsItems[0].innerText = ``,
                    hide(bu.corner),
                    hide(bu.save)
                );

                // Scroll to bottom
                hContent.scrollTo(0, hContent.scrollHeight);

                // Update scroll shadows
                hShadow();
                saveToggle();
                localStorage.history && (localStorage.history = JSON.stringify(history));
            },
            /** Clear all inputs */
            clearAll = () => {
                calcEqu.innerText = `0`;
                calcResult.innerText = ``;
                updateUI();
            },
            /** Brackets opened */
            bracketOpen = value => (value.match(/[(]/g) || []).length >
                (value.match(/[)]/g) || []).length,
            /** Clear results */
            resultsRevert = () => equalDone && (
                calcEqu.innerText = calcResult.innerText.split(` =`)[0],
                calcResult.innerText = ``,
                equalDone = false
            ),
            /** Live results calculation */
            liveResults = () => {

                /** Input value */
                const equation = calcEqu.innerText;

                // Sanitise input
                for (let i = 0; i < equation.length; i++)
                    if (!equation[i].match(/\d|\+|\-|\÷|\×|\%|\(|\)|\./g)) return

                // Evaluate input
                try {
                    /**
                     * Eval options:
                     * new Function("return " + calc)()
                     * window.eval[0](calc)
                     * [eval][0](calc)
                     */
                    const final = Number(
                        [eval][0](
                            equation
                                .replaceAll(/\×/g, `*`)
                                .replaceAll(/\÷/g, `/`)
                                .replaceAll(/\%/g, `*0.01`)
                        )
                    );
                    (final || final == 0) && (calcResult.innerText = final);
                    return { equation, final }
                } catch { return {}; };
            },
            /** Update all buttons status */
            updateUI = v => {

                // analyse value
                let value = calcEqu.innerText;
                v != undefined && (
                    value != `0` && (!equalDone || expressions.indexOf(v) > -1) ? (
                        !equalDone ? resultsRevert() : equalDone = false,
                        calcEqu.innerText += v
                    ) : (
                        equalDone = false,
                        calcResult.innerText = ``,
                        calcEqu.innerText = v
                    )
                );
                value == `` && (calcEqu.innerText = `0`);
                value = calcEqu.innerText;

                // enable/disable buttons
                const
                    length = value.length,
                    last = value[length - 1],
                    ratio = calcEqu.clientWidth / length;
                if (last == `%` || last == `)`) { // Disable numbers pad                    
                    for (const b in bu.numbers) disableBu(bu.numbers[b]);
                    disableBu(bu.dot);
                } else { // Enable numbers pad
                    for (const b in bu.numbers) enableBu(bu.numbers[b]);
                    enableBu(bu.dot);
                };
                value == `0` ? (
                    hide(bu.copy),
                    disableAll([bu.back, bu.clear, bu.equal])
                ) : (
                    calcResult.innerText == `0` ? hide(bu.copy) : flex(bu.copy),
                    enableAll([bu.back, bu.clear, bu.equal])
                );
                value == `0` || expressions.indexOf(last) > -1 || last == `.` || last == `(` ?
                    disableBu(bu.equal) : enableBu(bu.equal);

                // check numbers
                if (Number(last) || last == `%` || value == `0`) {
                    if (value == `0`) {
                        disableBu(bu.numbers.buPer);
                        for (const e in bu.exp) disableBu(bu.exp[e]);
                    } else {
                        enableBu(bu.numbers.buPer);
                        for (const e in bu.exp) enableBu(bu.exp[e]);
                    };
                    bracketOpen(value) || value == `0` ? enableBu(bu.brackets) : disableBu(bu.brackets);
                } else {
                    disableBu(bu.numbers.buPer);
                    bracketOpen(value) ? disableBu(bu.brackets) : enableBu(bu.brackets);
                };

                // Update font size
                calcEqu.style.fontSize = (
                    ratio > 60 ? 100
                        : ratio > 45 ? 80
                            : ratio > 30 ? 60
                                : 20
                ) + `px`;

                // Live results
                liveResults();
            },
            /** History setup */
            hSetup = () => {
                bu.corner.children[1].onclick = () => {
                    history = [];
                    hUpdate();
                };
                hContent.onscroll = () => hShadow();
                resultsItems = sA(`.history_result`);
                localStorage.history && (history = JSON.parse(localStorage.history));
                hUpdate();
            },
            /** Dark mode */
            darkMode = dark => {
                const bodyClasses = s(`body`).classList;
                dark ? bodyClasses.remove(`bg_dark`)
                    : bodyClasses.add(`bg_dark`);
                bu.numpad.forEach(b => {
                    const classes = b.classList;
                    dark ? classes.remove(`t_white`)
                        : classes.add(`t_white`);
                });
                bu.icons.forEach(b => {
                    const classes = b.classList;
                    dark ? classes.remove(`dark`)
                        : classes.add(`dark`);
                });
            },
            /** Setup buttons */
            buSetup = () => {
                bu.save.children[1].onclick = () => {
                    localStorage.history ? localStorage.removeItem(`history`)
                        : localStorage.history = JSON.stringify(history);
                    saveToggle();
                };
                bu.copy.children[1].onclick = () => navigator.clipboard.writeText(calcResult.innerText);
                bu.back.onclick = () => {
                    if (enabledCheck(bu.back)) {
                        resultsRevert();
                        const value = calcEqu.innerText;
                        value != `0` && (calcEqu.innerText = value.slice(0, value.length - 1));
                        updateUI();
                    };
                };
                bu.clear.onclick = () => enabledCheck(bu.clear) && clearAll();
                bu.brackets.onclick = () => {
                    if (enabledCheck(bu.brackets)) {
                        const value = calcEqu.innerText;
                        value == `0` ? calcEqu.innerText = `(`
                            : calcEqu.innerText += bracketOpen(value) ? `)` : `(`;
                        updateUI();
                    };
                };
                for (const b in bu.numbers) {
                    const button = bu.numbers[b];
                    button.onclick = () => enabledCheck(button) && updateUI(button.value);
                };
                bu.dot.onclick = () => {
                    if (enabledCheck(bu.dot)) {
                        const value = calcEqu.innerText;
                        for (let i = value.length - 1; i > -1; i--) {
                            const v = value[i];
                            if (equalDone) break
                            else if (v.match(/\./g)) return
                            else if (expressions.indexOf(v) > -1 || v == `%`) break
                        };
                        updateUI(`.`);
                    };
                };
                // Expression buttons initial setup
                for (const b in bu.exp) {
                    const button = bu.exp[b];
                    button.onclick = () => {
                        if (enabledCheck(button)) {
                            const
                                value = calcEqu.innerText,
                                lastNum = value.length - 1;
                            expressions.indexOf(value[lastNum]) > -1 && (
                                calcEqu.innerText = value.slice(0, lastNum)
                            );
                            updateUI(button.value);
                        };
                    };
                };
                // Equal button setup
                bu.equal.onclick = () => {
                    const results = liveResults();
                    enabledCheck(bu.equal)
                        && (results.final || results.final == 0)
                        && (
                            equalDone = true,
                            history.push(results.equation + ` = ` + results.final),
                            hUpdate()
                        );
                };
                // Info button setup
                bu.info.children[1].onclick = () => {
                    /** Info hidden status */
                    const infoShown = appInfo.style.display == `block`;
                    // Hide/Show calculation history
                    resultsItems.forEach(e => infoShown ? block(e) : hide(e));
                    // Show info, hide calculator
                    infoShown ? (
                        hide(appInfo),
                        flex(calcSec),
                        bu.corner.children[0].src = `./img/delete.svg`,
                        bu.corner.children[1].onclick = () => {
                            history = [];
                            hUpdate();
                        },
                        updateUI() // Update UI
                    ) : (
                        hide(calcSec),
                        hide(bu.save),
                        hide(bu.copy),
                        block(appInfo),
                        hContent.scrollTo(0, 0), // Scroll to top
                        flex(bu.corner),
                        bu.corner.children[0].src = `./img/` + (localStorage.dark ? `light` : `dark`) + `.svg`,
                        bu.corner.children[1].onclick = () => {
                            const dark = Number(localStorage.dark);
                            bu.corner.children[0].src = `./img/` + (dark ? `dark` : `light`) + `.svg`;
                            darkMode(dark);
                            localStorage.dark = !dark ? 1 : 0;
                        }
                    );
                    // Change icon
                    bu.info.children[0].src = `./img/` + (infoShown ? `info` : `back`) + `.svg`;
                    // Change icon description
                    bu.info.children[1].title = infoShown ? `Learn more` : `Back to calculator`;
                };
                // Buttons listeners
                document.addEventListener(`keydown`,
                    e => {
                        const k = e.key;
                        k == `Enter` ? (
                            bu.equal.click()
                        ) : k == `Escape` ? (
                            bu.clear.click()
                        ) : k == `Backspace` ? (
                            bu.back.click()
                        ) : k == `9` ? (
                            bu.numbers.bu9.click()
                        ) : k == `8` ? (
                            bu.numbers.bu8.click()
                        ) : k == `7` ? (
                            bu.numbers.bu7.click()
                        ) : k == `6` ? (
                            bu.numbers.bu6.click()
                        ) : k == `5` ? (
                            bu.numbers.bu5.click()
                        ) : k == `4` ? (
                            bu.numbers.bu4.click()
                        ) : k == `3` ? (
                            bu.numbers.bu3.click()
                        ) : k == `2` ? (
                            bu.numbers.bu2.click()
                        ) : k == `1` ? (
                            bu.numbers.bu1.click()
                        ) : k == `0` ? (
                            bu.numbers.bu0.click()
                        ) : k == `.` ? (
                            bu.dot.click()
                        ) : k == `%` ? (
                            bu.numbers.buPer.click()
                        ) : k == `-` ? (
                            bu.exp.buMinus.click()
                        ) : k == `+` ? (
                            bu.exp.buPlus.click()
                        ) : k == `*` ? (
                            bu.exp.buMultiply.click()
                        ) : k == `/` ? (
                            bu.exp.buDivide.click()
                        ) : k == `(` || k == `)` ? (
                            bu.brackets.click()
                        ) : 0;
                    }
                );
            };

        // Setup everything
        buSetup();
        hSetup();
        updateUI();
        darkMode(!Number(localStorage.dark));

        // Service worker registration
        navigator.serviceWorker && (window.onload = () => navigator.serviceWorker.register(`./sw.js?23032531`));
    };

// Start TheeCal
start();