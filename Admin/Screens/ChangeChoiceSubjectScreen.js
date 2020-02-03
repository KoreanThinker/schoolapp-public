import React, { Component } from 'react'
import { Text, View, ActivityIndicator, Dimensions, TouchableOpacity, Alert } from 'react-native'
import gql from 'graphql-tag'
import { Colors } from '../Components/Asset';
import { Query, Mutation } from 'react-apollo'
import { BaseButton, ScrollView } from 'react-native-gesture-handler';
import MyActionSheet from '../Components/MyActionSheet';

const updateChoice = gql`
mutation updateChoiceSubject($grade: Int, $choice: [ChoiceInput]) {
    updateChoiceSubject(grade: $grade, choice: $choice) {
        grade
    }
}
`
const getSubjectList = gql`
query getResource($key: String!) {
    getResource(key: $key) {
        values
    }
}
`
const getChoice = gql`
query getChoiceSubject($grade: Int!) {
    getChoiceSubject(grade: $grade) {
        choice {
            number
            choices
        }
    }
}
`


const WIDTH = Dimensions.get('window').width;

export default class ChangeChoiceSubjectScreen extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title: '선택과목변경',
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
            subjectList: [],
            grade: this.props.navigation.state.params.grade,
            clicked: 0
        }
    }

    componentDidMount() {
        this.props.navigation.setParams({ myUpdateHandle: this._updateHandle });
    }
    _updateHandle = () => {
        if (this.state.data === null) return;
        this.updateSubjects({ variables: { grade: this.state.grade, choice: this.state.data } }).then(res => {
            this.setState({ updating: false });
            this.props.navigation.goBack();
        });
    }
    _onUnvisible = (index) => {
        let d = this.state.data.filter(t => true);
        d.push({ number: index + 1, choices: [] });
        this.setState({ data: d, visible: false });
    }

    _onUnvisible1 = (index) => {
        const text = this.state.subjectList[index];
        this.setState({ visible1: false });
        for (let i = 0; i < this.state.data[this.state.clicked].choices.length; i++) {
            if (this.state.data[this.state.clicked].choices[i] === text) {
                Alert.alert("이미 존재하는 과목입니다");
                return;
            }
        }
        let d = this.state.data;
        d[this.state.clicked].choices.push(text);
        this.setState({ data: d });
    }
    render() {
        return (
            <Query query={getChoice} variables={{ grade: this.state.grade }} fetchPolicy='network-only' onCompleted={data => {
                let d = data.getChoiceSubject.choice;
                for (let i = 0; i < d.length; i++) {
                    delete d[i].__typename;
                }
                this.setState({ data: d });
            }}>
                {({ loading }) => {
                    if (loading || this.state.updating || this.state.data === null) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color='#ddd' size='large' /></View>
                    return <Mutation mutation={updateChoice} >
                        {(updateSubjects) => {
                            if (this.updateSubjects === undefined) this.updateSubjects = updateSubjects;
                            return <ScrollView style={{ flex: 1 }}>
                                {this.state.data.map((info, index) =>
                                    <View key={index} style={{ width: WIDTH, height: 50, borderBottomColor: '#dbdbdb', borderBottomWidth: 0.5, flexDirection: 'row', alignItems: 'center' }}>
                                        <View style={{ width: 50, height: 50, alignItems: 'center', justifyContent: 'center' }}>
                                            <Text style={{ fontSize: 10 }}>{info.number}개 선택</Text>
                                        </View>
                                        <View style={{ width: WIDTH - 110, borderRightColor: '#dbdbdb', borderLeftColor: '#dbdbdb', borderRightWidth: 0.5, borderLeftWidth: 0.5 }}>
                                            <ScrollView style={{ flex: 1 }} horizontal={true} showsHorizontalScrollIndicator={false}>
                                                <View style={{ width: 20 }} />
                                                {info.choices.map((info2, index2) => <TouchableOpacity onPress={() => {
                                                    let d = this.state.data.filter(t => true);
                                                    d[index].choices.splice(index2, 1);
                                                    this.setState({ data: d });
                                                }} key={index2} style={{ height: 30, paddingHorizontal: 5, borderRadius: 15, borderColor: '#dbdbdb', borderWidth: 0.5, marginRight: 20, alignSelf: 'center', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Text style={{ fontSize: 14 }}>{info2}  ×</Text>
                                                </TouchableOpacity>)}
                                            </ScrollView>
                                        </View>
                                        <TouchableOpacity onPress={() => { this.setState({ visible1: true, clicked: index }) }} style={{ width: 30, height: 50, alignItems: 'center', justifyContent: 'center' }}>
                                            <Text style={{ fontSize: 24 }}>+</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => {
                                            let d1 = [];
                                            for (let k = 0; k < this.state.data.length; k++) {
                                                if (k !== index) d1.push(this.state.data[k]);
                                            }
                                            this.setState({ data: d1 });
                                        }} style={{ width: 30, height: 50, alignItems: 'center', justifyContent: 'center' }}>
                                            <Text style={{ fontSize: 24 }}>×</Text>
                                        </TouchableOpacity>
                                    </View>)}

                                <TouchableOpacity onPress={() => {
                                    this.setState({ visible: true })
                                }} style={{ width: WIDTH, height: 50, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 24 }}>+</Text>
                                </TouchableOpacity>

                                <MyActionSheet
                                    visible={this.state.visible}
                                    contents={['1개 선택', '2개 선택', '3개 선택', '4개 선택']}
                                    onClicked={this._onUnvisible}
                                    closeHandle={() => this.setState({ visible: false })} />
                                <MyActionSheet
                                    visible={this.state.visible1}
                                    contents={this.state.subjectList}
                                    onClicked={this._onUnvisible1}
                                    closeHandle={() => this.setState({ visible1: false })} />
                                <Query query={getSubjectList} variables={{ key: 'subjectList' }} fetchPolicy='network-only' onCompleted={data => {
                                    this.setState({ subjectList: data.getResource.values })
                                }}>
                                    {({ data, loading, refetch }) => {
                                        return null
                                    }}
                                </Query>
                            </ScrollView>
                        }}
                    </Mutation>
                }}
            </Query>
        )
    }
}
