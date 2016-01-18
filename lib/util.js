var crypto = require('crypto');

function encode(body, secretkey) {
    var codestr = [body.userID, body.machineID, body.profileID].join(',');
    var result = [];
    var cipher = crypto.createCipheriv('aes-256-ecb', secretkey, '');
    result.push(cipher.update(codestr, 'utf8', 'base64'));
    result.push(cipher.final('base64'))
    codestr = webSafeBase64Encode(result.join(''));
    return codestr;
}


function decode(authstr, secretkey) {
    var desafestr = webSafeBase64Decode(authstr);
    var decipher = crypto.createDecipheriv('aes-256-ecb', secretkey, '');
    var result = [];
    var len = 32;
    var resultStr = "";
    try {
        for (var i = 0; i < desafestr.length; i += len) {
            result.push(decipher.update(desafestr.substring(i, i + len), 'base64', 'utf8'));
        }
        result.push(decipher.final('utf8'));
        resultStr = result.join('');
    } catch (e) {
        console.error(e.toString())
        resultStr = "";
    }
    return resultStr;
}

function webSafeBase64Encode(buffer) {
    return buffer
        .replace(/\+/g, '-') // Convert '+' to '-'
        .replace(/\//g, '_') // Convert '/' to '_'
        .replace(/=+$/, ''); // Remove ending '='
}

function webSafeBase64Decode(encode) {
    // Add removed at end '='
    var base64 = encode
        .replace(/\-/g, '+') // Convert '-' to '+'
        .replace(/\_/g, '/'); // Convert '_' to '/'

    base64 += Array(5 - base64.length % 4).join('=');
    // base64 += Array(5 - base64.length % 4).join('=');
    return base64;
}

exports.encode = encode;
exports.decode = decode;
exports.webSafeBase64Encode = webSafeBase64Encode;
exports.webSafeBase64Decode = webSafeBase64Decode;

if (!module.parent) {
    var secret_key = "!$@EGAHAC&%1JHWQCVB$!FAZ1230$@#R";
    var encodestr = encode({
        userID: "user",
        machineID: "machine",
        profileID: "profile"
    }, secret_key);
    console.log(encodestr);
    var decode = decode(encodestr, secret_key);
    console.log(decode);
}