import React, { Component } from 'react'
import { Text, StyleSheet, View, Modal, Dimensions, Platform, TouchableWithoutFeedback, ActionSheetIOS, ScrollView } from 'react-native'
import { BaseButton } from 'react-native-gesture-handler';


const WIDTH = Dimensions.get('window').width;
const myWidth = 230;
const OS = Platform.OS;

export default class MyActionSheet extends Component {

    clicked(index) {
        this.props.closeHandle();

        this.props.onClicked(index);
    }
    _iosSelector = () => {
        if (OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: ['취소', ...this.props.contents],
                    cancelButtonIndex: 0,
                },
                (buttonIndex) => {
                    this.props.closeHandle();
                    this.props.onClicked(buttonIndex - 1);
                },
            );
        }
    }

    render() {
        const { visible, contents } = this.props;
        return (
            <Modal
                animationType={OS === 'android' ? "fade" : 'none'}
                transparent={true}
                visible={visible}
                onRequestClose={this.props.closeHandle}
                onShow={this._iosSelector}
            >
                {OS === 'android' &&
                    <TouchableWithoutFeedback onPress={this.props.closeHandle}>
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#80808080' }}>
                            <ScrollView style={{ width: myWidth, backgroundColor: 'white', borderRadius: 10, overflow: 'hidden', maxHeight: 500 }}>
                                {contents.map((data, index) =>
                                    <View key={index}>
                                        <TouchableWithoutFeedback onPress={() => this.clicked(index)}>
                                            <View style={{ borderBottomColor: '#dbdbdb', borderBottomWidth: 0.5, height: 50, width: myWidth, alignItems: 'center', justifyContent: 'center' }}>
                                                <Text style={{ fontSize: 16 }}>{data}</Text>
                                            </View>
                                        </TouchableWithoutFeedback>
                                    </View>
                                )}
                                <View>
                                    <TouchableWithoutFeedback onPress={this.props.closeHandle} >
                                        <View accessible style={{ height: 50, width: myWidth, alignItems: 'center', justifyContent: 'center' }}>
                                            <Text style={{ fontSize: 16 }}>취소</Text>
                                        </View>
                                    </TouchableWithoutFeedback>
                                </View>
                            </ScrollView>
                        </View>
                    </TouchableWithoutFeedback>}
            </Modal>
        )
    }
}

const styles = StyleSheet.create({})
