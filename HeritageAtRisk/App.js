import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TextInput,
  Button,
  TouchableOpacity,
  FlatList,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import {

} from 'react-native-camera';
const LoginScreen = () => {
  // API key
  const consumerKey = 'ac0842a888e611e58224c80aa9c8e9fb'
  const consumerSecret = '4f5898427a66a802cd052b4bebace407259d16be'

  //email and password storage
  const [email, onChangeEmail] = React.useState('')
  const [password, onChangePassword] = React.useState('')

  // implement input value
  const [emailError, emailErrorStatus] = React.useState(false)
  const [passError, passErrorStatus] = React.useState(false)

  const EmailErrorMessage = () => {
    if(emailError) {
      if(email == '') {
        return (
          <Text style={{color: 'white',}}>
            You can't levave this empty!
          </Text>
        );
      } else {
        return (
          <Text style={{color: 'white',}}>
            Invalid email address!
          </Text>
        );
      }
    } else {
      return (
        <Text></Text>
      );
    }
  };
  const PassErrorMessage = () => {
    if(passError) {
      return (
        <Text style={{color: 'white',}}>
          You can't leave this empty!
        </Text>
      );
    } else {
      return (
        <Text></Text>
        );
      }
    };
    
    // click eye icon event
    const [readablePass, onChangeReadablePass] = React.useState(false)
    const EyePressEvent = () => {
      if(readablePass){
        onChangeReadablePass(false)
      } else {
        onChangeReadablePass(true)
      };
    };  
    const PasswordField = () => {
      if(readablePass){
        return (
          <View style={styles.eyeBox}>
          <TouchableOpacity onPress={() => EyePressEvent()}>
            <Image style={styles.eye} source={require('./ic_eye_slash.png')}/>
          </TouchableOpacity>
        </View>
      );
    } else {
      return (
        <View style={styles.eyeBox}>
          <TouchableOpacity onPress={() => EyePressEvent()}>
            <Image style={styles.eye} source={require('./ic_eye.png')}/>
          </TouchableOpacity>
        </View>
        );
      };
    };
    
    // email box focus event
    const regex = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
    const [onFocusEmailInputBox, onChangeEmailBoxFocusState] = React.useState(false)
    
    const emailBoxFocusEvent = (val) => {
      //switch focus state
      if(val){
        onChangeEmailBoxFocusState(true)
      } else {
        onChangeEmailBoxFocusState(false)
        
        // validate email
        if(!regex.test(email)) {
          emailErrorStatus(true)
        } else {
          emailErrorStatus(false)
        }
      }
    }
    const emailBorderColor = () => {
      if(onFocusEmailInputBox){
        return '#208AD4'
      } else {
        return '#757575'
      }
    }
    // password box focus event
    const [onFocusPassInputBox, onChangePassBoxFocusState] = React.useState(false)
    
    const passBoxFocusEvent = (val) => {
      //switch focus state
      if(val){
        onChangePassBoxFocusState(true)
      } else {
        onChangePassBoxFocusState(false)
        
        // validate password
        if(password == '') {
          passErrorStatus(true)
        } else {
          passErrorStatus(false)
        }
      }
    }
    const passBorderColor = () => {
      if(onFocusPassInputBox){
        return '#208AD4'
      } else {
        return '#8F2227'
      }
    }
    const ConnectHandler = () => {
      var err = false
  
      // validate password
      if(password == '') {
        err = true
      }
      
      // validate email
      if(!regex.test(email)) {
        err = true
      }
      //if no error occurs 
      if(!err) {
        fetch('https://api.heobs.org/account/session', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-API-Key' : consumerKey,
            'X-API-Sig' : consumerSecret,
  
          },
          body: JSON.stringify({
            'email_address' : email,
            'password' : password,
            })
          })
          .then((response) => response.json())
          .then((json) => {
            console.log(json);
          })
          .catch((error) => {
            console.error(error);
          });
      }
    };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.mainContainer}>
        {/* display the logo */}
        <Image style={styles.logo} source={require('./logo_har.2.0.png')}/>
        {/* Email input box */}
        <TextInput 
          style={{
            marginTop: 10, 
            height: 40,
            width: 350,
            backgroundColor: 'white',
            borderRadius: 4,
            borderWidth: 2,
            borderColor: emailBorderColor(),
          }}
          placeholder="Email address" 
          value={email} 
          onFocus={() => emailBoxFocusEvent(true)}
          onBlur={() => emailBoxFocusEvent(false)}
          onChangeText={(val) => onChangeEmail(val)}
        />
        <View style={styles.emailErrorBox}>
          <EmailErrorMessage/>
        </View>
        {/* Password input box */}
        <TextInput 
          style={{
            marginTop: 10, 
            height: 40,
            width: 350,
            backgroundColor: 'white',
            borderRadius: 4,
            borderWidth: 2,
            borderColor: passBorderColor(),
          }}
          placeholder="Password" 
          value={password} 
          onFocus={() => passBoxFocusEvent(true)}
          onBlur={() => passBoxFocusEvent(false)}
          onChangeText={(val) => onChangePassword(val)}
          secureTextEntry={readablePass}
        />
        <View style={styles.passErrorBox}>
          <PassErrorMessage/>
        </View>
        <PasswordField/>
        {/* Forgot password option */}
        <View style={styles.forgotPassBox}>
          <TouchableOpacity 
            style={styles.containerText} 
            onPress={() => console.log("Forgot password!")}>
            <Text style={{color: 'white'}}>
              Forgot password?
            </Text>
          </TouchableOpacity>
        </View>
        {/* connect button */}
        <View style={styles.connectButton}>
          <Button 
            onPress={() => ConnectHandler()} 
            title={'Connect'}
          />
        </View>
        {/* create account option */}
        <View style={styles.signUpBox}>
          <TouchableOpacity onPress={() => console.log("Create account!")}>
            <Text style={{color: 'white'}}>
              Don't have an account? We are creating one for you.
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const ReportListPage = () => {
  // reports storage 
  const [reports, updaterReports] = React.useState([
    {
      title: 'Notre-Dame Cathedral Basilica of Saigon',
      address: 'district 1, Ho Chi Minh City',
      date: '2019-10-05',
      key: '1',
    },
    {
      title: 'Saigon Central Post Office',
      address: 'district 1, Ho Chi Minh City',
      date: '2019-10-13',
      key: '2',
    },
    {
      title: 'Ho Chi Minh City Hall',
      address: 'district 1, Ho Chi Minh City',
      date: '2019-10-28',
      key: '3',
    },
    {
      title: 'Mansion Phương Nam',
      address: 'district 3, Ho Chi Minh City',
      date: '2019-11-03',
      key: '4',
    },
    {
      title: 'Mansion NGUYỄN Bửu Long',
      address: 'district Tan Binh, Ho Chi Minh City',
      date: '2019-11-07',
      key: '5',
    },
    {
      title: 'Notre-Dame Cathedral Basilica of Saigon',
      address: 'district 1, Ho Chi Minh City',
      date: '2019-10-05',
      key: '6',
    },
    {
      title: 'Saigon Central Post Office',
      address: 'district 1, Ho Chi Minh City',
      date: '2019-10-13',
      key: '7',
    },
    {
      title: 'Ho Chi Minh City Hall',
      address: 'district 1, Ho Chi Minh City',
      date: '2019-10-28',
      key: '8',
    },
    {
      title: 'Mansion Phương Nam',
      address: 'district 3, Ho Chi Minh City',
      date: '2019-11-03',
      key: '9',
    },
    {
      title: 'Mansion NGUYỄN Bửu Long',
      address: 'district Tan Binh, Ho Chi Minh City',
      date: '2019-11-07',
      key: '10',
    },
    {
      title: 'Notre-Dame Cathedral Basilica of Saigon',
      address: 'district 1, Ho Chi Minh City',
      date: '2019-10-05',
      key: '11',
    },
    {
      title: 'Saigon Central Post Office',
      address: 'district 1, Ho Chi Minh City',
      date: '2019-10-13',
      key: '12',
    },
    {
      title: 'Ho Chi Minh City Hall',
      address: 'district 1, Ho Chi Minh City',
      date: '2019-10-28',
      key: '13',
    },
    {
      title: 'Mansion Phương Nam',
      address: 'district 3, Ho Chi Minh City',
      date: '2019-11-03',
      key: '14',
    },
    {
      title: 'Mansion NGUYỄN Bửu Long',
      address: 'district Tan Binh, Ho Chi Minh City',
      date: '2019-11-07',
      key: '15',
    },
  ]);
  
  const Reports = () => {
    var onCloud = true

    //oncloud event
    const OnCloud = () => {
      if(onCloud) {
        return (
          <View>
            <Image style={{marginLeft: 10}} source={require('./oncloud.png')}/>
          </View>
        );
      } else {
        return (
          <View>
            <Image style={{marginLeft: 10}} source={require('./notoncloud.png')}/>
          </View>
        );
      }
    }
    const reportBackgroundColor = (item) => {
      if(item.key%2==0){
        return '#E26971'
      } else {
        return '#DE535C'
      }
    }

    const Report = ({item}) => {
        return (
          <TouchableOpacity onPress={() => console.log('Go to report page!!')}>
            <View style={{
                height: 60,
                width: 412,
                backgroundColor: reportBackgroundColor(item),
                flexDirection: 'row',
                alignContent: 'center'
              }}>
              <View style={{flexDirection: 'column'}}>
                <View style={styles.reportTitleContainer}>
                  <Text style={styles.reportTitle}>{item.title}</Text>
                </View>
                <View style={styles.reportInfoContainer}>
                  <View style={{width: 200, flexDirection: "row"}}>
                    <Image style={{width: 6, height: 10, marginTop: 4, marginRight: 5}} source={require('./location.png')}/>
                    <Text style={styles.reportInfo}>{item.address}</Text>
                  </View>
                  <View style={{flexDirection: 'row'}}>
                    <Image style={{width: 10, height: 10, marginRight: 5, marginTop: 3, marginLeft: 60}} source={require('./clock.png')}/>
                    <Text style={styles.reportInfo}>{item.date}</Text>
                  </View>
                </View>
              </View>  
              <View style={{flex: 1, flexDirection: 'row', justifyContent:'center', marginTop: 20}}>
                <TouchableOpacity onPress={() => console.log('remove report!!')}>
                  <View>
                    <Image source={require('./trashcan.png')}/>
                  </View>
                </TouchableOpacity>
                <OnCloud/>
              </View>
            </View>
          </TouchableOpacity>
        );
    }
    return (
      <FlatList
      data={reports}
      renderItem={({item}) => (
        <Report item={item}/>
        )}
        />
        );
      }
      
      return (
    <View style={styles.mainContainer}>
      {/* Header section */}
      <View style={styles.reportListHeader}>
        <Image style={styles.reportListHeaderImage} source={require('./logo_har.2.0.png')}/>
        <View style={{width: 345}}></View>
        <TouchableOpacity onPress={() => console.log('go to setting page!!')}>
          <Image style={styles.reportListHeaderMenuIcon} source={require('./menu_icon.png')}/>
        </TouchableOpacity>
      </View>
      {/* Report list section */}
      <View style={{height: 615,}}>
        <Reports/>
      </View>
      <TouchableOpacity 
        style={{
          borderRadius: 25, 
          width:50, 
          height: 50, 
          marginBottom: 18, 
          marginLeft: 315, 
          marginTop: -65,
        }} 
        onPress={() => console.log('Add report!!')}>
        <View style={{marginBottom: 25,}}>
          <Image style={{}} source={require('./bluecircle.png')}/>
          <Image style={{marginTop: -35, marginLeft: 12}} source={require('./camera.png')}/>
        </View>
      </TouchableOpacity>
    </View>
  );
}; 

const SettingPage = () => {
  return (
    <View style={{flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)'}}>
      <View style={{backgroundColor: 'rgb(236,37,60)', width: 315, height: 731, marginLeft: 96,}}>
      </View>
    </View>
  );
};

// Report page
const ReportPage = () => {
  return (
    <View style={styles.mainContainer}>
      {/* Header section */}
      <View style={styles.reportListHeader}>
        <Image style={styles.reportListHeaderImage} source={require('./logo_har.2.0.png')}/>
        <View style={{width: 295}}></View>
        <Button title={'Cancel'} onPress={() => console.log('Cancel')}/>
      </View>
    </View>
  )
}

const App = () => {
  return (
    <ReportPage/>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: 'rgb(236,37,60)',
    alignItems: 'center',
  },
  logo: {
    marginTop: 10,
    width: 200,
    height: 200,
  },
  containerText: {
    marginLeft: 235,
    fontFamily: 'Roboto',
    fontStyle: 'normal',
    fontWeight:'normal',
    fontSize: 14,
    display: 'flex',
  },
  connectButton: {
    backgroundColor: 'blue',
    height: 40,
    width: 350,
    top: -35,
    borderRadius: 4,
    borderWidth:0,    
    fontFamily: 'Roboto',
    fontStyle: 'normal',
    fontWeight:'normal',
    fontSize: 14,
  },
  eye: {
    width:30,
    height:20,
  },
  eyeBox: {
    left: 155,
    top: -50,
    width:30,
    height:20,
  },
  signUpBox: {
    alignItems: 'center',
    alignContent: 'center',
    top: -38,
    right: 10,
    width: 350,
    height: 20,
  },
  emailErrorBox: {
    width: 350,
  },  
  passErrorBox: {
    width: 350,
  },
  reportListHeader: {
    height: 52,
    width: 412,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#8F2227',
    flexDirection: 'row',
  },
  reportListHeaderImage: {
    width: 36,
    height: 36,
    marginLeft: 4,
  },
  reportListHeaderMenuIcon: {
    width: 35,
    height: 25,
  },
  reportInfoContainer: {
    marginLeft: 10, 
    width: 334,
    height: 24, 
    flexDirection: 'row',
    alignContent: 'center',
  },
  reportTitleContainer: {
    marginLeft: 10,
    marginTop: 5, 
    width: 334,
    height: 24, 
    justifyContent: "center",
  },
  reportInfo: {
    fontFamily: 'Roboto',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: 12,
    color: 'white',
  },
  reportTitle: {
    fontFamily: 'Roboto',
    fontStyle: 'normal',
    fontWeight: 'bold',
    fontSize: 14,
    color: 'white',
  },  
});

export default App;