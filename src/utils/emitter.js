function uuid() {
  let d = new Date().getTime();
  // eslint-disable-next-line no-underscore-dangle
  const _uuid = 'xxxxxxxxxxxxyxxx'.replace(/[xy]/g, (c) => {
    // eslint-disable-next-line no-bitwise
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    // eslint-disable-next-line no-bitwise
    return (c === 'x' ? r : (r & 0x7) | 0x8).toString(16);
  });
  return _uuid;
}

export default class Emitter {
  events = {};

  on(name, handler) {
    const { events } = this;
    if (!events[name]) {
      this.events[name] = { list: [] };
    }
    const token = uuid();
    this.events[name].list.push({
      token,
      handler,
    });
    return token;
  }

  emit(name, data, token) {
    const event = this.events[name];
    if (!event) {
      return false;
    }
    if (token) {
      const ret = event.list.find((item) => item.token === token);
      if (ret) {
        ret.handler.call(this, data);
      }
    } else {
      event.list.forEach((item) => {
        item.handler.call(this, data);
      });
    }
    if (event.once) {
      delete this.events[name];
    }
  }

  off(name, token) {
    const event = this.events[name];
    if (!event) {
      return false;
    }
    if (token) {
      const index = event.list.findIndex((item) => item.token === token);
      this.events[name].list.splice(index, 1);
    } else {
      delete this.events[name];
    }
  }

  once(name, handler) {
    const { events } = this;
    if (!events[name]) {
      this.events[name] = { list: [], once: true };
    }
    const token = uuid();
    this.events[name].list.push({
      token,
      handler,
    });
    return token;
  }
}
