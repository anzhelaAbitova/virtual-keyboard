import en from './assets/en.js';
import ru from './assets/ru.js';


const $textarea = document.querySelector(".output");
const $keyboard = document.querySelector('.keyboard');
const $keyAudio = document.querySelector('.key-audio');

const get = (name, subst = null) => JSON.parse(window.localStorage.getItem(name) || subst);
const set =  (name, value) => window.localStorage.setItem(name, JSON.stringify(value));
console.log(localStorage.getItem('lang'))

const rowsOrder = [
  ['Backquote', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal', 'Delete'],
  ['Tab', 'KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'BracketLeft', 'BracketRight', 'Backspace'],
  ['CapsLock', 'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon', 'Quote', 'Backslash', 'Enter'],
  ['ShiftLeft', 'IntlBackslash', 'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period', 'Slash', 'ArrowUp', 'ShiftRight'],
  ['ControlLeft', 'Win', 'AltLeft', 'Space', 'AltRight', 'ArrowLeft', 'ArrowDown', 'ArrowRight', 'ControlRight'],
];

const madeArrow = (elem, className, inHTML) => {
  let el = document.createElement(elem);
  el.classList.add(className);
  el.innerHTML = inHTML;
  return el;
}

const madeElem = (elem, className, textNode = '', ...dataAttr) => {
  let el = document.createElement(elem);
  el.classList.add(className);
  let text = document.createTextNode(textNode);
  el.appendChild(text);
  if (dataAttr.length) {
    dataAttr.forEach(([attrName, attrValue]) => {
        el.dataset[attrName] = attrValue;
    })}
  return el;
}



const removeTransition = (e) => {
  //if (e.propertyName !== 'transform') return;
  e.target.classList.remove('keyboard__key-active');
}

const playSound = (e) => {
  $keyAudio.currentTime = 0;
  $keyAudio.play();
}
/*
const madeKey = (subVal, smallVal, codeVal, fnVal) => {
  let wrapper = madeElem('div', 'keyboard__key', '', ['code', codeVal], ['fn', fnVal]);
  let sub = madeElem('div', 'sub', subVal);
  let small = madeElem('div', 'small', smallVal);
  wrapper.appendChild(sub);
  wrapper.appendChild(small);
  return wrapper;
}

function foo() {
  var selObj = window.getSelection(); 
  var selRange = selObj.getRangeAt();
  // do stuff with the range
}
*/
//console.log(madeKey('A', 'a', 'keyA', 'false'));
//console.log(foo())
let lang = get('lang', '"ru"');

class Key {
  constructor ({ code, small, shift }) {
    this.code = code;
    this.small = small;
    this.shift = shift;
    this.isFnKey = Boolean(small.match(/Ctrl|arr|Alt|Shift|Tab|Back|Del|Enter|Caps|Win/));
  }

  madeKey = (subVal = null, smallVal, codeVal, fnVal) => {
    let wrapper = madeElem('div', 'keyboard__key', '', ['code', codeVal], ['fn', fnVal]);
    let sub = '';
    if (subVal !== null) {
      sub = madeElem('div', 'sub', subVal);
      wrapper.appendChild(sub);
    }
    let small = '';
    if (smallVal.match(/arr/)) {
      small = madeArrow('div', 'small', smallVal);
    }
    else {
      small = madeElem('div', 'small', smallVal);
    }
    wrapper.appendChild(small);
    return wrapper;
  }

  madeRow = () => {
    
  }
}

class KeyDOM {
  constructor() {
    let $keys
  }

  madeKeyDOM() {
    let wrapper = madeElem('div', 'keyboard__key', '', ['code', codeVal], ['fn', fnVal]);
    let sub = madeElem('div', 'sub', subVal);
    let small = madeElem('div', 'small', smallVal);
    wrapper.appendChild(sub);
    wrapper.appendChild(small);

    return wrapper;
  }
}



class Keyboard {
  constructor(rowsOrder) {
    this.rowsOrder = rowsOrder;
    this.keysPressed = {};
    this.isCaps = false;
    this.lang = lang;
  }

  init = async () => {
    set('lang', 'ru');
    let {$keys, keys} = await this.generateKeys();

    let keyRow = madeElem('div', 'key-row');

    //$keyboard.appendChild(keyRow)
    //keyRow.append($keys)
    console.log(keys)
    $keys.forEach(item => item.addEventListener('transitionend', removeTransition));
    window.addEventListener('keydown', playSound);
    window.addEventListener('keydown', function(e) {
      if (document.querySelector(`[data-code="${e.code}"]`)) {
        document.querySelector(`[data-code="${e.code}"]`).classList.add('keyboard__key-active');
      }
    });
  }

  generateKeys = async () => {
    let $keys = [];
    let keys = [];
    en.forEach(item => {
      console.log(item)
      let oneKey = new Key(item);
      keys.push(oneKey);
    });
    keys.forEach(item => {
      let oneKeyDom = item.madeKey(item.shift, item.small, item.code, item.isFnKey);
      oneKeyDom.addEventListener('transitionend', oneKeyDom.removeTransition);
      $keys.push(oneKeyDom);
      oneKeyDom.addEventListener('click', playSound);
      oneKeyDom.addEventListener('click', (e) => {
        e.preventDefault();
        oneKeyDom.classList.add('keyboard__key-active');
        $textarea.focus();
        this.isFnKeyCheck(item);
        if (!item.isFnKey) {
          if (this.isCaps) {
            $textarea.value += item.shift.toUpperCase();
          }
          else {
            $textarea.value += item.small.toLowerCase();
          }
        }
        if (item.code === 'Win') {
          if (get('lang') === 'ru') {
            set('lang', 'en');
          } 
          else {
            set('lang', 'ru');
          }
          console.log(get('lang'));
        }
      });
      oneKeyDom.addEventListener('transitionend', removeTransition);
      $keyboard.appendChild(oneKeyDom);

    })
    return {$keys, keys};

  }

  isFnKeyCheck(item) {
    if (item.code === 'CapsLock') {
      this.isCaps = true;
      item.classList.add('keyboard__key--activatable');
    }
    else if (item.code === 'Backspace') {
      $textarea.value = $textarea.value.substring(0, $textarea.value.length - 1);;
    }
    else if (item.code === 'Shift') {
      this.lang = set('lang', 'en');
      console.log(lang);
    }
    else if (item.code === 'Enter') {
      $textarea.value += `\n`;
    }
  }

  open() {

  }

  close() {

  }


}


const keyboard = new Keyboard(rowsOrder);
console.log(keyboard.init());



