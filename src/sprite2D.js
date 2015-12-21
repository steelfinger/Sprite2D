(function (window, document, undefined) {
    "use strict";

    if (!window.Sprite2D) {

        window.Sprite2D = (function () {

            /* STATIC VARIABLES */
            var _transform = getSupportedTransform();
            var _instances = [];
            var _defaultProps = {
                "translateX": 0, "translateY": 0,
                "scaleX": 1, "scaleY": 1,
                "skewX": 0, "skewY": 0,
                "rotate": 0,
                "opacity": 1
            };

            /* CONSTRUCTOR */
            function Sprite2D(element, init) {
                this._element = element;
                this._changed = [];
                this.origin = {x: 0.5, y: 0.5};
                _instances.push(this);
                if (!init) init = {};
                this._defaults = Object.assign(_defaultProps, init);

                for (var prop in this._defaults) {
                    addProperty(prop, this._defaults[prop]);
                }

                Sprite2D.prototype.setOrigin.call(this);
                Sprite2D.prototype.update.call(this, true);

                function addProperty(name, defaultValue) {
                    var _name = "_" + name;
                    //set default value (1 for scale, 0 for other properties)
                    this[_name] = defaultValue;
                    Object.defineProperty(Sprite2D.prototype, name, {
                        get: function () {
                            return this[_name];
                        },
                        set: function (value) {
                            if (this[_name] !== value && typeof value === "number") {
                                this[_name] = value;
                                if (this._changed.indexOf(name) === -1) {
                                    this._changed.push(name);
                                }
                            }
                        }
                    });
                }
            }

            Sprite2D.prototype = {
                update: function (force) {

                    if (this._changed.length && force === true) {
                        this._changed.length = 0;

                        var rot_rad = -this["_rotate"] * Math.PI / 180,
                            cos = Math.cos(rot_rad),
                            sin = Math.sin(rot_rad),
                            m = [this["_scaleX"] * cos, //cos
                                this["_scaleY"] * -sin,  //-sin
                                this["_scaleX"] * sin, //sin
                                this["_scaleY"] * cos, //cos
                                this["translateX"],
                                this["translateY"];

                        if (this["_skewX"] || this["_skewY"]) {
                            var skew_x_tan = Math.tan(this["_skewX"] * Math.PI / 180);
                            var skew_y_tan = Math.tan(this["_skewY"] * Math.PI / 180);
                            var sm = [m[0] + skew_y_tan * m[2],
                                m[1] + skew_y_tan,
                                skew_x_tan * m[0] + m[2],
                                skew_x_tan * m[1] + m[3]];
                            m[0] = sm[0];
                            m[1] = sm[1];
                            m[2] = sm[2];
                            m[3] = sm[3];
                        }

                        this._element.style.opacity = this["_opacity"].toFixed(3);
                        this._element.style[_transform] = "matrix(" + m[0].toFixed(5) + ", " + m[1].toFixed(5) + ", " + m[2].toFixed(5) + ", " + m[3].toFixed(5) + ", " + m[4].toFixed(5) + " , " + m[5].toFixed(5) + ")";
                    }
                    /*
                     //IE8+ - must be on one line, unfortunately
                     -ms-filter: "progid:DXImageTransform.Microsoft.Matrix(M11=" + m[0].toFixed(3) + ", M12=" + m[1].toFixed(3) + ", M21=" + m[2].toFixed(3) + ", M22=" + m[3].toFixed(3) + ", SizingMethod='auto expand')";
                     * */

                },
                setOrigin: function (point) {
                    if (point) {
                        this.origin.x = point.x;
                        this.origin.y = point.y;
                    }
                    this._element.style[_transform + "Origin"] = Math.round(this.origin.x * 100) + "% " + Math.round(this.origin.y * 100) + "%";
                }
            };

            Sprite2D.getAll = function () {
                return _instances.slice();
            };

            Sprite2D.updateAll = function (force) {
                force = force ? true : false;
                var i_max = _instances.length;
                for (var i = 0; i < i_max; i++) {
                    _instances[i].update(force);
                }
            };

            Sprite2D.getSupportedTransform = getSupportedTransform;

            function getSupportedTransform() {
                var prefixes = ["transform", "WebkitTransform", "MozTransform", "OTransform", "msTransform"];
                var div = document.createElement('div');
                for (var i = 0; i < prefixes.length; i++) {
                    if (div.style[prefixes[i]] !== undefined) {
                        return prefixes[i];
                    }
                }
                return null;
            }

            return Sprite2D;

        })();
    }

})(window, document);
