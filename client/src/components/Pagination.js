import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Button from 'components/ui/Button';

export default class Pagination extends Component {
    render() {
        let textstyle = "has-text-weight-semibold is-uppercase";
        let btnstyle = "is-grey";
        return (
            (this.props.previous.available || this.props.next.available) && (
                <div>
                    {this.props.previous.available ? (
                        <Link to={this.props.previous.url} className={btnstyle}>
                            <Button
                                classes={btnstyle.concat(textstyle)}
                                onClick={() => this.props.onChangePage(this.props.current - 1)}
                                label={"Previous"}
                            />
                        </Link>
                    ) : (
                        <Button
                            classes={btnstyle.concat(textstyle)}
                            label={"Previous"}
                            disabled
                        />
                    )}

                    {this.props.next.available ? (
                        <Link to={this.props.next.url} className={btnstyle}>
                            <Button
                                classes={btnstyle.concat(textstyle)}
                                onClick={() => this.props.onChangePage(this.props.current + 1)}
                                label={"Next"}
                            />
                        </Link>
                    ) : (
                        <Button
                            classes={btnstyle.concat(textstyle)}
                            label={"Next"}
                            disabled
                        />
                    )}
                </div>
            )
        )
    }
}