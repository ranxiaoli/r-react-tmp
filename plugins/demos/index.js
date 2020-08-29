// Tapable 用法
const {
  SyncHook,
  SyncBailHook,
  SyncWaterfallHook,
  SyncLoopHook,
  AsyncParallelHook,
  AsyncParallelBailHook,
  AsyncSeriesHook,
  AsyncSeriesBailHook,
  AsyncSeriesWaterfallHook
} = require("tapable");

// 1、new Hook 新建钩子
const hook1 = new SyncHook(["arg1", "arg2", "arg3"])

// 2、使用tap\tapAsync\tapPromise绑定钩子
hook1.tap('hook1', (arg1, arg2, arg3) => console.log(arg1, arg2, arg3))

// 3、call\callAsync 执行绑定事件
hook1.call(1, 2, 3)

/**
 * 举个栗子
 定义一个Car方法，
 在内部hooks上新建钩子。
 分别是同步钩子 accelerate、break（accelerate接受一个参数）、
   异步钩子calculateRoutes
 使用钩子对应的绑定和执行方法
 calculateRoutes使用tapPromise可以返回一个promise对象。
 */

class Car {
  constructor() {
    this.hooks = {
      accelerate: new SyncHook(),
      break: new SyncHook(['arg1']),
      calculateRoutes: new AsyncParallelHook(["source", "target", "routesList"])
    }
  }
}

const myCar = new Car();

myCar.hooks.accelerate.tap("WarningLampPlugin", () => console.log('WarningLampPlugin'))
myCar.hooks.break.tap("LoggerPlugin", newSpeed => console.log(`Accelerating to ${newSpeed}`))
myCar.hooks.calculateRoutes.tapPromise("calculateRoutes tapPromise",
  (source, target, routesList, callback) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log(`tapPromise to ${source}${target}${routesList}`)
        resolve();
      }, 1000)
    })
})

// calculateRoutes也可以使用tapAsync绑定钩子，注意：此时用callback结束异步回调
myCar.hooks.calculateRoutes.tapAsync("calculateRoutes tapAsync", (source, target, routesList, callback) => {
    // return a promise
    setTimeout(() => {
        console.log(`tapAsync to ${source}${target}${routesList}`)
        callback();
    }, 2000)
});

myCar.hooks.calculateRoutes.callAsync('i', 'like', 'tapable', err => {
    console.timeEnd('cost');
    if(err) console.log(err)
})

//执行同步钩子
myCar.hooks.break.call();
myCar.hooks.accelerate.call('hello');

console.time('cost');

//执行异步钩子
myCar.hooks.calculateRoutes.promise('i', 'love', 'tapable').then(() => {
    console.timeEnd('cost');
}, err => {
    console.error(err);
    console.timeEnd('cost');
})
