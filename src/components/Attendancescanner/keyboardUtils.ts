export function getCharFromCode(code: string, shiftKey: boolean): string | null {
  const digits: Record<string, string> = {
    Digit0: '0', Digit1: '1', Digit2: '2', Digit3: '3', Digit4: '4',
    Digit5: '5', Digit6: '6', Digit7: '7', Digit8: '8', Digit9: '9',
  };
  const letters: Record<string, string> = {
    KeyA: 'a', KeyB: 'b', KeyC: 'c', KeyD: 'd', KeyE: 'e', KeyF: 'f',
    KeyG: 'g', KeyH: 'h', KeyI: 'i', KeyJ: 'j', KeyK: 'k', KeyL: 'l',
    KeyM: 'm', KeyN: 'n', KeyO: 'o', KeyP: 'p', KeyQ: 'q', KeyR: 'r',
    KeyS: 's', KeyT: 't', KeyU: 'u', KeyV: 'v', KeyW: 'w', KeyX: 'x',
    KeyY: 'y', KeyZ: 'z',
  };
  const specials: Record<string, [string, string]> = {
    Minus:        ['-', '_'],
    Equal:        ['=', '+'],
    BracketLeft:  ['[', '{'],
    BracketRight: [']', '}'],
    Semicolon:    [';', ':'],
    Quote:        ["'", '"'],
    Comma:        [',', '<'],
    Period:       ['.', '>'],
    Slash:        ['/', '?'],
    Backslash:    ['\\', '|'],
  };

  if (digits[code])  return digits[code];
  if (letters[code]) return shiftKey ? letters[code].toUpperCase() : letters[code];
  if (specials[code]) return specials[code][shiftKey ? 1 : 0];

  return null;
}