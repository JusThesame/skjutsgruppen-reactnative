import React, { Component } from 'react';
import { View, TextInput, StyleSheet, Image, ToastAndroid as Toast, Text, Picker, FlatList, Modal, TouchableOpacity } from 'react-native';
import Colors from '@theme/colors';
import Container from '@components/auth/container';
import CustomButton from '@components/common/customButton';
import { ColoredText, GreetText } from '@components/auth/texts';
import { Loading } from '@components/common';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'react-apollo';
import AuthAction from '@redux/actions/auth';
import AuthService from '@services/auth/auth';
import { withUpdateProfile } from '@services/apollo/auth';
import { NavigationActions } from 'react-navigation';
import countries from '@config/countries';
import { Icons } from '@icons';

const styles = StyleSheet.create({
  garderIcon: {
    height: 100,
    width: 100,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 24,
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 32,
  },
  countryCodeWrapper: {
    flexDirection: 'row',
    backgroundColor: Colors.background.fullWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countryCode: {
    height: '100%',
    paddingHorizontal: 12,
  },
  input: {
    padding: 16,
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: Colors.background.fullWhite,
    marginBottom: 0,
  },
  firstInputWrapper: {
    marginBottom: 12,
  },
  divider: {
    width: '80%',
    height: 1,
    marginVertical: 32,
    backgroundColor: Colors.background.lightGray,
  },
  customPicker: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 12,
    paddingVertical: 24,
  },
  pickerContent: {
    flex: 1,
    backgroundColor: Colors.background.fullWhite,
    borderRadius: 2,
    paddingVertical: 12,
  },
  pickerItem: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    fontSize: 16,
    color: '#333',
  },
  selected: {
    backgroundColor: '#eee',
    color: Colors.text.gray,
  },
  buttonWrapper: {
    marginHorizontal: 24,
  },
});

class Verified extends Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    this.state = ({ firstName: '', lastName: '', countryCode: '+977', phone: '', password: '', loading: false, error: '', modalVisibility: false });
  }

  componentWillMount() {
    const { auth } = this.props;
    if (auth.login) {
      this.navigateTo('Tab');
    }
  }

  onSubmit = () => {
    this.setState({ loading: true });
    const { updateProfile, updateUser } = this.props;
    const { firstName, lastName, countryCode, phone, password } = this.state;

    const validation = this.checkValidation();

    if (validation.pass()) {
      try {
        updateProfile(firstName, lastName, '', countryCode + phone, password).then(({ data }) => {
          const { token, User } = data.updateUser;
          updateUser({ token, user: User }).then(() => {
            this.navigateTo('Tab');
          });
        }).catch((err) => {
          this.setState({ loading: false, error: err.message });
        });
      } catch (err) {
        this.setState({ loading: false, error: err.message });
      }
    } else {
      Toast.show(validation.errors.join('\n'), Toast.LONG);
      this.setState({ loading: false });
    }
  }

  setModalVisibility = (visibility) => {
    this.setState({ modalVisibility: visibility });
  }

  navigateTo = (routeName) => {
    const { navigation } = this.props;
    navigation.navigate(routeName);
    const resetAction = NavigationActions.reset({
      index: 0,
      key: null,
      actions: [NavigationActions.navigate({ routeName })],
    });
    navigation.dispatch(resetAction);
  }

  checkValidation() {
    const errors = [];
    const { firstName, lastName, phone, password } = this.state;

    if (firstName === '') {
      errors.push('First Name is required.');
    }

    if (lastName === '') {
      errors.push('Last Name is required.');
    }

    if (phone === '') {
      errors.push('Phone is required.');
    }

    if (password === '') {
      errors.push('Password is required.');
    }

    return {
      pass: () => (errors.length === 0),
      errors,
    };
  }

  changeCountryCode = (countryCode) => {
    this.setState({ countryCode });
    this.setModalVisibility(false);
  }

  renderCountryCode = () => countries.map(country => (
    <Picker.Item
      key={country.code}
      label={`${country.dial_code} - ${country.name}`}
      value={country.dial_code}
    />
  ));

  renderButton = () => {
    const { loading } = this.state;

    if (loading) {
      return <Loading />;
    }

    return (
      <CustomButton
        bgColor={Colors.background.green}
        onPress={this.onSubmit}
        style={styles.buttonWrapper}
      >
        Next
      </CustomButton>
    );
  }


  renderPickerList = () => (
    <FlatList
      data={countries}
      keyExtractor={(item, index) => index}
      renderItem={({ item }, index) => this.renderPickerItem(item, index)}
      onPressItem={this.changeCountryCode}
    />
  )

  renderPickerItem = ({ dial_code, code, name }) => {
    const selected = this.state.countryCode === dial_code ? styles.selected : [];
    return (
      <Text
        key={code}
        style={[styles.pickerItem, selected]}
        onPress={() => this.changeCountryCode(dial_code)}
      >
        {`${dial_code} - ${name}`}
      </Text>
    );
  }

  render() {
    const message = 'Great job! \n Now fill in your name';
    const { error } = this.state;
    return (
      <Container>
        <Image source={Icons.Garden} style={styles.garderIcon} resizeMethod="resize" />
        <GreetText>Your e-mail is confirmed!</GreetText>
        <ColoredText color={Colors.text.purple}>{message}</ColoredText>

        {(error !== '') ? (<View><Text>{error}</Text></View>) : null}

        <View style={[styles.inputWrapper, styles.firstInputWrapper]}>
          <TextInput
            style={[styles.input, styles.firstNameInput]}
            placeholder="Your first name"
            underlineColorAndroid="transparent"
            onChangeText={firstName => this.setState({ firstName })}
          />
        </View>
        <View style={styles.inputWrapper}>
          <TextInput
            style={[styles.input, styles.firstNameInput]}
            placeholder="Your last name"
            underlineColorAndroid="transparent"
            onChangeText={lastName => this.setState({ lastName })}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Picker
            selectedValue={this.state.countryCode}
            onValueChange={countryCode => this.setState({ countryCode })}
          >
            {this.renderCountryCode()}
          </Picker>
        </View>

        <View style={[styles.inputWrapper, styles.firstInputWrapper]}>
          {/* <TouchableOpacity onPress={() => this.setModalVisibility(true)}>
            <Text>{this.state.countryCode}</Text>
          </TouchableOpacity> */}
          <TextInput
            keyboardType="phone-pad"
            style={[styles.input, styles.firstNameInput]}
            placeholder="Your Mobile number"
            underlineColorAndroid="transparent"
            onChangeText={phone => this.setState({ phone })}
          />
        </View>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            underlineColorAndroid="transparent"
            onChangeText={password => this.setState({ password })}
          />
        </View>
        <Modal
          transparent
          visible={this.state.modalVisibility}
        >
          <View
            style={styles.customPicker}
          >
            <View style={styles.pickerContent}>
              {
                this.renderPickerList()
              }
            </View>
          </View>
        </Modal>
        {this.renderButton()}
      </Container>
    );
  }
}

Verified.propTypes = {
  updateProfile: PropTypes.func.isRequired,
  auth: PropTypes.shape({
    user: PropTypes.object,
    login: PropTypes.bool,
  }).isRequired,
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
  }).isRequired,
  updateUser: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({ auth: state.auth });
const mapDispatchToProps = dispatch => ({
  updateUser: ({ user, token }) => AuthService.setUser(user)
    .then(() => dispatch(AuthAction.login({ user, token }))),
  logout: () => AuthService.logout()
    .then(() => dispatch(AuthAction.logout()))
    .catch(error => console.error(error)),
});

export default compose(withUpdateProfile, connect(mapStateToProps, mapDispatchToProps))(Verified);
