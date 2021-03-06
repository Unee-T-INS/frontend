import React from 'react'

import themes from '../ui/components/user-themes.mss'
import UserAvatar from '../ui/components/user-avatar'

export const rolesColorDict = {
  'Administrator': 'theme1',
  'The Insurance Agent': 'theme2',
  'The HR / Employee Benefit manager': 'theme3',
  'The Policyholder/Beneficiary': 'theme4',
  'The Insurance company': 'theme5',
  'Other': 'theme6',
  'default': 'theme1'
}

export const getColorForUser = (user) => (
  themes[ rolesColorDict[ user.role && user.role.trim() ] || rolesColorDict[ 'default' ] ]
)

export const userInfoItem = (user, rightRenderer, subInfoRenderer) => {
  const colorForUser = getColorForUser(user)

  return (
    <div key={user.login} className={colorForUser + ' flex items-center pt2'}>
      <UserAvatar user={user} imageUrl={user.avatarUrl} />
      <div className='ml2 pl1 flex-grow overflow-hidden'>
        <div className='mid-gray ellipsis'>{user.name || user.login.split('@')[0]}</div>
        <div className='f7 gray ellipsis lh-copy'>
          {user.role ? (user.role + (user.isOccupant ? ' (Occupant)' : '')) : 'Administrator'}
          {subInfoRenderer && (
            <br />
          )}
          {subInfoRenderer && subInfoRenderer(user)}
        </div>
      </div>
      {rightRenderer && rightRenderer(user)}
    </div>
  )
}
