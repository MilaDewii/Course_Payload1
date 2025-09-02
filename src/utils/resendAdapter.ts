import axios from 'axios'
import { EmailAdapter, SendEmailOptions } from 'payload'

const resendAdapter = (): EmailAdapter => {
  const adapter = () => ({
    name: 'resend',
    defaultFromAddress: process.env.RESEND_SENDER_EMAIL as string,
    defaultFromName: process.env.RESEND_SENDER_NAME as string,
    sendEmail: async (message: SendEmailOptions): Promise<unknown> => {
      if (!process.env.RESEND_EMAILS_ACTIVE) {
        console.log('Emails disabled, logging to console')
        console.log(message)
        return
      }

      try {
        const res = await axios({
          method: 'post',
          url: 'https://api.resend.com/emails',
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY as string}`,
            'Content-Type': 'application/json',
          },
          data: {
            from: `${process.env.RESEND_SENDER_NAME} <${process.env.RESEND_SENDER_EMAIL}>`,
            to: [message.to],
            subject: message.subject,
            html: message.html,
          },
        })

        return res.data
      } catch (error) {
        console.error('Error sending email with Resend', error)
      }
    },
  })

  return adapter
}

export default resendAdapter
