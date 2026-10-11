// Project: DOMIsh
// Author:  Sebastien Pierre
// License: Revised BSD License
// Created: 2022-04-21
// Module: events
// A comprehensive DOM-compatible event implementation for server-side testing.
// Provides the full event hierarchy including Event, UIEvent, MouseEvent,
// KeyboardEvent, and specialized events. Supports event bubbling (no capture phase).
//
// Example:
// ```typescript
// const click = new MouseEvent("click", { clientX: 100, clientY: 200 });
// element.dispatchEvent(click);
// ```
// ----------------------------------------------------------------------------
//
// EVENT PHASES
//
// ----------------------------------------------------------------------------
// Constant: EventPhase
// Numeric constants for event propagation phases.
// ----------------------------------------------------------------------------
//
// BASE EVENT
//
// ----------------------------------------------------------------------------
// ============================================================================
// SUBSECTION: Event Class
// ============================================================================
// Class: Event
// The base class for all DOM events. Defines standard event properties and
// methods for controlling event propagation.
//
// Properties:
// - type: string - event type (e.g., "click", "keydown")
// - target: EventTarget | null - the element that dispatched the event
// - currentTarget: EventTarget | null - the element currently handling the event
// - bubbles: boolean - whether the event bubbles up the DOM tree
// - cancelable: boolean - whether preventDefault() has an effect
// - composed: boolean - whether the event crosses shadow DOM boundaries
// - timeStamp: number - milliseconds since page load when event was created
// - eventPhase: number - current propagation phase (see EventPhase)
// - defaultPrevented: boolean - true if preventDefault() was called
	// Method: preventDefault
	// Cancels the event if cancelable. Used to prevent default browser behavior.
	// Method: stopPropagation
	// Stops event bubbling after the current handler completes.
	// Method: stopImmediatePropagation
	// Stops event propagation immediately; remaining handlers are not called.
	// Method: composedPath
	// Returns an array of EventTargets that the event will bubble through.
// ----------------------------------------------------------------------------
//
// UI EVENTS
//
// ----------------------------------------------------------------------------
// ============================================================================
// SUBSECTION: UI Event
// ============================================================================
// Class: UIEvent
// Base class for user interface events. Extends Event with view and detail.
//
// Properties:
// - view: Window | null - the window that generated the event
// - detail: number - event-specific detail information
// Type: UIEventInit
// Options interface for UIEvent constructor.
// ----------------------------------------------------------------------------
//
// MOUSE EVENTS
//
// ----------------------------------------------------------------------------
// ============================================================================
// SUBSECTION: Mouse Event
// ============================================================================
// Class: MouseEvent
// Represents mouse interaction events (click, mousedown, mouseup, etc.).
// Extends UIEvent with position, button state, and modifier key information.
//
// Properties:
// - clientX, clientY: number - mouse position relative to viewport
// - screenX, screenY: number - mouse position relative to screen
// - button: number - mouse button (0=left, 1=middle, 2=right)
// - buttons: number - bitmask of pressed buttons
// - relatedTarget: EventTarget | null - secondary target (e.g., for mouseenter)
// - ctrlKey, shiftKey, altKey, metaKey: boolean - modifier key states
// - movementX, movementY: number - position change since last mouse event
// - pageX, pageY: number - mouse position relative to document
// - which: number - deprecated button identifier
	// Method: getModifierState
	// Returns true if the modifier key `keyArg` is pressed (Control, Shift, Alt, Meta).
// Type: MouseEventInit
// Options interface for MouseEvent constructor.
// ----------------------------------------------------------------------------
//
// KEYBOARD EVENTS
//
// ----------------------------------------------------------------------------
// ============================================================================
// SUBSECTION: Keyboard Event
// ============================================================================
// Class: KeyboardEvent
// Represents keyboard interaction events (keydown, keyup, keypress).
// Extends UIEvent with key information and modifier states.
//
// Properties:
// - key: string - the key value (e.g., "Enter", "a", "ArrowUp")
// - code: string - physical key code (e.g., "KeyA", "Enter")
// - location: number - key location (standard, left, right, numpad)
// - ctrlKey, shiftKey, altKey, metaKey: boolean - modifier key states
// - repeat: boolean - true if key is being held down
// - isComposing: boolean - true if composing an input method sequence
// - charCode, keyCode, which: number - deprecated key identifiers
//
// Static Constants:
// - DOM_KEY_LOCATION_STANDARD: number = 0
// - DOM_KEY_LOCATION_LEFT: number = 1
// - DOM_KEY_LOCATION_RIGHT: number = 2
// - DOM_KEY_LOCATION_NUMPAD: number = 3
// --
// ### Focus Event
// --
// ### Input Event
// --
// ### Composition Event
// --
// ### Wheel Event
// --
// ### Data Transfer (for Drag/Clipboard)
		// No-op in server-side environment
// --
// ### Drag Event
// --
// ### Clipboard Event
// --
// ### Touch
// --
// ### Touch List
// --
// ### Touch Event
// --
// ### Pointer Event
// --
// ### Hash Change Event
// --
// ### Pop State Event
// --
// ### Submit Event
// --
// ### Custom Event
// --
// ### Event Factory Functions
// ----------------------------------------------------------------------------
//
// ERROR EVENT
//
// ----------------------------------------------------------------------------
// ============================================================================
// SUBSECTION: Error Event
// ============================================================================
// Class: ErrorEvent
// Represents script errors and exceptions.
//
// Properties:
// - message: string - error message
// - filename: string - URL of script where error occurred
// - lineno: number - line number where error occurred
// - colno: number - column number where error occurred
// - error: Error | null - the Error object
// ----------------------------------------------------------------------------
//
// EVENT TYPE REGISTRY
//
// ----------------------------------------------------------------------------
// Constant: eventTypes
// Maps event type names to their corresponding event classes.
	// Mouse events
	// Wheel events
	// Keyboard events
	// Focus events
	// Input events
	// Composition events
	// Drag events
	// Clipboard events
	// Touch events
	// Pointer events
	// Form events
	// Document/Window events
// Type: ErrorEventInit
// Options interface for ErrorEvent constructor.
// EOF

export const EventPhase = {
  NONE: 0,
  CAPTURING_PHASE: 1,
  AT_TARGET: 2,
  BUBBLING_PHASE: 3
};

export class Event {
  type;
  target;
  currentTarget;
  bubbles;
  cancelable;
  composed;
  timeStamp;
  eventPhase;
  defaultPrevented;
  _propagationStopped;
  _immediatePropagationStopped;
  _path;
  constructor(type, options = {}) {
    this.type = type;
    this.target = null;
    this.currentTarget = null;
    this.bubbles = options.bubbles ?? false;
    this.cancelable = options.cancelable ?? false;
    this.composed = options.composed ?? false;
    this.timeStamp = Date.now();
    this.eventPhase = EventPhase.NONE;
    this.defaultPrevented = false;
    this._propagationStopped = false;
    this._immediatePropagationStopped = false;
    this._path = [];
  }
  preventDefault() {
    if (this.cancelable) {
      this.defaultPrevented = true;
    }
  }
  stopPropagation() {
    this._propagationStopped = true;
  }
  stopImmediatePropagation() {
    this._propagationStopped = true;
    this._immediatePropagationStopped = true;
  }
  composedPath() {
    return [...this._path];
  }
  get _isPropagationStopped() {
    return this._propagationStopped;
  }
  get _isImmediatePropagationStopped() {
    return this._immediatePropagationStopped;
  }
  _setTarget(target) {
    this.target = target;
  }
  _setCurrentTarget(currentTarget) {
    this.currentTarget = currentTarget;
  }
  _setEventPhase(phase) {
    this.eventPhase = phase;
  }
  _setPath(path) {
    this._path = path;
  }
}

export class UIEvent extends Event {
  view;
  detail;
  constructor(type, options = {}) {
    super(type, options);
    this.view = options.view ?? null;
    this.detail = options.detail ?? 0;
  }
}

export class MouseEvent extends UIEvent {
  clientX;
  clientY;
  screenX;
  screenY;
  button;
  buttons;
  relatedTarget;
  ctrlKey;
  shiftKey;
  altKey;
  metaKey;
  movementX;
  movementY;
  pageX;
  pageY;
  which;
  constructor(type, options = {}) {
    super(type, options);
    this.clientX = options.clientX ?? 0;
    this.clientY = options.clientY ?? 0;
    this.screenX = options.screenX ?? 0;
    this.screenY = options.screenY ?? 0;
    this.button = options.button ?? 0;
    this.buttons = options.buttons ?? 0;
    this.relatedTarget = options.relatedTarget ?? null;
    this.ctrlKey = options.ctrlKey ?? false;
    this.shiftKey = options.shiftKey ?? false;
    this.altKey = options.altKey ?? false;
    this.metaKey = options.metaKey ?? false;
    this.movementX = options.movementX ?? 0;
    this.movementY = options.movementY ?? 0;
    this.pageX = options.pageX ?? this.clientX;
    this.pageY = options.pageY ?? this.clientY;
    this.which = options.which ?? this.button + 1;
  }
  getModifierState(keyArg) {
    switch (keyArg) {
      case "Control":
        return this.ctrlKey;
      case "Shift":
        return this.shiftKey;
      case "Alt":
        return this.altKey;
      case "Meta":
        return this.metaKey;
      default:
        return false;
    }
  }
}

export class KeyboardEvent extends UIEvent {
  key;
  code;
  location;
  ctrlKey;
  shiftKey;
  altKey;
  metaKey;
  repeat;
  isComposing;
  charCode;
  keyCode;
  which;
  static DOM_KEY_LOCATION_STANDARD = 0;
  static DOM_KEY_LOCATION_LEFT = 1;
  static DOM_KEY_LOCATION_RIGHT = 2;
  static DOM_KEY_LOCATION_NUMPAD = 3;
  constructor(type, options = {}) {
    super(type, options);
    this.key = options.key ?? "";
    this.code = options.code ?? "";
    this.location = options.location ?? KeyboardEvent.DOM_KEY_LOCATION_STANDARD;
    this.ctrlKey = options.ctrlKey ?? false;
    this.shiftKey = options.shiftKey ?? false;
    this.altKey = options.altKey ?? false;
    this.metaKey = options.metaKey ?? false;
    this.repeat = options.repeat ?? false;
    this.isComposing = options.isComposing ?? false;
    this.charCode = options.charCode ?? 0;
    this.keyCode = options.keyCode ?? 0;
    this.which = options.which ?? 0;
  }
  getModifierState(keyArg) {
    switch (keyArg) {
      case "Control":
        return this.ctrlKey;
      case "Shift":
        return this.shiftKey;
      case "Alt":
        return this.altKey;
      case "Meta":
        return this.metaKey;
      default:
        return false;
    }
  }
}

export class FocusEvent extends UIEvent {
  relatedTarget;
  constructor(type, options = {}) {
    super(type, options);
    this.relatedTarget = options.relatedTarget ?? null;
  }
}

export class InputEvent extends UIEvent {
  data;
  inputType;
  isComposing;
  constructor(type, options = {}) {
    super(type, options);
    this.data = options.data ?? null;
    this.inputType = options.inputType ?? "insertText";
    this.isComposing = options.isComposing ?? false;
  }
}

export class CompositionEvent extends UIEvent {
  data;
  constructor(type, options = {}) {
    super(type, options);
    this.data = options.data ?? "";
  }
}

export class WheelEvent extends MouseEvent {
  deltaX;
  deltaY;
  deltaZ;
  deltaMode;
  static DOM_DELTA_PIXEL = 0;
  static DOM_DELTA_LINE = 1;
  static DOM_DELTA_PAGE = 2;
  constructor(type, options = {}) {
    super(type, options);
    this.deltaX = options.deltaX ?? 0;
    this.deltaY = options.deltaY ?? 0;
    this.deltaZ = options.deltaZ ?? 0;
    this.deltaMode = options.deltaMode ?? WheelEvent.DOM_DELTA_PIXEL;
  }
}

export class DataTransfer {
  dropEffect;
  effectAllowed;
  files;
  items;
  types;
  _data;
  constructor() {
    this.dropEffect = "none";
    this.effectAllowed = "uninitialized";
    this.files = [];
    this.items = [];
    this.types = [];
    this._data = new Map;
  }
  clearData(format) {
    if (format === undefined) {
      this._data.clear();
    } else {
      this._data.delete(format);
    }
    this._updateTypes();
  }
  getData(format) {
    return this._data.get(format) ?? "";
  }
  setData(format, data) {
    this._data.set(format, data);
    this._updateTypes();
  }
  _updateTypes() {
    this.types = Array.from(this._data.keys());
  }
  setDragImage(_image, _x, _y) {}
}

export class DragEvent extends MouseEvent {
  dataTransfer;
  constructor(type, options = {}) {
    super(type, options);
    this.dataTransfer = options.dataTransfer ?? null;
  }
}

export class ClipboardEvent extends Event {
  clipboardData;
  constructor(type, options = {}) {
    super(type, options);
    this.clipboardData = options.clipboardData ?? null;
  }
}

export class Touch {
  identifier;
  target;
  clientX;
  clientY;
  screenX;
  screenY;
  pageX;
  pageY;
  force;
  rotationAngle;
  radiusX;
  radiusY;
  constructor(options) {
    this.identifier = options.identifier ?? 0;
    this.target = options.target;
    this.clientX = options.clientX ?? 0;
    this.clientY = options.clientY ?? 0;
    this.screenX = options.screenX ?? 0;
    this.screenY = options.screenY ?? 0;
    this.pageX = options.pageX ?? this.clientX;
    this.pageY = options.pageY ?? this.clientY;
    this.force = options.force ?? 0;
    this.rotationAngle = options.rotationAngle ?? 0;
    this.radiusX = options.radiusX ?? 0;
    this.radiusY = options.radiusY ?? 0;
  }
}

export class TouchList {
  _touches;
  constructor(touches = []) {
    this._touches = touches;
  }
  get length() {
    return this._touches.length;
  }
  item(index) {
    return this._touches[index] ?? null;
  }
  *[Symbol.iterator]() {
    for (const touch of this._touches) {
      yield touch;
    }
  }
  identifiedTouch(identifier) {
    for (const touch of this._touches) {
      if (touch.identifier === identifier) {
        return touch;
      }
    }
    return null;
  }
}

export class TouchEvent extends UIEvent {
  touches;
  targetTouches;
  changedTouches;
  altKey;
  metaKey;
  ctrlKey;
  shiftKey;
  constructor(type, options = {}) {
    super(type, options);
    this.touches = new TouchList(options.touches ?? []);
    this.targetTouches = new TouchList(options.targetTouches ?? []);
    this.changedTouches = new TouchList(options.changedTouches ?? []);
    this.altKey = options.altKey ?? false;
    this.metaKey = options.metaKey ?? false;
    this.ctrlKey = options.ctrlKey ?? false;
    this.shiftKey = options.shiftKey ?? false;
  }
}

export class PointerEvent extends MouseEvent {
  pointerId;
  width;
  height;
  pressure;
  tangentialPressure;
  tiltX;
  tiltY;
  twist;
  pointerType;
  isPrimary;
  constructor(type, options = {}) {
    super(type, options);
    this.pointerId = options.pointerId ?? 0;
    this.width = options.width ?? 1;
    this.height = options.height ?? 1;
    this.pressure = options.pressure ?? 0;
    this.tangentialPressure = options.tangentialPressure ?? 0;
    this.tiltX = options.tiltX ?? 0;
    this.tiltY = options.tiltY ?? 0;
    this.twist = options.twist ?? 0;
    this.pointerType = options.pointerType ?? "mouse";
    this.isPrimary = options.isPrimary ?? false;
  }
}

export class HashChangeEvent extends Event {
  oldURL;
  newURL;
  constructor(type, options = {}) {
    super(type, options);
    this.oldURL = options.oldURL ?? "";
    this.newURL = options.newURL ?? "";
  }
}

export class PopStateEvent extends Event {
  state;
  constructor(type, options = {}) {
    super(type, options);
    this.state = options.state ?? null;
  }
}

export class SubmitEvent extends Event {
  submitter;
  constructor(type, options = {}) {
    super(type, options);
    this.submitter = options.submitter ?? null;
  }
}

export class CustomEvent extends Event {
  detail;
  constructor(type, options = {}) {
    super(type, options);
    this.detail = options.detail ?? null;
  }
}
export function createMouseEvent(type, options = {}) {
  return new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    ...options
  });
}
export function createKeyboardEvent(type, options = {}) {
  return new KeyboardEvent(type, {
    bubbles: true,
    cancelable: true,
    ...options
  });
}
export function createInputEvent(type, options = {}) {
  return new InputEvent(type, {
    bubbles: true,
    cancelable: true,
    ...options
  });
}
export function createTouchEvent(type, target, options = {}) {
  const touch = new Touch({ target, ...options });
  return new TouchEvent(type, {
    bubbles: true,
    cancelable: true,
    touches: [touch],
    targetTouches: [touch],
    changedTouches: [touch],
    ...options
  });
}
export function createDragEvent(type, options = {}) {
  return new DragEvent(type, {
    bubbles: true,
    cancelable: true,
    ...options
  });
}
export function createPointerEvent(type, options = {}) {
  return new PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    ...options
  });
}
export function createWheelEvent(type, options = {}) {
  return new WheelEvent(type, {
    bubbles: true,
    cancelable: true,
    ...options
  });
}
export function createFocusEvent(type, options = {}) {
  return new FocusEvent(type, {
    bubbles: type !== "focus" && type !== "blur",
    cancelable: false,
    ...options
  });
}
export function createClipboardEvent(type, options = {}) {
  return new ClipboardEvent(type, {
    bubbles: true,
    cancelable: true,
    ...options
  });
}
export function createCustomEvent(type, options = {}) {
  return new CustomEvent(type, {
    bubbles: true,
    cancelable: true,
    ...options
  });
}

export class ErrorEvent extends Event {
  message;
  filename;
  lineno;
  colno;
  error;
  constructor(type, options = {}) {
    super(type, options);
    this.message = options.message ?? "";
    this.filename = options.filename ?? "";
    this.lineno = options.lineno ?? 0;
    this.colno = options.colno ?? 0;
    this.error = options.error ?? null;
  }
}
export const eventTypes = {
  click: MouseEvent,
  dblclick: MouseEvent,
  mousedown: MouseEvent,
  mouseup: MouseEvent,
  mousemove: MouseEvent,
  mouseover: MouseEvent,
  mouseout: MouseEvent,
  mouseenter: MouseEvent,
  mouseleave: MouseEvent,
  contextmenu: MouseEvent,
  wheel: WheelEvent,
  keydown: KeyboardEvent,
  keyup: KeyboardEvent,
  keypress: KeyboardEvent,
  focus: FocusEvent,
  blur: FocusEvent,
  focusin: FocusEvent,
  focusout: FocusEvent,
  input: InputEvent,
  change: Event,
  beforeinput: InputEvent,
  compositionstart: CompositionEvent,
  compositionupdate: CompositionEvent,
  compositionend: CompositionEvent,
  drag: DragEvent,
  dragstart: DragEvent,
  dragend: DragEvent,
  dragenter: DragEvent,
  dragleave: DragEvent,
  dragover: DragEvent,
  drop: DragEvent,
  copy: ClipboardEvent,
  cut: ClipboardEvent,
  paste: ClipboardEvent,
  touchstart: TouchEvent,
  touchend: TouchEvent,
  touchmove: TouchEvent,
  touchcancel: TouchEvent,
  pointerdown: PointerEvent,
  pointerup: PointerEvent,
  pointermove: PointerEvent,
  pointerenter: PointerEvent,
  pointerleave: PointerEvent,
  pointerover: PointerEvent,
  pointerout: PointerEvent,
  pointercancel: PointerEvent,
  submit: SubmitEvent,
  reset: Event,
  load: Event,
  unload: Event,
  beforeunload: Event,
  DOMContentLoaded: Event,
  readystatechange: Event,
  resize: UIEvent,
  scroll: UIEvent,
  hashchange: HashChangeEvent,
  popstate: PopStateEvent,
  error: ErrorEvent
};
