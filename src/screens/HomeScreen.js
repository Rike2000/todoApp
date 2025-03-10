import React, { useEffect, useState, useContext } from "react";
import { View, Text, FlatList, TouchableOpacity, TextInput, RefreshControl, Alert, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getTodoLists, createTodoList, deleteTodoList } from "../services/todoService";
import AuthContext from "../context/AuthContext"; 
import { Timestamp } from "firebase/firestore";
import { format } from "date-fns";
import Icon from "react-native-vector-icons/FontAwesome5";
import LogoutIcon from "react-native-vector-icons/Octicons";
import SettingsIcon from "react-native-vector-icons/Feather";

const HomeScreen = () => {
    const [lists, setLists] = useState([]);
    const [newListName, setNewListName] = useState("");
    const navigation = useNavigation();
    const { logout } = useContext(AuthContext);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        const fetchLists = async () => {
            const fetchedLists = await getTodoLists();
            setLists(fetchedLists);
        };
        fetchLists();
    }, []);

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity
                    onPress={() => navigation.navigate("Settings")}
                    style={{marginRight: 15}}
                >
                    <SettingsIcon name="settings" size={24} color={"black"}/>
                </TouchableOpacity>
            )
        })
    })

    const handleRefresh = async () => {
        setRefreshing(true);
        await getTodoLists(); 
        setRefreshing(false);
    };

    const handleCreateList = async () => {
        if (newListName.trim() === "") return;

        const newList = await createTodoList(newListName);
        if (newList) {
            setLists((prevLists) => [...prevLists, newList]);
            setNewListName(""); 
        }
    };

    const handleDeleteList = async (listId) => {

        if (Platform.OS === "web") {
            if (window.confirm("Are you sure you want to delete this list?")) {
                await deleteTodoList(listId);
                setLists(prevLists => prevLists.filter(list => list.id !== listId));
            }
            
        } else (
            Alert.alert(
                "Delete List",
                "Are you sure you want to delete this list?",
                [
                    { text: "Cancel", style: "cancel" },
                    { 
                        text: "Yes", 
                        onPress: async () => {
                            await deleteTodoList(listId);
                            setLists(prevLists => prevLists.filter(list => list.id !== listId));
                        }
                    }
                ]
            )
        )
    };

    const handleLogout = () => {

        if (Platform.OS === "web") {
            if (window.confirm("Do you want to logout?")) {
                logout()
            }
        }else (
            Alert.alert("Logout?", "Do you want to logout?", [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {text: "Logout", onPress: () => logout()}
            ])
        )
    }

    const formatDate = (createdAt) => {
        if (!createdAt) return "No Date"; 
    
        let date;
        if (createdAt instanceof Timestamp) {
            date = createdAt.toDate(); 
        } else {
            date = new Date(createdAt); 
        }
    
        return isNaN(date) ? "Invalid Date" : format(date, "dd-MM-yyyy");
    };

    return (
        <View style={{ flex: 1, padding: 20, backgroundColor: "#ffffff" }}>
            {/* Header Section */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <Text style={{ fontSize: 22, fontWeight: "bold" }}>Your Lists</Text>

                {/* Logout Button */}
                <TouchableOpacity onPress={handleLogout} style={{ padding: 10 }}>
                    <LogoutIcon name="sign-out" size={24} color="red" />
                </TouchableOpacity>
            </View>

            {/* New List Input */}
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
                <TextInput
                    style={{ borderWidth: 1, padding: 10, flex: 1, borderRadius: 8, fontSize: 16 }}
                    placeholder="List Name"
                    value={newListName}
                    onChangeText={setNewListName}
                    returnKeyType="done"
                    onSubmitEditing={handleCreateList}
                />
                <TouchableOpacity onPress={handleCreateList} style={{ padding: 10, backgroundColor: "green", marginLeft: 10, borderRadius: 8 }}>
                    <Text style={{ color: "white", fontSize: 16 }}>Create</Text>
                </TouchableOpacity>
            </View>

            {/* List Display */}
            <FlatList
                data={lists}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={{ flexDirection: "row", alignItems: "center", padding: 15, backgroundColor: "#f8f9fa", marginVertical: 5, borderRadius: 8 }}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate("Lists", { listId: item.id, listName: item.name })}
                            style={{ flex: 1 }}
                            hitSlop={{ top: 30, bottom: 30 }}
                        >
                            <Text style={{ fontSize: 18 }}>{item.name}</Text>
                            <Text style={{ fontSize: 14, color: "gray", opacity: 0.6  }}>{formatDate(item.createdAt)}</Text>
                        </TouchableOpacity>

                        {/* Trash Can Icon */}
                        <TouchableOpacity onPress={() => handleDeleteList(item.id)} style={{ padding: 8 }}>
                            <Icon name="trash" size={22} color="red" />
                        </TouchableOpacity>
                    </View>
                )}
                refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
    }
            />
        </View>
    );
};

export default HomeScreen;
