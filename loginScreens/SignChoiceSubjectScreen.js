import React, { Component } from 'react'
import { Text, StyleSheet, View, Dimensions, ScrollView, TouchableWithoutFeedback, Alert, AsyncStorage, ActivityIndicator, TextInput, ToastAndroid, TouchableOpacity, Platform, Modal, RefreshControl, Image } from 'react-native'
import { BaseButton } from 'react-native-gesture-handler';
import SettingBtn from '../Icons/profileSetting';
import { getStatusBarHeight } from "react-native-status-bar-height";
import Feather from '@expo/vector-icons/Feather';
import { Colors } from '../Components/Asset';
import gql from 'graphql-tag'
import { Mutation, Query } from 'react-apollo'
import { StackActions, NavigationActions } from 'react-navigation';

const WIDTH = Dimensions.get('window').width;
const resetAction = StackActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({ routeName: 'Bottom' })],
});


const changeChoiceSubject = gql`
mutation updateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
        userChoiceSubjects {
            subjects
        }
    }
}
`

const getChoiceSubject = gql`
query getChoiceSubject($grade: Int!) {
    getChoiceSubject(grade: $grade) {
        choice {
            number
            choices
        }
    }
}
`
export default class SignChoiceSubjectScreen extends Component {
    static navigationOptions = { title: '선택과목', headerLeft: null }
    constructor(props) {
        super(props);
        this.state = {
            mySubject: null,
            subjectData: null,
            isUploading: false,
            loading: true
        }
    }
    _changeHandle = () => {
        this.setState({ isUploading: true });
        const input = {
            userid: this.props.navigation.state.params.userid,
            userChoiceSubjects: this.state.mySubject,
        }
        this.updateChoiceSubjectMutation({ variables: { input: input } }).then(res => {
            this.setState({ isUploading: false });
            this.props.navigation.dispatch(resetAction);
        })
    }
    render() {
        return (
            <Query variables={{ grade: this.props.navigation.state.params.grade }} query={getChoiceSubject} fetchPolicy='network-only' onCompleted={data => {
                let d = data.getChoiceSubject.choice;
                let d2 = []
                for (let i = 0; i < d.length; i++) {
                    d2.push({ subjects: [] });
                    delete d[i].__typename;
                }
                this.setState({ subjectData: d, loading: false, mySubject: d2 });
            }}>
                {({ loading }) => {
                    if (loading) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color='#ddd' size='large' /></View>
                    return <Mutation mutation={changeChoiceSubject} >
                        {(updateProfile) => {
                            if (this.updateChoiceSubjectMutation === undefined) this.updateChoiceSubjectMutation = updateProfile;
                            return <ScrollView style={{ flex: 1, paddingTop: 10 }}>
                                {(!this.state.loading && this.state.mySubject && this.state.subjectData) ? this.state.subjectData.map((info, index) =>
                                    <View key={index} style={{ width: WIDTH, height: 70, borderBottomColor: '#dbdbdb', borderBottomWidth: 0.5, alignItems: 'center' }}>
                                        <View style={{ width: WIDTH, height: 20, alignItems: 'center', justifyContent: 'center' }}>
                                            <Text style={{ fontSize: 14 }}>{info.number}개 선택{info.number === this.state.mySubject[index].subjects.length ? '' : ` (${info.number - this.state.mySubject[index].subjects.length}개 남음)`}</Text>
                                        </View>
                                        <View style={{ width: WIDTH, height: 50, flexDirection: 'row' }}>
                                            <ScrollView style={{ flex: 1 }} horizontal={true} showsHorizontalScrollIndicator={false}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <View style={{ width: 10 }} />
                                                    {this.state.mySubject[index].subjects && info.choices.map((info2, index2) =>
                                                        <TouchableWithoutFeedback key={index2} onPress={() => {
                                                            if (this.state.mySubject[index].subjects.length > 0) {
                                                                const c = this.state.mySubject[index].subjects.indexOf(info2); //눌려진지 확인
                                                                let d = this.state.mySubject.filter(s => true);
                                                                if (c > -1) { //눌려졌기에 삭제
                                                                    d[index].subjects.splice(c, 1);
                                                                    this.setState({ mySubject: d });
                                                                    return;
                                                                }
                                                                if (info.number === this.state.mySubject[index].subjects.length) return;//공간있는지 확인

                                                                d[index].subjects.push(info2); //공간있다면 push
                                                                this.setState({ mySubject: d });
                                                            } else {
                                                                let d = this.state.mySubject.filter(s => true);
                                                                d[index].subjects.push(info2);
                                                                this.setState({ mySubject: d });
                                                            }
                                                        }}>
                                                            <View style={{ height: 26, paddingHorizontal: 13, alignItems: 'center', justifyContent: 'center', borderRadius: 13, borderWidth: 1, borderColor: this.state.mySubject[index].subjects.length > 0 && this.state.mySubject[index].subjects.indexOf(info2) > -1 ? '#ddd' : '#dbdbdb', marginLeft: 10, backgroundColor: this.state.mySubject[index].subjects.length > 0 && this.state.mySubject[index].subjects.indexOf(info2) > -1 ? '#ddd' : 'white' }}>
                                                                <Text style={{ fontSize: 14, color: this.state.mySubject[index].subjects.length > 0 && this.state.mySubject[index].subjects.indexOf(info2) > -1 ? 'white' : 'black' }}>{info2}</Text>
                                                            </View>
                                                        </TouchableWithoutFeedback>
                                                    )}
                                                    <View style={{ width: 23 }} />
                                                </View>
                                            </ScrollView>
                                        </View>
                                    </View>
                                ) : null}

                                <View style={{ width: WIDTH, height: 50, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 10, color: '#bbb' }}>입력받은 과목에 맞추어 수행과 시험정보를 제공합니다</Text>
                                    <Text style={{ fontSize: 10, color: '#bbb' }}>프로필 > 선택과목 탭에서 수정할 수 있습니다</Text>
                                </View>
                                <TouchableOpacity onPress={this._changeHandle} style={{ width: WIDTH, height: 50, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 14, color: Colors.highlightBlue }}>완료</Text>
                                </TouchableOpacity>
                                <Modal visible={this.state.isUploading} transparent={true} onRequestClose={() => { }} >
                                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff80' }}>
                                        <ActivityIndicator size='large' color='#ddd' />
                                    </View>
                                </Modal>
                            </ScrollView>
                        }}
                    </Mutation>
                }}
            </Query>
        )
    }
}
