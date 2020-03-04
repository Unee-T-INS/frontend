import url from 'url'
import { createEngagementLink, getCaseAccessPath } from './components/helpers'
import notificationEmailLayout from './components/notification-email-layout'

export default (invitee, notificationId, settingType, unitMeta, unitCreator, caseTitle, caseId) => {
  const casePath = getCaseAccessPath(invitee, caseId, unitMeta.bzId)

  const optOutUrl = url.resolve(process.env.ROOT_URL, `/notification-settings`)
// Function `createEngagementLink` is not working - see GH issue #26
// ---> Commenting out as a quick fix.
  // createEngagementLink({
  //   url: url.resolve(process.env.ROOT_URL, '/notification-settings'),
  //   id: notificationId,
  //   email: invitee.emails[0].address
  // })
// END quickfix

  const accessUrl =  url.resolve(process.env.ROOT_URL, `casePath`)
// Function `createEngagementLink` is not working - see GH issue #26
// ---> Commenting out as a quick fix.
  // createEngagementLink({
  //   url: url.resolve(process.env.ROOT_URL, casePath),
  //   id: notificationId,
  //   email: invitee.emails[0].address
  // })
// END quickfix

  return {
    subject: `Collaborate on "${caseTitle}"`,
    ...notificationEmailLayout({
      typeTitle: 'Collaborate on case',
      user: invitee,
      mainContentHtml: `
        <p>
          You've been invited to collaborate on the case <strong>${caseTitle}</strong> in ${unitMeta.displayName} at ${unitMeta.streetAddress}.
        </p>  
      `,
      mainContentText: `
        You've been invited to collaborate on the case ${caseTitle} in ${unitMeta.displayName} at ${unitMeta.streetAddress}.
      `,
      reasonExplanation: 'you have been invited to collaborate on a case',
      unitCreator,
      optOutUrl,
      accessUrl
    })
  }
}
