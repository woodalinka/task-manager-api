const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'nedalinka@gmail.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`
    })
}

const sendFarewellEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'nedalinka@gmail.com',
        subject: 'Sorry to see you go!',
        text: `Dear, ${name}. We are sorry to see you go. We would love to know what we could have done better to keep you as a customer.`
    })
}

module.exports = {sendWelcomeEmail, sendFarewellEmail}