// META: global=window,dedicatedworker,sharedworker,serviceworker
// META: title=IDBIndex.count() - returns the number of records in the index
// META: script=resources/support.js
// @author Microsoft <https://www.microsoft.com>

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
};

open_rq.onsuccess = function(e) {
    const rq = db.transaction("store", "readonly", {durability: 'relaxed'})
                .objectStore("store")
                .index("index")
                .count();

    rq.onsuccess = t.step_func(function(e) {
        assert_equals(e.target.result, 10);
        t.done();
    });
};
