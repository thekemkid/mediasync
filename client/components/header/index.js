import React, { PropTypes, Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import * as Actions from '../../actions/Signin'

import { Navbar, Nav } from 'react-bootstrap'

function mapStateToProps (state) {
  return {
    user: state.signin.user
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(Actions, dispatch)
  }
}

export class Header extends Component {
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
          <li role='presentation'><Link to='/foo'>foo</Link></li>
          <li role='presentation'><Link to='/bar'>bar</Link></li>
          <li role='presentation'>
            <a className='point-at' onClick={() => {
              if (this.props.user) {
                this.props.actions.signout()
              } else {
                this.props.actions.signin({username: 'glen'})
              }
            }}>
              {this.props.user ? 'Signout' : 'Signin'}
            </a>
          </li>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
    )
  }
}

Header.propTypes = {
  user: PropTypes.object,
  actions: PropTypes.object.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(Header)