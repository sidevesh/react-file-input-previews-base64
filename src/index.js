import React, {Component} from 'react';
import PropTypes from 'prop-types';
import NonPreviewDefaultComponent from './nonPreviewDefaultComponent';

export default class FileInputBase64PreviewComponent extends Component {

  constructor(props) {
    super(props);
    this.canvas = null;
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
    let imgs = [];
    let checkImgsLoad = (img, i) => {
      imgs[i] = img;
      for (let cursor = 0; cursor < inp_files.length; ++ cursor) {
        if (!imgs[cursor]) {
          return ;
        }
      }
      if (!this.canvas) {
        return ;
      }
      let canvas_ctx = this.canvas.getContext("2d");
      let canvas_width = 0;
      let canvas_height = 0;
      if (this.props.fusion === "column") {
        let max_width = 0;
        imgs.forEach((img) => {
          max_width = img.width > max_width ? img.width : max_width;
          canvas_height += img.height;
        });
        canvas_width = max_width;
      } else { // row
        let max_height = 0;
        imgs.forEach((img) => {
          max_height = img.height > max_height ? img.height : max_height;
          canvas_width += img.width;
        });
        canvas_height = max_height;
      }
      this.canvas.width = canvas_width;
      this.canvas.height = canvas_height;
      canvas_ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      let dstX = 0;
      let dstY = 0;
      imgs.forEach((img) => {
        canvas_ctx.drawImage(img, dstX, dstY, img.width, img.height);
        if (this.props.fusion === "column") {
            dstY += img.height;
        } else { // row
            dstX += img.width;
        }
      });
      let compositionB64 = this.canvas.toDataURL("image/png");
      this.canvas.toBlob((blob) => {
        let file = new File([blob], op_all_files[0].name);
        let file_obj = {
          name: op_all_files[0].name,
          type: blob.type,
          size: Math.round(blob.size / 1000),
          base64: compositionB64,
          file: file,
        };
        this.setState({image_objs_array: [file_obj]});
        this.props.callbackFunction(file_obj);
      }, "image/png");
    };
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
        if (this.props.fusion === "column" || this.props.fusion === "row") {
            let img = new Image();
            img.onload = () => {
                checkImgsLoad(img, i);
            };
            img.src = to_file_obj.base64;
        }
        if(op_all_files.length === inp_files.length) {
          if(this.props.multiple) {
            if (this.props.fusion !== "column" && this.props.fusion === "row") {
              this.setState({image_objs_array: op_all_files});
              this.props.callbackFunction(op_all_files);
            }
          } else {
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
        <label htmlFor={this.props.inputId} style={this.props.labelStyle}>{this.props.labelText}</label>
        {this.props.imagePreview && ((this.state.image_objs_array.length!==0)||(this.props.defaultFiles.length!==0)) &&
          <div style={this.props.imageContainerStyle} >
            {this.state.image_objs_array.length!==0 && this.state.image_objs_array.map((img_obj) => {
              if(img_obj.type.split("/")[0] === "image") {
                return (
                  <img alt={img_obj.name} src={img_obj.base64} key={img_obj.name} style={this.props.imageStyle} />
                );
              }
              else {
                return React.cloneElement(this.props.nonPreviewComponent, {type: img_obj.type, size: img_obj.size, title: img_obj.name, key: img_obj.name});
              }
            })}
            {this.state.image_objs_array.length===0 && this.props.defaultFiles.map((img_url, index) => {
              return (
                <img alt={"Preview "+index} src={img_url} key={index} style={this.props.imageStyle} />
              );
            })}
          </div>
        }
        <input
          name={this.props.inputName}
          id={this.props.inputId}
          type="file"
          onChange={ this.handleFileChange.bind(this) }
          multiple={this.props.multiple}
          accept={this.props.accept}
          ref={(thisInput) => {this.fileInput = thisInput;}}
          style={{display:"none"}}
        />
        {this.props.textBoxVisible &&
          React.cloneElement(this.props.textFieldComponent,
            this.props.useTapEventPlugin ?
            {
              onTouchTap: () => {this.simulateClickOnInput();},
              value: this.state.image_objs_array.length === 1 ?
              this.state.image_objs_array[0].name
              :
              this.state.image_objs_array.length > 1 ?
              this.state.image_objs_array.length+" files selected"
              :
              this.props.defaultFiles.length === 0 ?
              "No files selected"
              :
              "Leave empty to keep previous selection"
            }
            :
            {
              onClick: () => {this.simulateClickOnInput();},
              value: this.state.image_objs_array.length === 1 ?
              this.state.image_objs_array[0].name
              :
              this.state.image_objs_array.length > 1 ?
              this.state.image_objs_array.length+" files selected"
              :
              this.props.defaultFiles.length === 0 ?
              "No files selected"
              :
              "Leave empty to keep previous selection"
            }
          )
        }
        {React.cloneElement(this.props.buttonComponent,
          this.props.useTapEventPlugin ? { onTouchTap: () => {this.simulateClickOnInput();} } : { onClick: () => {this.simulateClickOnInput();} }
        )}
        <canvas ref={(canvas) => {this.canvas=canvas;}} style={{"display": "none"}} />
      </div>
    );
  }

}

FileInputBase64PreviewComponent.defaultProps = {
  callbackFunction: ()=>{},
  labelText: "File Upload",
  useTapEventPlugin: false,
  multiple: true,
  fusion: "row",
  imagePreview: true,
  textBoxVisible: false,
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
  nonPreviewComponent: <NonPreviewDefaultComponent />,
  textFieldComponent: <input type="text" />,
  defaultFiles: []
}

FileInputBase64PreviewComponent.propTypes = {
  inputName: PropTypes.string,
  inputId: PropTypes.string,
  callbackFunction: PropTypes.func,
  labelText: PropTypes.string,
  useTapEventPlugin: PropTypes.bool,
  multiple: PropTypes.bool,
  fusion: PropTypes.string,
  imagePreview: PropTypes.bool,
  textBoxVisible: PropTypes.bool,
  accept: PropTypes.string,
  imageContainerStyle: PropTypes.object,
  imageStyle: PropTypes.object,
  labelStyle: PropTypes.object,
  parentStyle: PropTypes.object,
  buttonComponent: PropTypes.element,
  nonPreviewComponent: PropTypes.element,
  textFieldComponent: PropTypes.element,
  defaultFiles: PropTypes.array
}
