import React, { Component } from 'react'
import { Text, StyleSheet, View, ActivityIndicator, ScrollView, TextInput, TouchableWithoutFeedback, Dimensions, Platform, Image, AsyncStorage, ActionSheetIOS, Linking, ToastAndroid, Modal, Alert } from 'react-native'
// import { ImagePicker, Permissions, Constants } from 'expo';
// import { IntentLauncherAndroid as IntentLauncher, ImageManipulator } from 'expo';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { Colors } from '../Components/Asset'
import { BorderlessButton, RectButton, BaseButton } from 'react-native-gesture-handler';
import { Mutation, Query } from 'react-apollo'
import gql from 'graphql-tag'
import { RNS3 } from 'react-native-aws3';;
import MyActionSheet from '../Components/MyActionSheet';
import moment from 'moment';
import { StackActions, NavigationActions } from 'react-navigation';
import Constants from 'expo-constants';
import * as ImageManipulator from 'expo-image-manipulator';
import * as IntentLauncher from 'expo-intent-launcher';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';


const resetAction = StackActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({ routeName: 'A_Bottom' })],
});


const getResource = gql`
query getResource($key: String!) {
    getResource(key: $key) {
        value
        values
        figures
    }
}
`
const updateResource = gql`
mutation updateResource($key: String!, $values: [String], $adminid: String) {
    updateResource(key: $key, values: $values, adminid: $adminid) {
        key
    }
}
`

const getChoiceSubject = gql`
query getChoiceSubject($grade: Int!) {
    getChoiceSubject(grade: $grade){
        choice {
            choices
        }  
    }
}
`
const getEssentialSubject = gql`
query getResource($key: String!) {
    getResource(key: $key) {
        values
    }
}
`


const POST_MUTATION = gql`
    mutation updateHomework($postid: String!, $input: UpdateHomeworkInput!, $adminid: String){
        updateHomework(postid: $postid, input: $input, adminid: $adminid) {
            postid
        }
    }
`

const getPost = gql`
query getHomework($postid: String!) {
    getHomework(postid: $postid) {
        grade
        subject
        title
        descriptions
        others
        pics
    }
}
`

const WIDTH = Dimensions.get('window').width;
const MaxRatio = 1.5;

let date = moment().format('YYYYMMDDHHmmss');
let count = 0;
let URIS = [];
const KEY = 'schoolSchedule'


const options = {
    keyPrefix: "uploads/postImages/",
    bucket: "schoolapp2019",
    region: "us-west-2",
    accessKey: "",
    secretKey: "",
    successActionStatus: 201
}



class PostScreen extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title: '새 게시물',
            headerRight: (
                <BaseButton onPress={navigation.getParam('postHandle')} style={{ alignItems: 'center', justifyContent: 'center', height: 50, width: 50 }} >
                    <Text style={{ color: Colors.highlightBlue, fontSize: 18 }}>게시</Text>
                </BaseButton>
            ),
        }
    };

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            isAnonymous: false,
            images: [],
            ratio: 1,
            descriptions: ['', ''],
            title: '',
            subject: '',
            others: ['', '', '', '', ''],
            isPosting: false,
            contentVisible: false,
            btnLocation: 0,
            isCameraMode: null,
            clickedTag: ["*", "*", "*", "*"],
            visible: false,
            isSuccess: false,
            isFail: false,
            userid: null,
            name: null,
            tag: [[], [], [], []],
            choiceSubject: [],
            essentialSubject: [],
            subjectVisible: false
        }
        URIS = [];
        count = 0;
        date = moment().format('YYYYMMDDHHmmss')
    }

    async componentDidMount() {
        this.props.navigation.setParams({ postHandle: this._postHandle });
        URIS = [];
        count = 0;
        date = moment().format('YYYYMMDDHHmmss');
        let id = await AsyncStorage.getItem('ID');
        this.setState({ userid: id });
        if (id === null) {
            Alert.alert('로그인해주세요');
            this.props.navigation.goBack();
        }
    }


    _postHandle = () => {
        if (this.state.images.length === 0) {
            if (Platform.OS === 'android') {
                ToastAndroid.show('이미지를 하나이상 추가해주세요', ToastAndroid.SHORT);
            } else {
                Alert.alert("이미지를 하나이상 추가해주세요");
            }
            return;
        }

        if (!this.state.isPosting) {
            this.setState({ isPosting: true });
            setTimeout(() => {
                if (!this.state.isSuccess && !this.state.isFail) {
                    this.setState({ isFail: true });
                    setTimeout(() => {
                        this.props.navigation.goBack();
                    }, 500);
                }

            }, 20000);
            if (this.state.images.length > 0) {
                const imageCount = 0;
                const endPoint = this.state.images.length;
                try {
                    this._upload2S3(imageCount, endPoint);
                } catch {
                    this.setState({ isFail: true });
                    setTimeout(() => {
                        this.props.navigation.goBack();
                    }, 500);
                }

            } else {
                this._upload2Server();
            }
        }
    }
    _upload2S3(imageCount, endPoint) {
        if (this.state.images[imageCount].includes('http')) //http를 갖고 있다면...
        {
            URIS.push(this.state.images[imageCount]);
            if (imageCount === endPoint - 1) {
                this._upload2Server();
            }
            else {
                this._upload2S3(imageCount + 1, endPoint);
            }
        } else {
            ImageManipulator.manipulateAsync(this.state.images[imageCount], [], { compress: 0.9, format: 'jpeg' }).then(response => {
                RNS3.put(this.getFile(response.uri), options).then(res => {
                    URIS.push(res.body.postResponse.location);
                    if (imageCount === endPoint - 1) {
                        this._upload2Server();
                    }
                    else {
                        this._upload2S3(imageCount + 1, endPoint);
                    }
                });
            })
        }

    }
    _upload2Server() {
        try {
            this.props.uploadMutation({ variables: { key: KEY, values: URIS, adminid: `${this.state.userid}(${Constants.deviceName})` } }).then(response => {
                this.setState({ isSuccess: true });
                setTimeout(() => {
                    this.props.navigation.goBack();
                }, 500);
            })
        }
        catch
        {
            this.setState({ isFail: true });
            setTimeout(() => {
                this.props.navigation.goBack();
            }, 500);
        }

    }

    getFile(uri) {
        let uriParts = uri.split('.');
        let fileType = uriParts[uriParts.length - 1];

        const file = {
            uri,
            name: `${Constants.deviceName}${date}${count}.${fileType}`,
            type: `image/${fileType}`,
        };
        count++;

        return file;
    }

    _changeContent = (text) => {
        this.setState({ content: text })
    }
    _imageAddHandle = () => {
        this.setState({ visible: true })
        // if (this.state.images.length <= 0) {
        //     this.setState({ visible: true })
        // } else {
        //     if (this.state.isCameraMode === true) {
        //         this._openCamera();
        //     } else if (this.state.isCameraMode === false) {
        //         this._openGellary();
        //     }
        // }

    }
    _openCamera = () => {
        this.props.navigation.navigate('A_Camera', { changePhoto: this._changePhoto });
    }
    _changePhoto = (_uri, _ratio) => {
        const c = this.state.images.filter(() => true);
        c.push(_uri);
        this.setState({ images: c, ratio: 1 });
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
                    // ToastAndroid.show('스크랩 > 권한 > 저장공간 활성화', ToastAndroid.LONG);

                }
            } else {
                let result;
                if (this.state.images.length <= 0) {
                    result = await ImagePicker.launchImageLibraryAsync({
                        allowsEditing: true,
                    });
                } else {
                    result = await ImagePicker.launchImageLibraryAsync({
                        allowsEditing: true,
                    });
                }

                if (!result.cancelled) {
                    const i = this.state.images.filter(() => true);
                    i.push(result.uri);
                    if (this.state.images.length === 0) {
                        this.setState({ images: i, ratio: result.width / result.height });
                    } else {
                        this.setState({ images: i });
                    }
                }
            }
        } else {
            let result;
            if (this.state.images.length <= 0) {
                result = await ImagePicker.launchImageLibraryAsync({
                    allowsEditing: true,
                });
            } else {
                result = await ImagePicker.launchImageLibraryAsync({
                    allowsEditing: true,
                });
            }

            if (!result.cancelled) {
                const i = this.state.images.filter(() => true);
                i.push(result.uri);
                if (this.state.images.length === 0) {
                    this.setState({ images: i, ratio: result.width / result.height });
                } else {
                    this.setState({ images: i });
                }
            }
        }


    }
    _actionSheetHandle(index) {
        this.setState({ visible: false });
        if (index == 0) {
            this.setState({ isCameraMode: false });
            this._openGellary();
        } else if (index == 1) {
            this.setState({ isCameraMode: true });
            this._openCamera();
        }
    }
    render() {
        return (
            !this.state.loading
                ?
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size='large' color='#dddddd' /></View>
                :
                <View style={{ flex: 1 }}>
                    <Query query={getResource} variables={{ key: KEY }} fetchPolicy='network-only'
                        onCompleted={data => {
                            this.setState({ images: data.getResource.values });
                        }}>
                        {({ loading }) => {
                            return null;
                        }}
                    </Query>
                    <ScrollView showsVerticalScrollIndicator={false} overScrollMode={"never"} style={{ flex: 1 }}>
                        <View style={{ borderBottomColor: '#dbdbdb', borderBottomWidth: 0.5 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', height: 40, marginLeft: 12 }}>
                                <View style={{ flex: 1, alignItems: 'center', flexDirection: 'row' }}><Text style={{ fontSize: 14, marginLeft: 10 }}>사진</Text></View>
                            </View>
                            <ScrollView horizontal={true} overScrollMode='never' showsHorizontalScrollIndicator={false} style={{ height: 150, paddingBottom: 12 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 34 }}>
                                    {this.state.images.map((data, index) =>
                                        <View key={index} style={{ height: 130, width: 130 * (this.state.ratio > MaxRatio ? MaxRatio : this.state.ratio < 1 / MaxRatio ? 1 / MaxRatio : this.state.ratio), borderRadius: 10, overflow: 'hidden', marginRight: 10 }}>
                                            <TouchableWithoutFeedback onPress={() => {
                                                let i = this.state.images.filter(() => true);
                                                i.splice(index, 1);
                                                if (i.length === 0) {
                                                    this.setState({ ratio: 1 })
                                                }
                                                this.setState({ images: i });
                                            }}>
                                                <View style={{ height: 130, width: 130 * (this.state.ratio > MaxRatio ? MaxRatio : this.state.ratio < 1 / MaxRatio ? 1 / MaxRatio : this.state.ratio) }}>
                                                    <Image accessible source={{ uri: data }} style={{ height: 130, width: 130 * (this.state.ratio > MaxRatio ? MaxRatio : this.state.ratio < 1 / MaxRatio ? 1 / MaxRatio : this.state.ratio) }} />
                                                    <Ionicons name='ios-close' color='white' size={30} style={{ position: 'absolute', right: 16, top: 6 }} />
                                                </View>
                                            </TouchableWithoutFeedback>
                                        </View>
                                    )}
                                    {this.state.images.length < 9 &&
                                        <View style={{ height: 130, width: 130 * (this.state.ratio > MaxRatio ? MaxRatio : this.state.ratio < 1 / MaxRatio ? 1 / MaxRatio : this.state.ratio), borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#dbdbdb', overflow: 'hidden' }}>
                                            <RectButton onPress={this._imageAddHandle}>
                                                <View style={{ height: 130, width: 130 * (this.state.ratio > MaxRatio ? MaxRatio : this.state.ratio < 1 / MaxRatio ? 1 / MaxRatio : this.state.ratio), borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
                                                    <Ionicons name='ios-add' style={{ margin: 0 }} size={30} color='#888' />
                                                </View>
                                            </RectButton>
                                        </View>}
                                </View>
                            </ScrollView>
                        </View>
                    </ScrollView>




                    <Modal
                        transparent={true}
                        visible={this.state.isPosting}
                        onRequestClose={() => { }}
                    >
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#80808080' }}>
                            {this.state.isSuccess
                                ?
                                <View style={{ alignItems: 'center' }}>
                                    <Ionicons name='ios-checkmark-circle' size={60} color={Colors.red} style={{ margin: 0 }} />
                                    <Text style={{ fontSize: 20, color: Colors.red, marginTop: 4 }}>성공</Text>
                                </View>
                                :
                                this.state.isFail
                                    ?
                                    <View style={{ alignItems: 'center' }}>
                                        <AntDesign name='exclamationcircle' size={60} color={Colors.red} style={{ margin: 0 }} />
                                        <Text style={{ fontSize: 20, color: Colors.red, marginTop: 4 }}>실패</Text>
                                    </View>
                                    :
                                    <View style={{ alignItems: 'center' }}>
                                        <ActivityIndicator size='large' color='#dddddd' />
                                        <Text style={{ fontSize: 14, color: '#ddd', marginTop: 4 }}>게시하는 중...</Text>
                                    </View>
                            }

                        </View>
                    </Modal>
                    <MyActionSheet
                        visible={this.state.visible}
                        contents={['앨범에서 가져오기', '카메라로 촬영하기']}
                        onClicked={(data) => this._actionSheetHandle(data)}
                        closeHandle={() => this.setState({ visible: false })} />
                </View>
        )
    }
}
export default class schoolSchedule extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title: '학사일정 수정',
            headerRight: (
                <BaseButton onPress={navigation.getParam('postHandle')} style={{ alignItems: 'center', justifyContent: 'center', height: 50, width: 50 }} >
                    <Text style={{ color: Colors.highlightBlue, fontSize: 18 }}>수정</Text>
                </BaseButton>
            ),
        }
    };

    render() {
        return (
            <Mutation mutation={updateResource} >
                {(createPost, { data }) => (
                    <PostScreen navigation={this.props.navigation} uploadMutation={createPost} />
                )
                }
            </Mutation>
        )
    }
}


const styles = StyleSheet.create({})
