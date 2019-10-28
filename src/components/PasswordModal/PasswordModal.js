import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import Button from 'components/Button';

import getClassName from 'helpers/getClassName';
import actions from 'actions';
import selectors from 'selectors';

import './PasswordModal.scss';

// a callback that will be set when loadDocument is called to load a password protected PDF
let checkPassword;

class PasswordModal extends React.PureComponent {
  static propTypes = {
    isOpen: PropTypes.bool,
    attempt: PropTypes.number.isRequired,
    t: PropTypes.func.isRequired,
    closeElement: PropTypes.func.isRequired,
  };

  constructor() {
    super();
    this.maxAttempts = 3;
    this.passwordInput = React.createRef();
    this.initialState = {
      password: '',
      userCanceled: false,
    };
    this.state = this.initialState;
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.isOpen && this.props.isOpen) {
      this.props.closeElement('progressModal');
    }
    if (prevProps.isOpen && !this.props.isOpen) {
      // when a user enters the correct password or calls core.closeDocument
      // reset state in case user loads another password-protected document
      this.setState(this.initialState);
    }
    if (this.passwordInput.current) {
      this.passwordInput.current.focus();
    }
  }

  handleInputChange = e => {
    this.setState({ password: e.target.value });
  };

  handleSubmit = e => {
    e.preventDefault();

    checkPassword(this.state.password);
  };

  handleCancel = () => {
    this.setState({ userCanceled: true });
  };

  renderContent = () => {
    const userExceedsMaxAttempts = this.props.attempt === this.maxAttempts;

    if (userExceedsMaxAttempts) {
      return this.renderMaxAttemptsContent();
    }
    if (this.state.userCanceled) {
      return this.renderUserCancelContent();
    }

    return this.renderEnterPasswordContent();
  };

  renderMaxAttemptsContent = () => (
    <p>{this.props.t('message.encryptedAttemptsExceeded')}</p>
  );

  renderUserCancelContent = () => (
    <p>{this.props.t('message.encryptedUserCancelled')}</p>
  );

  renderEnterPasswordContent = () => {
    const { t } = this.props;
    const wrongPassword = this.props.attempt !== 0;

    return (
      <div className="wrapper">
        <div className="header">{t('message.passwordRequired')}</div>
        <form onSubmit={this.handleSubmit}>
          <div className="enter">
            <div>{t('message.enterPassword')}</div>
            <input
              className={`${wrongPassword ? 'wrong' : 'correct'}`}
              type="password"
              ref={this.passwordInput}
              value={this.state.password}
              onChange={this.handleInputChange}
            />
          </div>
          {wrongPassword && (
            <div className="incorrect-password">
              {t('message.incorrectPassword', {
                remainingAttempts: this.maxAttempts - this.props.attempt,
              })}
            </div>
          )}
          <div className="buttons">
            <Button
              dataElement="passwordSubmitButton"
              label={t('action.submit')}
              onClick={this.handleSubmit}
            />
            <Button
              dataElement="passwordCancelButton"
              label={t('action.cancel')}
              onClick={this.handleCancel}
            />
          </div>
        </form>
      </div>
    );
  };

  render() {
    const className = getClassName('Modal PasswordModal', this.props);

    return (
      <div className={className} data-element="passwordModal">
        <div className="container">{this.renderContent()}</div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  isOpen: selectors.isElementOpen(state, 'passwordModal'),
  attempt: selectors.getPasswordAttempts(state),
});

const mapDispatchToProps = {
  closeElement: actions.closeElement,
};

export const setCheckPasswordFunction = fn => {
  checkPassword = fn;
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation()(PasswordModal));
