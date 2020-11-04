const Emitter = function () {
  this.events = {};
};

Emitter.prototype.register = function (name, fn) {
  Emitter.events[name] = fn;
};

Emitter.prototype.emit = function (name, args) {
  const fn = Emitter.events[name];
  fn.apply(this, args);
};

Emitter.prototype.remove = function (name) {
  delete Emitter.events[name];
};