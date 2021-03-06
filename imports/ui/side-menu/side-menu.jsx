import React, { Component } from 'react'
import { Meteor } from 'meteor/meteor'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import PropTypes from 'prop-types'
import { createContainer } from 'meteor/react-meteor-data'
import { Link, Route, withRouter } from 'react-router-dom'
import Drawer from 'material-ui/Drawer'
import { logoutUser, setDrawerState } from '../general-actions'
import MenuItem from 'material-ui/MenuItem'
import FontIcon from 'material-ui/FontIcon'
import Divider from 'material-ui/Divider'
import { renderAppBarLeft, renderCurrUserAvatar } from '../util/app-bar-utils'
import { ReportIcon } from '../report/report-icon'

class SideMenu extends Component {
  linkDrawerItem = ({ href, iconName, iconRenderer, text, isExternal }, doHighlight = false) => {
    const { dispatch } = this.props
    return (
      <Link className='link' to={href} target={isExternal ? '_blank' : null}>
        <div className={doHighlight ? 'bg-very-light-gray' : ''}>
          <MenuItem onClick={isExternal ? undefined : () => dispatch(setDrawerState(false))}>
            <div className='flex items-center pv2 mv1'>
              <div className='w1-5 lh-title tc'>
                { iconName ? (<FontIcon className='material-icons' color='var(--mid-gray)'>{iconName}</FontIcon>) : (iconRenderer) }
              </div>
              <div className='ml4 mid-gray'>{text}</div>
            </div>
          </MenuItem>
        </div>
      </Link>
    )
  }

  routeDrawerItem = (path, options) => (
    <Route path={path} children={({ match }) =>
      this.linkDrawerItem(options, !!match)
    } />
  )

  render () {
    const { user, isDrawerOpen, dispatch } = this.props
    const supportEmailBody = user && `What were you trying to do?

### PLEASE FILL IN ###

What happened?

### PLEASE FILL IN ###

What should have happened?

### PLEASE FILL IN ###

Please insert any screenshots or error messages that might help us! 🙏

DEBUG INFO:
user: ${user.emails[0].address}`
    return user ? (
      <Drawer
        docked={false}
        width={300}
        open={isDrawerOpen}
        onRequestChange={(open) => dispatch(setDrawerState(open))}
      >
        <div className='bg-bondi-blue pv3'>
          <div className='ph3'>
            {renderAppBarLeft(() => dispatch(setDrawerState(true)))}
          </div>
          <MenuItem onClick={() => {
            dispatch(push('/account-settings'))
            dispatch(setDrawerState(false))
          }}>
            <div className='flex items-center mt4 pv1'>
              {renderCurrUserAvatar(user, true)}
              <div className='flex flex-column ml3 lh-copy'>
                <div className='white ellipsis'>
                  {user.profile && (user.profile.name || user.emails[0].address)}
                </div>
                <div className='mt2 bg-very-light-gray br1 bondi-blue lh-dbl tc fw5 f7 dib ph2 w-content'>
                  EDIT
                </div>
              </div>
            </div>
          </MenuItem>
        </div>
        {this.routeDrawerItem('/unit', {
          href: '/unit',
          iconName: 'beach_access',
          text: 'Policy Management'
        })}
        {/* {this.routeDrawerItem('/report', {
          href: '/report',
          iconRenderer: <ReportIcon isFinalized />,
          text: 'Inspection Reports'
        })} */}
        {this.routeDrawerItem('/case', {
          href: '/case',
          iconName: 'card_travel',
          text: 'Open Case'
        })}
        <Divider />
        {/* {this.linkDrawerItem({
          href: 'mailto:support@unee-t.com?subject=' + window.location.href + '&body=' + encodeURIComponent(supportEmailBody),
          iconName: 'live_help',
          text: 'Support',
          isExternal: true
        })} */}
        {this.linkDrawerItem({
          href: 'https://www.insure-chat.com/faq',
          iconName: 'help',
          text: 'FAQ',
          isExternal: true
        })}
        <Divider />
        <MenuItem onClick={() => dispatch(logoutUser())}>
          <div className='flex items-center pv2 mv1'>
            <div className='w1-5 lh-title tc'>
              <FontIcon className='icon-logout' color='var(--mid-gray)' />
            </div>
            <div className='ml4 mid-gray'>Logout</div>
          </div>
        </MenuItem>
      </Drawer>
    ) : null
  }
}

SideMenu.propTypes = {
  user: PropTypes.object,
  isDrawerOpen: PropTypes.bool
}

export default withRouter(connect(
  ({ drawerState }) => ({ isDrawerOpen: drawerState.isOpen }) // map redux state to props
)(createContainer(() => ({ // map meteor state to props
  user: Meteor.user()
}), SideMenu)))
