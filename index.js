const cheerio = require("cheerio")
const request = require("request")
const fs = require("fs")
const URL_BASE = 'https://hipsters.tech/'
const proxy = process.env.HTTP_PROXY || 'http://<user>:<password>@<host>:<port>/'
// class -> post-imagelink, powerpress_link_d
const getBody = (url) => {
    return new Promise((resolve, reject) => {
        request(url, { proxy }, (err, response, body) => {
            if (err) {
                reject(err)
            } else {
                resolve({ response, body })
            }
        })
    })
}

const $ = (body, select) => {
    const _$ = cheerio.load(body)
    return _$(select)
}
/**
 * 
 */
async function crawler() {
    try {
        const { response, body } = await getBody(URL_BASE)
        $(body, ".post-imagelink").map(async function (i, element) {
            const { response, body } = await getBody(element.attribs.href)
            const { href, download } = $(body, '.powerpress_link_d')[0].attribs
            request(href, { proxy })
                .on('error', (err) => console.error(err))
                .pipe(await fs.createWriteStream(`ep/${download}`))
        })
    } catch (err) {
        console.error(err)
    }
}

fs.exists(__dirname + '/ep', (exists) => {
    if (!exists) {
        fs.mkdir(__dirname + '/ep')
    }
})


console.time("With promise")
crawler()
console.timeEnd("With promise")