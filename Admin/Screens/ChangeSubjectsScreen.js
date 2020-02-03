import React, { Component } from 'react'
import { Text, View, ActivityIndicator, Dimensions, TouchableOpacity, Alert } from 'react-native'
import gql from 'graphql-tag'
import { Colors } from '../Components/Asset';
import { Query, Mutation } from 'react-apollo'
import { BaseButton, ScrollView } from 'react-native-gesture-handler';
import DialogInput from 'react-native-dialog-input';

const getSubjects = gql`
query getResource($key: String!) {
    getResource(key: $key) {
        values
    }
}
`
const updateSubjects = gql`
mutation updateResource($key: String!, $values: [String]) {
    updateResource(key: $key, values: $values) {
        values
    }
}
`

const WIDTH = Dimensions.get('window').width;

export default class ChangeSubjectsScreen extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title: '과목수정',
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
            isDialogVisible: false,
        }
    }

    componentDidMount() {
        this.props.navigation.setParams({ myUpdateHandle: this._updateHandle });
    }
    _updateHandle = () => {
        if (this.state.data === null) return;
        this.updateSubjects({ variables: { key: "subjectList", values: this.state.data } }).then(res => {
            this.setState({ updating: false });
            this.props.navigation.goBack();
        });
    }
    _onUnvisible = (text) => {
        this.setState({ isDialogVisible: false });
        for (let i = 0; i < this.state.data.length; i++) {
            if (this.state.data[i] === text) {
                Alert.alert("이미 존재하는 과목입니다");
                return;
            }
        }
        let d = this.state.data;
        d.push(text);
        this.setState({ data: d });
    }
    render() {
        return (
            <Query query={getSubjects} variables={{ key: 'subjectList' }} fetchPolicy='network-only' onCompleted={data => {
                this.setState({ data: data.getResource.values });
            }}>
                {({ loading }) => {
                    if (loading || this.state.updating || this.state.data === null) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color='#ddd' size='large' /></View>
                    return <Mutation mutation={updateSubjects} >
                        {(updateSubjects) => {
                            if (this.updateSubjects === undefined) this.updateSubjects = updateSubjects;
                            return <ScrollView style={{ flex: 1 }}>
                                {this.state.data.map((info, index) =>
                                    <View key={index} style={{ width: WIDTH, height: 50, borderBottomColor: '#dbdbdb', borderBottomWidth: 0.5, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Text style={{ fontSize: 16, marginLeft: 20 }}>{info}</Text>
                                        <TouchableOpacity onPress={() => {
                                            let d = this.state.data.filter(t => t !== info);
                                            this.setState({ data: d });
                                        }} style={{ width: 50, height: 50, alignItems: 'center', justifyContent: 'center' }}>
                                            <Text style={{ fontSize: 24, marginRight: 20 }}>×</Text>
                                        </TouchableOpacity>
                                    </View>)}
                                <TouchableOpacity onPress={() => { this.setState({ isDialogVisible: true }) }} style={{ width: WIDTH, height: 50, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 24 }}>+</Text>
                                </TouchableOpacity>
                                <DialogInput isDialogVisible={this.state.isDialogVisible}
                                    title={"과목입력"}
                                    message={"자세히 입력해주세요"}
                                    hintInput={"예) 수학 X / 수학1 O"}
                                    submitInput={this._onUnvisible}
                                    closeDialog={() => { this.setState({ isDialogVisible: false }) }}>
                                </DialogInput>
                            </ScrollView>
                        }}
                    </Mutation>
                }}
            </Query>
        )
    }
}
