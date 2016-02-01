import React, { PropTypes, Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import Header from '../components/header/'
import Footer from '../components/footer/'
import * as AuthActions from '../actions/Auth'

var usersApi = require('../api/user.js')

export class App extends Component {
  render () {
    var that = this
    if (this.props.location.query && this.props.location.query.token) {
      console.log('token needs deserialisation')
      usersApi.me(this.props.location.query.token, function (err, me) {
        if (err) console.log(err)
        else {
          console.log('me', me)
          console.log('that', that)
          window.localStorage.setItem('mediasyncUser', JSON.stringify(me))
          that.props.authActions.signin(me)
          // that.props.history.pushState(null, '/')
        }
      })
    }

    return (
      <div>
        <Header />
        <div className='content'>
          {this.props.children}
          <div className='push'></div>
        </div>
        <Footer />
      </div>
    )
  }
}

App.propTypes = {
  location: PropTypes.object.isRequired,
  authActions: PropTypes.object.isRequired,
  children: PropTypes.element
}

export default connect(function () { return {} }, function (dispatch) {
  return {authActions: bindActionCreators(AuthActions, dispatch)}
})(App)
