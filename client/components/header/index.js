import React, { PropTypes, Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import * as AuthActions from '../../actions/Auth'
import * as SigninActions from '../../actions/Signin'
import * as ProfileActions from '../../actions/Profile'
import { default as SignInPanel } from '../signin'

import { Navbar, Nav, OverlayTrigger, Popover, NavDropdown, Tooltip } from 'react-bootstrap'
import { routerActions } from 'react-router-redux'
// var userApi = require('../../api/user.js')

function mapStateToProps (state) {
  return {
    user: state.auth.user,
    selectedSigninPanel: state.signin.navSelected,
    signinErrors: state.signin.navErrorTracker
  }
}

function mapDispatchToProps (dispatch, ownProps) {
  return {
    routeActions: bindActionCreators(routerActions, dispatch),
    authActions: bindActionCreators(AuthActions, dispatch),
    signinActions: bindActionCreators(SigninActions, dispatch),
    viewProfile: bindActionCreators(ProfileActions, dispatch).view
  }
}

export class Header extends Component {
  createARoom (e) {
    e.preventDefault()
    this.props.routeActions.push('/createroom')
  }

  render () {
    return (
    <Navbar inverse fixedTop fluid className='my-nav'>
      <Navbar.Header>
        <Navbar.Brand>
          <Link to='/'>
            <img height='25px' width='auto' src='/assets/images/logo.png' />
          </Link>
        </Navbar.Brand>
        <Navbar.Toggle/>
      </Navbar.Header>
      <Navbar.Collapse>
        <Nav pullRight>
          <li role='presentation'>
            {
              this.props.user && this.props.user.emailValidated
              ? <button type='button' className='btn btn-primary navbar-btn' onClick={this.createARoom.bind(this)}>Create A Room</button>
              : <OverlayTrigger
                  overlay={<Tooltip id={55}>You must be signed in with an account with a verified email to create a room.</Tooltip>} placement='bottom'
                  delayShow={300} delayHide={150}
                >
                  <button type='button' className='btn btn-primary navbar-btn disabled'>Create A Room</button>
                </OverlayTrigger>
            }
          </li>
          <li role='presentation'><Link to='/findroom'>Find A Room</Link></li>
          {
            this.props.user
            ? <NavDropdown className='point-at' eventKey={1} title={this.props.user.username} id='basic-nav-dropdown'>
                  <li><Link to={'/profile/' + this.props.user.username}>Profile</Link></li>
                  <li><Link to='/settings'>Settings</Link></li>
              </NavDropdown>
            : void (0)
          }
          <li role='presentation'>
            {
              this.props.user
              ? <a className='point-at' onClick={() => { this.props.authActions.signout(); this.props.routeActions.push('/') }}>
                  Signout
                </a>
              : <OverlayTrigger container={this} trigger='click' rootClose placement='bottom'
                    overlay={
                        <Popover className='nav-signin' id={2}>
                              <SignInPanel selected={this.props.selectedSigninPanel}
                                    handleSignIn={this.props.authActions.signin}
                                    handleSelect={this.props.signinActions.navHandleSelect}
                                    errorTracker={this.props.signinErrors}
                                    handleError={this.props.signinActions.navHandleError}
                                    />
                        </Popover>
                      }>
                <a className='hidden-xs point-at'>Signin</a>
              </OverlayTrigger>
            }
          </li>
          {
            this.props.user
            ? void (0)
            : <NavDropdown className='visible-xs point-at' eventKey={3} title='Signin' id='basic-nav-dropdown'>
                  <li><Link to='/signin'>signin</Link></li>
                  <li><Link to='/signup'>signup</Link></li>
              </NavDropdown>
          }
        </Nav>
      </Navbar.Collapse>
    </Navbar>
    )
  }
}

Header.propTypes = {
  user: PropTypes.object,
  routeActions: PropTypes.object,
  authActions: PropTypes.object.isRequired,
  selectedSigninPanel: PropTypes.number.isRequired,
  signinActions: PropTypes.object.isRequired,
  viewProfile: PropTypes.func.isRequired,
  signinErrors: PropTypes.object.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(Header)
