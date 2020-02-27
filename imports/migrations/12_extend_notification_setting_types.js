import { Meteor } from 'meteor/meteor'
import { Migrations } from 'meteor/percolate:migrations'

Migrations.add({
  version: 12,
  up: () => {
    Meteor.users.update({}, {
      $set: {
        'notificationSettings.caseUpdate_types': {
          'Next Step': true,
          'Solution': true,
          'Deadline': true,
          'StatusResolved': true
        },
        'notificationSettings.caseNewMessage_types': {
          'The Insurance Agent': true,
          'The HR / Employee Benefit manager': true,
          'The Policyholder/Beneficiary': true,
          'The Insurance company': true,
          'Other': true
        },
        'notificationSettings.severityOverrideThreshold': null
      }
    }, {
      multi: true
    })
  },
  down: () => {
    Meteor.users.update({}, {
      $unset: {
        'notificationSettings.caseUpdate_types': 1,
        'notificationSettings.caseNewMessage_types': 1,
        'notificationSettings.severityOverrideThreshold': 1
      }
    }, {
      multi: true
    })
  }
})
