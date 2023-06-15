//import { encode, decode } from "@msgpack/msgpack"

export default async (cmd, args) => {
    const req = await fetch("/api", { method: "POST", body: JSON.stringify({ [cmd]: args }), headers: {"Content-Type": "application/json"} })
    if (!req.ok) {
        var text = await req.text()
        try {
            var errdata = JSON.parse(text)
        } catch(e) {
            var err = Error("RPC failed: " + text)
            err.code = req.statusCode
            err.statusText = req.statusText
            throw err
        }
        var err = Error(errdata[Object.keys(errdata)[0]])
        err.type = Object.keys(errdata)[0]
        err.arg = errdata[Object.keys(errdata)[0]]
        throw err
    }
    const data = JSON.parse(await req.text())
    console.log(data)
    return data[Object.keys(data)[0]]
}