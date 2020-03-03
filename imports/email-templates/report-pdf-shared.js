import { resolveUserName } from './components/helpers'
import url from 'url'
import { signaturefromhtml, signaturefromtext, learnmorehtml, learnmoretext } from '../ui/util/marketing'

export default (sender, senderRole, recipient, reportId, pdfUrl, reportTitle, unitName) => ({
  subject: `Inspection Report "${reportTitle}" for "${unitName}"`,
  html: `
    <div style='max-width: 400px'>
      <p>Hi ${resolveUserName(recipient)},</p>
      <p>
        <span style='font-weight: bold'>${resolveUserName(sender)} </span>
        (${senderRole}) has shared with you Inspection Report
        <span style='font-weight: bold'> "${reportTitle}" for ${unitName}</span>
      </p>
      <p>
        You may also view the inspection report here:<br />
        ${url.resolve(process.env.ROOT_URL, `/report/${reportId}/preview`)}
      </p>
${signaturefromhtml}
      <p>
         <img src="cid:logo@unee-t.com" style="width: 100px"/><br />
         ${learnmorehtml}
      </p>    
    </div>    
  `,
  text: `
Hi ${resolveUserName(recipient)},

${resolveUserName(sender)} has shared with you Inspection Report "${reportTitle}" for ${unitName}

--
${signaturefromtext}

${learnmoretext}
`,
  attachments: [
    {
      path: 'https://case.dev.ins.unee-t.com/ic.png',
      cid: 'logo@unee-t.com'
    },
    {
      path: pdfUrl
    }
  ]
})
