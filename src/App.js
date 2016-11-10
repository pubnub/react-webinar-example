import React, { Component } from 'react';
import PubNub from "pubnub";
import './App.css';
import ChatHistory from './ChatHistory';
import PubNubService from "./PubNubService";

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            messages: [
                {
                    text:"foo1",
                }
            ],
            currentMessage: "This is my message to you.",
            username:"no-name",
            users:[]
        };


        //init PubNub
        this.pubnub = new PubNub({
            publishKey: "pub-c-f48cd925-db85-4ba9-a8a8-aeed6033746a",
            subscribeKey: "sub-c-f7f82a0e-a779-11e6-85a3-02ee2ddab7fe",
            presenceTimeout: 30
        });

        //init presence service
        this.service = new PubNubService({
            pubnub:this.pubnub,
            channel:'simple-chat'
        });

        //on users update, trigger screen refresh
        this.service.onUserChange((users) => this.setState({ users:users }));
        this.service.onMessage((evt) => {
            this.state.messages.push({
                text:evt.message.text,
                sender:evt.publisher
            });
            this.setState({
                messages: this.state.messages
            })
        });
        this.service.fetchHistory(10,(messages)=>{ this.setState({messages:messages}); });

        this.service.getSelfInfo((info)=>{
            if(info.username) this.setState({username: info.username})
        });
    }


    changedMessage() {
        this.setState({ currentMessage:this.refs.input.value });
    }
    sendMessage() {
        this.pubnub.publish({
            channel:"simple-chat",
            message: {
                text:this.refs.input.value,
                sender: this.pubnub.getUUID()

            }
        });
        this.setState({ currentMessage:"" })
    }


    changedUsername() {
        this.setState({ username:this.refs.username.value });
    }
    setUsername() {
        this.service.setUserState({username:this.state.username})
    }


    renderUsers() {
        var users = this.state.users.map((user,i)=> {
            return <span key={i}>{user.username}</span>
        });
        return <div className="userlist">{users}</div>
    }

    render() {
        return (
            <div className="vbox fill">
                <h1>My Simple Chat</h1>
                <div className="scroll grow">
                    <ChatHistory messages={this.state.messages} service={this.service}/>
                </div>
                <div className="hbox">
                    <label>username</label>
                    <input type="text" ref="username" value={this.state.username}
                           onChange={this.changedUsername.bind(this)}
                    />
                    <button onClick={this.setUsername.bind(this)}>set</button>
                </div>
                <div className="hbox">
                    <input className="grow"
                           ref="input"
                           type="text"
                           value={this.state.currentMessage}
                           onChange={this.changedMessage.bind(this)}
                    />
                    <button
                        onClick={this.sendMessage.bind(this)}
                    >send</button>
                </div>
                <div className="hbox">
                    {this.renderUsers()}
                </div>
            </div>
        );
    }
}

export default App;
