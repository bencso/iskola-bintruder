// https://stackoverflow.com/a/61310115
export function rawRequest(txt, cb) {
    let x = new XMLHttpRequest(),
        lines = txt.split("\n"),
        methods = [
            "GET",
            "POST",
            "PATCH",
            "PUT",
            "DELETE",
            "HEAD",
            "OPTIONS"
        ],
        host, path, method, version, body = "", headers = {}
    lines.forEach((x, i) => {
        if (!x.includes(":")) {
            let ind;
            methods.forEach(m => {
                let tmpIndex = x.indexOf(m);

                if (tmpIndex > -1) {
                    if (!method) {
                        ind = tmpIndex;
                        let words = x.split(" ");
                        method = x.substring(
                            tmpIndex,
                            tmpIndex +
                            m.length
                        );
                        method = method && method.trim();
                        path = words.find((y, k) =>
                            y[0] === "/"
                        )
                        path = path && path.trim();
                        version = (
                            x
                                .replace(method, "")
                                .replace(path, "")
                        ).trim();
                    }

                }
            });
        } else {
            let indexOfSemiColon = x.indexOf(":");
            if (
                indexOfSemiColon > 0 &&
                indexOfSemiColon < x.length - 1
            ) {

                let key = x.substring(
                    0,
                    indexOfSemiColon
                ).trim(),
                    value = x.substring(
                        indexOfSemiColon + 1
                    ).trim();
                headers[key] = value;
                if (key.toLowerCase() == "host") {
                    host = value
                }
            }
        }
    });
    let inds = []
    txt.split(/\r?\n/).forEach((x, i) =>
        x === ""
        && inds.push(i)
    )
    let afterTwoLineBreaksIndex;
    inds.forEach((x, i) => {
        if (
            i < inds.length - 2 &&
            inds[i] === "" &&
            inds[i + 1] === ""
        ) {
            afterTwoLineBreaksIndex = i + 1;
        }
    });
    if (afterTwoLineBreaksIndex) {
        body = txt.substring(
            afterTwoLineBreaksIndex
        )
    }
    x.onreadystatechange = () => {
        if (x.readyState == 4 && x.status == 200) {
            if (cb) cb(x.response);
        }
    }
    if (host && path && method) {
        x.open(
            method,
            "http://" //don't know how to differentiate between http & https, if some1 could help out would be greate
            + host
            + path
        );

        for (let k in headers) {
            x.setRequestHeader(k, headers[k]);
        }

        x.send(body);
    }
    return {
        headers,
        body,
        method,
        host,
        path,
        version
    } //for testing just return all the values we found
}

// https://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format
if (!String.format) {
    String.format = function (format) {
        var args = Array.prototype.slice.call(arguments, 1);
        return format.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
                ? args[number]
                : match
                ;
        });
    };
}

//https://stackoverflow.com/a/4314050
if (!String.prototype.splice) {
    /**
     * {JSDoc}
     *
     * The splice() method changes the content of a string by removing a range of
     * characters and/or adding new characters.
     *
     * @this {String}
     * @param {number} start Index at which to start changing the string.
     * @param {number} delCount An integer indicating the number of old chars to remove.
     * @param {string} newSubStr The String that is spliced in.
     * @return {string} A new string with the spliced substring.
     */
    String.prototype.splice = function (start, delCount, newSubStr) {
        return this.slice(0, start) + newSubStr + this.slice(start + Math.abs(delCount));
    };
}