/* jshint browser: true */
/* global QUnit: false, simpleStorage: false, asyncTest: false, expect: false,
   start: false, test: false, ok: false, deepEqual: false, equal: false */

QUnit.testStart(function() {
    "use strict";

    simpleStorage.flush();
});

QUnit.testDone(function() {
    "use strict";

    simpleStorage.flush();
});

module("general");

test("can use", function() {
    "use strict";

    ok(simpleStorage.canUse());
});

test("can not use", function() {
    "use strict";

    ok(simpleStorage.canUse());
});

test("flush/index", function() {
    "use strict";

    equal(simpleStorage.set("test", "value"), true);
    deepEqual(simpleStorage.index(), ["test"]);
    equal(simpleStorage.flush(), true);
    deepEqual(simpleStorage.index(), []);
    ok(!simpleStorage.get("test"));
});

module("keys");

test("missing", function() {
    "use strict";

    ok(typeof simpleStorage.get("test") == "undefined");
});

test("string", function() {
    "use strict";

    equal(simpleStorage.set("test", "value"), true);
    ok(simpleStorage.get("test") == "value");
});

test("boolean", function() {
    "use strict";

    equal(simpleStorage.set("test true", true), true);
    ok(simpleStorage.get("test true") === true);
    equal(simpleStorage.set("test false", false), true);
    ok(simpleStorage.get("test false") === false);
});

test("number", function() {
    "use strict";

    equal(simpleStorage.set("test", 10.01), true);
    ok(simpleStorage.get("test") === 10.01);
});

test("obejct", function() {
    "use strict";

    var testObj = {arr:[1,2,3]};
    equal(simpleStorage.set("test", testObj), true);
    deepEqual(simpleStorage.get("test"), testObj);
    ok(simpleStorage.get("test") != testObj);
});

test("deleteKey", function() {
    "use strict";

    deepEqual(simpleStorage.index(), []);
    equal(simpleStorage.set("test", "value"), true);
    deepEqual(simpleStorage.index(), ["test"]);
    equal(simpleStorage.deleteKey("test"), true);
    equal(simpleStorage.deleteKey("test"), false);
    deepEqual(simpleStorage.index(), []);
});

module("ttl");

asyncTest("TTL", function() {
    "use strict";

    expect(3);
    equal(simpleStorage.set("ttlkey", "value", {TTL: 500}), true);
    setTimeout(function(){
      ok(simpleStorage.get("ttlkey") == "value");
      setTimeout(function(){
          ok(typeof simpleStorage.get("ttlkey") == "undefined");
          start();
      }, 500);
    }, 250);
});

asyncTest("setTTL", function() {
    "use strict";

    expect(4);
    equal(simpleStorage.set("ttlkey", "value"), true);
    equal(simpleStorage.setTTL("ttlkey", 500), true);
    setTimeout(function(){
        ok(simpleStorage.get("ttlkey") == "value");
        setTimeout(function(){
            ok(typeof simpleStorage.get("ttlkey") == "undefined");
            start();
        }, 500);
    }, 250);
});

asyncTest("setTTL, negative value", function() {
    "use strict";

    expect(3);
    equal(simpleStorage.set("ttlkey", "value"), true);
    equal(simpleStorage.setTTL("ttlkey", -1), true);
    setTimeout(function(){
        ok(typeof simpleStorage.get("ttlkey") == "undefined");
        start();
    }, 250);
});

asyncTest("getTTL", function() {
    "use strict";

    expect(6);
    equal(simpleStorage.set("ttlkey", "value"), true);
    equal(simpleStorage.getTTL("ttlkey"), Infinity);
    equal(simpleStorage.setTTL("ttlkey", 500), true);
    setTimeout(function(){
        ok(simpleStorage.getTTL("ttlkey") > 0);
        setTimeout(function(){
            equal(simpleStorage.getTTL("ttlkey"), false);
            ok(typeof simpleStorage.get("ttlkey") == "undefined");
            start();
      }, 500);
    }, 250);
});

asyncTest("Clearing TTL removes meta object", function() {
    "use strict";

    expect(4);
    ok(!localStorage.simpleStorage);
    equal(simpleStorage.set("ttlkey", "value", {TTL: 100}), true);
    ok(JSON.parse(localStorage.simpleStorage).__simpleStorage_meta);
    setTimeout(function(){
        ok(!JSON.parse(localStorage.simpleStorage).__simpleStorage_meta);
        start();
    }, 200);
});
