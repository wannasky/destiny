"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * test
 */
var Test =
/*#__PURE__*/
function () {
  _createClass(Test, [{
    key: "say",
    value: function say() {
      console.log('name:::', this.name);
    }
  }, {
    key: "age",
    // age
    set: function set(value) {
      this._age = value;
    },
    get: function get() {
      return this._age;
    }
  }]);

  function Test(name) {
    _classCallCheck(this, Test);

    _defineProperty(this, "_age", void 0);
  }

  return Test;
}();

var a = function a() {};

var test = new Test('wannasky');
test.say();
//# sourceMappingURL=index.js.map