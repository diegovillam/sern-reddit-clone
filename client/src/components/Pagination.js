import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Button from 'components/ui/Button';

export default class Pagination extends Component {
    render() {
        let textstyle = " has-text-weight-semibold is-uppercase";
        let btnstyle = "is-grey";
        let linkWrapperStyle = {marginRight:'10px'};


        return (
            (this.props.previous.available || this.props.next.available) ? (
                <div className="field is-grouped">
                    {this.props.previous.available ? (
                        <Link to={this.props.previous.url} className={btnstyle} style={linkWrapperStyle}>
                            <Button
                                classes={btnstyle.concat(textstyle)}
                                onClick={() => this.props.onChangePage(this.props.current - 1)}
                                label={"Previous"}
                            />
                        </Link>
                    ) : (
                        <Link to={''} className={btnstyle} disabled style={linkWrapperStyle}>
                            <Button
                                classes={btnstyle.concat(textstyle)}
                                label={"Previous"}
                                disabled
                            />
                        </Link>
                    )}

                    {this.props.next.available ? (
                        <Link to={this.props.next.url} className={btnstyle} style={linkWrapperStyle}>
                            <Button
                                classes={btnstyle.concat(textstyle)}
                                onClick={() => this.props.onChangePage(this.props.current + 1)}
                                label={"Next"}
                            />
                        </Link>
                    ) : (
                        <Link to={''} className={btnstyle} disabled style={linkWrapperStyle}>
                            <Button
                                classes={btnstyle.concat(textstyle)}
                                label={"Next"}
                                disabled
                            />
                        </Link>
                    )}
                </div>
            ) : <span></span>
        )
    }
}