import React, { Component } from 'react';
import { UIManager, LayoutAnimation, Alert } from 'react-native';
import { authorize, refresh, revoke } from 'react-native-app-auth';
import { Page, Button, ButtonContainer, Form, Heading } from './components';

UIManager.setLayoutAnimationEnabledExperimental &&
  UIManager.setLayoutAnimationEnabledExperimental(true);

type State = {
  hasLoggedInOnce: boolean,
  accessToken: ?string,
  accessTokenExpirationDate: ?string,
  refreshToken: ?string
};

const config = {
  serviceConfiguration: {
    authorizationEndpoint: "https://potterworld.b2clogin.com/potterworld.onmicrosoft.com/oauth2/v2.0/authorize?p=b2c_1_vinu",
    tokenEndpoint: "https://potterworld.b2clogin.com/potterworld.onmicrosoft.com/oauth2/v2.0/token?p=b2c_1_vinu",
    revocationEndpoint: "https://potterworld.b2clogin.com/potterworld.onmicrosoft.com/oauth2/v2.0/logout?p=b2c_1_vinu"
  },
  clientId: 'cdb57ca8-3d82-42dc-a810-e6e42490f528',
  redirectUrl: 'com.onmicrosoft.fabrikamb2c.exampleapp://oauth/redirect',
  additionalParameters: {},
  scopes: ['openid']

  // serviceConfiguration: {
  //   authorizationEndpoint: 'https://demo.identityserver.io/connect/authorize',
  //   tokenEndpoint: 'https://demo.identityserver.io/connect/token',
  //   revocationEndpoint: 'https://demo.identityserver.io/connect/revoke'
  // }
};

export default class App extends Component<{}, State> {
  state = {
    hasLoggedInOnce: false,
    accessToken: '',
    idToken: '',
    accessTokenExpirationDate: '',
    refreshToken: ''
  };

  animateState(nextState: $Shape<State>, delay: number = 0) {
    setTimeout(() => {
      this.setState(() => {
        LayoutAnimation.easeInEaseOut();
        return nextState;
      });
    }, delay);
  }

  authorize = async () => {
    try {
      const authState = await authorize(config);

      this.animateState(
        {
          hasLoggedInOnce: true,
          accessToken: authState.accessToken,
          accessTokenExpirationDate: authState.accessTokenExpirationDate,
          idToken: authState.idToken,
          refreshToken: authState.refreshToken,
          scopes: authState.scopes
        },
        500
      );
    } catch (error) {
      Alert.alert('Failed to log in', error.message);
    }
  };

  refresh = async () => {
    try {
      const authState = await refresh(config, {
        refreshToken: this.state.refreshToken
      });

      this.animateState({
        accessToken: authState.accessToken || this.state.accessToken,
        accessTokenExpirationDate:
          authState.accessTokenExpirationDate || this.state.accessTokenExpirationDate,
        refreshToken: authState.refreshToken || this.state.refreshToken
      });
    } catch (error) {
      Alert.alert('Failed to refresh token', error.message);
    }
  };

  revoke = async () => {
    try {
      await revoke(config, {
        tokenToRevoke: this.state.idToken,
        sendClientId: true
      });
      this.animateState({
        idToken: '',
        accessToken: '',
        accessTokenExpirationDate: '',
        refreshToken: ''
      });
    } catch (error) {
      Alert.alert('Failed to revoke token', error.message);
    }
  };

  render() {
    const { state } = this;
    return (
      <Page>
        {!!state.idToken ? (
          <Form>
            <Form.Label>idToken</Form.Label>
            <Form.Value>{state.idToken}</Form.Value>
            <Form.Label>scopes</Form.Label>
            <Form.Value>{state.scopes.join(', ')}</Form.Value>
          </Form>
        ) : (
            <Heading>{state.hasLoggedInOnce ? 'Goodbye.' : 'Hello, stranger.'}</Heading>
          )}

        <ButtonContainer>
          {!state.idToken ? (
            <Button onPress={this.authorize} text="Authorize" color="#DA2536" />
          ) : null}
          {!!state.refreshToken ? (
            <Button onPress={this.refresh} text="Refresh" color="#24C2CB" />
          ) : null}
          {!!state.idToken ? (
            <Button onPress={this.revoke} text="Revoke" color="#EF525B" />
          ) : null}
        </ButtonContainer>
      </Page>
    );
  }
}
