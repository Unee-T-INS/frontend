import url from 'url'
import { resolveUserName } from './components/helpers'

export default (
  { invitee, invitor, inviteeRoleType, invitorRoleType, unitTitle, unitDescription, unitAddress, accessToken }
) => {
  const accessLink = url.resolve(process.env.ROOT_URL, `/invitation?code=${accessToken}`)
  // const accessLink = createEngagementLink({
  //   url: url.resolve(process.env.ROOT_URL, `/invitation?code=${accessToken}`),
  //   email: invitee.emails[0].address
  // })
  const inviteeName = resolveUserName(invitee)
  const invitorName = resolveUserName(invitor)
  return {
    subject: `Invitation from ${invitorName} to collaborate on the policy "${unitTitle}"`,
    html: `<img src="cid:logo@unee-t.com" style="width: 100px"/>
<p>Hi ${inviteeName},</p>
<p>
  You've been invited by <strong>${invitorName}</strong> (the <strong>${invitorRoleType}</strong>) to Insure Chat to collaborate on the policy: <br />
  <strong>${unitTitle}:</strong><br/>
  ${unitDescription}
</p>
<p>
  Your assigned role is <strong>${inviteeRoleType}</strong><br />
  This invitation allows you to create cases for any issue in this policy.<br />
  You can also create inspection reports.
</p>
<br />Please click on <a href='${accessLink}'>this link</a> to access the policy in Insure Chat.
<br /><br /><small>If the above link does not work, copy & paste this in your browser: ${accessLink}</small>

`,
    text: `Hi ${inviteeName},

You've been invited by ${invitorName} (the ${invitorRoleType}) to Insure Chat to collaborate on the policy:

${unitTitle}:

${unitDescription}

Your assigned role is "${inviteeRoleType}"

This invitation allow you to create cases for any issue in this policy.

You can also create inspection reports.

Please follow ${accessLink} to participate.

`,
    attachments: [{
      path: 'https://case.dev.ins.unee-t.com/ic.png',
      cid: 'logo@unee-t.com'
    }]
  }
}
