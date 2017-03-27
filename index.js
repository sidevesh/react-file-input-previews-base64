import React, {Component} from 'react';
import NonPreviewDefaultComponent from './nonPreviewDefaultComponent';

export default class FileInputBase64PreviewComponent extends Component {

  constructor(props) {
    super(props);
    this.state = {
      image_objs_array: []
    }
  }

  simulateClickOnInput() {
    let clickEvent = new MouseEvent("click", {
      "view": window,
      "bubbles": true,
      "cancelable": false
    });
    this.fileInput.dispatchEvent(clickEvent);
  }

  handleFileChange(e) {
    let inp_files = e.target.files;
    let op_all_files = [];
    for (let i = 0; i < inp_files.length; i++) {
      let to_file = inp_files[i];
      let reader_obj = new FileReader();
      reader_obj.readAsDataURL(to_file);
      reader_obj.onload = () => {
        let to_file_obj = {
          name: to_file.name,
          type: to_file.type,
          size: Math.round(to_file.size / 1000),
          base64: reader_obj.result,
          file: to_file
        };
        op_all_files.push(to_file_obj);
        if(op_all_files.length === inp_files.length) {
          if(this.props.multiple) {
            this.setState({ image_objs_array: op_all_files });
            this.props.callbackFunction(op_all_files);
          }
          else {
            this.setState({ image_objs_array: op_all_files });
            this.props.callbackFunction(op_all_files[0]);
          }
        }
      }
    }
  }

  render() {
    return (
      <div style={this.props.parentStyle}>
        <label htmlFor={this.props.formName} style={this.props.labelStyle}>{this.props.labelText}</label>
        {this.props.image_preview && this.state.image_objs_array.length!==0 &&
          <div style={this.props.imageContainerStyle} >
            {this.state.image_objs_array.map((img_obj) => {
              if(img_obj.type.split("/")[0] === "image") {
                return (
                  <img alt={img_obj.name} src={img_obj.base64} key={img_obj.name} style={this.props.imageStyle} />
                );
              }
              else {
                return React.cloneElement(this.props.nonPreviewComponent, {type: img_obj.type, size: img_obj.size, title: img_obj.name, key: img_obj.name});
              }
            })}
          </div>
        }
        <input
          name={this.props.formName}
          type="file"
          onChange={ this.handleFileChange.bind(this) }
          multiple={this.props.multiple}
          accept={this.props.accept}
          ref={(thisInput) => {this.fileInput = thisInput;}}
          style={{display:"none"}}
        />
        {React.cloneElement(this.props.buttonComponent,
          this.props.useTapEventPlugin ? { onTouchTap: () => {this.simulateClickOnInput();} } : { onClick: () => {this.simulateClickOnInput();} }
        )}
      </div>
    );
  }

}

FileInputBase64PreviewComponent.defaultProps = {
  callbackFunction: ()=>{},
  labelText: "File Upload",
  useTapEventPlugin: true,
  multiple: false,
  image_preview: false,
  accept: "*",
  imageContainerStyle: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    flexWrap: "wrap"
  },
  imageStyle: {
    marginTop: 5,
    marginBottom: 5,
    marginRight: 5,
    width: "auto",
    height: "30vmin",
    boxShadow: "rgba(0, 0, 0, 0.188235) 0px 10px 30px, rgba(0, 0, 0, 0.227451) 0px 6px 10px" //zDepth 3
  },
  labelStyle: {
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.298039)',
    display: 'block'
  },
  parentStyle: {
    marginTop: 14
  },
  buttonComponent: <button type="button">Attach</button>,
  nonPreviewComponent: <NonPreviewDefaultComponent />
}