"use-strict"

const
    start = () => {

        let
            equalDone = false,
            history = [],
            resultsItems;

        const
            select = c => document.querySelector(c),
            selectAll = c => document.querySelectorAll(c),
            flex = e => e.style.display = `flex`,
            block = e => e.style.display = `block`,
            hide = e => e.style.display = `none`,
            classCheck = (e, c) => e.classList.contains(c) ? false : true,
            disableBu = e => e.classList.add(`shadow_inside`),
            disableAll = a => a.forEach(e => e.classList.add(`shadow_inside`)),
            enableBu = e => e.classList.remove(`shadow_inside`),
            enableAll = a => a.forEach(e => e.classList.remove(`shadow_inside`)),
            enabledCheck = e => classCheck(e, `shadow_inside`),
            expressions = [`÷`, `×`, `-`, `+`],
            infoBu = select(`.info_wrap`).children[0],
            historyClear = select(`.history_clear`).children[0],
            historyContent = select(`.history_content`),
            historySaveBu = select(`.save_wrap`).children[0],
            saveOff = `./img/save_off.svg`,
            saveOn = `./img/save_on.svg`,
            topBottomClass = `shadow_top_bottom`,
            historyScroll = () =>
                !historyContent.scrollTop || historyContent.scrollTop > (
                    historyContent.scrollHeight - historyContent.clientHeight
                ) ?
                    historyContent.classList.remove(topBottomClass)
                    : historyContent.classList.add(topBottomClass), // reached top
            historySaveUpdate = () => historySaveBu.src =
                localStorage.history ? saveOn : saveOff,
            historyUpdate = () => {
                const
                    l = resultsItems.length,
                    t = history.length;

                if (t > l) for (let i = l; i < t; i++)
                    historyContent.appendChild(resultsItems[0].cloneNode(1));

                else if (t < l) for (let i = (t || 1); i < l; i++)
                    resultsItems[i].remove();

                resultsItems = selectAll(`.history_result`);

                for (let i = 0; i < history.length; i++)
                    resultsItems[i].innerText = history[i];

                history.length ? (
                    resultsItems.forEach(i => i.onclick = () => {
                        calcEqu.innerText = ``;
                        calcResult.value = i.innerText.split(` = `)[0];
                        updateUI();
                    }),
                    flex(historyClear.parentElement),
                    flex(historySaveBu.parentElement)
                ) : (
                    resultsItems[0].innerText = ``,
                    hide(historyClear.parentElement),
                    hide(historySaveBu.parentElement)
                );
                historyContent.scrollTo(0, historyContent.scrollHeight);
                historyScroll();
                historySaveUpdate();
                localStorage.history && (localStorage.history = JSON.stringify(history));
            },
            calcEqu = select(`.calc_equation`),
            calcResult = select(`.calc_result`),
            copyIcon = select(`.copy_wrap`).children[0],
            buBack = select(`#bu_back`),
            buClear = select(`#bu_clear`),
            clearAll = () => {
                calcEqu.innerText = ``;
                calcResult.value = `0`;
                updateUI();
            },
            buBrackets = select(`#bu_brackets`),
            bracketCheck = value => (value.match(/[(]/g) || []).length >
                (value.match(/[)]/g) || []).length,
            buDot = select(`#bu_dot`),
            buNumbers = {
                bu9: select(`#bu_9`),
                bu8: select(`#bu_8`),
                bu7: select(`#bu_7`),
                bu6: select(`#bu_6`),
                bu5: select(`#bu_5`),
                bu4: select(`#bu_4`),
                bu3: select(`#bu_3`),
                bu2: select(`#bu_2`),
                bu1: select(`#bu_1`),
                bu0: select(`#bu_0`),
                buPercentage: select(`#bu_percentage`),
            },
            buExp = {
                buDivide: select(`#bu_divide`),
                buMultiply: select(`#bu_multiply`),
                buMinus: select(`#bu_minus`),
                buPlus: select(`#bu_plus`),
            },
            buEqual = select(`#bu_equal`),
            resultsRevert = () => equalDone && (
                calcResult.value = calcEqu.innerText.split(` =`)[0],
                calcEqu.innerText = ``,
                equalDone = false
            ),
            updateUI = v => {

                // analyse value
                let value = calcResult.value;
                v != undefined && (
                    value != `0` && (!equalDone || expressions.indexOf(v) > -1) ? (
                        !equalDone ? resultsRevert() : equalDone = false,
                        calcResult.value += v
                    ) : (
                        equalDone = false,
                        calcEqu.innerText = ``,
                        calcResult.value = v
                    )
                );
                value == `` && (calcResult.value = `0`);
                value = calcResult.value;

                // enable/disable buttons
                const
                    cha = value.length,
                    last = value[cha - 1],
                    ratio = calcResult.clientWidth / cha;
                last == `%` || last == `)` ? numDisable() : numEnable();
                value == `0` ? (
                    hide(copyIcon.parentElement),
                    disableAll([buBack, buClear, buEqual])
                ) : (
                    flex(copyIcon.parentElement),
                    enableAll([buBack, buClear, buEqual])
                );
                value == `0` || last == `÷` || last == `×`
                    || last == `-` || last == `+` || bracketCheck(value) ?
                    enableBu(buBrackets) : disableBu(buBrackets);

                value == `0` || expressions.indexOf(last) > -1 || last == `.` || last == `(` ?
                    disableBu(buEqual) : enableBu(buEqual);

                // change font
                calcResult.style.fontSize = (ratio > 70 ? 100
                    : ratio > 55 ? 80
                        : ratio > 40 ? 60
                            : 40) + `px`;
            },
            buttonSetup = (bu, v) => {
                v = v || bu.innerText;
                bu.onclick = () => enabledCheck(bu) && updateUI(v);
            },
            expSetup = (bu, v) => {
                v = v || bu.innerText;
                bu.onclick = () => {
                    if (enabledCheck(bu)) {
                        const
                            value = calcResult.value,
                            lastNum = value.length - 1,
                            last = value[lastNum];
                        expressions.indexOf(last) > -1 && (
                            calcResult.value = value.slice(0, lastNum)
                        );
                        updateUI(v);
                    };
                };
            },
            numDisable = () => {
                for (const b in buNumbers)
                    disableBu(buNumbers[b]);
                disableBu(buDot);
            },
            numEnable = () => {
                for (const b in buNumbers)
                    enableBu(buNumbers[b]);
                enableBu(buDot);
            };

        // clear history
        historyClear.onclick = () => {
            history = [];
            historyUpdate();
        };

        // history scroll
        historyContent.onscroll = () => historyScroll();

        // history save
        historySaveBu.onclick = () => localStorage.history ? (
            localStorage.removeItem(`history`),
            historySaveUpdate()
        ) : (
            localStorage.history = JSON.stringify(history),
            historySaveUpdate()
        );

        // copy button
        copyIcon.onclick = () => navigator.clipboard.writeText(calcResult.value);

        // backspace
        buBack.onclick = () => {
            if (enabledCheck(buBack)) {
                resultsRevert();
                const value = calcResult.value;
                value != `0` && (calcResult.value = value.slice(0, value.length - 1));
                updateUI();
            };
        };

        // clear
        buClear.onclick = () => enabledCheck(buClear) && clearAll();

        // brackets
        buBrackets.onclick = () => {
            if (enabledCheck(buBrackets)) {
                const value = calcResult.value;
                calcResult.value += bracketCheck(value) ? `)` : `(`;
                updateUI();
            };
        };

        // numbers
        for (const b in buNumbers)
            buttonSetup(buNumbers[b]);

        // dot
        buDot.onclick = () => {
            if (enabledCheck(buDot)) {
                const value = calcResult.value;
                for (let i = value.length - 1; i > -1; i--) {
                    const v = value[i];
                    if (equalDone) break
                    else if (v.match(/\./g)) return
                    else if (expressions.indexOf(v) > -1 || v == `%`) break
                };
                updateUI(`.`);
            };
        };

        // expressions
        for (const b in buExp)
            expSetup(buExp[b]);

        // update
        calcResult.oninput = () => updateUI();

        // equal
        buEqual.onclick = () => {
            if (enabledCheck(buEqual)) {

                // define values
                const
                    value = calcResult.value,
                    check = /\d|\+|\-|\÷|\×|\%|\(|\)|\./g;

                // sanitise input
                for (let i = 0; i < value.length; i++)
                    if (!value[i].match(check)) return

                // switch values
                let calc = ``;
                for (let i = 0; i < value.length; i++) {
                    const c = value[i];
                    calc += c.match(/\×/g) ? `*`
                        : c.match(/\÷/g) ? `/`
                            : c.match(/\%/g) ? `*0.01`
                                : c;
                };

                // evaluate input
                // const final = new Function("return " + calc)();
                // const final = window.eval[0](calc);
                const final = [eval][0](calc);


                // show and record result
                if (Number(final)) {
                    equalDone = true;
                    calcEqu.innerText = value + ` =`;
                    calcResult.value = final;
                    history.push(value + ` = ` + final);
                };

                historyUpdate();
            };
        };

        // info button
        infoBu.onclick = () => infoBu.src = infoBu.src.match(`back.svg`) ? (

            `./img/info.svg`
        ) : (

            `./img/back.svg`
        );

        // start
        resultsItems = selectAll(`.history_result`);
        localStorage.history && (history = JSON.parse(localStorage.history));
        historyUpdate();
        calcResult.focus();
        updateUI();

        // register service worker
        navigator.serviceWorker &&
            (window.onload = () => navigator.serviceWorker.register('./sw.js'));

    };

start();