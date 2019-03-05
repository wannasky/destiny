"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Two = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Two =
/*#__PURE__*/
function () {
  _createClass(Two, [{
    key: "say",
    value: function say() {
      return this.name;
    }
  }]);

  function Two(name) {
    _classCallCheck(this, Two);
  }

  return Two;
}();

exports.Two = Two;
//# sourceMappingURL=two.js.map