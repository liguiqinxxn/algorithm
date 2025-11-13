function Fn() {
    Fn.a = function () {
        console.log('3')
    }
    this.a = function () {
        console.log('2')
    }
}
Fn.prototype.a = function () {
    console.log('1')
}
Fn.a = function () {
    console.log('4')
}
Fn.a()
var obj = new Fn()
obj.a()
Fn.a()

// 4
// 2
// 3