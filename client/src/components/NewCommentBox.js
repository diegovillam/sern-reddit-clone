import React, { Component } from 'react';
import TextArea from 'components/ui/TextArea';
import Button from 'components/ui/Button';
import { connect } from 'react-redux';
import { createComment } from 'actions/commentActions';

class NewCommentBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            reply: 0,
            comment: '',
            errors: {}
        }
        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    componentDidMount() {
        if(this.props.reply) {
            this.setState({ reply: this.props.reply });
        }
    }
    onChange(e) {
        // Reset errors as well
        this.setState({ comment: e.target.value, errors: {} });
    }

    onSubmit(e) {
        e.preventDefault();
        // Do some client side validation so we don't have to get the error back to this component from the server response
        if(!this.state.comment || this.state.comment.length === 0) {
            return this.setState({ errors: {comment: 'The comment is required.'}});
        } else if(this.state.comment.length > 30000) {
            return this.setState({ errors: {comment: 'The comment must not be over 30000 characters long.'}});            
        }
        // Dispatch store method with parent comment, current post, and text. The API will return HTTP 400 (error) on form validation if there are errors
        // But we will not check them because the comment won't be added anyway and there are already client-sided validations
        this.props.createComment(this.state.reply, this.props.post.id, this.state.comment);
    }

    render() {
        return (
            <form method="POST" action="" onSubmit={this.onSubmit}>
                <div className="field" style={{margin:'8px'}}>
                    <TextArea 
                        onChange={this.onChange}
                        name={"comment"}
                        type={"text"}
                        error={this.state.errors && this.state.errors.comment}
                        value={this.state.comment}
                    />
                    <div className="field is-grouped">
                        <Button
                            classes={"is-link"}
                            onClick={this.onSubmit}
                            label={"Submit"}
                            type={"submit"}
                            sending={this.props.creatingNewComment === this.state.reply}
                        />
                        <Button
                            classes={"is-link"}
                            onClick={() => { this.setState({ comment: '', reply: 0 }); this.props.onCancel() }}
                            label={"Cancel"}
                            type={"button"}
                        />
                    </div>
                </div>
            </form>            
        )
    }
}

const mapStateToProps = state => ({
    creatingNewComment: state.comments.creatingNewComment,
    post: state.posts.post
});

export default connect(mapStateToProps, { createComment })(NewCommentBox);