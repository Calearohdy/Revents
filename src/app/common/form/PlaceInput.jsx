import React, { Component } from 'react'
import { Form, Label } from 'semantic-ui-react';
import Script from 'react-load-script';
import PlacesAutocomplete from 'react-places-autocomplete';

const styles = {
    autocompleteContainer: {
        zIndex: 1000
    }
}

class PlaceInput extends Component {

    state = {
        scriptLoaded: false
    }

    handScriptLoaded = () => this.setState({scriptLoaded: true})

  render() {
      const {input, width, onSelect, placeholder, options, meta: {touched, error}} = this.props;
      const key = 'AIzaSyBqdEbDIxbDCP8Sy4oR1QVHZdc1Sz5FHu8';
    return (
        <Form.Field error={touched && !!error} width={width}>
        <Script 
            url={`https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`}
            onLoad={this.handScriptLoaded}
        />
        {this.state.scriptLoaded &&
        <PlacesAutocomplete
            inputProps={{...input, placeholder}}
            options={options}
            onSelect={onSelect}
            styles={styles}
        />}
        {touched && error && <Label basic color='red'>{error}</Label>}
        </Form.Field>
    )
  }
}

export default PlaceInput;