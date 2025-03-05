import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getUserColor, updateUserColor } from '../services/todoService';
import ColorPicker, { Panel1, Swatches, Preview, OpacitySlider, HueSlider } from 'reanimated-color-picker';

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
                Alert.alert('Success', 'Color updated successfully!');
            } catch (error) {
                Alert.alert('Error', 'Failed to update color. Please try again.');
                console.log(error);
                
            }
        }
    };

    return (
        <View style={{ flex: 1, padding: 20, backgroundColor: '#ffffff' }}>
            <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 20 }}>Settings</Text>

            <Text style={{ fontSize: 18, marginBottom: 10 }}>Choose Your Color:</Text>
            <ColorPicker style={{width: "100%"}} value={color || "#ffffff"} onChange={handleColorChange}>
            <Panel1 style={{marginBottom: 20}} />
            <HueSlider/>

            </ColorPicker>
            
            

            <TouchableOpacity 
                onPress={handleSaveColor} 
                style={{ padding: 10, backgroundColor: color, borderRadius: 8, marginTop: 20 }}
            >
                <Text style={{ color: 'white', fontSize: 16, textAlign: 'center' }}>Save Color</Text>
            </TouchableOpacity>
        </View>
    );
};

export default SettingsScreen;
