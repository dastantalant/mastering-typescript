(() => {
    "use strict";

    const globalObj = typeof globalThis !== "undefined" ? globalThis :
        typeof global !== "undefined" ? global :
            typeof window !== "undefined" ? window : this;

    const c = {
        array: "#bada55",
        object: "#79c0ff",
        string: "#a5d6ff",
        number: "#79c0ff",
        boolean: "#ff9c9c",
        nil: "#999999",
        info: "#4ea1d3",
        success: "#bada55",
        warn: "#ff9c9c",
        error: "#ff6b6b"
    };

    const format = (v) => {
        if (Array.isArray(v)) {
            return [`%c[Array]`, `color:${c.array};font-weight:bold;background:#1e1e1e;padding:2px 6px;border-radius:4px`, v];
        }
        if (v && typeof v === "object" && !Array.isArray(v)) {
            return [`%c[Object]`, `color:${c.object};font-weight:bold;`, v];
        }
        if (typeof v === "string") return [`%c"${v}"`, `color:${c.string};`];
        if (v === null) return [`%cnull`, `color:${c.nil};font-style:italic;`];
        if (v === undefined) return [`%cundefined`, `color:${c.nil};font-style:italic;`];
        return [v];
    };

    const log = (...args) => {
        if (typeof process !== "undefined" && process.stdout) {
            const inspect = (v) => {
                if (Array.isArray(v)) return `Array ${require("util").inspect(v, { colors: true })}`;
                if (v && typeof v === "object") return `Object ${require("util").inspect(v, { colors: true, depth: null })}`;
                return require("util").inspect(v, { colors: true });
            };
            for (const a of args) console.log(inspect(a));
        } else {
            for (const a of args) console.log(...format(a));
        }
    };

    Object.assign(globalObj, {
        print: log,
        log: log,
        info: (...a) => console.log("Info", ...a),
        success: (...a) => console.log("Success", ...a),
        warn: (...a) => console.warn("Warning", ...a),
        error: (...a) => console.error("Error", ...a),
        time: (l = "Timer") => console.time(`Timer ${l}`),
        timeEnd: (l = "Timer") => console.timeEnd(`Timer ${l}`),
    });

    if (typeof module !== "undefined" && module.exports) {
        module.exports = { print, log, info, success, warn, error, time, timeEnd };
    }
})();