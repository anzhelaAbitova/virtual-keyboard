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
let lang = [ en, ru ];

class Key {
  constructor ({ code, small, shift }) {
    this.code = code;
    this.small = small;
    this.shift = shift;
    this.isFnKey = Boolean(small.match(/Ctrl|arr|Alt|Shift|Tab|Back|Del|Enter|Caps|Win/));
  }

  madeKey = (subVal = null, smallVal, codeVal, fnVal) => {
    let wrapper = madeElem('div', 'keyboard__key', '', ['code', codeVal], ['fn', fnVal]);

    let sub =  (subVal !== null) ? madeElem('div', 'sub', subVal) : '';
    if (sub !== '') wrapper.appendChild(sub);

    let small = (smallVal.match(/arr/)) ? madeArrow('div', 'small', smallVal) : madeElem('div', 'small', smallVal);

    wrapper.appendChild(small);

    return wrapper;
  }

}


class Keyboard {
  constructor(rowsOrder) {
    this.rowsOrder = rowsOrder;
    this.keysPressed = {};
    this.isCaps = false;
    //this.lang = lang;
  }

  init = async () => {
    set('lang', 'ru');
    console.log(lang[0])

    let {$keys, keys} = await this.generateKeys(lang[0]);


    $keys.forEach(item => item.addEventListener('transitionend', removeTransition));
    window.addEventListener('keydown', playSound);
    window.addEventListener('keydown', function(e) {
      keys.forEach((item)=> {
        if (item.code === e.code){
          item.dom.classList.add('keyboard__key-active');
        }})
        ;
    });
  }

  generateKeys = async (lang) => {
    let $keys = [];
    let keys = [];
    
    lang.forEach(item => {
      let rowWrap = madeElem('div', 'keyboard__row');
      item.forEach(itemD=>{
        let oneKey = new Key(itemD);
        //console.log(oneKey)

        oneKey.dom = oneKey.madeKey(itemD.shift, itemD.small, itemD.code, itemD.isFnKey);
        rowWrap.appendChild(oneKey.dom);
        keys.push(oneKey);
        $keys.push(oneKey.dom);
        //console.log($keys)
      })
      $keyboard.appendChild(rowWrap);

    });

    keys.forEach((item) => {
      item.dom.addEventListener('transitionend', item.dom.removeTransition);
      item.dom.addEventListener('click', playSound);

      item.dom.addEventListener('click', (e) => {
          e.preventDefault();
          item.dom.classList.add('keyboard__key-active');
          $textarea.focus();
          this.isFnKeyCheck(item, item.dom);
          if (!item.isFnKey) {
            if (this.isCaps) {
              $textarea.value += item.shift.toUpperCase();
            }
            else {
              $textarea.value += item.small.toLowerCase();
            }
          }
          if (item.code === 'Win') {
            this.switchLang(item);
            //console.log();
          }
        });
        item.dom.addEventListener('transitionend', removeTransition);
    })

 
    return {$keys, keys};
  }



  isFnKeyCheck(item, itemDOM) {
    if (item.code === 'CapsLock') {
      this.isCaps = (this.isCaps) ? false : true;
      itemDOM.classList.toggle('keyboard__key-Fn_active');
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

  switchLang(item){
    $keyboard.innerHTML = '';
    if (get('lang') === 'ru') {
      set('lang', 'en');
      this.generateKeys(lang[0]);
      item.dom.children[0].innerText = 'en';
    } 
    else {
      set('lang', 'ru');
      this.generateKeys(lang[1]);
      item.dom.children[0].innerText = 'ru';
    }
  }

  open() {

  }

  close() {

  }


}


const keyboard = new Keyboard(rowsOrder);
console.log(keyboard.init());



