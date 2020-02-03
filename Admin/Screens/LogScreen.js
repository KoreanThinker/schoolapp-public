import React, { Component } from 'react'
import { Text, View, FlatList, ActivityIndicator } from 'react-native'
import { Mutation, Query } from 'react-apollo'
import gql from 'graphql-tag';

const LIMIT = 200;

const getLogList = gql`
query listAdminLogs($limit: Int, $nextToken: String) {
    listAdminLogs(limit: $limit, nextToken: $nextToken) {
        items {
            postid
            time
            message
            shortage
        }
        nextToken
    }
}
`

export default class LogScreen extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title: '로그',
        }
    };
    render() {
        return (
            <View style={{ flex: 1 }}>
                <Query query={getLogList} variables={{ limit: LIMIT, nextToken: '' }} fetchPolicy='network-only'>
                    {({ data, loading }) => {
                        if (loading) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator /></View>
                        return data.listAdminLogs ? <FlatList
                            style={{ flex: 1 }}
                            keyExtractor={(item, index) => item.postid}
                            data={data.listAdminLogs.items}
                            renderItem={({ item }) => {
                                return <View style={{ width: '100%', paddingVertical: 4, borderBottomColor: '#dbdbdb', borderBottomWidth: 0.5, paddingHorizontal: 20 }}>
                                    <Text style={{ color: '#888', fontSize: 10 }}>{item.time}</Text>
                                    <Text>{item.message}</Text>
                                    <Text numberOfLines={10}>{item.shortage}</Text>
                                </View>
                            }}
                        /> : null
                    }}
                </Query>
            </View>
        )
    }
}
