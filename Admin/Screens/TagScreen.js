import React, { Component } from 'react'
import { Text, View, ActivityIndicator, Dimensions, TouchableOpacity, Alert, AsyncStorage } from 'react-native'
import gql from 'graphql-tag'
import { Colors } from '../Components/Asset';
import { Query, Mutation } from 'react-apollo'
import { BaseButton, ScrollView } from 'react-native-gesture-handler';
import MyActionSheet from '../Components/MyActionSheet';
import Constants from 'expo-constants';
import DialogInput from 'react-native-dialog-input';

const getTags = gql`
query getTags {
    getTags {
        groups {
            items
        }
    }
}
`
const updateTags = gql`
mutation updateTags($input: UpdateTagsInput!, $adminid: String) {
    updateTags(input: $input, adminid: $adminid) {
        key
    }
}
`

const WIDTH = Dimensions.get('window').width;

export default class TagScreen extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title: '태그수정',
            headerRight: (
                <BaseButton onPress={navigation.getParam('myUpdateHandle')} style={{ alignItems: 'center', justifyContent: 'center', height: 50, width: 50 }} >
                    <Text style={{ color: Colors.highlightBlue, fontSize: 18 }}>수정</Text>
                </BaseButton>
            ),
        }
    };

    constructor(props) {
        super(props);
        this.state = {
            data: null,
            updating: false,
            visible: false,
            visible1: false,
            tagList: [],
            clicked: 0,
            userid: null,
        }
    }

    async componentDidMount() {
        this.props.navigation.setParams({ myUpdateHandle: this._updateHandle });
        let id = await AsyncStorage.getItem('ID');
        this.setState({ userid: id });

    }
    _updateHandle = () => {
        if (this.state.updating) return;
        this.setState({ updating: true });
        const input = {
            groups: this.state.data,
        }
        this.updateSubjects({ variables: { input: input, adminid: `${this.state.userid}(${Constants.deviceName})` } }).then(res => {
            this.setState({ updating: false });
            this.props.navigation.goBack();
        });
    }
    _onUnvisible = (text) => {
        this.setState({ visible1: false });
        for (let i = 0; i < this.state.data[this.state.clicked].items.length; i++) {
            if (this.state.data[this.state.clicked].items[i] === text) {
                Alert.alert("중복");
                return;
            }
        }
        let d = this.state.data;
        d[this.state.clicked].items.push(text);
        this.setState({ data: d });
    }
    render() {
        return (
            <Query query={getTags} fetchPolicy='network-only' onCompleted={data => {
                const d = data.getTags.groups;
                for (let i = 0; i < 4; i++) {
                    delete d[i].__typename;
                }
                this.setState({ data: d });
            }}>
                {({ loading }) => {
                    if (loading || this.state.updating || this.state.data === null) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color='#ddd' size='large' /></View>
                    return <Mutation mutation={updateTags} >
                        {(updateSubjects) => {
                            if (this.updateSubjects === undefined) this.updateSubjects = updateSubjects;
                            return <ScrollView style={{ flex: 1 }}>
                                {this.state.data.map((info, index) =>
                                    <View key={index} style={{ width: WIDTH, height: 70, borderBottomColor: '#dbdbdb', borderBottomWidth: 0.5, flexDirection: 'row', alignItems: 'center' }}>
                                        <View style={{ width: WIDTH - 40, borderRightColor: '#dbdbdb', borderLeftColor: '#dbdbdb', borderRightWidth: 0.5, borderLeftWidth: 0.5 }}>
                                            <ScrollView style={{ flex: 1 }} horizontal={true} showsHorizontalScrollIndicator={false}>
                                                <View style={{ width: 20 }} />
                                                {info.items.map((info2, index2) => <TouchableOpacity onPress={() => {
                                                    let d = this.state.data.filter(t => true);
                                                    d[index].items.splice(index2, 1);
                                                    this.setState({ data: d });
                                                }} key={index2} style={{ height: 30, paddingHorizontal: 5, borderRadius: 15, borderColor: '#dbdbdb', borderWidth: 0.5, marginRight: 20, alignSelf: 'center', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Text style={{ fontSize: 14 }}>{info2}  ×</Text>
                                                </TouchableOpacity>)}
                                            </ScrollView>
                                        </View>
                                        <TouchableOpacity onPress={() => { this.setState({ visible1: true, clicked: index }) }} style={{ width: 40, height: 50, alignItems: 'center', justifyContent: 'center' }}>
                                            <Text style={{ fontSize: 24 }}>+</Text>
                                        </TouchableOpacity>
                                    </View>)}
                                <DialogInput isDialogVisible={this.state.visible1}
                                    title={"태그입력"}
                                    message={"4글자 이내로 해주세요"}
                                    hintInput={"수학1 X / 수학 O"}
                                    submitInput={this._onUnvisible}
                                    closeDialog={() => { this.setState({ visible1: false }) }} />
                            </ScrollView>
                        }}
                    </Mutation>
                }}
            </Query>
        )
    }
}
