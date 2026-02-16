import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet, Image, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import io from 'socket.io-client';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';

const SERVER = 'http://localhost:4000';

export default function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [users, setUsers] = useState([]);
  const [online, setOnline] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const socketRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    fetchUsers();
    fetchOnline();
    const t = setInterval(fetchOnline, 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (token && user) {
      socketRef.current = io(SERVER, { auth: { token } });
      socketRef.current.on('private_message', (msg) => {
        setMessages((m) => [...m, msg]);
        setTimeout(() => listRef.current && listRef.current.scrollToEnd({ animated: true }), 80);
      });
      socketRef.current.on('online_update', (list) => setOnline(list.map((i) => Number(i))));
    }
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [token, user]);

  async function fetchUsers() {
    try {
      const res = await fetch(`${SERVER}/users`);
      const data = await res.json();
      setUsers(data.filter((u) => !user || u.id !== user.id));
    } catch (e) {}
  }

  async function fetchOnline() {
    try {
      const res = await fetch(`${SERVER}/online`);
      const data = await res.json();
      setOnline(data.map((d) => d.id));
    } catch (e) {}
  }

  async function handleRegister() {
    const res = await fetch(`${SERVER}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, displayName }),
    });
    const j = await res.json();
    if (j.token) {
      setToken(j.token);
      setUser(j.user);
      fetchUsers();
    }
  }

  async function handleLogin() {
    const res = await fetch(`${SERVER}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const j = await res.json();
    if (j.token) {
      setToken(j.token);
      setUser(j.user);
      fetchUsers();
    }
  }

  async function selectUser(u) {
    setSelected(u);
    setMessages([]);
    if (!user) return;
    try {
      const res = await fetch(`${SERVER}/messages/history/${user.id}/${u.id}`);
      const data = await res.json();
      setMessages(data);
      setTimeout(() => listRef.current && listRef.current.scrollToEnd({ animated: false }), 40);
    } catch (e) {}
  }
  function getInitials(name) {
    if (!name) return '?';
    return name
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  function sendMessage() {
    if (!selected || !socketRef.current) return;
    const payload = { from: user.id, to: selected.id, content: text, type: 'text' };
    socketRef.current.emit('private_message', payload);
    setMessages((m) => [...m, { ...payload, timestamp: Date.now() }]);
    setText('');
  }

  async function uploadFileAsync(uri, filename, mimeType) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF6F0' }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={80}>
          <View style={styles.container}>
            <View style={styles.sidebar}>
      name: filename || 'file',
      type: mimeType || 'application/octet-stream',
    };
    form.append('file', file);
    const res = await fetch(`${SERVER}/upload`, {
      method: 'POST',
      body: form,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.json();
  }

  async function pickImageAndSend() {
    const p = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (p.cancelled) return;
            <View style={styles.chatArea}>
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <View style={styles.avatarSmall}><Text style={styles.avatarText}>{selected ? getInitials(selected.displayName || selected.username) : '群'}</Text></View>
                  <View>
                    <Text style={styles.headerTitle}>{selected ? selected.displayName : '选择联系人开始聊天'}</Text>
                    <Text style={styles.headerSub}>{selected ? (online.includes(selected.id) ? '在线' : '离线') : ''}</Text>
                  </View>
                </View>
              </View>
              <FlatList
                ref={listRef}
                data={messages}
                keyExtractor={(it, idx) => String(idx)}
                renderItem={({ item }) => {
                  const isOut = item.fromId === user.id || item.from === user.id;
                  const bubbleStyle = isOut ? styles.msgOut : styles.msgIn;
                  return (
                    <View style={bubbleStyle}>
                      {item.type && item.type.startsWith('image') && (
                        <Image source={{ uri: item.content }} style={{ width: 200, height: 140, borderRadius: 10 }} />
                      )}
                      {item.type === 'file' && <Text style={styles.fileText}>文件: {item.content}</Text>}
                      {item.type === 'audio' && <Button title="播放语音" onPress={() => playAudio(item.content)} />}
                      {!item.type && <Text style={styles.msgText}>{item.content}</Text>}
                      <Text style={styles.timeText}>{item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : ''}</Text>
                    </View>
                  );
                }}
              />
              <View style={styles.controls}>
                <TextInput style={styles.input} value={text} onChangeText={setText} placeholder="输入消息..." />
                <Button title="发送" onPress={sendMessage} />
              </View>
              <View style={styles.actionRow}>
                <Button title="图片" onPress={pickImageAndSend} />
                <Button title="文件" onPress={pickDocumentAndSend} />
                <Button title={isRecording ? '停止录音' : '语音'} onPress={() => (isRecording ? stopRecordingAndSend() : startRecording())} />
                {selected && <Button title="加为好友" onPress={() => addFriend(selected)} />}
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
      }
    } catch (e) {}
  }

  async function playAudio(uri) {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri });
      await sound.playAsync();
    } catch (e) {}
  }

  async function addFriend(u) {
    if (!user) return;
    await fetch(`${SERVER}/users/add-friend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user1: user.id, user2: u.id }),
    });
  }

  if (!token)
    return (
      <View style={styles.container}>
        <Text style={styles.title}>欢迎使用温馨聊天</Text>
        <TextInput placeholder="用户名" value={username} onChangeText={setUsername} style={styles.input} />
        <TextInput placeholder="密码" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
        {isRegister && (
          <TextInput placeholder="显示名称" value={displayName} onChangeText={setDisplayName} style={styles.input} />
        )}
        <Button title={isRegister ? '注册' : '登录'} onPress={isRegister ? handleRegister : handleLogin} />
        <Button title={isRegister ? '已有账号？去登录' : '没有账号？去注册'} onPress={() => setIsRegister(!isRegister)} />
      </View>
    );

  return (
    <View style={styles.container}>
      <View style={styles.sidebar}>
        <Text style={styles.subtitle}>联系人</Text>
        <FlatList
          data={users}
          keyExtractor={(i) => String(i.id)}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => selectUser(item)} style={styles.userItem}>
              <View style={styles.avatar}>{/* avatar initials */}
                <Text style={styles.avatarText}>{getInitials(item.displayName || item.username)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>{item.displayName || item.username}</Text>
              </View>
              <Text style={{ color: online.includes(item.id) ? '#26A65B' : '#AAA' }}>{online.includes(item.id) ? '在线' : '离线'}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
      <View style={styles.chatArea}>
        <Text style={styles.subtitle}>聊天窗口 {selected ? selected.displayName : ''}</Text>
        <FlatList
          data={messages}
          keyExtractor={(it, idx) => String(idx)}
          renderItem={({ item }) => {
            const isOut = item.fromId === user.id || item.from === user.id;
            if (item.type && item.type.startsWith('image')) {
              return (
                <View style={isOut ? styles.msgOut : styles.msgIn}>
                  <Image source={{ uri: item.content }} style={{ width: 160, height: 120, borderRadius: 8 }} />
                </View>
              );
            }
              if (item.type === 'file') {
                return (
                  <View style={isOut ? styles.msgOut : styles.msgIn}>
                    <Text>文件: {item.content}</Text>
                  </View>
                );
              }
            if (item.type === 'file') {
              return (
                <View style={isOut ? styles.msgOut : styles.msgIn}>
                  <Text>文件: {item.content}</Text>
                </View>
              );
            }
            if (item.type === 'audio') {
              return (
                <View style={isOut ? styles.msgOut : styles.msgIn}>
                  <Button title="播放语音" onPress={() => playAudio(item.content)} />
                </View>
              );
            }
              return (
                <View style={isOut ? styles.msgOut : styles.msgIn}>
                  <Text>{item.content}</Text>
                </View>
              );
            }}
          />
          <View style={styles.sendRow}>
            <TextInput style={styles.input} value={text} onChangeText={setText} placeholder="输入消息..." />
            <Button title="发送" onPress={sendMessage} />
          </View>
          <View style={{ flexDirection: 'row', marginTop: 8, gap: 8 }}>
            <Button title="图片" onPress={pickImageAndSend} />
            <Button title="文件" onPress={pickDocumentAndSend} />
            <Button title={isRecording ? '停止录音' : '语音'} onPress={() => (isRecording ? stopRecordingAndSend() : startRecording())} />
            {selected && <Button title="加为好友" onPress={() => addFriend(selected)} />}
          </View>
        </View>
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF6F0', flexDirection: 'row' },
    title: { fontSize: 22, marginBottom: 12, color: '#5C2E1F' },
    input: { borderWidth: 1, borderColor: '#F0C9B6', padding: 8, marginBottom: 8, backgroundColor: '#fff', flex: 1, borderRadius: 8 },
    sidebar: { width: 160, padding: 8, borderRightWidth: 1, borderColor: '#F0C9B6' },
    chatArea: { flex: 1, padding: 8 },
    userItem: { padding: 8, borderBottomWidth: 1, borderColor: '#FFE6D9', flexDirection: 'row', alignItems: 'center' },
    userName: { fontSize: 14, color: '#5C2E1F' },
    avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFDCC2', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
    avatarSmall: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFDCC2', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    avatarText: { color: '#7B3F2F', fontWeight: '700' },
    subtitle: { fontSize: 16, marginBottom: 8, color: '#7B3F2F' },
    msgIn: { alignSelf: 'flex-start', backgroundColor: '#FFFFFF', padding: 10, borderRadius: 12, marginBottom: 8, maxWidth: '75%', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4 },
    msgOut: { alignSelf: 'flex-end', backgroundColor: '#FFDCC2', padding: 10, borderRadius: 12, marginBottom: 8, maxWidth: '75%', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4 },
    msgText: { color: '#3b2b24' },
    timeText: { fontSize: 10, color: '#8b6b5e', marginTop: 6, textAlign: 'right' },
    fileText: { color: '#2b2b2b' },
    controls: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
    actionRow: { flexDirection: 'row', marginTop: 8, justifyContent: 'space-between' },
    header: { paddingVertical: 10, paddingHorizontal: 6, borderBottomWidth: 1, borderColor: '#FFE6D9', marginBottom: 8 },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    headerTitle: { fontSize: 16, color: '#4a2f23', fontWeight: '700' },
    headerSub: { fontSize: 12, color: '#9a7a6a' }
  });
            return (
              <View style={isOut ? styles.msgOut : styles.msgIn}>
                <Text>{item.content}</Text>
              </View>
            );
          }}
        />
        <View style={styles.sendRow}>
          <TextInput style={styles.input} value={text} onChangeText={setText} placeholder="输入消息..." />
          <Button title="发送" onPress={sendMessage} />
        </View>
        <View style={{ flexDirection: 'row', marginTop: 8, gap: 8 }}>
          <Button title="图片" onPress={pickImageAndSend} />
          <Button title="文件" onPress={pickDocumentAndSend} />
          <Button title={isRecording ? '停止录音' : '语音'} onPress={() => (isRecording ? stopRecordingAndSend() : startRecording())} />
          {selected && <Button title="加为好友" onPress={() => addFriend(selected)} />}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF6F0', paddingTop: 40, flexDirection: 'row' },
  title: { fontSize: 22, marginBottom: 12, color: '#5C2E1F' },
  input: { borderWidth: 1, borderColor: '#F0C9B6', padding: 8, marginBottom: 8, backgroundColor: '#fff', flex: 1 },
  sidebar: { width: 160, padding: 8, borderRightWidth: 1, borderColor: '#F0C9B6' },
  chatArea: { flex: 1, padding: 8 },
  userItem: { padding: 8, borderBottomWidth: 1, borderColor: '#FFE6D9', flexDirection: 'row', justifyContent: 'space-between' },
  subtitle: { fontSize: 16, marginBottom: 8, color: '#7B3F2F' },
  msgIn: { alignSelf: 'flex-start', backgroundColor: '#FFF', padding: 8, borderRadius: 8, marginBottom: 6 },
  msgOut: { alignSelf: 'flex-end', backgroundColor: '#FFDCC2', padding: 8, borderRadius: 8, marginBottom: 6 },
  sendRow: { flexDirection: 'row', alignItems: 'center' }
});
