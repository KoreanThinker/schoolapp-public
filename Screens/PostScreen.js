import React, { Component } from 'react'
import { Text, StyleSheet, View, ActivityIndicator, ScrollView, TextInput, TouchableWithoutFeedback, Dimensions, Platform, Image, AsyncStorage, ActionSheetIOS, Linking, ToastAndroid, Modal, Alert } from 'react-native'
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { Colors } from '../Components/Asset'
import { BorderlessButton, RectButton, BaseButton } from 'react-native-gesture-handler';
import { Mutation, Query } from 'react-apollo'
import gql from 'graphql-tag'
import { RNS3 } from 'react-native-aws3';;
import MyActionSheet from '../Components/MyActionSheet';
import * as ImageManipulator from 'expo-image-manipulator';
import * as IntentLauncher from 'expo-intent-launcher';
import moment from 'moment';
import { StackActions, NavigationActions } from 'react-navigation';


const resetAction = StackActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({ routeName: 'Bottom' })],
});


const getTags = gql`
query getTags {
    getTags {
        groups {
            items
        }
    }
}
`
const POST_MUTATION = gql`
    mutation CreatePost($input: CreatePostInput!) {
        createPost(input: $input) {
            userid
            name
        }
    }
`

const WIDTH = Dimensions.get('window').width;
const MaxRatio = 1.5;

let date = moment().format('YYYYMMDDHHmmss');
let count = 0;
let URIS = [];



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
            content: '',
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
            permission: false,
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
        let name = await AsyncStorage.getItem('NAME');
        const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
        this.setState({ userid: id, name: name, permission: status === 'granted' });
        if (id === null || name === null) {
            Alert.alert('로그인해주세요');
            this.props.navigation.goBack();
        }
    }


    _postHandle = () => {
        if (this.state.content === '') {
            if (Platform.OS === 'android') {
                ToastAndroid.show('내용을 입력해주세요', ToastAndroid.SHORT);
            } else {
                Alert.alert("내용을 입력해 주세요");

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

            }, 30000);
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
        ImageManipulator.manipulateAsync(this.state.images[imageCount], [], { compress: 0.6, format: 'jpeg' }).then(response => {
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
    _upload2Server() {
        const input = {
            userid: this.state.userid,
            tags: this.state.clickedTag,
            description: this.state.content,
            pics: URIS,
            ratio: this.state.ratio
        }
        try {
            this.props.uploadMutation({ variables: { input: input } }).then(response => {
                this.setState({ isSuccess: true });
                setTimeout(() => {
                    this.props.navigation.dispatch(resetAction);
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
            name: `${this.state.userid}${date}${count}.${fileType}`,
            type: `image/${fileType}`,
        };
        count++;

        return file;
    }

    _changeContent = (text) => {
        this.setState({ content: text })
    }
    _imageAddHandle = () => {
        if (this.state.images.length <= 0) {
            this.setState({ visible: true })
        } else {
            if (this.state.isCameraMode === true) {
                this._openCamera();
            } else if (this.state.isCameraMode === false) {
                this._openGellary();
            }
        }

    }
    _openCamera = () => {
        this.props.navigation.navigate('Camera', { changePhoto: this._changePhoto });
    }
    _changePhoto = (_uri, _ratio) => {
        const c = this.state.images.filter(() => true);
        c.push(_uri);
        this.setState({ images: c, ratio: 1 });
    }

    _openGellary = () => {
        if (this.state.permission) {
            setTimeout(() => {
                this._pickImage();
            }, 100);

        } else {
            this._getPermission();
        }
    }
    _getPermission = async () => {
        const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
        if (status === 'granted') {
            this.setState({ permission: true });
        } else {
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
        }
    }
    _pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
        });
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
    _actionSheetHandle(index) {
        if (index == 0) {
            this._openGellary();
            this.setState({ isCameraMode: false });
        } else if (index == 1) {
            this._openCamera();
            this.setState({ isCameraMode: true });
        }
    }
    render() {
        return (
            <Query query={getTags} fetchPolicy='cache-and-network'
                onCompleted={data => {
                    let tag = [
                        [...data.getTags.groups[0].items],
                        [...data.getTags.groups[1].items],
                        [...data.getTags.groups[2].items],
                        [...data.getTags.groups[3].items]
                    ]
                    this.setState({ tag: tag });
                }}>
                {({ loading }) => {
                    return !this.state.loading || loading
                        ?
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size='large' color='#dddddd' /></View>
                        :
                        <View style={{ flex: 1 }}>

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


                                <View style={{ borderBottomColor: '#dbdbdb', borderBottomWidth: 0.5 }}>
                                    <View style={{ height: 40, justifyContent: 'center', marginLeft: 12 }}>
                                        <Text style={{ fontSize: 14, marginLeft: 10 }}>태그</Text>
                                    </View>
                                    <View style={{ marginBottom: 10 }}>
                                        {this.state.tag.map((data, index) =>
                                            <View key={index}>
                                                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} overScrollMode='never'>
                                                    <View style={{ paddingHorizontal: 34, height: 40, flexDirection: 'row', alignItems: 'center' }}>
                                                        <TouchableWithoutFeedback onPress={() => {
                                                            const c = this.state.clickedTag;
                                                            c[index] = "*";
                                                            this.setState({ clickedTag: c })
                                                        }
                                                        }>
                                                            <View style={{ height: 26, paddingHorizontal: 13, alignItems: 'center', justifyContent: 'center', borderRadius: 13, borderWidth: 1, borderColor: this.state.clickedTag[index] == "*" ? '#888' : '#dbdbdb', backgroundColor: this.state.clickedTag[index] == "*" ? '#888' : 'white' }}>
                                                                <Ionicons name='ios-close' size={16} color={this.state.clickedTag[index] == "*" ? 'white' : 'black'} />
                                                            </View>
                                                        </TouchableWithoutFeedback>
                                                        {data.map((info, index2) =>
                                                            <TouchableWithoutFeedback key={index2} onPress={() => {
                                                                const c = this.state.clickedTag;
                                                                c[index] = this.state.tag[index][index2];
                                                                this.setState({ clickedTag: c });
                                                            }}>
                                                                <View style={{ height: 26, paddingHorizontal: 13, alignItems: 'center', justifyContent: 'center', borderRadius: 13, borderWidth: 1, borderColor: this.state.clickedTag[index] == this.state.tag[index][index2] ? '#888' : '#dbdbdb', marginLeft: 10, backgroundColor: this.state.clickedTag[index] == this.state.tag[index][index2] ? '#888' : 'white' }}>
                                                                    <Text style={{ fontSize: 12, color: this.state.clickedTag[index] == this.state.tag[index][index2] ? 'white' : 'black' }}>{info}</Text>
                                                                </View>
                                                            </TouchableWithoutFeedback>
                                                        )}
                                                    </View>
                                                </ScrollView>
                                            </View>
                                        )}
                                    </View>
                                </View>
                                <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('Post_Content', { content: this.state.content, changeHandle: this._changeContent })}>
                                    <View style={{ paddingHorizontal: 22, width: WIDTH, minHeight: 300, }}>
                                        <Text style={{ fontSize: 14, color: this.state.content == '' ? '#aaa' : 'black', marginVertical: 12 }}>
                                            {this.state.content == '' ? '내용 입력...' : this.state.content}
                                        </Text>
                                    </View>
                                </TouchableWithoutFeedback>
                            </ScrollView >
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
                                // onlyCustomModal={true}
                                visible={this.state.visible}
                                contents={['앨범에서 가져오기', '카메라로 촬영하기']}
                                onClicked={(data) => this._actionSheetHandle(data)}
                                closeHandle={() => this.setState({ visible: false })} />
                        </View>
                }}
            </Query>

        )
    }
}
export default class MutationContainter extends Component {
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

    render() {
        return (
            <Mutation mutation={POST_MUTATION} >
                {(createPost, { data }) => (
                    <PostScreen navigation={this.props.navigation} uploadMutation={createPost} />
                )
                }
            </Mutation>
        )
    }
}

export class ContentScreen extends Component {
    static navigationOptions = ({ navigation }) => ({
        title: '내용 입력',
        // headerLeft: null,
        headerRight: (
            <BaseButton onPress={() => navigation.goBack()} style={{ alignItems: 'center', justifyContent: 'center', height: 50, width: 50 }} >
                <Text style={{ color: Colors.highlightBlue, fontSize: 18 }}>완료</Text>
            </BaseButton>
        ),
    });

    constructor(props) {
        super(props);
        this.state = {
            text: this.props.navigation.state.params.content,
        }
    }

    componentDidMount() {
        setTimeout(() => {
            this.input.focus();
            setTimeout(() => {
                this.input.focus();
            }, 1)
        }, 1)
    }
    onChange(text) {
        this.setState({ text: text });
        this.props.navigation.state.params.changeHandle(text);
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <ScrollView style={{ flex: 1, paddingHorizontal: 22 }}>
                    <View style={{ minHeight: 3000 }}>
                        <TextInput
                            onChangeText={(text) => this.onChange(text)}
                            value={this.state.text}
                            style={{ fontSize: 14, marginTop: 10, lineHeight: 20, textAlignVertical: 'top' }}
                            ref={ref => this.input = ref}
                            multiline={true}
                            numberOfLines={50}
                        />
                    </View>
                </ScrollView>
            </View>
        )
    }
}

const styles = StyleSheet.create({})
