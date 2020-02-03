import React, { Component } from 'react'
import { Text, StyleSheet, View, ScrollView, Dimensions, TouchableWithoutFeedback, AsyncStorage, ActivityIndicator, RefreshControl } from 'react-native'
import { Ionicons } from '@expo/vector-icons';
import { BaseButton } from 'react-native-gesture-handler';
import { Notifications } from 'expo';
import gql from 'graphql-tag'
import { Query, Mutation } from 'react-apollo'
import { StackActions } from 'react-navigation';

const WIDTH = Dimensions.get('window').width;

const pushAction = StackActions.push({
    routeName: 'Profile',
    params: {
        myUserId: 9,
    },
});

const getNotidata = gql`
query getProfile($userid: String!) {
    getProfile(userid: $userid) {
        noti {
            postType
            message
            postid
            time
        }
    }
}
`

export default class AlertScreen extends Component {
    static navigationOptions = { title: '알림' }

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            refreshing: false
        }
    }

    async componentDidMount() {
        try {
            await Notifications.dismissAllNotificationsAsync()
        } catch
        {
            console.log('error');
        }

        const userid = await AsyncStorage.getItem('ID');
        if (userid === null) {
            this.props.navigation.goBack();
            return;
        }
        this.setState({ loading: false, userid: userid });
    }

    render() {
        return (
            this.state.loading ? <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color='#ddd' size='large' /></View>
                : <Query query={getNotidata} variables={{ userid: this.state.userid }} fetchPolicy="network-only" >
                    {({ loading, error, data, refetch }) => {
                        if (loading && !this.state.refreshing) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color='#ddd' size='large' /></View>;
                        return <ScrollView style={{ flex: 1 }} refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={() => {
                                    this.setState({ refreshing: true });
                                    refetch().then(res => {
                                        this.setState({ refreshing: false });
                                    });
                                }}
                            />}>
                            {data.getProfile.noti && data.getProfile.noti.map((info, index) =>
                                <View key={index}>
                                    <View style={{ width: WIDTH, flexDirection: 'row', height: 70 }}>
                                        <BaseButton onPress={() => {
                                            if (info.postType === 'post') {
                                                this.props.navigation.navigate('Detail', { postid: info.postid });
                                                this.props.navigation.navigate('Comment', { postid: info.postid });
                                                return;
                                            } else if (info.postType === 'notification') {
                                                this.props.navigation.navigate('Notification');
                                            } else if (info.postType === 'homework') {
                                                this.props.navigation.navigate('HomeworkDetail', { postid: info.postid });
                                            } else if (info.postType === 'contest') {
                                                this.props.navigation.navigate('ContestDetail', { postid: info.postid });
                                            } else if (info.postType === 'exam') {
                                                this.props.navigation.navigate('ExamDetail', { postid: info.postid });
                                            } else if (info.postType === 'postNotification') {
                                                this.props.navigation.navigate('Notification');
                                                return;
                                            }
                                            this.props.navigation.navigate('Comment', { type: info.postType, postid: info.postid });
                                        }}>
                                            <View style={{ width: WIDTH, height: 70, justifyContent: 'center', paddingHorizontal: 20 }}>
                                                <Text style={{ fontSize: 14, lineHeight: 20 }} numberOfLines={2}>
                                                    {info.message}
                                                </Text>
                                                <Text style={{ fontSize: 10, color: '#888', marginTop: 4, fontWeight: 'bold' }}>
                                                    {info.time}
                                                </Text>
                                            </View>
                                        </BaseButton>
                                    </View>
                                    <View style={{ alignSelf: 'center', width: WIDTH - 60, height: 0.5, backgroundColor: '#dbdbdb' }} />
                                </View>
                            )}
                        </ScrollView>
                    }}
                </Query>
        )
    }
}

const styles = StyleSheet.create({})
