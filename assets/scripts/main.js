import en from './en.js';
import ru from './ru.js';


const $textarea = document.querySelector(".output");
const $keyboard = document.querySelector('.keyboard');
const $keyAudio = document.querySelectorAll('.key-audio');

const get = (name, subst = null) => JSON.parse(window.localStorage.getItem(name) || subst);
const set = (name, value) => window.localStorage.setItem(name, JSON.stringify(value));


const madeArrow = (elem, className, inHTML) => {
    let el = document.createElement(elem);
    el.classList.add(className);
    el.innerHTML = inHTML;
    return el;
}

const madeElem = (elem, className, textNode = '', ...dataAttr) => {
    let el = document.createElement(elem);
    if (typeof className === 'string') {
        el.classList.add(className);
    }
    else {
        className.forEach(item => el.classList.add(item));
    }
    if (textNode.match(/^<span/)) {
        el.innerHTML = textNode;
    }
    else {
        let text = document.createTextNode(textNode);
        el.appendChild(text);
    }
    if (dataAttr.length) {
        dataAttr.forEach(([attrName, attrValue]) => {
            el.dataset[attrName] = attrValue;
        })
    }

    return el;
}


const removeTransition = (e) => {
    e.target.classList.remove('keyboard__key-active');
}

const playSound = (e) => {
    soundCheck.currentTime = 0;
    soundCheck.play();
}

const pickSound = (soundCheck) => {
    soundCheck.currentTime = 0;
    soundCheck.play();
}

let lang = [en, ru];

class Key {
    constructor({ code, small, shift, cssClass, isCaps, isShift }) {
        this.codeVal = code;
        this.smallVal = small;
        this.subVal = shift;
        this.cssClass = cssClass;
        this.isCaps = isCaps;
        this.isShift = isShift;
        this.isFnKey = Boolean(small.match(/Ctrl|arr|Alt|Shift|Tab|Back|Del|Enter|Caps|Win/));
    }

    madeKey() {
        let wrapper = madeElem('div', 
                        this.isShift && this.codeVal === 'ShiftLeft' || this.isCaps && this.codeVal === 'CapsLock' 
                        ? ['keyboard__key', 'keyboard__key-Fn_active', this.cssClass]
                        : ['keyboard__key', this.cssClass],
                    '', ['code', this.codeVal], ['fn', this.isFnKey]);
 
        let sub = '';
        let small = '';
        if (this.codeVal.match(/Alt|Ctrl|Tab|Del/)) {
            if (this.codeVal === 'AltLeft' || this.codeVal === 'AltRight') {
                let langNow = (get('lang'));
                small = madeElem('div', 'small', langNow);
            } else if (this.codeVal === 'Delete') {
                small = madeElem('div', 'small', '<span class="material-icons">close</span>');
            } else if (this.codeVal === 'ControlLeft') {
                small = madeElem('div', 'small', `<span class="material-icons">${keyboard.isSound ? 'volume_up' : 'volume_off'}</span>`);
            } else if (this.codeVal === 'Tab') {
                small = madeElem('div', 'small', `<span class="material-icons">${keyboard.isSpeechRecord ? 'mic' : 'mic_off'}</span>`);

            }
        }
        if (this.isShift && !this.isFnKey) {
            sub = madeElem('div', 'sub', this.smallVal);
            small = (this.subVal !== null) ? madeElem('div', 'small', this.subVal) : '';
            wrapper.appendChild(sub);
            if (small !== '') wrapper.appendChild(small);

        } else {
            sub = (this.subVal !== null) ? madeElem('div', 'sub', this.subVal) : '';
            if (sub !== '') wrapper.appendChild(sub);

            small = (this.smallVal.match(/arr/)) ? madeArrow('div', 'small', this.smallVal) : madeElem('div', 'small', this.smallVal);
            wrapper.appendChild(small);
            if (this.isCaps && !this.isShift) {
                small.innerText = small.innerText.toUpperCase();
            } else if (this.isCaps && this.isShift) {
                small.innerText = small.innerText.toLowerCase();
            }
        }

        return wrapper;
    }

}

class Keyboard {
    constructor() {
        this.isShift = false;
        this.keysPressed = {};
        this.isCaps = false;
        this.isSound = true;
        this.isSpeechRecord = false;
    }

    init() {
        set('lang', 'en');

        let { $keys, keys } = this.generateKeys(lang[0]);

        $textarea.addEventListener('focus', this.open);
        keys.forEach(item => {
            item.dom.addEventListener('transitionend', removeTransition);
        });
        this.phiKeyboard(keys);
    }

    phiKeyboard(keys) {
        window.addEventListener('keydown', function (e) {
            if (this.isCaps) { e.key.toUpperCase() };
            keys.forEach((item) => {
                if (item.code === e.code) {
                    item.dom.classList.add('keyboard__key-active');
                    keyboard.isFnKeyCheck(item, keys);
                    keyboard.toggleSound(item, get('lang'));
                }
            })
                ;
        });
    }

    generateKeys(lang) {
        let $keys = [];
        let keys = [];

        lang.forEach(item => {
            let rowWrap = madeElem('div', 'keyboard__row');
            item.forEach(itemD => {
                let oneKey = new Key(itemD);
                const obj = {
                    isCaps: this.isCaps,
                    isShift: this.isShift
                }

                oneKey.dom = oneKey.madeKey({...oneKey, ...obj});

                rowWrap.appendChild(oneKey.dom);
                keys.push(oneKey);
                $keys.push(oneKey.dom);

            })
            $keyboard.appendChild(rowWrap);

        });

        keys.forEach((item) => {
            keyboard.iconsForKeys(item);
            item.dom.addEventListener('transitionend', item.dom.removeTransition);

            item.dom.addEventListener('click', (e) => {
                e.preventDefault();
                let selection = this.isFnKeyCheck(item, keys, lang);

                if (selection === undefined) {
                    if (!item.isFnKey) {
                        if (this.isCaps) {
                            $textarea.value += item.small.toUpperCase();
                        } else if (this.isShift) {
                            $textarea.value += item.shift;
                        } else {
                            $textarea.value += item.small.toLowerCase();
                        }
                    } else if (item.code === 'Backspace') {
                        $textarea.value = $textarea.value.substring(0, $textarea.value.length - 1);
                    }
                } else if (selection < $textarea.value.length) {
                    let fHalfStr = $textarea.value.substring(0, selection);
                    let sHalfStr = $textarea.value.substring(0, $textarea.value.length - selection);
                    if (!item.isFnKey) {
                        if (this.isCaps) {
                            $textarea.value = fHalfStr + item.small.toUpperCase() + sHalfStr;
                        } else if (this.isShift) {
                            $textarea.value = fHalfStr + item.shift + sHalfStr;
                        } else {
                            $textarea.value = fHalfStr + item.small.toLowerCase() + sHalfStr;
                        }
                    } else if (item.code === 'Backspace') {
                        selection = this.isFnKeyCheck(item, keys, lang);

                        $textarea.value = fHalfStr.substring(0, fHalfStr.length - 1) + sHalfStr;
                    }
                }

                this.toggleSound(item, lang);
                $textarea.focus();
                this.iconsForKeys(item);
                this.phiKeyboard(keys);
            });

            item.dom.addEventListener('transitionend', removeTransition);
        })


        return { $keys, keys };
    }

    iconsForKeys(item) {
        if (item.code === 'ControlLeft') {
            item.dom.innerHTML = `<span class="material-icons">${this.isSound ? 'volume_up' : 'volume_off'}</span>`;
        } else if (item.code === 'AltLeft' || item.code === 'AltRight') {
            item.dom.lastChild.innerHTML =  get('lang') === 'ru' ? 'ru' : 'en';

        } else if (item.code === 'Tab') {
            item.dom.lastChild.innerHTML = `<span class="material-icons">${this.isSpeechRecord ? 'mic' :'mic_off'}</span>`;

        } else if (item.code === 'Delete') {
            item.dom.lastChild.innerHTML = '<span class="material-icons">close</span>';
        }
    }

    isFnKeyCheck(item, arr, langNow = lang[0]) {
        item.dom.classList.add('keyboard__key-active');

        if (item.code === 'AltLeft' || item.code === 'AltRight') {
            this.switchLang(item);
            item.small = 'en';
        }
        else if (item.code === 'ControlLeft') {
            this.isSound = (this.isSound) ? false : true;
            this.iconsForKeys(item);
        }
        else if (item.code === 'Delete') {
            item.dom.addEventListener('click', keyboard.close);
        }
        else if (item.code === 'CapsLock') {
            this.isCaps = (this.isCaps) ? false : true;
            $keyboard.innerHTML = '';

            this.generateKeys(langNow, true);
        }
        else if (item.code === 'ShiftLeft' || item.code === 'ShiftRight') {
            this.isShift = (this.isShift) ? false : true;
            $keyboard.innerHTML = '';

            this.generateKeys(langNow, true);
        }
        else if (item.code === 'Enter') {
            $textarea.value += `\n`;
        }
        else if (item.code === 'Tab') {
            this.isSpeechRecord = (this.isSpeechRecord) ? false : true;
            this.recordSpeech();
        }
        else if (item.code === 'ArrowLeft') {
            let selLeft = this.arrowToLeft();
            return selLeft;
        }
        else if (item.code === 'ArrowRight') {
            let selRight = this.arrowToRight();
            return selRight;
        }
        this.iconsForKeys(item.dom);

    }

    switchLang(item) {
        $keyboard.innerHTML = '';
        if (get('lang') === 'ru') {
            set('lang', 'en');
            this.generateKeys(lang[0]);
        }
        else {
            set('lang', 'ru');
            this.generateKeys(lang[1]);
            item.dom.children[0].innerText = 'ru';
        }

    }

    recordSpeech() {
        window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        const recognition = new SpeechRecognition;
        if (this.isSpeechRecord) {

            recognition.interimResults = true;
            recognition.lang = (get('lang') === 'en') ? 'en-US' : 'ru-RU';
            recognition.continuous = true;

            recognition.addEventListener('result', (e) => {
                const transcript = Array.from(e.results)
                    .map(result => result[0])
                    .map(result => result.transcript)
                    .join('')


                if (e.results[0].isFinal) {
                    $textarea.value += transcript;
                }
            })

            recognition.start();
        }
        else {
            recognition.stop();
        }

    }

    toggleSound(item) {
        if (this.isSound) {

            if (item.code === 'ShiftLeft') {
                pickSound($keyAudio[5]);
            }
            else if (item.code === 'Backspace') {
                pickSound($keyAudio[2]);
            }
            else if (item.code === 'CapsLock') {
                pickSound($keyAudio[3]);
            }
            else if (item.code === 'Enter') {
                pickSound($keyAudio[4]);
            }
            else {
                if (get('lang') === 'en') {
                    pickSound($keyAudio[0]);
                }
                else if (get('lang') === 'ru') {
                    pickSound($keyAudio[1]);
                }
            }


        }
        else {
            item.dom.removeEventListener('click', playSound);
            window.removeEventListener('keydown', playSound);
        }
    }

    arrowToLeft() {
        $textarea.selectionStart = Math.max(0, $textarea.selectionStart - 1);
        $textarea.selectionEnd = $textarea.selectionStart;
        return $textarea.selectionStart;
    }

    arrowToRight() {
        $textarea.selectionStart = Math.min($textarea.value.length, $textarea.selectionEnd + 1);
        $textarea.selectionEnd = $textarea.selectionStart;
        return $textarea.selectionStart;
    }

    open() {
        $keyboard.classList.remove('keyboard--hidden');
    }

    close() {
        $keyboard.classList.add('keyboard--hidden');
    }


}

const keyboard = new Keyboard();
keyboard.init();
$textarea.addEventListener('focus', keyboard.open);
$textarea.addEventListener('click', keyboard.open);