import { Email } from 'meteor/email'
import url from 'url'
import bugzillaApi from '../util/bugzilla-api'
import { footer } from '../ui/util/marketing'
import { logger } from '../util/logger'

const { callAPI } = bugzillaApi

export const invite = (user, invitedBy) => {
  try {
    const { accessToken, caseId, unitId, role: inviteeRole } = user.receivedInvites[0]
    const caseData = callAPI('get', `/rest/bug/${caseId}`, {}, true, true)
    const unitData = callAPI('get', `/rest/product/${unitId}`, {}, true, true)
    const caseTitle = caseData.data.bugs[0].summary
    const unitName = unitData.data.products[0].name.trim()
    const unitDesc = unitData.data.products[0].description.replace(/[\n\r]+/g, ' ').trim()
    const invitorUsername = invitedBy.profile.name
    const invitorEmailAddress = invitedBy.emails[0].address
    const invitorRole = unitData.data.products[0].components.find(
      ({ default_assigned_to: defAssigned }) => defAssigned === invitedBy.emails[0].address
    )
    const roleStr = invitorRole ? invitorRole.name : 'Administrator'

    Email.send({
      to: user.emails[0].address,
      from: process.env.FROM_EMAIL,
      replyTo: `${invitorUsername} <${invitorEmailAddress}>`,
      subject: `New Case: ${caseTitle}`,
      text: `Hi,

${invitorUsername || invitorEmailAddress},
the ${roleStr} for the insurance policy ${unitName}
${unitDesc}
Has invited you to collaborate on the case [${caseTitle}]
As the ${inviteeRole} for that claim.

Please click on the link to get more information about the case and reply to ${invitorUsername || 'him'}:
${url.resolve(process.env.ROOT_URL, `/invitation?code=${accessToken}`)}

${footer}
`,
           html: `<img src="cid:logo@unee-t.com" style='width: 100px' />

<p>Dear Sir/Madam,</p>
<p>
${invitorUsername || invitorEmailAddress}, the ${roleStr} for the policy:
<br>&#8226; Policy Number: <b>${unitName}</b>
<br>&#8226; Policy Name: ${unitDesc}
<br>Would like to invite you to collaborate on the case called: <b>${caseTitle}</b> as the <b>${inviteeRole}</b> link to that policy.
</p>
<p>
Please click on <a href=${url.resolve(process.env.ROOT_URL, `/invitation?code=${accessToken}`)}>this link</a> to get more information and join the discussion with ${invitorUsername || 'him'}.
<br>If the above link does not work, copy paste this in your browser: ${url.resolve(process.env.ROOT_URL, `/invitation?code=${accessToken}`)}
</p>
<p>Best regards,</p>
<p>Insure Team</p>
<a href="http://insure-chat.com/">http://insure-chat.com/</a>
`,
      attachments: [{
        path: 'https://case.dev.ins.unee-t.com/ic.png',
        cid: 'logo@unee-t.com'
      }]
    })
  } catch (e) {
    logger.info(e)
  }
}
