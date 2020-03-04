import url from 'url'
import { createEngagementLink, resolveUserName, getCaseAccessPath } from './components/helpers'
import notificationEmailLayout from './components/notification-email-layout'

export default (assignee, notificationId, settingType, unitMeta, unitCreator, caseTitle, caseId, user, message) => {
  const casePath = getCaseAccessPath(assignee, caseId, unitMeta.bzId)

  const accessUrl = url.resolve(process.env.ROOT_URL, casePath)
// Function `createEngagementLink` is not working - see GH issue #26
// ---> Commenting out as a quick fix.
  // createEngagementLink({
  //   url: url.resolve(process.env.ROOT_URL, casePath),
  //   id: notificationId,
  //   email: assignee.emails[0].address
  // })
// END quickfix

  const optOutUrl = url.resolve(process.env.ROOT_URL, '/notification-settings')
// Function `createEngagementLink` is not working - see GH issue #26
// ---> Commenting out as a quick fix.
  // createEngagementLink({
  //   url: url.resolve(process.env.ROOT_URL, '/notification-settings'),
  //   id: notificationId,
  //   email: assignee.emails[0].address
  // })
// END quickfix

  return {
    subject: `New message on case ${caseTitle} in ${unitMeta.displayName} at ${unitMeta.streetAddress}`,
    ...notificationEmailLayout({
      typeTitle: 'New message on a case',
      user: assignee,
      mainContentHtml: `
        <p>New message by ${resolveUserName(user)}:</p>
        <p><strong>"${message}"</strong></p>
      `,
      mainContentText: `
        New message by ${resolveUserName(user)}:
        
        "${message}"
        
      `,
      reasonExplanation: 'you have a new message on a case',
      unitCreator,
      accessUrl,
      optOutUrl
    })
  }
}
