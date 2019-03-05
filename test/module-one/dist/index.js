"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IndexModule = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var IndexModule =
/*#__PURE__*/
function () {
  _createClass(IndexModule, [{
    key: "age",
    set: function set(value) {
      this._age = value;
    },
    get: function get() {
      return this._age;
    }
  }]);

  function IndexModule() {
    _classCallCheck(this, IndexModule);

    _defineProperty(this, "name", 'wannasky');

    _defineProperty(this, "_age", void 0);
  }

  return IndexModule;
}();

exports.IndexModule = IndexModule;
//# sourceMappingURL=index.js.map