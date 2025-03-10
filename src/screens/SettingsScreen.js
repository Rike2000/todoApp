import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getUserColor, updateUserColor } from '../services/todoService';
import ColorPicker, { Panel1, Swatches, Preview, OpacitySlider, HueSlider } from 'reanimated-color-picker';
import Icon from "react-native-vector-icons/FontAwesome6";

const SettingsScreen = () => {
    const [color, setColor] = useState("");
    const auth = getAuth();
    const user = auth.currentUser;

    useEffect(() => {
        const fetchColor = async () => {
            try {
                const userColor = await getUserColor();
                setColor(userColor);
            } catch (error) {
                console.error("Failed to fetch user color:", error);
            }
        };
    
        fetchColor();
    }, [user]);
    

    const handleColorChange = (newColor) => {
        setColor(newColor.hex);
    };

    const handleSaveColor = async () => {
        if (user) {
            try {
                await updateUserColor(user.uid, color);
                if (Platform.OS ==="web") {
                    window.alert("Color updated successfully!")
                } else (
                    Alert.alert('Success', 'Color updated successfully!')
                )
            } catch (error) {
                Alert.alert('Error', 'Failed to update color. Please try again.');
                console.log(error);
                
            }
        }
    };

    return (
      <View style={{ flex: 1, padding: 20, backgroundColor: "#ffffff" }}>
        <Text style={{ fontSize: 18, marginBottom: 10 }}>
          Choose Your Color:
        </Text>
        <ColorPicker
          style={{ width: "100%" }}
          value={color || "#ffffff"}
          onChange={handleColorChange}
        >
          <Panel1 style={{ marginBottom: 40 }} />
          <HueSlider style={{ marginBottom: 10 }}/>
        </ColorPicker>

        <TouchableOpacity
          onPress={handleSaveColor}
          style={{
            padding: 10,
            backgroundColor: "blue",
            borderRadius: 8,
            marginTop: 20,
          }}
        >
          <Text style={{ color: "white", fontSize: 16, textAlign: "center" }}>
            Save Color
          </Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 18, marginBottom: 10, marginTop: 30 }}>
          Preview of your tasks:
        </Text>

        <View
          style={{
            padding: 12,
            backgroundColor: color + "60",
            borderRadius: 8,
            marginVertical: 4,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
              hitSlop={{ top: 30, bottom: 30 }}
            >
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: color,
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 10,
                }}
              >
                <Icon name="check" size={16} color="black" />
              </View>
              <Text
                style={{
                  fontSize: 16,
                  color: "black",
                }}
              >
                Test Task
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={{ padding: 8 }}>
              <Icon name="trash" size={22} color="red" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
};

export default SettingsScreen;
