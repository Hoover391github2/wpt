// META: global=window,dedicatedworker,sharedworker,serviceworker
// META: title=IDBIndex.count() - returns the number of records that have keys with the key
// META: script=resources/support.js
// @author Odin Hørthe Omdal <mailto:odinho@opera.com>

'use_strict';

let db;
const t = async_test();

const open_rq = createdb(t);

open_rq.onupgradeneeded = function(e) {
    db = e.target.result;
    const store = db.createObjectStore("store", { autoIncrement: true });
    store.createIndex("index", "indexedProperty");

    for(let i = 0; i < 10; i++) {
        store.add({ indexedProperty: "data" + i });
    }
}

open_rq.onsuccess = function(e) {
    const rq = db.transaction("store", "readonly", {durability: 'relaxed'})
               .objectStore("store")
               .index("index")
               .count(IDBKeyRange.bound('data0', 'data4'));

    rq.onsuccess = t.step_func(function(e) {
        assert_equals(e.target.result, 5);
        t.done();
    });
}
