import React, { Component } from 'react'
import { Text, View, ActivityIndicator, Dimensions, TouchableOpacity, Alert, AsyncStorage } from 'react-native'
import gql from 'graphql-tag'
import { Colors } from '../Components/Asset';
import { Query, Mutation } from 'react-apollo'
import { BaseButton, ScrollView } from 'react-native-gesture-handler';
import DialogInput from 'react-native-dialog-input';
import Constants from 'expo-constants';

const listAdminid = gql`
query listAdminid {
    listAdminid {
      adminid
      key
    }
  }
`
const createAdminid = gql`
mutation createAdminid($adminid: String!, $logId: String) {
    createAdminid(adminid: $adminid, logId: $logId) {
      adminid
    }
  }  
`

const deleteAdminid = gql`
mutation deleteAdminid($adminid: String!, $logId: String) {
    deleteAdminid(adminid: $adminid, logId: $logId) {
      adminid
    }
  } 
`

const WIDTH = Dimensions.get('window').width;

export default class AdminListScreen extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title: '관리자 리스트'
        }
    };

    constructor(props) {
        super(props);
        this.state = {
            data: null,
            updating: false,
            isDialogVisible: false,
            userid: null,
        }
    }

    async componentDidMount() {
        let id = await AsyncStorage.getItem('ID');
        this.setState({ userid: id });
        if (id === null) {
            Alert.alert('로그인해주세요');
            this.props.navigation.goBack();
        }
    }
    _onUnvisible = (text) => {
        this.setState({ isDialogVisible: false });
        for (let i = 0; i < this.state.data.length; i++) {
            if (this.state.data[i] === text) {
                Alert.alert("이미 존재하는 아이디 입니다");
                return;
            }
        }
        // let d = this.state.data;
        // d.push(text);
        // this.setState({ data: d });
        this.createAdminid({ variables: { adminid: text, logId: `${this.state.userid}(${Constants.deviceName})` } }).then(res => {
            this.refetch();
        });
    }
    _removeHandle = (id) => {
        Alert.alert(
            `${id}`,
            '정말 삭제하시겠습니까',
            [
                {
                    text: '취소',
                    style: 'cancel',
                },
                {
                    text: '네', onPress: () => {
                        this.deleteAdminid({ variables: { adminid: id, logId: `${this.state.userid}(${Constants.deviceName})` } }).then(res => {
                            this.refetch();
                        });
                    }
                },
            ],
            { cancelable: false },
        );
    }
    render() {
        return (
            <Query query={listAdminid} fetchPolicy='network-only' onCompleted={data => {
                let arr = [];
                const items = data.listAdminid;
                try {
                    for (let i = 0; i < items.length; i++) {
                        arr.push(items[i].adminid);
                    }
                } catch (error) {
                    this.props.navigation.goBack();
                    throw error;
                }
                this.setState({ data: arr });
            }}>
                {({ loading, refetch }) => {
                    if (this.refetch === undefined) this.refetch = refetch;
                    if (loading || this.state.updating || this.state.data === null) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color='#ddd' size='large' /></View>
                    return <Mutation mutation={createAdminid} >
                        {(createAdminid) => {
                            if (this.createAdminid === undefined) this.createAdminid = createAdminid;
                            return <Mutation mutation={deleteAdminid} >
                                {(deleteAdminid) => {
                                    if (this.deleteAdminid === undefined) this.deleteAdminid = deleteAdminid;
                                    return <ScrollView style={{ flex: 1 }}>
                                        <TouchableOpacity onPress={() => { this.setState({ isDialogVisible: true }) }} style={{ width: WIDTH, height: 50, alignItems: 'center', justifyContent: 'center' }}>
                                            <Text style={{ fontSize: 24 }}>+</Text>
                                        </TouchableOpacity>
                                        {this.state.data.map((info, index) =>
                                            <View key={index} style={{ width: WIDTH, height: 50, borderTopColor: '#dbdbdb', borderTopWidth: 0.5, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <Text style={{ fontSize: 16, marginLeft: 20 }}>{info}</Text>
                                                <TouchableOpacity onPress={() => this._removeHandle(info)} style={{ width: 50, height: 50, alignItems: 'center', justifyContent: 'center' }}>
                                                    <Text style={{ fontSize: 24, marginRight: 20 }}>×</Text>
                                                </TouchableOpacity>
                                            </View>)}

                                        <DialogInput isDialogVisible={this.state.isDialogVisible}
                                            title={"아이디 입력"}
                                            message={"유저앱 설정에서 아이디 확인 가능합니다"}
                                            hintInput={""}
                                            submitInput={this._onUnvisible}
                                            closeDialog={() => { this.setState({ isDialogVisible: false }) }}>
                                        </DialogInput>
                                    </ScrollView>
                                }}
                            </Mutation>
                        }}
                    </Mutation>
                }}
            </Query>
        )
    }
}
