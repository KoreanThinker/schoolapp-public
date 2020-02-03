import React, { Component } from 'react'
import { Text, View, ScrollView, StyleSheet, AsyncStorage, Dimensions, ActivityIndicator, TouchableWithoutFeedback, Image, Platform, Alert, ToastAndroid, Linking, BackAndroid, BackHandler } from 'react-native'
import gql from 'graphql-tag'
import { Colors } from '../Components/Asset';
import { Query, Mutation } from 'react-apollo'
import { BaseButton } from 'react-native-gesture-handler';
import MyActionSheet from '../Components/MyActionSheet';
// import { IntentLauncherAndroid as IntentLauncher, ImageManipulator, ImagePicker, Permissions, LinearGradien } from 'expo';
import moment from 'moment';
import { StackActions, NavigationActions } from 'react-navigation';
import { RNS3 } from 'react-native-aws3';
import * as ImageManipulator from 'expo-image-manipulator';
import * as IntentLauncher from 'expo-intent-launcher';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import DialogInput from 'react-native-dialog-input';
import Constants from 'expo-constants';


const UserRoute = StackActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({ routeName: 'Bottom' })],
});

const getLunch = gql`
query getLunch {
  getLunch {
    url
  }
}
`
const updateEvent = gql`
mutation updateEvent($input: UpdateEventInput!, $adminid: String, $message: String){
    updateEvent(input: $input, adminid: $adminid, message: $message) {
        title
    }
}
`

const updateResource = gql`
mutation updateResource($key: String!, $value: String) {
    updateResource(key: $key, value: $value) {
        value
    }
}
`
const getUserid = gql`
query getProfileByName($name: String) {
    getProfileByName(name: $name)
}
`
const getEvent = gql`
query getEvent {
    getEvent {
        isOn
    }
}
`
const options = {
    keyPrefix: "uploads/lunchImages/",
    bucket: "schoolapp2019",
    region: "us-west-2",
    accessKey: "",
    secretKey: "",
    successActionStatus: 201
}

const WIDTH = Dimensions.get('window').width;
let date = moment().format('YYYYMMDDHHmmss');
let count = 0;

export default class HomeScreen extends Component {
    static navigationOptions = {
        title: '홈',
        tabBarOnPress: ({ navigation, defaultHandler }) => {
            if (navigation.isFocused()) navigation.getParam('mainScrollUp')();
            else defaultHandler();
        }
    }
    constructor(props) {
        super(props);
        this.state = {
            lunchUrl: '',
            lunchVisible: false,
            isImageUploading: false,
            essentialVisible: false,
            choiceVisible: false,
            idVisible: false,
            nickNameVisible: false,
            nicknameBeta: '*/*/*/*/*/',
            eventVisible: false,
            isEventing: false,
            userid: null,
        }
        count = 0;
        date = moment().format('YYYYMMDDHHmmss');
    }
    async componentDidMount() {
        this.props.navigation.setParams({ mainScrollUp: () => { this.scrollView.scrollTo({ x: 0, animated: true }) } });
        count = 0;
        date = moment().format('YYYYMMDDHHmmss');
        const userid = await AsyncStorage.getItem('ID');
        this.setState({ userid: userid });
    }
    _upload2S3 = (uri) => {
        ImageManipulator.manipulateAsync(uri, [], { compress: 0.6, format: 'jpeg' }).then(response => {
            RNS3.put(this.getFile(response.uri), options).then(res => {
                this.updateResource({ variables: { key: 'lunch', value: res.body.postResponse.location } }).then(res2 => {
                    this.setState({ isImageUploading: false });
                    this.lunchRefetch().then(r => {
                    })
                })

            });
        })
    }
    getFile(uri) {
        let uriParts = uri.split('.');
        let fileType = uriParts[uriParts.length - 1];

        const file = {
            uri,
            name: `${date}${count}.${fileType}`,
            type: `image/${fileType}`,
        };
        count++;

        return file;
    }
    onUnvisibleLunch = (index) => {
        if (this.state.isImageUploading) return;
        this.setState({ lunchVisible: false });

        if (index == 0) {
            this.setState({ isCameraMode: false, isImageUploading: true });
            this._openGellary();
        } else if (index == 1) {
            this.setState({ isCameraMode: true });
            setTimeout(() => {
                this.setState({ isImageUploading: false });
            }, 1000);
            this._openCamera();
        } else if (index == 2) {
            this.props.navigation.navigate('A_Photo', { image: this.state.lunchUrl });
        }
    }
    _changePhoto = (_uri, _ratio) => {
        this._upload2S3(_uri);
    }
    _openCamera = () => {
        this.props.navigation.navigate('A_Camera', { changePhoto: this._changePhoto });
    }

    _openGellary = async () => {
        const permissions = await Permissions.getAsync(Permissions.CAMERA_ROLL);
        if (permissions.status === 'denied') {
            const newPermission = await Permissions.askAsync(Permissions.CAMERA_ROLL);
            if (newPermission.status === 'denied') {
                if (Platform.OS === 'ios') {
                    Alert.alert(
                        '권한',
                        '사진 > 읽기 및 쓰기 활성화',
                        [
                            { text: 'OK', onPress: () => Linking.openURL('app-settings:') },
                            {
                                text: '취소',
                                style: 'cancel',
                            },
                        ],
                        { cancelable: false },
                    );
                } else {
                    Alert.alert(
                        '권한',
                        '스크랩 > 권한 > 저장공간 활성화',
                        [
                            { text: 'OK', onPress: () => IntentLauncher.startActivityAsync(IntentLauncher.ACTION_APPLICATION_SETTINGS) },
                            {
                                text: '취소',
                                style: 'cancel',
                            },
                        ],
                        { cancelable: false },
                    );
                }
            } else {
                let result;
                result = await ImagePicker.launchImageLibraryAsync({
                    allowsEditing: true,
                    aspect: [1, 1]
                });
                if (!result.cancelled) {
                    this._upload2S3(result.uri);
                } else {
                    this.setState({ isImageUploading: false });
                }
            }
        } else {
            let result;
            result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                aspect: [1, 1]
            });

            if (!result.cancelled) {
                this._upload2S3(result.uri);
            } else {
                this.setState({ isImageUploading: false });
            }
        }


    }

    deleteEvent = () => {
        const input = {
            isOn: false
        }
        this.updateEvent({ variables: { input: input, adminid: `${this.state.userid}(${Constants.deviceName})`, message: '님이 이벤트를 삭제하였습니다' } }).then(res => {
            this.setState({ isEventing: false });
            this.eventRefresh();
        });
    }

    render() {
        return (
            <Query query={getLunch} fetchPolicy='cache-and-network' onCompleted={data => {
                this.setState({ lunchUrl: data.getLunch.url });
            }}>
                {({ data, loading, refetch }) => {
                    if (this.lunchRefetch === undefined) this.lunchRefetch = refetch;
                    if (loading) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color='#ddd' size='large' /></View>
                    return <View style={{ flex: 1 }}>
                        <Mutation mutation={updateResource} >
                            {(updateResource) => {
                                if (this.updateResource === undefined) this.updateResource = updateResource;
                                return null;
                            }}
                        </Mutation>
                        <Mutation mutation={updateEvent} >
                            {(updateEvent) => {
                                if (this.updateEvent === undefined) this.updateEvent = updateEvent;
                                return null;
                            }}
                        </Mutation>
                        <Query query={getUserid} variables={{ name: this.state.nicknameBeta }} fetchPolicy='network-only' onCompleted={(data) => {
                            if (this.state.nicknameBeta === '*/*/*/*/*/') return;

                            this.props.navigation.navigate('A_SearchUser', { userid: data.getProfileByName });
                        }}>
                            {({ refetch }) => {
                                if (this.getUserid === undefined) this.getUserid = refetch;
                                return null;
                            }}
                        </Query>
                        <Query query={getEvent} fetchPolicy='network-only'
                            onCompleted={data => {
                                if (!this.props.isPost) {
                                    this.setState({ isEventing: data.getEvent.isOn })
                                }
                            }}>
                            {({ loading, refetch }) => {
                                if (this.eventRefresh === undefined) this.eventRefresh = refetch;
                                return null;
                            }}
                        </Query>
                        <View style={{ width: WIDTH, height: 50, backgroundColor: 'white', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomColor: '#dbdbdb', borderBottomWidth: 0.5 }}>
                            <Text style={{ fontSize: 20, marginLeft: 20 }}>스크랩 관리자 앱</Text>
                            <BaseButton onPress={() => this.props.navigation.dispatch(UserRoute)}>
                                <Text style={{ fontSize: 20, marginRight: 20 }}>유저앱</Text>
                            </BaseButton>
                        </View>
                        <ScrollView ref={ref => this.scrollView = ref} style={{ flex: 1 }}>
                            <View style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: '#eee', marginTop: 20, width: WIDTH - 40, height: 40, borderRadius: 20, alignSelf: 'center', overflow: 'hidden', flexDirection: 'row' }}>
                                <BaseButton onPress={() => {
                                    if (this.state.isImageUploading) return;
                                    this.setState({ lunchVisible: true })
                                }} style={{ width: WIDTH - 40, height: 40, alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                                    <Text>급식</Text>
                                </BaseButton>
                            </View>
                            <View style={{ flexDirection: 'row', padding: 20, paddingTop: 0, justifyContent: 'space-between', marginTop: 20 }}>
                                <View style={{ borderRadius: 20, backgroundColor: '#f1f1f1', width: (WIDTH - 40) / 2 - 10, height: (WIDTH - 40) / 2 - 10, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                    <BaseButton onPress={() => {
                                        this.props.navigation.navigate('A_Report');
                                    }} style={{ width: (WIDTH - 40) / 2 - 10, height: (WIDTH - 40) / 2 - 10, alignItems: 'center', justifyContent: 'center' }} >
                                        <Text>신고</Text>
                                    </BaseButton>
                                </View>

                                <View style={{ borderRadius: 20, backgroundColor: '#f1f1f1', width: (WIDTH - 40) / 2 - 10, height: (WIDTH - 40) / 2 - 10, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                    <BaseButton onPress={() => {
                                        this.props.navigation.navigate('A_Main');
                                    }} style={{ width: (WIDTH - 40) / 2 - 10, height: (WIDTH - 40) / 2 - 10, alignItems: 'center', justifyContent: 'center' }} >
                                        <Text>게시물관리</Text>
                                    </BaseButton>
                                </View>
                            </View>
                            <View style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: '#eee', width: WIDTH - 40, height: 40, borderRadius: 20, alignSelf: 'center', overflow: 'hidden' }}>
                                <BaseButton onPress={() => this.setState({ eventVisible: true })} style={{ width: WIDTH - 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text>이벤트 관리 {this.state.isEventing ? '(진행중)' : '(진행X)'}</Text>
                                </BaseButton>
                            </View>
                            <View style={{ flexDirection: 'row', padding: 20, paddingTop: 0, justifyContent: 'space-between', marginTop: 20 }}>
                                <View style={{ borderRadius: 20, backgroundColor: '#f1f1f1', width: (WIDTH - 40) / 2 - 10, height: (WIDTH - 40) / 2 - 10, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                    <BaseButton onPress={() => this.props.navigation.navigate('A_ChangeSubjects')} style={{ width: (WIDTH - 40) / 2 - 10, height: (WIDTH - 40) / 2 - 10, alignItems: 'center', justifyContent: 'center' }} >
                                        <Text>전체과목수정</Text>
                                    </BaseButton>
                                </View>

                                <View style={{ borderRadius: 20, backgroundColor: '#f1f1f1', width: (WIDTH - 40) / 2 - 10, height: (WIDTH - 40) / 2 - 10, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                    <BaseButton onPress={() => this.props.navigation.navigate('A_Log')} style={{ width: (WIDTH - 40) / 2 - 10, height: (WIDTH - 40) / 2 - 10, alignItems: 'center', justifyContent: 'center' }} >
                                        <Text>로그</Text>
                                    </BaseButton>
                                </View>
                            </View>
                            <View style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: '#eee', width: WIDTH - 40, height: 40, borderRadius: 20, alignSelf: 'center', overflow: 'hidden' }}>
                                <BaseButton onPress={() => this.props.navigation.navigate('A_Schadule')} style={{ width: WIDTH - 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text>학사일정</Text>
                                </BaseButton>
                            </View>
                            <View style={{ flexDirection: 'row', padding: 20, paddingTop: 0, justifyContent: 'space-between', marginTop: 20 }}>
                                <View style={{ borderRadius: 20, backgroundColor: '#f1f1f1', width: (WIDTH - 40) / 2 - 10, height: (WIDTH - 40) / 2 - 10, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                    <BaseButton onPress={() => this.setState({ idVisible: true })} style={{ width: (WIDTH - 40) / 2 - 10, height: (WIDTH - 40) / 2 - 10, alignItems: 'center', justifyContent: 'center' }} >
                                        <Text>아이디로 조회</Text>
                                    </BaseButton>
                                </View>

                                <View style={{ borderRadius: 20, backgroundColor: '#f1f1f1', width: (WIDTH - 40) / 2 - 10, height: (WIDTH - 40) / 2 - 10, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                    <BaseButton onPress={() => this.setState({ nickNameVisible: true })} style={{ width: (WIDTH - 40) / 2 - 10, height: (WIDTH - 40) / 2 - 10, alignItems: 'center', justifyContent: 'center' }} >
                                        <Text>닉네임으로 조회</Text>
                                    </BaseButton>
                                </View>
                            </View>

                            <View style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: '#eee', width: WIDTH - 40, height: 40, borderRadius: 20, alignSelf: 'center', overflow: 'hidden' }}>
                                <BaseButton onPress={() => this.props.navigation.navigate('A_AdminList')} style={{ width: WIDTH - 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text>관리자 리스트</Text>
                                </BaseButton>
                            </View>

                            <View style={{ flexDirection: 'row', padding: 20, paddingTop: 0, justifyContent: 'space-between', marginTop: 20 }}>
                                <View style={{ borderRadius: 20, backgroundColor: '#f1f1f1', width: (WIDTH - 40) / 2 - 10, height: (WIDTH - 40) / 2 - 10, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                    <BaseButton onPress={() => this.setState({ essentialVisible: true })} style={{ width: (WIDTH - 40) / 2 - 10, height: (WIDTH - 40) / 2 - 10, alignItems: 'center', justifyContent: 'center' }} >
                                        <Text>필수과목수정</Text>
                                    </BaseButton>
                                </View>

                                <View style={{ borderRadius: 20, backgroundColor: '#f1f1f1', width: (WIDTH - 40) / 2 - 10, height: (WIDTH - 40) / 2 - 10, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                    <BaseButton onPress={() => this.setState({ choiceVisible: true })} style={{ width: (WIDTH - 40) / 2 - 10, height: (WIDTH - 40) / 2 - 10, alignItems: 'center', justifyContent: 'center' }} >
                                        <Text>선택과목수정</Text>
                                    </BaseButton>
                                </View>
                            </View>
                            <View style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: '#eee', width: WIDTH - 40, height: 40, borderRadius: 20, alignSelf: 'center', overflow: 'hidden' }}>
                                <BaseButton onPress={() => this.props.navigation.navigate('A_Tag')} style={{ width: WIDTH - 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text>태그수정</Text>
                                </BaseButton>
                            </View>

                        </ScrollView>

                        <DialogInput isDialogVisible={this.state.idVisible}
                            title={"아이디로 조회"}
                            message={"붙여넣기가 안되면 한글자 썼다가 지우고 다시 붙여넣기 하면됩니다"}
                            hintInput={""}
                            submitInput={(text) => {
                                this.props.navigation.navigate('A_SearchUser', { userid: text });
                                this.setState({ idVisible: false });
                            }}
                            closeDialog={() => { this.setState({ idVisible: false }) }}>
                        </DialogInput>

                        <DialogInput isDialogVisible={this.state.nickNameVisible}
                            title={"닉네임으로 조회"}
                            message={"붙여넣기가 안되면 한글자 썼다가 지우고 다시 붙여넣기 하면됩니다"}
                            hintInput={"없는 닉이면 창이 안뜹니다"}
                            submitInput={(text) => {
                                this.setState({ nicknameBeta: text, nickNameVisible: false });
                                setTimeout(() => {
                                    this.getUserid();
                                    console.log(1);
                                }, 100);
                            }}
                            closeDialog={() => { this.setState({ nickNameVisible: false }) }}>
                        </DialogInput>

                        <MyActionSheet
                            visible={this.state.lunchVisible}
                            contents={this.state.lunchUrl ? ['앨범에서 가져오기', '카메라로 촬영하기', '사진보기'] : ['앨범에서 가져오기', '카메라로 촬영하기']}
                            onClicked={this.onUnvisibleLunch}
                            closeHandle={() => this.setState({ lunchVisible: false })} />
                        <MyActionSheet
                            visible={this.state.essentialVisible}
                            contents={['1학년', '2학년', '3학년']}
                            onClicked={(index) => {
                                this.setState({ essentialVisible: false });
                                this.props.navigation.navigate('A_Essential', { grade: index + 1 })
                            }}
                            closeHandle={() => this.setState({ essentialVisible: false })} />
                        <MyActionSheet
                            visible={this.state.choiceVisible}
                            contents={['1학년', '2학년', '3학년']}
                            onClicked={(index) => {
                                this.setState({ choiceVisible: false });
                                this.props.navigation.navigate('A_Choice', { grade: index + 1 })
                            }}
                            closeHandle={() => this.setState({ choiceVisible: false })} />
                        <MyActionSheet
                            visible={this.state.eventVisible}
                            contents={['새 이벤트', '이벤트 업데이트', '삭제', '댓글보기']}
                            onClicked={(index) => {
                                this.setState({ eventVisible: false });
                                if (index <= 1) {
                                    this.props.navigation.navigate('A_EventPost', { isPost: index === 0 })
                                } else if (index === 2) {
                                    Alert.alert(
                                        '경고',
                                        '정말 삭제하시겠습니까',
                                        [
                                            {
                                                text: '취소',
                                                style: 'cancel',
                                            },
                                            {
                                                text: '네', onPress: () => {
                                                    this.deleteEvent();
                                                }
                                            },
                                        ],
                                        { cancelable: false },
                                    );
                                } else {
                                    this.props.navigation.navigate('A_Comment', { type: 'event', postid: '1' });
                                }
                            }}
                            closeHandle={() => this.setState({ eventVisible: false })} />
                    </View>
                }
                }
            </Query >
        )
    }
}

const styles = StyleSheet.create({})
