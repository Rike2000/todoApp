import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  Button,
  RefreshControl,
  Platform
} from "react-native";
import { useRoute } from "@react-navigation/native";
import {
  getTasks,
  addTask,
  updateTaskStatus,
  deleteTask,
  inviteUserToList,
} from "../services/todoService";
import Icon from "react-native-vector-icons/FontAwesome6";

const TodoListScreen = () => {
  const route = useRoute();
  const { listId, listName } = route.params;
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [email, setEmail] = useState("");
  const inputRef = useRef(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      const fetchedTasks = await getTasks(listId);
      setTasks(fetchedTasks);
    };
    fetchTasks();
  }, [listId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await getTasks(listId);
    setRefreshing(false);
  };

  const handleAddTask = async () => {
    if (newTask.trim() === "") return;

    const task = await addTask(listId, newTask);
    if (task) {
      setTasks([...tasks, task]);
      setNewTask("");
      inputRef.current?.focus();
    }
  };

  const toggleTaskCompletion = async (taskId, currentStatus) => {
    const updatedStatus = !currentStatus;
    await updateTaskStatus(taskId, updatedStatus);
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, completed: updatedStatus } : task
      )
    );
  };

  const handleDeleteTask = async (taskId) => {
    await deleteTask(taskId);
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  const handleInvite = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter an email.");
      return;
    }

    try {
      const result = await inviteUserToList(listId, email);

      if (result === true) {
        if (Platform.OS === "web") {
          window.alert(`User ${email} invited!`)
        } else (
          Alert.alert("Success", `User ${email} invited!`)
        )
        setEmail("");
        setModalVisible(false);
      } else if (result === "User already in the list") {
        if (Platform.OS === "web") {
          window.alert("User is already in the list.")
        } else (
          Alert.alert("Error", "User is already in the list.")
        )
      } else {
        if (Platform.OS === "web") {
          window.alert("User not found.")
        } else (
          Alert.alert("Error", "User not found.")
        )
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const renderItem = ({ item }) => (
    <View
      style={{
        padding: 12,
        backgroundColor: item.userColor + "60",
        borderRadius: 8,
        marginVertical: 4,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity
          style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
          hitSlop={{ top: 30, bottom: 30 }}
          onPress={() => toggleTaskCompletion(item.id, item.completed)}
        >
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: item.userColor,
              justifyContent: "center",
              alignItems: "center",
              marginRight: 10,
            }}
          >
            {item.completed && (
              <Text>
                <Icon name="check" size={16} color="black" />
              </Text>
            )}
          </View>
          <Text
            style={{
              fontSize: 16,
              textDecorationLine: item.completed ? "line-through" : "none",
              color: item.completed ? "gray" : "black",
            }}
          >
            {item.text}
          </Text>
        </TouchableOpacity>

        {/* Trash Can Icon for Deletion */}
        <TouchableOpacity
          onPress={() => handleDeleteTask(item.id)}
          style={{ padding: 8 }}
        >
          <Icon name="trash" size={22} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "#ffffff" }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 40,
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: "bold" }}>{listName}</Text>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={{
            width: 150,
            padding: 10,
            backgroundColor: "green",
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "white", fontSize: 16, textAlign: "center" }}>
            Invite User
          </Text>
        </TouchableOpacity>
      </View>

      {/* Invite User Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              padding: 24,
              borderRadius: 16,
              width: "85%",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "600",
                marginBottom: 16,
                textAlign: "center",
              }}
            >
              Invite User to List
            </Text>

            <TextInput
              placeholder="Enter user email"
              value={email}
              onChangeText={setEmail}
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                marginBottom: 20,
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >

            <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={{
                  backgroundColor: "#dc3545",
                  padding: 12,
                  borderRadius: 8,
                  alignItems: "center",
                  flex: 1,
                  marginRight: 10,
                }}
              >
                <Text
                  style={{ color: "white", fontSize: 16, fontWeight: "500" }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleInvite}
                style={{
                  backgroundColor: "#007bff",
                  padding: 12,
                  borderRadius: 8,
                  alignItems: "center",
                  flex: 1,
                  marginLeft: 10,
                }}
              >
                <Text
                  style={{ color: "white", fontSize: 16, fontWeight: "500" }}
                >
                  Send Invite
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}
      >
        <TextInput
          ref={inputRef}
          style={{
            borderWidth: 1,
            padding: 10,
            flex: 1,
            borderRadius: 8,
            fontSize: 16,
          }}
          placeholder="Enter item"
          value={newTask}
          onChangeText={setNewTask}
          returnKeyType="done"
          onSubmitEditing={handleAddTask}
        />
        <TouchableOpacity
          onPress={handleAddTask}
          style={{
            padding: 10,
            backgroundColor: "blue",
            marginLeft: 10,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "white", fontSize: 16 }}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />
    </View>
  );
};

export default TodoListScreen;
