import React, { Component } from 'react'
import { Text, View, FlatList, ActivityIndicator, Dimensions, TouchableWithoutFeedback } from 'react-native'
import gql from 'graphql-tag'
import { Colors } from '../Components/Asset';
import { Query, Mutation } from 'react-apollo'

const LIMIT = 200;
const WIDTH = Dimensions.get('window').width;

const getLogList = gql`
query listReports($limit: Int, $nextToken: String) {
    listReports(limit: $limit, nextToken: $nextToken) {
        items {
            postid
            postType
            time
            message
            shortage
        }
        nextToken
    }
}
`


export default class ReportScreen extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title: '신고',
        }
    };
    render() {
        return (
            <View style={{ flex: 1 }}>
                <Query query={getLogList} variables={{ limit: LIMIT, nextToken: '' }} fetchPolicy='network-only'>
                    {({ data, loading }) => {
                        if (loading) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator /></View>
                        return data.listReports ? <FlatList
                            style={{ flex: 1 }}
                            keyExtractor={(item, index) => 'key' + index}
                            data={data.listReports.items}
                            renderItem={({ item }) => {
                                return <TouchableWithoutFeedback onPress={() => {

                                    if (item.postType === 'mainPost') {
                                        console.log(1);
                                        this.props.navigation.navigate('A_Detail', { postid: item.postid });
                                    } else if (item.postType === 'post') {
                                        this.props.navigation.navigate('A_Comment', { postid: item.postid });
                                    } else {
                                        this.props.navigation.navigate('A_Comment', { postid: item.postid, type: item.postType });
                                    }
                                }}>
                                    <View style={{ width: WIDTH, paddingVertical: 4, borderBottomColor: '#dbdbdb', borderBottomWidth: 0.5, paddingHorizontal: 20 }}>
                                        <Text style={{ color: '#888', fontSize: 10 }}>{item.time}  :  {item.postType}</Text>
                                        <Text>{item.message}</Text>
                                        <Text style={{ color: 'red' }} numberOfLines={10}>{item.shortage}</Text>
                                    </View>
                                </TouchableWithoutFeedback>
                            }}
                        /> : null
                    }}
                </Query>
            </View>
        )
    }
}
