import Timer from "../src/timer"
import { performance } from "perf_hooks"
import { test, suite } from "uvu"
import * as assert from "uvu/assert"

const timerSuite = suite("When testing Timer functionality")
timerSuite("should create a Timer and use it", async function (done){
    let t = new Timer(10)
    assert.ok(t)
    assert.is(t.running(), false)
    let end
    t.bind(3000, function (){
        end = performance.now()
        t.stop()
        assert.ok(end>3000, `${end} is not above 3000`)
        assert.ok(end<3100, `${end} is not below 3100`)
    })
    let start = performance.now()
    t.start()
    // done
})
// timerSuite.run()