const {
    CaptchaGenerator
} = require('captcha-canvas')

module.exports = class Captcha {
    constructor(settings) {

        this.text = settings.defaultText || genCaptcha()
        this.opacity = settings.textSize || 60
        this.color = settings.textColor || '#0fcc7e' // Dark codes default color
        this.decoy = settings.decoyOpacity || 5
    }

    create() {

        let {
            text,
            opacity,
            color,
            decoy
        } = this

        let img = new CaptchaGenerator()
            .setDimension(150, 450)
            .setCaptcha({
                text: text,
                size: opacity,
                color: color
            })
            .setDecoy({
                opacity: decoy
            })
            .generateSync()
        return {
            image: img,
            text: text
        }
    }
}


const genCaptcha = () => {

    let length = 6,
        charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890",
        retVal = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}