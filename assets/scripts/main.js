import en from './assets/en.js';
import ru from './assets/ru.js';


const $textarea = document.querySelector(".output");
const $keyboard = document.querySelector('.keyboard');
const $keyAudio = document.querySelectorAll('.key-audio');

const get = (name, subst = null) => JSON.parse(window.localStorage.getItem(name) || subst);
const set =  (name, value) => window.localStorage.setItem(name, JSON.stringify(value));



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
  if (typeof className === 'string') {
    el.classList.add(className);
  } 
  else {
    className.forEach(item=> el.classList.add(item));
  }
  let text = document.createTextNode(textNode);
  el.appendChild(text);
  if (dataAttr.length) {
    dataAttr.forEach(([attrName, attrValue]) => {
        el.dataset[attrName] = attrValue;
    })}
  return el;
}


let sound = $keyAudio[0];
const removeTransition = (e) => {
  //if (e.propertyName !== 'transform') return;
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

let lang = [ en, ru ];

class Key {
  constructor ({ code, small, shift }) {
    this.code = code;
    this.small = small;
    this.shift = shift;
    this.isFnKey = Boolean(small.match(/Ctrl|arr|Alt|Shift|Tab|Back|Del|Enter|Caps|Win/));
  }

  madeKey = (subVal = null, smallVal, codeVal, fnVal, isCaps, isShift) => {
    let wrapper = '';
    if (isShift && codeVal === 'ShiftLeft' || isCaps && codeVal === 'CapsLock') {
      wrapper = madeElem('div', ['keyboard__key', 'keyboard__key-Fn_active'], '', ['code', codeVal], ['fn', fnVal]);
    } 
    else {
      wrapper = madeElem('div', 'keyboard__key', '', ['code', codeVal], ['fn', fnVal]);
    }
    let sub = '';
    let small = '';
    if (isShift && !fnVal) {
      sub = madeElem('div', 'sub', smallVal);
      small =  (subVal !== null) ? madeElem('div', 'small', subVal) : '';
      wrapper.appendChild(sub);
      if (small !== '') wrapper.appendChild(small);
  
    }
    else {
       sub =  (subVal !== null) ? madeElem('div', 'sub', subVal) : '';
      if (sub !== '') wrapper.appendChild(sub);

      small = (smallVal.match(/arr/)) ? madeArrow('div', 'small', smallVal) : madeElem('div', 'small', smallVal);
      wrapper.appendChild(small);
      if (isCaps && !isShift) {
        small.innerText = small.innerText.toUpperCase();
      }
      else if (isCaps && isShift) {
        small.innerText = small.innerText.toLowerCase();
      }
    }

    return wrapper;
  }

}

class Keyboard {
  constructor(rowsOrder) {
    this.isShift = false;
    this.keysPressed = {};
    this.isCaps = false;
    this.isSound = true;
    this.isSpeechRecord = false;
  }

  init = async () => {
    set('lang', 'en');

    let {$keys, keys} = await this.generateKeys(lang[0]);

    $textarea.addEventListener('focus', this.open);
    $textarea.addEventListener('blur', this.close);
    keys.forEach(item => {
      item.dom.addEventListener('transitionend', removeTransition);
      this.iconsForKeys(item);
    });
    window.addEventListener('keydown', function(e) {
      if (this.isCaps) {e.key.toUpperCase()};
      keys.forEach((item)=> {
        if (item.code === e.code){
          item.dom.classList.add('keyboard__key-active');
          keyboard.isFnKeyCheck(item, keys);
          keyboard.toggleSound(item, get('lang'));
        }})
        ;
    });
    if (this.isCaps) {
      $textarea.addEventListener('input', function(){

        $textarea.value = $textarea.value.toUpperCase();
      })
    }
  }

  generateKeys = async (lang, isCaps = false) => {
    let $keys = [];
    let keys = [];

    lang.forEach(item => {
      let rowWrap = madeElem('div', 'keyboard__row');
      item.forEach(itemD=>{
        let oneKey = new Key(itemD);

        oneKey.dom = oneKey.madeKey(oneKey.shift, oneKey.small, oneKey.code, oneKey.isFnKey, this.isCaps, this.isShift);

        rowWrap.appendChild(oneKey.dom);
        keys.push(oneKey);
        $keys.push(oneKey.dom);

      })
      $keyboard.appendChild(rowWrap);
    });

    keys.forEach((item) => {
      item.dom.addEventListener('transitionend', item.dom.removeTransition);

        item.dom.addEventListener('click', (e) => {
          this.toggleSound(item, lang);
          e.preventDefault();
          $textarea.focus();
          this.isFnKeyCheck(item, keys, lang);
          this.iconsForKeys(item.dom);

        });

      item.dom.addEventListener('transitionend', removeTransition);
    })

 
    return {$keys, keys};
  }

  iconsForKeys(item) {
    if (item.code === 'ControlLeft') {
      if (this.isSound) {
        item.dom.lastChild.innerHTML = '<span class="material-icons">volume_up</span>';
      } 
      else {
        item.dom.lastChild.innerHTML = '<span class="material-icons">volume_off</span>';
      }
    }
    else if (item.code === 'AltLeft' || item.code === 'AltRight') {
      if (get('lang') === 'ru') {
        item.dom.lastChild.innerHTML = 'ru';
      } 
      else {
        item.dom.lastChild.innerHTML = 'en';
      }
    }
    else if (item.code === 'Tab') {
      if (this.isSound) {
        item.dom.lastChild.innerHTML = '<span class="material-icons">mic</span>';
      } 
      else {
        item.dom.lastChild.innerHTML = '<span class="material-icons">mic_off</span>';
      }
    }
  }

  isFnKeyCheck(item, arr, langNow = lang[0]) {
    if (!item.isFnKey) {
      if (this.isCaps) {
        $textarea.value += item.small.toUpperCase();
      }
      else if(this.isShift) {
        $textarea.value += item.shift;
      }
      else {
        $textarea.value += item.small.toLowerCase();
      }
    }
    if (item.code === 'AltLeft' || item.code === 'AltRight') {
      this.switchLang(item);
      item.small = 'en';
    }
    if (item.code === 'ControlLeft') {
      this.isSound = (this.isSound) ? false : true;
      this.iconsForKeys(item);
    }
    if (item.code === 'CapsLock') {
      this.isCaps = (this.isCaps) ? false : true;
      $keyboard.innerHTML = '';

      this.generateKeys(langNow, true);
      item.dom.classList.toggle('keyboard__key-Fn_active');
    }
    else if (item.code === 'Backspace') {
      $textarea.value = $textarea.value.substring(0, $textarea.value.length - 1);;
    }
    else if (item.code === 'ShiftLeft' || item.code === 'ShiftRight') {
      this.isShift = (this.isShift) ? false : true;
      $keyboard.innerHTML = '';

      this.generateKeys(langNow, true);
      item.dom.classList.toggle('keyboard__key-Fn_active');
    }
    else if (item.code === 'Enter') {
      $textarea.value += `\n`;
    }
    else if (item.code === 'Tab') {
      this.isSpeechRecord = (this.isSpeechRecord) ? false : true;
      this.recordSpeech();
    }
    this.iconsForKeys(item.dom);

    item.dom.classList.add('keyboard__key-active');

  }

  switchLang(item){
    $keyboard.innerHTML = '';
    if (get('lang') === 'ru') {
      set('lang', 'en');
      this.generateKeys(lang[0]);
      console.log(item.dom.lastChild.innerHTML)
      item.dom.lastChild.textContent  = 'en';
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
      
      recognition.addEventListener('result', (e) =>{
        const transcript = Array.from(e.results)
          .map(result=> result[0])
          .map(result => result.transcript)
          .join('')
      
          
          if (e.results[0].isFinal) {
            $textarea.value += transcript;
            console.log(transcript)
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
        else if (get('lang') === 'ru'){
          pickSound($keyAudio[1]); 
        }
      }


    }
    else {
      item.dom.removeEventListener('click', playSound);
      window.removeEventListener('keydown', playSound);
    }
  }

  open() {
    $keyboard.classList.remove('keyboard--hidden');
  }

  close() {
    $keyboard.classList.add('keyboard--hidden');
  }


}

const keyboard = new Keyboard(rowsOrder);
console.log(keyboard.init());