import { Component } from "react";
import { animateScroll as scroll } from "react-scroll";
import S3 from "react-aws-s3";
import Loader from "../Loader";
import Input from "../Input";
import axios from "axios";
import ImageContainer from "./ImageContainer";
import "./styles.css";

class ContentContainer extends Component {
  state = {
    isLoading: false,
    isCaptionInputVisible: false,
    captionValue: "",
    file: null,
    error: "",
    caption: "",
    searchResuls : null,
  };

  startLoadingHandler = () => {
    this.setState({
      isLoading: true,
    });
  };

  inputValueHandler = (e) => {
    if (e.target.type === "file") {
      this.setState({
        caption: "",
      });
      const file = e.target.files[0];
      this.setState({
        file,
      });
    } else if (e.target.type === "text") {
      this.setState({
        captionValue: e.target.value,
        file : ''
      });
    }
  };

  stopLoadingHandler = () => {
    this.setState({
      isLoading: false,
    });
  };

  showInputHandler = (e) => {
    e.preventDefault();
    this.setState((state) => ({
      ...state,
      isCaptionInputVisible: !state.isCaptionInputVisible,
    }));
  };

  submitHander = (e) => {
    this.setState({
      searchResuls : null,
    })
    e.preventDefault();
    const {captionValue,file} = this.state;
    if(file === ""){
      this.startLoadingHandler();
      axios.post("http://127.0.0.1:5000/v1/search", {
        caption: captionValue,
      }).then(res => {
        this.stopLoadingHandler()
        const data = res.data;
    
        this.setState({
          searchResuls : data,
          captionValue : "",
        })
        scroll.scrollTo(700);
        
      })
    }else{
     
      this.startLoadingHandler();
  
      scroll.scrollToBottom();
  
      let file = this.state.file;
      let newFileName = file.name.replace(/[^0-9a-zA-Z]+/, "");
  
      const config = {
        bucketName: process.env.REACT_APP_BUCKET_NAME,
        region: process.env.REACT_APP_REGION,
        accessKeyId: process.env.REACT_APP_ACCESS_ID,
        secretAccessKey: process.env.REACT_APP_ACCESS_KEY,
      };
  
      const ReactS3Client = new S3(config);
      ReactS3Client.uploadFile(file, newFileName)
        .then((data) => {
          if (data.status === 204) {
            this.setState({
              captionValue: "",
            });
            return data;
          } else {
            this.stopLoadingHandler();
  
            return null;
          }
        })
        .then((data) => {
          if (!data) {
            this.setState({
              error: "Some error occured, Please try after some time",
              isLoading: false,
            });
          }
  
          const { location: imageLocation } = data;
  
          return axios.post("http://127.0.0.1:5000/v1/predict", {
            imgURL: imageLocation,
          });
        })
        .then((res) => {
          console.log(res.data.caption);
  
          const { caption } = res.data;
          scroll.scrollToTop();
          this.stopLoadingHandler();
          this.setState({
            caption,
          });
        });
    }
    
  };

  render() {
    const {
      isCaptionInputVisible,
      isLoading,
      captionValue,
      file,
      error,
      caption,
      searchResuls,
    } = this.state;
    return (
      <div className="contentContainer">
        {error ? (
          <h2 className="error">
            Some Error occured, Kindly{" "}
            <span
              onClick={() => {
                window.location.reload();
              }}
            >
              reload
            </span>{" "}
            and try again
          </h2>
        ) : (
          <>
            {caption ? (
              <h2 className="result">
                Recommended Caption is <span>{caption}</span>
              </h2>
            ) : (
              ""
            )}
            <form onSubmit={this.submitHander} className="form">
              <div className="buttonGroup">
                <button onClick={this.showInputHandler} className="button">
                  Caption Search
                </button>
                <Input
                  onChangeHandler={this.inputValueHandler}
                  type="file"
                  value={file}
                  disabled={isCaptionInputVisible}
                  title="Upload Picture"
                />
              </div>

              {isCaptionInputVisible ? (
                <Input
                  value={captionValue}
                  onChangeHandler={this.inputValueHandler}
                  type="text"
                />
              ) : null}
              <button type="submit">Submit</button>
            </form>{" "}
          </>
        )}

        {isLoading ? <Loader className="scroll_loader" /> : ""}
        {searchResuls ? <ImageContainer data = {searchResuls}/> : ""} 
      </div>
    );
  }
}

export default ContentContainer;
