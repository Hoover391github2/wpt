// META: global=window,dedicatedworker,sharedworker,serviceworker
// META: title=IDBIndex.count() - throw DataError when using invalid key
// META: script=resources/support.js
// @author Intel <http://www.intel.com>

'use_strict';

let db;

createdb(async_test()).onupgradeneeded = function(e) {
    db = e.target.result

    const store = db.createObjectStore("store", { autoIncrement: true })
    store.createIndex("myindex", "idx")

    for (let i = 0; i < 10; i++)
        store.add({ idx: "data_" + (i%2) });

    store.index("myindex").count("data_0").onsuccess = this.step_func(function(e) {
        assert_equals(e.target.result, 5, "count(data_0)")
        this.done()
    });
}
