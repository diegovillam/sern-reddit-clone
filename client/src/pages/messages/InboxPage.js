import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Button from 'components/ui/Button';
import Loading from 'components/Loading';
import Auth from 'modules/Auth';
import axios from 'axios';
import MessageNavigation from 'components/MessageNavigation';
import { connect } from 'react-redux';
import { addUnreadMessage } from 'actions/userActions';

class InboxPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            selected: undefined,
            messages: [],
            sending: false,
            // For mobile designs, we keep track of which panel is open
            activePanel: 'left'
        }
        this.selectMessage = this.selectMessage.bind(this);
        this.togStatus = this.togStatus.bind(this);
        this.getInboxMessages  = this.getInboxMessages.bind(this);
    }

    togStatus(id) {
        this.setState({ sending: true });

        let messages = this.state.messages;
        messages[id].status = messages[id].status === 0 || !messages[id].status ? 1 : 0;

        axios.put('/api/message', {message: messages[id].id, status: messages[id].status}, {headers: Auth.getApiAuthHeader() }).then(() => {
            this.setState({
                messages,
                sending: false
            });
            // Adjust the unread messages count (+1 if it's unread, -1 if it's read)
            this.props.addUnreadMessage(messages[id].status === 1 ? -1 : 1);
        }).catch(error => {
            //Error
            this.setState({ sending: false });
        });
    }

    selectMessage(id) {
        this.setState({ selected: id, activePanel: 'right' });
    }

    componentDidMount() {
        this.getInboxMessages ();
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps !== undefined && nextProps.messages > this.props.messages) {
            // Get the last message
            this.getInboxMessages (true);
        }
    }

    // Invoke API call to get inbox messages. lastOnly flag determins whether it will return only 1 message
    // If it does, we append the message to the state, else we set the entire state as the collection of results
    getInboxMessages (lastOnly = false) {
        let url = '/api/messages/in/' + Auth.getToken();
        if(lastOnly === true) {
            url += '?limit=1';
        } else {
            // We set loading=true only when collecting all messages because last message is appended in real-time, smoothly
            this.setState({loading: true});
        }

        axios.get(url, { headers: Auth.getApiAuthHeader() }).then(results => {
            if(lastOnly !== true) {
                this.setState({ messages: results.data, loading: false });
            } else {
                this.setState({ 
                    messages: [
                        results.data[0],
                        ...this.state.messages
                    ], 
                    loading: false 
                });
            }
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
                            <div className={(msg.status === 0 || !msg.status ? "message-item " : "message-item-read ").concat('box is-marginless is-fullwidth')}>
                                <p><strong>{msg.subject}</strong></p>                            
                                <p><small>Sent by {msg.sender.username}</small></p>
                                <p><small>{msg.createdAtFormatted}</small></p>
                                <p><small>{msg.message.substr(0, 200).concat(msg.message.length >= 200 ? '... (view more)' : '')}</small></p>
                            </div>
                        </a>
                    )
                })
            ) : (
                <p>No messages in inbox.</p>
            )
        );

        // JSX for the selected message
        let _selected = (selected !== undefined) && (
            <div>
                <div className="is-hidden-tablet">
                    <p><a onClick={() => this.setState({ activePanel: 'left' })}>Return to inbox</a></p>
                    <hr/>
                </div>
                <p>Message sent by <span className="has-text-weight-semibold">{messages[selected].sender.username}</span> in <span className="has-text-weight-semibold">{messages[selected].createdAtFormatted}</span></p>
                <hr/>
                <p><strong>{messages[selected].subject}</strong></p>
                <div>
                    {messages[selected].message.split('\n').map((line,i) => {
                        return (
                            <p key={i}>{line}</p>
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
                    <div className="columns is-marginless">
                        {/*This is the inbox list view */}
                        <div className={"column is-3 is-inbox-left" + (this.state.activePanel === "left" ? " show" : " hide")} id="leftPanel">
                            <div className="inbox-message-box">
                                {_messages}
                            </div>
                        </div>
                        {/*This is the current message view */}
                        <div className={"column is-9 is-inbox-right" + (this.state.activePanel === "right" ? " show" : " hide")} id="rightPanel">
                            <div className="container" style={{height: '100%'}}>
                                {this.state.selected === undefined ? (
                                    <div>
                                        <p className="has-text-weight-semibold">You haven't selected a message yet.</p>
                                        <p className="has-text-weight-normal">Your inbox is in the left menu. Click on an item to view and reply to any message.</p>
                                    </div>
                                ) : (
                                    <div className="message-box" style={{marginBottom:'30px'}}>
                                        {_selected}
                                    </div>
                                )}
                                {this.state.selected !== undefined && (
                                    <div>
                                        <div className="field is-grouped">
                                            <Button
                                                classes={"is-link has-text-weight-semibold is-uppercase"}
                                                onClick={() => this.togStatus(this.state.selected)}
                                                label={messages[selected].status > 0 ? 'Mark as unread' : 'Mark as read'}
                                                sending={this.state.sending}
                                            />
                                            <Link to={"/dm/send/"+messages[selected].sender.username}>
                                                <Button
                                                    classes={"is-link has-text-weight-semibold is-uppercase"}
                                                    label={'Reply to ' + messages[selected].sender.username}
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

const mapStateToProps = state => ({
    messages: state.users.user.messages
});

export default connect(mapStateToProps, { addUnreadMessage })(InboxPage);
