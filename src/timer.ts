/*
 * Timer.src: A periodic timer for Node.src and the browser.
 *
 * Copyright (c) 2012 Arthur Klepchukov, Jarvis Badgley, Florian Schäfer
 * Licensed under the BSD license (BSD_LICENSE.txt)
 *
 * Version: 0.0.1
 *
 */

let  millisecondsToTicks = function(milliseconds:number, resolution:number) {
    return milliseconds / resolution
};

class Timer {
    private _notifications: any[];
    private _resolution: number;
    private _running: boolean;
    private _ticks: number;
    private _timer: any;
    private _drift: number;
    constructor(resolution:number) {

        this._notifications = [];
        this._resolution = resolution
        this._running = false;
        this._ticks = 0;
        this._timer = null;
        this._drift = 0;
    }

    start():Timer {
        let self = this;
        if (!this._running) {
            this._running = !this._running;
            setTimeout(function loopsyloop() {
                self._ticks++;
                for (var i = 0, l = self._notifications.length; i < l; i++) {
                    if (self._notifications[i] && self._ticks % self._notifications[i].ticks === 0) {
                        self._notifications[i].callback.call(self._notifications[i], {
                            ticks: self._ticks,
                            resolution: self._resolution
                        });
                    }
                }
                if (self._running) {
                    self._timer = setTimeout(loopsyloop, self._resolution + self._drift);
                    self._drift = 0;
                }
            }, this._resolution + this._drift);
            this._drift = 0;
        }
        return this;
    }

    stop() {
        if (this._running) {
            this._running = !this._running;
            clearTimeout(this._timer);
        }
        return this;
    }

    reset() {
        this.stop();
        this._ticks = 0;
        return this;
    }

    clear() {
        this.reset();
        this._notifications = [];
        return this;
    }

    ticks() { return this._ticks; }

    resolution() { return this._resolution }

    running() { return this._running }

    bind(when:number, callback:any) {
        if (when && callback) {
            var ticks = millisecondsToTicks(when, this._resolution);
            this._notifications.push({
                ticks: ticks,
                callback: callback
            });
        }
        return this;
    }

    unbind(callback:any) {
        if (!callback) {
            this._notifications = [];
        } else {
            for (var i = 0, l = this._notifications.length; i < l; i++) {
                if (this._notifications[i] && this._notifications[i].callback === callback) {
                    this._notifications.splice(i, 1);
                }
            }
        }
        return this;
    }

    drift(timeDrift:number) {
        this._drift = timeDrift;
        return this;
    }
}

//
// Timer.prototype.every = Timer.prototype.bind;
// Timer.prototype.after = function (when, callback) {
//     var self = this;
//     Timer.prototype.bind.call(self, when, function fn () {
//         Timer.prototype.unbind.call(self, fn);
//         callback.apply(this, arguments);
//     });
//     return this;
// };

export default Timer;
