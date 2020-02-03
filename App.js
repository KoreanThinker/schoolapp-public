import React from 'react';
import { View, Text, ActivityIndicator, AsyncStorage } from 'react-native';
import AppContainer from './AppContainer';


import AWSAppSyncClient from 'aws-appsync'
import AppSyncConfig from './Others/AppSyncConfig'
import { ApolloProvider } from 'react-apollo'
import { Rehydrated } from 'aws-appsync-react'


const client = new AWSAppSyncClient({
  url: AppSyncConfig.url,
  region: AppSyncConfig.region,
  auth: {
    type: AppSyncConfig.authType,
    apiKey: AppSyncConfig.apiKey,
    // jwtToken: async () => token, // Required when you use Cognito UserPools OR OpenID Connect. token object is obtained previously
  }
})

class App extends React.Component {
  render() {
    return (
      <AppContainer adminOpen={this.adminOpen} />
    );
  }
}

const WithProvider = () => (
  <ApolloProvider client={client}>
    <Rehydrated>
      <App />
    </Rehydrated>
  </ApolloProvider>
)


export default WithProvider