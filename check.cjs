// Lightweight playback logic checks; run with node innerfrench/check.cjs.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
class Element {
  constructor() { this.children = []; this.events = {}; this.attrs = {}; this.checked = false; this.currentTime = 0; this.duration = 1800; this.paused = true; this.playbackRate = 1; this.classList = {add(){},remove(){},toggle(){}}; }
  append(...items) { this.children.push(...items); }
  setAttribute(k,v) { this.attrs[k] = v; }
  getAttribute(k) { return this.attrs[k]; }
  removeAttribute(k) { delete this.attrs[k]; }
  addEventListener(k,fn) { this.events[k] = fn; }
  scrollIntoView() {}
  async play() { this.paused = false; this.events.play?.(); }
}
const elements = {};
const get = id => elements[id] ||= new Element();
get('english').checked = true;
get('follow').checked = true;
const document = {getElementById:get, createElement:()=>new Element(),body:new Element(),addEventListener(){}};
const context = vm.createContext({document, window:{addEventListener(){}}, localStorage:{getItem:()=>null,setItem(){}}, console});
for(const name of ['transcript.js','app.js']) vm.runInContext(fs.readFileSync(`${__dirname}/${name}`,'utf8'),context);
assert.equal(get('passages').children.length,46);
assert.equal(get('position').textContent,'Passage 1 / 46');
get('audio').currentTime = 16; get('audio').events.timeupdate();
assert.equal(get('position').textContent,'Passage 3 / 46');
get('next').onclick(); assert.equal(get('audio').currentTime,34);
get('previous').onclick(); assert.equal(get('audio').currentTime,16);
get('loop').checked = true; get('audio').paused = false;
get('audio').currentTime = 34.1; get('audio').events.timeupdate();
assert.equal(get('audio').currentTime,16);
get('loop').checked = false;
get('audio').currentTime = 1700; get('audio').events.seeking();
assert.equal(get('position').textContent,'Passage 46 / 46');
assert.equal(get('next').disabled,true);
get('loop').checked = true; get('audio').events.ended();
assert.equal(get('audio').currentTime,1648);
get('speed').value = '0.8'; get('speed').onchange(); assert.equal(get('audio').playbackRate,0.8);
console.log('Passed: 46 passages, timestamp boundaries, seeking, previous/next, passage looping, final-passage looping and speed.');
