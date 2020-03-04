import url from 'url'
import { createEngagementLink, getCaseAccessPath } from './components/helpers'
import notificationEmailLayout from './components/notification-email-layout'

export default (assignee, notificationId, settingType, unitMeta, unitCreator, caseTitle, caseId) => {
  const casePath = getCaseAccessPath(assignee, caseId, unitMeta.bzId)

  const optOutUrl = url.resolve(process.env.ROOT_URL, `/notification-settings`)
// Function `createEngagementLink` is not working - see GH issue #26
// ---> Commenting out as a quick fix.
  //   createEngagementLink({
  //   url: url.resolve(process.env.ROOT_URL, '/notification-settings'),
  //   id: notificationId,
  //   email: assignee.emails[0].address
  // })
// END quickfix

  const accessUrl = url.resolve(process.env.ROOT_URL, `casePath`)
// Function `createEngagementLink` is not working - see GH issue #26
// ---> Commenting out as a quick fix.
  //   createEngagementLink({
  //   url: url.resolve(process.env.ROOT_URL, casePath),
  //   id: notificationId,
  //   email: assignee.emails[0].address
  // })
// END quickfix

  return {
    subject: `Assigned to ${caseTitle} in ${unitMeta.displayName} at ${unitMeta.streetAddress}`,
    ...notificationEmailLayout({
      typeTitle: 'Case Assigned',
      user: assignee,
      mainContentHtml: `
        <p>You have been assigned to <strong>${caseTitle}</strong> in ${unitMeta.displayName}.</p>
      `,
      mainContentText: `
        You have been assigned to "${caseTitle}" in ${unitMeta.displayName} at ${unitMeta.streetAddress}.
      `,
      reasonExplanation: 'you have been assigned to a case',
      unitCreator,
      accessUrl,
      optOutUrl
    })
  }
}
