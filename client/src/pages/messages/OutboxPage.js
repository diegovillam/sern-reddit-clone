import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Button from 'components/ui/Button';
import Loading from 'components/Loading';
import Auth from 'modules/Auth';
import axios from 'axios';
import MessageNavigation from 'components/MessageNavigation';

export default class InboxPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            selected: undefined,
            messages: [],
            sending: false
        }
        this.selectMessage = this.selectMessage.bind(this);
    }

    selectMessage(id) {
        this.setState({ selected: id });
    }

    componentDidMount() {
        axios.get('/api/messages/out/' + Auth.getToken(), { headers: Auth.getApiAuthHeader() }).then(results => {
            this.setState({ messages: results.data, loading: false });
        }).catch(error => {
            console.log(error.response);
        });
    }

    render() {
        // Extract variables for convention
        let { messages, selected, loading } = this.state;

        // JSX for the list of messages
        let _messages = (loading === false) && (
            messages.length > 0 ? (
                messages.map((msg,i) => {
                    return (
                        <a onClick={() => this.selectMessage(i)} key={msg.id}>
                            <div className={"message-item-read box is-marginless is-fullwidth"}>
                                <p><strong>{msg.subject}</strong></p>                            
                                <p><small>Sent to {msg.receiver.username}</small></p>
                                <p><small>{msg.createdAtFormatted}</small></p>
                                <p><small>{msg.message.substr(0, 200).concat(msg.message.length >= 200 ? '... (view more)' : '')}</small></p>
                            </div>
                        </a>
                    )
                })
            ) : (
                <p>No messages in outbox.</p>
            )
        );

        // JSX for the selected message
        let _selected = (selected !== undefined) && (
            <div>
                <p>Message sent to <span className="has-text-weight-semibold">{messages[selected].receiver.username}</span> in <span className="has-text-weight-semibold">{messages[selected].createdAtFormatted}</span></p>
                <hr/>
                <p><strong>{messages[selected].subject}</strong></p>
                <div>
                    {messages[selected].message.split('\n').map((line,i) => {
                        return (
                            <span key={i}>{line}</span>
                        )
                    })}
                </div>
            </div>
        );

        return (
            <div className="container">
                <MessageNavigation/>
                <hr/>
                
                {this.state.loading === true ? (
                    <Loading/>
                ) : (
                    <div className="columns is-mobile">
                        {/*This is the inbox list view */}
                        <div className="column is-3">
                            <div className="message-box">
                                <div className="message-box-side">
                                    {_messages}
                                </div>
                            </div>
                        </div>
                        {/*This is the current message view */}
                        <div className="column is-9">
                            <div className="container" style={{height: '100%', width:'100%'}}>
                                {this.state.selected === undefined ? (
                                    <div>
                                        <p className="has-text-weight-semibold">You haven't selected a message yet.</p>
                                        <p className="has-text-weight-normal">Your outbox is in the left menu. Click on an item to view messages you've sent.</p>
                                    </div>
                                ) : (
                                    <div className="message-box" style={{marginBottom:'30px'}}>
                                        {_selected}
                                    </div>
                                )}
                                {this.state.selected !== undefined && (
                                    <div className="is-down-right">
                                        <div className="field is-grouped">
                                            <Link to={"/dm/send/"+messages[selected].receiver.username}>
                                                <Button
                                                    classes={"is-link has-text-weight-semibold is-uppercase"}
                                                    label={'Send message to ' + messages[selected].receiver.username}
                                                />
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>                        
                )}
            </div>
        )
    }
}