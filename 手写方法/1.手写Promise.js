// 定义 Promise 的三种状态
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

// 简易 Promise 实现
class MyPromise {
  constructor(executor) {
    // 初始化状态和值
    this.status = PENDING;
    this.value = undefined;
    this.reason = undefined;
    
    // 存储成功的回调函数
    this.onFulfilledCallbacks = [];
    // 存储失败的回调函数
    this.onRejectedCallbacks = [];
    
    // 成功时调用的方法
    const resolve = (value) => {
      // 只有在 pending 状态才能改变状态
      if (this.status === PENDING) {
        this.status = FULFILLED;
        this.value = value;
        
        // 执行所有成功的回调
        this.onFulfilledCallbacks.forEach(fn => fn());
      }
    };
    
    // 失败时调用的方法
    const reject = (reason) => {
      // 只有在 pending 状态才能改变状态
      if (this.status === PENDING) {
        this.status = REJECTED;
        this.reason = reason;
        
        // 执行所有失败的回调
        this.onRejectedCallbacks.forEach(fn => fn());
      }
    };
    
    // 立即执行 executor 函数
    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }
  
  // then 方法
  then(onFulfilled, onRejected) {
    // 处理参数不是函数的情况
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
    onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason; };
    
    // 返回一个新的 Promise 实现链式调用
    const promise2 = new MyPromise((resolve, reject) => {
      if (this.status === FULFILLED) {
        // 使用 setTimeout 模拟异步，确保 promise2 已经创建
        setTimeout(() => {
          try {
            const x = onFulfilled(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        }, 0);
      }
      
      if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            const x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        }, 0);
      }
      
      if (this.status === PENDING) {
        // 如果还是 pending 状态，将回调函数存储起来
        this.onFulfilledCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onFulfilled(this.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          }, 0);
        });
        
        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onRejected(this.reason);
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          }, 0);
        });
      }
    });
    
    return promise2;
  }
  
  // catch 方法
  catch(onRejected) {
    return this.then(null, onRejected);
  }
  
  // finally 方法
  finally(callback) {
    return this.then(
      value => MyPromise.resolve(callback()).then(() => value),
      reason => MyPromise.resolve(callback()).then(() => { throw reason; })
    );
  }
  
  // 静态 resolve 方法
  static resolve(value) {
    if (value instanceof MyPromise) {
      return value;
    }
    
    return new MyPromise(resolve => {
      resolve(value);
    });
  }
  
  // 静态 reject 方法
  static reject(reason) {
    return new MyPromise((resolve, reject) => {
      reject(reason);
    });
  }
}

// 处理 Promise 解析过程的辅助函数
function resolvePromise(promise2, x, resolve, reject) {
  // 如果 promise2 和 x 相同，抛出 TypeError
  if (promise2 === x) {
    return reject(new TypeError('Chaining cycle detected for promise'));
  }
  
  let called = false; // 防止多次调用
  
  if ((typeof x === 'object' && x !== null) || typeof x === 'function') {
    try {
      const then = x.then;
      
      // 如果 then 是函数，认为 x 是 Promise
      if (typeof then === 'function') {
        then.call(
          x,
          y => {
            if (called) return;
            called = true;
            resolvePromise(promise2, y, resolve, reject);
          },
          r => {
            if (called) return;
            called = true;
            reject(r);
          }
        );
      } else {
        // 如果 then 不是函数，直接 resolve
        resolve(x);
      }
    } catch (error) {
      if (called) return;
      called = true;
      reject(error);
    }
  } else {
    // 如果 x 是普通值，直接 resolve
    resolve(x);
  }
}

// 测试示例
console.log('开始测试 MyPromise');

// 测试基本功能
new MyPromise((resolve, reject) => {
  console.log('executor 执行');
  resolve('成功');
}).then(
  value => {
    console.log('onFulfilled:', value);
    return '链式调用';
  },
  reason => {
    console.log('onRejected:', reason);
  }
).then(value => {
  console.log('链式调用结果:', value);
});

// 测试异步
console.log('测试异步');
const asyncPromise = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    console.log('异步执行完成');
    resolve('异步成功');
  }, 1000);
});

asyncPromise.then(value => {
  console.log('异步结果:', value);
});

// 测试静态方法
MyPromise.resolve('静态 resolve').then(value => {
  console.log('静态 resolve 结果:', value);
});

MyPromise.reject('静态 reject').catch(reason => {
  console.log('静态 reject 结果:', reason);
});