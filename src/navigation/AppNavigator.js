import React, { useContext } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import AuthContext from "../context/AuthContext";
import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import TodoListScreen from "../screens/TodoListScreen";
import SettingsScreen from "../screens/SettingsScreen";

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user } = useContext(AuthContext);

  return (
    <NavigationContainer>
      <Stack.Navigator>
      {user ? (
        <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Lists" component={TodoListScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
        </>
        ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
        )}

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
